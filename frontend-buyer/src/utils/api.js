import axios from 'axios';

const API = axios.create({
  baseURL: 'https://farmconnect-production-fb7e.up.railway.app/api'
});

// Automatically attach login token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  profile:  ()     => API.get('/auth/profile'),
};

export const listingsAPI = {
  getAll:   (params) => API.get('/listings', { params }),
  getMine:  ()       => API.get('/listings/my'),
  create:   (data)   => API.post('/listings', data),
  update:   (id, data) => API.put(`/listings/${id}`, data),
  delete:   (id)     => API.delete(`/listings/${id}`),
};

export const ordersAPI = {
  getMine:         ()     => API.get('/orders/my'),
  place:           (data) => API.post('/orders', data),
  respond:         (data) => API.put('/orders/respond', data),
  pay:             (data) => API.post('/orders/pay', data),
  confirmDelivery: (data) => API.put('/orders/confirm-delivery', data),
  dispute:         (data) => API.post('/orders/dispute', data),
};

export default API;