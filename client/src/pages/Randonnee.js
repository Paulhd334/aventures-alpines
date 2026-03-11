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
  
  // États pour la réservation
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [step, setStep] = useState(1);
  const [prixTotal, setPrixTotal] = useState(0);
  const [reservationForm, setReservationForm] = useState({
    // Étape 1 - Options
    date: '',
    nbPersonnes: 1,
    niveau: 'débutant',
    guide: false,
    
    // Étape 2 - Informations personnelles
    civilite: 'M.',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    
    // Étape 3 - Adresse
    adresse: '',
    cp: '',
    ville: '',
    pays: 'France',
    
    // Étape 4 - Notes
    notes: ''
  });
  const [reservationLoading, setReservationLoading] = useState(false);
  const [animation, setAnimation] = useState('closed');

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000';

  // Charger les offres de randonnée depuis la BDD
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

    if (activeTab === 'randonnees') {
      fetchOffres();
    }
  }, [activeTab]);

  // Animation d'ouverture/fermeture du modal
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
    
    return () => {
      document.body.style.overflow = 'auto';
    };
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
        console.error('Erreur:', err);
      }
    };

    if (activeTab === 'galerie') {
      fetchPhotos();
    }
  }, [activeTab]);

  // Calculer le prix total
  useEffect(() => {
    if (selectedOffre) {
      let total = selectedOffre.prix * reservationForm.nbPersonnes;
      if (reservationForm.guide && !selectedOffre.guide_inclus) total += 50;
      setPrixTotal(total);
    }
  }, [reservationForm, selectedOffre]);

  // Récupérer l'utilisateur connecté
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (e) {
      return null;
    }
  };

  // Ouvrir le modal de réservation
  const handleReserver = (offre) => {
    const user = getCurrentUser();
    
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/randonnee',
          message: 'Connectez-vous pour réserver cette randonnée'
        }
      });
      return;
    }

    setSelectedOffre(offre);
    setStep(1);
    setReservationForm({
      date: '',
      nbPersonnes: 1,
      niveau: 'débutant',
      guide: false,
      civilite: 'M.',
      nom: user.nom_utilisateur || user.username || '',
      prenom: '',
      email: user.email || '',
      telephone: '',
      adresse: '',
      cp: '',
      ville: '',
      pays: 'France',
      notes: ''
    });
    setShowReservationModal(true);
  };

  // Gérer les changements du formulaire
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setReservationForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  // Soumettre la réservation
  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
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

    try {
      const notesData = {
        randonnee: selectedOffre.titre,
        lieu: selectedOffre.lieu,
        duree: selectedOffre.duree,
        difficulte: selectedOffre.difficulte,
        niveau: reservationForm.niveau,
        options: {
          guide: reservationForm.guide,
          guide_inclus: selectedOffre.guide_inclus
        },
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
        userId: user.id,
        activityId: selectedOffre.id,
          type_activite: 'randonnee',  // ← AJOUTER CE CHAMP POUR IDENTIFIER LE TYPE D'ACTIVITÉ
        date: reservationForm.date,
        nbPersonnes: parseInt(reservationForm.nbPersonnes),
        notes: JSON.stringify(notesData)
      };

      console.log('📤 Envoi réservation randonnée:', reservationData);

      const response = await axios.post(`${API_BASE_URL}/api/reservations`, reservationData);

      if (response.data.success || response.status === 201) {
        alert('✅ Randonnée réservée avec succès !');
        setShowReservationModal(false);
        setTimeout(() => {
          navigate('/profil?tab=reservations');
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

  // Fermer le modal
  const closeModal = () => {
    setShowReservationModal(false);
    setSelectedOffre(null);
  };

  // Styles pour le modal
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

  return (
    <div className="randonnee-page">
      {/* Hero */}
      <div className="randonnee-hero">
        <h1>Randonnée en Montagne</h1>
        <p>Découvrez l'art de la randonnée en montagne : préparation, équipement, et les plus beaux sentiers.</p>
      </div>

      {/* Tabs */}
      <div className="randonnee-tabs">
        {['info', 'randonnees', 'carte', 'galerie'].map((tab) => (
          <button
            key={tab}
            className={`randonnee-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'info' && 'Informations'}
            {tab === 'randonnees' && 'Randonnées'}
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
                <h3>Niveaux de Difficulté</h3>
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

        {activeTab === 'randonnees' && (
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 300, marginBottom: '2rem' }}>
              Nos randonnées accompagnées
            </h2>
            <p style={{ color: '#666', marginBottom: '2rem', maxWidth: '800px' }}>
              Réservez votre randonnée avec nos guides professionnels. Tous nos itinéraires sont encadrés 
              par des accompagnateurs en montagne diplômés.
            </p>

            {loadingOffres ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Chargement des randonnées...</p>
              </div>
            ) : (
              <div className="randonnees-grid">
                {offres.map(offre => (
                  <div key={offre.id} className="rando-card">
                    <div className="rando-image">
                      <img src={offre.image_url} alt={offre.titre} />
                      <div className="rando-badge">{offre.difficulte}</div>
                      {offre.guide_inclus && (
                        <div className="rando-badge-guide">Guide inclus</div>
                      )}
                    </div>
                    <div className="rando-content">
                      <h3>{offre.titre}</h3>
                      <p className="rando-description">{offre.description}</p>
                      
                      <div className="rando-details">
                        <div><span>📍</span> {offre.lieu}</div>
                        <div><span>⏱️</span> {offre.duree}</div>
                        <div><span>👥</span> Max {offre.capacite_max} pers.</div>
                      </div>

                      <div className="rando-footer">
                        <div className="rando-price">{offre.prix}€ / pers.</div>
                        <button 
                          className="rando-reserver"
                          onClick={() => handleReserver(offre)}
                        >
                          Réserver
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                        onError={(e) => {
                          e.target.src = 'https://www.montagnes-magazine.com/media/Pedago/conseil/pe%CC%81dago%20tout%20savoir%20rando.jpg';
                        }}
                      />
                    </div>
                    <div className="gallery-info">
                      <h3>{photo.titre}</h3>
                      <div className="gallery-location">
                        📍 {photo.localisation || 'Non spécifié'}
                        {photo.altitude && ` • ${photo.altitude}m`}
                      </div>
                      <div className="gallery-meta">
                        <span>🎯 {photo.difficulte || 'Non spécifié'}</span>
                        <span>❤️ {photo.likes || 0} likes</span>
                      </div>
                      {photo.description && (
                        <p className="gallery-description">
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

      {/* Modal de réservation - Style ski */}
      {showReservationModal && selectedOffre && (
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
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

            {/* Contenu du formulaire */}
            <div style={{ padding: '2rem' }}>
              {/* Stepper */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '3rem',
                position: 'relative',
                padding: '0 1rem'
              }}>
                {/* Barre de progression */}
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
                {/* Étape 1 - Options */}
                {step === 1 && (
                  <div style={{ animation: 'slideIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>
                      1. Choisissez vos options
                    </h3>
                    
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      {/* Date */}
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                          Date de la randonnée *
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

                      {/* Nombre de personnes */}
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

                      {/* Niveau */}
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

                      {/* Option guide (si pas inclus) */}
                      {!selectedOffre.guide_inclus && (
                        <div style={{ 
                          background: '#f8fafc',
                          padding: '1.5rem',
                          borderRadius: '12px',
                          border: '1px solid #e5e5e5'
                        }}>
                          <h4 style={{ marginBottom: '1rem', color: '#333' }}>Options supplémentaires :</h4>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              name="guide"
                              checked={reservationForm.guide}
                              onChange={handleFormChange}
                              style={{ width: '18px', height: '18px' }}
                            />
                            <span>Guide accompagnateur (+50€)</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Étape 2 - Informations personnelles */}
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

                {/* Étape 3 - Adresse */}
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
                    </div>
                  </div>
                )}

                {/* Étape 4 - Confirmation */}
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

                      {(reservationForm.guide || selectedOffre.guide_inclus) && (
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
                            Options sélectionnées
                          </span>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            {selectedOffre.guide_inclus && (
                              <span style={{
                                background: '#f5f5f5',
                                padding: '0.5rem 1rem',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                color: '#333',
                                border: '1px solid #e5e5e5'
                              }}>
                                Guide inclus
                              </span>
                            )}
                            {reservationForm.guide && !selectedOffre.guide_inclus && (
                              <span style={{
                                background: '#f5f5f5',
                                padding: '0.5rem 1rem',
                                borderRadius: '30px',
                                fontSize: '0.85rem',
                                color: '#333',
                                border: '1px solid #e5e5e5'
                              }}>
                                Guide accompagnateur (+50€)
                              </span>
                            )}
                          </div>
                        </div>
                      )}
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

      <div className="randonnee-warning">
        <p>⚠️ La randonnée en montagne comporte des risques. Consultez toujours les conditions météo, 
           informez quelqu'un de votre itinéraire, et ne partez jamais seul.</p>
      </div>

      <style>{`
        .randonnees-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }
        .rando-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          position: relative;
        }
        .rando-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        .rando-image {
          height: 200px;
          position: relative;
          overflow: hidden;
        }
        .rando-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .rando-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.35rem 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .rando-badge-guide {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          padding: 0.35rem 1rem;
          background: rgba(0,0,0,0.7);
          color: white;
          border-radius: 30px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .rando-content {
          padding: 1.5rem;
        }
        .rando-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .rando-description {
          color: #666;
          font-size: 0.875rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }
        .rando-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          color: #666;
        }
        .rando-details div {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .rando-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .rando-price {
          font-size: 1.25rem;
          font-weight: 600;
          color: #000;
        }
        .rando-reserver {
          padding: 0.5rem 1.5rem;
          background: #000;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .rando-reserver:hover {
          background: #333;
        }
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .gallery-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        .gallery-image {
          height: 200px;
          overflow: hidden;
        }
        .gallery-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .gallery-info {
          padding: 1rem;
        }
        .gallery-info h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        .gallery-location {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;
        }
        .gallery-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #999;
        }
        .gallery-description {
          font-size: 0.875rem;
          color: #666;
          margin-top: 0.5rem;
          font-style: italic;
        }
        .randonnee-warning {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem auto;
          max-width: 800px;
          text-align: center;
          color: #92400e;
        }
      `}</style>

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

export default Randonnee;