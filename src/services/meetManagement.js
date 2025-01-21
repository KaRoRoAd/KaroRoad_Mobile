import axios from 'axios';
import {API_URL} from './api';
import {getAuthHeader} from './auth';

export const addUserToMeet = async (meetId, email) => {
  console.log('Adding user to meet:', { meetId, email });
  try {
    const response = await axios.post(
      `${API_URL}/meet_user`,
      {
        meetId,
        email,
      },
      {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      },
    );
    console.log('Add user to meet response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Add user to meet error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteUserFromMeet = async (meetUserId) => {
  console.log('Deleting user from meet:', { meetUserId });
  try {
    const response = await axios.delete(
      `${API_URL}/meet_user/${meetUserId}`,
      {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      },
    );
    console.log('Delete user from meet response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete user from meet error:', error.response?.data || error.message);
    throw error;
  }
};

export const getMeetUsers = async (meetId) => {
  console.log('Getting users for meet:', meetId);
  try {
    const response = await axios.get(
      `${API_URL}/meet`,
      {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      },
    );
    console.log('Get meet users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get meet users error:', error.response?.data || error.message);
    throw error;
  }
}; 