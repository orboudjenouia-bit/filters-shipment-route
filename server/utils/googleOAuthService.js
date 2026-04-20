const axios = require('axios');
const jwt = require('jsonwebtoken');
const googleOAuthConfig = require('../config/googleOAuth');
const { StatusCodes } = require('http-status-codes');
const AppError = require('./AppError');

async function exchangeCodeForTokens(code, codeVerifier) {
  try {
    const params = new URLSearchParams({
      client_id: googleOAuthConfig.clientId,
      client_secret: googleOAuthConfig.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: googleOAuthConfig.redirectUri,
    });

    if (codeVerifier) {
      params.append('code_verifier', codeVerifier);
    }

    const response = await axios.post(
      googleOAuthConfig.tokenEndpoint,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    throw new AppError(
      'Failed to exchange authorization code for tokens',
      StatusCodes.INTERNAL_SERVER_ERROR,
      'TOKEN_EXCHANGE_FAILED'
    );
  }
}

async function verifyAndDecodeIdToken(idToken) {
  try {
    const decoded = jwt.decode(idToken, { complete: false });

    if (!decoded) {
      throw new AppError(
        'Invalid ID token',
        StatusCodes.BAD_REQUEST,
        'INVALID_ID_TOKEN'
      );
    }

    if (decoded.aud !== googleOAuthConfig.clientId) {
      throw new AppError(
        'Invalid audience in ID token',
        StatusCodes.BAD_REQUEST,
        'INVALID_AUDIENCE'
      );
    }

    const validIssuers = [
      'https://accounts.google.com',
      'accounts.google.com',
    ];
    if (!validIssuers.includes(decoded.iss)) {
      throw new AppError(
        'Invalid issuer in ID token',
        StatusCodes.BAD_REQUEST,
        'INVALID_ISSUER'
      );
    }

    return decoded;
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('ID token verification error:', error.message);
    throw new AppError(
      'Failed to verify Google ID token',
      StatusCodes.BAD_REQUEST,
      'ID_TOKEN_VERIFICATION_FAILED'
    );
  }
}

async function getUserInfo(accessToken) {
  try {
    const response = await axios.get(
      googleOAuthConfig.userInfoEndpoint,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user info:', error.message);
    throw new AppError(
      'Failed to fetch user info from Google',
      StatusCodes.INTERNAL_SERVER_ERROR,
      'USER_INFO_FAILED'
    );
  }
}

module.exports = {
  exchangeCodeForTokens,
  verifyAndDecodeIdToken,
  getUserInfo,
};