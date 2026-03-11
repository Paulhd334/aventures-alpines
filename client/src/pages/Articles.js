import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ArticlesList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/articles');
        setArticles(response.data);
      } catch (err) {
        console.error('Erreur fetch articles:', err);
        setError('Impossible de récupérer les articles. Vérifiez le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleArticleClick = (id) => {
    navigate(`/article/${id}`);
  };

  if (loading) return (
    <div style={{ 
      padding: '4rem 2rem', 
      textAlign: 'center',
      color: 'var(--charcoal-light)',
      fontSize: '0.875rem',
      fontWeight: 300
    }}>
      Chargement des articles...
    </div>
  );

  if (error) return (
    <div style={{ 
      padding: '4rem 2rem', 
      textAlign: 'center' 
    }}>
      <p style={{ 
        color: 'var(--charcoal)',
        marginBottom: '1rem'
      }}>
        {error}
      </p>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '0.5rem 1rem',
          border: '1px solid var(--charcoal)',
          background: 'transparent',
          color: 'var(--charcoal)',
          fontSize: '0.75rem',
          cursor: 'pointer'
        }}
      >
        Réessayer
      </button>
    </div>
  );

  if (articles.length === 0) return (
    <div style={{ 
      padding: '4rem 2rem', 
      textAlign: 'center',
      color: 'var(--charcoal-light)'
    }}>
      Aucun article disponible.
    </div>
  );

  return (
    <div style={{ 
      maxWidth: '900px', 
      margin: '0 auto', 
      padding: '3rem 1rem'
    }}>
      
      <header style={{ 
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3.0rem',
          fontWeight: 300,
          marginBottom: '1rem',
          color: 'var(--ink)'
        }}>
          Nos activités de montagne
        </h1>
        <p style={{
          color: 'var(--charcoal-light)',
          fontSize: '0.875rem',
          fontWeight: 300
        }}>
          {articles.length} articles • {[...new Set(articles.map(a => a.auteur_nom))].length} auteurs
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gap: '2rem' 
      }}>
        {articles.map((article) => (
          <article 
            key={article.id}
            onClick={() => handleArticleClick(article.id)}
            style={{ 
              border: '1px solid var(--platinum)',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ink-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--platinum)';
            }}
          >
            <h2 style={{ 
              fontSize: '1.25rem',
              fontWeight: 400,
              marginBottom: '0.5rem',
              color: 'var(--ink)'
            }}>
              {article.titre}
            </h2>
            
            <div style={{ 
              display: 'flex',
              gap: '1rem',
              marginBottom: '1rem',
              fontSize: '0.75rem',
              color: 'var(--charcoal-light)'
            }}>
              <span>👤 {article.auteur_nom}</span>
              {article.lieu && (
                <>
                  <span>•</span>
                  <span>📍 {article.lieu}</span>
                </>
              )}
            </div>

            <p style={{ 
              color: 'var(--charcoal)',
              lineHeight: 1.6,
              marginBottom: '1rem',
              fontSize: '0.875rem',
              fontWeight: 300,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {article.contenu.length > 200 
                ? `${article.contenu.substring(0, 200)}...`
                : article.contenu}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--gray-dark)'
            }}>
              <span>
                {new Date(article.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                Lire l'article →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default ArticlesList;