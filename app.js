const config = require('./config/config');
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');
const passportSetup = require('./config/passport-config');
const path = require('path');
const mongoose = require('mongoose');
const routes = require("./routes");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//Connect to Database
mongoose.connect(config.mongoURI); 

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(express.session({ secret: 'your secret key' }));
//Create cookies
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [config.session.cookieKey] 
}));

//Init passport with cookies
app.use(passport.initialize());
app.use(passport.session());

//Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//Express validator setup
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

//Set locals
// app.use((req, res, next) => {
//   res.locals.user = req.user || null
//   next();
// });

//Route handling
app.use('/', routes);


//Socket.io setup
var users = [];
io.sockets.on('connect', (client) => {
    console.log('client connected');

    //Client connecting to room
    client.on('join', (user) => {
        io.sockets.emit('user joined', {message: `<b>${user}</b> joined channel`});
        if(users.indexOf(user) != -1) {
          updateUsers();
        } else {
          client.username = user;
          users.push(user);
          console.log("current users:", users);
          updateUsers();
        }
    });

    function updateUsers() {
      io.sockets.emit('users', users);
    };

    client.on('message', (data) => {
      io.sockets.emit('message', {message: data.message, user: data.user})
    });

    client.on('disconnect', (data) => {
      users.splice(users.indexOf(client.username), 1);
      io.sockets.emit('disconnect', {user: client.username})
      updateUsers();
    });
});



server.listen(5000, () => {
    console.log('server running on 5000');
});

