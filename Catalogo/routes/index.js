var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


var db = require('../queries');

//Catalogo
router.get('/api/catalogo', db.catalogo);
router.get('/api/catalogo/:id', db.selectCatalogo);
router.post('/api/catalogo', db.insertCatalogo);
router.put('/api/catalogo/:id', db.updateCatalogo);
router.delete('/api/catalogo/:id', db.deleteCatalogo);
//Usuario
//Carrito
router.get('/api/catalogo/carrito/:id', db.selectCarrito);
router.post('/api/catalogo/carrito/:id', db.insertCarrito);
router.put('/api/catalogo/carrito/:id', db.updateCarrito);
router.delete('/api/catalogo/carrito/:id', db.deleteCarrito);
router.delete('/api/catalogo/carrito', db.vaciarCarrito);

module.exports = router;
