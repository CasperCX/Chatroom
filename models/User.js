const mongoose = require('mongoose');
const config = require('../config/config');
mongoose.connect(config.mongoURI);


const UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUser = function(id, cb) {
    User.findById(id, cb);
};

module.exports.createUser = function(newUser, cb) {
    console.log("new user created: ", newUser);
    newUser.save(cb);
};

