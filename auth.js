// routes/auth.js
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/auth.controller');

// sanity checks (will print once at startup)
console.log('routes/auth loaded — authMiddleware:', typeof authMiddleware, 'authController.updateUser:', typeof (authController && authController.updateUser));

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/users', authMiddleware, authController.getUsers);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

router.put('/users/:id', authMiddleware, (req, res, next) => {
  if (!authController || typeof authController.updateUser !== 'function') {
    // Defensive response if controller isn't wired up correctly
    console.error('ERROR: authController.updateUser is not a function');
    return res.status(500).json({ message: 'Server misconfiguration: update handler missing' });
  }
  return authController.updateUser(req, res, next);
});

module.exports = router;
