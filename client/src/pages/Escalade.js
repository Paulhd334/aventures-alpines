// src/pages/Escalade.js - Version avec icônes FontAwesome
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Escalade = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [sites, setSites] = useState([]);
  const [temoignages, setTemoignages] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreNiveau, setFiltreNiveau] = useState('tous');
  const [filtreType, setFiltreType] = useState('tous');
  
  // États pour la réservation
  const [showReservation, setShowReservation] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [step, setStep] = useState(1);
  const [prixTotal, setPrixTotal] = useState(0);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [animation, setAnimation] = useState('closed');
  const [reservationForm, setReservationForm] = useState({
    date: '',
    nbPersonnes: 1,
    niveau: 'débutant',
    civilite: 'M.',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    cp: '',
    ville: '',
    pays: 'France',
    notes: ''
  });

  const [nouveauTemoignage, setNouveauTemoignage] = useState({
    nom: '',
    email: '',
    type_escalade: '',
    site_id: '',
    message: '',
    note: 5
  });
  const [messageSuccess, setMessageSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'sites') {
          const response = await axios.get('http://localhost:5000/api/escalade/sites');
          setSites(response.data);
        } else if (activeTab === 'temoignages') {
          const response = await axios.get('http://localhost:5000/api/escalade/temoignages');
          setTemoignages(response.data);
        } else if (activeTab === 'offres') {
          const response = await axios.get('http://localhost:5000/api/escalade/offres');
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

  // Animation du modal
  useEffect(() => {
    if (showReservation) {
      setAnimation('opening');
      setTimeout(() => setAnimation('open'), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setAnimation('closing');
      setTimeout(() => setAnimation('closed'), 300);
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showReservation]);

  // Calcul prix total
  useEffect(() => {
    if (selectedOffre) {
      let total = selectedOffre.prix * reservationForm.nbPersonnes;
      setPrixTotal(total);
    }
  }, [reservationForm, selectedOffre]);

  const handleReservation = (offre) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/escalade',
          offre: offre,
          message: 'Connectez-vous pour réserver cette offre'
        }
      });
    } else {
      setSelectedOffre(offre);
      setStep(1);
      const userData = JSON.parse(user);
      setReservationForm({
        date: '',
        nbPersonnes: 1,
        niveau: 'débutant',
        civilite: 'M.',
        nom: userData.nom_utilisateur || userData.username || '',
        prenom: '',
        email: userData.email || '',
        telephone: '',
        adresse: '',
        cp: '',
        ville: '',
        pays: 'France',
        notes: ''
      });
      setShowReservation(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => setStep(step + 1);
  const handlePrev = () => setStep(step - 1);

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    
    const user = localStorage.getItem('user');
    if (!user) {
      alert('Vous devez être connecté');
      navigate('/login');
      return;
    }

    if (!reservationForm.date) {
      alert('Veuillez choisir une date');
      return;
    }

    setReservationLoading(true);
    const userData = JSON.parse(user);

    try {
      const notesData = {
        activite: selectedOffre.titre,
        lieu: selectedOffre.lieu,
        duree: selectedOffre.duree,
        difficulte: selectedOffre.difficulte,
        niveau: reservationForm.niveau,
        clientInfo: {
          civilite: reservationForm.civilite,
          nom: reservationForm.nom,
          prenom: reservationForm.prenom,
          email: reservationForm.email,
          telephone: reservationForm.telephone,
          adresse: reservationForm.adresse,
          cp: reservationForm.cp,
          ville: reservationForm.ville,
          pays: reservationForm.pays
        },
        prixTotal: prixTotal,
        notes: reservationForm.notes
      };

      const reservationData = {
        userId: userData.id,
        activityId: selectedOffre.id,
        type_activite: 'escalade',
        date: reservationForm.date,
        nbPersonnes: parseInt(reservationForm.nbPersonnes),
        notes: JSON.stringify(notesData)
      };

      const response = await axios.post('http://localhost:5000/api/reservations', reservationData);

      if (response.data.success || response.status === 201) {
        alert('✅ Session escalade réservée avec succès !');
        setShowReservation(false);
        setTimeout(() => {
          navigate('/profil?tab=escalade');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erreur réservation:', error);
      if (error.response) {
        alert(`❌ Erreur: ${error.response.data.error || 'Erreur serveur'}`);
      } else {
        alert('❌ Erreur de connexion au serveur');
      }
    } finally {
      setReservationLoading(false);
    }
  };

  const closeModal = () => {
    setShowReservation(false);
    setTimeout(() => setSelectedOffre(null), 300);
  };

  const handleSubmitTemoignage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/escalade/temoignages', nouveauTemoignage);
      setMessageSuccess('Merci pour votre témoignage ! Il sera publié après modération.');
      setNouveauTemoignage({
        nom: '',
        email: '',
        type_escalade: '',
        site_id: '',
        message: '',
        note: 5
      });
      
      const response = await axios.get('http://localhost:5000/api/escalade/temoignages');
      setTemoignages(response.data);
      
      setTimeout(() => setMessageSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'envoi du témoignage');
    }
  };

  const sitesFiltres = sites.filter(site => {
    if (filtreNiveau !== 'tous' && site.niveau !== filtreNiveau) return false;
    if (filtreType !== 'tous' && site.type_site !== filtreType) return false;
    return true;
  });

  const niveaux = [...new Set(sites.map(s => s.niveau))];

  // Styles du modal
  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: animation === 'closed' ? 'transparent' : 'rgba(0, 0, 0, 0.7)',
    backdropFilter: animation === 'open' ? 'blur(8px)' : 'blur(0px)',
    zIndex: 1000,
    display: animation === 'closed' ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: animation === 'open' ? 1 : 0
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
    transform: animation === 'open' ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
    opacity: animation === 'open' ? 1 : 0,
    transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
    position: 'relative'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  const renderIntro = () => (
    <div className="intro-section">
      <h2 className="section-title">L'Escalade en Montagne</h2>
      <p className="section-description">
        Découvrez l'art vertical de l'escalade, des premiers pas en falaise aux grandes voies alpines.
      </p>
      
      <div className="disciplines-grid">
        {[
          {
            titre: 'Escalade Sportive',
            description: 'Voies équipées avec points d\'ancrage permanents. Idéal pour progresser en sécurité.',
            niveau: 'Tous niveaux',
            equipement: 'Cordes, dégaines, chaussons',
            icon: (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20 L8 16 L12 20 L16 16 L20 20" />
                <path d="M8 12 L12 8 L16 12" />
                <circle cx="12" cy="12" r="2" />
                <path d="M12 22 L12 14" />
              </svg>
            )
          },
          {
            titre: 'Bloc',
            description: 'Escalade de courte hauteur sans corde sur des blocs de rocher. Parfait pour la technique.',
            niveau: 'Débutant à Expert',
            equipement: 'Crash pads, chaussons, magnésie',
            icon: (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
            )
          },
          {
            titre: 'Grande Voie',
            description: 'Ascensions de plusieurs longueurs sur des parois imposantes. L\'aventure pure.',
            niveau: 'Confirmé à Expert',
            equipement: 'Cordes, dégaines, friends, coinceurs',
            icon: (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20 L6 12 L10 20 L14 12 L18 20" />
                <path d="M2 8 L6 2 L10 8 L14 2 L18 8" />
              </svg>
            )
          },
          {
            titre: 'Via Ferrata',
            description: 'Parcours sécurisé avec câbles et échelles. Accessible à tous.',
            niveau: 'Débutant à Intermédiaire',
            equipement: 'Baudrier, longes, casque',
            icon: (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="2" />
                <path d="M12 2 L12 7" />
                <path d="M12 17 L12 22" />
                <path d="M2 12 L7 12" />
                <path d="M17 12 L22 12" />
                <circle cx="12" cy="12" r="8" strokeWidth="1" />
              </svg>
            )
          },
          {
            titre: 'Escalade Traditionnelle',
            description: 'Placement de protections amovibles. La voie est libre.',
            niveau: 'Expert',
            equipement: 'Friends, coinceurs, cordes',
            icon: (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 20 L12 15 L17 20" />
                <path d="M12 15 L12 4" />
                <path d="M8 8 L16 8" />
                <path d="M10 12 L14 12" />
              </svg>
            )
          },
          {
            titre: 'Escalade Glaciaire',
            description: 'Ascension de cascades de glace. Sensations extrêmes garanties.',
            niveau: 'Expert',
            equipement: 'Piolets, crampons, vis à glace',
            icon: (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L12 6" />
                <path d="M12 18 L12 22" />
                <path d="M4 8 L20 8" />
                <path d="M4 16 L20 16" />
                <path d="M2 12 L22 12" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            )
          }
        ].map((item, index) => (
          <div key={index} className="discipline-card" style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '16px',
            padding: '24px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              textAlign: 'center',
              color: '#333'
            }}>
              {item.icon}
            </div>
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
              color: '#000',
              textAlign: 'center'
            }}>{item.titre}</h3>
            <p style={{
              color: '#666',
              fontSize: '0.9rem',
              lineHeight: '1.6',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>{item.description}</p>
            <div className="discipline-info" style={{
              marginBottom: '0.5rem',
              padding: '0.5rem',
              background: '#f8f8f8',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Niveau :</span>
              <span style={{ color: '#666', marginLeft: '0.5rem' }}>{item.niveau}</span>
            </div>
            <div className="discipline-info" style={{
              padding: '0.5rem',
              background: '#f8f8f8',
              borderRadius: '8px'
            }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Équipement :</span>
              <span style={{ color: '#666', marginLeft: '0.5rem' }}>{item.equipement}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSites = () => {
    return (
      <div className="sites-section">
        <div className="section-header">
          <h2 className="section-title">Sites d'Escalade</h2>
          <p className="section-description">
            Découvrez les plus beaux sites d'escalade, des falaises aux blocs mythiques
          </p>
        </div>

        <div className="filtres-container">
          <div className="filtre-group">
            <label htmlFor="niveau-filtre">Niveau :</label>
            <select 
              id="niveau-filtre"
              value={filtreNiveau} 
              onChange={(e) => setFiltreNiveau(e.target.value)}
            >
              <option value="tous">Tous les niveaux</option>
              {niveaux.map(niveau => (
                <option key={niveau} value={niveau}>{niveau}</option>
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
              <option value="falaise">Falaise</option>
              <option value="bloc">Bloc</option>
              <option value="grande voie">Grande voie</option>
              <option value="via ferrata">Via ferrata</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Chargement des sites...</div>
        ) : (
          <>
            <div className="stations-stats">
              <div className="stat-card">
                <span className="stat-number">{sitesFiltres.length}</span>
                <span className="stat-label">Sites</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {sitesFiltres.reduce((sum, s) => sum + (parseInt(s.nb_voies) || 0), 0)}
                </span>
                <span className="stat-label">Voies</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {Math.round(sitesFiltres.reduce((sum, s) => sum + (parseInt(s.hauteur_max) || 0), 0) / (sitesFiltres.length || 1))}
                </span>
                <span className="stat-label">m (hauteur moy)</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">
                  {[...new Set(sitesFiltres.map(s => s.region))].length}
                </span>
                <span className="stat-label">Régions</span>
              </div>
            </div>

            <div className="stations-grid">
              {sitesFiltres.map(site => (
                <div key={site.id} className="station-card">
                  <div className="station-image">
                    <img 
                      src={site.photo_url || 'https://images.unsplash.com/photo-1522163182402-834f875f7c3b?w=800&auto=format&fit=crop'} 
                      alt={site.nom}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1522163182402-834f875f7c3b?w=800&auto=format&fit=crop';
                      }}
                    />
                    {site.niveau && (
                      <div className={`enneigement-badge ${site.niveau === 'Expert' ? 'good' : 'medium'}`}>
                        {site.niveau}
                      </div>
                    )}
                  </div>
                  
                  <div className="station-content">
                    <div className="station-header">
                      <h3>{site.nom}</h3>
                      <span className="station-type">{site.type_site}</span>
                    </div>
                    
                    <p className="station-description">{site.description}</p>
                    
                    <div className="station-details">
                      <div className="detail-item">
                        <span className="detail-label">Région</span>
                        <span className="detail-value">{site.region}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Hauteur</span>
                        <span className="detail-value">{site.hauteur_min}m - {site.hauteur_max}m</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Voies</span>
                        <span className="detail-value">{site.nb_voies}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Cotation</span>
                        <span className="detail-value">{site.cotation_min} - {site.cotation_max}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Exposition</span>
                        <span className="detail-value">{site.exposition}</span>
                      </div>
                    </div>
                    
                    <div className="station-season">
                      <span className="season-label">Meilleure saison :</span>
                      <span className="season-value">
                        {site.saison_recommandee || 'Printemps/Automne'}
                      </span>
                    </div>
                    
                    {site.site_web && (
                      <a 
                        href={site.site_web} 
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
        <h2 className="section-title">Témoignages de Grimpeurs Passionnés</h2>
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
                <label>Type d'escalade</label>
                <select 
                  value={nouveauTemoignage.type_escalade}
                  onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, type_escalade: e.target.value})}
                >
                  <option value="">Choisir...</option>
                  <option value="sportive">Escalade sportive</option>
                  <option value="bloc">Bloc</option>
                  <option value="grande voie">Grande voie</option>
                  <option value="via ferrata">Via ferrata</option>
                  <option value="trad">Escalade trad</option>
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
                      {temoignage.type_escalade && (
                        <span className="ski-type">{temoignage.type_escalade}</span>
                      )}
                    </div>
                    <div className="temoignage-rating">
                      {'⭐'.repeat(temoignage.note || 0)}
                    </div>
                  </div>
                  
                  <p className="temoignage-message">"{temoignage.message}"</p>
                  
                  <div className="temoignage-footer">
                    {temoignage.site_nom && (
                      <span className="station-name">{temoignage.site_nom}</span>
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
            <h2 className="section-title">Offres d'Escalade</h2>
            <p className="section-description">
              Profitez de nos offres pour des sessions encadrées par des moniteurs diplômés
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
            <h2 className="section-title">Offres d'Escalade</h2>
            <p className="section-description">
              Profitez de nos offres pour des sessions encadrées par des moniteurs diplômés
            </p>
          </div>
          <div className="no-data">Aucune offre disponible pour le moment</div>
        </div>
      );
    }

    return (
      <div className="offres-section">
        <div className="section-header">
          <h2 className="section-title">Offres d'Escalade</h2>
          <p className="section-description">
            Profitez de nos offres pour des sessions encadrées par des moniteurs diplômés
          </p>
        </div>

        <div className="offres-grid">
          {offres.map(offre => (
            <div key={offre.id} className="offre-card">
              <div className="offre-image">
                <img 
                  src={offre.image_url || 'https://images.unsplash.com/photo-1522163182402-834f875f7c3b?w=800&auto=format&fit=crop'} 
                  alt={offre.titre}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1522163182402-834f875f7c3b?w=800&auto=format&fit=crop';
                  }}
                />
                {offre.reduction && (
                  <div className="promo-badge">{offre.reduction}</div>
                )}
              </div>
              
              <div className="offre-content">
                <div className="offre-header">
                  <h3>{offre.titre}</h3>
                  <span className="offre-station">{offre.lieu}</span>
                </div>
                
                <p className="offre-description">{offre.description}</p>
                
                <div className="offre-details">
                  <div className="offre-price">
                    <span className="price-label">Prix :</span>
                    <span className="price-value">{offre.prix}€</span>
                  </div>
                  
                  <div className="offre-type">
                    <span className="type-label">Difficulté :</span>
                    <span className="type-value">{offre.difficulte}</span>
                  </div>
                  
                  <div className="offre-dates">
                    <span className="dates-label">Durée :</span>
                    <span className="dates-value">{offre.duree}</span>
                  </div>
                  
                  <div className="offre-dates">
                    <span className="dates-label">Capacité :</span>
                    <span className="dates-value">{offre.capacite_max} pers.</span>
                  </div>
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
        <h1>L'Escalade en Montagne</h1>
        <p className="hero-description">
          Découvrez les différentes disciplines, explorez les plus beaux sites 
          et trouvez les meilleures offres pour vos sessions d'escalade.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="ski-tabs">
        <button 
          className={`ski-tab ${activeTab === 'intro' ? 'active' : ''}`}
          onClick={() => setActiveTab('intro')}
        >
          <span className="tab-text">Introduction</span>
        </button>
        <button 
          className={`ski-tab ${activeTab === 'sites' ? 'active' : ''}`}
          onClick={() => setActiveTab('sites')}
        >
          <span className="tab-text">Sites</span>
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
        {activeTab === 'intro' && renderIntro()}
        {activeTab === 'sites' && renderSites()}
        {activeTab === 'temoignages' && renderTemoignages()}
        {activeTab === 'offres' && renderOffres()}
      </div>

      {/* Modale de réservation intégrée */}
      {showReservation && selectedOffre && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            {/* Bouton fermer */}
            <button 
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                width: '40px',
                height: '40px',
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(5px)',
                border: 'none',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#fff',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Header avec image */}
            <div style={{
              background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${selectedOffre.image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              padding: '3rem 2rem',
              color: 'white',
              borderRadius: '24px 24px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  backdropFilter: 'blur(5px)',
                  fontWeight: '500',
                  color: 'white'
                }}>
                  {selectedOffre.lieu}
                </span>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  backdropFilter: 'blur(5px)',
                  fontWeight: '500',
                  color: 'white'
                }}>
                  {selectedOffre.duree}
                </span>
                <span style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  backdropFilter: 'blur(5px)',
                  fontWeight: '500',
                  color: 'white'
                }}>
                  {selectedOffre.difficulte}
                </span>
              </div>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700', color: 'white' }}>
                {selectedOffre.titre}
              </h2>
              <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', color: 'white' }}>
                {selectedOffre.description}
              </p>
            </div>

            {/* Formulaire */}
            <div style={{ padding: '2rem' }}>
              {/* Stepper */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '3rem',
                position: 'relative',
                padding: '0 1rem'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  left: '50px',
                  right: '50px',
                  height: '2px',
                  background: '#e5e5e5',
                  zIndex: 0
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(step - 1) * 33.33}%`,
                    background: '#000',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                {[
                  { num: 1, label: 'Options' },
                  { num: 2, label: 'Identité' },
                  { num: 3, label: 'Adresse' },
                  { num: 4, label: 'Confirmation' }
                ].map((item) => (
                  <div key={item.num} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: step >= item.num ? '#000' : '#fff',
                      border: `2px solid ${step >= item.num ? '#000' : '#e5e5e5'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step >= item.num ? '#fff' : '#999',
                      fontWeight: 'bold',
                      marginBottom: '0.5rem',
                      transition: 'all 0.3s ease'
                    }}>
                      {step > item.num ? '✓' : item.num}
                    </div>
                    <span style={{
                      fontSize: '0.8rem',
                      color: step >= item.num ? '#000' : '#999',
                      fontWeight: step === item.num ? '600' : '400'
                    }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmitReservation}>
                {step === 1 && (
                  <div style={{ animation: 'slideIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>
                      1. Choisissez vos options
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Date de la session *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={reservationForm.date}
                          onChange={handleFormChange}
                          required
                          style={inputStyle}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Nombre de personnes *
                        </label>
                        <input
                          type="number"
                          name="nbPersonnes"
                          value={reservationForm.nbPersonnes}
                          onChange={handleFormChange}
                          min="1"
                          max={selectedOffre.capacite_max}
                          required
                          style={inputStyle}
                        />
                        <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                          Maximum {selectedOffre.capacite_max} personnes
                        </small>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Niveau
                        </label>
                        <select
                          name="niveau"
                          value={reservationForm.niveau}
                          onChange={handleFormChange}
                          style={inputStyle}
                        >
                          <option value="débutant">Débutant</option>
                          <option value="intermédiaire">Intermédiaire</option>
                          <option value="confirmé">Confirmé</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ animation: 'slideIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>
                      2. Vos informations personnelles
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Civilité
                        </label>
                        <select
                          name="civilite"
                          value={reservationForm.civilite}
                          onChange={handleFormChange}
                          style={inputStyle}
                        >
                          <option value="M.">M.</option>
                          <option value="Mme">Mme</option>
                          <option value="Mlle">Mlle</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                            Nom *
                          </label>
                          <input
                            type="text"
                            name="nom"
                            value={reservationForm.nom}
                            onChange={handleFormChange}
                            required
                            style={inputStyle}
                            placeholder="Votre nom"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                            Prénom *
                          </label>
                          <input
                            type="text"
                            name="prenom"
                            value={reservationForm.prenom}
                            onChange={handleFormChange}
                            required
                            style={inputStyle}
                            placeholder="Votre prénom"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={reservationForm.email}
                            onChange={handleFormChange}
                            required
                            style={inputStyle}
                            placeholder="exemple@email.com"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                            Téléphone *
                          </label>
                          <input
                            type="tel"
                            name="telephone"
                            value={reservationForm.telephone}
                            onChange={handleFormChange}
                            required
                            style={inputStyle}
                            placeholder="06 12 34 56 78"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ animation: 'slideIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>
                      3. Votre adresse
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Adresse *
                        </label>
                        <input
                          type="text"
                          name="adresse"
                          value={reservationForm.adresse}
                          onChange={handleFormChange}
                          required
                          style={inputStyle}
                          placeholder="Numéro et rue"
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                            Code postal *
                          </label>
                          <input
                            type="text"
                            name="cp"
                            value={reservationForm.cp}
                            onChange={handleFormChange}
                            required
                            style={inputStyle}
                            placeholder="75001"
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                            Ville *
                          </label>
                          <input
                            type="text"
                            name="ville"
                            value={reservationForm.ville}
                            onChange={handleFormChange}
                            required
                            style={inputStyle}
                            placeholder="Paris"
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Pays
                        </label>
                        <input
                          type="text"
                          name="pays"
                          value={reservationForm.pays}
                          onChange={handleFormChange}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Notes / Demandes spéciales
                        </label>
                        <textarea
                          name="notes"
                          value={reservationForm.notes}
                          onChange={handleFormChange}
                          rows="3"
                          style={{ ...inputStyle, resize: 'vertical' }}
                          placeholder="Régime alimentaire, besoins spécifiques..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div style={{ animation: 'slideIn 0.3s ease' }}>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      marginBottom: '2rem', 
                      color: '#1a1a1a',
                      fontWeight: '500',
                      letterSpacing: '-0.01em'
                    }}>
                      Confirmation de votre réservation
                    </h3>
                    
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '20px',
                      padding: '2rem',
                      marginBottom: '2rem',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                      border: '1px solid #f0f0f0'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        paddingBottom: '1.5rem',
                        borderBottom: '2px solid #f5f5f5'
                      }}>
                        <div>
                          <span style={{
                            fontSize: '0.75rem',
                            color: '#888',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            fontWeight: '400'
                          }}>
                            Récapitulatif
                          </span>
                          <h4 style={{
                            fontSize: '1.25rem',
                            color: '#1a1a1a',
                            marginTop: '0.25rem',
                            fontWeight: '500'
                          }}>
                            {selectedOffre.titre}
                          </h4>
                        </div>
                        <div style={{
                          background: '#fafafa',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '40px',
                          border: '1px solid #e5e5e5'
                        }}>
                          <span style={{
                            fontSize: '1.75rem',
                            fontWeight: '500',
                            color: '#1a1a1a'
                          }}>
                            {prixTotal}€
                          </span>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1.5rem'
                      }}>
                        <div>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Lieu
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            color: '#1a1a1a',
                            fontWeight: '500'
                          }}>
                            {selectedOffre.lieu}
                          </span>
                        </div>

                        <div>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Date
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            color: '#1a1a1a',
                            fontWeight: '500'
                          }}>
                            {new Date(reservationForm.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                          </span>
                        </div>

                        <div>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Personnes
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            color: '#1a1a1a',
                            fontWeight: '500'
                          }}>
                            {reservationForm.nbPersonnes} {reservationForm.nbPersonnes > 1 ? 'personnes' : 'personne'}
                          </span>
                        </div>

                        <div>
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#999',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'block',
                            marginBottom: '0.25rem'
                          }}>
                            Client
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            color: '#1a1a1a',
                            fontWeight: '500'
                          }}>
                            {reservationForm.civilite} {reservationForm.prenom} {reservationForm.nom}
                          </span>
                        </div>
                      </div>

                      <div style={{
                        marginTop: '1.5rem',
                        paddingTop: '1.5rem',
                        borderTop: '2px solid #f5f5f5'
                      }}>
                        <span style={{
                          fontSize: '0.7rem',
                          color: '#999',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'block',
                          marginBottom: '0.75rem'
                        }}>
                          Niveau choisi
                        </span>
                        <span style={{
                          background: '#f5f5f5',
                          padding: '0.5rem 1rem',
                          borderRadius: '30px',
                          fontSize: '0.85rem',
                          color: '#333',
                          border: '1px solid #e5e5e5'
                        }}>
                          {reservationForm.niveau}
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'center',
                      background: '#fafafa',
                      padding: '1.5rem',
                      borderRadius: '16px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <input
                        type="checkbox"
                        required
                        id="accept"
                        style={{ 
                          width: '20px', 
                          height: '20px',
                          accentColor: '#000'
                        }}
                      />
                      <label htmlFor="accept" style={{ 
                        color: '#333',
                        fontSize: '0.95rem'
                      }}>
                        J'accepte les conditions générales de vente et la politique de confidentialité *
                      </label>
                    </div>
                  </div>
                )}

                {/* Boutons de navigation */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '3rem',
                  paddingTop: '2rem',
                  borderTop: '2px solid #f0f0f0'
                }}>
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      style={{
                        padding: '1rem 2rem',
                        border: '2px solid #000',
                        background: 'white',
                        color: '#000',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#000';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#000';
                      }}
                    >
                      ← Étape précédente
                    </button>
                  )}
                  
                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      style={{
                        padding: '1rem 2rem',
                        border: 'none',
                        background: '#000',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        marginLeft: 'auto',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#333';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#000';
                      }}
                    >
                      Étape suivante →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={reservationLoading}
                      style={{
                        padding: '1rem 2rem',
                        border: 'none',
                        background: reservationLoading ? '#999' : '#000',
                        color: 'white',
                        borderRadius: '12px',
                        cursor: reservationLoading ? 'not-allowed' : 'pointer',
                        fontSize: '1rem',
                        fontWeight: '500',
                        marginLeft: 'auto',
                        opacity: reservationLoading ? 0.7 : 1,
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!reservationLoading) e.target.style.background = '#333';
                      }}
                      onMouseLeave={(e) => {
                        if (!reservationLoading) e.target.style.background = '#000';
                      }}
                    >
                      {reservationLoading ? 'Réservation...' : 'Confirmer la réservation'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Escalade;