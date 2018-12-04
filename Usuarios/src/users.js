const path = require('path');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require(path.join(__dirname, 'db'));

const notFoundMessage = 'User not found';
const badRequestMessage = 'invalid parameters';
const emailExistMessage = 'Email in use';

const myauth = require(path.join(__dirname, 'auth'));
const jwt = require('jsonwebtoken');

const request = require('request');
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
//POST LOGIN
router.post('/login', passport.authenticate('local'), (req, res, next) => {
    console.log('EN LOGIN DE USUARIO');
    const payload = {
        id: req.user._id,
        email: req.user.email,
        rol: req.user.rol
    };
    const signOptions = {
        issuer: 'Flowersoft-users-service',
        subject: req.user.email,
        audience: req.body.audience,
    };
    const str_payload = JSON.stringify(payload);
    const str_signOptions = JSON.stringify(signOptions);

    console.log('signOptions:', str_signOptions);
    console.log("str_payload", str_payload);

    request.post({url: 'http://localhost:3003/api/auth/sign',
    form: {"payload":str_payload, "options":str_signOptions}},
      (err, response, body) => {
          if(err){
              console.log('err:', err);
          }

        console.log('body(token):', body);

        if(body === false) {
            console.log('sending forbidden');
            return res.status(403).send('forbidden');
        }
        console.log('sending OK(token)');
        return res.status(200).send(body);
      });
});
//POST
router.post('/', (req, res) => {
    console.log('En post de users');
    const { error }  = Joi.validate(req.body, User.joiSchema.post);

    if (error) {
        return res.status(400).send({
            errors: error,
            message: badRequestMessage,
            data: false
        });
    }
    User.findUserByEmail(req.body.email, (err, user) => {
        if (err) throw err;

        console.log('user:', user);
        if(user) {
            console.log('user exist');
            return res.status(400).send({
                message: emailExistMessage,
                data: false
            });
        }
        User.createUser(req.body, (err, user) => {
            if (err) {
                throw err;
            }
            //Success
            console.log('user', user);
            //User already in user's database
            //must be included now in Pedidos/Usuario
            // -ID
            // -rut
            // -names
            // - rol
            // -email
            // -password
            console.log('requesting pedidos/usuarios');
            console.log('id', user._id);
            console.log("rut:", user.rut);
            console.log('nombre:', user.names);
            console.log('rol:', user.rol);
            console.log("email:", user.email);
            console.log("password:", user.password);
            request.post({url: 'http://localhost:3002/api/pedidos/usuarios',
            form: {id: user._id, rut: user.rut, nombre: user.names, rol: user.rol,
              email: user.email, password: user.password}},
              (err, response, body) => {
                  if(err) {
                      console.log("error:", err);
                  }
                console.log("response status:", response.statusCode)
                console.log("body:", body);

                console.log('user allegedly succesfully created');
                console.log('theUser:', user);
                console.log('Message from pedidos/usuarios(allegedly):', body.message);

                return res.status(200).json({
                      message: "success",
                      data: user
                });
             });
        });
    });
});
//GET
router.get('/', (req, res) => {
    console.log('En get');
    console.log('headers:', req.headers);
    console.log('headers["authorization"]:', req.headers['authorization']);

    request.post('http://localhost:3003/api/auth/check_credentials', {
        'auth': {
          'bearer': req.headers['authorization'].split(' ')[1]
        }
      },
      (err, response, decodedAndVerifyToken) => {
          if(err){
              console.log('err:', err);
          }
        const data = JSON.parse(decodedAndVerifyToken);
        if(response.statusCode === 403) {
            return res.status(403).send(data.message);
        }
        const id = data.id;
        console.log('id:', id);
        User.findUserById(id, (err, user) => {
            if (err) throw err;
            if(!user) {
                return res.status(404).send(notFoundMessage);
            }
            res.status(200).send(user);
        });
      });
});

//GET: LOGOUT

router.get('/logout', (req, res) => {
});

//DELETE
router.delete('/:id', (req, res) => {
    User.deleteUserById(req.params.id, (err, user) =>{
        if(!user) {
            res.send(200).send({
                eliminados: 1
            });
        } else {
            res.send(200).send({
                eliminados: 0
            });
        }
    });
});
//PUT
router.put('/:id', (req, res) => {
    console.log('En put:', req.params.id);
    User.findUserById(req.params.id, (err, user) => {
        if (err) {
            console.log('err:', err);
            return res.status(500).send({
                message: 'db search error',
                data: false
            })
        }
        console.log('user:', user);
        if(!user) {
            return res.status(404).send({
                message: notFoundMessage,
                data: false
            });
        }
        const { error }= Joi.validate(req.body, User.joiSchema.put);
        if (error) {
            return res.status(400).send({
                message: badRequestMessage,
                data: error
            });
        }
        let emailChanged = false;
        if(req.body.email && req.body.email != user.email)  {
            User.findUserByEmail(req.body.email, (err, user) => {
                if (err) throw  err;

                if (user) {
                    return res.status(400).send({
                        message: emailExistMessage,
                        data: false
                    });
                }
            });
            emailChanged = true;
        }

        console.log('emailChanged', emailChanged);
        User.updateUserById(req.params.id, req.body, emailChanged, (err, raw) => {
            console.log('raw:', raw);
            if (err) throw err;

            return res.status(200).send({
                message : 'OK',
                data: user
            });
        });
    });
});

router.get('/auth/check_credentials', (req, res) => {
    request.post('http://localhost:3003/api/auth/check_credentials', {
        'auth': {
          'bearer': req.headers['authorization'].split(' ')[1]
        }
      },
      (err, response, verifyJWT) => {
          if(err){
              console.log('err:', err);
              return res.status(500).send({
                  message: 'error',
                  data: false
              })
          }
          const resp = JSON.parse(verifyJWT);
          console.log('RESP COMPLETE:', resp);
          //resp:
          //    message
          //    data
          console.log('response status:', response.statusCode);
          const status = (resp.data === false)? 403 : 200;
          console.log('ternary status:', response.statusCode);
          return res.status(status).send({
              resp
            });
    });
});

module.exports = router;
