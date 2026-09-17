const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, toggleFollow, getSuggestions } = require('../controllers/userController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

router.get('/suggestions', optionalToken, getSuggestions);
router.get('/profile/:username', optionalToken, getUserProfile);
router.put('/profile', verifyToken, updateProfile);
router.post('/:userId/follow', verifyToken, toggleFollow);

module.exports = router;
