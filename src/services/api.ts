// This file centralizes all API endpoints for the application.

const API_BASE_URL = 'http://64.225.89.201:4001';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  ME: `${API_BASE_URL}/api/auth/me`,
  // Add other endpoints here as the application grows
};
