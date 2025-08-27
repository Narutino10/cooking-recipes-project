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
