const express = require('express');
const path = require('path');
const morgan = require('morgan');
const db = require(path.join(__dirname, 'db'));
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');


// CONNECTING TO DB
db.connectToUsersDatabase();
// IMPORTING ROUTES
const usersRoutes = require(path.join(__dirname, 'users'));

//INITIALIZANDO LA APP
const app = express();


// MIDDLEWARES

//Express-session
app.use(session({
    secret: 'thesecret',
    saveUninitialized: false,
    resave: false
}));

//Body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Cookie-parser
app.use(cookieParser());


//Express
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Morgan
app.use(morgan('dev'));

//Flash
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//passport
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use('/api/users', usersRoutes);
//PORT
app.set('port', 3003);

// STARTING THE SERVER
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
