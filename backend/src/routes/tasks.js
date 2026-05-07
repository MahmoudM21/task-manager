const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getProjectTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask,
  taskCreateValidators,
  taskStatusValidators,
} = require('../controllers/tasksController');

router.use(verifyToken);

// Project-scoped task routes
router.get('/projects/:projectId/tasks', getProjectTasks);
router.post('/projects/:projectId/tasks', taskCreateValidators, createTask);

// Task-level routes
router.patch('/tasks/:id', taskStatusValidators, updateTaskStatus);
router.put('/tasks/:id', taskCreateValidators, updateTask);
router.delete('/tasks/:id', deleteTask);

module.exports = router;
