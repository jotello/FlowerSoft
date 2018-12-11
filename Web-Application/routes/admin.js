var express = require('express');
var router = express.Router();
var request = require('request');

var jwt = require('jsonwebtoken');

var check = require('./index');


router.get('/', function(req, res, next){
	console.log("user id:", req.user.id);
	request('http://localhost:8080/pedidos/', function(error, response, body) {
		var pedidos = JSON.parse(body);
		return res.render('admin/dash', {title: 'Lista de pedidos', pedidos: pedidos.data});
	});
});

router.get('/admin', function(req, res, next){
		return res.redirect('/admin');
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});


//TO DO
router.get('/productos', function(req, res, next) {
	//Rosa debe poblar esta vista con los productos
	request('http://localhost:8080/catalogo/', function(error, response, body) {
		var catalogo = JSON.parse(body);
		res.render('admin/productos', {title: 'Catalogo de Productos', catalogo: catalogo.data});
		console.log(catalogo.data);
	});
  //res.render('dashboard', { title: 'Dashboard' });
});

router.get('/crear/pedido', function(req, res, next){
		request('http://localhost:8080/pedidos/usuarios', function(error, response, body) {
		var usuarios = JSON.parse(body);
        res.render('admin/crear_pedido', {title: 'Crear Pedido', usuarios: usuarios.data});
    	});
	  });
});

router.get('/crear/producto', function(req, res, next) {
		console.log('rendering admin/crear_producto');
		return res.render('admin/crear_producto', { title: 'Crear Producto' });
});

router.post('/crearProducto', function(req, res, next){
	var tipo = req.body.tipo;
	var nombre = req.body.nombre;
	var precio = req.body.precio;
	var descrip = req.body.descrip;
	var imagen = req.body.imagen;

	request.post('http://localhost:8080/catalogo/').form({"tipo":tipo, "nombre":nombre, "descripcion": descrip, "imagen": imagen, "precio" :precio}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/admin/productos');
});

router.get('/producto/delete/:id', function(req, res, next){
	var id = req.params.id;
	request.delete('http://localhost:8080/catalogo/'+id).form({"id" : id}),
		function optionalCallback(err, httpResponse, body){
			if (err) {
    		return console.error('Delete failed:', err);
  			}
  			console.log('Delete successful!  Server responded with:', body);
	};
	res.redirect('/admin/productos');
}); //Funcionando

router.get('/producto/edit/:id', function(req, res, next){
	var id = req.params.id;
	request('http://localhost:8080/catalogo/'+id, function(error, response, body) {
		var producto = JSON.parse(body);
        res.render('edit_producto', {producto: producto.data});
    });
});

//TO DO - RESULTADO - VISTAS
router.post('/crear/pedido', function(req, res, next){
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
	res.redirect('/admin');
});


//TO DO - RESULTADO - VISTAS
router.post('/update/pedido', function(req, res, next){
	var id = req.body.id;
	var tipo = req.body.tipo;
	var nombre = req.body.nombre;
	var precio = req.body.precio;

	request.put('http://localhost:8080/catalogo/'+id).form({"tipo" : tipo, "nombre":nombre, "precio" :precio}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/admin/pedidos');
});

module.exports = router;
