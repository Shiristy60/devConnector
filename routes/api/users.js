const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// @route       GET api/users/test
// @desc        tests users route
// @access      Public Route
router.get('/test', (req, res) => res.json({
    msg: 'Users Works'
}));

// @route       GET api/users/register
// @desc        register a user
// @access      Public Route
router.post('/register', (req, res) => {
    const {errors, isValid} = validateRegisterInput(req.body);
    if(!isValid)
        return res.status(400).json(errors);
    User.findOne({ email: req.body.email })
        .then(user => {
            if(user) {
                errors.email = 'Email already exists';
                return res.status(404).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', // size
                    r: 'pg', // rating
                    d: 'mm'  // default
                })
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });
                //hashing the password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => res.status(404).json(err));;
                    })
                })
            }
        });
})

// @route       GET api/users/login
// @desc        login a user/ returning a JWT token
// @access      Public Route
router.post('/login', (req, res) => {
    const {errors, isValid} = validateLoginInput(req.body);
    if(!isValid)
        return res.status(400).json(errors);

    const email = req.body.email;
    const password = req.body.password;

    // find the user by email
    User.findOne({email: email})
        .then(user => {
            // check for user
            if(!user) {
                errors.email = 'User not found';
                return res.status(404).json(errors);
            }
            // check password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // user matched
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        } // create jwt payload
                        //sign token
                        jwt.sign(
                            payload, 
                            keys.secretOrKey, 
                            {expiresIn: 3600}, 
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: 'Bearer ' + token
                                })
                        });
                    } else {
                        errors.password = 'Password incorrect';
                        return res.status(400).json(errors);
                    }
                })
        })
})

// @route       GET api/users/current
// @desc        return current user
// @access      Private Route
router.get('/current', passport.authenticate('jwt', { session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
})


module.exports = router;
