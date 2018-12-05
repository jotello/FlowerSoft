var express = require('express');
var router = express.Router();
var request = require('request');

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('en get the dashboard');
	//Rosa debe poblar esta vista con los productos
	request('http://localhost:8080/catalogo/', function(error, response, body) {
		var catalogo = JSON.parse(body);
		request('http://localhost:8080/catalogo/carrito/4', function(err, resp, bod){
			var productos = JSON.parse(bod).data;

			if(productos.length > 0){
				res.render('dashboard', {title: 'Inicio', catalogo: catalogo.data, contador: productos.length});	
			} else{
				res.render('dashboard', {title: 'Inicio', catalogo: catalogo.data});
			}			
            console.log(catalogo.data);
		});
        
    });
  //res.render('dashboard', { title: 'Dashboard' });
});

router.get('/carrito', function(req,res, next){
	request('http://localhost:8080/catalogo/carrito/4', function(err, resp, bod){
			var productos = JSON.parse(bod).data;
			if(productos.length > 0){
				var total = 0;
				for(i=0; i<= (productos.length - 1) ; i++){
					total = total + productos[i].total;
				}
				res.render('ver_carrito', {title: 'Carrito de reserva', productos: productos, contador: productos.length, total: total});	
			} else{
				res.render('ver_carrito', {title: 'Carrito de reserva', mensaje: 'Sin productos en el carrito'});
			}			
		});

});

router.post('/carrito/agregar', function(req, res, next){
	var id_usuario = req.body.id_usuario;
	var id_producto = req.body.id_producto;
	var nombre_producto = req.body.nombre_producto;
	var cantidad = req.body.cantidad;
	var total = req.body.total;

	request.post('http://localhost:8080/catalogo/carrito/'+parseInt(id_usuario)).form({"id_producto" : parseInt(id_producto), 
		"nombre_producto": nombre_producto, "cantidad" :parseInt(cantidad), "total" : parseInt(total)}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/dashboard/');
});


router.get('/pedidos', function(req, res, next){
	request('http://localhost:8080/pedidos/', function(error, response, body) {
		var pedidos = JSON.parse(body);
        res.render('dashboard', {title: 'Lista de pedidos', pedidos: pedidos.data});
    });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});

router.post('/pedido', function(req, res, next){
	var id_usuario = req.body.id_usuario;
	var fecha = req.body.fecha;
	var detalle = req.body.detalle;
	var total = req.body.total;
	request.post('http://localhost:8080/pedidos/').form({"id_usuario": id_usuario, "fecha": fecha, "detalle": detalle, "total": total}),
	function optionalCallback(err, httpResponse, body){
		if(err) {
			return console.error('Upload de pedido fallo: ', err);
		} 
	};
	res.redirect('/dashboard');
});

router.get('/pedido/delete/:id', function(req, res, next){
	var id = req.params.id;
	request.delete('http://localhost:8080/pedidos/'+id,
		function optionalCallback(err, httpResponse, body){
			if (err) {
    		return console.error('Delete failed:', err);
  			}
  			console.log('Delete successful!  Server responded with:', body);
		}
	);
	res.redirect('/dashboard/pedidos');
}); //Funcionando

router.get('/pedido/edit/:id', function(req, res, next){
	var id = req.params.id;
	request('http://localhost:8080/pedidos/'+id, function(error, response, body) {
		var pedido = JSON.parse(body);
        res.render('edit_pedido', {pedido: pedido.data});
    });
});

router.post('/pedido/update', function(req, res, next){
	var id = req.body.id;
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;
	var total = req.body.total;
	var id_cliente = req.body.id_cliente;
	var cliente = req.body.cliente;

	request.put('http://localhost:8080/pedidos/'+id).form({"total" : total, "detalle":detalle, "fecha" :fecha, "cliente" : cliente}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/dashboard/pedidos');
});

router.get('/crearPedido', function(req, res, next) {
  res.render('crear_pedido', { title: 'Crear Pedido' });
});

router.post('/crearPedido', function(req, res, next){
	var total = req.body.total;
	var id_cliente = req.body.id_cliente;
	var cliente = req.body.cliente;
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;
	request.post('http://localhost:8080/pedidos/').form({"total":total, "detalle":detalle, "fecha" :fecha, "ID_CLIENTE" : id_cliente, "nombre_cliente" : cliente}), 
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/dashboard/pedidos');
});

module.exports = router;
