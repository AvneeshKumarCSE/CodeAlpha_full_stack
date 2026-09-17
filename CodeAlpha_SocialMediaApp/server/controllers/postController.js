const { dbGet, dbAll, dbRun } = require('../config/database');

const getAllPosts = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 0;
    const filter = req.query.filter || 'all';

    let query = `
      SELECT
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as user_id,
        u.name as author_name,
        u.username as author_username,
        u.avatar as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;

    const params = [currentUserId];

    if (filter === 'following' && currentUserId > 0) {
      query += ` WHERE p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?) OR p.user_id = ?`;
      params.push(currentUserId, currentUserId);
    }

    query += ` ORDER BY p.id DESC`;

    const posts = await dbAll(query, params);
    res.json({ success: true, count: posts.length, posts });
  } catch (err) {
    console.error('getAllPosts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve posts.' });
  }
};

const getPostById = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 0;
    const { id } = req.params;

    const post = await dbGet(
      `SELECT
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as user_id,
        u.name as author_name,
        u.username as author_username,
        u.avatar as author_avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [currentUserId, id]
    );

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error('getPostById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve post.' });
  }
};

const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content, image_url } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }

    const result = await dbRun(
      'INSERT INTO posts (user_id, content, image_url) VALUES (?, ?, ?)',
      [userId, content.trim(), image_url ? image_url.trim() : '']
    );

    // Fetch full post object to send back
    const post = await dbGet(
      `SELECT
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        u.id as user_id,
        u.name as author_name,
        u.username as author_username,
        u.avatar as author_avatar,
        0 as likes_count,
        0 as comments_count,
        0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?`,
      [result.id]
    );

    res.status(201).json({
      success: true,
      message: 'Post published!',
      post
    });
  } catch (err) {
    console.error('createPost error:', err);
    res.status(500).json({ success: false, message: 'Failed to create post.' });
  }
};

const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await dbGet('SELECT * FROM posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this post.' });
    }

    await dbRun('DELETE FROM posts WHERE id = ?', [id]);
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('deletePost error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete post.' });
  }
};

const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = parseInt(req.params.id, 10);

    const post = await dbGet('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post does not exist.' });
    }

    const existingLike = await dbGet('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);

    let isLiked = false;
    if (existingLike) {
      await dbRun('DELETE FROM likes WHERE id = ?', [existingLike.id]);
      isLiked = false;
    } else {
      await dbRun('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      isLiked = true;
    }

    const likesCountRow = await dbGet('SELECT COUNT(*) as c FROM likes WHERE post_id = ?', [postId]);

    res.json({
      success: true,
      isLiked,
      likesCount: likesCountRow.c
    });
  } catch (err) {
    console.error('toggleLike error:', err);
    res.status(500).json({ success: false, message: 'Failed to process like.' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike
};
