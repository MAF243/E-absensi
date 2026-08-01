const fallbackApiUrl = 'http://localhost:5000';

export const API_URL = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, '');

export const apiUrl = (path) => `${API_URL}${path.startsWith('/') ? path : `/${path}`}`;
