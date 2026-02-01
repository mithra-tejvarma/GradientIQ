/**
 * Centralized API utility for making HTTP requests to the backend
 */

const API_BASE_URL = 'https://gradientiq-backend.onrender.com';

/**
 * Get the auth token from localStorage
 * @returns {string|null} The auth token or null if not found
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Set the auth token in localStorage
 * @param {string} token - The JWT token to store
 */
export function setAuthToken(token) {
  localStorage.setItem('authToken', token);
}

/**
 * Remove the auth token from localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem('authToken');
}

/**
 * Make a GET request to the API
 * @param {string} endpoint - The API endpoint (e.g., '/students')
 * @param {object} options - Optional fetch options
 * @returns {Promise<any>} The response data
 */
export async function apiGet(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login')
 * @param {object} data - The request body data
 * @param {object} options - Optional fetch options
 * @returns {Promise<any>} The response data
 */
export async function apiPost(endpoint, data = {}, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API POST Error:', error);
    throw error;
  }
}

/**
 * Make a PUT request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The request body data
 * @param {object} options - Optional fetch options
 * @returns {Promise<any>} The response data
 */
export async function apiPut(endpoint, data = {}, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API PUT Error:', error);
    throw error;
  }
}

/**
 * Make a DELETE request to the API
 * @param {string} endpoint - The API endpoint
 * @param {object} options - Optional fetch options
 * @returns {Promise<any>} The response data
 */
export async function apiDelete(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API DELETE Error:', error);
    throw error;
  }
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
};
