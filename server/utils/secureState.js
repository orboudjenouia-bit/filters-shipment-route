const crypto = require('crypto');

function generateOAuthState() {
  return crypto.randomBytes(32).toString('hex');
}

function generatePKCE() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');

  return { codeVerifier, codeChallenge };
}

function validateState(state, stateStore) {
  const stored = stateStore.get(state);

  if (!stored) {
    return null;
  }

  if (Date.now() > stored.expiresAt) {
    stateStore.delete(state);
    return null;
  }

  stateStore.delete(state);
  return stored;
}

module.exports = {
  generateOAuthState,
  generatePKCE,
  validateState,
};