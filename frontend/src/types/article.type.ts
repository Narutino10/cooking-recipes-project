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
