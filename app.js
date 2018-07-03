const config = require('./config/config');
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const mongoose = require('mongoose');

//connect to Database
mongoose.connect(config.mongoURI); 

const routes = require("./routes");
const app = express();

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


app.use('/', routes);


app.listen(config.port, () => {
    console.log(`app running on port ${config.port}`);
});
