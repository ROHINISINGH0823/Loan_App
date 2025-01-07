const express = require('express');
const { getUserProfile, updateUserProfile, generateOtpForEmailChange } = require('../controllers/UserController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();


router.get('/profile', verifyToken, getUserProfile);


router.patch('/user/update-profile', verifyToken, updateUserProfile);


router.post('/user/send-otp', verifyToken, generateOtpForEmailChange);

module.exports = router;
