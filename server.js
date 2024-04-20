// server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/blogDB', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Mongoose Schema
const postSchema = {
  title: String,
  content: String,
  author: String,
  date: { type: Date, default: Date.now },
  comments: [{ name: String, comment: String, date: { type: Date, default: Date.now }}]
};

const Post = mongoose.model('Post', postSchema);

// Routes
app.get('/', (req, res) => {
  Post.find({})
    .then(posts => {
      res.render('index', { posts: posts });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/posts/:postId', (req, res) => {
  const requestedPostId = req.params.postId;
  Post.findOne({ _id: requestedPostId })
    .then(post => {
      res.render('post', {
        title: post.title,
        content: post.content,
        author: post.author,
        date: post.date,
        comments: post.comments,
        _id: post._id
      });
    })
    .catch(err => {
      console.log(err);
      res.status(404).send('Post not found');
    });
});

app.post('/posts/:postId', (req, res) => {
  const requestedPostId = req.params.postId;
  const comment = { name: req.body.name, comment: req.body.comment };
  Post.findOneAndUpdate(
    { _id: requestedPostId },
    { $push: { comments: comment } },
    { new: true }
  )
    .then(post => {
      res.redirect('/posts/' + requestedPostId);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post('/compose', (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });

  post.save()
    .then(() => {
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});

// Edit Route
app.get('/posts/:postId/edit', (req, res) => {
  const requestedPostId = req.params.postId;
  Post.findOne({ _id: requestedPostId })
    .then(post => {
      res.render('edit', { post: post });
    })
    .catch(err => {
      console.log(err);
      res.status(404).send('Post not found');
    });
});

// Update Route
app.post('/posts/:postId/edit', (req, res) => {
  const requestedPostId = req.params.postId;
  const updatedPost = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };
  Post.findOneAndUpdate(
    { _id: requestedPostId },
    updatedPost,
    { new: true }
  )
    .then(post => {
      res.redirect('/posts/' + requestedPostId);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send('Internal Server Error');
    });
});
// Delete Route
app.post('/posts/:postId/delete', (req, res) => {
   const requestedPostId = req.params.postId;
   Post.findByIdAndDelete(requestedPostId)
     .then(() => {
       res.redirect('/');
     })
     .catch(err => {
       console.log(err);
       res.status(500).send('Internal Server Error');
     });
 });

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
