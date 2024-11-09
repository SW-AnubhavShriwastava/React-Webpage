const express = require('express');
const {
  signup,
  login,
  forgotUsername,
  forgotPassword,
} = require('../controllers/authController');

const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
// const { dashboardController } = require('../controllers/dashboardController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-username', forgotUsername); // Add forgot-username route
router.post('/forgot-password', forgotPassword); // Add forgot-password route
// router.get('/dashboard', verifyToken, dashboardController);

module.exports = router;





