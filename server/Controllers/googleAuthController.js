const { StatusCodes } = require('http-status-codes');
const jwt = require('jsonwebtoken');
const googleOAuthConfig = require('../config/googleOAuth');
const { generateOAuthState, generatePKCE } = require('../utils/secureState');
const { exchangeCodeForTokens, verifyAndDecodeIdToken } = require('../utils/googleOAuthService');
const { findOrCreateUser } = require('../utils/googleUserService');
const AppError = require('../utils/AppError');
const createNotifs = require('../utils/createNotifs');

const stateStore = new Map();
const STATE_EXPIRY_MS = 10 * 60 * 1000;

const initiateGoogleOAuth = (req, res, next) => {
  try {
    const state = generateOAuthState();
    const { codeVerifier, codeChallenge } = generatePKCE();

    stateStore.set(state, {
      codeVerifier,
      expiresAt: Date.now() + STATE_EXPIRY_MS,
    });

    const params = new URLSearchParams({
      client_id: googleOAuthConfig.clientId,
      redirect_uri: googleOAuthConfig.redirectUri,
      response_type: 'code',
      scope: googleOAuthConfig.scopes.join(' '),
      state,
      access_type: 'offline',
      prompt: 'consent',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${googleOAuthConfig.authorizationEndpoint}?${params.toString()}`;

    res.status(StatusCodes.OK).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    next(error);
  }
};

const handleGoogleCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const redirectUrl = new URL('/login', clientUrl);
      redirectUrl.searchParams.set('googleError', error);
      return res.redirect(redirectUrl.toString());
    }

    if (!code || !state) {
      throw new AppError(
        'Missing authorization code or state',
        StatusCodes.BAD_REQUEST,
        'MISSING_PARAMS'
      );
    }

    const storedData = stateStore.get(state);
    if (!storedData) {
      throw new AppError(
        'Invalid or expired state parameter',
        StatusCodes.BAD_REQUEST,
        'INVALID_STATE'
      );
    }

    if (Date.now() > storedData.expiresAt) {
      stateStore.delete(state);
      throw new AppError(
        'State parameter has expired',
        StatusCodes.BAD_REQUEST,
        'STATE_EXPIRED'
      );
    }

    const tokens = await exchangeCodeForTokens(code, storedData.codeVerifier);
    const idTokenPayload = await verifyAndDecodeIdToken(tokens.id_token);

    const user = await findOrCreateUser({
      googleId: idTokenPayload.sub,
      email: idTokenPayload.email,
      name: idTokenPayload.name,
      picture: idTokenPayload.picture,
    });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    await createNotifs(
      user.id,
      'Google Login Successful',
      'You have successfully logged in via Google',
      'account',
      undefined,
      undefined
    ).catch((err) => console.log('Notification error:', err));

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const userPayload = {
      id: user.id,
      email: user.email,
      type: user.type,
      role: user.role,
      isVerified: user.isVerified,
    };

    const redirectUrl = new URL('/dashboard', clientUrl);
    redirectUrl.searchParams.set('token', jwtToken);
    redirectUrl.searchParams.set(
      'user',
      encodeURIComponent(JSON.stringify(userPayload))
    );

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
};

const googleLogout = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json({
      success: true,
      msg: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateGoogleOAuth,
  handleGoogleCallback,
  googleLogout,
};