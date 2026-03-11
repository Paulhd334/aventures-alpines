import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000';

  // Fonction pour obtenir l'utilisateur connecté
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Erreur parsing user:', error);
      return null;
    }
  };

  // Charger l'utilisateur et ses publications
  useEffect(() => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ Aucun utilisateur connecté, redirection vers login');
      navigate('/login');
      return;
    }

    console.log('👤 Utilisateur connecté:', currentUser);

    try {
      const username = currentUser.nom_utilisateur || currentUser.username || currentUser.userName || currentUser.name;
      if (!username) throw new Error('Nom utilisateur invalide');

      const updatedUser = { 
        ...currentUser, 
        nom_utilisateur: username,
        date_inscription: currentUser.date_inscription || currentUser.created_at || currentUser.createdAt || new Date().toISOString()
      };
      
      setUser(updatedUser);
      setEditData({ 
        nom_utilisateur: username, 
        email: currentUser.email || '' 
      });

      // Charger toutes les publications
      axios.get(`${API_BASE_URL}/api/articles`)
        .then(response => {
          if (Array.isArray(response.data)) {
            const userPubs = response.data.filter(pub => {
              const auteurUsername = pub.auteur?.nom_utilisateur || pub.auteur?.username || pub.username;
              const auteurId = pub.auteur_id || pub.userId || pub.auteur?.id;
              return auteurUsername === username || auteurId === currentUser.id;
            });
            setPublications(userPubs);
          } else {
            setPublications([]);
          }
        })
        .catch(err => {
          console.error('Erreur chargement articles:', err.message);
          setPublications([]);
        });

    } catch (error) {
      console.error('Erreur chargement profil:', error);
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Charger les réservations quand l'onglet change
  useEffect(() => {
    if (activeTab === 'reservations') {
      loadReservations();
    }
  }, [activeTab]);

  // Charger les réservations de l'utilisateur connecté
  const loadReservations = () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      console.error('❌ Impossible de charger les réservations: utilisateur non connecté');
      setReservations([]);
      return;
    }

    const userId = currentUser.id;
    console.log(`🔍 Chargement réservations pour utilisateur ID: ${userId} (${currentUser.username || currentUser.nom_utilisateur})`);
    
    setLoadingReservations(true);
    
    axios.get(`${API_BASE_URL}/api/reservations/user/${userId}`)
      .then(response => {
        console.log('📊 Réservations reçues:', response.data);
        if (Array.isArray(response.data)) {
          setReservations(response.data);
        } else {
          setReservations([]);
        }
      })
      .catch(err => {
        console.error('❌ Erreur chargement réservations:', err.message);
        if (err.response?.status === 404) {
          console.log('ℹ️ Aucune réservation trouvée (404)');
        }
        setReservations([]);
      })
      .finally(() => {
        setLoadingReservations(false);
      });
  };

  // Annuler une réservation
  const cancelReservation = async (reservationId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) {
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert('Vous devez être connecté');
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/reservations/${reservationId}`, {
        data: { userId: currentUser.id }
      });

      if (response.data.success) {
        alert('✅ Réservation annulée avec succès');
        // Recharger les réservations
        loadReservations();
      }
    } catch (error) {
      console.error('Erreur annulation:', error);
      alert(error.response?.data?.error || 'Erreur lors de l\'annulation');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    if (user) setEditData({ nom_utilisateur: user.nom_utilisateur, email: user.email });
    setEditing(false);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!editData.nom_utilisateur || !editData.email) {
      alert("Nom utilisateur et email obligatoires");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token manquant');

      const response = await axios.put(
        `${API_BASE_URL}/api/users/profile`, 
        editData,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
      alert('✅ Profil mis à jour !');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      alert('❌ Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Erreur formatage date:', error);
      return 'Date non disponible';
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #e5e5e5', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ marginTop: '1rem', color: '#666' }}>Chargement du profil...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>Utilisateur non trouvé</h2>
        <p>Veuillez vous connecter</p>
        <button onClick={() => navigate('/login')} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#000', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem' }}>
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 200px)' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
          {user.nom_utilisateur?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '600' }}>{user.nom_utilisateur}</h1>
          <br></br>
          <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '1rem' }}>{user.email}</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>
            Membre depuis {formatDate(user.date_inscription)}
          </p>
          <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            ID: {user.id} • {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('infos')} style={{ border: 'none', background: 'none', borderBottom: activeTab==='infos'?'2px solid #000':'2px solid transparent', cursor:'pointer', fontWeight: activeTab==='infos'?600:400, padding: '0.5rem 0' }}>
          Mes informations
        </button>
        <button onClick={() => setActiveTab('publications')} style={{ border: 'none', background: 'none', borderBottom: activeTab==='publications'?'2px solid #000':'2px solid transparent', cursor:'pointer', fontWeight: activeTab==='publications'?600:400, padding: '0.5rem 0' }}>
          Mes publications ({publications.length})
        </button>
        <button onClick={() => setActiveTab('reservations')} style={{ border: 'none', background: 'none', borderBottom: activeTab==='reservations'?'2px solid #000':'2px solid transparent', cursor:'pointer', fontWeight: activeTab==='reservations'?600:400, padding: '0.5rem 0' }}>
          Mes réservations ({reservations.length})
        </button>
      </div>

      {/* Contenu onglets */}
      <div>
        {/* Infos personnelles */}
        {activeTab==='infos' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:'600' }}>Informations personnelles</h2>
              {!editing && <button onClick={handleEdit} style={{ padding:'0.5rem 1rem', border:'1px solid #666', borderRadius:'4px', cursor:'pointer', backgroundColor: 'transparent' }}>✏️ Modifier</button>}
            </div>
            <div style={{ backgroundColor:'#f9f9f9', padding:'2rem', borderRadius:'8px' }}>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Nom d'utilisateur</label>
                {editing ? 
                  <input type="text" name="nom_utilisateur" value={editData.nom_utilisateur} onChange={handleChange} style={{ width:'100%', padding:'0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} /> 
                  : 
                  <div style={{ padding:'0.75rem', backgroundColor:'white', border: '1px solid #e0e0e0', borderRadius: '4px' }}>{user.nom_utilisateur}</div>
                }
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Email</label>
                {editing ? 
                  <input type="email" name="email" value={editData.email} onChange={handleChange} style={{ width:'100%', padding:'0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} /> 
                  : 
                  <div style={{ padding:'0.75rem', backgroundColor:'white', border: '1px solid #e0e0e0', borderRadius: '4px' }}>{user.email}</div>
                }
              </div>
              <div style={{ marginBottom:'2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Date d'inscription</label>
                <div style={{ padding:'0.75rem', backgroundColor:'white', border: '1px solid #e0e0e0', borderRadius:'4px', color:'#666' }}>
                  {formatDate(user.date_inscription)}
                </div>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} style={{ padding:'0.75rem 1.5rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'4px', cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
                      {saving ? '💾 Enregistrement...' : '💾 Enregistrer'}
                    </button>
                    <button onClick={handleCancel} style={{ padding:'0.75rem 1.5rem', border:'1px solid #666', backgroundColor: 'transparent', borderRadius:'4px', cursor:'pointer' }}>
                      Annuler
                    </button>
                  </>
                ) : (
                  <button onClick={handleLogout} style={{ padding:'0.75rem 1.5rem', border:'1px solid #ef4444', backgroundColor: 'transparent', borderRadius:'4px', color:'#ef4444', cursor:'pointer' }}>
                    Se déconnecter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Réservations */}
        {activeTab==='reservations' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:'600' }}>Mes réservations</h2>
              <button onClick={() => navigate('/activities')} style={{ padding:'0.75rem 1.5rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
                ➕ Nouvelle réservation
              </button>
            </div>
            
            {loadingReservations ? (
              <div style={{ textAlign:'center', padding:'3rem' }}>
                <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #e5e5e5', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ marginTop: '1rem', color: '#666' }}>Chargement de vos réservations...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', backgroundColor:'#f9f9f9', borderRadius:'8px' }}>
                <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Vous n'avez pas encore réservé d'activité</p>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Découvrez nos activités de montagne et réservez votre prochaine aventure !</p>
                <button onClick={() => navigate('/activities')} style={{ padding:'0.75rem 2rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize: '1rem' }}>
                  Explorer les activités
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gap:'1.5rem' }}>
                {reservations.map(res => (
                  <div key={res.id} style={{ padding:'1.5rem', border:'1px solid #e0e0e0', borderRadius:'8px', backgroundColor:'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          {res.activite_nom || 'Activité'}
                        </h3>
                        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#666' }}>
                          <div>
                            <span style={{ fontWeight: '500' }}>Date:</span> {formatDate(res.date_reservation)}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Personnes:</span> {res.nb_personnes || 1}
                          </div>
                          <div>
                            <span style={{ fontWeight: '500' }}>Lieu:</span> {res.lieu || 'Non spécifié'}
                          </div>
                        </div>
                      </div>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '500', backgroundColor: '#d1fae5', color: '#065f46' }}>
                        {res.statut || 'Confirmée'}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
                      <button
                        onClick={() => cancelReservation(res.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #ef4444',
                          color: '#ef4444',
                          backgroundColor: 'transparent',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;