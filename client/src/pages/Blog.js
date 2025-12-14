import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Blog = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/publications')
      .then(response => {
        setPublications(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur chargement blog:', error);
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
      <h1 style={{ marginBottom: '1rem' }}>📰 Blog Aventures Alpines</h1>
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
              backgroundColor: 'white'
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
                <span>👤 {pub.nom_utilisateur}</span>
                <span>•</span>
                <span>📍 {pub.lieu || 'Lieu non spécifié'}</span>
                <span>•</span>
                <span>
                  {new Date(pub.date_publication).toLocaleDateString('fr-FR')}
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
                <a 
                  href={`/profile`} 
                  style={{
                    fontSize: '0.875rem',
                    color: '#000',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'border-color 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderBottomColor = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderBottomColor = 'transparent';
                  }}
                >
                  Voir le profil →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;