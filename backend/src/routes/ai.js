const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { summarizeProject } = require('../controllers/aiController');

router.post('/summarize/:projectId', verifyToken, summarizeProject);

module.exports = router;
