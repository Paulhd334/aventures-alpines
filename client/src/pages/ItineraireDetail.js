// src/pages/ItineraireDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ItineraireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itineraire, setItineraire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [imageError, setImageError] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchItineraire = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/Itineraires/${id}`);
        setItineraire(response.data);
      } catch (error) {
        console.error('Erreur chargement itinéraire:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItineraire();
    }
  }, [id]);

  const getDifficultyColor = (d) => {
    const difficulteLower = d?.toLowerCase() || '';
    if (difficulteLower.includes('facile')) return '#2e7d32';
    if (difficulteLower.includes('moyen')) return '#b85e00';
    if (difficulteLower.includes('difficile')) return '#b71c1c';
    if (difficulteLower.includes('très difficile') || difficulteLower.includes('expert')) return '#4a0072';
    return '#37474f';
  };

  const getDifficultyBg = (d) => {
    const difficulteLower = d?.toLowerCase() || '';
    if (difficulteLower.includes('facile')) return '#e8f5e9';
    if (difficulteLower.includes('moyen')) return '#fff3e0';
    if (difficulteLower.includes('difficile')) return '#ffebee';
    if (difficulteLower.includes('très difficile') || difficulteLower.includes('expert')) return '#f3e5f5';
    return '#f5f5f5';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>Chargement de l'itinéraire...</p>
      </div>
    );
  }

  if (!itineraire) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <h2 style={styles.errorTitle}>Itinéraire non trouvé</h2>
          <p style={styles.errorText}>L'itinéraire que vous recherchez n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => navigate('/routes')}
            style={styles.errorButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ← Retour aux itinéraires
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Bouton retour flottant */}
      <button
        onClick={() => navigate('/routes')}
        style={styles.backButton}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#333';
          e.currentTarget.style.transform = 'translateX(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#000';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        ← Retour
      </button>

      {/* Hero section avec image */}
      <div style={styles.heroSection}>
        <div style={styles.heroImageContainer}>
          <img
            src={!imageError ? (itineraire.image_url || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop") : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop"}
            alt={itineraire.nom}
            style={styles.heroImage}
            onError={() => setImageError(true)}
          />
          <div style={styles.heroOverlay} />
        </div>
        
        <div style={styles.heroContent}>
          <div style={styles.heroTextContainer}>
            <h1 style={styles.heroTitle}>{itineraire.nom}</h1>
            <div style={styles.heroBadges}>
              {itineraire.region && itineraire.region !== "Non précisée" && (
                <span style={styles.regionBadge}>
                  {itineraire.region}
                </span>
              )}
              <span style={{
                ...styles.difficultyBadge,
                backgroundColor: getDifficultyBg(itineraire.difficulte),
                color: getDifficultyColor(itineraire.difficulte),
                border: `1px solid ${getDifficultyColor(itineraire.difficulte)}20`
              }}>
                <span style={{
                  ...styles.difficultyDot,
                  backgroundColor: getDifficultyColor(itineraire.difficulte)
                }} />
                {itineraire.difficulte}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div style={styles.mainContent}>
        {/* Grille d'informations clés */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Durée', value: itineraire.duree },
            { label: 'Distance', value: itineraire.distance },
            { label: 'Dénivelé', value: itineraire.denivele },
            { label: 'Saison', value: itineraire.meilleure_saison }
          ].map((item, index) => (
            <div key={index} style={styles.statCard}>
              <div>
                <div style={styles.statLabel}>{item.label}</div>
                <div style={styles.statValue}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs navigation */}
        <div style={styles.tabsContainer}>
          {['description', 'points d\'intérêt', 'informations'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tabButton,
                backgroundColor: activeTab === tab ? '#000' : '#ffffff',
                color: activeTab === tab ? 'white' : '#000',
                borderColor: activeTab === tab ? '#000' : '#e0e4e8'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Contenu des tabs */}
        <div style={styles.tabContent}>
          {activeTab === 'description' && (
            <div>
              <h2 style={styles.sectionTitle}>Description</h2>
              <p style={styles.description}>
                {itineraire.description}
              </p>
              {itineraire.points_interet && (
                <div style={styles.poiSection}>
                  <h3 style={styles.poiTitle}>Points d'intérêt</h3>
                  <p style={styles.poiText}>{itineraire.points_interet}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'points d\'intérêt' && (
            <div>
              <h2 style={styles.sectionTitle}>Points d'intérêt</h2>
              <p style={styles.description}>
                {itineraire.points_interet || "Aucun point d'intérêt spécifié pour cet itinéraire."}
              </p>
            </div>
          )}

          {activeTab === 'informations' && (
            <div>
              <h2 style={styles.sectionTitle}>Informations pratiques</h2>
              <div style={styles.infoGrid}>
                {[
                  ['Difficulté', itineraire.difficulte],
                  ['Durée', itineraire.duree],
                  ['Distance', itineraire.distance],
                  ['Dénivelé', itineraire.denivele],
                  ['Meilleure saison', itineraire.meilleure_saison],
                  ['Région', itineraire.region]
                ].map(([label, value], index) => (
                  <div key={index} style={styles.infoCard}>
                    <div style={styles.infoLabel}>{label}</div>
                    <div style={styles.infoValue}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actionsContainer}>
          <button
            onClick={() => window.print()}
            style={styles.printButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.borderColor = '#000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = '#e0e4e8';
            }}
          >
            Imprimer
          </button>
          <button
            onClick={() => navigate('/contact')}
            style={styles.contactButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Contacter un guide
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Styles object
const styles = {
  container: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    position: 'relative'
  },
  loadingContainer: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '2px solid #e0e4e8',
    borderTopColor: '#000',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  loadingText: {
    color: '#4a5b6b',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  errorContainer: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc'
  },
  errorContent: {
    textAlign: 'center',
    padding: '3rem',
    maxWidth: '500px'
  },
  errorTitle: {
    color: '#000',
    fontSize: '2rem',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  errorText: {
    color: '#5a6b7c',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  errorButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  backButton: {
    position: 'fixed',
    top: '2rem',
    left: '2rem',
    padding: '0.6rem 1.2rem',
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    zIndex: 100,
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  heroSection: {
    position: 'relative',
    height: '500px',
    backgroundColor: '#000'
  },
  heroImageContainer: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden'
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease'
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '3rem 2rem'
  },
  heroTextContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  heroTitle: {
    color: 'white',
    fontSize: '3.5rem',
    fontWeight: '600',
    margin: '0 0 1rem 0',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
  },
  heroBadges: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  regionBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid rgba(255,255,255,0.3)',
    backdropFilter: 'blur(4px)'
  },
  difficultyBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    border: '1px solid',
    backdropFilter: 'blur(4px)'
  },
  difficultyDot: {
    width: '8px',
    height: '8px',
    borderRadius: '0',
    display: 'inline-block'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1px',
    backgroundColor: '#e0e4e8',
    border: '1px solid #e0e4e8',
    marginBottom: '3rem'
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#7e8c9e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '0.25rem'
  },
  statValue: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#000'
  },
  tabsContainer: {
    display: 'flex',
    gap: '1px',
    backgroundColor: '#e0e4e8',
    border: '1px solid #e0e4e8',
    marginBottom: '2rem'
  },
  tabButton: {
    flex: 1,
    padding: '1rem',
    border: '1px solid',
    fontSize: '0.9rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tabContent: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e4e8',
    padding: '2.5rem',
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.8rem',
    fontWeight: '600',
    color: '#000',
    marginBottom: '1.5rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    borderBottom: '2px solid #000',
    paddingBottom: '0.5rem',
    display: 'inline-block'
  },
  description: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#3f4a5a',
    marginBottom: '2rem'
  },
  poiSection: {
    marginTop: '2rem',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e0e4e8'
  },
  poiTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#000',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  poiText: {
    fontSize: '1rem',
    lineHeight: '1.7',
    color: '#4a5b6b'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem'
  },
  infoCard: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e0e4e8'
  },
  infoLabel: {
    fontSize: '0.8rem',
    color: '#7e8c9e',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    marginBottom: '0.5rem'
  },
  infoValue: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#000'
  },
  actionsContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    padding: '2rem 0',
    borderTop: '1px solid #e0e4e8'
  },
  printButton: {
    padding: '1rem 2rem',
    backgroundColor: 'transparent',
    color: '#000',
    border: '1px solid #e0e4e8',
    fontSize: '0.9rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  },
  contactButton: {
    padding: '1rem 2rem',
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease'
  }
};

export default ItineraireDetail;