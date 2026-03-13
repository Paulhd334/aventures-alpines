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

  const handleArticleClick = (id) => navigate(`/article/${id}`);

  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    'https://images.unsplash.com/photo-1530908295418-a12e326966ba?w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1422466654108-5e533a591a64?w=800&q=80',
  ];

  // Priorité : image_url BDD en premier, sinon fallback Unsplash par index
  const getImage = (article, index) =>
    article.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

  const typeLabel = (type) => {
    const map = { récit: 'RÉCIT', rando: 'RANDONNÉE', ski: 'SKI', escalade: 'ESCALADE', bivouac: 'BIVOUAC', guide: 'GUIDE', article: 'ARTICLE' };
    return map[type] || (type || 'ARTICLE').toUpperCase();
  };

  if (loading) return (
    <div style={styles.centerState}>
      <div style={styles.loadingDot} />
      <p style={{ color: '#8a8a8a', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '1.5rem' }}>Chargement</p>
    </div>
  );

  if (error) return (
    <div style={styles.centerState}>
      <p style={{ color: '#2c2c2c', marginBottom: '1.5rem', fontSize: '0.875rem' }}>{error}</p>
      <button onClick={() => window.location.reload()} style={styles.retryBtn}>Réessayer</button>
    </div>
  );

  if (articles.length === 0) return (
    <div style={styles.centerState}>
      <p style={{ color: '#8a8a8a', fontSize: '0.875rem' }}>Aucun article disponible.</p>
    </div>
  );

  const [featured, ...rest] = articles;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #f4f1ec;
          font-family: var(--font-sans);
        }

        .articles-root {
          min-height: 100vh;
          background: #f4f1ec;
          padding-bottom: 6rem;
        }

        /* ─── HERO BANNER ─── */
        .hero-banner {
          position: relative;
          height: 52vh;
          min-height: 320px;
          overflow: hidden;
          background: #1a1a1a;
        }

        .hero-banner::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(26,26,26,0.25) 0%,
            rgba(26,26,26,0.05) 40%,
            rgba(244,241,236,0.95) 100%
          );
          z-index: 1;
        }

        .hero-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.05);
          transition: transform 12s ease-out;
        }

        .hero-banner:hover .hero-bg {
          transform: scale(1.0);
        }

        /* FIX : titre centré verticalement dans le hero, plus en bas */
        .hero-title-block {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 2;
          width: 100%;
          padding: 0 1rem;
        }

        .hero-eyebrow {
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          margin-bottom: 0.75rem;
        }

        .hero-h1 {
          font-family: var(--font-sans);
          font-size: clamp(2.5rem, 6vw, 5rem);
          font-weight: 400;
          color: #fff;
          line-height: 1.0;
          letter-spacing: -0.02em;
          text-shadow: 0 2px 40px rgba(0,0,0,0.3);
        }

        /* ─── META BAR ─── */
        .meta-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          padding: 1.25rem 2rem;
          border-bottom: 1px solid #d9d4cc;
          font-size: 0.7rem;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7a7268;
        }

        .meta-bar span { display: flex; align-items: center; gap: 0.4rem; }
        .meta-sep { width: 3px; height: 3px; border-radius: 50%; background: #c4bdb3; }

        /* ─── LAYOUT ─── */
        .articles-wrapper {
          max-width: 1100px;
          margin: 0 auto;
          padding: 4rem 1.5rem 0;
        }

        .section-label {
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 500;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #9a9186;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #d9d4cc;
        }

        /* ─── FEATURED CARD ─── */
        .featured-card {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          border: 1px solid #d0c9bf;
          margin-bottom: 4rem;
          cursor: pointer;
          overflow: hidden;
          transition: box-shadow 0.3s ease;
          background: #fff;
        }

        .featured-card:hover {
          box-shadow: 0 20px 60px rgba(0,0,0,0.12);
        }

        .featured-img-wrap {
          position: relative;
          overflow: hidden;
          min-height: 360px;
        }

        .featured-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .featured-card:hover .featured-img {
          transform: scale(1.04);
        }

        .featured-body {
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #fff;
        }

        .type-pill {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.3rem 0.75rem;
          border: 1px solid #2c2c2c;
          color: #2c2c2c;
          margin-bottom: 1.5rem;
          width: fit-content;
        }

        .featured-title {
          font-family: var(--font-sans);
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.25;
          letter-spacing: -0.01em;
          margin-bottom: 1.25rem;
        }

        .featured-excerpt {
          font-size: 0.875rem;
          font-weight: 300;
          line-height: 1.75;
          color: #5a5550;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .article-meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #8a8278;
          border-top: 1px solid #ece8e2;
          padding-top: 1.25rem;
        }

        .read-link {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1a1a1a;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: gap 0.2s ease;
        }

        .featured-card:hover .read-link { gap: 0.75rem; }

        /* ─── GRID ─── */
        .articles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }

        @media (max-width: 900px) {
          .featured-card { grid-template-columns: 1fr; }
          .featured-img-wrap { min-height: 240px; }
          .articles-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 580px) {
          .articles-grid { grid-template-columns: 1fr; }
        }

        /* ─── GRID CARD ─── */
        .grid-card {
          cursor: pointer;
          overflow: hidden;
          background: #fff;
          border: 1px solid #d0c9bf;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .grid-card:hover {
          box-shadow: 0 12px 40px rgba(0,0,0,0.10);
          transform: translateY(-3px);
        }

        .grid-img-wrap {
          position: relative;
          overflow: hidden;
          height: 200px;
        }

        .grid-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }

        .grid-card:hover .grid-img { transform: scale(1.06); }

        .grid-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 60%);
          pointer-events: none;
        }

        .grid-type {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          font-size: 0.55rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 0.25rem 0.6rem;
          background: rgba(255,255,255,0.92);
          color: #1a1a1a;
          backdrop-filter: blur(4px);
        }

        .grid-body {
          padding: 1.4rem 1.4rem 1.2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .grid-title {
          font-family: var(--font-sans);
          font-size: 1.1rem;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.35;
          margin-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        .grid-excerpt {
          font-size: 0.8rem;
          font-weight: 300;
          line-height: 1.65;
          color: #6a6560;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 1.1rem;
        }

        .grid-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          color: #9a9186;
          border-top: 1px solid #ece8e2;
          padding-top: 0.9rem;
        }

        .grid-author {
          font-weight: 400;
          color: #4a4540;
        }

        .grid-arrow {
          font-size: 0.9rem;
          color: #1a1a1a;
          transition: transform 0.2s ease;
        }

        .grid-card:hover .grid-arrow { transform: translateX(4px); }

        @keyframes pulse-dot {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div className="articles-root">

        {/* Hero Banner */}
        <div className="hero-banner">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80"
            alt="Montagnes"
            className="hero-bg"
          />
          <div className="hero-title-block">
            <p className="hero-eyebrow">Club Alpin · Chroniques & récits</p>
            <h1 className="hero-h1">Nos articles</h1>
          </div>
        </div>

        {/* Meta bar */}
        <div className="meta-bar">
          <span>{articles.length} articles</span>
          <div className="meta-sep" />
          <span>{[...new Set(articles.map(a => a.auteur_nom))].length} auteurs</span>
          <div className="meta-sep" />
          <span>Alpinisme & randonnée</span>
        </div>

        <div className="articles-wrapper">

          {/* Featured */}
          <div className="section-label">À la une</div>
          <div className="featured-card" onClick={() => handleArticleClick(featured.id)}>
            <div className="featured-img-wrap">
              <img
                src={getImage(featured, 0)}
                alt={featured.titre}
                className="featured-img"
                onError={(e) => { e.target.src = FALLBACK_IMAGES[0]; }}
              />
            </div>
            <div className="featured-body">
              <div>
                <span className="type-pill">{typeLabel(featured.type)}</span>
                <h2 className="featured-title">{featured.titre}</h2>
                <p className="featured-excerpt">{featured.contenu}</p>
              </div>
              <div className="article-meta-row">
                <span>
                  <strong style={{ color: '#3a3530', fontWeight: 400 }}>
                    {featured.auteur_nom || 'Auteur inconnu'}
                  </strong>
                  {featured.lieu && ` · ${featured.lieu}`}
                  {' · '}
                  {formatDate(featured.created_at)}
                </span>
                <span className="read-link">Lire <span>→</span></span>
              </div>
            </div>
          </div>

          {/* Grid */}
          {rest.length > 0 && (
            <>
              <div className="section-label">Tous les articles</div>
              <div className="articles-grid">
                {rest.map((article, index) => (
                  <div
                    key={article.id}
                    className="grid-card"
                    onClick={() => handleArticleClick(article.id)}
                  >
                    <div className="grid-img-wrap">
                      <img
                        src={getImage(article, index + 1)}
                        alt={article.titre}
                        className="grid-img"
                        onError={(e) => { e.target.src = FALLBACK_IMAGES[(index + 1) % FALLBACK_IMAGES.length]; }}
                      />
                      <div className="grid-img-overlay" />
                      <span className="grid-type">{typeLabel(article.type)}</span>
                    </div>
                    <div className="grid-body">
                      <h3 className="grid-title">{article.titre}</h3>
                      <p className="grid-excerpt">{article.contenu}</p>
                      <div className="grid-footer">
                        <div>
                          <div className="grid-author">{article.auteur_nom || 'Auteur inconnu'}</div>
                          {article.lieu && <div style={{ marginTop: '0.2rem' }}>📍 {article.lieu}</div>}
                          <div style={{ marginTop: '0.2rem' }}>{formatDate(article.created_at)}</div>
                        </div>
                        <span className="grid-arrow">→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  centerState: {
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-sans)',
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: '#2c2c2c',
    animation: 'pulse-dot 1.4s ease-in-out infinite',
  },
  retryBtn: {
    padding: '0.5rem 1.25rem',
    border: '1px solid #2c2c2c',
    background: 'transparent',
    color: '#2c2c2c',
    fontSize: '0.75rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
};

export default ArticlesList;