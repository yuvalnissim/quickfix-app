import axios from 'axios';

export const register = async (formData) => {
  const res = await axios.post('/api/auth/register', formData);
  return res.data;
};

export const login = async (formData) => {
  const res = await axios.post('/api/auth/login', formData);
  return res.data;
};
