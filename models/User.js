const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/config');
mongoose.connect(config.mongoURI);


const UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    googleid: {
        type: String,
        default: null
    }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};


module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getUserById = function(id, cb) {
    User.findById(id, cb);
};

module.exports.findByGoogleId = function(profileid, cb) {
    User.findOne({googleid: prodileid}, cb);
};

module.exports.findUserByUsername = function(username, cb) {
    User.findOne({username: username}, cb);
};

module.exports.createUser = function(newUser, cb) {
    console.log("new user created: ", newUser);
    newUser.save(cb);
};


