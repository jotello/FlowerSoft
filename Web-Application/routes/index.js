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

router.post('/login', function(req, res, next){
	//Max debe hacer la conexion entre api-gateway y su servicio, para luego redireccionar al dashboard
});



module.exports = router;
