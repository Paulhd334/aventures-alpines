import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ActivityCard = ({ activity }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Compatibilité avec les deux formats de données
  const name = activity?.name || activity?.nom || 'Activité';
  const difficulty = activity?.difficulty || activity?.difficulte || 'Niveau non spécifié';
  const description = activity?.description || '';
  const image = activity?.image || activity?.image_url || '/default-mountain.jpg';
  const price = activity?.price || activity?.prix;
  const duration = activity?.duration || activity?.duree || 'Durée variable';
  const location = activity?.location || activity?.lieu || 'Montagne';
  const type = activity?.type || 'activité';
  const season = activity?.season || activity?.saison || 'Toutes saisons';

  // Vérifier si l'utilisateur est connecté
  const checkLogin = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Connectez-vous pour réserver');
      setTimeout(() => navigate('/login'), 1500);
      return null;
    }
    
    try {
      return JSON.parse(userStr);
    } catch {
      setError('Session invalide');
      return null;
    }
  };

  // Gérer la réservation
  const handleReservation = async () => {
    const user = checkLogin();
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const date = prompt('Entrez la date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
      if (!date) {
        setLoading(false);
        return;
      }
      
      const personnes = prompt('Nombre de personnes:', '1');
      if (!personnes) {
        setLoading(false);
        return;
      }
      
      // Ici, tu feras l'appel API vers ton serveur
      console.log('Réservation:', {
        userId: user.id,
        activityId: activity?.id,
        activityName: name,
        date: date,
        nbPersonnes: parseInt(personnes)
      });
      
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('✅ Réservation effectuée avec succès !');
      // Rediriger vers le profil
      navigate('/profile');
      
    } catch (err) {
      setError('Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

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
          src={image}
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
            {difficulty}
          </span>
        </div>
        
        {/* Badge de type */}
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
          marginBottom: '0.75rem'
        }}>
          {name}
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
            
            {/* Saison */}
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
          </div>

          <div style={{ textAlign: 'right' }}>
            {/* Prix (simplifié) */}
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 300,
              letterSpacing: '0.02em'
            }}>
              {price ? `${price}${typeof price === 'string' && !price.includes('€') ? '€' : ''}` : ''}
            </div>
            
            {/* Lieu */}
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--gray-dark)',
              marginTop: '0.25rem'
            }}>
              📍 {location}
            </div>
          </div>
        </div>

        {/* Bouton de réservation en bas à gauche */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--gray-light)',
          display: 'flex',
          justifyContent: 'flex-start'  // Aligné à gauche
        }}>
          <button
            onClick={handleReservation}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--black)',
              border: '1px solid var(--black)',
              padding: '0.5rem 1.5rem',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all var(--transition-fast)',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--black)';
                e.currentTarget.style.color = 'var(--white)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--black)';
              }
            }}
          >
            {loading ? 'Réservation...' : 'Réserver'}
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '2px',
            fontSize: '0.75rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;