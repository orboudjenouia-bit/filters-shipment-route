const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const {
    initiateGoogleOAuth,
    handleGoogleCallback,
    googleLogout,
} = require('../Controllers/googleAuthController');

router.get('/', asyncHandler(initiateGoogleOAuth));
router.get('/callback', asyncHandler(handleGoogleCallback));
router.post('/logout', asyncHandler(googleLogout));

module.exports = router;