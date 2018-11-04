const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const Joi =  require('joi');

const UserSchema = new Schema({
    profile_name: String,
    rut: String,
    names: String,
    family_name: String,
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

const UserJoiSchema = module.exports.joiSchema = {
    post: {
        rut: Joi.string().min(8).required(),
        names: Joi.string().min(2).required(),
        family_name: Joi.string().min(2).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(4).required(),
    },
    put: {
        rut: Joi.string().min(8),
        names: Joi.string().min(2),
        family_name: Joi.string().min(2),
        email: Joi.string().email(),
        password: Joi.string().min(4)
    }
};

const db_url = 'mongodb://localhost/users-service-db';

const User = module.exports.modelUser = mongoose.model('user', UserSchema);

module.exports.connectToUsersDatabase = function () { 
    mongoose.connect(db_url, { useNewUrlParser: true })
    .then(db => console.log('Db connected'))
    .catch(err => console.log(err));
};

module.exports.createUser = function (userData, callback) {
    let newUser = new User();

    newUser.rut = userData.rut;
    newUser.names = userData.names;
    newUser.family_name = userData.family_name;
    newUser.email = userData.email;
    newUser.profile_name = this.makeProfileName(newUser.email);

    bcrypt.genSalt(10, (err, salt) => {
        if(err) throw err;

        bcrypt.hash(userData.password, salt, (err, hash) => {
            console.log('hash:', hash);            
            if (err) throw err;

            newUser.password = hash;
            newUser.save(callback);             
        });
    });
};

module.exports.findAllUsers = function (callback) {
    User.find(callback);
 };

 module.exports.findUserById = function (id, callback) { 
    User.findById(id, callback);
 };

 module.exports.findUserByProfileName = function (profile_name, callback) { 
    query = {profile_name: profile_name};
    User.findOne(query, callback);
 };

 module.exports.findUserByEmail = function (email, callback) { 
    query = {email: email};     
    User.findOne(query, callback);
 };

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

 module.exports.deleteUserByEmail = function (email, callback) { 
    query = {email: email};
    User.findOneAndDelete(query, callback);
 };

 module.exports.makeProfileName = function(email) { 
    const splittedEmail = email.split('@');
    const splittedDomain = splittedEmail[1].split('.');
    return splittedEmail[0] + '.' + splittedEmail[1][0] + '.'  + splittedDomain[1][splittedDomain[1].length - 1];
 };

 function transformRut(raw_rut) { 
    
 }

 function validateRut(rut) {

 };