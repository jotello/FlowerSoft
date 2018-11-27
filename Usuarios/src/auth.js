const path = require('path');
const Joi = require('joi');
const fs = require('fs');
const express = require('express');
const router = express.Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require(path.join(__dirname, 'db'));

const privateKey = fs.readFileSync(path.join(__dirname, 'private.key'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, 'public.key'), 'utf8');

const jwt = require('jsonwebtoken');

const _expTime = "30m";
const _algorithm = "RS256";

router.post('/sign', (req, res) => {
    console.log('payload:', req.body.payload);
    console.log('REQ:', req);
    const options = JSON.parse(req.body.options);
    const payload = JSON.parse(req.body.payload);
    const signOptions = {
        issuer: options.issuer,
        subject: options.subject,
        audience: options.audience,
        expiresIn: _expTime,
        algorithm: _algorithm
    };
    const token = jwt.sign(payload, privateKey, signOptions);
    console.log('el nuevo token decodificado:', jwt.decode(token, {complete: true}));
    return res.status(200).send(token);
});

router.post('/check_credentials', (req, res) => {
    console.log('en check credentials');
    const ver_res = verifyTokenPresence(req, res);
    if(ver_res === null){
        return res.status(403).send('no token');
    }
    const token = req.token.split(' ')[1];
    console.log('req.token:', req.token);
    console.log('token:', token);
    console.log('splitted token:', req.token.split('.'));
    const splittedToken = req.token.split('.');
    if(splittedToken.length !== 3) {
        return res.status(403).send('invalid token');
    }
    console.log('a decodificar');
    decodedJWT = jwt.decode(req.token, {complete: true});
    console.log('decodificado:', decodedJWT);
    const verOptions = {
        issuer: decodedJWT.payload.iss,
        subject: decodedJWT.payload.sub,
        audience: decodedJWT.payload.aud,
        expiresIn: decodedJWT.payload.exp,
        algorithm: decodedJWT.header.alg
    };
    console.log('verOptions:', verOptions);
    const ver_token_res = verifyToken(req.token, verOptions);
    console.log('ver_token_res:', ver_token_res);
    if(ver_token_res === false) {
        return res.status(403).send({
            message:'forbidden',
        });
    }
    return res.status(200).send(ver_token_res);
});

router.get('/key', (req, res)=> {
    return publicKey;
});

function sign(payload, options) {
    const signOptions = {
        issuer: options.issuer,
        subject: options.subject,
        audience: options.audience,
        expiresIn: _expTime,
        algorithm: _algorithm
    };
    return jwt.sign(payload, privateKey, signOptions);
}

function verifyTokenPresence (req, res) {
    console.log('En verify token presence');
    const bearerHeader = req.headers['authorization'];
    console.log(req.headers);
    console.log(req.headers['authorization']);
    //Check if bearer is undefined
    if(bearerHeader === null || typeof bearerHeader === 'undefined') {
        return null;
    }
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    console.log('verify presence token:', req.token);
    return true;
};

function verifyToken(token, options){
    console.log('verifying token itself');
    try{
        return jwt.verify(token, publicKey, options);
    } catch (err) {
        return false;
    }
}
function decode(token){
    return jwt.decode(token, {compete: true});
}

module.exports.router = router;
