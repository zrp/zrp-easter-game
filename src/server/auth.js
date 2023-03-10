const { Router, static } = require("express");
const passport = require("passport");
const OIDC = require('passport-openidconnect');
const GoogleStrategy = require('passport-google-oidc');
const expressSession = require('express-session');
const { default: RedisStore } = require('connect-redis');

const redisClient = require('./database');

// initialize passport
passport.use(new OIDC(
  {
    issuer: process.env.KC_ISSUER,
    authorizationURL: process.env.KC_AUTHORIZATION_URL,
    tokenURL: process.env.KC_TOKEN_URL,
    userInfoURL: process.env.KC_USERINFO_URL,
    clientID: process.env.KC_CLIENT_ID,
    clientSecret: process.env.KC_CLIENT_SECRET,
    callbackURL: '/auth/keycloak/callback',
    scope: "profile email"
  },
  function verify(_issuer, profile, done) {
    done(null, profile);
  }
))

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
  scope: ['profile', 'email']
}, function verify(_issuer, profile, done) {
  console.log(profile)
  done(null, profile);
}));

passport.serializeUser(function (user, cb) {
  cb(null, { ...user });
});

passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

const session = expressSession({
  store: new RedisStore({ client: redisClient, prefix: "session:", ttl: 86400 }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: "zes",
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: false,
    maxAge: 600 * 1000 // 600s = 10min,
  }
});

const addAuth = (app) => {
  const router = Router();

  app.use(session);
  app.use(passport.authenticate('session'));

  app.get('/', passport.authenticate('session'), (req, res, next) => {
    if (!req.user) {
      res.redirect('/auth/keycloak/login');

      return;
    }

    next()
  });

  router.get('/keycloak/login', passport.authenticate('openidconnect'), () => { });
  router.get('/google/login', passport.authenticate('google'), () => { });

  // Callbacks
  router.get('/keycloak/callback', passport.authenticate('openidconnect', {
    scope: ['profile', 'openid', 'email'],
    successReturnToOrRedirect: '/',
    failureRedirect: '/',
  }), () => {
    res.redirect('/');
  });

  router.get('/google/callback', passport.authenticate('google', {
    scope: ['profile', 'openid', 'email'],
    successReturnToOrRedirect: '/',
    failureRedirect: '/',
  }), () => { });

  app.use('/auth', router);

  if (process.env.NODE_ENV === 'production') {
    app.use('/', passport.authenticate('session'), static('dist'), static('public'));
    app.use('/assets', passport.authenticate('session'), static('dist/assets'));
  }
}


module.exports = {
  addAuth,
  session,
};
