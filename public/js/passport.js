/* eslint-disable no-unused-vars */
var passport = require("passport"),
  GitHubStrategy = require("passport-github2").Strategy;
var db = require("../../models");
var keys = require("../../keys");
var uid = "";

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  db.User.findOne({
    where: {
      uid: id
    }
  })
    .then(user => {
      // console.log(user);
      done(null, user);
    })
    .catch(err => {
      console.error(err);
      done(err);
    });
  // done(null, obj);
});

passport.use(
  new GitHubStrategy(
    {
      clientID: keys.gitClientID,
      clientSecret: keys.gitClientSecret,
      callbackURL: "https://purlwise.herokuapp.com/auth/github/callback"
    },
    function(accessToken, refreshToken, profile, done) {
      var gitUserName = profile.username;
      var gitProPic = profile.photos[0].value;
      db.User.findOrCreate({
        where: { username: gitUserName },
        defaults: { uid: profile.id, profilePicUrl: gitProPic }
      })
        .then(([user, created]) => {
          uid = user.uid;
          return done(null, profile);
        })
        .error(function(err) {
          console.log("Error occured" + err);
        });
    }
  )
);

module.exports = {
  passport: passport,
  uid: uid
};
