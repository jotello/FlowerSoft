var express = require('express');
var router = express.Router();
var amqp = require('amqplib/callback_api');


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});
var tarea = require('../new_task');

//catalogo
//router.get('/api/insert_product', tarea.insert);
//router.get('/api/update_product', tarea.update);
//router.get('/api/delete_product', tarea.delete);

//carrito
//router.get('/api/insert_carro',tarea.insert_carro);
//router.get('/api/update_carro',tarea.update_carro);
//router.get('/api/delete_carro',tarea.delete_carro);
//router.get('/api/vaciar_carro',tarea.vaciar_carro);

//usuario
router.post('/api/data_user',tarea.new_user);

module.exports = router;
