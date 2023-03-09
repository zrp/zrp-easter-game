const { Router } = require("express");
const passport = require("passport");
const OIDC = require('passport-openidconnect');
const GoogleStrategy = require('passport-google-oidc');
const session = require('express-session');
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
  process.nextTick(function () {
    cb(null, { ...user });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient, prefix: "session:", ttl: 86400 }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "zes",
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: false,
    maxAge: 600 * 1000 // 600s = 10min,
  }
});

const addAuth = (app) => {
  const router = Router();

  app.set('trust proxy', 1);

  app.use(sessionMiddleware);
  app.use(passport.authenticate('session'));

  // Logins
  router.get('/keycloak/login', passport.authenticate('openidconnect'), () => { });
  router.get('/google/login', passport.authenticate('google'), () => { });

  // Callbacks
  router.get('/keycloak/callback', passport.authenticate('openidconnect', {
    scope: ['profile', 'openid', 'email'],
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/keycloak/login',
  }), () => { });

  router.get('/google/callback', passport.authenticate('google', {
    scope: ['profile', 'openid', 'email'],
    successReturnToOrRedirect: '/',
    failureRedirect: '/auth/google/login',
  }), () => { });

  app.use('/auth', router);

  app.get('/', (req, res, next) => {
    if (!req.user) {
      res.redirect('/auth/keycloak/login');
    } else {
      next();
    }
  })

  app.post('/logout', (req, res, next) => {
    req.logout(err => {
      if (err) return next(err);

      res.redirect('/');
    });
  })
}


module.exports = {
  addAuth,
  sessionMiddleware,
};
