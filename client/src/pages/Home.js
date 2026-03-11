// src/pages/Home.js - VERSION CORRIGÉE POUR MAMP LOCAL
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomActivities, setRandomActivities] = useState([]);
  const [error, setError] = useState(null);

  // IMPORTANT : Utilisez l'URL de votre serveur Node.js local
  const API_URL = 'http://localhost:5000/api/activites';

  useEffect(() => {
    console.log('Tentative de connexion à:', API_URL);
    
    axios.get(API_URL)
      .then(response => {
        console.log('Données reçues:', response.data);
        const data = Array.isArray(response.data) ? response.data : [];
        setActivities(data);
        
        // Sélectionner 3 activités aléatoires
        if (data.length > 0) {
          const shuffled = [...data]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          setRandomActivities(shuffled);
        } else {
          // Si pas de données, utiliser des mock data
          const mockActivities = [
            {
              id: 1,
              nom: "Ski alpin à Chamonix",
              type: "ski",
              difficulte: "Intermédiaire",
              description: "Des pistes mythiques pour tous les niveaux",
              image_url: "https://picsum.photos/800/600?random=1",
              lieu: "Chamonix",
              prix: 45.00,
              duree: "1 journée",
              saison: "Hiver"
            },
            {
              id: 2,
              nom: "Randonnée du Lac Blanc",
              type: "randonnee",
              difficulte: "Facile",
              description: "Randonnée familiale avec vue magnifique",
              image_url: "https://picsum.photos/800/600?random=2",
              lieu: "Argentière",
              prix: 25.00,
              duree: "3h30",
              saison: "Été"
            },
            {
              id: 3,
              nom: "Escalade en falaise",
              type: "escalade",
              difficulte: "Débutant",
              description: "Initiation à l'escalade sur les falaises",
              image_url: "https://picsum.photos/800/600?random=3",
              lieu: "Les Gets",
              prix: 55.00,
              duree: "2h",
              saison: "Printemps"
            }
          ];
          setRandomActivities(mockActivities.slice(0, 3));
        }
        
        setLoading(false);
        setError(null);
      })
      .catch(error => {
        console.error('Erreur API:', error);
        console.log('URL utilisée:', API_URL);
        console.log('Erreur détaillée:', error.message);
        
        // Données de secours pour le développement
        const mockData = [
          {
            id: 1,
            nom: "Ski alpin à Chamonix",
            type: "ski",
            difficulte: "Intermédiaire",
            description: "Des pistes mythiques pour tous les niveaux",
            image_url: "https://picsum.photos/800/600?random=1",
            lieu: "Chamonix",
            prix: 45.00,
            duree: "1 journée",
            saison: "Hiver"
          },
          {
            id: 2,
            nom: "Randonnée du Lac Blanc",
            type: "randonnee",
            difficulte: "Facile",
            description: "Randonnée familiale avec vue magnifique",
            image_url: "https://picsum.photos/800/600?random=2",
            lieu: "Argentière",
            prix: 25.00,
            duree: "3h30",
            saison: "Été"
          },
          {
            id: 3,
            nom: "Escalade en falaise",
            type: "escalade",
            difficulte: "Débutant",
            description: "Initiation à l'escalade sur les falaises",
            image_url: "https://picsum.photos/800/600?random=3",
            lieu: "Les Gets",
            prix: 55.00,
            duree: "2h",
            saison: "Printemps"
          }
        ];
        
        setActivities(mockData);
        setRandomActivities(mockData.slice(0, 3));
        setError(`Serveur local non disponible: ${error.message}`);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '10rem 0',
        backgroundColor: 'var(--white)'
      }}>
        <div className="container">
          <div style={{ 
            textAlign: 'center',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 300,
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              marginBottom: '2rem',
              color: 'var(--black-soft)'
            }}>
              AVENTURES ALPINES
            </h1>
            
            <p style={{
              fontSize: '1.25rem',
              color: 'var(--charcoal)',
              fontWeight: 300,
              letterSpacing: '0.01em',
              lineHeight: 1.8,
              maxWidth: '42rem',
              margin: '0 auto 3rem auto',
              textAlign: 'center'
            }}>
              Découvrez les plus belles activités de montagne dans les Alpes.
              Expériences uniques pour tous les niveaux.
            </p>
            
            {error && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '0 auto 2rem auto'
              }}>
                <h4 style={{ marginBottom: '0.5rem', color: '#856404' }}>
                  ⚠️ Mode démo activé
                </h4>
                <p style={{ color: '#856404', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  {error}
                </p>
                <p style={{ color: '#856404', fontSize: '0.75rem' }}>
                  Pour utiliser le serveur MAMP: démarrez Node.js sur le port 5000
                </p>
              </div>
            )}
            
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <a href="/activities" className="btn btn-primary btn-lg">
                Découvrir
              </a>
              <a href="/about" className="btn btn-outline btn-lg">
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 300,
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--platinum)',
              textAlign: 'center'
            }}>
              Activités sélectionnées
            </h2>
            <p style={{
              color: 'var(--charcoal)',
              maxWidth: '36rem',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              {error ? 'Données de démonstration' : `3 activités aléatoires parmi nos ${activities.length} expériences`}
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <div style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                border: '2px solid var(--gray-medium)',
                borderTopColor: 'var(--black)',
                borderRadius: 0,
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}></div>
              <p style={{ color: 'var(--gray-dark)' }}>Connexion au serveur MAMP...</p>
              <p style={{ fontSize: '0.875rem', color: '#999' }}>
                URL: {API_URL}
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                {randomActivities.map((activity, index) => (
                  <ActivityCard 
                    key={activity.id || index} 
                    activity={activity}
                  />
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <a 
                  href="/activities" 
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-block',
                    textDecoration: 'none'
                  }}
                >
                  Voir toutes les activités ({activities.length}) →
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: 'var(--white-smoke)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 300,
              marginBottom: '1rem',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--platinum)',
              textAlign: 'center'
            }}>
              Pourquoi nous choisir
            </h2>
            <p style={{
              color: 'var(--charcoal)',
              maxWidth: '36rem',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              Tout ce qui fait de nous votre partenaire idéal pour l'aventure en montagne.
            </p>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem'
          }}>
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 400,
                marginBottom: '1rem',
                color: 'var(--black-soft)'
              }}>
                Expériences uniques
              </h3>
              <p style={{ color: 'var(--charcoal)' }}>
                Des activités soigneusement sélectionnées pour leur qualité et leur originalité.
              </p>
            </div>
            
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 400,
                marginBottom: '1rem',
                color: 'var(--black-soft)'
              }}>
                Guides experts
              </h3>
              <p style={{ color: 'var(--charcoal)' }}>
                Accompagnement par des professionnels certifiés et passionnés.
              </p>
            </div>
            
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 400,
                marginBottom: '1rem',
                color: 'var(--black-soft)'
              }}>
                Lieux exceptionnels
              </h3>
              <p style={{ color: 'var(--charcoal)' }}>
                Accès aux plus beaux sites des Alpes, préservés et authentiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            maxWidth: '48rem',
            margin: '0 auto'
          }}>
            <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--gray-light)' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
                color: 'var(--black-soft)'
              }}>
                {activities.length}
              </div>
              <div style={{
                color: 'var(--gray-dark)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Activités
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--gray-light)' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
                color: 'var(--black-soft)'
              }}>
                100%
              </div>
              <div style={{
                color: 'var(--gray-dark)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Satisfaction
              </div>
            </div>
            
            <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px solid var(--gray-light)' }}>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: 300,
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
                color: 'var(--black-soft)'
              }}>
                24/7
              </div>
              <div style={{
                color: 'var(--gray-dark)',
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}>
                Support
              </div>
            </div>
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

export default Home;