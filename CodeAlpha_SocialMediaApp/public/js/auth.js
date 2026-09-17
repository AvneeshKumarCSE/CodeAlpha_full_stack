const Auth = {
  getToken() {
    return localStorage.getItem('codealpha_social_token');
  },

  getUser() {
    const u = localStorage.getItem('codealpha_social_user');
    try {
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('codealpha_social_token', token);
    localStorage.setItem('codealpha_social_user', JSON.stringify(user));
    this.updateUI();
  },

  logout() {
    localStorage.removeItem('codealpha_social_token');
    localStorage.removeItem('codealpha_social_user');
    this.updateUI();
    showToast('Signed out', 'info');
    loadFeed();
  },

  async login(identifier, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    this.setSession(res.token, res.user);
    return res;
  },

  async register(name, username, email, password) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password })
    });
    this.setSession(res.token, res.user);
    return res;
  },

  async refreshUser() {
    if (!this.getToken()) return;
    try {
      const res = await apiRequest('/auth/me');
      this.setSession(this.getToken(), res.user);
    } catch {
      // Token might be expired
      this.logout();
    }
  },

  updateUI() {
    const user = this.getUser();
    const guestCard = document.getElementById('guestActionBox');
    const userPill = document.getElementById('sidebarUserPill');
    const quickCard = document.getElementById('userQuickCard');
    const composerAvatar = document.getElementById('composerAvatar');

    if (user) {
      if (guestCard) guestCard.style.display = 'none';
      if (userPill) userPill.style.display = 'flex';
      if (quickCard) quickCard.style.display = 'block';

      document.getElementById('sidebarUserName').textContent = user.name;
      document.getElementById('sidebarUserHandle').textContent = `@${user.username}`;
      document.getElementById('sidebarUserAvatar').src = user.avatar;

      if (composerAvatar) composerAvatar.src = user.avatar;

      // Quick widget updates
      document.getElementById('quickCardAvatar').src = user.avatar;
      document.getElementById('quickCardName').textContent = user.name;
      document.getElementById('quickCardHandle').textContent = `@${user.username}`;
      document.getElementById('quickCardBio').textContent = user.bio || '';
      document.getElementById('quickStatPosts').textContent = user.postsCount || '0';
      document.getElementById('quickStatFollowers').textContent = user.followersCount || '0';
      document.getElementById('quickStatFollowing').textContent = user.followingCount || '0';
    } else {
      if (guestCard) guestCard.style.display = 'block';
      if (userPill) userPill.style.display = 'none';
      if (quickCard) quickCard.style.display = 'none';
      if (composerAvatar) composerAvatar.src = 'https://api.dicebear.com/7.x/identicon/svg?seed=guest';
    }
  }
};
