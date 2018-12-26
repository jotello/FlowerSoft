const express = require('express');
const router = express.Router();
const request = require('request');

const badgateway = "Bad gateway.";

router.get('/', function(req, res, next) {
	console.log('EN ADMIN /');
	console.log("user id:", req.user.id);
	request('http://localhost:8080/pedidos/', function(error, response, body) {
		console.log('pedidos body:', body);

		var pedidos = (body)? JSON.parse(body) : {data:{}};
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
// POST - /UPDATE/PEDIDO - R
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
	console.log('req.currentService:', req.currentService);
	request(req.currentService, function(error, response, body) {
		if(body === badgateway) {
			if(global.leader) {
				global.leader = false;
				return res.redirect('/admin/productos');
			}
			else {
				return res.render('error', {title:'Error', message:'No hay servicio', error:{stack:{}}});
			}
		}
		let catalogo = (body)? JSON.parse(body) : {data:{}};
		res.render('admin/productos', {title: 'Catalogo de Productos', catalogo: catalogo.data});
		console.log(catalogo.data);
	});
});
//GET - PRODUCTO/:ID
router.get('/producto/detalles/:id', (req, res) => {
	console.log('req.currentService:', req.currentService);
	console.log('En detalles producto: id->', req.params.id);
	request(req.currentService + req.params.id, function(error, response, body) {
		console.log("body:", body);
		if (body === badgateway) {
			if(global.leader) {
				global.leader = false;
				return res.redirect('/admin/producto/detalles/' + req.params.id);
			} else {
				return res.render('error', {title:'Error', message:'No hay servicio', error:{stack:{}}});
			}
		}
		const producto = (body)? JSON.parse(body).data : null;
		if(!producto) {
			return res.render('error', {title: 'error', error: 'no existe el producto'});
		}
		console.log("Producto: ", producto);
		return res.render('admin/producto_detalles', {title: 'Detalles Producto: ' + producto.nombre, producto: producto});
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
	console.log('SERVICE:', req.currentService);
	var tipo = req.body.tipo;
	var nombre = req.body.nombre;
	var precio = req.body.precio;
	var descrip = req.body.descrip;
	var imagen = req.body.imagen;
	request.post(req.currentService).form({"tipo":tipo, "nombre":nombre,
	"descripcion": descrip, "imagen": imagen, "precio" :precio}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
			console.error('upload failed:', err);
			return res.render('error', {title:'Error', message:'error en crearProducto', error:err});
		}
		if (body === badgateway) {
			if(global.leader) {
				global.leader = false;
				request.post({url:global.catalogoFollower, form:{"tipo":tipo, "nombre":nombre, 
				"descripcion":descrip, "imagen":imagen, "precio":precio}},
				function optionalCallback(err, httpResponse, body) {
					if (err) {
						console.error('upload failed:', err);
						return res.render('error', {title:'Error', message:'error en crearProducto, 2do request', error:err});
					}
					console.log('Upload successful!  Server responded with:', body);
				});
			}
		}
  		console.log('Upload successful!  Server responded with:', body);
	};
	res.redirect('/admin/productos');
});
// GET - PRODUCTO/EDIT/:ID
router.get('/producto/edit/:id', function(req, res, next) {
	console.log('en GET Producto edit');
	console.log('SERVICE:', req.currentService);
	const id = req.params.id;
	console.log('id:', id);
	request(req.currentService + id, function(error, response, body) {
		console.log('de vuelta con prouctos');
		if(error){
			return res.render('error', {
				title: 'Error',
				message: 'Error en producto edit',
				error: error
			});
		}
		if(body === badgateway) {
			if(global.leader) {
				global.leader = false;
				return res.redirect('/admin/producto/edit/' + req.params.id);
			} else {
				return res.render('error', {title:'Error', message:'No hay servicio', error:{stack:{}}});
			}
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
	console.log('SERVICE:', req.currentService);
	request.put(req.currentService + req.params.id).form({"nombre": req.body.nombre, "precio": req.body.precio}),
	function optionalCallback(err, httpResponse, body){
		if (err) {
			console.error('edition failed:', err);
			return res.render('error', {title:'Error', message:'Error en producto edit', error:{stack:{}}});
		}

		if(body === badgateway) {
			if (global.leader) {
				global.leader = false;
				request.post({url:global.catalogoFollower + req.params.id, 
					form:{"nombre": req.body.nombre, "precio": req.body.precio}},
				function optionalCallback(error, response, body) {
					if (error) {
						return render('error', {title:'Error', message:'Error en producto edit', error:error});
					}
					console.log('success en edit:', body);
				});
			}
		} else {
			return res.render('error', {title:'Error', message:'No hay servicio', error:{stack:{}}});
		}
		console.log('success in edit');
	}
	res.redirect('/admin/productos');
});
// POST - PRODUCTO/DELETE/:ID
router.get('/delete/producto/:id', (req, res, next) => {
	console.log('EN GET PRODUCTO DELETE');
	console.log("id:", req.params.id);
	console.log('SERVICE:', req.currentService);
	request.delete(req.currentService + req.params.id).form({"id": req.params.id}),
		function optionalCallback(err, httpResponse, body) {
			if (err) {
				console.log('err:', err);
				return res.render('error', {message: 'error en delete de producto', error: err});
			}
			if(body === badgateway) {
				if (global.leader) {
					global.leader = false;
					res.redirect('/admin/delete/producto/' + req.params.id);
				} else {
					return res.render('error', {message: 'error en delete de producto', error: err});
				}
			}
			console.log('éxito: body:', body); 
		}
	res.redirect('/admin/productos');
});
//USUARIOS
// GET - USUARIOS
router.get('/usuarios', (req, res) => {
	console.log('EN GET USUARIOS');	
	console.log('token:', global.wat);
	request('http://localhost:8080/users/', {
		'auth': {
			'bearer': global.wat
		}
	}, 
	function(error, response, body) {
		console.log('usuarios body:', body);
		const usuarios = (body)? JSON.parse(body) : {data:{}};
		console.log('usuarios:', usuarios);
		return res.render('admin/usuarios', {title: 'Lista de usuarios', usuarios: usuarios.data});
	});
});
// DELETE - USUARIOS
router.get('/delete/usuario/:id', (req, res) => {
	console.log('EN DELETE USUARIO');
	request.delete('http://localhost:8080/users/'+req.params.id),
		(err, httpResponse, body) => {
			if(err) {
				console.log('err:', err);
				return res.render('error:', {message: 'error en delete de usuario', error: err});
			}
			console.log('éxito body:', body);
		}
	res.redirect('/admin/usuarios');
});
//POST - EDITAR PERFIL
router.post('/editarPerfil', (req, res) => {
	console.log('En Editar Perfil');
	console.log('req.body:', req.body);
	const b = req.body;
	const id = req.user.id;
	console.log('user:', req.user);
	console.log('req.user.id:', req.user.id);
	request.put('http://localhost:8080/users/'+id).form({
			rut: b.rut,
			names: b.names,
			family_name: b.family_name,
			email: b.email,
			rol: b.rol
		}),
		function optionalCallback(err, httpResponse, body) {
			console.log('de vuelta');
			if(err) {
				return res.render('error', {title:'error', 
					message:'error en editarPerfil, al volver', 
					error: err
				});
			}
			console.log('status:', httpResponse.statusCode);
			console.log('body:', body);
		}
	res.redirect('/profile');
});
//MODULE.EXPORTS
module.exports = router;