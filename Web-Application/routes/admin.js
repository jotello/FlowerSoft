var express = require('express');
var router = express.Router();
var request = require('request');

var jwt = require('jsonwebtoken');

var check = require('./index');


router.get('/', function(req, res, next){
	console.log('en admin get /');
	if(global.wat === null) {
		res.redirect('/');
	}
	const bearerToken = global.wat;
	request.get('http://localhost:8080/users/auth/check_credentials', {
		'auth': {
		  'bearer': bearerToken
		}
	  },
	  (err, response, body) => {
		if (err)
		{
		  console.log('err:', err);
		  error = {status: 500};
		  return res.render('error', {message:'an error', error:error});
		}
		console.log('body:', body);
		const verifyJWT = JSON.parse(body);
		console.log('user:', verifyJWT);
		console.log('global.wat:', global.wat);

		if(verifyJWT.data === false) {
			return res.redirect('/');
		}

		if(verifyJWT.data.rol !== 'admin') {
			return res.redirect('/');
		}

		request('http://localhost:8080/pedidos/', function(error, response, body) {
			var pedidos = JSON.parse(body);
			return res.render('admin/dash', {title: 'Lista de pedidos', pedidos: pedidos.data});
		});
	  });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});

router.get('/admin', function(req, res, next){
	console.log('en admin get /');
	if(global.wat === null) {
		res.redirect('/');
	}
	const bearerToken = global.wat;
	request.get('http://localhost:8080/users/auth/check_credentials', {
		'auth': {
		  'bearer': bearerToken
		}
	  },
	  (err, response, body) => {
		if (err)
		{
		  console.log('err:', err);
		  error = {status: 500};
		  return res.render('error', {message:'an error', error:error});
		}
		console.log('body:', body);
		const verifyJWT = JSON.parse(body);
		console.log('user:', verifyJWT);
		console.log('global.wat:', global.wat);

		if(verifyJWT.data === false) {
			return res.redirect('/');
		}

		if(verifyJWT.data.rol !== 'admin') {
			return res.redirect('/');
		}

		return res.redirect('/admin');
	  });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});

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
	console.log('en admin get /');
	if(global.wat === null) {
		res.redirect('/');
	}
	const bearerToken = global.wat;
	request.get('http://localhost:8080/users/auth/check_credentials', {
		'auth': {
		  'bearer': bearerToken
		}
	  },
	  (err, response, body) => {
		if (err)
		{
		  console.log('err:', err);
		  error = {status: 500};
		  return res.render('error', {message:'an error', error:error});
		}
		console.log('body:', body);
		const verifyJWT = JSON.parse(body);
		console.log('user:', verifyJWT);
		console.log('global.wat:', global.wat);

		res.render('admin/crear_pedido', {title: 'Crear Pedido'});
	  });
});

router.get('/crear/producto', function(req, res, next) {
  res.render('admin/crear_producto', { title: 'Crear Producto' });
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
