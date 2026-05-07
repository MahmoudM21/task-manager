const { body } = require('express-validator');
const { query } = require('../config/db');
const validate = require('../middleware/validation');

const VALID_STATUSES = ['todo', 'in_progress', 'done'];

const taskCreateValidators = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 300 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(VALID_STATUSES).withMessage('Invalid status'),
  body('due_date')
    .optional({ nullable: true, checkFalsy: true })
    .isDate().withMessage('Due date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (!value) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(value);
      if (due < today) throw new Error('Due date must be today or in the future');
      return true;
    }),
  validate,
];

const taskStatusValidators = [
  body('status').isIn(VALID_STATUSES).withMessage('Invalid status value'),
  validate,
];

const verifyProjectOwnership = async (projectId, userId) => {
  const result = await query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  return result.rows.length > 0;
};

const IS_OVERDUE_EXPR = `
  CASE WHEN due_date < CURRENT_DATE AND status != 'done'
       THEN true ELSE false END AS is_overdue`;

const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const owned = await verifyProjectOwnership(projectId, req.user.id);
    if (!owned) return res.status(404).json({ error: 'Project not found' });

    const { status, filter } = req.query;

    let queryText = `SELECT *, ${IS_OVERDUE_EXPR} FROM tasks WHERE project_id = $1`;
    const params = [projectId];

    if (filter === 'overdue') {
      queryText += ` AND due_date < CURRENT_DATE AND status != 'done'`;
    } else if (status && VALID_STATUSES.includes(status)) {
      queryText += ` AND status = $2`;
      params.push(status);
    }

    queryText += ' ORDER BY created_at ASC';

    const result = await query(queryText, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const owned = await verifyProjectOwnership(projectId, req.user.id);
    if (!owned) return res.status(404).json({ error: 'Project not found' });

    const { title, description, status = 'todo', due_date } = req.body;

    const result = await query(
      `INSERT INTO tasks (project_id, title, description, status, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *, ${IS_OVERDUE_EXPR}`,
      [projectId, title.trim(), description?.trim() || null, status, due_date || null]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await query(
      `UPDATE tasks
       SET status     = $1,
           updated_at = NOW()
       WHERE id = $2
         AND project_id IN (SELECT id FROM projects WHERE user_id = $3)
       RETURNING *, ${IS_OVERDUE_EXPR}`,
      [status, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, due_date } = req.body;

    const result = await query(
      `UPDATE tasks
       SET title       = COALESCE($1, title),
           description = COALESCE($2, description),
           status      = COALESCE($3, status),
           due_date    = CASE WHEN $4::boolean THEN $5::date ELSE due_date END,
           updated_at  = NOW()
       WHERE id = $6
         AND project_id IN (SELECT id FROM projects WHERE user_id = $7)
       RETURNING *, ${IS_OVERDUE_EXPR}`,
      [
        title?.trim() || null,
        description?.trim() ?? null,
        status || null,
        'due_date' in req.body,   // explicit flag: was due_date sent?
        due_date || null,
        id,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ task: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `DELETE FROM tasks
       WHERE id = $1
         AND project_id IN (SELECT id FROM projects WHERE user_id = $2)
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  taskCreateValidators,
  taskStatusValidators,
};
