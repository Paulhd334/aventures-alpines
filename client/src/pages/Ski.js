import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Ski = () => {
  const [activeTab, setActiveTab] = useState('disciplines');
  const [stations, setStations] = useState([]);
  const [temoignages, setTemoignages] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreRegion, setFiltreRegion] = useState('tous');
  const [filtreType, setFiltreType] = useState('tous');
  const [nouveauTemoignage, setNouveauTemoignage] = useState({
    nom: '', email: '', type_ski: '', station_id: '', message: '', note: 5
  });
  const [messageSuccess, setMessageSuccess] = useState('');

  // ── États réservation (intégrés, plus de ReservationSki.js) ──
  const [showReservation, setShowReservation] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [step, setStep] = useState(1);
  const [prixTotal, setPrixTotal] = useState(0);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [animation, setAnimation] = useState('closed');
  const [formData, setFormData] = useState({
    dateDebut: '', dateFin: '', nbPersonnes: 1,
    forfaitSki: true, coursSki: false, locationMateriel: false,
    typeCours: 'collectif', niveau: 'débutant',
    civilite: 'M.', nom: '', prenom: '', email: '', telephone: '',
    adresse: '', cp: '', ville: '', pays: 'France',
    assurance: false, parking: false, garderie: false, restauration: false,
    notes: ''
  });

  const navigate = useNavigate();
  const API = 'http://localhost:5000';

  // ── Fetch données ──
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'stations') {
          const r = await axios.get(`${API}/api/ski/stations`);
          setStations(r.data);
        } else if (activeTab === 'temoignages') {
          const r = await axios.get(`${API}/api/ski/temoignages`);
          setTemoignages(r.data);
        } else if (activeTab === 'offres') {
          const r = await axios.get(`${API}/api/ski/offres`);
          setOffres(r.data);
        }
      } catch (err) {
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // ── Animation modal ──
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
    return () => { document.body.style.overflow = 'auto'; };
  }, [showReservation]);

  // ── Calcul prix ──
  useEffect(() => {
    if (!selectedOffre) return;
    let total = parseFloat(selectedOffre.prix) || 0;
    if (formData.coursSki) total += 45;
    if (formData.locationMateriel) total += 35;
    if (formData.assurance) total += 15;
    if (formData.parking) total += 12;
    if (formData.garderie) total += 25;
    if (formData.restauration) total += 28;
    total *= formData.nbPersonnes;
    if (formData.dateDebut && formData.dateFin) {
      const days = Math.ceil((new Date(formData.dateFin) - new Date(formData.dateDebut)) / 86400000) + 1;
      if (days > 0 && days < 30) total *= days;
    }
    setPrixTotal(Math.round(total));
  }, [formData, selectedOffre]);

  // ── Ouvrir réservation ──
  const handleReservation = (offre) => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login', { state: { from: '/ski', message: 'Connectez-vous pour réserver' } });
      return;
    }
    const userData = JSON.parse(stored);
    setSelectedOffre(offre);
    setStep(1);
    setFormData(prev => ({
      ...prev,
      dateDebut: '', dateFin: '', nbPersonnes: 1,
      forfaitSki: true, coursSki: false, locationMateriel: false,
      assurance: false, parking: false, garderie: false, restauration: false,
      nom: userData.nom_utilisateur || userData.username || '',
      prenom: '', email: userData.email || '',
      telephone: '', adresse: '', cp: '', ville: '', pays: 'France', notes: ''
    }));
    setShowReservation(true);
  };

  const closeModal = () => {
    setShowReservation(false);
    setTimeout(() => setSelectedOffre(null), 300);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── FIX PRINCIPAL : type_activite: 'ski' ajouté ──
  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    const stored = localStorage.getItem('user');
    if (!stored) { alert('Vous devez être connecté'); navigate('/login'); return; }
    if (!formData.dateDebut || !formData.dateFin) { alert('Veuillez sélectionner les dates'); return; }
    if (!formData.nom || !formData.prenom || !formData.email) { alert('Veuillez remplir vos informations personnelles'); return; }

    setReservationLoading(true);
    const userData = JSON.parse(stored);
    try {
      const response = await axios.post(`${API}/api/reservations`, {
        userId: userData.id,
        activityId: selectedOffre.id,
        type_activite: 'ski',            // ✅ FIX : était absent, causait le 400
        date: formData.dateDebut,
        nbPersonnes: parseInt(formData.nbPersonnes),
        notes: JSON.stringify({
          offre: selectedOffre.titre,
          station: selectedOffre.station_nom,
          dateFin: formData.dateFin,
          options: {
            forfaitSki: formData.forfaitSki,
            coursSki: formData.coursSki,
            locationMateriel: formData.locationMateriel,
            typeCours: formData.typeCours,
            niveau: formData.niveau,
            assurance: formData.assurance,
            parking: formData.parking,
            garderie: formData.garderie,
            restauration: formData.restauration
          },
          clientInfo: {
            civilite: formData.civilite, nom: formData.nom, prenom: formData.prenom,
            email: formData.email, telephone: formData.telephone,
            adresse: formData.adresse, cp: formData.cp, ville: formData.ville, pays: formData.pays
          },
          prixTotal
        })
      });

      if (response.data.success || response.status === 201) {
        alert('✅ Réservation ski confirmée avec succès !');
        closeModal();
        setTimeout(() => navigate('/profil'), 500);
      }
    } catch (error) {
      console.error('❌ Erreur réservation:', error);
      alert(error.response ? `❌ ${error.response.data.error || 'Erreur serveur'}` : '❌ Serveur inaccessible');
    } finally {
      setReservationLoading(false);
    }
  };

  // ── Témoignage ──
  const handleSubmitTemoignage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/api/ski/temoignages`, nouveauTemoignage);
      setMessageSuccess('Merci pour votre témoignage ! Il sera publié après modération.');
      setNouveauTemoignage({ nom: '', email: '', type_ski: '', station_id: '', message: '', note: 5 });
      const r = await axios.get(`${API}/api/ski/temoignages`);
      setTemoignages(r.data);
      setTimeout(() => setMessageSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur lors de l\'envoi du témoignage');
    }
  };

  const stationsFiltrees = stations.filter(s => {
    if (filtreRegion !== 'tous' && s.region !== filtreRegion) return false;
    if (filtreType !== 'tous' && s.type_station !== filtreType) return false;
    return true;
  });
  const regions = [...new Set(stations.map(s => s.region))];

  const calculateStats = () => {
    const totalKm = stationsFiltrees.reduce((sum, s) => sum + (parseFloat(s.km_pistes) || 0), 0);
    const totalRemontees = stationsFiltrees.reduce((sum, s) => sum + (parseInt(s.nb_remontees) || 0), 0);
    const totalNeige = stationsFiltrees.reduce((sum, s) => sum + (parseInt(s.enneigement_actuel) || 0), 0);
    const moyenneNeige = stationsFiltrees.length > 0 ? Math.round(totalNeige / stationsFiltrees.length) : 0;
    return { totalKm, totalRemontees, moyenneNeige };
  };

  // ════════════════════════════════════════════
  // RENDER DISCIPLINES
  // ════════════════════════════════════════════
  const renderDisciplines = () => (
    <div className="disciplines-section">
      <h2 className="section-title">Les Disciplines du Ski</h2>
      <p className="section-description">
        Découvrez les différentes façons de pratiquer le ski en montagne,
        chacune offrant des sensations uniques et adaptées à tous les niveaux.
      </p>
      <div className="disciplines-grid">
        {[
          { titre: 'Ski Alpin', description: 'Ski sur pistes damées, idéal pour débutants et confirmés. Disciplines : slalom, géant, descente.', niveau: 'Débutant à Expert', equipement: 'Ski carving, chaussures rigides', icon: '⛷️' },
          { titre: 'Ski de Fond', description: 'Ski sur terrain plat ou vallonné, excellent pour l\'endurance et la découverte des paysages.', niveau: 'Débutant à Intermédiaire', equipement: 'Skis longs et étroits', icon: '🎿' },
          { titre: 'Ski de Randonnée', description: 'Montée à ski (peaux de phoque) puis descente hors-piste. Pour les amateurs de nature sauvage.', niveau: 'Intermédiaire à Expert', equipement: 'Peaux, matériel sécurité', icon: '🏔️' },
          { titre: 'Freestyle', description: 'Figures et sauts dans les snowparks. Modules : big air, half-pipe, rails.', niveau: 'Intermédiaire à Expert', equipement: 'Twin tips, protections', icon: '🤸' },
          { titre: 'Freeride', description: 'Descente hors-piste dans la neige vierge. Équipement de sécurité obligatoire.', niveau: 'Expert', equipement: 'DVA, sonde, pelle', icon: '❄️' },
          { titre: 'Ski Familial', description: 'Activités adaptées aux familles : jardins d\'enfants, pistes débutants, animations.', niveau: 'Débutant', equipement: 'Location sur place', icon: '👨‍👩‍👧‍👦' }
        ].map((d, i) => (
          <div key={i} className="discipline-card">
            <div className="discipline-icon">{d.icon}</div>
            <h3>{d.titre}</h3>
            <p>{d.description}</p>
            <div className="discipline-info"><span className="info-label">Niveau :</span><span className="info-value">{d.niveau}</span></div>
            <div className="discipline-info"><span className="info-label">Équipement :</span><span className="info-value">{d.equipement}</span></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // RENDER STATIONS
  // ════════════════════════════════════════════
  const renderStations = () => {
    const stats = calculateStats();
    return (
      <div className="stations-section">
        <div className="section-header">
          <h2 className="section-title">Stations de Ski Partenaires</h2>
          <p className="section-description">Consultez les conditions d'enneigement en temps réel et découvrez nos stations partenaires</p>
        </div>
        <div className="filtres-container">
          <div className="filtre-group">
            <label htmlFor="region-filtre">Région :</label>
            <select id="region-filtre" value={filtreRegion} onChange={(e) => setFiltreRegion(e.target.value)}>
              <option value="tous">Toutes les régions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="filtre-group">
            <label htmlFor="type-filtre">Type :</label>
            <select id="type-filtre" value={filtreType} onChange={(e) => setFiltreType(e.target.value)}>
              <option value="tous">Tous types</option>
              <option value="petite">Petite station</option>
              <option value="moyenne">Station moyenne</option>
              <option value="grande">Grande station</option>
              <option value="très grande">Très grande station</option>
            </select>
          </div>
        </div>
        {loading ? <div className="loading">Chargement des stations...</div> : (
          <>
            <div className="stations-stats">
              <div className="stat-card"><span className="stat-number">{stationsFiltrees.length}</span><span className="stat-label">Stations</span></div>
              <div className="stat-card"><span className="stat-number">{stats.totalKm.toFixed(0)}</span><span className="stat-label">km de pistes</span></div>
              <div className="stat-card"><span className="stat-number">{stats.totalRemontees}</span><span className="stat-label">Remontées</span></div>
              <div className="stat-card"><span className="stat-number">{stats.moyenneNeige}</span><span className="stat-label">cm de neige (moy)</span></div>
            </div>
            <div className="stations-grid">
              {stationsFiltrees.map(station => (
                <div key={station.id} className="station-card">
                  <div className="station-image">
                    <img src={station.photo_url || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop'} alt={station.nom}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop'; }} />
                    {station.enneigement_actuel && (
                      <div className={`enneigement-badge ${station.enneigement_actuel > 80 ? 'good' : 'medium'}`}>{station.enneigement_actuel} cm</div>
                    )}
                  </div>
                  <div className="station-content">
                    <div className="station-header">
                      <h3>{station.nom}</h3>
                      <span className="station-type">{station.type_station}</span>
                    </div>
                    <p className="station-description">{station.description}</p>
                    <div className="station-details">
                      <div className="detail-item"><span className="detail-label">Région</span><span className="detail-value">{station.region}</span></div>
                      <div className="detail-item"><span className="detail-label">Altitude</span><span className="detail-value">{station.altitude_min}m - {station.altitude_max}m</span></div>
                      <div className="detail-item"><span className="detail-label">Pistes</span><span className="detail-value">{station.nb_pistes}</span></div>
                      <div className="detail-item"><span className="detail-label">Remontées</span><span className="detail-value">{station.nb_remontees}</span></div>
                      <div className="detail-item"><span className="detail-label">Prix journée</span><span className="detail-value">{station.prix_journee}€</span></div>
                    </div>
                    <div className="station-season">
                      <span className="season-label">Saison :</span>
                      <span className="season-value">
                        {station.ouverture ? new Date(station.ouverture).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : 'N/A'} -&nbsp;
                        {station.fermeture ? new Date(station.fermeture).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    {station.site_web && <a href={station.site_web} target="_blank" rel="noopener noreferrer" className="station-website">Visiter le site web →</a>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // ════════════════════════════════════════════
  // RENDER TÉMOIGNAGES
  // ════════════════════════════════════════════
  const renderTemoignages = () => (
    <div className="temoignages-section">
      <div className="section-header">
        <h2 className="section-title">Témoignages de Skieurs Passionnés</h2>
        <p className="section-description">Partagez votre expérience ou lisez celles de notre communauté</p>
      </div>
      <div className="temoignages-content">
        <div className="temoignages-form">
          <h3>Partagez votre expérience</h3>
          {messageSuccess && <div className="success-message">{messageSuccess}</div>}
          <form onSubmit={handleSubmitTemoignage}>
            <div className="form-row">
              <div className="form-group">
                <label>Nom *</label>
                <input type="text" value={nouveauTemoignage.nom} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, nom: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={nouveauTemoignage.email} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, email: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type de ski</label>
                <select value={nouveauTemoignage.type_ski} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, type_ski: e.target.value})}>
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
                <select value={nouveauTemoignage.note} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, note: parseInt(e.target.value)})}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea value={nouveauTemoignage.message} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, message: e.target.value})} rows="4" required placeholder="Racontez-nous votre expérience..." />
            </div>
            <button type="submit" className="submit-button">Envoyer mon témoignage</button>
          </form>
        </div>
        <div className="temoignages-list">
          <h3>Derniers témoignages</h3>
          {loading ? <div className="loading">Chargement...</div> : temoignages.length === 0 ? (
            <div className="no-data">Aucun témoignage pour le moment</div>
          ) : (
            <div className="temoignages-grid">
              {temoignages.map(t => (
                <div key={t.id} className="temoignage-card">
                  <div className="temoignage-header">
                    <div className="temoignage-author">
                      <strong>{t.nom}</strong>
                      {t.type_ski && <span className="ski-type">{t.type_ski}</span>}
                    </div>
                    <div className="temoignage-rating">{'⭐'.repeat(t.note || 0)}</div>
                  </div>
                  <p className="temoignage-message">"{t.message}"</p>
                  <div className="temoignage-footer">
                    {t.station_nom && <span className="station-name">{t.station_nom}</span>}
                    <span className="temoignage-date">{t.created_at ? new Date(t.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ════════════════════════════════════════════
  // RENDER OFFRES
  // ════════════════════════════════════════════
  const renderOffres = () => {
    if (loading) return (
      <div className="offres-section">
        <div className="section-header"><h2 className="section-title">Offres Spéciales</h2></div>
        <div className="loading">Chargement des offres...</div>
      </div>
    );
    if (offres.length === 0) return (
      <div className="offres-section">
        <div className="section-header"><h2 className="section-title">Offres Spéciales</h2></div>
        <div className="no-data">Aucune offre disponible pour le moment</div>
      </div>
    );
    return (
      <div className="offres-section">
        <div className="section-header">
          <h2 className="section-title">Offres Spéciales</h2>
          <p className="section-description">Profitez de promotions exclusives pour votre prochain séjour à la neige</p>
        </div>
        <div className="offres-grid">
          {offres.map(offre => (
            <div key={offre.id} className="offre-card">
              <div className="offre-image">
                <img src={offre.station_photo || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop'} alt={offre.station_nom || offre.titre}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop'; }} />
                {offre.reduction && <div className="promo-badge">{offre.reduction}</div>}
              </div>
              <div className="offre-content">
                <div className="offre-header">
                  <h3>{offre.titre}</h3>
                  <span className="offre-station">{offre.station_nom}</span>
                </div>
                <p className="offre-description">{offre.description}</p>
                <div className="offre-details">
                  <div className="offre-price"><span className="price-label">Prix :</span><span className="price-value">{offre.prix}€</span></div>
                  <div className="offre-type"><span className="type-label">Type :</span><span className="type-value">{offre.type_offre}</span></div>
                  {offre.date_debut && offre.date_fin && (
                    <div className="offre-dates">
                      <span className="dates-label">Valable :</span>
                      <span className="dates-value">
                        {new Date(offre.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} -&nbsp;
                        {new Date(offre.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={() => handleReservation(offre)} className="reservation-button">Réserver maintenant</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ════════════════════════════════════════════
  // RENDER MODAL RÉSERVATION (intégrée)
  // ════════════════════════════════════════════
  const inputStyle = {
    width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5',
    borderRadius: '8px', fontSize: '1rem', outline: 'none'
  };

  const renderModal = () => {
    if (!showReservation || !selectedOffre) return null;
    return (
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: animation === 'open' ? 'blur(8px)' : 'none',
          zIndex: 1000, display: animation === 'closed' ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.4s ease', opacity: animation === 'open' ? 1 : 0
        }}
        onClick={closeModal}
      >
        <div
          style={{
            backgroundColor: 'white', borderRadius: '24px', width: '90%',
            maxWidth: '900px', maxHeight: '90vh', overflow: 'auto',
            boxShadow: '0 30px 60px rgba(0,0,0,0.3)', position: 'relative',
            transform: animation === 'open' ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
            opacity: animation === 'open' ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton fermer */}
          <button onClick={closeModal} style={{
            position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px',
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            fontSize: '20px', cursor: 'pointer', color: '#fff', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>

          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${selectedOffre.station_photo || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop'})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            padding: '3rem 2rem', color: 'white', borderRadius: '24px 24px 0 0'
          }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {selectedOffre.station_nom && (
                <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.9rem', color: 'white' }}>
                  {selectedOffre.station_nom}
                </span>
              )}
              {selectedOffre.reduction && (
                <span style={{ background: '#000', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 'bold', color: 'white' }}>
                  {selectedOffre.reduction}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700', color: 'white' }}>{selectedOffre.titre}</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', color: 'white' }}>{selectedOffre.description}</p>
          </div>

          {/* Corps */}
          <div style={{ padding: '2rem' }}>
            {/* Stepper */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', position: 'relative', padding: '0 1rem' }}>
              <div style={{ position: 'absolute', top: '15px', left: '50px', right: '50px', height: '2px', background: '#e5e5e5', zIndex: 0 }}>
                <div style={{ height: '100%', width: `${(step - 1) * 33.33}%`, background: '#000', transition: 'width 0.3s ease' }} />
              </div>
              {[{ num: 1, label: 'Options' }, { num: 2, label: 'Identité' }, { num: 3, label: 'Adresse' }, { num: 4, label: 'Confirmation' }].map(item => (
                <div key={item.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: step >= item.num ? '#000' : '#fff', border: `2px solid ${step >= item.num ? '#000' : '#e5e5e5'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= item.num ? '#fff' : '#999', fontWeight: 'bold', marginBottom: '0.5rem', transition: 'all 0.3s ease' }}>
                    {step > item.num ? '✓' : item.num}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: step >= item.num ? '#000' : '#999', fontWeight: step === item.num ? '600' : '400' }}>{item.label}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmitReservation}>
              {/* Étape 1 */}
              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>1. Choisissez vos options</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date d'arrivée *</label>
                        <input type="date" name="dateDebut" value={formData.dateDebut} onChange={handleChange} required style={inputStyle} min={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date de départ *</label>
                        <input type="date" name="dateFin" value={formData.dateFin} onChange={handleChange} required style={inputStyle} min={formData.dateDebut || new Date().toISOString().split('T')[0]} />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre de personnes *</label>
                      <input type="number" name="nbPersonnes" value={formData.nbPersonnes} onChange={handleChange} min="1" max="20" required style={inputStyle} />
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <h4 style={{ marginBottom: '1rem' }}>Options :</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                          { name: 'forfaitSki', label: 'Forfait ski inclus' },
                          { name: 'coursSki', label: 'Cours de ski (+45€/pers)' },
                          { name: 'locationMateriel', label: 'Location matériel (+35€/pers)' }
                        ].map(opt => (
                          <label key={opt.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {formData.coursSki && (
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Détails des cours</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type de cours</label>
                            <select name="typeCours" value={formData.typeCours} onChange={handleChange} style={inputStyle}>
                              <option value="collectif">Collectif</option>
                              <option value="prive">Privé</option>
                              <option value="famille">Famille</option>
                            </select>
                          </div>
                          <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Niveau</label>
                            <select name="niveau" value={formData.niveau} onChange={handleChange} style={inputStyle}>
                              <option value="débutant">Débutant</option>
                              <option value="intermédiaire">Intermédiaire</option>
                              <option value="confirmé">Confirmé</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Étape 2 */}
              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>2. Vos informations personnelles</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Civilité</label>
                      <select name="civilite" value={formData.civilite} onChange={handleChange} style={inputStyle}>
                        <option value="M.">M.</option><option value="Mme">Mme</option><option value="Mlle">Mlle</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nom *</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} required style={inputStyle} placeholder="Votre nom" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Prénom *</label><input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required style={inputStyle} placeholder="Votre prénom" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Téléphone *</label><input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} required style={inputStyle} placeholder="06 12 34 56 78" /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3 */}
              {step === 3 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>3. Votre adresse</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Adresse *</label><input type="text" name="adresse" value={formData.adresse} onChange={handleChange} required style={inputStyle} placeholder="Numéro et rue" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Code postal *</label><input type="text" name="cp" value={formData.cp} onChange={handleChange} required style={inputStyle} placeholder="75001" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ville *</label><input type="text" name="ville" value={formData.ville} onChange={handleChange} required style={inputStyle} placeholder="Paris" /></div>
                    </div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Pays</label><input type="text" name="pays" value={formData.pays} onChange={handleChange} style={inputStyle} /></div>
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                      <h4 style={{ marginBottom: '1rem' }}>Options supplémentaires</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                          { name: 'assurance', label: 'Assurance annulation (+15€)' },
                          { name: 'parking', label: 'Parking couvert (+12€/j)' },
                          { name: 'garderie', label: 'Garderie (+25€/j/enfant)' },
                          { name: 'restauration', label: 'Demi-pension (+28€/j)' }
                        ].map(opt => (
                          <label key={opt.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" name={opt.name} checked={formData[opt.name]} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Notes / Demandes spéciales</label><textarea name="notes" value={formData.notes} onChange={handleChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Régime alimentaire, besoins spécifiques..." /></div>
                  </div>
                </div>
              )}

              {/* Étape 4 */}
              {step === 4 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#1a1a1a', fontWeight: '500' }}>Confirmation de votre réservation</h3>
                  <div style={{ background: '#fff', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid #f5f5f5' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Récapitulatif</span>
                        <h4 style={{ fontSize: '1.25rem', color: '#1a1a1a', marginTop: '0.25rem', fontWeight: '500' }}>{selectedOffre.titre}</h4>
                      </div>
                      <div style={{ background: '#fafafa', padding: '0.75rem 1.5rem', borderRadius: '40px', border: '1px solid #e5e5e5' }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: '500', color: '#1a1a1a' }}>{prixTotal}€</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                      {[
                        { label: 'Station', value: selectedOffre.station_nom },
                        { label: 'Séjour', value: `${new Date(formData.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → ${new Date(formData.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}` },
                        { label: 'Personnes', value: `${formData.nbPersonnes} ${formData.nbPersonnes > 1 ? 'personnes' : 'personne'}` },
                        { label: 'Client', value: `${formData.civilite} ${formData.prenom} ${formData.nom}` }
                      ].map(item => (
                        <div key={item.label}>
                          <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                          <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {(formData.coursSki || formData.locationMateriel || formData.assurance || formData.parking || formData.garderie || formData.restauration) && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f5f5f5' }}>
                        <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.75rem' }}>Options sélectionnées</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {formData.coursSki && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Cours de ski</span>}
                          {formData.locationMateriel && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Location matériel</span>}
                          {formData.assurance && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Assurance</span>}
                          {formData.parking && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Parking</span>}
                          {formData.garderie && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Garderie</span>}
                          {formData.restauration && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Demi-pension</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#fafafa', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f0f0f0' }}>
                    <input type="checkbox" required id="accept" style={{ width: '20px', height: '20px', accentColor: '#000' }} />
                    <label htmlFor="accept" style={{ color: '#333', fontSize: '0.95rem' }}>J'accepte les conditions générales de vente et la politique de confidentialité *</label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid #f0f0f0' }}>
                {step > 1 && (
                  <button type="button" onClick={() => setStep(s => s - 1)}
                    style={{ padding: '1rem 2rem', border: '2px solid #000', background: 'white', color: '#000', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}
                    onMouseEnter={(e) => { e.target.style.background = '#000'; e.target.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = '#000'; }}>
                    ← Étape précédente
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)}
                    style={{ padding: '1rem 2rem', border: 'none', background: '#000', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', marginLeft: 'auto' }}
                    onMouseEnter={(e) => { e.target.style.background = '#333'; }}
                    onMouseLeave={(e) => { e.target.style.background = '#000'; }}>
                    Étape suivante →
                  </button>
                ) : (
                  <button type="submit" disabled={reservationLoading}
                    style={{ padding: '1rem 2rem', border: 'none', background: reservationLoading ? '#999' : '#000', color: 'white', borderRadius: '12px', cursor: reservationLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500', marginLeft: 'auto', opacity: reservationLoading ? 0.7 : 1 }}
                    onMouseEnter={(e) => { if (!reservationLoading) e.target.style.background = '#333'; }}
                    onMouseLeave={(e) => { if (!reservationLoading) e.target.style.background = '#000'; }}>
                    {reservationLoading ? 'Réservation en cours...' : 'Confirmer la réservation'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`}</style>
      </div>
    );
  };

  // ════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ════════════════════════════════════════════
  return (
    <div className="ski-page">
      <div className="ski-hero">
        <h1>Le Monde du Ski en Montagne</h1>
        <p className="hero-description">
          Découvrez les différentes disciplines, consultez les conditions d'enneigement
          en temps réel et trouvez les meilleures offres pour votre prochain séjour à la neige.
        </p>
      </div>

      <div className="ski-tabs">
        {[
          { id: 'disciplines', label: 'Disciplines' },
          { id: 'stations', label: 'Stations' },
          { id: 'temoignages', label: 'Témoignages' },
          { id: 'offres', label: 'Offres' }
        ].map(tab => (
          <button key={tab.id} className={`ski-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="tab-text">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ski-content">
        {activeTab === 'disciplines' && renderDisciplines()}
        {activeTab === 'stations' && renderStations()}
        {activeTab === 'temoignages' && renderTemoignages()}
        {activeTab === 'offres' && renderOffres()}
      </div>

      {renderModal()}
    </div>
  );
};

export default Ski;