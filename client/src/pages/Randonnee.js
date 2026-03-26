import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Randonnee = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [photos, setPhotos] = useState([]);
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOffres, setLoadingOffres] = useState(true);
  const [error, setError] = useState('');

  // États réservation
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [step, setStep] = useState(1);
  const [prixTotal, setPrixTotal] = useState(0);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [animation, setAnimation] = useState('closed');
  const [reservationForm, setReservationForm] = useState({
    date: '', nbPersonnes: 1, niveau: 'débutant', guide: false,
    civilite: 'M.', nom: '', prenom: '', email: '', telephone: '',
    adresse: '', cp: '', ville: '', pays: 'France', notes: ''
  });

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000';

  useEffect(() => {
    const fetchOffres = async () => {
      try {
        setLoadingOffres(true);
        const response = await axios.get(`${API_BASE_URL}/api/randonnee/offres`);
        setOffres(response.data);
        setLoadingOffres(false);
      } catch (err) {
        console.error('Erreur chargement offres:', err);
        setLoadingOffres(false);
      }
    };
    if (activeTab === 'randonnees') fetchOffres();
  }, [activeTab]);

  useEffect(() => {
    if (showReservationModal) {
      setAnimation('opening');
      setTimeout(() => setAnimation('open'), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setAnimation('closing');
      setTimeout(() => setAnimation('closed'), 300);
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [showReservationModal]);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/galerie-randonnee`);
        setPhotos(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des photos');
        setLoading(false);
      }
    };
    if (activeTab === 'galerie') fetchPhotos();
  }, [activeTab]);

  useEffect(() => {
    if (selectedOffre) {
      let total = selectedOffre.prix * reservationForm.nbPersonnes;
      if (reservationForm.guide && !selectedOffre.guide_inclus) total += 50;
      setPrixTotal(total);
    }
  }, [reservationForm, selectedOffre]);

  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try { return JSON.parse(storedUser); } catch (e) { return null; }
  };

  const handleReserver = (offre) => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login', { state: { from: '/randonnee', message: 'Connectez-vous pour réserver cette randonnée' } });
      return;
    }
    setSelectedOffre(offre);
    setStep(1);
    setReservationForm({
      date: '', nbPersonnes: 1, niveau: 'débutant', guide: false,
      civilite: 'M.', nom: user.nom_utilisateur || user.username || '',
      prenom: '', email: user.email || '', telephone: '',
      adresse: '', cp: '', ville: '', pays: 'France', notes: ''
    });
    setShowReservationModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReservationForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) { alert('Vous devez être connecté'); navigate('/login'); return; }
    if (!reservationForm.date) { alert('Veuillez choisir une date'); return; }
    setReservationLoading(true);
    try {
      const notesData = {
        randonnee: selectedOffre.titre, lieu: selectedOffre.lieu,
        duree: selectedOffre.duree, difficulte: selectedOffre.difficulte,
        niveau: reservationForm.niveau,
        options: { guide: reservationForm.guide, guide_inclus: selectedOffre.guide_inclus },
        clientInfo: {
          civilite: reservationForm.civilite, nom: reservationForm.nom,
          prenom: reservationForm.prenom, email: reservationForm.email,
          telephone: reservationForm.telephone, adresse: reservationForm.adresse,
          cp: reservationForm.cp, ville: reservationForm.ville, pays: reservationForm.pays
        },
        prixTotal, notes: reservationForm.notes
      };
      const reservationData = {
        userId: user.id, activityId: selectedOffre.id,
        type_activite: 'randonnee', date: reservationForm.date,
        nbPersonnes: parseInt(reservationForm.nbPersonnes),
        notes: JSON.stringify(notesData)
      };
      const response = await axios.post(`${API_BASE_URL}/api/reservations`, reservationData);
      if (response.data.success || response.status === 201) {
        alert('✅ Randonnée réservée avec succès !');
        setShowReservationModal(false);
        setTimeout(() => navigate('/profil?tab=reservations'), 500);
      }
    } catch (error) {
      if (error.response) alert(`❌ Erreur: ${error.response.data.error || 'Erreur serveur'}`);
      else alert('❌ Erreur de connexion au serveur');
    } finally {
      setReservationLoading(false);
    }
  };

  const closeModal = () => {
    setShowReservationModal(false);
    setTimeout(() => setSelectedOffre(null), 300);
  };

  // ── Modal (copie exacte du style Ski.jsx) ──
  const inputStyle = {
    width: '100%', padding: '0.75rem', border: '1px solid #e5e5e5',
    borderRadius: '8px', fontSize: '1rem', outline: 'none'
  };

  const renderModal = () => {
    if (!showReservationModal || !selectedOffre) return null;
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
          <button onClick={closeModal} style={{
            position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px',
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            fontSize: '20px', cursor: 'pointer', color: '#fff', zIndex: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>✕</button>

          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url(${selectedOffre.image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            padding: '3rem 2rem', color: 'white', borderRadius: '24px 24px 0 0'
          }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[selectedOffre.lieu, selectedOffre.duree, selectedOffre.difficulte].filter(Boolean).map((v, i) => (
                <span key={i} style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.9rem', color: 'white' }}>{v}</span>
              ))}
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
              {step === 1 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>1. Choisissez vos options</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Date de la randonnée *</label>
                      <input type="date" name="date" value={reservationForm.date} onChange={handleFormChange} required style={inputStyle} min={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre de personnes *</label>
                      <input type="number" name="nbPersonnes" value={reservationForm.nbPersonnes} onChange={handleFormChange} min="1" max={selectedOffre.capacite_max} required style={inputStyle} />
                      <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>Maximum {selectedOffre.capacite_max} personnes</small>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Niveau</label>
                      <select name="niveau" value={reservationForm.niveau} onChange={handleFormChange} style={inputStyle}>
                        <option value="débutant">Débutant</option>
                        <option value="intermédiaire">Intermédiaire</option>
                        <option value="confirmé">Confirmé</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
                    {!selectedOffre.guide_inclus && (
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e5e5' }}>
                        <h4 style={{ marginBottom: '1rem' }}>Options supplémentaires :</h4>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input type="checkbox" name="guide" checked={reservationForm.guide} onChange={handleFormChange} style={{ width: '18px', height: '18px' }} />
                          <span>Guide accompagnateur (+50€)</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>2. Vos informations personnelles</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Civilité</label>
                      <select name="civilite" value={reservationForm.civilite} onChange={handleFormChange} style={inputStyle}>
                        <option value="M.">M.</option><option value="Mme">Mme</option><option value="Mlle">Mlle</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nom *</label><input type="text" name="nom" value={reservationForm.nom} onChange={handleFormChange} required style={inputStyle} placeholder="Votre nom" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Prénom *</label><input type="text" name="prenom" value={reservationForm.prenom} onChange={handleFormChange} required style={inputStyle} placeholder="Votre prénom" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email *</label><input type="email" name="email" value={reservationForm.email} onChange={handleFormChange} required style={inputStyle} /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Téléphone *</label><input type="tel" name="telephone" value={reservationForm.telephone} onChange={handleFormChange} required style={inputStyle} placeholder="06 12 34 56 78" /></div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>3. Votre adresse</h3>
                  <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Adresse *</label><input type="text" name="adresse" value={reservationForm.adresse} onChange={handleFormChange} required style={inputStyle} placeholder="Numéro et rue" /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Code postal *</label><input type="text" name="cp" value={reservationForm.cp} onChange={handleFormChange} required style={inputStyle} placeholder="75001" /></div>
                      <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Ville *</label><input type="text" name="ville" value={reservationForm.ville} onChange={handleFormChange} required style={inputStyle} placeholder="Paris" /></div>
                    </div>
                    <div><label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Pays</label><input type="text" name="pays" value={reservationForm.pays} onChange={handleFormChange} style={inputStyle} /></div>
                  </div>
                </div>
              )}

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
                        { label: 'Lieu', value: selectedOffre.lieu },
                        { label: 'Date', value: new Date(reservationForm.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) },
                        { label: 'Personnes', value: `${reservationForm.nbPersonnes} ${reservationForm.nbPersonnes > 1 ? 'personnes' : 'personne'}` },
                        { label: 'Client', value: `${reservationForm.civilite} ${reservationForm.prenom} ${reservationForm.nom}` }
                      ].map(item => (
                        <div key={item.label}>
                          <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.25rem' }}>{item.label}</span>
                          <span style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: '500' }}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                    {(reservationForm.guide || selectedOffre.guide_inclus) && (
                      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #f5f5f5' }}>
                        <span style={{ fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.75rem' }}>Options</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {selectedOffre.guide_inclus && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Guide inclus</span>}
                          {reservationForm.guide && !selectedOffre.guide_inclus && <span style={{ background: '#f5f5f5', padding: '0.5rem 1rem', borderRadius: '30px', fontSize: '0.85rem', color: '#333', border: '1px solid #e5e5e5' }}>Guide accompagnateur (+50€)</span>}
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

      {/* Hero — identique à Ski */}
      <div className="ski-hero">
        <h1>Randonnée en Montagne</h1>
        <p className="hero-description">
          Découvrez l'art de la randonnée en montagne : préparation, équipement,
          et les plus beaux sentiers avec nos guides diplômés.
        </p>
      </div>

      {/* Tabs — identiques à Ski */}
      <div className="ski-tabs">
        {[
          { id: 'info',       label: 'Informations' },
          { id: 'randonnees', label: 'Randonnées' },
          { id: 'carte',      label: 'Carte Interactive' },
          { id: 'galerie',    label: 'Galerie Photos' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`ski-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-text">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ski-content">

        {/* ── INFORMATIONS ── */}
        {activeTab === 'info' && (
          <div className="disciplines-section">
            <h2 className="section-title">Informations sur la Randonnée</h2>
            <p className="section-description">
              Tout ce qu'il faut savoir avant de partir : niveaux, équipement et meilleures saisons.
            </p>
            <div className="disciplines-grid">
              {[
                { icon: '', titre: 'Niveaux de Difficulté', description: 'Choisissez un itinéraire adapté à votre condition physique et votre expérience.', infos: [['Facile', 'Sentiers bien marqués, dénivelé modéré'], ['Moyen', 'Dénivelé important, bonne condition physique'], ['Difficile', 'Dénivelé conséquent, expérience requise'], ['Très Difficile', 'Technicité élevée, experts seulement']] },
                { icon: '', titre: 'Équipement Recommandé', description: 'Un bon équipement est indispensable pour randonner en toute sécurité.', infos: [['Chaussures', 'Randonnée imperméables, semelle Vibram'], ['Vêtements', 'Système 3 couches technique'], ['Sac à dos', '30-50L avec protection pluie'], ['Sécurité', 'Trousse premiers secours, carte topo, frontale']] },
                { icon: '', titre: 'Meilleures Saisons', description: 'Chaque saison offre une expérience différente en montagne.', infos: [['Printemps', 'Fleurs, peu de monde, sentiers parfois boueux'], ['Été', 'Conditions optimales, refuges ouverts'], ['Automne', 'Couleurs magnifiques, air limpide'], ['Hiver', 'Raquettes, paysages enneigés (équipement spécial)']] },
                { icon: '', titre: 'Préparation & Sécurité', description: 'La sécurité commence avant le départ.', infos: [['Météo', 'Consulter les prévisions locales la veille'], ['Itinéraire', 'Informer un proche de votre parcours'], ['Autonomie', 'Eau, nourriture pour + de temps que prévu'], ['Solo', 'Éviter de partir seul sur terrain difficile']] },
                { icon: '', titre: 'Massifs Incontournables', description: 'Les plus beaux terrains de randonnée en France.', infos: [['Alpes', 'Mont Blanc, Écrins, Vanoise'], ['Pyrénées', 'GR10, Vignemale, Gavarnie'], ['Corse', 'GR20, Monte Cinto'], ['Vosges', "Ballon d'Alsace, Hohneck"]] },
                { icon: '', titre: 'Éco-responsabilité', description: 'Respecter la montagne pour la préserver.', infos: [['Déchets', 'Emporter tous ses déchets'], ['Flore', 'Ne pas cueillir les plantes protégées'], ['Faune', 'Observer sans déranger les animaux'], ['Sentiers', 'Rester sur les chemins balisés']] },
              ].map((d, i) => (
                <div key={i} className="discipline-card">
                  <div className="discipline-icon">{d.icon}</div>
                  <h3>{d.titre}</h3>
                  <p>{d.description}</p>
                  {d.infos.map(([label, val], j) => (
                    <div key={j} className="discipline-info">
                      <span className="info-label">{label} :</span>
                      <span className="info-value">{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RANDONNÉES ── */}
        {activeTab === 'randonnees' && (
          <div className="offres-section">
            <div className="section-header">
              <h2 className="section-title">Nos Randonnées Accompagnées</h2>
              <p className="section-description">
                Réservez votre randonnée avec nos guides professionnels. Tous nos itinéraires
                sont encadrés par des accompagnateurs en montagne diplômés.
              </p>
            </div>
            {loadingOffres ? (
              <div className="loading">Chargement des randonnées...</div>
            ) : offres.length === 0 ? (
              <div className="no-data">Aucune randonnée disponible pour le moment.</div>
            ) : (
              <div className="offres-grid">
                {offres.map(offre => (
                  <div key={offre.id} className="offre-card">
                    <div className="offre-image">
                      <img
                        src={offre.image_url}
                        alt={offre.titre}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop'; }}
                      />
                      <div className="promo-badge">{offre.difficulte}</div>
                      {offre.guide_inclus && (
                        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', padding: '0.5rem 1rem', background: 'var(--white)', border: '1px solid var(--ink)', color: 'var(--ink)', fontSize: '0.75rem', fontWeight: '400', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          Guide inclus
                        </div>
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
                          <span className="price-value">{parseFloat(offre.prix).toFixed(2)}€ / pers.</span>

                        </div>                          {offre.type_sport && (
  <div className="offre-type">
    <span className="type-label">Type Sport :</span>
    <span className="type-value">{offre.type_sport}</span>
  </div>
)}
                        <div className="offre-type">
                          <span className="type-label">Durée :</span>
                          <span className="type-value">{offre.duree}</span>
                        </div>
                        <div className="offre-dates">
                          <span className="dates-label">Capacité :</span>
                          <span className="dates-value">Max {offre.capacite_max} personnes</span>
                        </div>
                      </div>
                      <button onClick={() => handleReserver(offre)} className="reservation-button">
                        Réserver maintenant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CARTE ── */}
        {activeTab === 'carte' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Carte Interactive</h2>
              <p className="section-description">Explorez les sentiers de randonnée les plus populaires à travers les massifs français.</p>
            </div>
            <div className="safety-notice" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div className="notice-icon">🗺️</div>
              <div className="notice-content">
                <h4>Sentiers de Randonnée</h4>
                <p>Cliquez sur un massif pour découvrir les itinéraires disponibles.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  {['Mont Blanc', 'GR20 Corse', 'Pyrénées', 'Alpes du Sud', 'Vosges', 'Massif Central'].map((loc, i) => (
                    <span key={i} className="station-type" style={{ cursor: 'pointer' }}>🏔️ {loc}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── GALERIE ── */}
        {activeTab === 'galerie' && (
          <div>
            <div className="section-header">
              <h2 className="section-title">Galerie de Randonnées</h2>
              <p className="section-description">Découvrez les photos partagées par notre communauté de randonneurs.</p>
            </div>
            {loading ? (
              <div className="loading">Chargement des photos...</div>
            ) : error ? (
              <div className="no-data" style={{ color: '#c0392b' }}>{error}</div>
            ) : photos.length === 0 ? (
              <div className="no-data">Aucune photo disponible pour le moment.</div>
            ) : (
              <div className="offres-grid">
                {photos.map(photo => (
                  <div key={photo.id} className="offre-card">
                    <div className="offre-image">
                      <img
                        src={photo.image_url}
                        alt={photo.titre}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&auto=format&fit=crop'; }}
                      />
                      {photo.difficulte && <div className="promo-badge">{photo.difficulte}</div>}
                    </div>
                    <div className="offre-content">
                      <div className="offre-header">
                        <h3>{photo.titre}</h3>
                        {photo.localisation && <span className="offre-station">{photo.localisation}</span>}
                      </div>
                      {photo.description && <p className="offre-description">"{photo.description}"</p>}
                      <div className="offre-details">
                        {photo.altitude && (
                          <div className="offre-price">
                            <span className="price-label">Altitude :</span>
                            <span className="price-value">{photo.altitude}m</span>
                          </div>
                        )}
                        <div className="offre-type">
                          <span className="type-label">Likes :</span>
                          <span className="type-value">❤️ {photo.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notice sécurité */}
        <div className="safety-notice" style={{ marginTop: '3rem' }}>
          <div className="notice-icon">⚠️</div>
          <div className="notice-content">
            <h4>Sécurité en Montagne</h4>
            <p>
              La randonnée en montagne comporte des risques. Consultez toujours les conditions météo,
              informez quelqu'un de votre itinéraire, et ne partez jamais seul sans équipement adapté.
            </p>
          </div>
        </div>

      </div>

      {renderModal()}
    </div>
  );
};

export default Randonnee;