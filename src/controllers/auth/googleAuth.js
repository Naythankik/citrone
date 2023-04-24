const GoogleStrategy = require("passport-google-oauth2").Strategy;
const { User } = require("../../models");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


module.exports = (passport) => {
        passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
            passReqToCallback : true
          },
          async (request, accessToken, refreshToken, profile, done) => {
            try {
                let existingUser = await User.findOne({ 'google.id': profile.id });
                <em>// if user exists return the user</em> 
                if (existingUser) {
                  return done(null, existingUser);
                }
                <em>// if user does not exist create a new user</em> 
                console.log('Creating new user...');
                const newUser = new User({
                  method: 'google',
                  google: {
                    id: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value
                  }
                });
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, false)
            }
          }
        ));
    }
// Define Routes
// Two routes are needed in order to allow users to log in with their Google account. The first route redirects the user to the Google, where they will authenticate:

app.get('/login/google', passport.authenticate('google'));
// The second route processes the authentication response and logs the user in, after Google redirects the user back to the app:

app.get('/oauth2/redirect/google',
  passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    res.redirect('/');
  });