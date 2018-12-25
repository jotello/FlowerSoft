var express = require('express');
var router = express.Router();
var request = require('request');
var productos_global = '';


/* GET home page. */
router.get('/', function(req, res, next) {
	var id_usuario = req.user.id;
	
	console.log('en get the dashboard');
	request('http://localhost:8080/catalogo/', function(error, response, body) {
		if(error) {
			console.log('error', error);
			return res.status(500).json({
					message: 'error en request a localhost:8080/catalogo',
					data: null
			});
		}
		console.log('BODY:', body);
		if(body === 'Bad gateway.') {
			return res.redirect('/dashboard/get/replica');
		}
		var catalogo = JSON.parse(body);
		request('http://localhost:8080/catalogo/carrito/'+id_usuario, function(err, resp, body){
			var productos = JSON.parse(body).data;
			var productos_global = productos;

			if(productos.length > 0){
				var mensaje_ctr = '('+ productos.length +')';
				res.render('dashboard', {title: 'Inicio', catalogo: catalogo.data, contador: mensaje_ctr});

			} else{
				res.render('dashboard', {title: 'Inicio', catalogo: catalogo.data});
			}
            console.log(catalogo.data);
		});
  });
});
//GET REPLICA CATALOGO
router.get('/get/replica', function(req, res, next) {
	var id_usuario = req.user.id;
	
	console.log('en get replica the dashboard');
	request('http://localhost:8080/replicaCatalogo/', function(error, response, body) {
		if(error) {
			console.log('error', error);
			return res.status(500).json({
					message: 'error en request a localhost:8080/replicaCatalogo',
					data: null
			});
		}
		console.log('BODY:', body);
		if(body === 'Bad gateway.') {
			return res.render('error', {message:'Bad gateway en\nhttp://localhost:8080/replicaCatalogo/', error:{status:500, stack:{}}});
		}
		var catalogo = JSON.parse(body);
		request('http://localhost:8080/replicaCatalogo/carrito/'+id_usuario, function(err, resp, body){
			var productos = JSON.parse(body).data;
			var productos_global = productos;

			if(productos.length > 0){
				var mensaje_ctr = '('+ productos.length +')';
				res.render('dashboard', {title: 'Inicio', catalogo: catalogo.data, contador: mensaje_ctr});

			} else{
				res.render('dashboard', {title: 'Inicio', catalogo: catalogo.data});
			}
            console.log(catalogo.data);
		});
  });
});
// GET - CARRITO
router.get('/carrito', function(req,res, next){
	var id_usuario = req.user.id;
	request('http://localhost:8080/catalogo/carrito/'+ id_usuario, function(err, resp, bod){
			var productos = JSON.parse(bod).data;
			var ctd = '('+productos.length+')';
			if(productos.length > 0){
				var total = 0;
				for(i=0; i<= (productos.length - 1) ; i++){
					total = total + productos[i].total;
				}
				res.render('ver_carrito', {title: 'Carrito de reserva', productos: productos, contador: ctd, total: total});
			} else{
				res.render('ver_carrito', {title: 'Carrito de reserva', mensaje: 'Sin productos en el carrito'});
			}
		});
});
// POST - CARRITO/AGREGAR
router.post('/carrito/agregar', function(req, res, next){
	var id_usuario = req.user.id;
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
	res.redirect('/dashboard');
});
//GET - PEDIDOS
router.get('/pedidos', function(req, res, next) {
	var id = req.user.id;
	request('http://localhost:8080/pedidos/usuario/'+id, function(error, response, body) {
		var pedidos = JSON.parse(body);
		console.log('Cantidad de pedidos: '+pedidos.data.length);
		request('http://localhost:8080/catalogo/carrito/'+id, function(err, resp, body){
			var productos = JSON.parse(body).data;
			var productos_global = productos;

			if(productos.length > 0){
				var mensaje_ctr = '('+ productos.length +')';
				res.render('ver_pedidos', {title: 'Lista de pedidos', pedidos: pedidos.data, contador: mensaje_ctr});

			} else{
				res.render('ver_pedidos', {title: 'Lista de pedidos', pedidos: pedidos.data});
			}
            
		});
   
    });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});
//GET -PRODUCTOS DE UN  PEDIDO
router.get('/pedidos/productos/:id', function(req, res, next) {
	var id = req.user.id;
	var id_pedido = req.params.id;
	request('http://localhost:8080/pedidos/productos/'+id_pedido, function(error, response, body) {
		var productos = JSON.parse(body);
		console.log("Respuesta por productos:"+productos.status);
		console.log('Cantidad de productos: '+productos.data.length);
        res.json({data: productos.data, status: 'successful'});
    });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});
//Crear Pedido
router.post('/pedido', function(req, res, next){
	console.log('en POST dashboard/pedido');
	console.log('req.body:', req.body);
	var id_usuario = req.user.id;
	var fecha = req.body.fecha;
	var detalle = req.body.detalle;
	var total = req.body.total;
	//Creamos el pedido en el servicio Pedidos
	request.post('http://localhost:8080/pedidos/').form({"id_usuario": id_usuario, "fecha": fecha, "detalle": detalle, "total": total}),
	function optionalCallback(err, httpResponse, body){
		if(err) {
			return console.error('Upload de pedido fallo: ', err);
		}
  	};
    
	
    res.redirect('/dashboard');
});
// FUNCTION postProductIntoPedido
function postProductIntoPedido(id, producto) {
	var id_producto = producto.id_producto;
	var total = producto.total;
	var cantidad = producto.cantidad;
	var nombre_producto = producto.nombre_producto;
	request.post('http://localhost:8080/pedidos/producto')
	.form({"id_producto": id_producto, "id_pedido":id,"total":total,
	"cantidad": cantidad,"nombre_producto":nombre_producto}),
	function(err, httpResponse, body){
		return httpResponse;
	};
};
// GET - /PEDIDO/DELETE/:id
router.get('/pedido/delete/:id', function(req, res, next){
	var id = req.params.id;
	request.delete('http://localhost:8080/pedidos/'+id,
		function optionalCallback(err, httpResponse, body){
			if (err) {
				return console.error('Delete failed:', err);
  		}
			console.log('Delete successful!  Server responded with:', body);
			res.redirect('/dashboard/pedidos');
		});
});
//GET - /PEDIDO/EDIT/:id
router.get('/pedido/edit/:id', function(req, res, next) {
	var id = req.params.id;
	request('http://localhost:8080/pedidos/'+id, function(error, response, body) {
		var pedido = JSON.parse(body);
		res.render('edit_pedido', {pedido: pedido.data});
  });
});
// POST - /PEDIDO/UPDATE
router.post('/pedido/update', function(req, res, next) {
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
	res.redirect('/dashboard/pedidos');
});
//POST - CREAR PEDIDO
router.post('/crearPedido', function(req, res, next) {
	var total = req.body.total;
	var id_cliente = req.body.id_cliente;
	var cliente = req.body.cliente;
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;
	request.post('http://localhost:8080/pedidos/').form({"total":total, "detalle":detalle,
	"fecha" :fecha, "ID_CLIENTE" : id_cliente, "nombre_cliente" : cliente}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/dashboard/pedidos');
});
module.exports = router;
