// src/pages/Home.js - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/activites')
      .then(response => {
        setActivities(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur API:', error);
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
            
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <button className="btn btn-primary btn-lg">
                Découvrir
              </button>
              <button className="btn btn-outline btn-lg">
                En savoir plus
              </button>
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
              Nos meilleures expériences, soigneusement choisies pour vous.
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
              <p style={{ color: 'var(--gray-dark)' }}>Chargement des activités...</p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                {activities.slice(0, 3).map((activity, index) => (
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
                  Voir toutes les activités →
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
    </div>
  );
};

export default Home;