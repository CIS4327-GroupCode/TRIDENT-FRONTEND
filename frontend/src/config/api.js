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
 * @returns {string} Base API URL (e.g., 'http://localhost:4000' or 'https://api.example.com')
 */
export const getApiBaseUrl = () => {
  // In Vite, import.meta.env.DEV is true in development, false in production build
  // This is set automatically by Vite during dev server and build
  const isDev = import.meta.env.DEV;
  
  // In development, use localhost with backend port
  if (isDev) {
    console.log('[API Config] Development mode detected - using localhost:4000');
    return 'http://localhost:4000';
  }

  // In production, use the Vercel backend URL
  const backendUrl = 'https://trident-backend-phi.vercel.app';
  console.log('[API Config] Production mode - using backend URL:', backendUrl);
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
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
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

// ============================================================================
// ATTACHMENT API FUNCTIONS (UC13)
// ============================================================================

export const listProjectAttachments = async (projectId, token, options = {}) => {
  const params = new URLSearchParams();
  if (options.includeAllVersions) {
    params.set('includeAllVersions', 'true');
  }

  const query = params.toString();
  const endpoint = query
    ? `/projects/${projectId}/attachments?${query}`
    : `/projects/${projectId}/attachments`;

  return fetchApiWithAuth(endpoint, { method: 'GET' }, token);
};

export const uploadProjectAttachment = async (projectId, file, token) => {
  if (!token) {
    throw new Error('Authentication token required');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(getApiUrl(`/projects/${projectId}/attachments`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload attachment');
  }

  return data;
};

export const deleteProjectAttachment = async (projectId, attachmentId, token) => {
  return fetchApiWithAuth(
    `/projects/${projectId}/attachments/${attachmentId}`,
    { method: 'DELETE' },
    token
  );
};

export const downloadProjectAttachment = async (projectId, attachmentId, token) => {
  if (!token) {
    throw new Error('Authentication token required');
  }

  const response = await fetch(getApiUrl(`/projects/${projectId}/attachments/${attachmentId}/download`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to download attachment');
  }

  const blob = await response.blob();
  return {
    blob,
    contentType: response.headers.get('content-type') || 'application/octet-stream'
  };
};

export const getAdminAttachments = async (params = {}, token) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/attachments?${queryString}` : '/admin/attachments';
  return fetchApiWithAuth(endpoint, { method: 'GET' }, token);
};

export const getAdminAttachmentStats = async (token) => {
  return fetchApiWithAuth('/admin/attachments/stats', { method: 'GET' }, token);
};

export const adminForceDeleteAttachment = async (attachmentId, token) => {
  return fetchApiWithAuth(`/admin/attachments/${attachmentId}`, { method: 'DELETE' }, token);
};

// ============================================================================
// REVIEW API FUNCTIONS (UC5)
// ============================================================================

export const getProjectReviews = async (projectId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `/projects/${projectId}/reviews?${queryString}`
    : `/projects/${projectId}/reviews`;
  return fetchApi(endpoint, { method: 'GET' });
};

export const getProjectReviewSummary = async (projectId) => {
  return fetchApi(`/projects/${projectId}/reviews/summary`, { method: 'GET' });
};

export const createProjectReview = async (projectId, payload, token) => {
  return fetchApiWithAuth(
    `/projects/${projectId}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
};

export const updateProjectReview = async (projectId, reviewId, payload, token) => {
  return fetchApiWithAuth(
    `/projects/${projectId}/reviews/${reviewId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
};

export const deleteProjectReview = async (projectId, reviewId, token) => {
  return fetchApiWithAuth(
    `/projects/${projectId}/reviews/${reviewId}`,
    { method: 'DELETE' },
    token
  );
};

export const getUserReviews = async (userId, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString
    ? `/users/${userId}/reviews?${queryString}`
    : `/users/${userId}/reviews`;
  return fetchApi(endpoint, { method: 'GET' });
};

export const getUserReviewSummary = async (userId) => {
  return fetchApi(`/users/${userId}/reviews/summary`, { method: 'GET' });
};

export const getAdminReviews = async (params = {}, token) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/admin/reviews?${queryString}` : '/admin/reviews';
  return fetchApiWithAuth(endpoint, { method: 'GET' }, token);
};

export const getAdminReviewStats = async (token) => {
  return fetchApiWithAuth('/admin/reviews/stats', { method: 'GET' }, token);
};

export const moderateAdminReview = async (reviewId, payload, token) => {
  return fetchApiWithAuth(
    `/admin/reviews/${reviewId}/moderate`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
};

// ============================================================================
// AGREEMENT API FUNCTIONS (UC11)
// ============================================================================

export const getAgreementTemplates = async (token) => {
  return fetchApiWithAuth('/agreements/templates', { method: 'GET' }, token);
};

export const listAgreements = async (params = {}, token) => {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/agreements?${queryString}` : '/agreements';
  return fetchApiWithAuth(endpoint, { method: 'GET' }, token);
};

export const createAgreement = async (payload, token) => {
  return fetchApiWithAuth(
    '/agreements',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    token
  );
};

export const getAgreement = async (id, token) => {
  return fetchApiWithAuth(`/agreements/${id}`, { method: 'GET' }, token);
};

export const updateAgreement = async (id, payload, token) => {
  return fetchApiWithAuth(
    `/agreements/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    token
  );
};

export const getAgreementPreview = async (id, token) => {
  return fetchApiWithAuth(`/agreements/${id}/preview`, { method: 'GET' }, token);
};

export const signAgreement = async (id, token) => {
  return fetchApiWithAuth(`/agreements/${id}/sign`, { method: 'POST' }, token);
};

export const activateAgreement = async (id, token) => {
  return fetchApiWithAuth(`/agreements/${id}/activate`, { method: 'POST' }, token);
};

export const terminateAgreement = async (id, reason, token) => {
  return fetchApiWithAuth(
    `/agreements/${id}/terminate`,
    {
      method: 'POST',
      body: JSON.stringify({ reason })
    },
    token
  );
};

export const downloadAgreement = async (id, token) => {
  if (!token) {
    throw new Error('Authentication token required');
  }

  const response = await fetch(getApiUrl(`/agreements/${id}/download`), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to download agreement');
  }

  const blob = await response.blob();
  return {
    blob,
    contentType: response.headers.get('content-type') || 'application/pdf'
  };
};
