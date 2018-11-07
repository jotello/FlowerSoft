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

  const email = req.body.email;
  const password = req.body.password;

  request.post('http://localhost:8080/users')


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

  request.post('http://localhost:8080/users/').form({
    "names": names,
    "family_name": family_name,
    "rut": rut,
    "email": email,
    "password": password
  }),
  (err, httpResponse, body) => {
    if(err) throw err;

    console.log('Upload successful! Server responde with:',body);
  };
  res.redirect('/');
});



module.exports = router;
