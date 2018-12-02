var promise = require('bluebird');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://jose@localhost:5432/pedidos';
var db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'pedidos',
    user: 'postgres',
    password: 'postgres'
});

// add query functions

module.exports = {
  getAllUsuarios: getAllUsuarios,
  getAllPedidos: getAllPedidos,
  getSinglePedido: getSinglePedido,
  createPedido: createPedido,
  updatePedido: updatePedido,
  removePedido: removePedido
};

function getAllUsuarios(req, res, next){
  db.any('select * from Usuario')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL Usuarios'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllPedidos(req, res, next) {
  db.any('select * from Pedido')
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ALL pedidos'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSinglePedido(req, res, next) {
  var pedID = parseInt(req.params.id);
  db.one('select * from pedido where id = $1', pedID)
    .then(function (data) {
      res.status(200)
        .json({
          status: 'success',
          data: data,
          message: 'Retrieved ONE pedido'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function createPedido(req, res, next) {
  db.none('insert into pedido(total, detalle, fecha_entrega, ID_CLIENTE, nombre_cliente)' +
      'values(${total}, ${detalle}, ${fecha}, ${ID_CLIENTE}, ${nombre_cliente})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one pedido'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function updatePedido(req, res, next) {
  db.none('update pedido set total=$1, detalle=$2, fecha_entrega=$3, nombre_cliente=$4 where id=$5',
    [req.body.total, req.body.detalle, req.body.fecha, req.body.cliente, parseInt(req.params.id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated pedido'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removePedido(req, res, next) {
  var pupID = parseInt(req.params.id);
  db.result('delete from pedido where id = $1', pupID)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: `Removed ${result.rowCount} pedido`
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}





