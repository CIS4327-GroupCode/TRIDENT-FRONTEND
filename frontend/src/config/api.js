/**
 * API Configuration Module
 * 
 * Centralized API URL management for frontend.
 * Supports both development and production environments.
 * 
 * Usage:
 *   import { getApiUrl, fetchApi } from '@/config/api';
 *   
 *   // Get full API URL
 *   const url = getApiUrl('/projects/1/milestones');
 *   
 *   // Use fetch helper with automatic auth
 *   const data = await fetchApi('/projects/1/milestones', {
 *     method: 'GET',
 *     headers: { 'Authorization': `Bearer ${token}` }
 *   });
 */

/**
 * Get the base API URL based on environment
 * @returns {string} Base API URL (e.g., 'http://localhost:5000' or 'https://api.example.com')
 */
export const getApiBaseUrl = () => {
  // First, try the injected define values from vite.config.js
  if (typeof __VITE_API_URL__ !== 'undefined' && __VITE_API_URL__) {
    return __VITE_API_URL__;
  }

  // Then try import.meta.env (Vite's standard way)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In development, use localhost with standard port
  if (import.meta.env.DEV) {
    return 'http://localhost:5000';
  }

  // Fallback for production without env var
  return window.location.origin;
};

/**
 * Construct full API endpoint URL
 * @param {string} endpoint - API endpoint (e.g., '/api/messages' or 'api/messages')
 * @returns {string} Full URL to API endpoint
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  // Ensure endpoint starts with /api/
  const normalizedEndpoint = endpoint.startsWith('/api/')
    ? endpoint
    : endpoint.startsWith('/')
      ? `/api${endpoint}`
      : `/api/${endpoint}`;
  
  return `${baseUrl}${normalizedEndpoint}`;
};

/**
 * Fetch helper with automatic error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If response is not ok
 */
export const fetchApi = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

/**
 * Fetch helper with automatic token injection
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @param {string} token - JWT token from localStorage or AuthContext
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} If response is not ok or no token provided
 */
export const fetchApiWithAuth = async (endpoint, options = {}, token) => {
  if (!token) {
    throw new Error('Authentication token required');
  }

  return fetchApi(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
};

/**
 * Environment info for debugging
 */
export const apiConfig = {
  baseUrl: getApiBaseUrl(),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || 'Not configured',
  appName: import.meta.env.VITE_APP_NAME || 'TRIDENT Match Portal'
};
