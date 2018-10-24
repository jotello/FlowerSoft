const path = require('path');
const express = require('express');
const router = express.Router();
const expressValidator = require('express-validator');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;


const User = require(path.join(path.join('..', 'model'), 'user'));

//Las vistas se renderizan, se muestran con res.render(${vista})
//Los textos y otras respuestas de ese tipo, se envían con res.send(${message})


//PASSPORT
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


//FUNCTIONS

//SIGNUP

//GET
router.get('/signup', (req, res) => {

    console.log('EN SIGNUP');
    if(!req.isAuthenticated())
    {
        res.render('signup');
    }
    else
    {
        res.redirect('/');       
    }
});

//POST
//*EN USER FUNCTIONS

//LOGIN

//GET
router.get('/login', (req, res) => {
    res.render('login');
});

//POST
router.post('/login',
  passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: true}),
  function(req, res) {
    console.log('correcto');
    res.redirect('/users/' + req.user._id);
  });


//LOGOUT

//GET
router.get('/logout', ensureAuthenticated, function (req, res) {
    console.log('deslogueando');
    req.logout();
    req.flash('success_msg', 'Has cerrado sesión');
    console.log('deslogueado');    

    res.redirect('/users/login');
});


//USERS FUNCTIONS

//GET
router.get('/:user_id', ensureAuthenticated, (req, res) =>{ 
    const id = req.params.user_id;
    User.getUserById(id, (err, user) => {
        if(err) throw err;

        if(!user)
        {
            console.log('El usuario no existe');
            res.redirect('/');
        }
        else
        {
            console.log('Si existe');
            res.render('index', {user: user});
        }

    });
});

//EDIT - POST
router.post('/:user_id', ensureAuthenticated, (req, res) => {
    console.log('EN POST EDIT');

    actualizar_rutina(req, res);
});


//POST
router.post('/signup', (req, res) =>{ 
    console.log('EN POST');

    agregar_rutina(req, res);
});

//PUT
/*
router.put('/:user_id', (req, res) =>{ 
    console.log('EN PUT');

    user = verificar_existencia();

    if(!user)
    {
        agregar_rutina(req, res);       
    }
    else
    {
        actualizar_rutina(req, res);
    }
});
*/


//PATCH
router.patch('/:user_id', ensureAuthenticated, (req, res) => {
    
    console.log('EN PATCH');

    actualizar_rutina(req, res);

});


//DELETE
router.delete('/:user_id', ensureAuthenticated, (req, res) =>{ 
    console.log('EN DELETE');

    delete_rutina(req, res);
});

function actualizar_rutina(req, res)
{
    console.log('EN EDIT RUTINA');

    //Validación 

    req.checkBody('rut', 'El Rut es un campo obligatorio').notEmpty();
    req.checkBody('name', 'El Nombre es un campo obligatorio').notEmpty();
    req.checkBody('last_name', 'El Apellido es un campo obligatorio').notEmpty();
    req.checkBody('email', 'El email debe ser válido').isEmail();    

    const errors = req.validationErrors();


    console.log('sin errrores');        
    var id = req.params.user_id; 
    var rut = req.body.rut;
    var name = req.body.name;
    var last_name = req.body.last_name;
    var email = req.body.email;

    console.log("id");
    console.log(id);
    console.log("demas");    
    console.log(rut);
    console.log(name);
    console.log(last_name);
    console.log(email);
    console.log('sin errrores');


    if(errors)
    {
        console.log("errores");
        res.render('/', {errors: errors});
    }
    else
    {
        User.updateUser(id, {$set : {name: name, last_name: last_name, rut: rut, email: email}}, (err, user) => {
        console.log("el usuario modificado");
        console.log(user);
        });

        res.redirect('/');        
    }
};

function agregar_rutina(req, res)
{
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
}

function delete_rutina(req, res)
{
    user_id = req.params.user_id;
    User.deleteById(user_id, (err, user) => {
        if (err) throw err;

        console.log('Usuario borrado');
    });
};

function verificar_existencia(id)
{
    User.getUserById(id, (err, user) =>{
        return user;
    });

}

function ensureAuthenticated(req, res, next) {

    console.log('autenticando');
    console.log(req.user);
    console.log(req.isAuthenticated);
    
    if (req.isAuthenticated()) {
        return next();
    } else {
        //req.flash('error_msg', 'Inicie Sesión');
        res.redirect('/users/login');
    }

    console.log(errors);

    if (errors) {
        console.log('yes');
        //res.render('signup', { errors: errors });
    }
    else {
        console.log('Sin errores');

        res.redirect('/');
    }
}

module.exports = router;


/*
//CAMBIO PASS
router.get('/:user_id/change_pass', ensureAuthenticated, (req, res, next)=>{
    id = req.params.user_id;
    res.render('pass_change', {user_id: id});
});

router.post('/:user_id/change_pass', ensureAuthenticated, (res, req, next) =>{ 

    console.log("En pass CHANGE PASS");
    var id = req.user._id; 
    var passport = req.body.passport;
    var confirmPassport = req.body.confirmPassport;

    console.log("id");
    console.log(id);
    console.log("demas");    
    console.log(password);
    console.log(confirmPassword);
    console.log('sin errrores');

    req.checkBody('confirmPassword', 'Las contraseñas no coinciden').equals(req.body.password);

    errors = req.validationErrors();

    if (errors)
    {
        console.log("errores");
        res.render('pass_change', {user_id: user_id});
    }

    else
    {  
        User.updatePass(user_id, password, (err, user)=>{
            console.log("el usuario modificado");
            console.log(user);
        });

    }

    res.redirect('/');

});

*/