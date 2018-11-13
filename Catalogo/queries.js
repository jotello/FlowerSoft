var mysql = require('mysql');
var connection = mysql.createConnection({
   host: '127.0.0.1',
   user: 'root',
   password: '',
   database: 'mysql'
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
  deleteCatalogo: deleteCatalogo
};

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
var query = connection.query('INSERT INTO catalogo(nombre, tipo, precio) VALUES(?, ?, ?)', [req.body.nombre, req.body.tipo, req.body.precio], 
   function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 }
);
}

function updateCatalogo(req, res, next) {
var query = connection.query('UPDATE catalogo SET precio = ? WHERE nombre = ?', [req.body.precio, req.body.nombre], 
   function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 }
);}

function deleteCatalogo(req, res, next) {
var query = connection.query('DELETE FROM catalogo WHERE id = ? ',[req.body.id],
 function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
      res.send(JSON.stringify({"status": 200, "error": null, "data": result}));
   }
 }
);}

function selectCatalogo(req, res, next) {
var query = connection.query('SELECT nombre, tipo, precio FROM catalogo WHERE id = ?', [parseInt(req.params.id)], 
   function(error, result){
      if(error){
         throw error;
      }else{
         var resultado = result;
         if(resultado.length > 0){
            console.log(resultado[0].nombre + ' ' + resultado[0].tipo + ' / ' + resultado[0].precio);
            res.send(JSON.stringify({"status": 200, "error": null, "data": resultado[0].nombre + ' ' + resultado[0].tipo + ' / ' + resultado[0].precio}));
         }else{
            console.log('Registro no encontrado');
         }
      }
   }
);}


//connection.end();