const express = require('express');
const router = express.Router();
const { register, login, me, registerValidators, loginValidators } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);
router.get('/me', verifyToken, me);

module.exports = router;
