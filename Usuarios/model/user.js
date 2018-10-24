const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');


const UserSchema = new Schema({
    rut: String,
    name: String,
    last_name: String,
    email: String,
    password: String,
    creation_date: {
        type: Date,
        default: Date.now()
    },
    last_login: {
        type: Date,
        default: Date.now()
    }
});

//MÉTODOS
var User = module.exports = mongoose.model('users', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });

};

module.exports.getUserByEmail = function (email, callback) {
    var query = { email: email };
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    console.log('comparando');
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};

module.exports.updateUser = function(id, changes, callback)
{
    console.log('modificando');
    console.log('id');
    console.log(changes);
    var query = {_id: id}
    User.updateOne(query, changes, callback);
};



module.exports.deleteById = function(id, callback)
{
    console.log('Eliminando por id');
    console.log('id');
    console.log(id);
    var query = {_id: id};
    User.findOneAndRemove(query, callback);    
}

module.exports.deleteByEmail = function(email, callback)
{
    console.log('Eliminando por email');
    console.log('email');
    console.log(email);
    var query = {email: email};
    User.findOneAndRemove(query, callback);    
}




/*
module.exports.updatePass = function (user_id, newPassword, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newPassword, salt, function (err, hash) {
            finalPassword = hash;
            query = {_id: user_id}
            changes = {$set: {password: finalPassword}};
            console.log('CAMBIANDO LA PASS');
            console.log(user_id);            
            console.log(finalPassword);
            User.updateOne(query, changes, callback);
        });
    });
};

*/


