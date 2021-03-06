const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const LocalStrategy = require('passport-local').Strategy;
const keys = require('./config');
const User = require('../models/User');

//To be passed into a cookie
passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
        User.getUserById(id, (err, user) => {
            if (err) throw err;
            if(!user) {
                return done(null, false, {message: 'unknown user'});
            }
            return done(null, user);
        })
});

passport.use(
    new LocalStrategy(function(username, password, done){
        User.findUserByUsername(username, (err, user) => {
            if(err) throw err;
            if (!user){
                return done(null, false, {message: "no user found"})
            }

            User.comparePassword(password, user.password, (err, isMatch) => {
                console.log(isMatch);
                if (err) { return done(err) }
                if (isMatch) {
                    return done(null, user)
                } else {
                    return done(null, false, {message: "wrong password"})
                }
            })
        })
    }));

passport.use(
    new GoogleStrategy({
        callbackURL: 'auth/google/redirect',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done) => {
        User.findByGoogleId(profile.id, (err, currentUser) => {
            if (err) throw err;
            if(!user) {
                return done(null, false, {message: 'unknown user'});
            }
            return done(null, currentUser);
        })

        //Create new local record in db if user does not exist yet
        new User({
            username: profile.displayName,
            googleid: profile.id
            }).save().then((newUser) => {
                console.log("created new user:", newUser);
                return done(null, newUser);
            })
        })
    );
        // User.findOne({googleId: profile.id}).then((currentUser) => {
        //     if (currentUser) {
        //         done(null, currentUser)
        //     } else {
        //         new User({
        //             username: profile.displayName,
        //             googleId: profile.id
        //         }).save().then((newUser) => {
        //             console.log("created new user:", newUser);
        //             done(null, newUser);
        //         })
        //     }
        // })
//     })
// );

