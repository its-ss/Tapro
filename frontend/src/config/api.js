// API Configuration
// Uses environment variable or defaults to localhost for development
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    register: `${API_BASE_URL}/api/auth/register`,
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
    forgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
    me: `${API_BASE_URL}/api/auth/me`,
  },

  // Discovery endpoints
  discover: `${API_BASE_URL}/api/discover`,

  // Startup endpoints
  startupSubmit: `${API_BASE_URL}/api/startup/submit`,
  startups: (startupId) => `${API_BASE_URL}/api/startups/${startupId}`,

  // Investor endpoints
  investorRegister: `${API_BASE_URL}/api/investor/register`,
  investors: (investorId) => `${API_BASE_URL}/api/investors/${investorId}`,
  investorMe: `${API_BASE_URL}/api/investors/me`,

  // User endpoints
  users: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  userStartups: (userId) => `${API_BASE_URL}/api/users/${userId}/startups`,
  userOnboarding: (userId) => `${API_BASE_URL}/api/users/${userId}/onboarding`,

  // Starred/Saved endpoints
  starred: `${API_BASE_URL}/api/starred`,
  star: `${API_BASE_URL}/api/star`,
  unstar: `${API_BASE_URL}/api/unstar`,

  // Follow endpoints
  follow: `${API_BASE_URL}/api/follow`,
  unfollow: `${API_BASE_URL}/api/unfollow`,

  // Messaging endpoints
  conversations: `${API_BASE_URL}/api/conversations`,
  conversationMessages: (conversationId) => `${API_BASE_URL}/api/conversations/${conversationId}/messages`,

  // Posts/Feed endpoints
  posts: `${API_BASE_URL}/api/posts`,
  postLike: (postId) => `${API_BASE_URL}/api/posts/${postId}/like`,
  postComment: (postId) => `${API_BASE_URL}/api/posts/${postId}/comment`,
  postBookmark: (postId) => `${API_BASE_URL}/api/posts/${postId}/bookmark`,

  // Health check
  health: `${API_BASE_URL}/api/health`,
};

// Helper to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request helper with auth
export const apiRequest = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle token expiration
  if (response.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(API_ENDPOINTS.auth.refresh, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem('accessToken', data.accessToken);
          // Retry original request
          return fetch(url, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${data.accessToken}`,
            },
          });
        }
      } catch (e) {
        console.error('Token refresh failed:', e);
      }
    }
    // Clear tokens and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return response;
};
