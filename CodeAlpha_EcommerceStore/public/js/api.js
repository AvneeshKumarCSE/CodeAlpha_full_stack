const API_BASE = '/api';

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('codealpha_ecommerce_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`Error in [${endpoint}]:`, error.message);
    throw error;
  }
};
