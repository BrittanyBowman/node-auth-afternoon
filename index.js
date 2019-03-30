require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const students = require('./students.json');

const app = express();

//We need to configure our app to use sessions. Invoke the use method off of the app object. Pass in as an argument the invocation of session. The session invocation should take an object as an arugment with 3 key value pairs, secret with the value of any string you'd like, resave with the value of false, and saveUninitialized with the value of false.
app.use( session({
  secret: '@nyth!ng y0u w@nT',
  resave: false,
  saveUninitialized: false
}));
//We now need to initialize passport and configure it to use sessions. Invoke the use method off of the app object. Pass in as an argument the passport variable from the top of the index.js file. passport is an object with methods that we'll use. Invoke the initialize method off of the passport object. On the next line, invoke the use method off of the app object again. Pass in as an argument the passport and invoke the session method.
app.use( passport.initialize() );
app.use( passport.session() );
passport.use( new Auth0Strategy({
  domain:       process.env.DOMAIN,
  clientID:     process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL:  '/login',
  scope: "openid email profile"
 },
 function(accessToken, refreshToken, extraParams, profile, done) {
   // accessToken is the token to call Auth0 API (not needed in the most cases)
   // extraParams.id_token has the JSON Web Token
   // profile has all the information from the user
   return done(null, profile);
 }
) );

passport.serializeUser( (user, done) => {
  done(null, { clientID: user.id, email: user._json.email, name: user._json.name });
});
//This new object will then be passed on to deserializeUser when done is invoked. Since we don't have any additional logic to execute, simply call done with null and obj.
passport.deserializeUser( (obj, done) => {
  done(null, obj);
});

app.get( '/login',
  passport.authenticate('auth0',
    { successRedirect: '/students', failureRedirect: '/login', connection: 'github' }
  )
);

function authenticated(req, res, next) {
  if( req.user ) {
    next()
  } else {
    res.sendStatus(401);
  }
})

app.get('/students', authenticated, ( req, res, next ) => {
  res.status(200).send(students)
});

const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}`); } );