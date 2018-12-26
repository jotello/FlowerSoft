var mysql = require('mysql');
//var amqp = require('amqplib/callback_api');
//var tarea = require('./new_task');
const request = require('request');


var connection = mysql.createConnection({
   host: '127.0.0.1',
   user: 'root',
   password: '',
   database: 'mysql',
});
connection.connect(function(error){
   if(error){
      throw error;
   }else{
      console.log('Conexion correcta.');
   }
});

module.exports = {
  catalogo: catalogo,
  selectCatalogo: selectCatalogo,
  insertCatalogo: insertCatalogo,
  updateCatalogo: updateCatalogo,
  deleteCatalogo: deleteCatalogo,
  insertCarrito: insertCarrito,
  deleteCarrito: deleteCarrito,
  updateCarrito: updateCarrito,
  vaciarCarrito: vaciarCarrito,
  selectCarrito: selectCarrito,
  createUsuario: createUsuario,
  incorporarDatos: incorporarDatos
};

//Catalogo

function catalogo(req, res, next) {
var query = connection.query('SELECT * FROM catalogo', function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 }
);
}

function insertCatalogo(req, res, next) {
  console.log('INSERTANDO CATALOGO');
  console.log('req.body:', req.body);
var query = connection.query('INSERT INTO catalogo(nombre, tipo, descripcion, imagen, precio) VALUES(?, ?, ?, ?, ?)',
   [req.body.nombre, req.body.tipo, req.body.descripcion, req.body.imagen, req.body.precio],
   function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      
      request.post('http://localhost:8080/replicaCatalogo/').form({"nombre" : req.body.nombre,
		"tipo": req.body.tipo, "descripcion" :req.body.descripcion, "imagen":req.body.imagen, "precio":req.body.precio}),
	   function optionalCallback(err, httpResponse, body) {
  		   if (err) {
			   console.error('upload failed:', err);
			   return res.render('error', {title:'Error', message:'Error en replica insertar', error:err});
         }
         res.send(JSON.stringify({"status": 200, "error": null, "data": result}));	  
      }

      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 }
);
//console.log(tarea.insert(req.body.nombre));
}

function updateCatalogo(req, res, next) {
   console.log('en UPDATE Catalogo');
   console.log('param id:', req.params.id);
   console.log('body', req.body);
   var query = connection.query('UPDATE catalogo SET precio =? , nombre =? WHERE id = ?', [req.body.precio, req.body.nombre, parseInt(req.params.id)],
      function(error, result){
      if(error){
         throw error;
      }else{
         console.log(result);
         res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
      }
   }
);
//console.log(tarea.update(req.body.nombre));
}

function deleteCatalogo(req, res, next) {
   console.log('req.body.id:', req.body.id);
var query = connection.query('DELETE FROM catalogo WHERE id = ? ',[req.body.id],
 function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 }
);
//console.log(tarea.delete(req.body.id));
}

function selectCatalogo(req, res, next) {
var query = connection.query('SELECT * FROM catalogo WHERE id = ?', [parseInt(req.params.id)],
   function(error, result){
      if(error){
         throw error;
      }else{
         var resultado = result;
         if(resultado.length > 0){
            console.log(resultado[0].nombre + ' ' + resultado[0].tipo + ' / ' + resultado[0].precio);
            res.send(JSON.stringify({"status": 200, "data": resultado[0]}));
         }else{
            console.log('Registro no encontrado');
         }
      }
   }
);}


//Usuario
//Carrito

function insertCarrito(req, res, next) {
   //TODO: Checkear si el producto esta en el carrito, si es asi, añadir cantidad y total al registro
   var query = connection.query('INSERT INTO Carrito(id_usuario, id_producto, nombre_producto, cantidad, total) VALUES(?, ?, ?, ?, ?)',
   [req.params.id, req.body.id_producto, req.body.nombre_producto, req.body.cantidad, req.body.total],
   function(error, result) {
   if(error){
      throw error;
   }else{
      console.log(result);
      
      request.post('http://localhost:8080/replicaCatalogo/carrito/'+parseInt(req.params.id)).form({"id_producto" : parseInt(req.body.id_producto),
		"nombre_producto": req.body.nombre_producto, "cantidad" :parseInt(req.body.cantidad), "total" : parseInt(req.body.total)}),
	   function optionalCallback(err, httpResponse, body) {
  		   if (err) {
			   console.error('upload failed:', err);
			   return res.render('error', {title:'Error', message:'Error en replica carrito agregar', error:err});
         }
         res.send(JSON.stringify({"status": 200, "error": null, "data": result}));	  
      }
   }
 });
}

function updateCarrito(req, res, next) {
var query = connection.query('UPDATE Carrito SET cantidad =? , total =? WHERE id_producto = ? AND id_usuario = ?',
   [req.body.cantidad, req.body.total, parseInt(req.body.id_producto), parseInt(req.params.id)],
   function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      request.put('http://localhost:8080/replicaCatalogo/carrito/'+parseInt(req.params.id)).form({ "cantidad" :parseInt(req.body.cantidad), 
      "total" : parseInt(req.body.total),
      "id_producto" : parseInt(req.body.id_producto)}),
	   function optionalCallback(err, httpResponse, body) {
  		   if (err) {
			   console.error('update failed:', err);
			   return res.render('error', {title:'Error', message:'Error en replica carrito actualizar', error:err});
         }
         res.send(JSON.stringify({"status": 200, "error": null, "data": result}));	  
      }
   }
 }
);
//console.log(tarea.update(req.body.nombre));
}

function deleteCarrito(req, res, next) {
var query = connection.query('DELETE FROM Carrito WHERE id_producto = ? AND id_usuario= ? ',
   [parseInt(req.params.id), parseInt(req.body.id_usuario)],
 function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      request.delete('http://localhost:8080/replicaCatalogo/carrito/'+parseInt(req.params.id)).form(
         {"id_usuario":req.body.id_usuario}),
	   function optionalCallback(err, httpResponse, body) {
  		   if (err) {
			   console.error('upload failed:', err);
			   return res.render('error', {title:'Error', message:'Error en replica carrito agregar', error:err});
         }
         res.send(JSON.stringify({"status": 200, "error": null, "data": result}));	  
      }
   }
 }
);
//console.log(tarea.delete(req.body.id));
}

function vaciarCarrito(req, res, next) {
  console.log(req.body.id_usuario);
  var query = connection.query('DELETE FROM Carrito WHERE id_usuario= ? ',[parseInt(req.body.id_usuario)],
   function(error, result){
     if(error){
        throw error;
     }else{
        console.log(result);
        request.delete('http://localhost:8080/replicaCatalogo/vaciar/carrito').form(
         {"id_usuario":req.body.id_usuario}),
	      function optionalCallback(err, httpResponse, body) {
  		      if (err) {
			      console.error('upload failed:', err);
			      return res.render('error', {title:'Error', message:'Error en replica carrito agregar', error:err});
            }
            res.send(JSON.stringify({"status": 200, "error": null, "data": result}));	  
         }
     }
   });
}

function selectCarrito(req, res, next) {
var query = connection.query('SELECT * FROM Carrito WHERE id_usuario = ?', [parseInt(req.params.id)],
   function(error, result){
      if(error){
         throw error;
      }else{
         var resultado = result;
         res.send(JSON.stringify({"status": 200, "data": resultado}));

      }
   });
}

function createUsuario(req, res, next) {
  var query = connection.query('INSERT INTO Usuario(ID, rut, nombre, email, password) VALUES(?, ?, ?, ?, ?)',
   [req.body.id, req.body.rut, req.body.nombre, req.body.email, req.body.password],
   function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 });
}

function insertCatalogoNoRes(element) {
   console.log('inserting element:', element);
   const query = connection.query('INSERT INTO catalogo(id, tipo, nombre, descripcion, imagen, precio) VALUES(?, ?, ?, ?, ?, ?)',
   [element.id_catalogo, element.tipo, element.nombre, element.descripcion, element.imagen, element.precio],
   function(err, results) {
      if (err) {
         console.log('err:', err);
         throw err;
      }
      console.log('results:', results);
   });
}

function incorporarDatos(data, length) {
   console.log('Datos en incorporar:', data);
   for(let i = 0; i < length; i++) {
     if(data[i].tipo_query === 'insert') {
         insertCatalogoNoRes(data[i]);
     }
   }
}
