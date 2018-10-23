const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const mongo = require('mongodb');
const morgan = require('morgan');



// CONNECTING TO DB
mongoose.connect('mongodb://localhost/users-service-db', { useNewUrlParser: true })
    .then(db => console.log('Db connected'))
    .catch(err => console.log(err));

const db = mongoose.connection;

//PASSPORT
//require('./config/passport')(passport);
const LocalStrategy = require('passport-local').Strategy;

// IMPORTING ROUTES
const indexRoutes = require(path.join(path.join(__dirname, 'routes'), 'index'));
const usersRoutes = require(path.join(path.join(__dirname, 'routes'), 'users'));

//INITIALIZANDO LA APP
const app = express();


// SETTINGS

//View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

//PORT
app.set('port', 3003);

// MIDDLEWARES

//Morgan
app.use(morgan('dev'));

//Express
app.use(express.urlencoded({ extended: false }));

//Body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Cookie-parser
app.use(cookieParser());

//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

//Express Validator
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Flash
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Passport
app.use(passport.initialize());
app.use(passport.session());


// ROUTES
app.use('/', indexRoutes);
app.use('/index', indexRoutes);
app.use('/users', usersRoutes);



// STARTING THE SERVER
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});


