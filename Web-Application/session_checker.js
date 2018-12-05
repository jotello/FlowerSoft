const request = require('request');


module.exports.checkLogged = function(req, res, next) {
		console.log('CHECK_LOGGED');
		console.log('token:', global.wat);
		console.log('rol:', global.rol);
	if(global.wat === null || global.rol === null) {
		console.log('NO SESSION');
		return res.redirect('/');
  }
	const bearerToken = global.wat;
	request.get('http://localhost:8080/users/auth/check_credentials', {
			'auth': {
				'bearer': bearerToken
			}
	  },
	  (err, response, body) => {
		if (err) {
			console.log('ERROR IN CHECKLOGGED');
		  console.log('err:', err);
		  error = {status: 500};
		  return res.render('error', {message:'an error', error:error});
		}
		console.log('body:', body);
		const verifyJWT = JSON.parse(body).resp;
		console.log('verifyJWT:', verifyJWT);
		console.log('global.wat:', global.wat);
		if(verifyJWT.data === false) {
            console.log('NO SESSION');
			return res.redirect('/');
		}
		return next();
	  });
}

module.exports.checkAdmin = function (req, res, next) {
    console.log('CHECK_ADMIN');
	if(global.wat === null || global.rol === null || global.rol !== "admin") {
        console.log('NO SESSION NOR ADMIN');
		return res.redirect('/');
    }
	const bearerToken = global.wat;
	request.get('http://localhost:8080/users/auth/check_credentials', {
		'auth': {
		  'bearer': bearerToken
		}
	  },
	  (err, response, body) => {
		if (err) {
		  console.log('err:', err);
		  error = {status: 500};
		  return res.render('error', {message:'an error', error:error});
		}
		console.log('body:', body);
		const verifyJWT = JSON.parse(body).resp;
		console.log('verifyJWT:', verifyJWT);
		console.log('global.wat:', global.wat);
		if(verifyJWT.data === false) {
            console.log('NOT ALLOWED');
			return res.redirect('/');
		}
		if(verifyJWT.data.rol !== 'admin') {
			return res.redirect('/');
		}
		return next();
	  });
}