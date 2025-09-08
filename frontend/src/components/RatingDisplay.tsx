import React from 'react';
import '../styles/components/RatingDisplay.scss';
import { Rating, RatingStats } from '../services/ratingService';
import RatingStatsComponent from './RatingStats';
import RatingList from './RatingList';

interface RatingDisplayProps {
  ratings: Rating[];
  stats: RatingStats;
  onEditRating?: (rating: Rating) => void;
  onDeleteRating?: (ratingId: string) => void;
  currentUserId?: string;
}

/**
 * Composant principal pour afficher les ratings et statistiques d'une recette
 */
const RatingDisplay: React.FC<RatingDisplayProps> = ({
  ratings,
  stats,
  onEditRating,
  onDeleteRating,
  currentUserId,
}) => {
  return (
    <div className="rating-display">
      {/* Section des statistiques globales */}
      <RatingStatsComponent stats={stats} ratings={ratings} />

      {/* Section de la liste des avis */}
      <RatingList
        ratings={ratings}
        onEditRating={onEditRating}
        onDeleteRating={onDeleteRating}
        currentUserId={currentUserId}
      />
    </div>
  );
};

export default RatingDisplay;
