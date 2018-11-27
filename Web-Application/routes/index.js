var express = require('express');
var router = express.Router();
var request = require('request');

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

console.log('publicKey initialized:', publicKey);

global.wat = null;

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('renderizando index');
  console.log('wat:', wat);
  console.log('wat type:', typeof wat);
  const token = global.wat;
  res.render('index', { title: 'Flowersoft', t: global.wat});
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
    if(err) throw err;

    var results = JSON.parse(body);
    console.log(results);
    const token = results.token;
    
    console.log('req.body.email:', req.body.email);
    console.log('token:', token);
    
    if(httpResponse.statusCode === 200){

      decodedJWT = jwt.decode(token, {complete: true});

      const verifyOptions = {
       issuer: decodedJWT.payload.issuer,
       subject: decodedJWT.payload.email,
       audience: audience,
       expiresIn: decodedJWT.payload.expiresIn,
       algorithm: decodedJWT.header.alg
      };
      
      console.log('publicKey:', publicKey);

      jwt.verify(token, publicKey, verifyOptions, (err, authData) => {
        console.log('verifying token');
        if(err) {
          console.log('err:', err);
          return res.render('error', {error});
        }
        else {
          global.wat = token;
          res.redirect('/');
        }
      });
    }
  });
});

router.get('/profile', (req, res, next) => {
  console.log('en profile');
  const bearerToken = global.wat;
  
  console.log('bearer token:', bearerToken);
  
  request.get('http://localhost:8080/users/', {
    'auth': {
      'bearer': bearerToken
    }
  },
  (err, response, body) => {
    console.log('response:', response);
    if (err)
    {
      console.log('err:', err);
    }
    console.log('body:', body);

    const user = body;
    res.render('perfil', {user: body, token: global.wat});
  });
});

router.post('/registro', (req, res, next) => {

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

module.exports = router;
