const router = require('express').Router();
const passport = require('passport');
const User = require('./models/User');

const ensureAuthenticated = (req, res, next) => {
    if(!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
};


router.get('/', ensureAuthenticated, (req, res) => {
    res.render('chatroom.ejs', {user: req.user});
});

router.get('/login', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login.ejs', {user: req.user});
});

router.post('/login', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

router.get('/register', (req, res) => {
    res.render('register.ejs', {user: req.user});
});

router.post('/register', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    const errors = req.validationErrors();

    if(errors) {
        res.redirect('/login', { errors: errors});
    } else {
        const newUser = new User({
            username: username,
            password: User.hashPassword(password)
        });

        User.createUser(newUser, (err, user) => {
            if(err)  {
                res.redirect('/login', {errors: err})
            }
        });

        res.redirect('/');
    }
});

router.get('/api/user', (req, res) => {
    res.json(req.user);
});

router.get('auth/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('auth/google/redirect', passport.authenticate('google',  (req, res) => {
    res.send("signed in");
}));


// Check if user is logged in
// function ensureAuthenticated(req, res, next) {
//     if (res.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login');
// }

// passport.use(new LocalStrategy(function(username, password, done){
//     User.getUserByUsername(username, function(err, user){
//       if(err) throw err;
//       if(!user){
//         return done(null, false, {message: 'Unknown User'});
//       }
  
//       User.comparePassword(password, user.password, function(err, isMatch){
//         if(err) return done(err);
//         if(isMatch){
//           return done(null, user);
//         } else {
//           return done(null, false, {message:'Invalid Password'});
//         }
//       });
//     });
//   }));


module.exports = router;


