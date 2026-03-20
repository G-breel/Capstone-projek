const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate, authValidations } = require('../middleware/validationMiddleware');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount
} = require('../controllers/authController');

// Public routes
router.post('/register', validate(authValidations.register), register);
router.post('/login', validate(authValidations.login), login);

// Protected routes
router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.delete('/account', deleteAccount);

module.exports = router;