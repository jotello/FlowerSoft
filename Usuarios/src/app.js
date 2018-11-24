const express = require('express');
const path = require('path');
const morgan = require('morgan');
const db = require(path.join(__dirname, 'db'));
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const mongoose = require('mongoose');

const MongoStore = require('connect-mongo')(session);

// CONNECTING TO DB
const dbconx = db.connectToUsersDatabase();

console.log()
// IMPORTING ROUTES
const usersRoutes = require(path.join(__dirname, 'users'));
const authRoutes = require(path.join(__dirname, 'auth'));

//INITIALIZANDO LA APP
const app = express();


// MIDDLEWARES

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



console.log('MONGOOSE CONECTION:', mongoose.connection);

//Express-session
app.use(session({
    secret: 'thesecret',
    saveUninitialized: false,
    resave: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));


//passport
app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.theUser = req.user || null;
    res.locals.theSession = req.session || null;
    next();
});

app.use((req, res, next) => {
    res.locals.userIsAuthenticated = req.isAuthenticated();
    next();
});

// ROUTES
app.use('/api/users', usersRoutes);
app.use('/api/auth', authRoutes.router);
//PORT
app.set('port', 3003);

// STARTING THE SERVER
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
