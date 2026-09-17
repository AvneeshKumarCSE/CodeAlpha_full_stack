const Auth = {
  getToken() {
    return localStorage.getItem('codealpha_ecommerce_token');
  },

  getUser() {
    const userStr = localStorage.getItem('codealpha_ecommerce_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('codealpha_ecommerce_token', token);
    localStorage.setItem('codealpha_ecommerce_user', JSON.stringify(user));
    this.updateUI();
  },

  logout() {
    localStorage.removeItem('codealpha_ecommerce_token');
    localStorage.removeItem('codealpha_ecommerce_user');
    this.updateUI();
    showToast('Logged out successfully', 'info');
  },

  async login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setSession(res.token, res.user);
    return res;
  },

  async register(name, email, password) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    this.setSession(res.token, res.user);
    return res;
  },

  updateUI() {
    const user = this.getUser();
    const loginBtn = document.getElementById('loginBtn');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userNameSpan = document.getElementById('userNameDisplay');

    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenuBtn) {
        userMenuBtn.style.display = 'flex';
        userNameSpan.textContent = user.name.split(' ')[0];
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userMenuBtn) userMenuBtn.style.display = 'none';
    }
  }
};
