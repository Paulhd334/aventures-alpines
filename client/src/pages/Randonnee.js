import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Randonnee = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Charger les photos depuis la BDD
    const fetchPhotos = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/galerie-randonnee');
        setPhotos(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des photos');
        setLoading(false);
        console.error('Erreur:', err);
      }
    };

    if (activeTab === 'galerie') {
      fetchPhotos();
    }
  }, [activeTab]);

  return (
    <div className="randonnee-page">
      {/* Hero */}
      <div className="randonnee-hero">
        <h1>Randonnée en Montagne</h1>
        <p>Découvrez l'art de la randonnée en montagne : préparation, équipement, et les plus beaux sentiers.</p>
      </div>

      {/* Tabs */}
      <div className="randonnee-tabs">
        {['info', 'carte', 'galerie'].map((tab) => (
          <button
            key={tab}
            className={`randonnee-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'info' && 'Informations'}
            {tab === 'carte' && 'Carte Interactive'}
            {tab === 'galerie' && 'Galerie Photos'}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="randonnee-content">
        {activeTab === 'info' && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>Informations sur la Randonnée</h2>
            <div className="info-cards">
              <div className="info-card">
                <h3>    Niveaux de Difficulté</h3>
                <ul>
                  <li><strong>Facile:</strong> Sentiers bien marqués, dénivelé modéré</li>
                  <li><strong>Moyen:</strong> Dénivelé important, bonne condition physique</li>
                  <li><strong>Difficile:</strong> Dénivelé conséquent, expérience requise</li>
                  <li><strong>Très Difficile:</strong> Technicité élevée, experts seulement</li>
                </ul>
              </div>

              <div className="info-card">
                <h3>Équipement Recommandé</h3>
                <ul>
                  <li>Chaussures de randonnée imperméables</li>
                  <li>Vêtements techniques (système 3 couches)</li>
                  <li>Sac à dos 30-50L avec protection pluie</li>
                  <li>Trousse de premiers secours complète</li>
                  <li>Carte topographique et boussole</li>
                  <li>Lampe frontale et couverture de survie</li>
                </ul>
              </div>

              <div className="info-card">
                <h3>Meilleures Saisons</h3>
                <ul>
                  <li><strong>Printemps (Avril-Juin):</strong> Fleurs, peu de monde, sentiers parfois boueux</li>
                  <li><strong>Été (Juillet-Août):</strong> Conditions optimales, refuges ouverts, orages fréquents</li>
                  <li><strong>Automne (Septembre-Octobre):</strong> Couleurs magnifiques, air limpide, jours courts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'carte' && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>Carte Interactive</h2>
            <div className="map-container">
              <span className="map-icon">🗺️</span>
              <h3>Sentiers de Randonnée</h3>
              <p style={{ color: '#666', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Explorez les sentiers de randonnée les plus populaires à travers les massifs français.
                Cliquez sur un massif pour découvrir les itinéraires.
              </p>
              <div className="map-locations">
                {['Mont Blanc', 'GR20 Corse', 'Pyrénées', 'Alpes du Sud', 'Vosges', 'Massif Central'].map((location, idx) => (
                  <div key={idx} className="location-tag">
                    🏔️ {location}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'galerie' && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>Galerie de Randonnées</h2>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Découvrez les photos partagées par notre communauté de randonneurs.
            </p>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Chargement des photos...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#c0392b' }}>
                <p>{error}</p>
              </div>
            ) : photos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                <p>Aucune photo disponible pour le moment.</p>
              </div>
            ) : (
              <div className="gallery-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="gallery-item">
                    <div className="gallery-image">
                      <img 
                        src={photo.image_url} 
                        alt={photo.titre}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop';
                        }}
                      />
                    </div>
                    <div className="gallery-info">
                      <h3>{photo.titre}</h3>
                      <div className="gallery-location">
                        📍 {photo.localisation || 'Non spécifié'}
                        {photo.altitude && ` • ${photo.altitude}m`}
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: '#999', 
                        marginTop: '0.5rem',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>🎯 {photo.difficulte || 'Non spécifié'}</span>
                        <span>❤️ {photo.likes || 0} likes</span>
                      </div>
                      {photo.description && (
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#666', 
                          marginTop: '0.5rem',
                          fontStyle: 'italic'
                        }}>
                          "{photo.description}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="randonnee-warning">
        <p>⚠️ La randonnée en montagne comporte des risques. Consultez toujours les conditions météo, 
           informez quelqu'un de votre itinéraire, et ne partez jamais seul.</p>
      </div>
    </div>
  );
};

export default Randonnee;