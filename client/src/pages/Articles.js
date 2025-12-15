import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Articles = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/articles')
      .then(response => {
        setPublications(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur chargement articles:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Chargement des articles...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '1rem' }}> Articles Aventures Alpines</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Découvrez les expériences partagées par notre communauté
      </p>
      
      {publications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            Aucun article pour le moment
          </p>
          <p style={{ color: '#888' }}>
            Soyez le premier à partager votre aventure !
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {publications.map(pub => (
            <div key={pub.id} style={{
              padding: '2rem',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: 'white',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                marginBottom: '0.5rem',
                color: '#000'
              }}>
                {pub.titre}
              </h2>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: '#666',
                fontSize: '0.875rem'
              }}>
                {/* LIEN VERS LE PROFIL DE L'AUTEUR */}
                <Link 
                  to={`/profile/${pub.nom_utilisateur}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#000',
                    textDecoration: 'none',
                    fontWeight: '500',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {pub.nom_utilisateur?.charAt(0).toUpperCase() || 'A'}
                  </span>
                  👤 {pub.nom_utilisateur}
                </Link>
                <span>•</span>
                <span>📍 {pub.lieu || 'Lieu non spécifié'}</span>
                <span>•</span>
                <span>
                  {new Date(pub.date_publication).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              
              <p style={{ 
                color: '#555', 
                lineHeight: 1.6,
                marginBottom: '1rem'
              }}>
                {pub.contenu.length > 300 
                  ? `${pub.contenu.substring(0, 300)}...` 
                  : pub.contenu}
              </p>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '1.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #f0f0f0'
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  color: '#888',
                  backgroundColor: '#f0f0f0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px'
                }}>
                  {pub.type}
                </span>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* LIEN VERS L'ARTICLE COMPLET */}

                  
                  {/* LIEN VERS LE PROFIL */}
                  <Link 
                    to={`/profile/${pub.nom_utilisateur}`}
                    style={{
                      fontSize: '0.875rem',
                      color: '#000',
                      textDecoration: 'none',
                      fontWeight: '500',
                      padding: '0.5rem 1rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '4px',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Voir le profil
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Section pour publier un nouvel article */}
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>
          Vous aussi, partagez votre aventure !
        </h3>
        <Link to="/blog/new">
          <button style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Publier un article
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Articles;