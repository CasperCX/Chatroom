const router = require('express').Router();
const passport = require('passport');
const nodemailer = require('nodemailer');
//const nodemailerConfig = require('./config/nodemailer-config');
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
        res.redirect('/register');
    } else {
        const newUser = new User({
            username: username,
            password: User.hashPassword(password),
            email: email
        });

        User.createUser(newUser, (err, user) => {
            if(err)  {
                res.redirect('/register')
            }
        });

        res.redirect('/');
    }
});


router.get('/api/user', (req, res) => {
    res.json(req.user);
});

//Send email to user with forgotten password
router.post('/forgotpassword', (req, res) => {
    if (!req.body.username) {
        res.redirect('/login');
    }
    User.findUserByUsername(req.body.username, (err, user) => {
        if (err) {
            res.redirect('/login');
        }

        nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
            }
        });

        console.log(account.user)
        console.log(account.pass)
        // setup email data with unicode symbols
        let mailOptions = {
            from: '"Admin" <foo@example.com>', // sender address
            to: user.email, // list of receivers
            subject: 'Forgotten password ✔', // Subject line
            text: `Your forgotten password: ${user.password}`,
            html: '<b>Hello world?</b>' // html body
        };
    
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log(`Message sent: ${info.messageId} to: ${user.email}`);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
            });
        })
    });
    res.redirect('/login');
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


