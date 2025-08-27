import React, { useState } from 'react';

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
  let imageUrls: string[] = [];

  if (Array.isArray(maybeImage) && maybeImage.length > 0) {
    // Handle array of images
    imageUrls = maybeImage.map((img: any) => {
      if (typeof img === 'string') {
        return img.startsWith('/') ? `${apiBase}${img}` : img;
      } else if (img?.url) {
        // Airtable-style object with url
        return img.url.startsWith('/') ? `${apiBase}${img.url}` : img.url;
      } else if (img?.thumbnails?.large?.url) {
        // Airtable-style with thumbnails
        return img.thumbnails.large.url.startsWith('/') ? `${apiBase}${img.thumbnails.large.url}` : img.thumbnails.large.url;
      }
      return null;
    }).filter(Boolean) as string[];
  } else if (typeof maybeImage === 'string' && maybeImage.trim() !== '') {
    // Handle single image
    imageUrls = [maybeImage.startsWith('/') ? `${apiBase}${maybeImage}` : maybeImage];
  }

  const sizeClasses = {
    small: 'recipe-image-small',
    medium: 'recipe-image-medium',
    large: 'recipe-image-large'
  };

  // If no images, show placeholder
  if (imageUrls.length === 0) {
    return (
      <div className={`recipe-image placeholder ${sizeClasses[size]} ${className}`}>
        <div className="placeholder-icon">🍽️</div>
        <div className="placeholder-text">Aucune image</div>
      </div>
    );
  }

  // If only one image, show single image
  if (imageUrls.length === 1) {
    return (
      <img
        loading="lazy"
        src={imageUrls[0]}
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

  // If multiple images, show carousel
  return (
    <div className={`recipe-image-carousel ${sizeClasses[size]} ${className}`}>
      <ImageCarousel images={imageUrls} alt={recipe.fields?.Nom ?? 'images recette'} />
    </div>
  );
};

// Simple image carousel component
const ImageCarousel: React.FC<{ images: string[]; alt: string }> = ({ images, alt }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="image-carousel">
      <div className="carousel-container">
        <img
          loading="lazy"
          src={images[currentIndex]}
          alt={`${alt} - Image ${currentIndex + 1}`}
          className="carousel-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error('Image failed to load:', target.src);
            // Optionally remove failed image from array
          }}
        />
        
        {images.length > 1 && (
          <>
            <button 
              className="carousel-nav carousel-prev"
              onClick={prevImage}
              aria-label="Image précédente"
            >
              ‹
            </button>
            <button 
              className="carousel-nav carousel-next"
              onClick={nextImage}
              aria-label="Image suivante"
            >
              ›
            </button>
            
            <div className="carousel-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecipeImage;
