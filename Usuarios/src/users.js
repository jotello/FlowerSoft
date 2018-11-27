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
    console.log('login');
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

        console.log('body:', body);

        if(body === false) { 
            res.status(403).send('forbidden');     
        }
        
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
            data: {}
        });
    }
    User.findUserByEmail(req.body.email, (err, user) => {
        if (err) throw err;

        console.log('user:', user);
        if(user) {
            console.log('user exist');
            return res.status(400).send({
                message: emailExistMessage,
                data: {}
            });
        }
        User.createUser(req.body, (err, user) => {
            if (err) {
                throw err;
            }
            //Success
            console.log('user', user);

            res.status(200).send(user);
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
        console.log('El usuario no fue encontrado');
          return res.status(404).send(notFoundMessage);
      }
      console.log('el usuario encontrado:', user);
      res.status(200).send(user);
  });
})
/*
    const rest = myauth.verifyToken(req, res);

    if(rest === null) { 
        return res.status(403).send({
            message: 'Forbidden: No Token',
            data: null
        });
    }

    console.log("req.token:", req.token);

    console.log('En Users GET ');
    const token = req.token;
    const decodedJWT = myauth.decode(token);
    console.log('req.token:', req.token);
    console.log(decodedJWT);

    if(decodedJWT === null)
    {
        res.status(500).send({
            message: 'oops',
            data: null
        });
    }

    const verifyOptions = {
        issuer: decodedJWT.payload.issuer,
        subject: decodedJWT.payload.subject,
        audience: decodedJWT.payload.audience,
        expiresIn: decodedJWT.payload.expiresIn,
        algorithm: decodedJWT.header.alg
    }

    const result = myauth.verify(token, verifyOptions);
>>>>>>> 5b73673432c219799f401ad1f3d559f895aa6435

    if(result === false) {
        return res.status(403).send({
            message: 'Forbidden',
            data: null
        });
    }
    else {
        user_id = result.id;
        User.findUserById(user_id, (err, user) => {
            if (err) throw err;

            if(!user) {
                return res.status(404).send(notFoundMessage);
            }

            res.status(200).send(user);
        });
    }
})
/*
router.get('/', (req, res) => {
    User.findAllUsers((err, users) => {
        if (err) throw err;

        //Success
        res.status(200).send(users);
    });
*/
});

//GET: LOGOUT

router.get('/logout', (req, res) => {
});
//GET:profile_name


router.get('/:profile_name', ensureAuthenticated, (req, res) => {

    console.log('Obteniendo por profile_name');

    User.findUserByProfileName(req.params.profile_name, (err, user) => {
        if (err) throw err;

        if(!user) {
            return res.status(404).send(notFoundMessage);
        }
        res.status(200).send(user);
    });
});

/*
router.put('/', ensureLogged, (req, res) => {

    console.log('EN PUT de raiz');
    console.log('USER:'. req.user);
    console.log('profile:', req.user.profile_name);

    User.findUserByProfileName(req.user.profile_name, (err, user) => {
        if (err) throw err;

        console.log('user:', user);
        if(!user) {
            return res.status(404).send({
                message: notFoundMessage,
                data: {}
            });
        }

        const { error }= Joi.validate(req.body, User.joiSchema.put);
        if (error) {
            return res.status(400).send({
                errors: error,
                message: badRequestMessage
            });
        }

        let emailChanged = false;
        if(req.body.email && req.body.email != user.email)  {
            User.findUserByEmail(req.body.email, (err, user) => {
                if (err) throw  err;

                if (user) {
                    return res.status(400).send({
                        message: emailExistMessage,
                        data: {}
                    });
                }
            });
            emailChanged = true;
        }

        console.log('emailChanged', emailChanged);
        User.updateUserByProfileName(req.params.profile_name, req.body, emailChanged, (err, raw) => {
            console.log('raw:', raw);
            if (err) throw err;

            const callback = (err, user) => {
                if (err) throw err;

                console.log('Sending the user');
                console.log(user);
                res.status(200).send(user);
            };

            if (emailChanged) {
                User.findUserByEmail (req.body.email, callback);
            }
            else {
                User.findUserByProfileName(req.params.profile_name, callback);
            }
        });
    });
});

*/
router.put('/:profile_name', (req, res) => {
    console.log('En put:', req.params.profile_name);
    User.findUserByProfileName(req.params.profile_name, (err, user) => {
        if (err) throw err;

        console.log('user:', user);
        if(!user) {
            return res.status(404).send({
                message: notFoundMessage,
                data: {}
            });
        }

        const { error }= Joi.validate(req.body, User.joiSchema.put);
        if (error) {
            return res.status(400).send({
                errors: error,
                message: badRequestMessage
            });
        }

        let emailChanged = false;
        if(req.body.email && req.body.email != user.email)  {
            User.findUserByEmail(req.body.email, (err, user) => {
                if (err) throw  err;

                if (user) {
                    return res.status(400).send({
                        message: emailExistMessage,
                        data: {}
                    });
                }
            });
            emailChanged = true;
        }

        console.log('emailChanged', emailChanged);
        User.updateUserByProfileName(req.params.profile_name, req.body, emailChanged, (err, raw) => {
            console.log('raw:', raw);
            if (err) throw err;

            const callback = (err, user) => {
                if (err) throw err;

                console.log('Sending the user');
                console.log(user);
                res.status(200).send(user);
            };

            if (emailChanged) {
                User.findUserByEmail (req.body.email, callback);
            }
            else {
                User.findUserByProfileName(req.params.profile_name, callback);
            }
        });
    });
});

//DELETE
router.delete('/:profile_name', (req, res) => {
    User.deleteUserByEmail(req.params.profile_name, (err, user) =>{
        if(err) throw err;

        if (!user) {
            return res.status(404).send(notFoundMessage);
        }
        res.status(200).send(user);
    });s
});

module.exports = router;