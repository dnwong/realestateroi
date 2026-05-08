import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  withCredentials: true, // Send session cookies
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor — normalize error shape
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An unexpected error occurred';
    const normalized = new Error(message);
    normalized.status = error.response?.status;
    normalized.code = error.response?.data?.code;
    return Promise.reject(normalized);
  }
);

export default client;
