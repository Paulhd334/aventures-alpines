import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReservationSki from './ReservationSki';

const Ski = () => {
  const [activeTab, setActiveTab] = useState('disciplines');
  const [stations, setStations] = useState([]);
  const [temoignages, setTemoignages] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreRegion, setFiltreRegion] = useState('tous');
  const [filtreType, setFiltreType] = useState('tous');
  const [showReservation, setShowReservation] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [nouveauTemoignage, setNouveauTemoignage] = useState({
    nom: '',
    email: '',
    type_ski: '',
    station_id: '',
    message: '',
    note: 5
  });
  const [messageSuccess, setMessageSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'stations') {
          const response = await axios.get('http://localhost:5000/api/ski/stations');
          setStations(response.data);
        } else if (activeTab === 'temoignages') {
          const response = await axios.get('http://localhost:5000/api/ski/temoignages');
          setTemoignages(response.data);
        } else if (activeTab === 'offres') {
          const response = await axios.get('http://localhost:5000/api/ski/offres');
          setOffres(response.data);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleReservation = (offre) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/ski',
          offre: offre,
          message: 'Connectez-vous pour réserver cette offre'
        }
      });
    } else {
      setSelectedOffre(offre);
      setShowReservation(true);
    }
  };

  const handleSubmitTemoignage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/ski/temoignages', nouveauTemoignage);
      setMessageSuccess('Merci pour votre témoignage ! Il sera publié après modération.');
      setNouveauTemoignage({
        nom: '',
        email: '',
        type_ski: '',
        station_id: '',
        message: '',
        note: 5
      });
      
      const response = await axios.get('http://localhost:5000/api/ski/temoignages');
      setTemoignages(response.data);
      
      setTimeout(() => setMessageSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'envoi du témoignage');
    }
  };

  const stationsFiltrees = stations.filter(station => {
    if (filtreRegion !== 'tous' && station.region !== filtreRegion) return false;
    if (filtreType !== 'tous' && station.type_station !== filtreType) return false;
    return true;
  });

  const regions = [...new Set(stations.map(s => s.region))];

  const calculateStats = () => {
    const totalKm = stationsFiltrees.reduce((sum, s) => {
      return sum + (parseFloat(s.km_pistes) || 0);
    }, 0);
    
    const totalRemontees = stationsFiltrees.reduce((sum, s) => {
      return sum + (parseInt(s.nb_remontees) || 0);
    }, 0);
    
    const totalNeige = stationsFiltrees.reduce((sum, s) => {
      return sum + (parseInt(s.enneigement_actuel) || 0);
    }, 0);
    
    const moyenneNeige = stationsFiltrees.length > 0 
      ? Math.round(totalNeige / stationsFiltrees.length) 
      : 0;
    
    return { totalKm, totalRemontees, moyenneNeige };
  };

  const renderDisciplines = () => (
    <div className="disciplines-section">
      <h2 className="section-title">Les Disciplines du Ski</h2>
      <p className="section-description">
        Découvrez les différentes façons de pratiquer le ski en montagne, 
        chacune offrant des sensations uniques et adaptées à tous les niveaux.
      </p>
      
      <div className="disciplines-grid">
        {[
          {
            titre: 'Ski Alpin',
            description: 'Ski sur pistes damées, idéal pour débutants et confirmés. Disciplines : slalom, géant, descente.',
            niveau: 'Débutant à Expert',
            equipement: 'Ski carving, chaussures rigides',
            icon: '⛷️'
          },
          {
            titre: 'Ski de Fond',
            description: 'Ski sur terrain plat ou vallonné, excellent pour l\'endurance et la découverte des paysages.',
            niveau: 'Débutant à Intermédiaire',
            equipement: 'Skis longs et étroits',
            icon: '🎿'
          },
          {
            titre: 'Ski de Randonnée',
            description: 'Montée à ski (peaux de phoque) puis descente hors-piste. Pour les amateurs de nature sauvage.',
            niveau: 'Intermédiaire à Expert',
            equipement: 'Peaux, matériel sécurité',
            icon: '🏔️'
          },
          {
            titre: 'Freestyle',
            description: 'Figures et sauts dans les snowparks. Modules : big air, half-pipe, rails.',
            niveau: 'Intermédiaire à Expert',
            equipement: 'Twin tips, protections',
            icon: '🤸'
          },
          {
            titre: 'Freeride',
            description: 'Descente hors-piste dans la neige vierge. Équipement de sécurité obligatoire.',
            niveau: 'Expert',
            equipement: 'DVA, sonde, pelle',
            icon: '❄️'
          },
          {
            titre: 'Ski Familial',
            description: 'Activités adaptées aux familles : jardins d\'enfants, pistes débutants, animations.',
            niveau: 'Débutant',
            equipement: 'Location sur place',
            icon: '👨‍👩‍👧‍👦'
          }
        ].map((discipline, index) => (
          <div key={index} className="discipline-card">
            <div className="discipline-icon">{discipline.icon}</div>
            <h3>{discipline.titre}</h3>
            <p>{discipline.description}</p>
            <div className="discipline-info">
              <span className="info-label">Niveau :</span>
              <span className="info-value">{discipline.niveau}</span>
            </div>
            <div className="discipline-info">
              <span className="info-label">Équipement :</span>
              <span className="info-value">{discipline.equipement}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStations = () => {
    const stats = calculateStats();
    
    return (
      <div className="stations-section">
        <div className="section-header">
          <h2 className="section-title">Stations de Ski Partenaires</h2>
          <p className="section-description">
            Consultez les conditions d'enneigement en temps réel 
            et découvrez nos stations partenaires
          </p>
        </div>

        <div className="filtres-container">
          <div className="filtre-group">
            <label htmlFor="region-filtre">Région :</label>
            <select 
              id="region-filtre"
              value={filtreRegion} 
              onChange={(e) => setFiltreRegion(e.target.value)}
            >
              <option value="tous">Toutes les régions</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          
          <div className="filtre-group">
            <label htmlFor="type-filtre">Type :</label>
            <select 
              id="type-filtre"
              value={filtreType} 
              onChange={(e) => setFiltreType(e.target.value)}
            >
              <option value="tous">Tous types</option>
              <option value="petite">Petite station</option>
              <option value="moyenne">Station moyenne</option>
              <option value="grande">Grande station</option>
              <option value="très grande">Très grande station</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Chargement des stations...</div>
        ) : (
          <>
            <div className="stations-stats">
              <div className="stat-card">
                <span className="stat-number">{stationsFiltrees.length}</span>
                <span className="stat-label">Stations</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalKm.toFixed(0)}</span>
                <span className="stat-label">km de pistes</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.totalRemontees}</span>
                <span className="stat-label">Remontées</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.moyenneNeige}</span>
                <span className="stat-label">cm de neige (moy)</span>
              </div>
            </div>

            <div className="stations-grid">
              {stationsFiltrees.map(station => (
                <div key={station.id} className="station-card">
                  <div className="station-image">
                    <img 
                      src={station.photo_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop'} 
                      alt={station.nom}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop';
                      }}
                    />
                    {station.enneigement_actuel && (
                      <div className={`enneigement-badge ${station.enneigement_actuel > 80 ? 'good' : 'medium'}`}>
                        {station.enneigement_actuel} cm
                      </div>
                    )}
                  </div>
                  
                  <div className="station-content">
                    <div className="station-header">
                      <h3>{station.nom}</h3>
                      <span className="station-type">{station.type_station}</span>
                    </div>
                    
                    <p className="station-description">{station.description}</p>
                    
                    <div className="station-details">
                      <div className="detail-item">
                        <span className="detail-label">Région</span>
                        <span className="detail-value">{station.region}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Altitude</span>
                        <span className="detail-value">{station.altitude_min}m - {station.altitude_max}m</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Pistes</span>
                        <span className="detail-value">{station.nb_pistes}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Remontées</span>
                        <span className="detail-value">{station.nb_remontees}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Prix journée</span>
                        <span className="detail-value">{station.prix_journee}€</span>
                      </div>
                    </div>
                    
                    <div className="station-season">
                      <span className="season-label">Saison :</span>
                      <span className="season-value">
                        {station.ouverture ? new Date(station.ouverture).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : 'N/A'} - 
                        {station.fermeture ? new Date(station.fermeture).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    
                    {station.site_web && (
                      <a 
                        href={station.site_web} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="station-website"
                      >
                        Visiter le site web →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderTemoignages = () => (
    <div className="temoignages-section">
      <div className="section-header">
        <h2 className="section-title">Témoignages de Skieurs Passionnés</h2>
        <p className="section-description">
          Partagez votre expérience ou lisez celles de notre communauté
        </p>
      </div>

      <div className="temoignages-content">
        <div className="temoignages-form">
          <h3>Partagez votre expérience</h3>
          {messageSuccess && (
            <div className="success-message">{messageSuccess}</div>
          )}
          <form onSubmit={handleSubmitTemoignage}>
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <input 
                  type="text" 
                  value={nouveauTemoignage.nom}
                  onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, nom: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={nouveauTemoignage.email}
                  onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Type de ski</label>
                <select 
                  value={nouveauTemoignage.type_ski}
                  onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, type_ski: e.target.value})}
                >
                  <option value="">Choisir...</option>
                  <option value="alpin">Ski alpin</option>
                  <option value="fond">Ski de fond</option>
                  <option value="rando">Ski de randonnée</option>
                  <option value="freeride">Freeride</option>
                  <option value="freestyle">Freestyle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note (1-5)</label>
                <select 
                  value={nouveauTemoignage.note}
                  onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, note: parseInt(e.target.value)})}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} ⭐</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Message *</label>
              <textarea 
                value={nouveauTemoignage.message}
                onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, message: e.target.value})}
                rows="4"
                required
                placeholder="Racontez-nous votre expérience..."
              />
            </div>
            
            <button type="submit" className="submit-button">
              Envoyer mon témoignage
            </button>
          </form>
        </div>

        <div className="temoignages-list">
          <h3>Derniers témoignages</h3>
          {loading ? (
            <div className="loading">Chargement des témoignages...</div>
          ) : temoignages.length === 0 ? (
            <div className="no-data">Aucun témoignage pour le moment</div>
          ) : (
            <div className="temoignages-grid">
              {temoignages.map(temoignage => (
                <div key={temoignage.id} className="temoignage-card">
                  <div className="temoignage-header">
                    <div className="temoignage-author">
                      <strong>{temoignage.nom}</strong>
                      {temoignage.type_ski && (
                        <span className="ski-type">{temoignage.type_ski}</span>
                      )}
                    </div>
                    <div className="temoignage-rating">
                      {'⭐'.repeat(temoignage.note || 0)}
                    </div>
                  </div>
                  
                  <p className="temoignage-message">"{temoignage.message}"</p>
                  
                  <div className="temoignage-footer">
                    {temoignage.station_nom && (
                      <span className="station-name">{temoignage.station_nom}</span>
                    )}
                    <span className="temoignage-date">
                      {temoignage.created_at ? new Date(temoignage.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOffres = () => {
    if (loading) {
      return (
        <div className="offres-section">
          <div className="section-header">
            <h2 className="section-title">Offres Spéciales</h2>
            <p className="section-description">
              Profitez de promotions exclusives pour votre prochain séjour à la neige
            </p>
          </div>
          <div className="loading">Chargement des offres...</div>
        </div>
      );
    }

    if (offres.length === 0) {
      return (
        <div className="offres-section">
          <div className="section-header">
            <h2 className="section-title">Offres Spéciales</h2>
            <p className="section-description">
              Profitez de promotions exclusives pour votre prochain séjour à la neige
            </p>
          </div>
          <div className="no-data">Aucune offre disponible pour le moment</div>
        </div>
      );
    }

    return (
      <div className="offres-section">
        <div className="section-header">
          <h2 className="section-title">Offres Spéciales</h2>
          <p className="section-description">
            Profitez de promotions exclusives pour votre prochain séjour à la neige
          </p>
        </div>

        <div className="offres-grid">
          {offres.map(offre => (
            <div key={offre.id} className="offre-card">
              <div className="offre-image">
                <img 
                  src={offre.station_photo || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop'} 
                  alt={offre.station_nom || offre.titre}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop';
                  }}
                />
                {offre.reduction && (
                  <div className="promo-badge">{offre.reduction}</div>
                )}
              </div>
              
              <div className="offre-content">
                <div className="offre-header">
                  <h3>{offre.titre}</h3>
                  <span className="offre-station">{offre.station_nom}</span>
                </div>
                
                <p className="offre-description">{offre.description}</p>
                
                <div className="offre-details">
                  <div className="offre-price">
                    <span className="price-label">Prix :</span>
                    <span className="price-value">{offre.prix}€</span>
                  </div>
                  
                  <div className="offre-type">
                    <span className="type-label">Type :</span>
                    <span className="type-value">{offre.type_offre}</span>
                  </div>
                  
                  {offre.date_debut && offre.date_fin && (
                    <div className="offre-dates">
                      <span className="dates-label">Valable :</span>
                      <span className="dates-value">
                        {new Date(offre.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - 
                        {new Date(offre.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => handleReservation(offre)}
                  className="reservation-button"
                >
                  Réserver maintenant
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="ski-page">
      {/* Hero Section */}
      <div className="ski-hero">
        <h1>Le Monde du Ski en Montagne</h1>
        <p className="hero-description">
          Découvrez les différentes disciplines, consultez les conditions d'enneigement 
          en temps réel et trouvez les meilleures offres pour votre prochain séjour à la neige.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="ski-tabs">
        <button 
          className={`ski-tab ${activeTab === 'disciplines' ? 'active' : ''}`}
          onClick={() => setActiveTab('disciplines')}
        >
          <span className="tab-text">Disciplines</span>
        </button>
        <button 
          className={`ski-tab ${activeTab === 'stations' ? 'active' : ''}`}
          onClick={() => setActiveTab('stations')}
        >
          <span className="tab-text">Stations</span>
        </button>
        <button 
          className={`ski-tab ${activeTab === 'temoignages' ? 'active' : ''}`}
          onClick={() => setActiveTab('temoignages')}
        >
          <span className="tab-text">Témoignages</span>
        </button>
        <button 
          className={`ski-tab ${activeTab === 'offres' ? 'active' : ''}`}
          onClick={() => setActiveTab('offres')}
        >
          <span className="tab-text">Offres</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="ski-content">
        {activeTab === 'disciplines' && renderDisciplines()}
        {activeTab === 'stations' && renderStations()}
        {activeTab === 'temoignages' && renderTemoignages()}
        {activeTab === 'offres' && renderOffres()}
      </div>

      {/* Modale de réservation */}
      {showReservation && selectedOffre && (
        <ReservationSki 
          offre={selectedOffre}
          isOpen={showReservation}
          onClose={() => {
            setShowReservation(false);
            setTimeout(() => setSelectedOffre(null), 300);
          }}
        />
      )}
    </div>
  );
};

export default Ski;