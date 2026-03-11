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
        setArticles(response.data); // Assurez-vous que l'API renvoie un tableau d'articles
      } catch (err) {
        console.error('Erreur fetch articles:', err);
        setError('Impossible de récupérer les articles. Vérifiez le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement des articles...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{error}</p>;
  if (articles.length === 0) return <p style={{ padding: '2rem', textAlign: 'center' }}>Aucun article disponible.</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>Tous les articles</h1>
      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {articles.map((article) => (
          <div key={article.id} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '1rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>{article.titre}</h2>
            <p style={{ color: '#666', marginBottom: '0.5rem' }}>
              <strong>Auteur ID:</strong> {article.auteur_id} | <strong>Lieu:</strong> {article.lieu || 'Non renseigné'}
            </p>
            <p style={{ marginBottom: '0.5rem' }}>{article.contenu}</p>
            <small style={{ color: '#999' }}>Publié le: {new Date(article.created_at).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticlesList;
