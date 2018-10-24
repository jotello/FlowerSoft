var express = require('express');
var router = express.Router();
const path = require('path');


const User = require(path.join(path.join('..', 'model'), 'user'));

router.get('/', function (req, res) {

	console.log(req.sAuthenticated);
	console.log(req.user);
	if(req.isAuthenticated())
	{
		id = req.user._id;
		res.redirect('/users/' + id);
	}
	else
	{
		res.redirect('/users/login');
	}
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;