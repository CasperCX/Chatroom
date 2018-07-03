const router = require("express").Router();
const User = require('./models/User');



router.get('/', (req, res) => {
    res.render('chatroom.ejs');
});

router.get('/login', (req, res) => {
    res.render('login.ejs');
});

router.post('/login', (req, res) => {
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
            password: password
        });

        User.createUser(newUser, (err, user) => {
            if(err)  {
                res.redirect('/login', {errors: err})
            }
        });

        res.redirect('/');
    }
});

router.get('/register', (req, res) => {
    res.status(200).send("hello from express router");
});


// Check if user is logged in
// function ensureAuthenticated(req, res, next) {
//     if (res.isAuthenticated()) {
//         return next();
//     }
//     res.redirect('/login');
// }

module.exports = router;


