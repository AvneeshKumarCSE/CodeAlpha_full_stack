const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById, createPost, deletePost, toggleLike } = require('../controllers/postController');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { verifyToken, optionalToken } = require('../middleware/authMiddleware');

// Posts
router.get('/', optionalToken, getAllPosts);
router.get('/:id', optionalToken, getPostById);
router.post('/', verifyToken, createPost);
router.delete('/:id', verifyToken, deletePost);
router.post('/:id/like', verifyToken, toggleLike);

// Comments
router.get('/:id/comments', getComments);
router.post('/:id/comments', verifyToken, createComment);
router.delete('/comments/:commentId', verifyToken, deleteComment);

module.exports = router;
