var express = require('express');
var router = express.Router();
var Post = require("../models/post");
var Comment = require("../models/comment");

const { body, validationResult } = require('express-validator');

router.get("/posts", (req, res) => {
  Post.find({published: true})
  .sort({createdAt : -1})
  .exec(function (err, posts) {
    if (err) { return next(err); }
    res.status(200).json(posts);
  })
})

router.get("/post/:id", (req, res) => {
  Post.findById(req.params.id)
  .exec(function (err, post) {
    if (err) { return next(err); }
    Comment.find({post: req.params.id})
    .exec(function (err, comments) {
      if (err) { return next(err); }
      res.status(200).json({post, comments});
    });
  })
})

router.post("/post/:id/comment", [
  
  body('email', 'email is required').trim().isLength({ min: 1 }),
  body('content', 'Comment content is required').trim().isLength({ min: 1 }),

  (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array(), email: req.body.email, content: req.body.content});
    }

    var comment = new Comment({
      content: req.body.content,
      email: req.body.email,
      post: req.params.id
    }).save(function(err, ncomment) {
      if (err) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }
      return res.status(200).json({
        message: "Comment posted",
        ncomment
      });
    })
}])

module.exports = router;
