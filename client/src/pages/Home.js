// src/pages/Home.js - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomActivities, setRandomActivities] = useState([]);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/activites';

  useEffect(() => {
    axios.get(API_URL)
      .then(response => {
        const data = Array.isArray(response.data) ? response.data : [];
        setActivities(data);
        
        if (data.length > 0) {
          const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 3);
          setRandomActivities(shuffled);
        }
        setLoading(false);
        setError(null);
      })
      .catch(error => {
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
      <section className="home-hero">
        <div className="home-hero-bg"></div>
        <div className="home-hero-overlay"></div>
        
        <div className="container">
          <div className="home-hero-content">
            <div className="hero-tagline">
              EXPLOREZ • RÊVEZ • GRIMPEZ
            </div>
            
            <h1>AVENTURES<br />ALPINES</h1>
            
            <p className="home-hero-subtitle">
              Découvrez les sommets enneigés, les lacs cristallins et les sentiers 
              légendaires des plus belles montagnes des Alpes. 
              Expériences uniques pour tous les niveaux.
            </p>
            
            {error && (
              <div className="home-hero-error">
                <h4>⚠️ Mode démo activé</h4>
                <p>{error}</p>
                <p>Pour utiliser le serveur MAMP: démarrez Node.js sur le port 5000</p>
              </div>
            )}
            
            <div className="home-hero-actions">
              <a href="/activities" className="btn btn-primary btn-lg">
                Découvrir nos activités
              </a>

            </div>
            
            <div className="scroll-indicator">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="home-section">
        <div className="container">
          <div className="home-section-title">
            <h2>Activités phares</h2>
            <p className="home-section-subtitle">
              {error ? 'Données de démonstration' : `3 activités sélectionnées parmi nos ${activities.length} expériences`}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Chargement des activités...</p>
            </div>
          ) : (
            <>
              <div className="home-activities-grid">
                {randomActivities.map((activity, index) => (
                  <ActivityCard 
                    key={activity.id || index} 
                    activity={activity}
                  />
                ))}
              </div>

              <div className="view-all-container">
                <a href="/activities" className="btn btn-secondary">
                  Voir toutes les activités ({activities.length})
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="home-section home-section-light">
        <div className="container">
          <div className="home-section-title">
            <h2>Notre approche unique</h2>
            <p className="home-section-subtitle">
              Tout ce qui fait de nous votre partenaire idéal pour l'aventure en montagne.
            </p>
          </div>
          
          <div className="home-values-grid">
            <div className="home-value-card">
             
              <h3>Expériences uniques</h3>
              <p>Des activités soigneusement sélectionnées pour leur qualité et leur originalité.</p>
            </div>
            
            <div className="home-value-card">
      
              <h3>Guides experts</h3>
              <p>Accompagnement par des professionnels certifiés, passionnés et locaux.</p>
            </div>
            
            <div className="home-value-card">
            
              <h3>Nature préservée</h3>
              <p>Accès aux plus beaux sites des Alpes, avec un engagement fort pour la préservation de l'environnement.</p>
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

     

    </div>
  );
};

export default Home;