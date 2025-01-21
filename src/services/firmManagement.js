import axios from 'axios';
import {API_URL} from './api';
import {getAuthHeader} from './auth';

export const addEmployeeToFirm = async (email, firmId) => {
  console.log('Adding employee to firm:', { email, firmId });
  try {
    const response = await axios.post(
      `${API_URL}/firm_management/add_employee`,
      {
        email,
        firmId,
      },
      {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      },
    );
    console.log('Add employee response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Add employee error:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteEmployeeFromFirm = async (email) => {
  console.log('Deleting employee from firm:', { email });
  try {
    const response = await axios.post(
      `${API_URL}/firm_management/delete_employee`,
      {
        email,
      },
      {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      },
    );
    console.log('Delete employee response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Delete employee error:', error.response?.data || error.message);
    throw error;
  }
};

export const getEmployees = async (firmId) => {
  console.log('Getting employees for firm:', firmId);
  console.log('API URL:', `${API_URL}/firm_management`);
  try {
    const headers = {
      'Content-Type': 'application/ld+json',
      ...getAuthHeader(),
    };
    console.log('Request headers:', headers);
    const response = await axios.get(`${API_URL}/firm_management`, {
      headers: headers,
    });
    console.log('Get employees response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get employees error:', error.response?.data || error.message);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

export const updateEmployeeRole = async (email, roles) => {
  console.log('Updating employee role:', { email, roles });
  try {
    const response = await axios.post(
      `${API_URL}/firm_management/update_role_employee`,
      {
        email,
        roles,
      },
      {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      },
    );
    console.log('Update role response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update role error:', error.response?.data || error.message);
    throw error;
  }
}; 