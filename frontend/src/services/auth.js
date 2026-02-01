/**
 * Authentication service for handling login and registration
 */

import { setAuthToken, clearAuthToken } from '../utils/api';

const API_BASE_URL = 'https://gradientiq-backend.onrender.com';

/**
 * Login user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Response with access token
 */
export async function login(email, password) {
  try {
    // FastAPI OAuth2PasswordRequestForm expects form data
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 uses 'username' field
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }

    const data = await response.json();
    
    // Store token in localStorage
    if (data.access_token) {
      setAuthToken(data.access_token);
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role (student/faculty)
 * @returns {Promise<object>} Response with user data
 */
export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Logout user by clearing auth token
 */
export function logout() {
  clearAuthToken();
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a token
 */
export function isAuthenticated() {
  const token = localStorage.getItem('authToken');
  return !!token;
}

export default {
  login,
  register,
  logout,
  isAuthenticated,
};
