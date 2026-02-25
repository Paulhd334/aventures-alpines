// src/pages/Activities.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Activities = () => {
  const [offresSki, setOffresSki] = useState([]);
  const [offresRandonnee, setOffresRandonnee] = useState([]);
  const [offresEscalade, setOffresEscalade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  // Charger les offres depuis la BDD
  useEffect(() => {
    const fetchOffres = async () => {
      try {
        setLoading(true);
        
        // Charger les offres de ski
        const skiResponse = await axios.get(`${API_BASE_URL}/api/ski/offres`);
        // Prendre seulement les 3 premières
        setOffresSki(skiResponse.data.slice(0, 3));
        
        // Charger les offres de randonnée
        const randonneeResponse = await axios.get(`${API_BASE_URL}/api/randonnee/offres`);
        setOffresRandonnee(randonneeResponse.data.slice(0, 3));
        
        // Charger les offres d'escalade
        const escaladeResponse = await axios.get(`${API_BASE_URL}/api/escalade/offres`);
        setOffresEscalade(escaladeResponse.data.slice(0, 3));
        
        setLoading(false);
      } catch (err) {
        console.error('❌ Erreur de chargement:', err);
        setError('Impossible de charger les offres');
        setLoading(false);
      }
    };

    fetchOffres();
  }, []);

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
            <p style={{ color: '#666' }}>Chargement des activités...</p>
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
    <div className="activities-page">
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
              Nos activités de montagne
            </h1>
            
            <p style={{
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              fontSize: '1.125rem',
              lineHeight: 1.6
            }}>
              Découvrez une sélection d'activités pour tous les goûts et tous les niveaux.
            </p>
          </div>
        </div>
      </section>

      {/* Section Ski */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 300, 
            marginBottom: '2rem',
            color: '#333'
          }}>
             Séjours au ski
          </h2>
          
          {offresSki.length === 0 ? (
            <p>Aucune offre de ski disponible</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {offresSki.map(offre => (
                <div key={offre.id} className="activity-card" style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={offre.station_photo} 
                    alt={offre.titre}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {offre.titre}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {offre.station_nom}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>{offre.description}</p>
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ fontWeight: 600 }}>{offre.prix}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section Randonnée */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 300, 
            marginBottom: '2rem',
            color: '#333'
          }}>
            Randonnées accompagnées
          </h2>
          
          {offresRandonnee.length === 0 ? (
            <p>Aucune offre de randonnée disponible</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {offresRandonnee.map(offre => (
                <div key={offre.id} className="activity-card" style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={offre.image_url} 
                    alt={offre.titre}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {offre.titre}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {offre.lieu} • {offre.duree}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>{offre.description}</p>
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ fontWeight: 600 }}>{offre.prix}€</span>
                      {offre.guide_inclus && (
                        <span style={{ 
                          marginLeft: '0.5rem',
                          fontSize: '0.8rem',
                          background: '#e5e5e5',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          Guide inclus
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section Escalade */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <h2 style={{ 
            fontSize: '2rem', 
            fontWeight: 300, 
            marginBottom: '2rem',
            color: '#333'
          }}>
             Escalade
          </h2>
          
          {offresEscalade.length === 0 ? (
            <p>Aucune offre d'escalade disponible</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {offresEscalade.map(offre => (
                <div key={offre.id} className="activity-card" style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={offre.image_url} 
                    alt={offre.titre}
                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      {offre.titre}
                    </h3>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {offre.lieu} • {offre.duree} • {offre.difficulte}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>{offre.description}</p>
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ fontWeight: 600 }}>{offre.prix}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lien vers toutes les activités */}
      <section style={{ padding: '2rem 0 4rem', textAlign: 'center' }}>
        <div className="container">
          <a 
            href="/ski" 
            style={{ 
              margin: '0 1rem',
              color: '#000',
              textDecoration: 'none',
              borderBottom: '1px solid #000'
            }}
          >
            Voir tous les séjours ski →
          </a>
          <a 
            href="/randonnee" 
            style={{ 
              margin: '0 1rem',
              color: '#000',
              textDecoration: 'none',
              borderBottom: '1px solid #000'
            }}
          >
            Voir toutes les randonnées →
          </a>
          <a 
            href="/escalade" 
            style={{ 
              margin: '0 1rem',
              color: '#000',
              textDecoration: 'none',
              borderBottom: '1px solid #000'
            }}
          >
            Voir toutes les offres d'escalade →
          </a>
        </div>
      </section>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .activity-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .activity-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default Activities;