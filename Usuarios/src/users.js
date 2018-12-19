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
    console.log('req.body:',req.body);
    //Verificamos que la request no tenga errores
    const { error }  = Joi.validate(req.body, User.joiSchema.post);
    if (error) {
      console.log("error en request");
      console.log('error:', error);
      return res.status(400).send({
        errors: error,
        message: badRequestMessage,
        data: false
      });
    }
    //Verificamos que el email no exista previamente en la BD
    User.findUserByEmail(req.body.email, (err, user) => {
        if (err) {
          return res.stauts(500).json({
            message: 'error al buscar usuario',
            data: null
          });
        }
        console.log('user:', user);
        if(user) {
            console.log('user exist');
            return res.status(400).send({
                message: emailExistMessage,
                data: false
            });
        }
        console.log('Usuarios');
        //Creamos el Usuario en la BD users-service-db
        User.createUser(req.body, (err, user) => {
            if (err) {
                console.log('error:', err);
                return res.status(500).json({
                message: 'error al crear usuario en Usuario',
                data: null
                });
            }
            //Le pedimos a la saga que nos agregue un usuario a pedidos-usuarios
            console.log('A pedir a la SAGA');
            request.post({url: 'http://localhost:3006/api/data_user',
                form: {id: user._id, rut: user.rut, nombre: user.names, apellido: user.family_name,
                rol: user.rol, email: user.email, password: user.password}},
                (err, response, body) => {
                console.log('EN SAGA');
                if(err) {
                    console.log("error:", err);
                    return res.status(500).json({
                        message: 'error al conectar con 3006/api/dada_user\nrevisar bases de datos',
                        data: null
                    });
                }
                console.log()
                //Éxito en todas las operaciones
                console.log("\tagregado");
                return res.status(200).json({
                    message: "OK",
                    data: user
                });
            });
        });
    });
});
//GET - ALL
router.get('/', checkCredentials, (req, res) => {
    console.log("EN GET DE USERS");
    User.findAllUsers((err, users) => {
        if(err) {
            console.log('error:', err);
            return res.status(500).send({
                message: 'error en get de todos los usuarios',
                data: null
            });
        }
        return res.status(200).send({
            message: 'OK',
            data: users
        });
    });
});
//GET /:ID
router.get('/:id', checkCredentials, (req, res) => {
    console.log("EN GET DE USER/:ID");
    console.log('req.userData:', req.userData);
    const data = req.userData;
    console.log("user data:", data);
    const id = data.id;
    console.log('id:', id);
    User.findUserById(id, (err, user) => {
        if (err) {
            console.log("err", err);
            return res.status(500).send({
                message: "error",
                data: err
            });
        }
        if(!user) {
            return res.status(404).send({
                message: notFoundMessage,
                data: null
            });
        }
        res.status(200).json({
            message: 'OK',
            data: user
        });
    });
});
//DELETE
router.delete('/:id', (req, res) => {
    User.deleteUserById(req.params.id, (err, user) =>{
        if(!user) {
            res.status(200).send({
                eliminados: 1
            });
        } else {
            res.status(200).send({
                eliminados: 0
            });
        }
    });
});
//PUT
router.put('/:id', (req, res) => {
    console.log('EN PUT USUARIOS: id:', req.params.id);
    console.log('req.body:', req.body);
    const data = req.body;
    console.log('data:', data);
    const id = parseInt(req.params.id);
    console.log("id:", id, "type:", typeof id);
    User.findUserById(req.params.id, (err, user) => {
        if (err) {
            console.log('err en busqueda de base de datos:', err);
            return res.status(500).send({
                message: 'Error de búsqueda en base de datos',
                data: err
            });
        }
        console.log('user:', user);
        if(!user) {
            return res.status(404).send({
                message: notFoundMessage,
                data: null
            });
        }
        const { error } = Joi.validate(data, User.joiSchema.put);
        if (error) {
            console.log('body error:', error);
            return res.status(400).send({
                message: badRequestMessage,
                data: error
            });
        }
        console.log('data:', data);
        console.log('user._id:', user._id);
        User.updateUserById(user._id, data, false, (err, raw) => {
            console.log('raw:', raw);
            if (err){
                console.log('error al actualizar usuario:', err);
                return res.stauts(500).send({
                    message: 'error al actualizar usuario',
                    data: error
                });
            }
            return res.status(200).send({
                message : 'OK',
                data: user
            });
        });
    });
});
//GET -AUTH/CHECK_CREDENTIALS
router.get('/auth/check_credentials', (req, res) => {
    console.log("CHECKING CREDENTIALS");
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
// FUNCTION - checkCredentials
function checkCredentials(req, res, next) {
    console.log("CHECKING CREDENTIALS MIDDLEWARE");
    console.log('req.headers["authorization"]', req.headers['authorization']);
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
          if(status === 403) {
              return res.status(403).send({
                    message: 'Forbidden',
                    data: false
              });
          }
          req.userData = resp.data;
          next();
    });
}
module.exports = router;
