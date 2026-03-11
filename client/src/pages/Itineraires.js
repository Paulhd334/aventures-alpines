import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Itineraires = () => {
  const [itineraires, setItineraires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreDifficulte, setFiltreDifficulte] = useState('tous');
  const [filtreDuree, setFiltreDuree] = useState('tous');

  useEffect(() => {
    const fetchItineraires = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/Itineraires');
        console.log('Données reçues:', response.data);
        setItineraires(response.data);
      } catch (err) {
        console.error('Erreur fetch itinéraires:', err);
        setError('Impossible de récupérer les itinéraires. Vérifiez le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchItineraires();
  }, []);

  const itinerairesFiltres = itineraires.filter(it => {
    // Correction : la base a "facile", pas "Facile"
    if (filtreDifficulte !== 'tous') {
      // Convertir "Facile" en "facile", etc.
      const difficulteBase = it.difficulte.toLowerCase();
      const filtreBase = filtreDifficulte.toLowerCase();
      if (difficulteBase !== filtreBase) return false;
    }
    
    if (filtreDuree !== 'tous') {
      const dureeStr = it.duree || '';
      if (dureeStr.includes('jours') || dureeStr.includes('jour')) {
        const joursMatch = dureeStr.match(/(\d+)/);
        if (joursMatch) {
          const jours = parseInt(joursMatch[1]);
          if (filtreDuree === 'court' && jours > 3) return false;
          if (filtreDuree === 'moyen' && (jours < 4 || jours > 7)) return false;
          if (filtreDuree === 'long' && jours < 8) return false;
        }
      }
    }
    return true;
  });

  if (loading) return <div className="loading">Chargement des itinéraires...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="itineraires-container">
      <div className="hero-section">
        <h1>Itinéraires de Randonnée</h1>
        <p className="hero-description">
          Planifiez votre prochaine aventure en explorant nos itinéraires soigneusement sélectionnés.
          Consultez les détails, les niveaux de difficulté et les vues panoramiques pour choisir
          la randonnée qui vous convient le mieux.
        </p>
      </div>

      {/* Filtres */}
      <div className="filtres-container">
        <div className="filtre-item">
          <label>Difficulté :</label>
          <select 
            value={filtreDifficulte} 
            onChange={(e) => setFiltreDifficulte(e.target.value)}
          >
            <option value="tous">Tous niveaux</option>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        
        <div className="filtre-item">
          <label>Durée :</label>
          <select 
            value={filtreDuree} 
            onChange={(e) => setFiltreDuree(e.target.value)}
          >
            <option value="tous">Toutes durées</option>
            <option value="court">1-3 jours</option>
            <option value="moyen">4-7 jours</option>
            <option value="long">8+ jours</option>
          </select>
        </div>
      </div>

      {/* Résultats */}
      <p className="resultats-count">
        {itinerairesFiltres.length} itinéraire{itinerairesFiltres.length > 1 ? 's' : ''} trouvé{itinerairesFiltres.length > 1 ? 's' : ''}
      </p>

      {itinerairesFiltres.length === 0 ? (
        <div className="aucun-resultat">
          Aucun itinéraire ne correspond à vos critères.
        </div>
      ) : (
        <div className="itineraires-grid">
          {itinerairesFiltres.map((itineraire) => (
            <div key={itineraire.id} className="itineraire-card">
              {/* Image - Correction : photo_url au lieu de image_url */}
              {itineraire.photo_url && (
                <div className="itineraire-image-container">
                  <img 
                    src={itineraire.photo_url} 
                    alt={itineraire.nom}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop';
                    }}
                  />
                </div>
              )}

              {/* En-tête avec difficulté */}
              <div className={`itineraire-header difficulte-${getDifficultyClass(itineraire.difficulte)}`}>
                <h3>{itineraire.nom}</h3>
                <span className="difficulte-badge">{itineraire.difficulte}</span>
              </div>

              {/* Contenu */}
              <div className="itineraire-content">
                <p className="description">{itineraire.description}</p>
                
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="detail-label">⏱️ Durée</span>
                    <span className="detail-value">{itineraire.duree}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📏 Distance</span>
                    <span className="detail-value">{itineraire.distance} km</span>
                  </div>
                  {/* Correction : dénivelé positif + négatif */}
                  <div className="detail-item">
                    <span className="detail-label">⬆️ D+ / D-</span>
                    <span className="detail-value">
                      {itineraire.denivele_positif}m / {itineraire.denivele_negatif}m
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📍 Région</span>
                    <span className="detail-value">{itineraire.region}</span>
                  </div>
                </div>

                <div className="info-section">
                  <span className="info-label">🌤️ Meilleure saison :</span>
                  {/* Correction : saison_recommandee au lieu de meilleure_saison */}
                  <span className="info-value">{itineraire.saison_recommandee}</span>
                </div>

                {itineraire.points_interet && (
                  <div className="info-section">
                    <span className="info-label">✨ Points d'intérêt :</span>
                    <p className="info-value">{itineraire.points_interet}</p>
                  </div>
                )}

                {itineraire.equipement && (
                  <div className="info-section">
                    <span className="info-label">🎒 Équipement recommandé :</span>
                    <p className="info-value">{itineraire.equipement}</p>
                  </div>
                )}

                <button 
                  className="details-button"
                  onClick={() => console.log('Voir détails pour:', itineraire.nom)}
                >
                  Voir les détails complets
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information supplémentaire */}
      <div className="conseils-container">
        <h3>Conseils pour choisir votre randonnée</h3>
        <div className="conseils-grid">
          <div className="conseil-categorie">
            <h4>📊 Niveaux de difficulté</h4>
            <ul>
              <li><strong>Facile :</strong> Sentiers bien marqués, peu de dénivelé</li>
              <li><strong>Moyen :</strong> Dénivelé modéré, bonne condition physique requise</li>
              <li><strong>Difficile :</strong> Dénivelé important, expérience recommandée</li>
              <li><strong>Expert :</strong> Technicité élevée, réservé aux randonneurs expérimentés</li>
            </ul>
          </div>
          <div className="conseil-categorie">
            <h4>🎒 Équipement recommandé</h4>
            <ul>
              <li>Chaussures de randonnée imperméables</li>
              <li>Vêtements techniques (couches)</li>
              <li>Sac à dos (20-40L selon durée)</li>
              <li>Trousse de premiers secours</li>
              <li>Carte topographique et boussole</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

function getDifficultyClass(difficulte) {
  switch(difficulte) {
    case 'facile': return 'facile';
    case 'moyen': return 'moyen';
    case 'difficile': return 'difficile';
    case 'expert': return 'expert';
    default: return 'default';
  }
}

export default Itineraires;