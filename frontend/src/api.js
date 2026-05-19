import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({ baseURL: BASE_URL });

export const getLeads = () => api.get('/leads').then(r => r.data);
export const createLead = (data) => api.post('/leads', data).then(r => r.data);
export const deleteLead = (id) => api.delete(`/leads/${id}`).then(r => r.data);
export const triggerCall = (id) => api.post(`/leads/${id}/call`).then(r => r.data);
export const getStats = () => api.get('/stats').then(r => r.data);
export const getLead = (id) => api.get(`/leads/${id}`).then(r => r.data);
