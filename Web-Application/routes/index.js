var express = require('express');
var router = express.Router();
var request = require('request');

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
    console.log('login exitoso');
    console.log('a parsear');

    var results = JSON.parse(body);

    console.log('parseado');

    console.log(results);
    console.log(results.message);
    console.log(results.data);
    console.log('statusCode:', httpResponse.statusCode);

    if(httpResponse.statusCode === 200)
    {
      console.log('Login correcto');
    }
  });
  res.redirect('/');
});


router.get('/profile', (req, res, next) => {
  const url = "http://localhost:8080/users/";

  console.log('url:', url);
  console.log('url type:', typeof(url));
  request.get({url: url,
  form: {}},
  function(err, httpResponse, body) {
    console.log('de vuelta');
      var results = JSON.parse(body);
      console.log('RESULTADOS');
      console.log('results', results);
      console.log('body', results.body);
      console.log('user', results.data);

      if(httpResponse.statusCode === 401)
      {
        console.log('no autorizado');
      }
      res.render('index', { title: 'FlowerSoft' });
  });
});



router.get('/logout', (req, res, next) => {
  request.get({url: 'http://localhost:8080/users/logout',
  form: {}},
  function(err, httpResponse, body)
  {
      console.log('loggedout');
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

  //Validacion

  console.log(names);
  console.log(family_name);
  console.log(rut);
  console.log(email);
  console.log(password);
  console.log(confirmPassword);

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
