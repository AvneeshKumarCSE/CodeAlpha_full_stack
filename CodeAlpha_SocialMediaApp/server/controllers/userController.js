const { dbGet, dbAll, dbRun } = require('../config/database');

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const targetUser = await dbGet(
      'SELECT id, name, username, bio, avatar, created_at FROM users WHERE username = ?',
      [username.toLowerCase().trim()]
    );

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const followersCount = (await dbGet('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [targetUser.id])).c;
    const followingCount = (await dbGet('SELECT COUNT(*) as c FROM follows WHERE follower_id = ?', [targetUser.id])).c;
    const postsCount = (await dbGet('SELECT COUNT(*) as c FROM posts WHERE user_id = ?', [targetUser.id])).c;

    let isFollowing = false;
    if (currentUserId && currentUserId !== targetUser.id) {
      const followRecord = await dbGet(
        'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
        [currentUserId, targetUser.id]
      );
      isFollowing = !!followRecord;
    }

    // Fetch user posts
    const posts = await dbAll(
      `SELECT p.*, u.name, u.username, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.id DESC`,
      [targetUser.id]
    );

    res.json({
      success: true,
      profile: {
        ...targetUser,
        followersCount,
        followingCount,
        postsCount,
        isFollowing,
        isSelf: currentUserId === targetUser.id,
        posts
      }
    });
  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name cannot be blank.' });
    }

    await dbRun(
      'UPDATE users SET name = ?, bio = ?, avatar = ? WHERE id = ?',
      [name.trim(), bio ? bio.trim() : '', avatar ? avatar.trim() : '', userId]
    );

    const updated = await dbGet('SELECT id, name, username, email, bio, avatar FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
};

const toggleFollow = async (req, res) => {
  try {
    const followerId = req.user.id;
    const targetUserId = parseInt(req.params.userId, 10);

    if (followerId === targetUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself.' });
    }

    const targetUser = await dbGet('SELECT id FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user does not exist.' });
    }

    const existingFollow = await dbGet(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [followerId, targetUserId]
    );

    if (existingFollow) {
      // Unfollow
      await dbRun('DELETE FROM follows WHERE id = ?', [existingFollow.id]);
      const newCount = (await dbGet('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [targetUserId])).c;
      return res.json({ success: true, following: false, followersCount: newCount, message: 'Unfollowed successfully' });
    } else {
      // Follow
      await dbRun('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, targetUserId]);
      const newCount = (await dbGet('SELECT COUNT(*) as c FROM follows WHERE following_id = ?', [targetUserId])).c;
      return res.json({ success: true, following: true, followersCount: newCount, message: 'Followed successfully' });
    }
  } catch (err) {
    console.error('toggleFollow error:', err);
    res.status(500).json({ success: false, message: 'Failed to process follow/unfollow request.' });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : 0;
    const suggestions = await dbAll(
      `SELECT id, name, username, bio, avatar
       FROM users
       WHERE id != ? AND id NOT IN (SELECT following_id FROM follows WHERE follower_id = ?)
       ORDER BY RANDOM() LIMIT 5`,
      [currentUserId, currentUserId]
    );

    res.json({ success: true, users: suggestions });
  } catch (err) {
    console.error('getSuggestions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions.' });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getSuggestions
};
