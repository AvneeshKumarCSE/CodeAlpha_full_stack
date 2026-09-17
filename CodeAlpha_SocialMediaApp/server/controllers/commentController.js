const { dbGet, dbAll, dbRun } = require('../config/database');

const getComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await dbAll(
      `SELECT
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.name as author_name,
        u.username as author_username,
        u.avatar as author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.id ASC`,
      [postId]
    );

    res.json({ success: true, count: comments.length, comments });
  } catch (err) {
    console.error('getComments error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve comments.' });
  }
};

const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    const post = await dbGet('SELECT id FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const result = await dbRun(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content.trim()]
    );

    const comment = await dbGet(
      `SELECT
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.name as author_name,
        u.username as author_username,
        u.avatar as author_avatar
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [result.id]
    );

    const countRow = await dbGet('SELECT COUNT(*) as c FROM comments WHERE post_id = ?', [postId]);

    res.status(201).json({
      success: true,
      message: 'Comment added!',
      comment,
      commentsCount: countRow.c
    });
  } catch (err) {
    console.error('createComment error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit comment.' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { commentId } = req.params;

    const comment = await dbGet('SELECT * FROM comments WHERE id = ?', [commentId]);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found.' });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this comment.' });
    }

    await dbRun('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ success: true, message: 'Comment removed.' });
  } catch (err) {
    console.error('deleteComment error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete comment.' });
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment
};
