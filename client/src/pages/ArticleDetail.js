import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/articles/${id}`);
        setArticle(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement article:', err);
        setError('Impossible de charger l\'article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '1px solid var(--platinum)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '2rem', color: 'var(--charcoal-light)', fontSize: '0.875rem' }}>Chargement...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '1rem', color: 'var(--ink)' }}>404</h2>
        <p style={{ color: 'var(--charcoal)', marginBottom: '2rem' }}>Article non trouvé</p>
        <Link to="/articles" style={{ color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)' }}>
          ← Retour aux articles
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Lien retour minimal */}
      <Link 
        to="/articles" 
        style={{ 
          display: 'inline-block',
          color: 'var(--charcoal-light)',
          textDecoration: 'none',
          fontSize: '0.875rem',
          marginBottom: '3rem',
          borderBottom: '1px solid transparent',
          transition: 'border-color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.borderColor = 'var(--charcoal-light)'}
        onMouseLeave={(e) => e.target.style.borderColor = 'transparent'}
      >
        ← Tous les articles
      </Link>

      {/* Article */}
      <article>
        {/* Titre */}
        <h1 style={{ 
          fontSize: '2.5rem',
          fontWeight: 300,
          lineHeight: 1.2,
          marginBottom: '2rem',
          color: 'var(--ink)',
          letterSpacing: '-0.02em'
        }}>
          {article.titre}
        </h1>

        {/* Métadonnées */}
        <div style={{ 
          display: 'flex',
          gap: '2rem',
          marginBottom: '3rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid var(--platinum)',
          color: 'var(--charcoal-light)',
          fontSize: '0.875rem',
          flexWrap: 'wrap'
        }}>
          <span>{article.auteur_nom || 'Auteur inconnu'}</span>
          <span>{formatDate(article.created_at)}</span>
          {article.lieu && <span>{article.lieu}</span>}
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {article.type || 'récit'}
          </span>
        </div>

        {/* Contenu */}
        <div style={{ 
          fontSize: '1rem',
          lineHeight: 1.8,
          color: 'var(--charcoal)',
          fontWeight: 300,
          whiteSpace: 'pre-wrap',
          marginBottom: '3rem'
        }}>
          {article.contenu}
        </div>
      </article>
    </div>
  );
};

export default ArticleDetail;