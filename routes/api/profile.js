const express = require('express');
const router = express.Router();
const passport = require('passport');

// Import Profile Model
const Profile = require('../../models/Profile');
// Import User Model
const User = require('../../models/User');

const validateProfileInput = require('../../validation/profile')

// @route       GET api/profile
// @desc        gets current profile
// @access      Private Route
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const errors = {};
    Profile.findOne({user: req.user.id})
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})

// @route       POST api/profile
// @desc        create or update profile
// @access      Private Route
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    if(!isValid)
        return res.status(400).json(errors);
    const profileFields = {};
    profileFields.user = req.user.id;
    if(req.body.handle) profileFields.handle = req.body.handle;
    if(req.body.company) profileFields.company = req.body.company;
    if(req.body.website) profileFields.website = req.body.website;
    if(req.body.location) profileFields.location = req.body.location;
    if(req.body.bio) profileFields.bio = req.body.bio;
    if(req.body.status) profileFields.status = req.body.status;
    if(req.body.githubusername) profileFields.githubusername = req.body.githubusername;

    // Skills - Split into array
    if(typeof req.body.skills !== 'undefined') profileFields.skills = req.body.skills.split(',');
    profileFields.social = {};
    if(req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if(req.body.instagram) profileFields.social.instagram = req.body.instagram;
    if(req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if(req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if(req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;

    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(profile) {
                // Update the existing profile
                Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true}
                )
                .then(profile => res.json(profile));
            } else{
                // Create a new profile
                Profile.findOne({handle: profileFields.handle})
                    .then(profile => {
                        if(profile){
                            errors.handle = 'This handle already exists with some other user'; 
                            return res.status(400).json(errors);
                        }
                        new Profile(profileFields).save().then(profile => res.json(profile));
                    })
            }
        })  
})

// @route       GET api/profile/all
// @desc        find all profile
// @access      Public Route
router.get('/all', (req, res) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if(!profiles) {
                errors.noprofile = 'There are no profiles';
                return res.status(404).json(errors);
            }
            return res.json(profiles);
        })
        .catch(err => res.status(404). json({noprofiles: 'There are no profiles'}));
})

// @route       GET api/profile/handle/:handle
// @desc        find profile using handle
// @access      Public Route
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne( {handle: req.params.handle} )
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this handle.';
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})

// @route       GET api/profile/user/:user_id
// @desc        find profile using user_id
// @access      Public Route
router.get('/user/:user_id', (req, res) => {
    const errors = {};
    Profile.findOne( {user: req.params.user_id} )
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if(!profile) {
                errors.noprofile = 'There is no profile for this user.';
                return res.status(404).json(errors);
            }
            return res.json(profile);
        })
        .catch(err => res.status(404).json({profile: 'There is no profile for this user'}));
})

module.exports = router;