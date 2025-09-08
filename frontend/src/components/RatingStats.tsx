import React from 'react';
import { RatingStats as RatingStatsType, Rating } from '../services/ratingService';
import { calculateRatingDistribution, formatRatingCount } from '../utils/ratingUtils';

interface RatingStatsProps {
  stats: RatingStatsType;
  ratings: Rating[];
}

const RatingStats: React.FC<RatingStatsProps> = ({ stats, ratings }) => {
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

  const distribution = calculateRatingDistribution(ratings);

  return (
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
            {formatRatingCount(stats.count)}
          </span>
          <div className="rating-distribution">
            {distribution.map(({ stars, count, percentage }) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RatingStats;
