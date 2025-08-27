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

// Types pour les commentaires
export interface Comment {
  id: string;
  content: string;
  articleId: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  parentId?: string; // Pour les réponses aux commentaires
  replies?: Comment[];
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
  articleId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content: string;
}

export interface CommentsResponse {
  comments: Comment[];
  total: number;
}

// Services pour les commentaires
export const getComments = async (articleId: string, page = 1, limit = 10): Promise<CommentsResponse> => {
  const response = await api.get(`/articles/${articleId}/comments?page=${page}&limit=${limit}`);
  return response.data;
};

export const getCommentById = async (id: string): Promise<Comment> => {
  const response = await api.get(`/comments/${id}`);
  return response.data;
};

export const createComment = async (data: CreateCommentDto): Promise<Comment> => {
  const response = await api.post('/comments', data);
  return response.data;
};

export const updateComment = async (id: string, data: UpdateCommentDto): Promise<Comment> => {
  const response = await api.put(`/comments/${id}`, data);
  return response.data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`/comments/${id}`);
};

export const likeComment = async (id: string): Promise<{ likeCount: number }> => {
  const response = await api.post(`/comments/${id}/like`);
  return response.data;
};

export const unlikeComment = async (id: string): Promise<{ likeCount: number }> => {
  const response = await api.delete(`/comments/${id}/like`);
  return response.data;
};

export const getCommentReplies = async (commentId: string): Promise<Comment[]> => {
  const response = await api.get(`/comments/${commentId}/replies`);
  return response.data;
};
