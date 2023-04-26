const GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");
const { User } = require("../../models");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Google Sign-In API verification middleware


// Define Routes
// Two routes are needed in order to allow users to log in with their Google account. The first route redirects the user to the Google, where they will authenticate:

app.get('/login/google', passport.authenticate('google'));
// The second route processes the authentication response and logs the user in, after Google redirects the user back to the app:

app.get('/oauth2/redirect/google',
  passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/');
  });