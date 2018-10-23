var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'FlowerSoft' });
});

router.get('/registro', function(req, res, next){
	res.render('registro', {title: 'Registro de Usuarios'});
});

router.get('/login', function(req, res, next){
	res.render('login', {title: 'Login'});
});

router.get('/dashboard', function(req, res, next){
	res.render('inicio', {title: 'Inicio'});
});

module.exports = router;
