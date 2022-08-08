var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var passport = require('passport');
require("dotenv").config({path: '../.env'});

const { body, validationResult } = require('express-validator');

var Post = require("../models/post");
var Comment = require("../models/comment");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post("/login", (req, res, next) => {

  let { username, password } = req.body;
  if (username === process.env.appuser) {
      if (password === process.env.password) {
          const opts = {}
          opts.expiresIn = 259200;
          const secret = process.env.key
          const token = jwt.sign({ username }, secret, opts);
          return res.status(200).json({
              message: "Authentication Passed",
              token
          })
      }
  }
  return res.status(401).json({ message: "Authentication Failed" })
});

router.get("/protected", passport.authenticate('jwt', { session: false }), (req, res) => {
  return res.status(200).send("Test successful");
})

router.post("/create", passport.authenticate('jwt', { session: false }), [
  
  body('title', 'Title is required').trim().isLength({ min: 1 }),
  body('content', 'Post content is required').trim().isLength({ min: 1 }),

  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array(), title: req.body.title, content: req.body.content, published: req.body.published });
    }

    var post = new Post({
      title: req.body.title,
      content: req.body.content,
      published: req.body.published
    }).save(function(err, npost) {
      if (err) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }
      return res.status(200).json({
        message: "Post created",
        npost
      });
    })
}])

router.get("/posts", passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.find({})
  .sort({createdAt : -1})
  .exec(function (err, posts) {
    if (err) { return next(err); }
    res.status(200).json(posts);
  })
})

router.get("/post/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id)
  .exec(function (err, post) {
    if (err) { return next(err); }
    if(post.published===true){
      Comment.find({post: req.params.id})
      .exec(function (err, comments) {
        if (err) { return next(err); }
        res.status(200).json({post, comments});
      });
    }
    else{
      res.status(200).json({post});
    }
  })
})

router.put("/post/:id", passport.authenticate('jwt', { session: false }), [
  
  body('title', 'Title is required').trim().isLength({ min: 1 }),
  body('content', 'Post content is required').trim().isLength({ min: 1 }),

  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array(), title: req.body.title, content: req.body.content, published: req.body.published });
    }

    var post = new Post({
      _id: req.params.id,
      title: req.body.title,
      content: req.body.content,
      published: req.body.published
    })

    Post.findByIdAndUpdate(req.params.id, post, {}, function (err,thepost) {
      if (err) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }
      return res.status(200).json({
        message: "Post updated",
        thepost
      });
    });
}])

router.delete("/post/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findByIdAndRemove(req.params.id, function deletePost(err) {
    if (err) { return res.status(500).send("Server Error"); }
    
    res.status(200).send("post deleted");
  })
})

router.delete("/post/:id/comment/:id", passport.authenticate('jwt', { session: false }), (req, res) => {
  Comment.findByIdAndRemove(req.params.id, function deleteComment(err) {
    if (err) { return res.status(500).send("Server Error"); }
    
    res.status(200).send("comment deleted");
  })
})

module.exports = router;
