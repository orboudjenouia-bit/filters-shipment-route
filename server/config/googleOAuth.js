const cleanEnv = (value = '') => value.replace(/^"|"$/g, '').trim();

module.exports = {
    clientId: cleanEnv(process.env.GOOGLE_CLIENT_ID),
    clientSecret: cleanEnv(process.env.GOOGLE_CLIENT_SECRET),
    redirectUri: cleanEnv(
        process.env.GOOGLE_REDIRECT_URI ||
            'http://localhost:5000/api/auth/google/callback'
    ),
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    userInfoEndpoint: 'https://www.googleapis.com/oauth2/v3/userinfo',
    scopes: ['openid', 'email', 'profile'],
};