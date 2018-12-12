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
			return res.render('error', {error: 'Bad gateway en\nhttp://localhost:8080/catalogo/'});
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
router.get('/pedidos', function(req, res, next){
	var id = req.user.id;
	request('http://localhost:8080/pedidos/usuario/'+id, function(error, response, body) {
		var pedidos = JSON.parse(body);
        res.render('ver_pedidos', {title: 'Lista de pedidos', pedidos: pedidos.data});
    });
	//res.render('inicio', {title: 'Inicio', pedidos: array.data});
});
//POST PEDIDO
router.post('/pedido', function(req, res, next){
	var id_usuario = req.user.id;
	var fecha = req.body.fecha;
	var detalle = req.body.detalle;
	var total = req.body.total;

	request.post('http://localhost:8080/pedidos/').form({"id_usuario": id_usuario, "fecha": fecha, "detalle": detalle, "total": total}),
	function optionalCallback(err, httpResponse, body){
		if(err) {
			return console.error('Upload de pedido fallo: ', err);
		}

    };
    request.post('http://localhost:8080/pedidos/carrito/'+id_usuario).form(productos_global),
    function optionalCallback(err, httpResponse, body){
    	if(err){
    		return console.error('Fallo envio de carrito: ', err);
    	}
    };
	request('http://localhost:8080/catalogo/vaciar/carrito').form({"id_usuario": id_usuario}),
      function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('No se pudo vaciar el carrito:', err);
        }
        console.log('Se pudo vaciar el carrio! Server respondio :', body);
    };
    res.redirect('/dashboard');
});
// FUNCTION postProductIntoPedido
function postProductIntoPedido(id, producto){
	var id_producto = producto.id_producto;
	var total = producto.total;
	var cantidad = producto.cantidad;
	var nombre_producto = producto.nombre_producto;
	request.post('http://localhost:8080/pedidos/producto')
	.form({"id_producto": id_producto, "id_pedido":id,"total":total, "cantidad": cantidad,"nombre_producto":nombre_producto}),
	function(err, httpResponse, body){
		return httpResponse;
	};
}

router.get('/pedido/delete/:id', function(req, res, next){
	var id = req.params.id;
	request.delete('http://localhost:8080/pedidos/'+id,
		function optionalCallback(err, httpResponse, body){
			if (err) {
    		return console.error('Delete failed:', err);
  			}
  			console.log('Delete successful!  Server responded with:', body);
  			res.redirect('/dashboard/pedidos');
		}
	);
	res.redirect('/dashboard/pedidos');
});
//GET - /PEDIDO/EDIT/:id

router.get('/pedido/edit/:id', function(req, res, next){
	var id = req.params.id;
	request('http://localhost:8080/pedidos/'+id, function(error, response, body) {
		var pedido = JSON.parse(body);
        res.render('edit_pedido', {pedido: pedido.data});
    });
});
// POST - /PEDIDO/UPDATE
router.post('/pedido/update', function(req, res, next){
	var id = req.body.id;
	var detalle = req.body.detalle;
	var fecha = req.body.fecha;

	request.put('http://localhost:8080/pedidos/'+id).form({"detalle":detalle, "fecha" :fecha}),
	function optionalCallback(err, httpResponse, body) {
  		if (err) {
    		return console.error('upload failed:', err);
  		}
  		console.log('Upload successful!  Server responded with:', body);
  		res.redirect('/dashboard/pedidos');
	};
	
});
// GET - CREAR PEDIDO
router.get('/crearPedido', function(req, res, next) {
  res.render('crear_pedido', { title: 'Crear Pedido' });
});
//POST - CREAR PEDIDO
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
