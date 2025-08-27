import React from 'react';

interface RecipeImageProps {
  recipe: any;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const RecipeImage: React.FC<RecipeImageProps> = ({ recipe, className = '', size = 'medium' }) => {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const anyFields = recipe.fields as any;
  const maybeImage = anyFields?.Image ?? anyFields?.imageUrl ?? anyFields?.imageUrls ?? null;

  // Handle different image formats
  let imageUrl = null;

  if (Array.isArray(maybeImage) && maybeImage.length > 0) {
    const first = maybeImage[0];
    // Airtable-style object with url or thumbnails
    imageUrl = first?.url ?? first?.thumbnails?.large?.url ?? null;
    // If it's a string in array, use it directly
    if (!imageUrl && typeof first === 'string') {
      imageUrl = first;
    }
  } else if (typeof maybeImage === 'string' && maybeImage.trim() !== '') {
    imageUrl = maybeImage;
  }

  const sizeClasses = {
    small: 'recipe-image-small',
    medium: 'recipe-image-medium',
    large: 'recipe-image-large'
  };

  if (imageUrl) {
    const fullUrl = imageUrl.startsWith('/') ? `${apiBase}${imageUrl}` : imageUrl;
    return (
      <img
        loading="lazy"
        src={fullUrl}
        alt={recipe.fields?.Nom ?? 'image recette'}
        className={`recipe-image ${sizeClasses[size]} ${className}`}
        onError={(e) => {
          // Hide image if it fails to load and show placeholder
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const placeholder = target.nextElementSibling as HTMLElement;
          if (placeholder && placeholder.classList.contains('placeholder')) {
            placeholder.style.display = 'flex';
          }
        }}
      />
    );
  }

  // placeholder
  return (
    <div className={`recipe-image placeholder ${sizeClasses[size]} ${className}`}>
      <div className="placeholder-icon">🍽️</div>
      <div className="placeholder-text">Aucune image</div>
    </div>
  );
};

export default RecipeImage;
