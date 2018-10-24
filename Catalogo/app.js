var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

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

function insertCatalogo(req, res, next) {
var query = connection.query('INSERT INTO catalogo(nombre, tipo, precio) VALUES(?, ?, ?)', ['rosas', 'flores', '1230'], function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
   }
 }
);
}

function updateCatalogo(req, res, next) {
var query = connection.query("UPDATE catalogo SET nombre = 'Margaritas' WHERE nombre = 'Canyon'", function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
   }
 }
);}

function deleteCatalogo(req, res, next) {
var query = connection.query('DELETE FROM catalogo WHERE id=1;', function(error, result){
   if(error){
      throw error;
   }else{
      console.log(result);
   }
 }
);}

function selectCatalogo(req, res, next) {
var query = connection.query('SELECT nombre, tipo, precio FROM catalogo WHERE id = ?', [1], function(error, result){
      if(error){
         throw error;
      }else{
         var resultado = result;
         if(resultado.length > 0){
            console.log(resultado[0].nombre + ' ' + resultado[0].tipo + ' / ' + resultado[0].precio);
         }else{
            console.log('Registro no encontrado');
         }
      }
   }
);}


connection.end();