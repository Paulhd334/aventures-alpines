// src/pages/Activities.js - VERSION AVEC RÉSERVATION
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../components/ActivityCard';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [reservationForm, setReservationForm] = useState({
    date: '',
    nbPersonnes: 1,
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    notes: ''
  });
  const [reservationLoading, setReservationLoading] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000';

  // Charger les activités
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_BASE_URL}/api/activites`);
        const data = response.data;
        
        console.log('Activités reçues:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }
        
        setActivities(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError('Impossible de charger les activités. Vérifiez que le serveur est en marche.');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

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
  const handleReserver = (activity) => {
    const user = getCurrentUser();
    
    if (!user) {
      // Rediriger vers login si non connecté
      navigate('/login', { 
        state: { 
          from: '/activities',
          activity: activity,
          message: 'Connectez-vous pour réserver cette activité'
        }
      });
      return;
    }

    // Pré-remplir avec les infos de l'utilisateur si disponibles
    setSelectedActivity(activity);
    setReservationForm({
      date: '',
      nbPersonnes: 1,
      nom: user.nom_utilisateur || user.username || '',
      prenom: '',
      email: user.email || '',
      telephone: '',
      notes: ''
    });
    setShowReservationModal(true);
  };

  // Gérer les changements du formulaire
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({
      ...prev,
      [name]: value
    }));
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
      // Préparer les notes avec toutes les informations
      const notesData = {
        activite: selectedActivity.nom,
        lieu: selectedActivity.lieu,
        duree: selectedActivity.duree,
        difficulte: selectedActivity.difficulte,
        clientInfo: {
          nom: reservationForm.nom,
          prenom: reservationForm.prenom,
          email: reservationForm.email,
          telephone: reservationForm.telephone
        },
        notes: reservationForm.notes
      };

      const reservationData = {
        userId: user.id,
        activityId: selectedActivity.id,
        date: reservationForm.date,
        nbPersonnes: parseInt(reservationForm.nbPersonnes),
        notes: JSON.stringify(notesData)
      };

      console.log('📤 Envoi réservation:', reservationData);

      const response = await axios.post(`${API_BASE_URL}/api/reservations`, reservationData);

      if (response.data.success || response.status === 201) {
        alert('✅ Réservation confirmée !');
        setShowReservationModal(false);
        
        // Option: rediriger vers le profil après 1 seconde
        setTimeout(() => {
          navigate('/profil?tab=reservations');
        }, 1000);
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
    setSelectedActivity(null);
  };

  // Catégories basées sur les types d'activités disponibles
  const getCategories = () => {
    const allCategories = [
      { id: 'all', name: 'Toutes les activités' }
    ];
    
    const uniqueTypes = [...new Set(activities.map(activity => activity.type))];
    
    uniqueTypes.forEach(type => {
      if (type) {
        const displayName = {
          ski: 'Ski',
          randonnee: 'Randonnée',
          escalade: 'Escalade',
          vtt: 'VTT'
        }[type] || type.charAt(0).toUpperCase() + type.slice(1);
        
        allCategories.push({ id: type, name: displayName });
      }
    });
    
    return allCategories;
  };

  // Grouper les activités par catégorie
  const activitiesByCategory = activities.reduce((acc, activity) => {
    const category = activity.type || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {});

  // FILTRAGE
  const filteredByCategory = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedCategory);

  const finalActivities = searchTerm.trim() === '' 
    ? filteredByCategory 
    : filteredByCategory.filter(activity => {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          activity.nom || '',
          activity.description || '',
          activity.lieu || '',
          activity.difficulte || '',
          activity.saison || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });

  // Fonction pour effacer la recherche
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Fonction pour réinitialiser tous les filtres
  const handleResetAll = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p style={{ color: '#666' }}>Chargement des activités...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ 
            padding: '3rem 1.5rem', 
            textAlign: 'center',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              fontWeight: '300',
              marginBottom: '1rem',
              color: '#000'
            }}>
              Erreur de chargement
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              Vérifiez que le serveur backend est démarré sur http://localhost:5000
            </p>
          </div>
        </div>
      </section>
    );
  }

  const categories = getCategories();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 300,
              marginBottom: '1rem',
              color: '#000'
            }}>
              Nos activités de montagne
            </h1>
            
            <p style={{
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              fontSize: '1.125rem',
              lineHeight: 1.6
            }}>
              Découvrez toutes nos activités classées par catégorie. 
              Trouvez l'aventure qui vous correspond.
            </p>
            
            <div style={{
              fontSize: '0.875rem',
              color: '#666',
              backgroundColor: '#f9fafb',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              {activities.length} activité{activities.length !== 1 ? 's' : ''} disponibles
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          {/* Barre de recherche */}
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Rechercher une activité, un lieu, une difficulté..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.875rem',
                  color: '#666'
                }}>
                  {finalActivities.length} résultat{finalActivities.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={handleClearSearch}
                disabled={!searchTerm}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: searchTerm ? '#555' : '#e5e7eb',
                  color: searchTerm ? 'white' : '#999',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: searchTerm ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem'
                }}
              >
                Effacer recherche
              </button>
              <button 
                onClick={handleResetAll}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Tout réinitialiser
              </button>
            </div>
          </div>

          {/* Catégories */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              marginBottom: '1rem',
              color: '#000'
            }}>Catégories</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(category => {
                const count = category.id === 'all' 
                  ? activities.length 
                  : (activitiesByCategory[category.id] || []).length;
                
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      border: `1px solid ${isSelected ? '#000' : '#d1d5db'}`,
                      backgroundColor: isSelected ? '#000' : 'white',
                      color: isSelected ? 'white' : '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: '400'
                    }}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: '400',
                marginBottom: '0.5rem',
                color: '#000'
              }}>
                {selectedCategory === 'all' 
                  ? 'Toutes les activités' 
                  : categories.find(c => c.id === selectedCategory)?.name}
                {searchTerm && ` - Recherche: "${searchTerm}"`}
              </h3>
              <p style={{ color: '#666' }}>
                {finalActivities.length} activité{finalActivities.length !== 1 ? 's' : ''} trouvée{finalActivities.length !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </p>
            </div>

            {/* Affichage des activités avec bouton Réserver */}
            {finalActivities.length === 0 ? (
              <div style={{ 
                padding: '3rem 1.5rem', 
                textAlign: 'center',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '400',
                  marginBottom: '1rem',
                  color: '#000'
                }}>
                  Aucune activité trouvée
                </h3>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Modifiez vos critères de recherche ou explorez d'autres catégories.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem'
              }}>
                {finalActivities.map(activity => (
                  <div key={activity.id} style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    {/* Image */}
                    <div style={{
                      height: '200px',
                      overflow: 'hidden',
                      backgroundColor: '#f9fafb'
                    }}>
                      <img 
                        src={activity.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop'} 
                        alt={activity.nom}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop';
                        }}
                      />
                    </div>

                    {/* Contenu */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#000' }}>
                          {activity.nom}
                        </h3>
                        <p style={{ color: '#666', fontSize: '0.875rem', lineHeight: 1.5 }}>
                          {activity.description}
                        </p>
                      </div>

                      {/* Détails */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ color: '#666' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Lieu:</span> {activity.lieu}
                        </div>
                        <div style={{ color: '#666' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Difficulté:</span> {activity.difficulte}
                        </div>
                        <div style={{ color: '#666' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Durée:</span> {activity.duree}
                        </div>
                        <div style={{ color: '#666' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Saison:</span> {activity.saison}
                        </div>
                        <div style={{ color: '#666', gridColumn: 'span 2' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Capacité:</span> {activity.capacite_max} personnes max
                        </div>
                      </div>

                      {/* Dates */}
                      <div style={{
                        padding: '0.75rem',
                        backgroundColor: '#f9fafb',
                        borderRadius: '4px',
                        marginBottom: '1rem',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ color: '#666' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Du:</span> {new Date(activity.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ color: '#666', marginTop: '0.25rem' }}>
                          <span style={{ fontWeight: '500', color: '#333' }}>Au:</span> {new Date(activity.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>

                      {/* Bouton Réserver */}
                      <button
                        onClick={() => handleReserver(activity)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          backgroundColor: '#000',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '1rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          marginTop: 'auto'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#000'}
                      >
                        Réserver cette activité
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal de réservation */}
      {showReservationModal && selectedActivity && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={closeModal}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Bouton fermer */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f0f0f0',
                cursor: 'pointer',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Réserver : {selectedActivity.nom}
              </h2>
              <p style={{ color: '#666' }}>
                {selectedActivity.lieu} • {selectedActivity.duree} • {selectedActivity.difficulte}
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmitReservation} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Date de participation *
                </label>
                <input
                  type="date"
                  name="date"
                  value={reservationForm.date}
                  onChange={handleFormChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Nombre de personnes *
                </label>
                <input
                  type="number"
                  name="nbPersonnes"
                  value={reservationForm.nbPersonnes}
                  onChange={handleFormChange}
                  min="1"
                  max={selectedActivity.capacite_max}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
                <small style={{ color: '#666', display: 'block', marginTop: '0.25rem' }}>
                  Maximum {selectedActivity.capacite_max} personnes
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={reservationForm.prenom}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={reservationForm.nom}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={reservationForm.email}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    name="telephone"
                    value={reservationForm.telephone}
                    onChange={handleFormChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Notes / Demandes spéciales
                </label>
                <textarea
                  name="notes"
                  value={reservationForm.notes}
                  onChange={handleFormChange}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                  placeholder="Régime alimentaire, besoins spécifiques..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={reservationLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: reservationLoading ? 'not-allowed' : 'pointer',
                    opacity: reservationLoading ? 0.7 : 1,
                    fontSize: '1rem'
                  }}
                >
                  {reservationLoading ? 'Réservation...' : 'Confirmer la réservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Style pour l'animation de spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Activities;