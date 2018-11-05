const path = require('path');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const User = require(path.join(__dirname, 'db'));

const notFoundMessage = 'User not found';
const badRequestMessage = 'invalid parameters';
const emailExistMessage = 'Email in use';

//POST
router.post('/', (req, res) => { 

    const { error }  = Joi.validate(req.body, User.joiSchema.post);

    if (error) { 
        return res.status(400).send({
            errors: error,
            message: badRequestMessage,
            data: {}
        });
    }

    User.findUserByEmail(req.body.email, (err, user) => { 
        if (err) throw err;
        
        console.log('user:', user);
        if(user) {
            console.log('user exist'); 
            return res.status(400).send({
                message: emailExistMessage,
                data: {}
            });
        }
        User.createUser(req.body, (err, user) => {
            if (err) {
                throw err;
            }
            //Success
            console.log('user', user);

            res.status(200).send(user);
        });

    });
});

//GET
router.get('/', (req, res) => { 
    User.findAllUsers((err, users) => { 
        if (err) throw err;

        //Success
        res.status(200).send(users);
    });
});

router.get('/:profile_name', (req, res) => { 
    User.findUserByProfileName(req.params.profile_name, (err, user) => { 
        if (err) throw err;

        if(!user) {
            return res.status(404).send(notFoundMessage);
        }
        res.status(200).send(user);
    });
});

//PUT
router.put('/:profile_name', (req, res) => {
    console.log('En put:', req.params.profile_name);    
    User.findUserByProfileName(req.params.profile_name, (err, user) => { 
        if (err) throw err;

        console.log('user:', user);
        if(!user) { 
            return res.status(404).send({
                message: notFoundMessage,
                data: {}
            });
        }

        const { error }= Joi.validate(req.body, User.joiSchema.put);
        if (error) { 
            return res.status(400).send({
                errors: error,
                message: badRequestMessage
            });
        }
        
        let emailChanged = false;
        if(req.body.email && req.body.email != user.email)  { 
            User.findUserByEmail(req.body.email, (err, user) => { 
                if (err) throw  err;

                if (user) { 
                    return res.status(400).send({
                        message: emailExistMessage,
                        data: {}
                    });
                }
            });
            emailChanged = true;
        }

        console.log('emailChanged', emailChanged);
        User.updateUserByProfileName(req.params.profile_name, req.body, emailChanged, (err, raw) => { 
            console.log('raw:', raw);
            if (err) throw err;

            const callback = (err, user) => {
                if (err) throw err;
    
                console.log('Sending the user');
                console.log(user);
                res.status(200).send(user);
            };
    
            if (emailChanged) {
                User.findUserByEmail (req.body.email, callback);
            }
            else {
                User.findUserByProfileName(req.params.profile_name, callback);
            }
        });
    });
});

//DELETE
router.delete('/:profile_name', (req, res) => { 
    User.deleteUserByEmail(req.params.profile_name, (err, user) =>{ 
        if(err) throw err;

        if (!user) {
            return res.status(404).send(notFoundMessage);
        }
        res.status(200).send(user);
    });
});

module.exports = router;