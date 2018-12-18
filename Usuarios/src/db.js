const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const Joi =  require('joi');
//SCHEMAS
const UserSchema = new Schema({
    _id: Number,
    rut: String,
    names: String,
    family_name: String,
    email: String,
    password: String,
    rol: {
      type: String,
      default: 'cliente'
    }
});
module.exports.joiSchema = {
    post: {
        rut: Joi.string().min(8).required(),
        names: Joi.string().min(2).required(),
        family_name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
        confirmPassword: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }),
        rol: Joi.string()
    },
    put: {
        rut: Joi.string().min(8),
        names: Joi.string().min(2),
        family_name: Joi.string().min(2),
        email: Joi.string().email(),
        password: Joi.string().min(4),
        rol: Joi.string()
    }
};
const Counterschema = new Schema({
  _id: String,
  sequence_value: Number
});
//CADENA DE CONEXIÓN
const db_url_users = 'mongodb://localhost/users-service-db';
//
const User = module.exports.modelUser = mongoose.model('user', UserSchema);
const Counters = module.exports.modelCounter = mongoose.model('counters', Counterschema);

module.exports.connectToUsersDatabase = function () {
    mongoose.connect(db_url_users, { useNewUrlParser: true })
    .then(db => {
        console.log('Db connected')
    })
    .catch(err => console.log(err));
};
//CREATE USER
module.exports.createUser = function (userData, callback) {
    console.log('createUser');
    let newUser = new User();
    let newuserId;
    cid = "usersid";
    counterUpdate = {$inc:{sequence_value:1}};
    Counters.findByIdAndUpdate(cid, counterUpdate, {new:true}, (err, counter) => {
      console.log("counter:", counter);
      if(err) {
        console.log('error:', err);
        return null;
      }
      console.log("counter.sequence_value:", counter.sequence_value);
      newuserId = counter.sequence_value;

        console.log("newUserId: ", newuserId);
        newUser._id = newuserId;
        newUser.rut = userData.rut;
        newUser.names = userData.names;
        newUser.family_name = userData.family_name;
        newUser.email = userData.email;
        if(userData.rol) {
            newUser.rol = userData.rol;
        }
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;
            bcrypt.hash(userData.password, salt, (err, hash) => {
                console.log('hash:', hash);
                if (err) throw err;

                newUser.password = hash;
                newUser.save(callback);
            });
        });
    });
};
//FIND ALL USERS
module.exports.findAllUsers = function (callback) {
    User.find(callback);
 };
//FIND USER BY ID
 module.exports.findUserById = function (id, callback) {
    User.findById(id, callback);
 };
//FIND USER BY EMAIL
 module.exports.findUserByEmail = function (email, callback) {
    query = {email: email};
    User.findOne(query, callback);
 };

 module.exports.findUserByProfileName = function (profile_name, callback) {
    query = {profile_name: profile_name};
    User.findOne(query, callback);
 };

 module.exports.updateUserById = function(id, changeQuery, callback) {
    query = {_id: id};

    if(changeQuery.password) {
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;

            bcrypt.hash(changeQuery.password, salt, (err, hash) => {
                console.log('hash:', hash);
                if (err) throw err;

                changeQuery.password = hash;
                User.updateOne(query, changeQuery, callback);
            });
        });
    }
    else {
        User.updateOne(query, changeQuery, callback);
    }
 }

 module.exports.updateUserByProfileName = function (profile_name, changeQuery, emailChanged, callback) {
    query = {profile_name: profile_name};

    if(emailChanged) {
       changeQuery.profile_name = this.makeProfileName(changeQuery.email);
       console.log('profile name changed:', changeQuery.profile_name);
    }

    console.log('changeQuery', changeQuery);
    if(changeQuery.password) {
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;

            bcrypt.hash(changeQuery.password, salt, (err, hash) => {
                console.log('hash:', hash);
                if (err) throw err;

                changeQuery.password = hash;
                User.updateOne(query, changeQuery, callback);
            });
        });
    }
    else {
        User.updateOne(query, changeQuery, callback);
    }
 };

 module.exports.updateUserByEmail = async function (email, changeQuery, callback) {
    query = {email: email};
    console.log('query', query);
    console.log('change query', changeQuery);

    if(changeQuery.password) {
        bcrypt.genSalt(10, (err, salt) => {
            if(err) throw err;

            bcrypt.hash(changeQuery.password, salt, (err, hash) => {
                console.log('hash:', hash);
                if (err) throw err;

                changeQuery.password = hash;
                User.updateOne(query, changeQuery, callback);
            });
        });
    }
    else {
        User.updateOne(query, changeQuery, callback);
    }
};

module.exports.deleteUserById = function (id, callback) {
    query = {_id: id};
    User.findOneAndDelete(query, callback);
 }

 module.exports.deleteUserByEmail = function (email, callback) {
    query = {email: email};
    User.findOneAndDelete(query, callback);
 };

 module.exports.comparePassword = function (candidatePassword, hash, callback) {
     console.log('comparando');
     bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
         if (err) throw err;
         callback(null, isMatch);
     });
 };
