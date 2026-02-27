// src/components/HikingRoute.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const HikingRoute = ({ itineraire }) => {
  const navigate = useNavigate();

  if (!itineraire || typeof itineraire !== "object") {
    return null;
  }

  const {
    id,
    nom = "Itinéraire sans nom",
    difficulte = "Non spécifié",
    duree = "Non précisée",
    distance = "Non précisée",
    denivele = "Non précisé",
    description = "Description non disponible",
    meilleure_saison = "Non précisée",
    region = "Non précisée",
    image_url
  } = itineraire;

  const getDifficultyColor = (d) => {
    const difficulteLower = d?.toLowerCase() || '';
    if (difficulteLower.includes('facile')) return '#2e7d32';
    if (difficulteLower.includes('moyen')) return '#b85e00';
    if (difficulteLower.includes('difficile')) return '#b71c1c';
    if (difficulteLower.includes('très difficile') || difficulteLower.includes('expert')) return '#4a0072';
    return '#37474f';
  };

  const handleClick = () => {
    navigate(`/itineraires/${id}`);
  };

  const imageSrc = image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop";

  return (
    <article 
      onClick={handleClick}
      style={{ 
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: '1px solid #e0e4e8',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor = '#c0c8d0';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = '#e0e4e8';
      }}
    >
      {/* Image container - angles droits */}
      <div style={{ 
        position: 'relative', 
        height: '200px', 
        backgroundColor: '#f5f7fa',
        borderBottom: '1px solid #e0e4e8'
      }}>
        <img
          src={imageSrc}
          alt={nom}
          loading="lazy"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop";
          }}
        />

        {/* Badge difficulté - carré avec bords droits */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          backgroundColor: getDifficultyColor(difficulte),
          color: 'white',
          padding: '6px 12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          border: 'none'
        }}>
          {difficulte}
        </div>

        {/* Badge région - carré avec bords droits */}
        {region && region !== "Non précisée" && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            backgroundColor: 'rgba(0,0,0,0.75)',
            color: 'white',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: 'none'
          }}>
            {region}
          </div>
        )}
      </div>

      {/* Content - structure carrée */}
      <div style={{ 
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        flex: 1
      }}>
        {/* Titre */}
        <h3 style={{ 
          margin: 0,
          fontSize: '1.2rem',
          fontWeight: '600',
          color: '#1a2634',
          lineHeight: 1.3,
          textTransform: 'uppercase',
          letterSpacing: '0.3px'
        }}>
          {nom}
        </h3>

        {/* Métriques en grille carrée */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.5rem',
          padding: '0.5rem 0',
          borderTop: '1px solid #edf0f4',
          borderBottom: '1px solid #edf0f4'
        }}>
          {[
            { label: 'Durée', value: duree },
            { label: 'Distance', value: distance },
            { label: 'Dénivelé', value: denivele }
          ].map((item, index) => (
            <div key={index} style={{
              textAlign: 'center',
              padding: '0.25rem'
            }}>
              <div style={{
                fontSize: '0.7rem',
                color: '#7e8c9e',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                marginBottom: '2px'
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#1a2634'
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Description - texte compact */}
        {description && (
          <p style={{
            margin: 0,
            fontSize: '0.85rem',
            lineHeight: '1.5',
            color: '#3f4a5a'
          }}>
            {description.length > 100 
              ? `${description.substring(0, 100)}...` 
              : description}
          </p>
        )}

        {/* Saison - badge carré */}
        {meilleure_saison && meilleure_saison !== "Non précisée" && (
          <div style={{ 
            display: 'inline-block',
            backgroundColor: '#edf2f7',
            color: '#2a3a4a',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
            border: 'none',
            width: 'fit-content'
          }}>
            {meilleure_saison}
          </div>
        )}

        {/* Indicateur clic - minimal */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '0.75rem',
          fontSize: '0.65rem',
          color: '#9aabbb',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderTop: '1px solid #edf0f4',
          textAlign: 'right'
        }}>
          Cliquez pour détails →
        </div>
      </div>
    </article>
  );
};

HikingRoute.propTypes = {
  itineraire: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nom: PropTypes.string,
    image_url: PropTypes.string,
    difficulte: PropTypes.string,
    duree: PropTypes.string,
    distance: PropTypes.string,
    denivele: PropTypes.string,
    description: PropTypes.string,
    meilleure_saison: PropTypes.string,
    region: PropTypes.string
  })
};

HikingRoute.defaultProps = {
  itineraire: {
    nom: "Itinéraire sans nom",
    difficulte: "Non spécifié",
    duree: "Non précisée",
    distance: "Non précisée",
    denivele: "Non précisé",
    description: "Description non disponible",
    meilleure_saison: "Non précisée",
    region: "Non précisée"
  }
};

export default HikingRoute;