var promise = require('bluebird');
var request = require('request');

var options = {
  // Initialization Options
  promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = 'postgres://jose@localhost:5432/pedidos';
var password = '1234'
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
  createUsuario: createUsuario,
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
  var ID_CLIENTE = parseInt(req.body.id_usuario);
   var total = parseInt(req.body.total);
  var detalle = String(req.body.detalle);
  var fecha = String(req.body.fecha);
  console.log(total+' '+ detalle + ' '+ fecha);
  //Consulta para obtener el nombre del cliente
  db.one('select nombre from usuario where id = $1 ', ID_CLIENTE)
    .then(function (data) {
      var nombre_cliente = data.nombre;

      //Creando el pedido
      db.none('insert into pedido(total, detalle, fecha_entrega, id_cliente, nombre_cliente)' +
          'values($1, $2, $3, $4, $5)', [total, detalle, fecha, ID_CLIENTE, nombre_cliente])
        .then(function () {
          console.log('Se creo un pedido');
          res.status(200)
            .json({
              status: 'success',
              message: 'Inserted one pedido'
            });
          //Obteniendo el id del pedido recien creado
          db.one('SELECT id FROM  pedido ORDER BY id DESC LIMIT 1')
            .then(function(data) {
              var id_pedido = data.id;
              console.log(id_pedido);
              //Relacionando el pedido con el cliente
              db.none('insert into pedidoxusuario(id_pedido, id_usuario)' + 'values($1, $2)', [id_pedido, ID_CLIENTE])
                .then(function() {
                  res.status(200)
                  .json({
                    status: 'success',
                    message : 'Inserted relation between usuario and pedido'
                  });
                  //Finalmente relacionamos los productos al pedido y vaciamos el carrito del usuario
                  request('http://localhost:8080/catalogo/carrito/'+ID_CLIENTE, function(err, resp, bod){
                      var productos = JSON.parse(bod).data;

                      if(productos.length > 0){
                        for(i = 0; i < (productos.length -1); i++){
                          var id_producto = productos[i].id_producto;
                          var nombre_producto = productos[i].nombre_producto;
                          var cantidad = productos[i].cantidad;
                          var total = productos[i].total;

                          db.none('insert into pedidoxproducto(id_pedido, id_producto, total, cantidad, nombre_producto)' + 
                            'values($1, $2, $3, $4, $5)', [id_pedido, id_producto, total, cantidad, nombre_producto])
                            .then(function(){
                              res.status(200)
                            })
                            .catch( function(err){
                              return next(err);
                            });
                        }
                      } else{
                        //Entonces el carrito esta vacio
                      }     
                      
    });

  request.delete('http://localhost:8080/catalogo/carrito').form({"id_usuario": ID_CLIENTE}),
  function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('No se pudo vaciar el carrito:', err);
      }
      console.log('Se pudo vaciar el carrio! Server respondio :', body);
  };
                })
                .catch(function(err) {
                  return next(err);
                });
            })
            .catch(function(err) {
              var id_pedido = '';
              return next(err);
            })
        })
        .catch(function (err) {
          console.log(err);
          return next(err);
        });
    })
    .catch(function(err) {
      var nombre_cliente = '';
      return next(err);
    });

 
  
  
 
  


}

function createUsuario(req, res, next) {
  console.log('creando pedidos/usuario');
  console.log("req.body:", req.body);
  db.none('INSERT INTO Usuario (ID, rut, nombre, apellido, rol, email, password)' +
      ' VALUES (${id}, ${rut}, ${nombre}, ${apellido}, ${rol}, ${email}, ${password})',
      req.body)
      .then(function () {
        res.status(200)
        .json({
          status: 'success',
          message: 'Inserted one usuario'
        });
        console.log('Aparentemente creado pedidos/usuario');
      })
      .catch(function (err) {
        console.log("error:", err);
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
