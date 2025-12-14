import React from 'react';

const ActivityCard = ({ activity }) => {
  // Compatibilité avec les deux formats de données
  const name = activity.name || activity.nom;
  const difficulty = activity.difficulty || activity.difficulte;
  const description = activity.description;
  const image = activity.image || activity.image_url;  // ← ICI LE CHANGEMENT
  const price = activity.price || activity.prix;
  const duration = activity.duration || activity.duree;
  const location = activity.location || activity.lieu;
  const type = activity.type;
  const season = activity.season || activity.saison;

  const cardStyle = {
    backgroundColor: 'var(--white)',
    border: '1px solid var(--gray-light)',
    borderRadius: 0,
    overflow: 'hidden',
    transition: 'all var(--transition-smooth)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const imageContainerStyle = {
    position: 'relative',
    overflow: 'hidden',
    height: '200px',
    width: '100%'
  };

  const imageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'grayscale(100%)',
    transition: 'filter var(--transition-smooth)'
  };

  const getDifficultyStyle = (difficulty) => {
    const baseStyle = {
      fontSize: '0.75rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      padding: '0.25rem 0.75rem',
      border: '1px solid',
      display: 'inline-block'
    };

    const diff = difficulty || '';
    switch(diff.toLowerCase()) {
      case 'facile':
      case 'débutant':
        return { ...baseStyle, borderColor: 'var(--gray-medium)', color: 'var(--gray-dark)' };
      case 'intermédiaire':
        return { ...baseStyle, borderColor: 'var(--gray-dark)', color: 'var(--charcoal)' };
      case 'difficile':
      case 'expert':
        return { ...baseStyle, borderColor: 'var(--black)', color: 'var(--black)' };
      default:
        return { ...baseStyle, borderColor: 'var(--gray-light)', color: 'var(--gray-medium)' };
    }
  };

  return (
    <div 
      className="card"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-intense)';
        e.currentTarget.style.borderColor = 'var(--charcoal)';
        const img = e.currentTarget.querySelector('.card-image');
        if (img) img.style.filter = 'grayscale(0%)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--gray-light)';
        const img = e.currentTarget.querySelector('.card-image');
        if (img) img.style.filter = 'grayscale(100%)';
      }}
    >
      {/* Image */}
      <div style={imageContainerStyle}>
        <img 
          src={image || '/default-mountain.jpg'} // Image par défaut si aucune
          alt={name}
          className="card-image"
          style={imageStyle}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/default-mountain.jpg';
          }}
        />
        {/* Badge de difficulté */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          <span style={getDifficultyStyle(difficulty)}>
            {difficulty || 'N/A'}
          </span>
        </div>
        
        {/* Badge de type */}
        {type && (
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '0.25rem 0.75rem',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            {type}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div style={{
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Titre */}
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: 300,
          letterSpacing: '-0.01em',
          color: 'var(--black-soft)',
          marginBottom: '0.75rem',
          transition: 'font-weight var(--transition-fast)'
        }}>
          {name || 'Activité'}
        </h3>

        {/* Description */}
        {description && (
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--charcoal)',
            lineHeight: 1.6,
            marginBottom: '1rem',
            flex: 1
          }}>
            {description.length > 120 
              ? `${description.substring(0, 120)}...` 
              : description}
          </p>
        )}

        {/* Métadonnées */}
        <div style={{
          borderTop: '1px solid var(--gray-light)',
          paddingTop: '1rem',
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Durée */}
            {duration && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  marginRight: '0.5rem',
                  opacity: 0.6
                }}>⏱</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-dark)' }}>
                  {duration}
                </span>
              </div>
            )}
            
            {/* Saison */}
            {season && (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.75rem', 
                  marginRight: '0.5rem',
                  opacity: 0.6
                }}>🌤️</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--gray-dark)' }}>
                  {season}
                </span>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            {/* Prix */}
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 300,
              letterSpacing: '0.02em'
            }}>
              {price ? `${price}${typeof price === 'string' && !price.includes('€') ? '€' : ''}` : 'Sur devis'}
            </div>
            
            {/* Lieu */}
            {location && (
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--gray-dark)',
                marginTop: '0.25rem'
              }}>
                📍 {location}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;