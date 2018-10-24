var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var db = require('../queries');


router.get('/api/catalogo/:id', db.selectCatalogo);
router.post('/api/catalogo', db.insertCatalogo);
router.put('/api/catalogo/:id', db.updateCatalogo);
router.delete('/api/catalogo/:id', db.deleteCatalogo);

module.exports = router;
