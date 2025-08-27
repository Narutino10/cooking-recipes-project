import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

// Types pour les articles
export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  category: string;
  tags: string[];
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  isPublished: boolean;
  isFeatured?: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface UpdateArticleDto {
  title?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  isPublished?: boolean;
  isFeatured?: boolean;
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

// Services pour les articles
export const getArticles = async (page = 1, limit = 10, category?: string): Promise<ArticlesResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (category && category !== 'all') {
    params.append('category', category);
  }

  const response = await api.get(`/articles?${params}`);
  return response.data;
};

export const getArticleById = async (id: string): Promise<Article> => {
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

export const getFeaturedArticles = async (): Promise<Article[]> => {
  const response = await api.get('/articles/featured');
  return response.data;
};

export const getArticlesByCategory = async (category: string, page = 1, limit = 10): Promise<ArticlesResponse> => {
  const response = await api.get(`/articles/category/${category}?page=${page}&limit=${limit}`);
  return response.data;
};

export const searchArticles = async (query: string, page = 1, limit = 10): Promise<ArticlesResponse> => {
  const response = await api.get(`/articles/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
  return response.data;
};

export const createArticle = async (data: CreateArticleDto): Promise<Article> => {
  const response = await api.post('/articles', data);
  return response.data;
};

export const updateArticle = async (id: string, data: UpdateArticleDto): Promise<Article> => {
  const response = await api.put(`/articles/${id}`, data);
  return response.data;
};

export const deleteArticle = async (id: string): Promise<void> => {
  await api.delete(`/articles/${id}`);
};

export const uploadArticleImage = async (file: File): Promise<{ imageUrl: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/uploads/article-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const likeArticle = async (id: string): Promise<{ likeCount: number }> => {
  const response = await api.post(`/articles/${id}/like`);
  return response.data;
};

export const unlikeArticle = async (id: string): Promise<{ likeCount: number }> => {
  const response = await api.delete(`/articles/${id}/like`);
  return response.data;
};

export const incrementViews = async (id: string): Promise<void> => {
  await api.post(`/articles/${id}/view`);
};
