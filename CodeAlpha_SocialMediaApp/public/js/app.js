let currentFeedTab = 'all';

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'circle-check' : (type === 'error' ? 'circle-exclamation' : 'circle-info');
  toast.innerHTML = `<i class="fa-solid fa-${icon}"></i><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Format relative time (e.g. "5m ago", "2h ago")
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Feed Loader
async function loadFeed(tab = currentFeedTab) {
  currentFeedTab = tab;
  document.getElementById('tabAll').classList.toggle('active', tab === 'all');
  document.getElementById('tabFollowing').classList.toggle('active', tab === 'following');

  const container = document.getElementById('postsStream');
  container.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i>
      <p style="margin-top: 0.5rem;">Loading timeline...</p>
    </div>
  `;

  try {
    const res = await apiRequest(`/posts?filter=${tab}`);
    renderFeed(res.posts);
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--danger);">
        <i class="fa-solid fa-circle-exclamation" style="font-size: 2rem;"></i>
        <p style="margin-top: 0.5rem;">Failed to load posts: ${err.message}</p>
      </div>
    `;
  }
}

function renderFeed(posts) {
  const container = document.getElementById('postsStream');
  const user = Auth.getUser();

  if (posts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1.5rem; color: var(--text-muted);">
        <i class="fa-regular fa-comment-dots" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <h3 style="font-weight: 700; color: var(--text-main);">No posts yet</h3>
        <p>${currentFeedTab === 'following' ? 'Users you follow have not posted anything yet.' : 'Be the first to share your thoughts!'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = posts.map(post => {
    const isLiked = Boolean(post.is_liked);
    const isOwner = user && user.id === post.user_id;

    return `
      <article class="post-card" id="post-${post.id}">
        <img src="${post.author_avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + post.author_username}" 
             alt="${post.author_name}" 
             class="avatar-img"
             onclick="openProfileModal('${post.author_username}')">
        
        <div class="post-main">
          <div class="post-header">
            <div class="post-author-row">
              <span class="author-name" onclick="openProfileModal('${post.author_username}')">${post.author_name}</span>
              <span class="author-handle">@${post.author_username}</span>
              <span style="color: var(--text-muted);">&bull;</span>
              <span class="post-time">${timeAgo(post.created_at)}</span>
            </div>
            ${isOwner ? `
              <button class="btn-delete-post" title="Delete Post" onclick="handleDeletePost(${post.id})">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            ` : ''}
          </div>

          <div class="post-body-text">${escapeHtml(post.content)}</div>

          ${post.image_url ? `
            <div class="post-media-wrap">
              <img src="${post.image_url}" alt="Post attachment" loading="lazy">
            </div>
          ` : ''}

          <div class="post-actions-bar">
            <!-- Like Button -->
            <button class="post-action-btn ${isLiked ? 'liked' : ''}" id="likeBtn-${post.id}" onclick="handleToggleLike(${post.id})">
              <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
              <span id="likeCount-${post.id}">${post.likes_count}</span>
            </button>

            <!-- Comments Toggle Button -->
            <button class="post-action-btn" onclick="toggleCommentsDrawer(${post.id})">
              <i class="fa-regular fa-comment"></i>
              <span id="commentCount-${post.id}">${post.comments_count}</span>
            </button>

            <button class="post-action-btn" onclick="navigator.clipboard.writeText(window.location.href); showToast('Link copied to clipboard!', 'info');">
              <i class="fa-solid fa-arrow-up-from-bracket"></i>
            </button>
          </div>

          <!-- Comments Drawer Container -->
          <div class="comments-section" id="commentsSection-${post.id}">
            <div class="comment-input-row">
              <input type="text" class="comment-input" id="commentInput-${post.id}" placeholder="Write a comment..." onkeydown="if(event.key==='Enter') submitComment(${post.id})">
              <button class="btn-send-comment" onclick="submitComment(${post.id})">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>
            <div class="comments-list" id="commentsList-${post.id}">
              <!-- Dynamic comments injected on open -->
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Like Toggle with Optimistic UI
async function handleToggleLike(postId) {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please sign in to like posts', 'info');
    openAuthModal();
    return;
  }

  const btn = document.getElementById(`likeBtn-${postId}`);
  const countSpan = document.getElementById(`likeCount-${postId}`);
  const currentlyLiked = btn.classList.contains('liked');
  let currentCount = parseInt(countSpan.textContent, 10) || 0;

  // Optimistic UI update
  btn.classList.toggle('liked', !currentlyLiked);
  btn.querySelector('i').className = !currentlyLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  countSpan.textContent = !currentlyLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

  try {
    const res = await apiRequest(`/posts/${postId}/like`, { method: 'POST' });
    countSpan.textContent = res.likesCount;
  } catch (err) {
    // Revert if error
    btn.classList.toggle('liked', currentlyLiked);
    btn.querySelector('i').className = currentlyLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    countSpan.textContent = currentCount;
    showToast(err.message, 'error');
  }
}

// Comments Toggle and Submit
async function toggleCommentsDrawer(postId) {
  const section = document.getElementById(`commentsSection-${postId}`);
  const isOpen = section.classList.contains('open');

  if (isOpen) {
    section.classList.remove('open');
  } else {
    section.classList.add('open');
    loadComments(postId);
  }
}

async function loadComments(postId) {
  const container = document.getElementById(`commentsList-${postId}`);
  container.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem 0;">Loading comments...</div>';

  try {
    const res = await apiRequest(`/posts/${postId}/comments`);
    if (res.comments.length === 0) {
      container.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 0.5rem 0;">No comments yet. Be the first!</div>';
      return;
    }

    container.innerHTML = res.comments.map(c => `
      <div class="comment-item">
        <img src="${c.author_avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + c.author_username}" class="comment-avatar">
        <div class="comment-bubble">
          <span class="comment-author" onclick="openProfileModal('${c.author_username}')">@${c.author_username}</span>
          <span class="comment-text">${escapeHtml(c.content)}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--danger); font-size: 0.8rem;">${err.message}</div>`;
  }
}

async function submitComment(postId) {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please sign in to comment', 'info');
    openAuthModal();
    return;
  }

  const input = document.getElementById(`commentInput-${postId}`);
  const content = input.value.trim();
  if (!content) return;

  try {
    const res = await apiRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });

    input.value = '';
    document.getElementById(`commentCount-${postId}`).textContent = res.commentsCount;
    loadComments(postId);
    showToast('Comment added!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Post Creation
async function handleCreatePost() {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please sign in to publish a post', 'info');
    openAuthModal();
    return;
  }

  const textarea = document.getElementById('composerTextarea');
  const imageInput = document.getElementById('composerImageUrl');
  const submitBtn = document.getElementById('btnSubmitPost');

  const content = textarea.value.trim();
  const image_url = imageInput ? imageInput.value.trim() : '';

  if (!content) {
    showToast('Please write something to post!', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  try {
    await apiRequest('/posts', {
      method: 'POST',
      body: JSON.stringify({ content, image_url })
    });

    textarea.value = '';
    if (imageInput) {
      imageInput.value = '';
      imageInput.style.display = 'none';
    }

    showToast('Post published!', 'success');
    Auth.refreshUser();
    loadFeed();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';
  }
}

async function handleDeletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    await apiRequest(`/posts/${postId}`, { method: 'DELETE' });
    showToast('Post deleted', 'info');
    document.getElementById(`post-${postId}`).remove();
    Auth.refreshUser();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function toggleImageInput() {
  const input = document.getElementById('composerImageUrl');
  input.style.display = input.style.display === 'block' ? 'none' : 'block';
  if (input.style.display === 'block') input.focus();
}

// User Profile View Modal
async function openProfileModal(username) {
  const modal = document.getElementById('profileModal');
  const container = document.getElementById('profileModalContent');
  modal.classList.add('active');

  container.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i></div>';

  try {
    const res = await apiRequest(`/users/profile/${username}`);
    const p = res.profile;

    container.innerHTML = `
      <div style="background: linear-gradient(135deg, #0284c7, #38bdf8); height: 110px; border-radius: var(--radius-md) var(--radius-md) 0 0; position: relative; margin: -1.5rem -1.5rem 0;">
        <img src="${p.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + p.username}" 
             style="width: 80px; height: 80px; border-radius: 50%; border: 4px solid #fff; position: absolute; bottom: -35px; left: 1.5rem; background: #fff;">
      </div>
      <div style="margin-top: 42px; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h2 style="font-size: 1.3rem; font-weight: 800;">${p.name}</h2>
          <div style="color: var(--text-muted); font-size: 0.9rem;">@${p.username}</div>
        </div>
        <div>
          ${p.isSelf ? `
            <button class="btn-primary" onclick="openEditProfileModal()">Edit Profile</button>
          ` : `
            <button class="btn-follow ${p.isFollowing ? 'following' : ''}" id="modalFollowBtn" onclick="toggleFollowInModal(${p.id})">
              ${p.isFollowing ? 'Following' : 'Follow'}
            </button>
          `}
        </div>
      </div>
      <p style="margin: 1rem 0; font-size: 0.95rem; line-height: 1.5;">${p.bio || 'No bio yet.'}</p>
      
      <div class="quick-card-stats" style="margin-bottom: 1.5rem;">
        <div class="stat-box"><span class="stat-num">${p.postsCount}</span><span class="stat-label">Posts</span></div>
        <div class="stat-box"><span class="stat-num" id="modalFollowersCount">${p.followersCount}</span><span class="stat-label">Followers</span></div>
        <div class="stat-box"><span class="stat-num">${p.followingCount}</span><span class="stat-label">Following</span></div>
      </div>

      <h4 style="font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 1rem;">Posts by ${p.name}</h4>
      <div class="profile-posts-list">
        ${p.posts.length === 0 ? '<p style="color: var(--text-muted); font-size: 0.9rem;">No posts published yet.</p>' : ''}
        ${p.posts.map(post => `
          <div style="border-bottom: 1px solid var(--border); padding: 0.75rem 0;">
            <p style="font-size: 0.95rem; margin-bottom: 0.35rem;">${escapeHtml(post.content)}</p>
            <div style="font-size: 0.8rem; color: var(--text-muted);">
              <span>${timeAgo(post.created_at)}</span> &bull; 
              <span><i class="fa-solid fa-heart" style="color: var(--like);"></i> ${post.likes_count}</span> &bull;
              <span><i class="fa-regular fa-comment"></i> ${post.comments_count}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--danger);">${err.message}</div>`;
  }
}

async function toggleFollowInModal(targetUserId) {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please sign in to follow users', 'info');
    openAuthModal();
    return;
  }

  try {
    const res = await apiRequest(`/users/${targetUserId}/follow`, { method: 'POST' });
    const btn = document.getElementById('modalFollowBtn');
    const followersEl = document.getElementById('modalFollowersCount');

    if (btn) {
      btn.classList.toggle('following', res.following);
      btn.textContent = res.following ? 'Following' : 'Follow';
    }
    if (followersEl) followersEl.textContent = res.followersCount;

    showToast(res.message, 'info');
    Auth.refreshUser();
    loadSuggestions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Suggestions for "Who to Follow"
async function loadSuggestions() {
  const container = document.getElementById('suggestionsContainer');
  if (!container) return;

  try {
    const res = await apiRequest('/users/suggestions');
    if (res.users.length === 0) {
      container.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">You are following all members!</p>';
      return;
    }

    container.innerHTML = res.users.map(u => `
      <div class="suggestion-row">
        <div style="display: flex; align-items: center; gap: 0.6rem; overflow: hidden;">
          <img src="${u.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + u.username}" class="avatar-img" style="width: 36px; height: 36px;">
          <div style="overflow: hidden;">
            <div style="font-weight: 700; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;" onclick="openProfileModal('${u.username}')">${u.name}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">@${u.username}</div>
          </div>
        </div>
        <button class="btn-follow" onclick="followFromSuggestions(${u.id})">Follow</button>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load suggestions:', err);
  }
}

async function followFromSuggestions(userId) {
  const user = Auth.getUser();
  if (!user) {
    showToast('Please sign in to follow users', 'info');
    openAuthModal();
    return;
  }

  try {
    await apiRequest(`/users/${userId}/follow`, { method: 'POST' });
    showToast('Followed successfully!', 'success');
    Auth.refreshUser();
    loadSuggestions();
    loadFeed();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Edit Profile Modal
function openEditProfileModal() {
  const user = Auth.getUser();
  if (!user) return;

  document.getElementById('editName').value = user.name;
  document.getElementById('editBio').value = user.bio || '';
  document.getElementById('editAvatar').value = user.avatar || '';
  document.getElementById('editProfileModal').classList.add('active');
}

async function handleEditProfileSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('editName').value;
  const bio = document.getElementById('editBio').value;
  const avatar = document.getElementById('editAvatar').value;

  try {
    const res = await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, bio, avatar })
    });

    Auth.setSession(Auth.getToken(), res.user);
    closeModal('editProfileModal');
    closeModal('profileModal');
    showToast('Profile updated!', 'success');
    loadFeed();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Auth Forms
function openAuthModal(tab = 'login') {
  switchAuthTab(tab);
  document.getElementById('authModal').classList.add('active');
}

function switchAuthTab(tab) {
  document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('authTabSignup').classList.toggle('active', tab === 'signup');
  document.getElementById('formLogin').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('formSignup').style.display = tab === 'signup' ? 'block' : 'none';
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('loginIdentifier').value;
  const pass = document.getElementById('loginPassword').value;

  try {
    await Auth.login(id, pass);
    await Auth.refreshUser();
    closeModal('authModal');
    showToast('Welcome back!', 'success');
    loadFeed();
    loadSuggestions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value;
  const username = document.getElementById('signupUsername').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  try {
    await Auth.register(name, username, email, password);
    await Auth.refreshUser();
    closeModal('authModal');
    showToast('Account created successfully!', 'success');
    loadFeed();
    loadSuggestions();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function fillDemoAccount() {
  document.getElementById('loginIdentifier').value = 'alex_dev';
  document.getElementById('loginPassword').value = 'password123';
  switchAuthTab('login');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Initial Boot
document.addEventListener('DOMContentLoaded', async () => {
  Auth.updateUI();
  await Auth.refreshUser();
  loadFeed();
  loadSuggestions();
});
