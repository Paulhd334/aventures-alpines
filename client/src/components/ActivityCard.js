import React from 'react';

const ActivityCard = ({ activity }) => {
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

    switch(difficulty) {
      case 'Facile':
        return { ...baseStyle, borderColor: 'var(--gray-medium)', color: 'var(--gray-dark)' };
      case 'Intermédiaire':
        return { ...baseStyle, borderColor: 'var(--gray-dark)', color: 'var(--charcoal)' };
      case 'Difficile':
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
          src={activity.image} 
          alt={activity.name}
          className="card-image"
          style={imageStyle}
        />
        {/* Badge de difficulté */}
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}>
          <span style={getDifficultyStyle(activity.difficulty)}>
            {activity.difficulty}
          </span>
        </div>
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
          {activity.name}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--charcoal)',
          lineHeight: 1.6,
          marginBottom: '1rem',
          flex: 1
        }}>
          {activity.description}
        </p>

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
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                marginRight: '0.5rem',
                opacity: 0.6
              }}>⏱</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-dark)' }}>
                {activity.duration || '2-4h'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ 
                fontSize: '0.75rem', 
                marginRight: '0.5rem',
                opacity: 0.6
              }}>👤</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--gray-dark)' }}>
                {activity.participants || '1-8'}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 300,
              letterSpacing: '0.02em'
            }}>
              {activity.price || 'Sur devis'}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--gray-dark)',
              marginTop: '0.25rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Détails →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;