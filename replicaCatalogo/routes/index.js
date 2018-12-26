var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


var db = require('../queries');

//Catalogo
router.get('/api/replicaCatalogo', db.catalogo);
router.get('/api/replicaCatalogo/:id', db.selectCatalogo);
router.post('/api/replicaCatalogo', db.insertCatalogo);
router.put('/api/replicaCatalogo/:id', db.updateCatalogo);
router.delete('/api/replicaCatalogo/:id', db.deleteCatalogo);
//Usuario
router.post('/api/replicaCatalogo/carrito/usuarios', db.createUsuario);
//Carrito
router.get('/api/replicaCatalogo/carrito/:id', db.selectCarrito);
router.post('/api/replicaCatalogo/carrito/:id', db.insertCarrito);
router.put('/api/replicaCatalogo/carrito/:id', db.updateCarrito);
router.delete('/api/replicaCatalogo/carrito/:id', db.deleteCarrito);
router.get('/api/replicaCatalogo/vaciar/carrito', db.vaciarCarrito);

//
router.post('/dejarLiderazgo', (req, res, next) => {
  if (req.hostname !== 'localhost::3002') {
    return res.status(200).send({});
  }

  //traspasar todos los cambios al lider

});

module.exports = router;
