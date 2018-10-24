var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/registro', function(req, res, next){
	res.render('registro', {title: 'Registro de Usuarios'});
});

router.get('/login', function(req, res, next){
	res.render('login', {title: 'Login'});
});

module.exports = router;
