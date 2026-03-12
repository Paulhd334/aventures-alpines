import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [reservationsSki, setReservationsSki] = useState([]);
  const [reservationsRandonnee, setReservationsRandonnee] = useState([]);
  const [reservationsEscalade, setReservationsEscalade] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [activeTab, setActiveTab] = useState('infos');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

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

  // ✅ FIX : getCurrentUser robuste avec logs
  const getCurrentUser = () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return null;
    try {
      const parsed = JSON.parse(storedUser);
      console.log('📦 localStorage user:', parsed);
      return parsed;
    } catch (error) {
      console.error('Erreur parsing user:', error);
      return null;
    }
  };

  // ✅ FIX : résolution de l'id peu importe le nom de la clé
  const resolveUserId = (userObj) => {
    if (!userObj) return null;
    return userObj.id
      || userObj.user_id
      || userObj.userId
      || userObj.ID
      || null;
  };

  // ✅ FIX : résolution du nom d'utilisateur peu importe le nom de la clé
  const resolveUsername = (userObj) => {
    if (!userObj) return '';
    return userObj.nom_utilisateur
      || userObj.username
      || userObj.userName
      || userObj.name
      || '';
  };

  const loadUserPublications = useCallback(async () => {
    const currentUser = getCurrentUser();
    const userId = resolveUserId(currentUser);

    if (!userId) {
      console.log('❌ Pas d\'utilisateur connecté (loadUserPublications)');
      return;
    }

    console.log('🔍 Chargement des articles pour utilisateur ID:', userId);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/articles/utilisateur/${userId}`);
      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} articles trouvés`);
        setPublications(response.data);
      } else {
        setPublications([]);
      }
    } catch (err) {
      console.error('❌ Erreur chargement articles:', err.message);
      setPublications([]);
    }
  }, []);

  const loadReservations = useCallback(async (showLoading = false) => {
    const currentUser = getCurrentUser();
    const userId = resolveUserId(currentUser);

    if (!userId) {
      console.error('❌ Impossible de charger les réservations: utilisateur non connecté');
      setReservationsSki([]);
      setReservationsRandonnee([]);
      setReservationsEscalade([]);
      return;
    }

    console.log(`🔍 Chargement des réservations pour utilisateur ID: ${userId}`);
    if (showLoading) setLoadingReservations(true);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/reservations/user/${userId}`);
      console.log('📊 Réservations reçues:', response.data);

      if (Array.isArray(response.data)) {
        setReservationsSki(response.data.filter(res => res.type === 'ski'));
        setReservationsRandonnee(response.data.filter(res => res.type === 'randonnee'));
        setReservationsEscalade(response.data.filter(res => res.type === 'escalade'));
      } else {
        setReservationsSki([]);
        setReservationsRandonnee([]);
        setReservationsEscalade([]);
      }
    } catch (err) {
      console.error('❌ Erreur chargement réservations:', err.message);
      setReservationsSki([]);
      setReservationsRandonnee([]);
      setReservationsEscalade([]);
    } finally {
      if (showLoading) setLoadingReservations(false);
    }
  }, []);

  // ✅ FIX PRINCIPAL : handlePublishArticle avec id robuste
  const handlePublishArticle = async (e) => {
    e.preventDefault();

    if (!newPublication.titre || !newPublication.contenu) {
      alert('Le titre et le contenu sont requis');
      return;
    }

    const currentUser = getCurrentUser();
    const userId = resolveUserId(currentUser);

    console.log('👤 currentUser complet:', currentUser);
    console.log('🔑 userId résolu:', userId);

    if (!userId) {
      alert('❌ Impossible de récupérer votre ID utilisateur. Reconnectez-vous.');
      console.error('❌ Clés disponibles dans currentUser:', currentUser ? Object.keys(currentUser) : 'null');
      return;
    }

    setPublishing(true);
    try {
      const payload = {
        titre: newPublication.titre,
        contenu: newPublication.contenu,
        auteur_id: userId,
        lieu: newPublication.lieu || '',
        type: newPublication.type || 'récit'
      };

      console.log('📤 Payload envoyé:', payload);

      const response = await axios.post(`${API_BASE_URL}/api/articles`, payload);

      if (response.status === 201) {
        alert('✅ Article publié avec succès !');
        setShowPublicationForm(false);
        setNewPublication({ titre: '', contenu: '', lieu: '', type: 'récit' });
        await loadUserPublications();
      }
    } catch (error) {
      console.error('Erreur publication:', error);
      const msg = error.response?.data?.error
        || error.response?.data?.message
        || error.message;
      alert('❌ Erreur lors de la publication: ' + msg);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      console.log('❌ Aucun utilisateur connecté, redirection vers login');
      navigate('/login');
      return;
    }

    console.log('👤 Utilisateur connecté:', currentUser);

    try {
      const username = resolveUsername(currentUser);
      if (!username) throw new Error('Nom utilisateur invalide');

      const updatedUser = {
        ...currentUser,
        nom_utilisateur: username,
        date_inscription: currentUser.date_inscription
          || currentUser.created_at
          || currentUser.createdAt
          || new Date().toISOString()
      };

      setUser(updatedUser);
      setEditData({ nom_utilisateur: username, email: currentUser.email || '' });

      loadUserPublications();
      loadReservations(false);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate, loadReservations, loadUserPublications]);

  useEffect(() => {
    if (lastUpdate) {
      loadReservations(false);
    }
  }, [lastUpdate, loadReservations]);

  const cancelReservation = async (reservationId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette réservation ?')) return;

    const currentUser = getCurrentUser();
    const userId = resolveUserId(currentUser);

    if (!userId) {
      alert('Vous devez être connecté');
      return;
    }

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/reservations/${reservationId}`, {
        data: { userId }
      });

      if (response.data.success) {
        alert('✅ Réservation annulée avec succès');
        setReservationsSki(prev => prev.filter(r => r.id !== reservationId));
        setReservationsRandonnee(prev => prev.filter(r => r.id !== reservationId));
        setReservationsEscalade(prev => prev.filter(r => r.id !== reservationId));
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

  const handleChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const handlePublicationChange = (e) => setNewPublication({ ...newPublication, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!editData.nom_utilisateur || !editData.email) {
      alert('Nom utilisateur et email obligatoires');
      return;
    }

    setSaving(true);
    try {
      const currentUser = getCurrentUser();
      const userId = resolveUserId(currentUser);

      if (!userId) throw new Error('Utilisateur non connecté');

      const response = await axios.put(`${API_BASE_URL}/api/users/${userId}`, {
        nom_utilisateur: editData.nom_utilisateur,
        email: editData.email
      });

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
      alert('❌ Erreur: ' + (error.response?.data?.error || error.message));
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
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return 'Date non disponible'; }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch { return 'N/A'; }
  };

  // ─── Styles partagés ───────────────────────────────────────
  const tabStyle = (tab) => ({
    border: 'none',
    background: 'none',
    borderBottom: activeTab === tab ? '2px solid #000' : '2px solid transparent',
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 600 : 400,
    padding: '0.5rem 0',
    fontSize: '0.9rem',
    color: activeTab === tab ? '#000' : '#555',
    transition: 'all 0.2s'
  });

  const cardStyle = {
    padding: '1.5rem',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: 'white'
  };

  const emptyStateStyle = {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '1px solid #e8e8e8'
  };

  const btnPrimary = {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  };

  const btnDanger = {
    padding: '0.5rem 1rem',
    border: '1px solid #ef4444',
    color: '#ef4444',
    backgroundColor: 'transparent',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  };

  const statusBadge = {
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    whiteSpace: 'nowrap'
  };

  // ─── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #e5e5e5', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
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
        <button onClick={() => navigate('/login')} style={{ ...btnPrimary, marginTop: '1rem' }}>
          Se connecter
        </button>
      </div>
    );
  }

  const totalReservations = reservationsSki.length + reservationsRandonnee.length + reservationsEscalade.length;

  // ─── Composant carte réservation ──────────────────────────
  const ReservationCard = ({ res, typeLabel, typeColor, defaultImg }) => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={res.image_url || defaultImg}
              alt={res.activite_nom}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.target.src = defaultImg; }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ padding: '0.25rem 0.5rem', background: '#e5e5e5', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', color: typeColor }}>
                {typeLabel}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{res.activite_nom}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', fontSize: '0.875rem', color: '#666' }}>
              <div><span style={{ fontWeight: '500' }}>Date :</span> {formatShortDate(res.date_reservation)}</div>
              <div><span style={{ fontWeight: '500' }}>Personnes :</span> {res.nb_personnes || 1}</div>
              <div><span style={{ fontWeight: '500' }}>Lieu :</span> {res.lieu || 'Non spécifié'}</div>
              {res.difficulte && <div><span style={{ fontWeight: '500' }}>Difficulté :</span> {res.difficulte}</div>}
              {res.duree && <div><span style={{ fontWeight: '500' }}>Durée :</span> {res.duree}</div>}
              {res.prix && <div><span style={{ fontWeight: '500' }}>Prix :</span> {res.prix}€</div>}
            </div>
            {res.details && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f5f5f5', borderRadius: '6px', fontSize: '0.8rem' }}>
                {res.details.niveau && <div style={{ marginBottom: '0.4rem' }}><span style={{ fontWeight: '500' }}>Niveau :</span> {res.details.niveau}</div>}
                {res.details.prixTotal && <div style={{ fontWeight: '500' }}>Total : {res.details.prixTotal}€</div>}
                {res.details.options && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {Object.entries(res.details.options).map(([key, value]) =>
                      value && key !== 'forfaitSki' ? (
                        <span key={key} style={{ background: '#e5e5e5', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                          {key === 'coursSki' ? '📚 Cours' :
                           key === 'locationMateriel' ? '🎿 Location' :
                           key === 'assurance' ? '🛡️ Assurance' :
                           key === 'parking' ? '🅿️ Parking' :
                           key === 'garderie' ? '🧸 Garderie' :
                           key === 'restauration' ? '🍽️ Restauration' :
                           key === 'guide' ? '🧭 Guide' : key}
                        </span>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <span style={statusBadge}>{res.statut || 'Confirmée'}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
        <button onClick={() => cancelReservation(res.id)} style={btnDanger}>Annuler</button>
      </div>
    </div>
  );

  // ─── Composant onglet réservations ────────────────────────
  const ReservationsTab = ({ reservations, type, label, navigateTo, typeColor, defaultImg }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Mes {label}</h2>
        <button onClick={() => navigate(navigateTo)} style={btnPrimary}>
          ➕ Réserver
        </button>
      </div>
      {loadingReservations ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e5e5e5', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: '#666' }}>Chargement...</p>
        </div>
      ) : reservations.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Aucune réservation pour l'instant</p>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>Découvrez nos offres !</p>
          <button onClick={() => navigate(navigateTo)} style={btnPrimary}>Voir les offres</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {reservations.map(res => (
            <ReservationCard
              key={res.id}
              res={res}
              typeLabel={type}
              typeColor={typeColor}
              defaultImg={defaultImg}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ─── RENDER ────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 200px)' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* En-tête profil */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#333', flexShrink: 0, border: '2px solid #e0e0e0' }}>
          {user.nom_utilisateur?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: '600' }}>{user.nom_utilisateur}</h1>
          <p style={{ color: '#555', marginBottom: '0.25rem' }}>{user.email}</p>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>Membre depuis {formatDate(user.date_inscription)}</p>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            ID : {resolveUserId(user)} &nbsp;·&nbsp; {totalReservations} réservation{totalReservations !== 1 ? 's' : ''} &nbsp;·&nbsp; {publications.length} publication{publications.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
        {[
          { key: 'infos', label: 'Mes informations' },
          { key: 'publications', label: `Publications (${publications.length})` },
          { key: 'ski', label: `Ski (${reservationsSki.length})` },
          { key: 'randonnee', label: `Randonnées (${reservationsRandonnee.length})` },
          { key: 'escalade', label: `Escalade (${reservationsEscalade.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              if (['ski', 'randonnee', 'escalade'].includes(key)) loadReservations(true);
            }}
            style={tabStyle(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Infos ── */}
      {activeTab === 'infos' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Informations personnelles</h2>
            {!editing && (
              <button onClick={handleEdit} style={{ padding: '0.5rem 1rem', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}>
                ✏️ Modifier
              </button>
            )}
          </div>
          <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', border: '1px solid #e8e8e8' }}>
            {[
              { label: "Nom d'utilisateur", name: 'nom_utilisateur', type: 'text', value: user.nom_utilisateur },
              { label: 'Email', name: 'email', type: 'email', value: user.email },
            ].map(({ label, name, type, value }) => (
              <div key={name} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>{label}</label>
                {editing ? (
                  <input type={type} name={name} value={editData[name] || ''} onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                ) : (
                  <div style={{ padding: '0.75rem', backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '4px' }}>{value}</div>
                )}
              </div>
            ))}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#333' }}>Date d'inscription</label>
              <div style={{ padding: '0.75rem', backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', color: '#666' }}>
                {formatDate(user.date_inscription)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              {editing ? (
                <>
                  <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
                    {saving ? '💾 Enregistrement...' : '💾 Enregistrer'}
                  </button>
                  <button onClick={handleCancel} style={{ padding: '0.75rem 1.5rem', border: '1px solid #666', backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                    Annuler
                  </button>
                </>
              ) : (
                <button onClick={handleLogout} style={{ padding: '0.75rem 1.5rem', border: '1px solid #ef4444', backgroundColor: 'transparent', borderRadius: '4px', color: '#ef4444', cursor: 'pointer' }}>
                  Se déconnecter
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Onglet Publications ── */}
      {activeTab === 'publications' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Mes publications</h2>
            <button onClick={() => setShowPublicationForm(!showPublicationForm)}
              style={{ ...btnPrimary, backgroundColor: showPublicationForm ? '#666' : '#000' }}>
              {showPublicationForm ? '✖ Annuler' : '➕ Nouvelle publication'}
            </button>
          </div>

          {/* Formulaire */}
          {showPublicationForm && (
            <div style={{ backgroundColor: '#f9f9f9', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e0e0e0' }}>
              <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Publier un article</h3>
              <form onSubmit={handlePublishArticle}>
                {[
                  { label: 'Titre *', name: 'titre', type: 'text', placeholder: 'Titre de votre article', required: true },
                  { label: 'Lieu', name: 'lieu', type: 'text', placeholder: 'Où s\'est déroulée cette aventure ?' },
                ].map(({ label, name, type, placeholder, required }) => (
                  <div key={name} style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>{label}</label>
                    <input type={type} name={name} value={newPublication[name]} onChange={handlePublicationChange}
                      placeholder={placeholder} required={required}
                      style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }} />
                  </div>
                ))}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Contenu *</label>
                  <textarea name="contenu" value={newPublication.contenu} onChange={handlePublicationChange}
                    placeholder="Partagez votre expérience..." required
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '150px', resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type d'article</label>
                  <select name="type" value={newPublication.type} onChange={handlePublicationChange}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="récit">Récit d'aventure</option>
                    <option value="guide">Guide / Conseils</option>
                    <option value="article">Article général</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" disabled={publishing}
                    style={{ ...btnPrimary, opacity: publishing ? 0.7 : 1, cursor: publishing ? 'not-allowed' : 'pointer' }}>
                    {publishing ? 'Publication...' : 'Publier'}
                  </button>
                  <button type="button" onClick={() => setShowPublicationForm(false)}
                    style={{ padding: '0.75rem 1.5rem', backgroundColor: 'transparent', color: '#666', border: '1px solid #666', borderRadius: '4px', cursor: 'pointer' }}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste publications */}
          {publications.length === 0 ? (
            <div style={emptyStateStyle}>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Vous n'avez pas encore publié d'article</p>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>Partagez vos aventures avec la communauté !</p>
              <button onClick={() => setShowPublicationForm(true)} style={btnPrimary}>✍️ Créer mon premier article</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {publications.map(pub => (
                <div key={pub.id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '600', marginBottom: '0.4rem' }}>{pub.titre}</h3>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#666', flexWrap: 'wrap' }}>
                        <span>📍 {pub.lieu || 'Lieu non spécifié'}</span>
                        <span>📝 {pub.type || 'récit'}</span>
                        <span>📅 {formatShortDate(pub.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ color: '#444', lineHeight: '1.6', marginBottom: '1rem', fontSize: '0.9rem' }}>
                    {pub.contenu?.substring(0, 200)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/article/${pub.id}`}>
                      <button style={{ padding: '0.5rem 1.25rem', border: '1px solid #000', color: '#000', backgroundColor: 'transparent', borderRadius: '4px', cursor: 'pointer' }}
                        onMouseEnter={e => { e.target.style.backgroundColor = '#000'; e.target.style.color = 'white'; }}
                        onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#000'; }}>
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

      {/* ── Onglets Réservations ── */}
      {activeTab === 'ski' && (
        <ReservationsTab
          reservations={reservationsSki}
          type="SKI"
          label="séjours au ski"
          navigateTo="/ski"
          typeColor="#2c3e50"
          defaultImg="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop"
        />
      )}
      {activeTab === 'randonnee' && (
        <ReservationsTab
          reservations={reservationsRandonnee}
          type="RANDONNÉE"
          label="randonnées"
          navigateTo="/randonnee"
          typeColor="#2c7a2c"
          defaultImg="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop"
        />
      )}
      {activeTab === 'escalade' && (
        <ReservationsTab
          reservations={reservationsEscalade}
          type="ESCALADE"
          label="sessions d'escalade"
          navigateTo="/escalade"
          typeColor="#8B4513"
          defaultImg="https://images.unsplash.com/photo-1522163182402-834f875f7c3b?w=200&auto=format&fit=crop"
        />
      )}
    </div>
  );
};

export default Profile;