export const API_URL = 'http://127.0.0.1:8082/api';

export const registerUser = async (email, password, confirmPassword) => {
  try {
    const response = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ld+json',
      },
      body: JSON.stringify({
        email,
        password,
        confirmPassword,
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return true;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}; 