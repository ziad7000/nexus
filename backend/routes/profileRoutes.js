const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  extractSkills
} = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes below this line require the user to be logged in
router.use(protect);

// Existing Profile Routes
router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/change-password', changePassword);

// Skill Extraction Route (available for authenticated users)
router.post('/extract-skills', extractSkills);

module.exports = router;