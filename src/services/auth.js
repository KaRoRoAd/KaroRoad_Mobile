import axios from 'axios';
import {API_URL} from './api';

let authToken = null;

export const setToken = (token) => {
  authToken = token;
};

export const getToken = () => {
  return authToken;
};

export const clearToken = () => {
  authToken = null;
};

export const getAuthHeader = () => {
  return authToken ? { Authorization: `Bearer ${authToken}` } : {};
};

export const resetPassword = async (email) => {
  console.log('Requesting password reset for:', email);
  try {
    const response = await axios.post(
      `${API_URL}/users/reset_password`,
      {
        email,
      },
      {
        headers: {
          'Content-Type': 'application/ld+json',
        },
      },
    );
    console.log('Password reset response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Password reset error:', error.response?.data || error.message);
    throw error;
  }
}; 