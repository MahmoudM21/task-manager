const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const {
  getAllProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  projectValidators,
} = require('../controllers/projectsController');

router.use(verifyToken);

router.get('/', getAllProjects);
router.post('/', projectValidators, createProject);
router.get('/:id', getProject);
router.put('/:id', projectValidators, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
