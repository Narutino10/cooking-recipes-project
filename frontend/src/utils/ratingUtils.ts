import { Rating } from '../services/ratingService';

/**
 * Formate une date en français
 */
export const formatRatingDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Génère les initiales d'un nom
 */
export const getUserInitials = (name: string | undefined): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Calcule la distribution des notes
 */
export const calculateRatingDistribution = (ratings: Rating[]) => {
  const total = ratings.length;
  return [5, 4, 3, 2, 1].map(stars => {
    const count = ratings.filter(r => r.rating === stars).length;
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return { stars, count, percentage };
  });
};

/**
 * Formate le nombre d'avis
 */
export const formatRatingCount = (count: number): string => {
  return `${count} ${count > 1 ? 'avis' : 'avis'}`;
};
