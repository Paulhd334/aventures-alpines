// src/pages/Activities.js - VERSION QUI AFFICHE LES 3 STATIONS DE SKI
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Activities = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const API_BASE_URL = 'http://localhost:5000';

  // Charger UNIQUEMENT les stations de ski
  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/api/ski/stations`);
        const data = response.data;
        
        console.log('✅ Stations de ski chargées:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }
        
        setStations(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur de chargement:', err);
        setError('Impossible de charger les stations de ski. Vérifiez que le serveur est en marche.');
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  // Filtrer par recherche
  const filteredStations = searchTerm.trim() === '' 
    ? stations 
    : stations.filter(station => {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          station.nom || '',
          station.description || '',
          station.region || '',
          station.type_station || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date non disponible';
    }
  };

  if (loading) {
    return (
      <section style={{ padding: '4rem 0', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p style={{ color: '#666' }}>Chargement des stations de ski...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '4rem 0', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ 
            padding: '3rem 1.5rem', 
            textAlign: 'center',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              fontWeight: '300',
              marginBottom: '1rem',
              color: '#000'
            }}>
              Erreur de chargement
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 300,
              marginBottom: '1rem',
              color: '#000'
            }}>
              Nos stations de ski partenaires
            </h1>
            
            <p style={{
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              fontSize: '1.125rem',
              lineHeight: 1.6
            }}>
              Découvrez nos {stations.length} stations de ski partenaires 
              avec leurs conditions d'enneigement en temps réel.
            </p>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <section style={{ padding: '4rem 0', minHeight: '60vh' }}>
        <div className="container">
          {/* Barre de recherche */}
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Rechercher une station par nom, région..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.875rem',
                  color: '#666'
                }}>
                  {filteredStations.length} résultat{filteredStations.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Résultats */}
          <div>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              marginBottom: '1.5rem'
            }}>
              <p style={{ color: '#666' }}>
                {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} trouvée{filteredStations.length !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </p>
            </div>

            {filteredStations.length === 0 ? (
              <div style={{ 
                padding: '3rem 1.5rem', 
                textAlign: 'center',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '400',
                  marginBottom: '1rem',
                  color: '#000'
                }}>
                  Aucune station trouvée
                </h3>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Modifiez vos critères de recherche.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                gap: '2rem'
              }}>
                {filteredStations.map(station => (
                  <div 
                    key={station.id} 
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
                    }}
                  >
                    {/* Image de la station */}
                    <div style={{
                      height: '220px',
                      overflow: 'hidden',
                      backgroundColor: '#f9fafb',
                      position: 'relative'
                    }}>
                      <img 
                        src={station.photo_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop'} 
                        alt={station.nom}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop';
                        }}
                      />
                      
                      {/* Badge enneigement */}
                      {station.enneigement_actuel && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          padding: '0.5rem 1rem',
                          background: station.enneigement_actuel > 100 
                            ? 'linear-gradient(135deg, #2e7d32, #1b5e20)'
                            : station.enneigement_actuel > 50
                            ? 'linear-gradient(135deg, #b85e00, #8b4500)'
                            : 'linear-gradient(135deg, #b71c1c, #8b0000)',
                          color: 'white',
                          borderRadius: '30px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                        }}>
                          {station.enneigement_actuel} cm
                        </div>
                      )}

                      {/* Badge type */}
                      <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '1rem',
                        padding: '0.35rem 1rem',
                        background: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(5px)',
                        color: 'white',
                        borderRadius: '30px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {station.type_station || 'Station de ski'}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div style={{ padding: '1.75rem', flex: 1 }}>
                      {/* Nom et région */}
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: '600', 
                          marginBottom: '0.35rem',
                          color: '#000' 
                        }}>
                          {station.nom}
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.95rem' }}>
                          {station.region}
                        </p>
                      </div>

                      {/* Description courte */}
                      <p style={{ 
                        color: '#444', 
                        fontSize: '0.9rem', 
                        lineHeight: 1.6,
                        marginBottom: '1.5rem',
                        borderLeft: '3px solid #000',
                        paddingLeft: '1rem',
                        fontStyle: 'italic'
                      }}>
                        {station.description?.substring(0, 100)}...
                      </p>

                      {/* Grille de détails */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        background: '#f8fafc',
                        padding: '1rem',
                        borderRadius: '8px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>Altitude</div>
                          <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>
                            {station.altitude_min}m - {station.altitude_max}m
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>Pistes</div>
                          <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{station.nb_pistes}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>Remontées</div>
                          <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{station.nb_remontees}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase' }}>Km pistes</div>
                          <div style={{ fontSize: '1rem', fontWeight: '500', color: '#333' }}>{station.km_pistes} km</div>
                        </div>
                      </div>

                      {/* Prix et saison */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: '#000',
                        color: 'white',
                        borderRadius: '8px'
                      }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Prix journée</span>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{station.prix_journee}€</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Saison</span>
                          <div style={{ fontSize: '0.9rem' }}>
                            {station.ouverture ? formatDate(station.ouverture).split(' ')[1] : 'Déc'} - 
                            {station.fermeture ? formatDate(station.fermeture).split(' ')[1] : 'Avr'}
                          </div>
                        </div>
                      </div>

                      {/* Lien site web */}
                      {station.site_web && (
                        <a 
                          href={station.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            color: '#000',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '500',
                            borderBottom: '1px solid #000',
                            paddingBottom: '2px'
                          }}
                          onMouseEnter={(e) => e.target.style.color = '#666'}
                          onMouseLeave={(e) => e.target.style.color = '#000'}
                        >
                          Voir le site officiel →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Style pour l'animation de spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Activities;