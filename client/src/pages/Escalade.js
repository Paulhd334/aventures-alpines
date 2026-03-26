// src/pages/Escalade.js - Adapté aux colonnes réelles de la BDD
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Escalade = () => {
  const [activeTab, setActiveTab] = useState('intro');
  const [sites, setSites] = useState([]);
  const [temoignages, setTemoignages] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtreRegion, setFiltreRegion] = useState('tous');
  const [filtreDifficulte, setFiltreDifficulte] = useState('tous');

  // États pour la réservation
  const [showReservation, setShowReservation] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [step, setStep] = useState(1);
  const [prixTotal, setPrixTotal] = useState(0);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [animation, setAnimation] = useState('closed');
  const [reservationForm, setReservationForm] = useState({
    date: '', nbPersonnes: 1, niveau: 'débutant', civilite: 'M.',
    nom: '', prenom: '', email: '', telephone: '',
    adresse: '', cp: '', ville: '', pays: 'France', notes: ''
  });

  const [nouveauTemoignage, setNouveauTemoignage] = useState({
    nom: '', email: '', type_escalade: '', site_id: '', message: '', note: 5
  });
  const [messageSuccess, setMessageSuccess] = useState('');
  const navigate = useNavigate();

  // ✅ Fallback SVG inline — ne dépend d'aucun serveur externe
  const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='500' viewBox='0 0 800 500'%3E%3Crect width='800' height='500' fill='%23e8e8e8'/%3E%3Cpolygon points='0,500 200,200 400,350 550,150 800,500' fill='%23c0c0c0'/%3E%3Cpolygon points='400,500 600,250 800,400 800,500' fill='%23d0d0d0'/%3E%3Ccircle cx='150' cy='100' r='60' fill='%23d8d8d8'/%3E%3Ctext x='400' y='470' text-anchor='middle' font-family='Arial' font-size='18' fill='%23888'%3ESite d'escalade%3C/text%3E%3C/svg%3E";

  // ✅ Empêche la boucle infinie sur erreur d'image
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = FALLBACK_IMAGE;
  };

  // Couleur selon difficulté escalade
  const getDifficulteColor = (difficulte) => {
    if (!difficulte) return '#888';
    const d = difficulte.toUpperCase();
    if (d.includes('TD') || d.includes('ED') || d.match(/[789]/)) return '#e74c3c';
    if (d.includes('D') || d.match(/6/)) return '#e67e22';
    if (d.includes('AD') || d.match(/5/)) return '#f1c40f';
    return '#27ae60';
  };

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
          // ✅ Utilise les offres de randonnée (même structure BDD)
          const response = await axios.get('http://localhost:5000/api/randonnee/offres');
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

  useEffect(() => {
    if (selectedOffre) setPrixTotal(selectedOffre.prix * reservationForm.nbPersonnes);
  }, [reservationForm.nbPersonnes, selectedOffre]);

  const handleReservation = (offre) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login', { state: { from: '/escalade', offre, message: 'Connectez-vous pour réserver cette offre' } });
    } else {
      setSelectedOffre(offre);
      setStep(1);
      const userData = JSON.parse(user);
      setReservationForm({
        date: '', nbPersonnes: 1, niveau: 'débutant', civilite: 'M.',
        nom: userData.nom_utilisateur || userData.username || '',
        prenom: '', email: userData.email || '',
        telephone: '', adresse: '', cp: '', ville: '', pays: 'France', notes: ''
      });
      setShowReservation(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    const user = localStorage.getItem('user');
    if (!user) { alert('Vous devez être connecté'); navigate('/login'); return; }
    if (!reservationForm.date) { alert('Veuillez choisir une date'); return; }
    setReservationLoading(true);
    const userData = JSON.parse(user);
    try {
      const notesData = {
        activite: selectedOffre.titre, lieu: selectedOffre.lieu,
        duree: selectedOffre.duree, difficulte: selectedOffre.difficulte,
        niveau: reservationForm.niveau,
        clientInfo: {
          civilite: reservationForm.civilite, nom: reservationForm.nom, prenom: reservationForm.prenom,
          email: reservationForm.email, telephone: reservationForm.telephone,
          adresse: reservationForm.adresse, cp: reservationForm.cp, ville: reservationForm.ville, pays: reservationForm.pays
        },
        prixTotal, notes: reservationForm.notes
      };
      const response = await axios.post('http://localhost:5000/api/reservations', {
        userId: userData.id, activityId: selectedOffre.id, type_activite: 'escalade',
        date: reservationForm.date, nbPersonnes: parseInt(reservationForm.nbPersonnes),
        notes: JSON.stringify(notesData)
      });
      if (response.data.success || response.status === 201) {
        alert('✅ Session escalade réservée avec succès !');
        setShowReservation(false);
        setTimeout(() => navigate('/profil?tab=escalade'), 500);
      }
    } catch (error) {
      console.error('❌ Erreur réservation:', error);
      alert(error.response ? `❌ Erreur: ${error.response.data.error || 'Erreur serveur'}` : '❌ Erreur de connexion');
    } finally {
      setReservationLoading(false);
    }
  };

  const closeModal = () => { setShowReservation(false); setTimeout(() => setSelectedOffre(null), 300); };

  const handleSubmitTemoignage = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/escalade/temoignages', nouveauTemoignage);
      setMessageSuccess('Merci pour votre témoignage ! Il sera publié après modération.');
      setNouveauTemoignage({ nom: '', email: '', type_escalade: '', site_id: '', message: '', note: 5 });
      const response = await axios.get('http://localhost:5000/api/escalade/temoignages');
      setTemoignages(response.data);
      setTimeout(() => setMessageSuccess(''), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      alert("Erreur lors de l'envoi du témoignage");
    }
  };

  // ✅ Filtres adaptés aux vraies colonnes BDD : region, difficulte
  const sitesFiltres = sites.filter(site => {
    if (filtreRegion !== 'tous' && site.region !== filtreRegion) return false;
    if (filtreDifficulte !== 'tous' && site.difficulte !== filtreDifficulte) return false;
    return true;
  });

  const regions = [...new Set(sites.map(s => s.region).filter(Boolean))];
  const difficultes = [...new Set(sites.map(s => s.difficulte).filter(Boolean))];

  const overlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: animation === 'closed' ? 'transparent' : 'rgba(0,0,0,0.7)',
    backdropFilter: animation === 'open' ? 'blur(8px)' : 'blur(0px)',
    zIndex: 1000, display: animation === 'closed' ? 'none' : 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)', opacity: animation === 'open' ? 1 : 0
  };

  const modalStyle = {
    backgroundColor: 'white', borderRadius: '24px', width: '90%', maxWidth: '900px',
    maxHeight: '90vh', overflow: 'auto', boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
    transform: animation === 'open' ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
    opacity: animation === 'open' ? 1 : 0,
    transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative'
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5',
    borderRadius: '8px', fontSize: '1rem', transition: 'all 0.3s ease', outline: 'none'
  };

  // ─── INTRO ─────────────────────────────────────────────────────────────
  const renderIntro = () => (
    <div className="intro-section">
      <h2 className="section-title">L'Escalade en Montagne</h2>
      <p className="section-description">
        Découvrez l'art vertical de l'escalade, des premiers pas en falaise aux grandes voies alpines.
      </p>
      <div className="disciplines-grid">
        {[
          { titre: 'Escalade Sportive', description: "Voies équipées avec points d'ancrage permanents. Idéal pour progresser en sécurité.", niveau: 'Tous niveaux', equipement: 'Cordes, dégaines, chaussons',
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20 L8 16 L12 20 L16 16 L20 20"/><path d="M8 12 L12 8 L16 12"/><circle cx="12" cy="12" r="2"/><path d="M12 22 L12 14"/></svg> },
          { titre: 'Bloc', description: 'Escalade de courte hauteur sans corde sur des blocs de rocher. Parfait pour la technique.', niveau: 'Débutant à Expert', equipement: 'Crash pads, chaussons, magnésie',
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg> },
          { titre: 'Grande Voie', description: "Ascensions de plusieurs longueurs sur des parois imposantes. L'aventure pure.", niveau: 'Confirmé à Expert', equipement: 'Cordes, dégaines, friends, coinceurs',
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20 L6 12 L10 20 L14 12 L18 20"/><path d="M2 8 L6 2 L10 8 L14 2 L18 8"/></svg> },
          { titre: 'Via Ferrata', description: 'Parcours sécurisé avec câbles et échelles. Accessible à tous.', niveau: 'Débutant à Intermédiaire', equipement: 'Baudrier, longes, casque',
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M12 2 L12 7"/><path d="M12 17 L12 22"/><path d="M2 12 L7 12"/><path d="M17 12 L22 12"/><circle cx="12" cy="12" r="8" strokeWidth="1"/></svg> },
          { titre: 'Escalade Traditionnelle', description: 'Placement de protections amovibles. La voie est libre.', niveau: 'Expert', equipement: 'Friends, coinceurs, cordes',
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20 L12 15 L17 20"/><path d="M12 15 L12 4"/><path d="M8 8 L16 8"/><path d="M10 12 L14 12"/></svg> },
          { titre: 'Escalade Glaciaire', description: 'Ascension de cascades de glace. Sensations extrêmes garanties.', niveau: 'Expert', equipement: 'Piolets, crampons, vis à glace',
            icon: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 L12 6"/><path d="M12 18 L12 22"/><path d="M4 8 L20 8"/><path d="M4 16 L20 16"/><path d="M2 12 L22 12"/><circle cx="12" cy="12" r="4"/></svg> }
        ].map((item, index) => (
          <div key={index} className="discipline-card" style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '16px', padding: '24px', transition: 'all 0.3s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 30px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center', color: '#333' }}>{item.icon}</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '0.75rem', color: '#000', textAlign: 'center' }}>{item.titre}</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem', textAlign: 'center' }}>{item.description}</p>
            <div style={{ marginBottom: '0.5rem', padding: '0.5rem', background: '#f8f8f8', borderRadius: '8px' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Niveau :</span>
              <span style={{ color: '#666', marginLeft: '0.5rem' }}>{item.niveau}</span>
            </div>
            <div style={{ padding: '0.5rem', background: '#f8f8f8', borderRadius: '8px' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Équipement :</span>
              <span style={{ color: '#666', marginLeft: '0.5rem' }}>{item.equipement}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── SITES ─────────────────────────────────────────────────────────────
  // ✅ Colonnes réelles : id, nom, lieu, region, difficulte, image_url, created_at
  const renderSites = () => (
    <div className="sites-section">
      <div className="section-header">
        <h2 className="section-title">Sites d'Escalade</h2>
        <p className="section-description">Découvrez les plus beaux sites d'escalade, des falaises aux blocs mythiques</p>
      </div>

      <div className="filtres-container">
        <div className="filtre-group">
          <label htmlFor="region-filtre">Région :</label>
          <select id="region-filtre" value={filtreRegion} onChange={(e) => setFiltreRegion(e.target.value)}>
            <option key="tous-regions" value="tous">Toutes les régions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="filtre-group">
          <label htmlFor="diff-filtre">Difficulté :</label>
          <select id="diff-filtre" value={filtreDifficulte} onChange={(e) => setFiltreDifficulte(e.target.value)}>
            <option key="tous-diff" value="tous">Toutes</option>
            {difficultes.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Chargement des sites...</div>
      ) : sitesFiltres.length === 0 ? (
        <div className="no-data">Aucun site trouvé pour ces filtres.</div>
      ) : (
        <>
          <div className="stations-stats">
            <div className="stat-card">
              <span className="stat-number">{sitesFiltres.length}</span>
              <span className="stat-label">Sites</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{regions.length}</span>
              <span className="stat-label">Régions</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{difficultes.length}</span>
              <span className="stat-label">Niveaux</span>
            </div>
          </div>

          <div className="stations-grid">
            {sitesFiltres.map(site => (
              <div key={site.id} className="station-card">
                <div className="station-image">
                  {/* ✅ image_url = colonne réelle de sites_escalade */}
                  <img src={site.image_url || FALLBACK_IMAGE} alt={site.nom} onError={handleImageError} />
                  {site.difficulte && (
                    <div className="enneigement-badge" style={{ background: getDifficulteColor(site.difficulte), color: 'white' }}>
                      {site.difficulte}
                    </div>
                  )}
                </div>
                <div className="station-content">
                  <div className="station-header">
                    <h3>{site.nom}</h3>
                    {site.lieu && <span className="station-type">{site.lieu}</span>}
                  </div>
                  <div className="station-details">
                    {site.region && (
                      <div className="detail-item">
                        <span className="detail-label">Région</span>
                        <span className="detail-value">{site.region}</span>
                      </div>
                    )}
                    {site.lieu && (
                      <div className="detail-item">
                        <span className="detail-label">Commune</span>
                        <span className="detail-value">{site.lieu}</span>
                      </div>
                    )}
                    {site.difficulte && (
                      <div className="detail-item">
                        <span className="detail-label">Difficulté</span>
                        <span className="detail-value" style={{ color: getDifficulteColor(site.difficulte), fontWeight: '600' }}>
                          {site.difficulte}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  // ─── TÉMOIGNAGES ───────────────────────────────────────────────────────
  const renderTemoignages = () => (
    <div className="temoignages-section">
      <div className="section-header">
        <h2 className="section-title">Témoignages de Grimpeurs Passionnés</h2>
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
                <label>Type d'escalade</label>
                <select value={nouveauTemoignage.type_escalade} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, type_escalade: e.target.value})}>
                  <option key="choisir" value="">Choisir...</option>
                  <option key="sportive" value="sportive">Escalade sportive</option>
                  <option key="bloc" value="bloc">Bloc</option>
                  <option key="grande-voie" value="grande voie">Grande voie</option>
                  <option key="via-ferrata" value="via ferrata">Via ferrata</option>
                  <option key="trad" value="trad">Escalade trad</option>
                </select>
              </div>
              <div className="form-group">
                <label>Note (1-5)</label>
                <select value={nouveauTemoignage.note} onChange={(e) => setNouveauTemoignage({...nouveauTemoignage, note: parseInt(e.target.value)})}>
                  {[1,2,3,4,5].map(num => <option key={num} value={num}>{num} ⭐</option>)}
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
                      {t.type_escalade && <span className="ski-type">{t.type_escalade}</span>}
                    </div>
                    <div className="temoignage-rating">{'⭐'.repeat(t.note || 0)}</div>
                  </div>
                  <p className="temoignage-message">"{t.message}"</p>
                  <div className="temoignage-footer">
                    {t.site_nom && <span className="station-name">{t.site_nom}</span>}
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

  // ─── OFFRES ────────────────────────────────────────────────────────────
  // ✅ Colonnes réelles offres_randonnee : titre, description, lieu, difficulte, duree, prix, guide_inclus, image_url
  const renderOffres = () => {
    if (loading) return (
      <div className="offres-section">
        <div className="section-header"><h2 className="section-title">Offres d'Escalade</h2></div>
        <div className="loading">Chargement des offres...</div>
      </div>
    );
    if (offres.length === 0) return (
      <div className="offres-section">
        <div className="section-header"><h2 className="section-title">Offres d'Escalade</h2></div>
        <div className="no-data">Aucune offre disponible pour le moment</div>
      </div>
    );
    return (
      <div className="offres-section">
        <div className="section-header">
          <h2 className="section-title">Offres d'Escalade</h2>
          <p className="section-description">Sessions encadrées par des moniteurs diplômés</p>
        </div>
        <div className="offres-grid">
          {offres.map(offre => (
            <div key={offre.id} className="offre-card">
              <div className="offre-image">
                {/* ✅ image_url = colonne réelle BDD */}
                <img src={offre.image_url || FALLBACK_IMAGE} alt={offre.titre} onError={handleImageError} />
                {offre.guide_inclus === 1 && <div className="promo-badge">Guide inclus</div>}
              </div>
              <div className="offre-content">
                <div className="offre-header">
                  <h3>{offre.titre}</h3>
                  <span className="offre-station">{offre.lieu}</span>
                </div>
                <p className="offre-description">{offre.description}</p>
                <div className="offre-details">
                  <div className="offre-price"><span className="price-label">Prix :</span><span className="price-value">{offre.prix}€</span></div>
                  {/* ── AJOUTE ICI ── */}
{offre.type_sport && (
  <div className="offre-type"><span className="type-label">Type Sport :</span><span className="type-value">{offre.type_sport}</span></div>
)}


                  <div className="offre-type"><span className="type-label">Difficulté :</span><span className="type-value">{offre.difficulte}</span></div>
                  <div className="offre-dates"><span className="dates-label">Durée :</span><span className="dates-value">{offre.duree}</span></div>
                  {offre.capacite_max && <div className="offre-dates"><span className="dates-label">Capacité :</span><span className="dates-value">{offre.capacite_max} pers.</span></div>}
                </div>
                <button onClick={() => handleReservation(offre)} className="reservation-button">Réserver maintenant</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ─── MODAL ─────────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!showReservation || !selectedOffre) return null;
    return (
      <div style={overlayStyle} onClick={closeModal}>
        <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
          <button onClick={closeModal} style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: 'none', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', color: '#fff', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>

          <div style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${selectedOffre.image_url || FALLBACK_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '3rem 2rem', color: 'white', borderRadius: '24px 24px 0 0' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[selectedOffre.lieu, selectedOffre.duree, selectedOffre.difficulte].filter(Boolean).map((tag, i) => (
                <span key={i} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.9rem', backdropFilter: 'blur(5px)', fontWeight: '500', color: 'white' }}>{tag}</span>
              ))}
            </div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '700', color: 'white' }}>{selectedOffre.titre}</h2>
            <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', color: 'white' }}>{selectedOffre.description}</p>
          </div>

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
              {step === 1 && (
                <div style={{ animation: 'slideIn 0.3s ease' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>1. Choisissez vos options</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Date de la session *</label>
                      <input type="date" name="date" value={reservationForm.date} onChange={handleFormChange} required style={inputStyle} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Nombre de personnes *</label>
                      <input type="number" name="nbPersonnes" value={reservationForm.nbPersonnes} onChange={handleFormChange} min="1" max={selectedOffre.capacite_max || 10} required style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Niveau</label>
                      <select name="niveau" value={reservationForm.niveau} onChange={handleFormChange} style={inputStyle}>
                        <option key="debutant" value="débutant">Débutant</option>
                        <option key="intermediaire" value="intermédiaire">Intermédiaire</option>
                        <option key="confirme" value="confirmé">Confirmé</option>
                        <option key="expert" value="expert">Expert</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div style={{ animation: 'slideIn 0.3s ease' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>2. Vos informations personnelles</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Civilité</label>
                      <select name="civilite" value={reservationForm.civilite} onChange={handleFormChange} style={inputStyle}>
                        <option key="m" value="M.">M.</option>
                        <option key="mme" value="Mme">Mme</option>
                        <option key="mlle" value="Mlle">Mlle</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Nom *</label><input type="text" name="nom" value={reservationForm.nom} onChange={handleFormChange} required style={inputStyle} placeholder="Votre nom" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Prénom *</label><input type="text" name="prenom" value={reservationForm.prenom} onChange={handleFormChange} required style={inputStyle} placeholder="Votre prénom" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Email *</label><input type="email" name="email" value={reservationForm.email} onChange={handleFormChange} required style={inputStyle} placeholder="exemple@email.com" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Téléphone *</label><input type="tel" name="telephone" value={reservationForm.telephone} onChange={handleFormChange} required style={inputStyle} placeholder="06 12 34 56 78" /></div>
                    </div>
                  </div>
                </div>
              )}
              {step === 3 && (
                <div style={{ animation: 'slideIn 0.3s ease' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>3. Votre adresse</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Adresse *</label><input type="text" name="adresse" value={reservationForm.adresse} onChange={handleFormChange} required style={inputStyle} placeholder="Numéro et rue" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Code postal *</label><input type="text" name="cp" value={reservationForm.cp} onChange={handleFormChange} required style={inputStyle} placeholder="75001" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Ville *</label><input type="text" name="ville" value={reservationForm.ville} onChange={handleFormChange} required style={inputStyle} placeholder="Paris" /></div>
                    </div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Pays</label><input type="text" name="pays" value={reservationForm.pays} onChange={handleFormChange} style={inputStyle} /></div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Notes / Demandes spéciales</label><textarea name="notes" value={reservationForm.notes} onChange={handleFormChange} rows="3" style={{ ...inputStyle, resize: 'vertical' }} placeholder="Besoins spécifiques..." /></div>
                  </div>
                </div>
              )}
              {step === 4 && (
                <div style={{ animation: 'slideIn 0.3s ease' }}>
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
                        { label: 'Lieu', value: selectedOffre.lieu },
                        { label: 'Date', value: reservationForm.date ? new Date(reservationForm.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) : '' },
                        { label: 'Personnes', value: `${reservationForm.nbPersonnes} ${reservationForm.nbPersonnes > 1 ? 'personnes' : 'personne'}` },
                        { label: 'Client', value: `${reservationForm.civilite} ${reservationForm.prenom} ${reservationForm.nom}` }
                      ].map(item => (
                        <div key={item.label}>
                          <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                          <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f5f5f5' }}>
                      <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.75rem' }}>Niveau choisi</span>
                      <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>{reservationForm.niveau}</span>
                    </div>
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
                  <button type="button" onClick={() => setStep(s => s - 1)} style={{ padding: '1rem 2rem', border: '2px solid #000', background: 'white', color: '#000', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500' }}
                    onMouseEnter={(e) => { e.target.style.background = '#000'; e.target.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.color = '#000'; }}>
                    ← Étape précédente
                  </button>
                )}
                {step < 4 ? (
                  <button type="button" onClick={() => setStep(s => s + 1)} style={{ padding: '1rem 2rem', border: 'none', background: '#000', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '1rem', fontWeight: '500', marginLeft: 'auto' }}
                    onMouseEnter={(e) => { e.target.style.background = '#333'; }}
                    onMouseLeave={(e) => { e.target.style.background = '#000'; }}>
                    Étape suivante →
                  </button>
                ) : (
                  <button type="submit" disabled={reservationLoading} style={{ padding: '1rem 2rem', border: 'none', background: reservationLoading ? '#999' : '#000', color: 'white', borderRadius: '12px', cursor: reservationLoading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: '500', marginLeft: 'auto', opacity: reservationLoading ? 0.7 : 1 }}
                    onMouseEnter={(e) => { if (!reservationLoading) e.target.style.background = '#333'; }}
                    onMouseLeave={(e) => { if (!reservationLoading) e.target.style.background = '#000'; }}>
                    {reservationLoading ? 'Réservation...' : 'Confirmer la réservation'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER PRINCIPAL ──────────────────────────────────────────────────
  return (
    <div className="ski-page">
      <div className="ski-hero">
        <h1>L'Escalade en Montagne</h1>
        <p className="hero-description">
          Découvrez les différentes disciplines, explorez les plus beaux sites
          et trouvez les meilleures offres pour vos sessions d'escalade.
        </p>
      </div>

      <div className="ski-tabs">
        {[
          { id: 'intro', label: 'Introduction' },
          { id: 'sites', label: 'Sites' },
          { id: 'temoignages', label: 'Témoignages' },
          { id: 'offres', label: 'Offres' }
        ].map(tab => (
          <button key={tab.id} className={`ski-tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span className="tab-text">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ski-content">
        {activeTab === 'intro' && renderIntro()}
        {activeTab === 'sites' && renderSites()}
        {activeTab === 'temoignages' && renderTemoignages()}
        {activeTab === 'offres' && renderOffres()}
      </div>

      {renderModal()}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Escalade;