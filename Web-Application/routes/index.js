var express = require('express');
var router = express.Router();
var request = require('request');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');
const seschk = require('../session_checker');

//VARIABLES GLOBALES
global.title = "Flowersoft";

//GET INDEX
router.get('/', function(req, res, next) {
  console.log('INDEX');
  console.log('global.wat:', global.wat);
  if(global.wat !== null) {
    const verifyJWT = jwt.verify(global.wat, publicKey);
    const rol = verifyJWT.rol;
    let redirect;
    console.log('user rol:', rol);
    if (rol === 'admin') {
      redirect = '/admin/';
    }
    else if (rol === 'cliente') {
      redirect = '/dashboard/';
    }
    else {
      console.log("error en login");
      let error = {status: '500'};
      return res.render('error', {message:'usuario invalido', error:error});
    }
    console.log('redirect:', redirect);
    return res.redirect(redirect);
  }
  console.log('rendering the index');
  res.render('index', {title: global.title});
});

//GET REGISTRO
router.get('/registro', function(req, res, next) {
  res.render('registro', { title: 'FlowerSoft' });
});

//GET LOGOUT
router.get('/logout', seschk.checkLogged, (req, res , next) => {
  console.log('LOGGING OUT');
  global.wat = null;
  global.rol = null;
  console.log('RENDERING LOGOUT');
  res.render('logout');
});

//POST LOGIN
router.post('/login', function(req, res, next) {
  if(global.wat !== null) {
    res.redirect('/');
  }
  console.log('en web app login');
  const email = req.body.email;
  const password = req.body.password;
  const audience = "http://localhost:3005/";
  console.log(req.body.email);
  console.log(req.body.password);
  request.post({url: 'http://localhost:8080/users/login',
  form: {"email":email, "password":password, "audience":audience}},
  function(err, httpResponse, body) {
    console.log('en el callback');
    if(err){
      console.log('IN ERROR')
      console.log('in error:', err);
      return res.status(500).send(err);
    }
    console.log('NOT IN ERROR');
    console.log('unparsed body:', body);
    const token = body;

    if(httpResponse.statusCode !== 200){
      return res.redirect('/');
    }
    decodedJWT = jwt.decode(token, {complete: true});
    const verifyOptions = {
      issuer: decodedJWT.payload.issuer,
      subject: decodedJWT.payload.email,
      audience: audience,
      expiresIn: decodedJWT.payload.expiresIn,
      algorithm: decodedJWT.header.alg
   }
   console.log('verifying token');
   jwt.verify(token, publicKey, verifyOptions, (err, userData) => {
     if(err) {
       console.log('err:', err);
       return res.render('error', {error});
      }
      else {
        global.wat = token;
        global.rol = userData.rol;
        res.redirect('/');
      }
    });
  });
});

//POST REGISTRO
router.post('/registro', (req, res, next) => {
  if(global.wat !== null) {
    return res.redirect('/');
  }
  console.log('En registro');
  const names = req.body.names;
  const family_name = req.body.family_name;
  const rut = req.body.rut;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  request.post('http://localhost:8080/users/').form({
    "names": names,
    "family_name": family_name,
    "rut": rut,
    "email": email,
    "password": password,
    "confirmPassword": confirmPassword
  });
  res.redirect('/');
});

//GET PROFILE

router.get('/profile', seschk.checkLogged, (req, res, next) => {
  res.status(200).json({
    message: 'Ok',
    data: req.user
  });
})

module.exports.router = router;
