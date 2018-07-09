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
    const email = req.body.email;
    
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    const errors = req.validationErrors();

    if(errors) {
        res.redirect('/login', { errors: errors});
    } else {
        const newUser = new User({
            username: username,
            password: User.hashPassword(password),
            email: email
        });

        User.createUser(newUser, (err, user) => {
            if(err)  {
                res.redirect('/login', {errors: err})
            }
        });

        res.redirect('/');
    }
});

// router.get('/register/redirect', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }));

router.get('/api/user', (req, res) => {
    res.json(req.user);
});

//Send email to user with forgotten password
router.post('/forgotpassword', (req, res) => {
    if (!req.body.username) {
        res.redirect('/login', {error: "No username provided"});
    }
    User.findUserByUsername(req.body.username, (err, user) => {
        if (err) {
            res.redirect('/login', {error: "Username not found"});
        }

        const apiKey = 'key-429d28225ef737032e7aaab8a371fc90-8b7bf2f1-58893a51';
        const domain = 'sandbox4cb80f3ac23845af880da930732308fe.mailgun.org';
        const mailgun = require('mailgun-js')({apiKey: apiKey, domain: domain});
        
        const data = {
        from: 'Admin <postmaster@sandbox4cb80f3ac23845af880da930732308fe.mailgun.org>',
        to: user.email,
        subject: 'Forgotten password',
        text: `Your requested password: ${user.password}` //Unhash password
        };
        console.log("trying to send email to:", user.email);
        mailgun.messages().send(data, function (error, body) {
            if (!error) {
                console.log("sent email:", body);
            } else {
                console.log("mail not sent", error)
            }
        });

        res.redirect('/login');
    });
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


