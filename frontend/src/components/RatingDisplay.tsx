import React from 'react';
import './RatingDisplay.scss';

interface Rating {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface RatingStats {
  average: number;
  count: number;
}

interface RatingDisplayProps {
  ratings: Rating[];
  stats: RatingStats;
  onEditRating?: (rating: Rating) => void;
  onDeleteRating?: (ratingId: string) => void;
  currentUserId?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  ratings,
  stats,
  onEditRating,
  onDeleteRating,
  currentUserId,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="rating-display">
      {/* Statistiques globales */}
      <div className="rating-stats">
        <div className="stats-main">
          <div className="average-rating">
            <span className="average-number">{stats.average.toFixed(1)}</span>
            <div className="stars-container">
              {renderStars(Math.round(stats.average), 'medium')}
            </div>
          </div>
          <div className="stats-info">
            <span className="total-ratings">
              {stats.count} {stats.count > 1 ? 'avis' : 'avis'}
            </span>
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratings.filter(r => r.rating === stars).length;
                const percentage = stats.count > 0 ? (count / stats.count) * 100 : 0;
                return (
                  <div key={stars} className="distribution-bar">
                    <span className="star-count">{stars}★</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="count-text">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des avis */}
      <div className="ratings-list">
        <h4>Avis des utilisateurs</h4>
        {ratings.length === 0 ? (
          <div className="no-ratings">
            <p>🎉 Soyez le premier à donner votre avis sur cette recette !</p>
          </div>
        ) : (
          ratings.map(rating => (
            <div key={rating.id} className="rating-item">
              <div className="rating-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {getInitials(rating.user.name)}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{rating.user.name}</span>
                    <span className="rating-date">
                      {formatDate(rating.createdAt)}
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

              {currentUserId === rating.userId && (
                <div className="rating-actions">
                  {onEditRating && (
                    <button
                      className="edit-btn"
                      onClick={() => onEditRating(rating)}
                    >
                      ✏️ Modifier
                    </button>
                  )}
                  {onDeleteRating && (
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteRating(rating.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RatingDisplay;
