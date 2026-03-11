import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:5000';

  // Charger l'utilisateur et ses publications
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const username = parsedUser.nom_utilisateur || parsedUser.username || parsedUser.userName || parsedUser.name;
      if (!username) throw new Error('Nom utilisateur invalide');

      const updatedUser = { ...parsedUser, nom_utilisateur: username };
      setUser(updatedUser);
      setEditData({ nom_utilisateur: username, email: parsedUser.email || '' });

      // Charger toutes les publications
      axios.get(`${API_BASE_URL}/api/articles`)
        .then(response => {
          if (Array.isArray(response.data)) {
            const userPubs = response.data.filter(pub => {
              const auteurUsername = pub.auteur?.nom_utilisateur || pub.auteur?.username || pub.username;
              const auteurId = pub.auteur_id || pub.userId || pub.auteur?.id;
              return auteurUsername === username || auteurId === parsedUser.id;
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
      console.error('Erreur parsing user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

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
      alert('Profil mis à jour !');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      alert('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center' }}>Chargement...</div>;
  if (!user) return <div style={{ padding: '3rem', textAlign: 'center' }}>Utilisateur non trouvé</div>;

  const isNewAccount = user.date_inscription ? (Date.now() - new Date(user.date_inscription)) < 24*60*60*1000 : true;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', minHeight: 'calc(100vh - 200px)' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>
          {user.nom_utilisateur?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: '600' }}>{user.nom_utilisateur}</h1>
          <p style={{ color: '#666', marginBottom: '0.5rem', fontSize: '1rem' }}>{user.email}</p>
          <p style={{ color: '#888', fontSize: '0.875rem' }}>Membre depuis {user.date_inscription ? new Date(user.date_inscription).toLocaleDateString('fr-FR') : 'récemment'}</p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #e0e0e0' }}>
        <button onClick={() => setActiveTab('infos')} style={{ border: 'none', background: 'none', borderBottom: activeTab==='infos'?'2px solid #000':'2px solid transparent', cursor:'pointer', fontWeight: activeTab==='infos'?600:400 }}>Mes informations</button>
        <button onClick={() => setActiveTab('publications')} style={{ border: 'none', background: 'none', borderBottom: activeTab==='publications'?'2px solid #000':'2px solid transparent', cursor:'pointer', fontWeight: activeTab==='publications'?600:400 }}>Mes publications ({publications.length})</button>
        <button onClick={() => setActiveTab('activites')} style={{ border: 'none', background: 'none', borderBottom: activeTab==='activites'?'2px solid #000':'2px solid transparent', cursor:'pointer', fontWeight: activeTab==='activites'?600:400 }}>Activités réservées</button>
      </div>

      {/* Contenu onglets */}
      <div>
        {/* Infos personnelles */}
        {activeTab==='infos' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:'600' }}>Informations personnelles</h2>
              {!editing && <button onClick={handleEdit} style={{ padding:'0.5rem 1rem', border:'1px solid #666', borderRadius:'4px', cursor:'pointer' }}>✏️ Modifier</button>}
            </div>
            <div style={{ backgroundColor:'#f9f9f9', padding:'2rem', borderRadius:'8px' }}>
              <div style={{ marginBottom:'1.5rem' }}>
                <label>Nom d'utilisateur</label>
                {editing ? <input type="text" name="nom_utilisateur" value={editData.nom_utilisateur} onChange={handleChange} style={{ width:'100%', padding:'0.75rem' }} /> : <div style={{ padding:'0.75rem', backgroundColor:'white' }}>{user.nom_utilisateur}</div>}
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label>Email</label>
                {editing ? <input type="email" name="email" value={editData.email} onChange={handleChange} style={{ width:'100%', padding:'0.75rem' }} /> : <div style={{ padding:'0.75rem', backgroundColor:'white' }}>{user.email}</div>}
              </div>
              <div style={{ marginBottom:'2rem' }}>
                <label>Date d'inscription</label>
                <div style={{ padding:'0.75rem', backgroundColor:'#f5f5f5', borderRadius:'4px', color:'#666', fontStyle:'italic' }}>
                  {user.date_inscription ? new Date(user.date_inscription).toLocaleDateString('fr-FR', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : 'Date non disponible'}
                </div>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                {editing ? (
                  <>
                    <button onClick={handleSave} disabled={saving} style={{ padding:'0.75rem 1.5rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'4px', cursor:'pointer' }}>{saving ? '💾 Enregistrement...' : '💾 Enregistrer'}</button>
                    <button onClick={handleCancel} style={{ padding:'0.75rem 1.5rem', border:'1px solid #666', borderRadius:'4px', cursor:'pointer' }}>Annuler</button>
                  </>
                ) : (
                  <button onClick={handleLogout} style={{ padding:'0.75rem 1.5rem', border:'1px solid #ef4444', borderRadius:'4px', color:'#ef4444', cursor:'pointer' }}>Se déconnecter</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Publications */}
        {activeTab==='publications' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
              <h2 style={{ fontSize:'1.5rem', fontWeight:'600' }}>Mes publications</h2>
              <Link to="/blog/new"><button style={{ padding:'0.75rem 1.5rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>✏️ Nouvelle publication</button></Link>
            </div>
            {publications.length===0 ? (
              <div style={{ textAlign:'center', padding:'3rem', backgroundColor:'#f9f9f9', borderRadius:'8px', marginTop:'2rem' }}>
                <p>{isNewAccount ? `👋 Bienvenue ${user.nom_utilisateur} !` : `Bonjour ${user.nom_utilisateur} !`}</p>
                <p>{isNewAccount ? 'Commencez votre aventure en partageant votre première expérience en montagne !' : 'Partagez votre prochaine aventure !'}</p>
                <Link to="/blog/new"><button style={{ padding:'0.75rem 2rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>{isNewAccount ? 'Publier mon premier article' : 'Nouvelle publication'}</button></Link>
              </div>
            ) : (
              <div style={{ display:'grid', gap:'1.5rem', gridTemplateColumns:'repeat(auto-fill, minmax(400px,1fr))' }}>
                {publications.map(pub => (
                  <div key={pub.id || pub._id} style={{ padding:'1.5rem', border:'1px solid #e0e0e0', borderRadius:'8px', backgroundColor:'white' }}>
                    <h3 style={{ marginBottom:'0.75rem', fontSize:'1.25rem', fontWeight:'600' }}>{pub.titre}</h3>
                    <p style={{ color:'#555', lineHeight:1.5 }}>{pub.contenu?.length > 150 ? `${pub.contenu.substring(0,150)}...` : pub.contenu || 'Aucun contenu'}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.875rem', color:'#666', marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid #f0f0f0' }}>
                      <span>📍 {pub.lieu || 'Lieu non spécifié'}</span>
                      <span>{pub.date_publication ? new Date(pub.date_publication).toLocaleDateString('fr-FR') : 'Date non disponible'}</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1rem' }}>
                      <span style={{ fontSize:'0.75rem', backgroundColor:'#f0f0f0', padding:'0.25rem 0.75rem', borderRadius:'12px', color:'#666' }}>{pub.type || 'récit'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activités */}
        {activeTab==='activites' && (
          <div>
            <h2 style={{ marginBottom:'1.5rem', fontSize:'1.5rem', fontWeight:'600' }}>Mes activités réservées</h2>
            <div style={{ textAlign:'center', padding:'3rem', backgroundColor:'#f9f9f9', borderRadius:'8px' }}>
              <p>Vous n'avez pas encore réservé d'activité</p>
              <button onClick={() => navigate('/activities')} style={{ padding:'0.75rem 2rem', backgroundColor:'#000', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Découvrir les activités</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
