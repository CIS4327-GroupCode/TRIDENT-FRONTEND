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

// Helper function to check if we're in development
// Works in both Vite (uses import.meta) and Jest (uses globalThis polyfill)
const isDevelopment = () => {
  // In Jest: globalThis.import.meta.env.DEV
  if (typeof globalThis !== 'undefined' && globalThis?.import?.meta?.env?.DEV !== undefined) {
    return globalThis.import.meta.env.DEV;
  }
  // In Vite: import.meta.env.MODE === 'development'
  // Check if NODE_ENV or VITE_* env vars are set
  if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
    return true;
  }
  // Default: assume production
  return false;
};

/**
 * Get the base API URL based on environment
 * @returns {string} Base API URL (e.g., 'http://localhost:5000' or 'https://api.example.com')
 */
export const getApiBaseUrl = () => {
  // Check if running in development mode
  const isDev = isDevelopment();
  
  // In development, use localhost with backend port
  if (isDev) {
    return 'http://localhost:4000';
  }

  // In production, always use the backend URL
  // No fallback to window.location.origin to avoid routing to frontend
  const backendUrl = 'https://trident-backend-phi.vercel.app';
  console.log('[API Config] Using backend URL:', backendUrl, 'isDev:', isDev);
  return backendUrl;
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
  isDevelopment: globalThis?.import?.meta?.env?.DEV ?? false,
  isProduction: globalThis?.import?.meta?.env?.PROD ?? true,
  apiUrl: globalThis?.import?.meta?.env?.VITE_API_URL ?? 'http://localhost:5000',
  appName: globalThis?.import?.meta?.env?.VITE_APP_NAME ?? 'TRIDENT Match Portal'
};

// ============================================================================
// NOTIFICATION API FUNCTIONS
// ============================================================================

/**
 * Get user notifications
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Number of notifications per page
 * @param {number} params.offset - Number to skip
 * @param {boolean} params.unread - Filter unread only
 * @param {string} params.type - Filter by type
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Notifications response
 */
export const getNotifications = async (params = {}, token) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';
  return fetchApiWithAuth(endpoint, { method: 'GET' }, token);
};

/**
 * Get unread notification count
 * @param {string} token - JWT token
 * @returns {Promise<Object>} { unreadCount: number }
 */
export const getUnreadCount = async (token) => {
  return fetchApiWithAuth('/notifications/unread-count', { method: 'GET' }, token);
};

/**
 * Mark notification as read
 * @param {number} id - Notification ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (id, token) => {
  return fetchApiWithAuth(`/notifications/${id}/read`, { method: 'PUT' }, token);
};

/**
 * Mark notification as unread
 * @param {number} id - Notification ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsUnread = async (id, token) => {
  return fetchApiWithAuth(`/notifications/${id}/unread`, { method: 'PUT' }, token);
};

/**
 * Mark all notifications as read
 * @param {string} token - JWT token
 * @returns {Promise<Object>} { message, updatedCount }
 */
export const markAllAsRead = async (token) => {
  return fetchApiWithAuth('/notifications/read-all', { method: 'PUT' }, token);
};

/**
 * Delete notification
 * @param {number} id - Notification ID
 * @param {string} token - JWT token
 * @returns {Promise<Object>} { message }
 */
export const deleteNotification = async (id, token) => {
  return fetchApiWithAuth(`/notifications/${id}`, { method: 'DELETE' }, token);
};

/**
 * Delete all read notifications
 * @param {string} token - JWT token
 * @returns {Promise<Object>} { message, deletedCount }
 */
export const deleteAllRead = async (token) => {
  return fetchApiWithAuth('/notifications/read', { method: 'DELETE' }, token);
};
