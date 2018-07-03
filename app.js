const config = require('./config/config');
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');
const routes = require("./routes");
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

//connect to Database
mongoose.connect(config.mongoURI); 

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//PASSPORT
app.use(passport.initialize());
app.use(passport.session());

//EXPRESS VALIDATOR
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


//Routes
app.use('/', routes);

io.sockets.on('connection', (client) => {
    console.log('client connected');

    //Client connecting to room
    client.on('join', (data) => {
        io.sockets.emit('user joined', {message: "user joined channel"});
        console.log(console.log(data))
    });
});



server.listen(5000, () => {
    console.log('server running on 5000');
});

