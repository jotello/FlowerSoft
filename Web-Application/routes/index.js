var express = require('express');
var router = express.Router();
var request = require('request');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

//VARIABLES GLOBALES
global.title = "Flowersoft";

/* GET home page. */
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
      let error = {status: '500'};
      return res.render('error', {message:'usuario invalido', error:error});
    }
    console.log('redirect:', redirect);
    return res.redirect(redirect);
  }
  console.log('rendering the index');
  res.render('index', {title: global.title});
});

router.get('/registro', function(req, res, next) {
  res.render('registro', { title: 'FlowerSoft' });
});

router.post('/login', function(req, res, next) {
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

        res.redirect('/');
      }
    });
  });
});

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

router.get('/logout', (req, res , next) => {

  global.wat = null;
  res.render('logout');
});

module.exports.router = router;
