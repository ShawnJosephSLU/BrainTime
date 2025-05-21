// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5023';

// Auth endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: `${API_URL}/api/auth/register`,
  LOGIN: `${API_URL}/api/auth/login`,
  VERIFY_EMAIL: `${API_URL}/api/auth/verify-email`,
  RESEND_VERIFICATION: `${API_URL}/api/auth/resend-verification`,
  FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
  RESET_PASSWORD: `${API_URL}/api/auth/reset-password`,
};

// Export default config
const apiConfig = {
  API_URL,
  AUTH_ENDPOINTS,
};

export default apiConfig; 