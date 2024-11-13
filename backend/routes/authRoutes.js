const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Debug log for route registration
console.log('Registering auth routes...');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgot-username', authController.forgotUsername);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', verifyToken, authController.getMe);

// Token management routes
router.route('/tokens')
  .get(verifyToken, authController.getTokens)
  .post(verifyToken, authController.createToken);

router.delete('/tokens/:tokenId', verifyToken, authController.deleteToken);

// Transaction history routes
router.get('/transactions', verifyToken, authController.getTransactions);

// Debug log registered routes
console.log('Routes registered:');
router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`${r.route.stack[0].method.toUpperCase()} /api/auth${r.route.path}`);
  }
});

module.exports = router;





