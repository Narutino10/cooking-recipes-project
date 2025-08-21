import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Configuration d'axios pour inclure le token automatiquement
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailConfirmed: boolean;
  createdAt: string;
}

// Services
export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterData): Promise<{ message: string }> => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await api.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: { firstName: string; lastName: string }): Promise<User> => {
  const response = await api.put('/users/profile', data);
  return response.data;
};

export const confirmEmail = async (token: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/confirm-email', { token });
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
