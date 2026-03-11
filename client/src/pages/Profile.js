import React, { useState, useEffect, useCallback } from 'react';
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
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  // États pour la publication d'articles
  const [showPublicationForm, setShowPublicationForm] = useState(false);
  const [newPublication, setNewPublication] = useState({
    titre: '',
    contenu: '',
    lieu: '',
    type: 'récit'
  });
  const [publishing, setPublishing] = useState(false);

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

  // FONCTION CORRIGÉE - Charge UNIQUEMENT les articles de l'utilisateur connecté
  const loadUserPublications = useCallback(async () => {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.log('❌ Pas d\'utilisateur connecté');
      return;
    }

    console.log('🔍 Chargement des articles pour utilisateur ID:', currentUser.id);
    
    try {
      // Essayer d'abord la route spécifique à l'utilisateur
      const response = await axios.get(`${API_BASE_URL}/api/articles/utilisateur/${currentUser.id}`);
      
      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} articles trouvés pour l'utilisateur ${currentUser.id}`);
        setPublications(response.data);
      } else {
        setPublications([]);
      }
    } catch (err) {
      console.log('⚠️ API spécifique non disponible, utilisation du filtre côté client');
      
      // Fallback: récupérer tous les articles et filtrer
      try {
        const response = await axios.get(`${API_BASE_URL}/api/articles`);
        if (Array.isArray(response.data)) {
          const userPubs = response.data.filter(pub => {
            if (pub.auteur_id === currentUser.id) return true;
            if (pub.userId === currentUser.id) return true;
            if (pub.auteur?.id === currentUser.id) return true;
            
            const pubUsername = pub.auteur?.nom_utilisateur || pub.auteur?.username || pub.username;
            return pubUsername === currentUser.nom_utilisateur;
          });
          
          console.log(`✅ ${userPubs.length} articles filtrés pour l'utilisateur ${currentUser.nom_utilisateur}`);
          setPublications(userPubs);
        }
      } catch (error) {
        console.error('❌ Erreur chargement articles:', error.message);
        setPublications([]);
      }
    }
  }, []);

  // ✅ FONCTION CORRIGÉE - Charge TOUTES les réservations (activités + ski)
  const loadReservations = useCallback(async (showLoading = false) => {
    const currentUser = getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      console.error('❌ Impossible de charger les réservations: utilisateur non connecté');
      setReservations([]);
      return;
    }

    const userId = currentUser.id;
    console.log(`🔍 Chargement des réservations pour utilisateur ID: ${userId}`);
    
    if (showLoading) setLoadingReservations(true);
    
    try {
      // ✅ Utiliser la route unifiée qui retourne TOUTES les réservations
      const response = await axios.get(`${API_BASE_URL}/api/reservations/user/${userId}`);
      console.log('📊 Réservations reçues:', response.data);
      
      if (Array.isArray(response.data)) {
        setReservations(response.data);
        console.log(`✅ ${response.data.length} réservations chargées (activités + ski)`);
      } else {
        setReservations([]);
      }
    } catch (err) {
      console.error('❌ Erreur chargement réservations:', err.message);
      setReservations([]);
    } finally {
      if (showLoading) setLoadingReservations(false);
    }
  }, []);

  // Fonction pour publier un nouvel article
  const handlePublishArticle = async (e) => {
    e.preventDefault();
    
    if (!newPublication.titre || !newPublication.contenu) {
      alert('Le titre et le contenu sont requis');
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      alert('Vous devez être connecté');
      return;
    }

    setPublishing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/articles`, {
        titre: newPublication.titre,
        contenu: newPublication.contenu,
        auteur_id: currentUser.id,
        lieu: newPublication.lieu || '',
        type: newPublication.type || 'récit'
      });

      if (response.status === 201) {
        alert('✅ Article publié avec succès !');
        setShowPublicationForm(false);
        setNewPublication({
          titre: '',
          contenu: '',
          lieu: '',
          type: 'récit'
        });
        await loadUserPublications();
      }
    } catch (error) {
      console.error('Erreur publication:', error);
      alert('❌ Erreur lors de la publication: ' + (error.response?.data?.error || error.message));
    } finally {
      setPublishing(false);
    }
  };

  // Charger l'utilisateur et ses données au montage
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

      // Charger les publications
      loadUserPublications();

      // ✅ Charger TOUTES les réservations (activités + ski)
      loadReservations(false);

    } catch (error) {
      console.error('Erreur chargement profil:', error);
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, loadReservations, loadUserPublications]);

  // Effet pour recharger quand lastUpdate change
  useEffect(() => {
    if (lastUpdate) {
      console.log('🔄 Mise à jour des réservations après modification');
      loadReservations(false);
    }
  }, [lastUpdate, loadReservations]);

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
        setReservations(prev => prev.filter(r => r.id !== reservationId));
        setLastUpdate(Date.now());
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

  const handlePublicationChange = (e) => {
    setNewPublication({ ...newPublication, [e.target.name]: e.target.value });
  };

  // Mise à jour du profil
  const handleSave = async () => {
    if (!editData.nom_utilisateur || !editData.email) {
      alert("Nom utilisateur et email obligatoires");
      return;
    }

    setSaving(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser || !currentUser.id) {
        throw new Error('Utilisateur non connecté');
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${currentUser.id}`,
        {
          nom_utilisateur: editData.nom_utilisateur,
          email: editData.email
        }
      );

      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        ...updatedUser,
        nom_utilisateur: updatedUser.nom_utilisateur,
        email: updatedUser.email
      }));
      
      setEditing(false);
      alert('✅ Profil mis à jour !');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      alert('❌ Erreur lors de la mise à jour du profil: ' + (error.response?.data?.error || error.message));
    } finally {
      setSaving(false);
    }
  };

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
      return 'Date non disponible';
    }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
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
            ID: {user.id} • {reservations.length} réservation{reservations.length !== 1 ? 's' : ''} • {publications.length} publication{publications.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
        <button 
          onClick={() => setActiveTab('infos')} 
          style={{ 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'infos' ? '2px solid #000' : '2px solid transparent', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'infos' ? 600 : 400, 
            padding: '0.5rem 0' 
          }}
        >
          Mes informations
        </button>
        <button 
          onClick={() => setActiveTab('publications')} 
          style={{ 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'publications' ? '2px solid #000' : '2px solid transparent', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'publications' ? 600 : 400, 
            padding: '0.5rem 0' 
          }}
        >
          Mes publications ({publications.length})
        </button>
        <button 
          onClick={() => {
            setActiveTab('reservations');
            loadReservations(true);
          }} 
          style={{ 
            border: 'none', 
            background: 'none', 
            borderBottom: activeTab === 'reservations' ? '2px solid #000' : '2px solid transparent', 
            cursor: 'pointer', 
            fontWeight: activeTab === 'reservations' ? 600 : 400, 
            padding: '0.5rem 0' 
          }}
        >
          Mes réservations ({reservations.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'infos' && (
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

        {activeTab === 'publications' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:'600' }}>Mes publications</h2>
              <button 
                onClick={() => setShowPublicationForm(!showPublicationForm)}
                style={{ 
                  padding:'0.75rem 1.5rem', 
                  backgroundColor: showPublicationForm ? '#666' : '#000', 
                  color:'white', 
                  border:'none', 
                  borderRadius:'6px', 
                  cursor:'pointer' 
                }}
              >
                {showPublicationForm ? '✖ Annuler' : '➕ Nouvelle publication'}
              </button>
            </div>

            {/* Formulaire de publication */}
            {showPublicationForm && (
              <div style={{ 
                backgroundColor: '#f9f9f9', 
                padding: '2rem', 
                borderRadius: '8px',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0'
              }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Publier un article</h3>
                <form onSubmit={handlePublishArticle}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Titre *
                    </label>
                    <input
                      type="text"
                      name="titre"
                      value={newPublication.titre}
                      onChange={handlePublicationChange}
                      style={{ width:'100%', padding:'0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      placeholder="Titre de votre article"
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Contenu *
                    </label>
                    <textarea
                      name="contenu"
                      value={newPublication.contenu}
                      onChange={handlePublicationChange}
                      style={{ width:'100%', padding:'0.75rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '150px' }}
                      placeholder="Partagez votre expérience..."
                      required
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Lieu
                    </label>
                    <input
                      type="text"
                      name="lieu"
                      value={newPublication.lieu}
                      onChange={handlePublicationChange}
                      style={{ width:'100%', padding:'0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      placeholder="Où s'est déroulée cette aventure ?"
                    />
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Type d'article
                    </label>
                    <select
                      name="type"
                      value={newPublication.type}
                      onChange={handlePublicationChange}
                      style={{ width:'100%', padding:'0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      <option value="récit">Récit d'aventure</option>
                      <option value="guide">Guide / Conseils</option>
                      <option value="article">Article général</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      type="submit"
                      disabled={publishing}
                      style={{ 
                        padding:'0.75rem 2rem', 
                        backgroundColor: '#000', 
                        color:'white', 
                        border:'none', 
                        borderRadius:'4px', 
                        cursor: publishing ? 'not-allowed' : 'pointer',
                        opacity: publishing ? 0.7 : 1
                      }}
                    >
                      {publishing ? 'Publication...' : 'Publier'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPublicationForm(false)}
                      style={{ 
                        padding:'0.75rem 2rem', 
                        backgroundColor: 'transparent', 
                        color:'#666', 
                        border:'1px solid #666', 
                        borderRadius:'4px', 
                        cursor:'pointer' 
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Liste des publications */}
            {publications.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', backgroundColor:'#f9f9f9', borderRadius:'8px' }}>
                <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Vous n'avez pas encore publié d'article</p>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Partagez vos aventures avec la communauté !</p>
                <button 
                  onClick={() => setShowPublicationForm(true)}
                  style={{ padding:'0.75rem 2rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize: '1rem' }}
                >
                  ✍️ Créer mon premier article
                </button>
              </div>
            ) : (
              <div style={{ display:'grid', gap:'1.5rem' }}>
                {publications.map(pub => (
                  <div key={pub.id} style={{ padding:'1.5rem', border:'1px solid #e0e0e0', borderRadius:'8px', backgroundColor:'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{pub.titre}</h3>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#666' }}>
                          <span>📍 {pub.lieu || 'Lieu non spécifié'}</span>
                          <span>📝 {pub.type || 'récit'}</span>
                          <span>📅 {formatDate(pub.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <p style={{ color: '#333', lineHeight: '1.6', marginBottom: '1rem' }}>
                      {pub.contenu?.substring(0, 200)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Link to={`/article/${pub.id}`}>
                        <button
                          style={{ 
                            padding: '0.5rem 1.5rem',
                            border: '1px solid #000',
                            color: '#000',
                            backgroundColor: 'transparent',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#000';
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#000';
                          }}
                        >
                          Lire la suite →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservations' && (
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
                <p style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Vous n'avez pas encore réservé</p>
                <p style={{ color: '#666', marginBottom: '2rem' }}>Découvrez nos activités et offres de ski !</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button onClick={() => navigate('/activities')} style={{ padding:'0.75rem 2rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize: '1rem' }}>
                    Activités
                  </button>
                  <button onClick={() => navigate('/ski')} style={{ padding:'0.75rem 2rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize: '1rem' }}>
                    Offres de ski
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:'grid', gap:'1.5rem' }}>
                {reservations.map(res => (
                  <div key={res.id} style={{ padding:'1.5rem', border:'1px solid #e0e0e0', borderRadius:'8px', backgroundColor:'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                        {/* Image */}
                        <div style={{ 
                          width: '80px', 
                          height: '80px', 
                          borderRadius: '8px', 
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img 
                            src={res.image_url || (res.type === 'ski' 
                              ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop'
                              : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop'
                            )} 
                            alt={res.activite_nom}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        
                        {/* Détails */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            {res.type === 'ski' && (
                              <span style={{ 
                                padding: '0.25rem 0.5rem', 
                                background: '#e5e5e5', 
                                borderRadius: '4px', 
                                fontSize: '0.7rem',
                                fontWeight: '600'
                              }}>
                                SKI
                              </span>
                            )}
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                              {res.activite_nom}
                            </h3>
                          </div>
                          
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
                            <div>
                              <span style={{ fontWeight: '500' }}>Date:</span> {formatShortDate(res.date_reservation)}
                            </div>
                            <div>
                              <span style={{ fontWeight: '500' }}>Personnes:</span> {res.nb_personnes || 1}
                            </div>
                            <div>
                              <span style={{ fontWeight: '500' }}>Lieu:</span> {res.lieu || 'Non spécifié'}
                            </div>
                            <div>
                              <span style={{ fontWeight: '500' }}>Type:</span> {res.activite_type || res.type || 'Activité'}
                            </div>
                          </div>

                          {/* Détails supplémentaires pour le ski */}
                          {res.type === 'ski' && res.details && (
                            <div style={{ 
                              marginTop: '1rem', 
                              padding: '0.75rem', 
                              background: '#f5f5f5', 
                              borderRadius: '6px',
                              fontSize: '0.875rem'
                            }}>
                              <div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Détails du séjour :</div>
                              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {res.details.dateFin && (
                                  <span>📅 Départ: {formatShortDate(res.details.dateFin)}</span>
                                )}
                                {res.details.prixTotal && (
                                  <span>💰 Total: {res.details.prixTotal}€</span>
                                )}
                                {res.details.options && Object.entries(res.details.options).map(([key, value]) => 
                                  value && key !== 'forfaitSki' && (
                                    <span key={key} style={{ 
                                      background: '#e5e5e5', 
                                      padding: '0.2rem 0.5rem',
                                      borderRadius: '4px',
                                      fontSize: '0.75rem'
                                    }}>
                                      {key === 'coursSki' ? '📚 Cours' :
                                       key === 'locationMateriel' ? '🎿 Location' :
                                       key === 'assurance' ? '🛡️ Assurance' :
                                       key === 'parking' ? '🅿️ Parking' :
                                       key === 'garderie' ? '🧸 Garderie' :
                                       key === 'restauration' ? '🍽️ Restauration' : key}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: '500', 
                        backgroundColor: '#d1fae5', 
                        color: '#065f46' 
                      }}>
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