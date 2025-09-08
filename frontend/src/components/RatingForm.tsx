import React, { useState, useEffect } from 'react';
import '../styles/components/RatingForm.scss';

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

interface RatingFormProps {
  recipeId: string;
  onRatingSubmit?: (rating: number, comment: string) => void;
  existingRating?: Rating | null;
}

const RatingForm: React.FC<RatingFormProps> = ({
  recipeId,
  onRatingSubmit,
  existingRating,
}) => {
  const [rating, setRating] = useState<number>(existingRating?.rating || 0);
  const [comment, setComment] = useState<string>(existingRating?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    if (existingRating) {
      setRating(existingRating.rating);
      setComment(existingRating.comment);
    }
  }, [existingRating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onRatingSubmit) {
        await onRatingSubmit(rating, comment);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoverRating || rating);

      return (
        <button
          key={index}
          type="button"
          className={`star ${isActive ? 'active' : ''}`}
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </button>
      );
    });
  };

  const getRatingText = () => {
    const currentRating = hoverRating || rating;
    switch (currentRating) {
      case 1: return 'Très mauvais';
      case 2: return 'Mauvais';
      case 3: return 'Moyen';
      case 4: return 'Bon';
      case 5: return 'Excellent';
      default: return 'Évaluez cette recette';
    }
  };

  return (
    <div className="rating-form">
      <h3>{existingRating ? 'Modifier votre avis' : 'Donnez votre avis'}</h3>

      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Note :</label>
          <div className="stars-container">
            {renderStars()}
          </div>
          <span className="rating-text">{getRatingText()}</span>
        </div>

        <div className="comment-section">
          <label htmlFor="comment">Commentaire (optionnel) :</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience avec cette recette..."
            rows={4}
            maxLength={500}
          />
          <span className="char-count">{comment.length}/500</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="submit-btn"
        >
          {isSubmitting ? 'Envoi en cours...' : (existingRating ? 'Modifier' : 'Publier')}
        </button>
      </form>
    </div>
  );
};

export default RatingForm;
