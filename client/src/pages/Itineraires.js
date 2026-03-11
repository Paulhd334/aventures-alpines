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
        // IMPORTANT : Utiliser la bonne route avec majuscule
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

  // Filtrer les itinéraires
  const itinerairesFiltres = itineraires.filter(it => {
    if (filtreDifficulte !== 'tous' && it.difficulte !== filtreDifficulte) return false;
    
    if (filtreDuree !== 'tous') {
      const dureeStr = it.duree || '';
      if (dureeStr.includes('jours')) {
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

  if (loading) return <p style={{ padding: '2rem', textAlign: 'center' }}>Chargement des itinéraires...</p>;
  if (error) return <p style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Itinéraires de Randonnée</h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', maxWidth: '800px', margin: '0 auto' }}>
          Planifiez votre prochaine aventure en explorant nos itinéraires soigneusement sélectionnés.
          Consultez les détails, les niveaux de difficulté et les vues panoramiques pour choisir
          la randonnée qui vous convient le mieux.
        </p>
      </div>

      {/* Filtres */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Difficulté :</label>
          <select 
            value={filtreDifficulte} 
            onChange={(e) => setFiltreDifficulte(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="tous">Tous niveaux</option>
            <option value="Facile">Facile</option>
            <option value="Moyen">Moyen</option>
            <option value="Difficile">Difficile</option>
            <option value="Très Difficile">Très Difficile</option>
          </select>
        </div>
        
        <div>
          <label style={{ marginRight: '0.5rem', fontWeight: '500' }}>Durée :</label>
          <select 
            value={filtreDuree} 
            onChange={(e) => setFiltreDuree(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="tous">Toutes durées</option>
            <option value="court">1-3 jours</option>
            <option value="moyen">4-7 jours</option>
            <option value="long">8+ jours</option>
          </select>
        </div>
      </div>

      {/* Résultats */}
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        {itinerairesFiltres.length} itinéraire{itinerairesFiltres.length > 1 ? 's' : ''} trouvé{itinerairesFiltres.length > 1 ? 's' : ''}
      </p>

      {itinerairesFiltres.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
          Aucun itinéraire ne correspond à vos critères.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {itinerairesFiltres.map((itineraire) => (
            <div 
              key={itineraire.id} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              {/* Image */}
              {itineraire.image_url && (
                <div style={{ 
                  height: '200px', 
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <img 
                    src={itineraire.image_url} 
                    alt={itineraire.nom}
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
              )}

              {/* En-tête avec difficulté */}
              <div style={{ 
                backgroundColor: getDifficultyColor(itineraire.difficulte),
                color: 'white',
                padding: '0.75rem 1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{itineraire.nom}</h3>
                <span style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}>
                  {itineraire.difficulte}
                </span>
              </div>

              {/* Contenu */}
              <div style={{ padding: '1.5rem' }}>
                <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: '#555' }}>
                  {itineraire.description}
                </p>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <strong style={{ color: '#666', display: 'block', fontSize: '0.9rem' }}>⏱️ Durée</strong>
                    <span style={{ color: '#333' }}>{itineraire.duree}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#666', display: 'block', fontSize: '0.9rem' }}>📏 Distance</strong>
                    <span style={{ color: '#333' }}>{itineraire.distance}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#666', display: 'block', fontSize: '0.9rem' }}>⬆️ Dénivelé</strong>
                    <span style={{ color: '#333' }}>{itineraire.denivele}</span>
                  </div>
                  <div>
                    <strong style={{ color: '#666', display: 'block', fontSize: '0.9rem' }}>📍 Région</strong>
                    <span style={{ color: '#333' }}>{itineraire.region}</span>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                  <strong style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    🌤️ Meilleure saison :
                  </strong>
                  <span style={{ color: '#333' }}>{itineraire.meilleure_saison}</span>
                </div>

                {itineraire.points_interet && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <strong style={{ color: '#666', display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      ✨ Points d'intérêt :
                    </strong>
                    <p style={{ fontSize: '0.9rem', color: '#555' }}>{itineraire.points_interet}</p>
                  </div>
                )}

                <button 
                  style={{
                    marginTop: '1rem',
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
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
      <div style={{ 
        marginTop: '3rem', 
        padding: '2rem', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Conseils pour choisir votre randonnée</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div>
            <h4 style={{ color: '#3498db' }}>📊 Niveaux de difficulté</h4>
            <ul style={{ paddingLeft: '1.5rem', color: '#555' }}>
              <li><strong>Facile :</strong> Sentiers bien marqués, peu de dénivelé</li>
              <li><strong>Moyen :</strong> Dénivelé modéré, bonne condition physique requise</li>
              <li><strong>Difficile :</strong> Dénivelé important, expérience recommandée</li>
              <li><strong>Très Difficile :</strong> Technicité élevée, réservé aux randonneurs expérimentés</li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: '#3498db' }}>🎒 Équipement recommandé</h4>
            <ul style={{ paddingLeft: '1.5rem', color: '#555' }}>
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

// Fonction pour déterminer la couleur selon la difficulté
function getDifficultyColor(difficulte) {
  switch(difficulte) {
    case 'Facile': return '#27ae60';
    case 'Moyen': return '#f39c12';
    case 'Difficile': return '#e67e22';
    case 'Très Difficile': return '#c0392b';
    default: return '#3498db';
  }
}

export default Itineraires;