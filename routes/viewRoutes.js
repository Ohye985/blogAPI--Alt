const express = require('express');
const router = express.Router();
const Post = require('../model/Post.model');
const authController = require('../auth/user.auth');

// Render homepage (all published posts with pagination)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const searchQuery = { state: 'published' };

    const [posts, total] = await Promise.all([
      Post.find(searchQuery).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Post.countDocuments(searchQuery),
    ]);

    res.render('posts/index', {
      posts,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      title: 'Published Posts',
    });
  } catch (err) {
    res.status(500).send('Error loading posts');
  }
});

// Render a single published post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).where('state').equals('published');
    if (!post) return res.status(404).send('Post not found');

    // Increment read count
    post.readCount += 1;
    await post.save();

    res.render('posts/show', { post, title: post.title });
  } catch (err) {
    res.status(500).send('Error loading post');
  }
});

// Render create post form
router.get('/posts/create', authController.authenticate, (req, res) => {
  res.render('posts/create', { title: 'Create Post' });
});

// Render edit post form
router.get('/posts/:id/edit', authController.authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send('Post not found');

    // Check if user owns the post
    if (post.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).send('Unauthorized');
    }

    res.render('posts/edit', { post, title: 'Edit Post' });
  } catch (err) {
    res.status(500).send('Error loading edit form');
  }
});

// Render author dashboard (all posts by current user)
router.get('/users/dashboard', authController.authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ authorId: req.user._id }).sort({ createdAt: -1 });
    res.render('users/dashboard', { posts, title: 'My Posts' });
  } catch (err) {
    res.status(500).send('Error loading dashboard');
  }
});

module.exports = router;
