import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ReservationSki = ({ offre, onClose, isOpen }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1 - Options
    dateDebut: '',
    dateFin: '',
    nbPersonnes: 1,
    forfaitSki: true,
    coursSki: false,
    locationMateriel: false,
    typeCours: 'collectif',
    niveau: 'débutant',
    
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
    
    // Étape 4 - Options supplémentaires
    assurance: false,
    parking: false,
    garderie: false,
    restauration: false,
    notes: ''
  });

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prixTotal, setPrixTotal] = useState(0);
  const [animation, setAnimation] = useState('closed');
  const navigate = useNavigate();

  // Animation d'ouverture/fermeture
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          nom: userData.nom_utilisateur || userData.username || '',
          email: userData.email || ''
        }));
      } catch (e) {
        console.error('Erreur parsing user:', e);
      }
    }
  }, []);

  // Calculer le prix total
  useEffect(() => {
    let total = offre?.prix ? parseFloat(offre.prix) : 0;
    
    if (formData.coursSki) total += 45;
    if (formData.locationMateriel) total += 35;
    if (formData.assurance) total += 15;
    if (formData.parking) total += 12;
    if (formData.garderie) total += 25;
    if (formData.restauration) total += 28;
    
    total *= formData.nbPersonnes;
    
    if (formData.dateDebut && formData.dateFin) {
      const start = new Date(formData.dateDebut);
      const end = new Date(formData.dateFin);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      if (days > 0 && days < 30) total *= days;
    }
    
    setPrixTotal(Math.round(total));
  }, [formData, offre]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Veuillez vous connecter pour réserver');
      navigate('/login', { state: { from: '/ski' } });
      return;
    }

    // Validation des champs requis
    if (!formData.dateDebut || !formData.dateFin) {
      alert('Veuillez sélectionner les dates de votre séjour');
      return;
    }

    if (!formData.nom || !formData.prenom || !formData.email) {
      alert('Veuillez remplir vos informations personnelles');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        userId: user.id,
        activityId: offre.id,
        date: formData.dateDebut,
        nbPersonnes: parseInt(formData.nbPersonnes),
        notes: JSON.stringify({
          offre: offre.titre,
          station: offre.station_nom,
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
            civilite: formData.civilite,
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
            adresse: formData.adresse,
            cp: formData.cp,
            ville: formData.ville,
            pays: formData.pays
          },
          prixTotal: prixTotal
        })
      };

      console.log('📤 Envoi réservation:', reservationData);

      const response = await axios.post('http://localhost:5000/api/reservations', reservationData);
      
      if (response.data.success || response.status === 201) {
        alert('✅ Réservation confirmée avec succès !');
        onClose();
        setTimeout(() => {
          navigate('/profil?tab=reservations');
        }, 500);
      }
    } catch (error) {
      console.error('❌ Erreur réservation:', error);
      
      if (error.response) {
        alert(`❌ Erreur: ${error.response.data.error || 'Données invalides'}`);
      } else if (error.request) {
        alert('❌ Le serveur ne répond pas. Vérifiez qu\'il est bien démarré.');
      } else {
        alert('❌ Erreur: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

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

  if (!offre) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Bouton fermer */}
        <button 
          onClick={onClose}
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

        {/* Header avec image - CORRIGÉ : texte en blanc */}
        <div style={{
          background: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%), url(${offre.station_photo || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: '3rem 2rem',
          color: 'white', // ← TOUT LE TEXTE EN BLANC
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
              color: 'white' // ← TEXTE EN BLANC
            }}>
              {offre.station_nom}
            </span>
            {offre.reduction && (
              <span style={{
                background: '#000',
                padding: '0.5rem 1rem',
                borderRadius: '30px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                color: 'white' // ← TEXTE EN BLANC
              }}>
                {offre.reduction}
              </span>
            )}
          </div>
          <h2 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '0.5rem', 
            fontWeight: '700',
            color: 'white' // ← TITRE EN BLANC
          }}>
            {offre.titre}
          </h2>
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.9, 
            maxWidth: '600px',
            color: 'white' // ← DESCRIPTION EN BLANC
          }}>
            {offre.description}
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

          <form onSubmit={handleSubmit}>
            {/* Étape 1 - Options de réservation */}
            {step === 1 && (
              <div style={{ animation: 'slideIn 0.3s ease' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: '#333' }}>
                  1. Choisissez vos options
                </h3>
                
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Dates */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                        Date d'arrivée *
                      </label>
                      <input
                        type="date"
                        name="dateDebut"
                        value={formData.dateDebut}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                        Date de départ *
                      </label>
                      <input
                        type="date"
                        name="dateFin"
                        value={formData.dateFin}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                        min={formData.dateDebut || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Nombre de personnes */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                      Nombre de personnes *
                    </label>
                    <input
                      type="number"
                      name="nbPersonnes"
                      value={formData.nbPersonnes}
                      onChange={handleChange}
                      min="1"
                      max="20"
                      required
                      style={inputStyle}
                    />
                  </div>

                  {/* Options principales */}
                  <div style={{ 
                    background: '#f8fafc',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    border: '1px solid #e5e5e5'
                  }}>
                    <h4 style={{ marginBottom: '1rem', color: '#333' }}>Options incluses :</h4>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '1rem'
                    }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="forfaitSki"
                          checked={formData.forfaitSki}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Forfait ski inclus</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="coursSki"
                          checked={formData.coursSki}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Cours de ski (+45€/pers)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          name="locationMateriel"
                          checked={formData.locationMateriel}
                          onChange={handleChange}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>Location matériel (+35€/pers)</span>
                      </label>
                    </div>
                  </div>

                  {/* Options conditionnelles */}
                  {formData.coursSki && (
                    <div style={{
                      animation: 'fadeIn 0.3s ease',
                      background: '#f8fafc',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e5e5e5'
                    }}>
                      <h4 style={{ marginBottom: '1rem', color: '#333' }}>Détails des cours</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type de cours</label>
                          <select
                            name="typeCours"
                            value={formData.typeCours}
                            onChange={handleChange}
                            style={inputStyle}
                          >
                            <option value="collectif">Collectif</option>
                            <option value="prive">Privé</option>
                            <option value="famille">Famille</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Niveau</label>
                          <select
                            name="niveau"
                            value={formData.niveau}
                            onChange={handleChange}
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
                      value={formData.civilite}
                      onChange={handleChange}
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
                        value={formData.nom}
                        onChange={handleChange}
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
                        value={formData.prenom}
                        onChange={handleChange}
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
                        value={formData.email}
                        onChange={handleChange}
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
                        value={formData.telephone}
                        onChange={handleChange}
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
                      value={formData.adresse}
                      onChange={handleChange}
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
                        value={formData.cp}
                        onChange={handleChange}
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
                        value={formData.ville}
                        onChange={handleChange}
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
                      value={formData.pays}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  {/* Options supplémentaires */}
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ marginBottom: '1rem', color: '#333' }}>Options supplémentaires</h4>
                    <div style={{ 
                      background: '#f8fafc',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #e5e5e5'
                    }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '1rem'
                      }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="assurance"
                            checked={formData.assurance}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span>Assurance annulation (+15€)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="parking"
                            checked={formData.parking}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span>Parking couvert (+12€/j)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="garderie"
                            checked={formData.garderie}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span>Garderie (+25€/j/enfant)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            name="restauration"
                            checked={formData.restauration}
                            onChange={handleChange}
                            style={{ width: '18px', height: '18px' }}
                          />
                          <span>Demi-pension (+28€/j)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>
                      Notes / Demandes spéciales
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      style={{ ...inputStyle, resize: 'vertical' }}
                      placeholder="Régime alimentaire, besoins spécifiques, etc."
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
                
                {/* Carte récapitulative */}
                <div style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                  border: '1px solid #f0f0f0'
                }}>
                  {/* En-tête avec prix */}
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
                        {offre.titre}
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

                  {/* Grille d'informations */}
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
                        Station
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        color: '#1a1a1a',
                        fontWeight: '500'
                      }}>
                        {offre.station_nom}
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
                        Séjour
                      </span>
                      <span style={{
                        fontSize: '1rem',
                        color: '#1a1a1a',
                        fontWeight: '500'
                      }}>
                        {new Date(formData.dateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {new Date(formData.dateFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
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
                        {formData.nbPersonnes} {formData.nbPersonnes > 1 ? 'personnes' : 'personne'}
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
                        {formData.civilite} {formData.prenom} {formData.nom}
                      </span>
                    </div>
                  </div>

                  {/* Options sélectionnées */}
                  {(formData.coursSki || formData.locationMateriel || formData.assurance || formData.parking || formData.garderie || formData.restauration) && (
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
                        {formData.coursSki && <span style={optionTagStyle}>Cours de ski</span>}
                        {formData.locationMateriel && <span style={optionTagStyle}>Location matériel</span>}
                        {formData.assurance && <span style={optionTagStyle}>Assurance</span>}
                        {formData.parking && <span style={optionTagStyle}>Parking</span>}
                        {formData.garderie && <span style={optionTagStyle}>Garderie</span>}
                        {formData.restauration && <span style={optionTagStyle}>Demi-pension</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Case à cocher conditions */}
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
                  disabled={loading}
                  style={{
                    padding: '1rem 2rem',
                    border: 'none',
                    background: loading ? '#999' : '#000',
                    color: 'white',
                    borderRadius: '12px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    marginLeft: 'auto',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) e.target.style.background = '#333';
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) e.target.style.background = '#000';
                  }}
                >
                  {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Styles d'animation */}
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

// Style pour les tags d'options
const optionTagStyle = {
  background: '#f5f5f5',
  padding: '0.5rem 1rem',
  borderRadius: '30px',
  fontSize: '0.85rem',
  color: '#333',
  border: '1px solid #e5e5e5'
};

export default ReservationSki;