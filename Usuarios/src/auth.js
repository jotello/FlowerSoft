const path = require('path');
const Joi = require('joi');
const fs = require('fs');
const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require(path.join(__dirname, 'db'));

const privateKey = fs.readFileSync(path.join(__dirname, 'private.key'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

const jwt = require('jsonwebtoken');


//req.headers['authorization']

//PASSPORT

passport.use(new LocalStrategy({
    usernameField: 'email'
},
    function (email, password, done) {
        console.log("In Strategy");
        User.findUserByEmail(email, function (err, user) {
            if (err) {
                console.log(err);
                throw err;
            }
            if (!user) {
                console.log('revise credenciales');
                return done(null, false, { message: 'revise credenciales' });
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;

                if (isMatch) {
                    console.log('MATCH');
                    return done(null, user);
                }
                else {
                    console.log('revise credenciales');
                    return done(null, false, { message: 'revise credenciales' });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    console.log('serialiazing');
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('deserialiazing');
    User.findUserById(id, function (err, user) {
        done(err, user);
    });
});


router.post('/', passport.authenticate('local'), (req, res) => {
  createToken(req, res);

});

module.exports.createToken = function(req, res) {

  console.log('privateKey:', privateKey);
  console.log('publicKey:', publicKey);
  //PAYLOAD
  const payload = {
    _id: req.user._id,
    rol: req.user.rol,
  };
  //KEYS
  const iss = 'Flowersoft';
  const s = req.user.email;
  const a = 'http://localhost:3005/';

//SIGN OPTIONS
  const signOptions = {
    issuer: iss,
    subject: s,
    audience: a,
    expiresIn: "6h",
    algorithm: "RS256"
  };

  const token = jwt.sign(payload, privateKey, signOptions);
  console.log('token:', token);
  return {
    message: 'OK',
    data: token
  };
}

module.exports.router = router;
