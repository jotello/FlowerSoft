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
router.post('/login', (req, res, next) => {

    console.log('En api/users/login');

    console.log('email:', req.body.email);
    console.log('password', req.body.password);

    console.log('user:', req.user);
    console.log('esta autenticado?:', req.isAuthenticated());
    console.log('session obj', req.session);

    passport.authenticate('local', (err, user, info) => {

        if(err) { return next(err); }

        if(!user) {
            console.log('login fracasado');
            return res.status(401).send({
                message: 'email o contraseña incorrecta',
                data: {},
                status: 404
            });
        }

        req.login(user, (err) => {
            if (err) { return next(err); }

            console.log('login exitoso');
            console.log('el usuario encontrado', user);
            console.log('su profile name:', user.profile_name);
            console.log('su _id es:', req.user._id);
            console.log('el usuario logueado', req.user);
            console.log('session obj', req.session);

            return res.status(200).send({
                message: 'Login exitoso',
                data: user
            });
        });
    }) (req, res, next);
    console.log('el usuario logueado', req.user);
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

router.get('/', ensureLogged, (req, res) => {

console.log('El usuario en sesion:', req.user);
console.log('theUser:', res.locals.theUser);
  User.findUserByProfileName(req.user.profile_name, (err, user) => {
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
router.get('/', (req, res) => {
    User.findAllUsers((err, users) => {
        if (err) throw err;

        //Success
        res.status(200).send(users);
    });
});
*/

//GET: LOGOUT

router.get('/logout', ensureLogged, (req, res) => {
    console.log('en logout');
    const user = req.user;
    req.logout();
    req.session.destroy();
    console.log('loggedout');
    res.status(200).send(user);
});

//GET:profile_name

/*
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
*/



//PUT
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
    });
});

function ensureLogged(req, res, next)
{
    console.log('req', req);
    console.log('asegurando la loginacion:', req.isAuthenticated());
    console.log('req.user', req.user);
    console.log('session:', req.session);    
    console.log('el recurso solicitado:', req.params.profile_name);
    console.log('theUser:', res.locals.theUser);
    console.log('theSession:', res.locals.theSession);
    if(req.isAuthenticated()) {
        return next();
    } else {

        res.status(401).send({
            message: 'Unathorized',
            data: {},
            status: 401
        });
    }
}

router.get('/session/', (req, res) =>
{
    console.log('En session');
    User.findAllSessions((err, sessions) => {
        if(err) throw err;
        
        console.log(sessions);
        res.status(200).send(
            {
                message: 'La sessiones',
                data: sessions
            }
        )
    });
});

router.get('/session/:session_id', (req, res) =>
{
    console.log(req.params.session_id);
    User.findSessionById(req.params.session_id, (err, session) => {
        if(err) throw err;
        
        console.log('LA SESSION:', session);
        console.log('session type:', typeof(session));
        s = session.session;
        console.log('type of s:', typeof(s));
        ps = JSON.parse(s);
        console.log('ps:', ps);
        const user_id = ps.passport.user;    

        User.findUserById(user_id, (err, user) =>{
            if (err) throw err;

            console.log('EL USER:', user);

            return res.status(200).send(
                {
                    session: {
                        message: 'La session con tal id',
                        data: session
                    },
                    user: user
                }
            );
        })
    });
});

function ensureAuthenticated(req, res, next)
{
    console.log('req', req);
    console.log('asegurando la autenticacion:', req.isAuthenticated());
    console.log('req.user', req.user);
    console.log('session:', req.session);
    console.log('res.user', res.user);
    console.log('res.session:', res.session);     
    console.log('el recurso solicitado:', req.params.profile_name);
    console.log('theUser:', res.locals.theUser);
    console.log('theUser:', res.locals.theSession);

    if(req.isAuthenticated() && req.user.profile_name === req.params.profile_name) {
        return next();
    } else {
        res.status(401).send({
            message: 'Unathorized',
            data: {}
        });
    }
}



module.exports = router;
