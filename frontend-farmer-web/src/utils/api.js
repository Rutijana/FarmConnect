import axios from 'axios';

const API = axios.create({
  baseURL: 'https://farmconnect-production-fb7e.up.railway.app/api'
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
};

export const listingsAPI = {
  getMine:  ()           => API.get('/listings/my'),
  create:   (data)       => API.post('/listings', data),
  update:   (id, data)   => API.put(`/listings/${id}`, data),
  delete:   (id)         => API.delete(`/listings/${id}`),
};

export const ordersAPI = {
  getMine:  () => API.get('/orders/my'),
  respond:  (data) => API.put('/orders/respond', data),
};

export default API;