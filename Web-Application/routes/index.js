var express = require('express');
var router = express.Router();
var request = require('request');

const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'FlowerSoft' });
});

router.get('/registro', function(req, res, next) {
  res.render('registro', { title: 'FlowerSoft' });
});

router.post('/login', function(req, res, next) {

  console.log('en web app login');
  const email = req.body.email;
  const password = req.body.password;
  console.log(req.body.email);
  console.log(req.body.password);

  request.post({url: 'http://localhost:8080/users/login',
  form: {"email":email, "password":password}},
  function(err, httpResponse, body) {
    console.log('en el callback');
    if(err) throw err;

    console.log('httpResponse', httpResponse);
    console.log('body', body);
    console.log('body type', typeof(body));

    var results = JSON.parse(body);

    console.log('parseado');

    console.log('RESULTADOS:', results);
    console.log(results.message);
    const token = console.log(results.data);
    console.log('statusCode:', httpResponse.statusCode);

    if(httpResponse.statusCode === 200)
    {
      console.log('Login correcto');
      console.log('token:', results.data.token);

      const verifyOptions = {
       issuer:  'Flowersoft',
       subject: req.email,
       audience: 'http://localhost:3005/',
       expiresIn:  "6h",
       algorithm:  ["RS256"]
      };

      const legit = jwt.verify(token, publicKey, verifyOptions);
      console.log('legit:', legit);
      console.log('token:', token);
      //se recibe el token
      //se decodifica
      //se almacena en variable (¿local o global?)
      //se muestra el catálogo (?)
      //
    }
  });
  res.redirect('/');
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

module.exports = router;
