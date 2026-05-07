const { body } = require('express-validator');
const { query } = require('../config/db');
const validate = require('../middleware/validation');

const projectValidators = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 1000 }),
  validate,
];

const getAllProjects = async (req, res, next) => {
  try {
    const { search } = req.query;
    if (search && search.length > 100) {
      return res.status(400).json({ error: 'Search query too long (max 100 chars)' });
    }

    const limit  = Math.min(parseInt(req.query.limit)  || 20, 50);
    const offset = Math.max(parseInt(req.query.offset) || 0,  0);

    const baseParams = [req.user.id];
    let whereClause  = 'WHERE p.user_id = $1';

    if (search && search.trim()) {
      baseParams.push(`%${search.trim().toLowerCase()}%`);
      whereClause += ` AND (LOWER(p.name) LIKE $2 OR LOWER(COALESCE(p.description, '')) LIKE $2)`;
    }

    // Count total matching rows (without LIMIT)
    const countResult = await query(
      `SELECT COUNT(*) FROM projects p ${whereClause}`,
      baseParams
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Paginated data fetch
    const pageParams = [...baseParams, limit, offset];
    const limitIdx   = pageParams.length - 1; // 1-based $N for limit
    const offsetIdx  = pageParams.length;     // 1-based $N for offset

    const result = await query(
      `SELECT
        p.*,
        COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'todo')::int,        0) AS todo_count,
        COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'in_progress')::int,  0) AS in_progress_count,
        COALESCE(COUNT(t.id) FILTER (WHERE t.status = 'done')::int,         0) AS done_count,
        COALESCE(COUNT(t.id)::int,                                           0) AS total_tasks
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       ${whereClause}
       GROUP BY p.id
       ORDER BY p.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      pageParams
    );

    res.json({ projects: result.rows, total, limit, offset });
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const result = await query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, name.trim(), description?.trim() || null]
    );
    res.status(201).json({ project: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.*,
        COUNT(t.id) FILTER (WHERE t.status = 'todo')        AS todo_count,
        COUNT(t.id) FILTER (WHERE t.status = 'in_progress') AS in_progress_count,
        COUNT(t.id) FILTER (WHERE t.status = 'done')        AS done_count,
        COUNT(t.id)                                          AS total_tasks
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.id = $1 AND p.user_id = $2
       GROUP BY p.id`,
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ project: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const existing = await query('SELECT id, user_id FROM projects WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const { name, description } = req.body;
    const result = await query(
      `UPDATE projects
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at  = NOW()
       WHERE id = $3
       RETURNING *`,
      [name?.trim() || null, description?.trim() ?? null, req.params.id]
    );
    res.json({ project: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const existing = await query('SELECT id, user_id FROM projects WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  projectValidators,
};
