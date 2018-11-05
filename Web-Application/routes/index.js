var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: 'FlowerSoft' });
});

router.get('/dashboard', function(req, res, next){
	request('http://localhost:8080/pedidos/', function(error, response, body) {
		var pedidos = JSON.parse(body);
        res.render('inicio', {title: 'Inicio', pedidos: pedidos.data});
    });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});

router.get('/dashboard/pedido/delete/:id', function(req, res, next){
	var id = req.params.id;
	request.delete('http://localhost:8080/pedidos/'+id, 
		function optionalCallback(err, httpResponse, body){
			if (err) {
    		return console.error('Delete failed:', err);
  			}
  			console.log('Delete successful!  Server responded with:', body);	
		}
	);
	res.redirect('/dashboard');
}); //Funcionando

router.get('/dashboard/pedido/edit/:id', function(req, res, next){
	var id = req.params.id;
	request('http://localhost:8080/pedidos/'+id, function(error, response, body) {
		var pedido = JSON.parse(body);
        res.render('edit_pedido', {pedido: pedido.data});
    });
});

router.post('/dashboard/pedido/update', function(req, res, next){
	var id = req.body.id;
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;
	request.put('http://localhost:8080/pedidos/'+id).form({"detalle":detalle, "fecha" :fecha}), 
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/dashboard');
})

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
