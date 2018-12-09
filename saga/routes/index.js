var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
var tarea = require('../new_task');

//catalogo
router.get('/api/insert_product', console.log(tarea.insert(req.body.nombre)));
router.get('/api/update_product', console.log(tarea.update(req.body.nombre)));
router.get('/api/delete_product', console.log(tarea.delete(req.body.id)));

//carrito
router.get('/api/insert_carro',console.log(tarea.insert_carro(req.body.id_producto, req.body.nombre_producto)));
router.get('/api/update_carro',console.log(tarea.update_carro(req.body.nombre, req.body.id_producto)));
router.get('/api/delete_carro',console.log(tarea.delete_carro(req.body.id_producto, req.body.id_usuario)));
router.get('/api/vaciar_carro',console.log(tarea.vaciar_carro(req.body.id_usuario)));

//usuario

module.exports = router;
