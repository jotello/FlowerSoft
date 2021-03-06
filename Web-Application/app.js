 var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var dashRouter = require('./routes/dashboard');
var adminRouter = require('./routes/admin');
const seschk = require('./session_checker');

var app = express();

global.wat = null;
global.rol = null;
global.id = null;
global.leader = true;

global.catalogoLeader = "http://localhost:8080/catalogo/"
global.catalogoFollower = "http://localhost:8080/replicaCatalogo/"

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dashboard', seschk.checkLogged);
app.use('/admin', seschk.checkAdmin);
app.use('/admin', seschk.checkService);
app.use('/', indexRouter.router);
app.use('/dashboard', dashRouter);
app.use('/admin', adminRouter);

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
