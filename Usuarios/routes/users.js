const path = require('path');
const express = require('express');
const router = express.Router();
const expressValidator = require('express-validator');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const User = require(path.join(path.join('..', 'model'), 'user'));

//Las vistas se renderizan, se muestran con res.render(${vista})
//Los textos y otras respuestas de ese tipo, se envían con res.send(${message})


//SIGNUP
router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/signup', (req, res) => {

    console.log('In signup post');

    //Datos
    var rut = req.body.rut;
    var name = req.body.name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    console.log(rut);
    console.log(name);
    console.log(last_name);
    console.log(email);
    console.log(password);
    console.log(confirmPassword);

    //Validación
    req.checkBody('rut', 'El Rut es un campo obligatorio').notEmpty();
    req.checkBody('name', 'El Nombre es un campo obligatorio').notEmpty();
    req.checkBody('last_name', 'El Apellido es un campo obligatorio').notEmpty();
    req.checkBody('email', 'El Correo electrónico es un campo obligatorio').isEmail();
    req.checkBody('password', 'La contraseña es un campo obligatorio').notEmpty();
    req.checkBody('confirmPassword', 'Las contraseñas no coinciden').equals(req.body.password);

    console.log(confirmPassword === password);

    const errors = req.validationErrors();

    console.log(errors);

    if (errors) {
        console.log('yes');
        res.render('signup', { errors: errors });
    }
    else {
        console.log('Sin errores');
        var newUser = new User({
            rut: rut,
            name: name,
            last_name: last_name,
            email: email,
            password: password
        });

        User.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'registrado');

        res.redirect('/users/login');
    }

});

//LOGIN
router.get('/login', (req, res) => {
    res.render('login');
});

passport.use(new LocalStrategy({
    usernameField: 'email'
},
    function (email, password, done) {
        console.log("strategy");
        User.getUserByEmail(email, function (err, user) {
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
    console.log('serializazing');
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    console.log('deserializazing');
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
    function (req, res) {
        console.log('correcto');
        res.redirect('/');
    });

module.exports = router;

//LOGOUT

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success_msg', 'Has cerrado sesión');

    res.redirect('/users/login');
});