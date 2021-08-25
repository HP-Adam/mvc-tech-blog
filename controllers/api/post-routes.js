// require packages
const router = require("express").Router();
const sequelize = require('../../config/connection');
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

// GET all posts
// include comments, user, 
router.get("/", (req, res) => {
    console.log("=====================");
    Post.findAll({
      //query configuration
      attributes: [
        "id",
        "title",
        "post_text",
        "created_at",
        ],
        order: [["created_at", "DESC"]],
        include: [
        {
          model: Comment,
          attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
          include: {
            model: User,
            attributes: ["username"],
          },
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    })
      .then((dbPostData) => res.json(dbPostData))
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// GET one post 
// include comments, user
router.get("/:id", (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id,
      },
      attributes: [
        "id",
        "title",
        "post_text",
        "created_at",
      ],
      include: [
        {
          model: Comment,
          attributes: ["id", "comment_text", "post_id", "user_id", "created_at"],
          include: {
            model: User,
            attributes: ["username"],
          },
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    })
      .then((dbPostData) => {
        if (!dbPostData) {
          res.status(404).json({ message: "No post found with this id" });
          return;
        }
        res.json(dbPostData);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// POST a post 
// only post if logged in
router.post("/", withAuth, (req, res) => {
    // expects {title: 'Yay!', post_text: "hello", user_id: 1}
    Post.create({
      title: req.body.title,
      post_text: req.body.post_text,
      user_id: req.session.user_id,
    })
      .then((dbPostData) => res.json(dbPostData))
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// PUT route to edit if logged in
// edit title and text of a post
router.put("/:id", withAuth, (req, res) => {
    Post.update(
      {
        title: req.body.title,
        post_text: req.body.post_text
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
      .then((dbPostData) => {
        if (!dbPostData) {
          res.status(404).json({ message: "No post found with this id" });
          return;
        }
        res.json(dbPostData);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

// DELETE route to delete a post if logged in
router.delete("/:id", withAuth, (req, res) => {
    Post.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((dbPostData) => {
        if (!dbPostData) {
          res.status(404).json({ message: "No post found with this id" });
          return;
        }
        res.json(dbPostData);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  });

module.exports = router;