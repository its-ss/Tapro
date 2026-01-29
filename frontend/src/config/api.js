// API Configuration
// Uses environment variable or defaults to localhost for development
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
  // Discovery endpoints
  discover: `${API_BASE_URL}/api/discover`,

  // Startup endpoints
  startupSubmit: `${API_BASE_URL}/api/startup/submit`,
  startups: (startupId) => `${API_BASE_URL}/api/startups/${startupId}`,

  // Investor endpoints
  investorRegister: `${API_BASE_URL}/api/investor/register`,
  investors: (investorId) => `${API_BASE_URL}/api/investors/${investorId}`,

  // User endpoints
  users: (userId) => `${API_BASE_URL}/api/users/${userId}`,
  userStartups: (userId) => `${API_BASE_URL}/api/users/${userId}/startups`,

  // Starred/Saved endpoints
  starred: `${API_BASE_URL}/api/starred`,
  unstarred: `${API_BASE_URL}/api/unstarred`,
};
