import React from 'react';
import { Rating } from '../services/ratingService';
import { formatRatingDate, getUserInitials } from '../utils/ratingUtils';

interface RatingItemProps {
  rating: Rating;
  onEditRating?: (rating: Rating) => void;
  onDeleteRating?: (ratingId: string) => void;
  currentUserId?: string;
}

const RatingItem: React.FC<RatingItemProps> = ({
  rating,
  onEditRating,
  onDeleteRating,
  currentUserId,
}) => {
  const renderStars = (rating: number, size: 'small' | 'medium' = 'small') => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : ''} ${size}`}
      >
        ★
      </span>
    ));
  };

  const isOwnRating = currentUserId === rating.userId;

  return (
    <div className="rating-item">
      <div className="rating-header">
        <div className="user-info">
          <div className="user-avatar">
            {getUserInitials(rating.user?.name)}
          </div>
          <div className="user-details">
            <span className="user-name">
              {rating.user?.name || 'Utilisateur anonyme'}
            </span>
            <span className="rating-date">
              {formatRatingDate(rating.createdAt)}
            </span>
          </div>
        </div>
        <div className="rating-stars">
          {renderStars(rating.rating)}
        </div>
      </div>

      {rating.comment && (
        <div className="rating-comment">
          <p>{rating.comment}</p>
        </div>
      )}

      {isOwnRating && (
        <div className="rating-actions">
          {onEditRating && (
            <button
              className="edit-btn"
              onClick={() => onEditRating(rating)}
              aria-label="Modifier l'avis"
            >
              ✏️ Modifier
            </button>
          )}
          {onDeleteRating && (
            <button
              className="delete-btn"
              onClick={() => onDeleteRating(rating.id)}
              aria-label="Supprimer l'avis"
            >
              🗑️ Supprimer
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RatingItem;
