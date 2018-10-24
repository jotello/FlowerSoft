var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'FlowerSoft' });
});

router.get('/dashboard', function(req, res, next){
	var array;
	request.get('http://localhost:8080/pedidos'), 
	function optionalCallback(err, response, body){
		console.log(response);
		console.log(body);
		array = body;
	}
	console.log(array);
	res.render('inicio', {title: 'Inicio'});
});

router.post('/dashboard/crearPedido', function(req, res, next){
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;
	request.post('http://localhost:8080/pedidos').form({"detalle":detalle, "fecha" :fecha}), 
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/dashboard');
});

module.exports = router;
