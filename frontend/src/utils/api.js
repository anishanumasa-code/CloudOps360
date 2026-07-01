const isLocal = 
  import.meta.env.DEV ||
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.startsWith('192.168.') ||
  window.location.hostname.startsWith('10.') ||
  window.location.hostname.startsWith('172.');

export const API_BASE = isLocal
  ? 'http://localhost:8000'
  : 'https://cloudops360.onrender.com';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  // Clean up leading/trailing slashes to ensure valid formatting
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const headers = {
    ...options.headers,
  };
  
  // Set content type to JSON by default unless it's urlencoded or multipart
  if (!headers['Content-Type'] && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE}${cleanEndpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      // Clear invalid session tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return response;
  } catch (error) {
    console.error(`API Fetch Error on ${cleanEndpoint}:`, error);
    throw error;
  }
}
