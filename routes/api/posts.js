const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// POST model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
// Validation
const validatePostInput = require('../../validation/post');

// @route       GET api/posts
// @desc        get all posts
// @access      Public Route
router.get('/', (req, res) => {
    Post.find()
    .sort({date: -1})
    .then( posts => res.json(posts) )
    .catch(() => res.status(404).json( {nopostsfound: 'No Posts Found'}));
})

// @route       GET api/posts/:id
// @desc        get post by id
// @access      Public Route
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(() => res.status(404).json({nopostfound: 'No Post Found'}));
})

// @route       POST api/posts
// @desc        create post
// @access      Private Route
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
    const{errors, isValid} = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));
})

// @route       POST api/posts/like/:id
// @desc        Like post by id
// @access      Private Route
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                return res.status(400).json({ alreadyliked: 'User has already liked this post'});
            }
            // Add user id to likes
            post.likes.unshift({user: req.user.id});

            //Save
            post.save().then(post => res.json(post));
        })
        .catch(() => res.status(404).json({ postnotfound: 'post not found'}));
    })
})

// @route       POST api/posts/unlike/:id
// @desc        Unlike post by id
// @access      Private Route
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0) {
                return res.status(400).json({ notliked: 'User has not liked this post'});
            }
            // Add user id to likes
            const removeIndex = 
                post.likes
                .map(item => item.user.toString())
                .indexOf(req.user.id);

            // Remove the like
            post.likes.splice(removeIndex, 1);
            //Save
            post.save().then(post => res.json(post));
        })
        .catch(() => res.status(404).json({ postnotfound: 'post not found'}));
    })
})

// @route       DELETE api/posts/:id
// @desc        delete post by id
// @access      Private Route
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
    .then(profile => {
        Post.findById(req.params.id)
        .then(post => {
            if(req.user.id !== post.user.toString())
                return res.status(401).json({ notauthorized: 'Not Authorized'});
            post.remove().then(() => res.json( { success: true}));
        })
        .catch(() => res.json( {nopostfound: 'No Post Found'}));
    })
})

// @route       POST api/posts/comment/:id
// @desc        Add comment to post
// @access      Private Route
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const{errors, isValid} = validatePostInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
    .then(post => {
        const newComment = {
            text: req.body.text,
            name: req.body.name,
            avatar: req.body.avatar,
            user: req.user.id
        }
        // Add comment to post
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
    })
    .catch(() => res.status(404).json( { postnotfound: 'No post found' }));
})

// @route       DELETE api/posts/comment/:id/:comment_id
// @desc        Add comment to post
// @access      Private Route
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.id)
    .then(post => {
        if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
            return res.status(404).json( { commentdoesnotexist: 'Comment does not exist'});
        }
        const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
        
        post.comments.splice(removeIndex, 1);

        post.save().then(post => res.json(post));
    })
    .catch(() => res.json( { postnotfound: 'No post found' }));
})

module.exports = router;