var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var db = require('../queries');


router.get('/api/pedidos', db.getAllPedidos);
router.get('/api/pedidos/:id', db.getSinglePedido);
router.post('/api/pedidos', db.createPedido);
router.put('/api/pedidos/:id', db.updatePedido);
router.delete('/api/pedidos/:id', db.removePedido);


module.exports = router;
