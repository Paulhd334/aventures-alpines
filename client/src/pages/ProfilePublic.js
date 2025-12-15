// src/pages/ProfilePublic.js
import React, { useState, useEffect } from 'react'; // ← AJOUTER CET IMPORT
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ProfilePublic = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]); // ← CHANGER setPublications en setArticles
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Récupérer le profil public
        const profileResponse = await axios.get(`http://localhost:5000/api/users/${username}/profile`);
        setUser(profileResponse.data.user);
        
        // Récupérer les articles de l'utilisateur
        const articlesResponse = await axios.get(`http://localhost:5000/api/users/${username}/articles`);
        setArticles(articlesResponse.data);
      } catch (error) {
        console.error('Erreur chargement profil public:', error);
        // Fallback
        setUser({
          nom_utilisateur: username,
          nombre_articles: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* En-tête du profil public */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem', 
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {username?.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {username}
          </h1><br></br>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            Membre de la communauté Aventures Alpines
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <span style={{ color: '#888' }}>
              📝 {articles.length} {articles.length === 1 ? 'article' : 'articles'}
            </span>
            {user?.premiere_publication && (
              <span style={{ color: '#888' }}>
                Membre depuis {new Date(user.premiere_publication).toLocaleDateString('fr-FR', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Articles de l'utilisateur */}
      <div>
        <h2 style={{ 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Articles publiés ({articles.length})
        </h2>
        
        {articles.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
              {username} n'a pas encore publié d'articles
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {articles.map(article => (
              <div key={article.id} style={{
                padding: '1.5rem',
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
                <h3 style={{ 
                  marginBottom: '0.5rem', 
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {article.titre}
                </h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  color: '#666'
                }}>
                  <span> {article.lieu || 'Lieu non spécifié'}</span>
                  <span>•</span>
                  <span>
                    {new Date(article.date_publication).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <p style={{ 
                  color: '#555', 
                  lineHeight: 1.5,
                  marginBottom: '1rem'
                }}>
                  {article.contenu.length > 200 
                    ? `${article.contenu.substring(0, 200)}...` 
                    : article.contenu}
                </p>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: '#888',
                    backgroundColor: '#f0f0f0',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px'
                  }}>
                    {article.type}
                  </span>
                  <Link 
                    to={`/blog`}
                    style={{
                      fontSize: '0.875rem',
                      color: '#000',
                      textDecoration: 'none',
                      borderBottom: '1px solid transparent',
                      transition: 'border-color 0.3s',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderBottomColor = '#000';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderBottomColor = 'transparent';
                    }}
                  >
                    Voir tous les articles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePublic;