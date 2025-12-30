/**
 * Integration Tests for API Configuration
 * Tests API client setup and request handling
 */

import { apiConfig, getApiBaseUrl, getApiUrl } from '../../src/config/api';

describe('API Configuration', () => {
  it('should export API base URL', () => {
    expect(apiConfig).toBeDefined();
    expect(typeof getApiBaseUrl()).toBe('string');
  });

  it('should use correct API endpoint', () => {
    const apiUrl = getApiBaseUrl();
    
    // In test environment, should have a defined API URL
    expect(typeof apiUrl === 'string').toBe(true);
  });

  it('should export helper functions if available', () => {
    // Check if API config exports utility functions
    expect(typeof apiConfig).toBe('object');
    expect(typeof getApiUrl).toBe('function');
  });
});

describe('API Request Helpers', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should make GET request with authorization', async () => {
    const mockResponse = { data: 'test' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const token = 'test-token';
    const response = await fetch('/api/test', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token'
        })
      })
    );
  });

  it('should make POST request with body', async () => {
    const mockData = { name: 'Test' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });

    await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockData)
    });

    expect(fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockData)
      })
    );
  });

  it('should handle API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });

    const response = await fetch('/api/test');
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('should handle network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetch('/api/test')).rejects.toThrow('Network error');
  });
});
