const express = require('express');
const path = require('path');
const morgan = require('morgan');
const db = require(path.join(__dirname, 'db'));
const passport = require('passport');

// CONNECTING TO DB
db.connectToUsersDatabase();
// IMPORTING ROUTES
const usersRoutes = require(path.join(__dirname, 'users'));

//INITIALIZANDO LA APP
const app = express();

//passport
app.use(passport.initialize());
app.use(passport.session());

// MIDDLEWARES
//Express
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Morgan
app.use(morgan('dev'));

// ROUTES
app.use('/api/users', usersRoutes);
//PORT
app.set('port', 3003);

// STARTING THE SERVER
app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});
