import React from 'react';

const StarRating = ({ rating }) => {
  // Assurez-vous que la note est un nombre et qu'elle est comprise entre 1 et 5
  const normalizedRating = Math.max(0, Math.min(5, rating));
  
  // Créez un tableau pour déterminer si chaque étoile doit être pleine ou vide
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= normalizedRating ? '★' : '☆');
  }
  
  return (
    <div>
      {stars.map((star, index) => (
        <span key={index}>{star}</span>
      ))}
    </div>
  );
};

export default StarRating;
