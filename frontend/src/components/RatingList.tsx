import React from 'react';
import { Rating } from '../services/ratingService';
import RatingItem from './RatingItem';

interface RatingListProps {
  ratings: Rating[];
  onEditRating?: (rating: Rating) => void;
  onDeleteRating?: (ratingId: string) => void;
  currentUserId?: string;
}

const RatingList: React.FC<RatingListProps> = ({
  ratings,
  onEditRating,
  onDeleteRating,
  currentUserId,
}) => {
  if (ratings.length === 0) {
    return (
      <div className="no-ratings">
        <p>🎉 Soyez le premier à donner votre avis sur cette recette !</p>
      </div>
    );
  }

  return (
    <div className="ratings-list">
      <h4>Avis des utilisateurs</h4>
      {ratings.map(rating => (
        <RatingItem
          key={rating.id}
          rating={rating}
          onEditRating={onEditRating}
          onDeleteRating={onDeleteRating}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
};

export default RatingList;
