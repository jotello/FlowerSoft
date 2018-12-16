const express = require('express');
const router = express.Router();
const request = require('request');

router.get('/', function(req, res, next) {
	console.log('EN ADMIN /');
	console.log("user id:", req.user.id);
	request('http://localhost:8080/pedidos/', function(error, response, body) {
		console.log('pedidos body:', body);
		var pedidos = {data:{}};
		if(!body){
			pedidos = JSON.parse(body);
		}
		console.log('pedidos:', pedidos);
		return res.render('admin/dash', {title: 'Lista de pedidos', pedidos: pedidos.data});
	});
});
/// ADMIN
router.get('/admin', function(req, res, next) {
		return res.redirect('/admin');
});
//PEDIDOS
// GET - CREAR/PEDIDO
router.get('/crear/pedido', function(req, res, next) {
	request('http://localhost:8080/pedidos/usuarios', function(error, response, body) {
		var usuarios = JSON.parse(body);
	  res.render('admin/crear_pedido', {title: 'Crear Pedido', usuarios: usuarios.data});
	});
});
// POST - CREAR/PEDIDO
router.post('/crearPedido', function(req, res, next) {
	console.log('En POST /admin/crearPedido');
	console.log('req.body:', req.body);
	var total = req.body.total;
	var id_cliente = req.body.id_cliente;
	var cliente = req.body.cliente;
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;
	console.log('a solicitar POST localhost:8080/pedidos/');
	request.post('http://localhost:8080/pedidos/').form({"total":total, "detalle":detalle,
	"fecha" :fecha, "ID_CLIENTE" : id_cliente, "nombre_cliente" : cliente}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/admin');
});
// POST - /UPDATE/PEDIDO
router.post('/update/pedido', function(req, res, next) {
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
//PRODUCTOS
// GET - PRODUCTOS
router.get('/productos', function(req, res, next) {
	request('http://localhost:8080/catalogo/', function(error, response, body) {
		let catalogo = (body)? JSON.parse(body) : {data:{}};
		res.render('admin/productos', {title: 'Catalogo de Productos', catalogo: catalogo.data});
		console.log(catalogo.data);
	});
});
// GET - CREAR/PRODUCTO
router.get('/crear/producto', function(req, res, next) {
		console.log('rendering admin/crear_producto');
		return res.render('admin/crear_producto', { title: 'Crear Producto' });
});
// POST - CREAR PRODUCTO
router.post('/crearProducto', function(req, res, next){
	console.log('En POST /admin/crearProducto');
	console.log('req.body:', req.body);
	var tipo = req.body.tipo;
	var nombre = req.body.nombre;
	var precio = req.body.precio;
	var descrip = req.body.descrip;
	var imagen = req.body.imagen;
	request.post('http://localhost:8080/catalogo/').form({"tipo":tipo, "nombre":nombre,
	"descripcion": descrip, "imagen": imagen, "precio" :precio}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/admin/productos');
});
// GET - PRODUCTO/EDIT/:ID
router.get('/producto/edit/:id', function(req, res, next) {
	console.log('en GET Producto edit');
	const id = req.params.id;
	console.log('id:', id);
	request('http://localhost:8080/catalogo/'+id, function(error, response, body) {
		console.log('de vuelta con prouctos');
		if(error){
			return res.send({
				message: 'Error en producto edit',
				data: null
			});
		}
		var producto = JSON.parse(body);
		console.log('producto:', producto);
		console.log('producto.data:', producto.data);
    	return res.render('admin/edit_producto', {title: 'Editar Producto', producto: producto.data});
    });
});
// POST - PRODUCTO/EDIT/:ID
router.post('/producto/edit/:id', (req, res, next) => {
	console.log('EN EDIT PRODUCT ' + req.params.id);
	request.put('http://localhost:8080/catalogo/'+req.params.id).form({"nombre": req.body.nombre, "precio": req.body.precio}),
	function optionalCallback(err, httpResponse, body){
		if (err) {
			return console.error('edition failed:', err);
		}
		console.log('success in edit');
	}
	res.redirect('/admin/productos');
});

module.exports = router;