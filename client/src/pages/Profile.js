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

  useEffect(() => {
    // Récupérer l'utilisateur depuis localStorage
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      console.log('❌ Aucun utilisateur en localStorage, redirection vers login');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('👤 Utilisateur chargé depuis localStorage:', parsedUser.nom_utilisateur);
      setUser(parsedUser);
      setEditData({
        nom_utilisateur: parsedUser.nom_utilisateur,
        email: parsedUser.email
      });
      
      // Charger les publications de CET utilisateur spécifique
      axios.get(`https://aventures-alpines-production.up.railway.app/api/users/${parsedUser.nom_utilisateur}/articles`)
        .then(response => {
          console.log(`📝 ${response.data.length} publications chargées pour ${parsedUser.nom_utilisateur}`);
          // FILTRE : N'afficher que les publications RÉELLES (pas les tests)
          const realPublications = response.data.filter(pub => 
            pub.titre && pub.titre !== 'test' && 
            pub.contenu && pub.contenu !== 'test'
          );
          setPublications(realPublications);
        })
        .catch(error => {
          console.error('❌ Erreur chargement publications:', error.message);
          setPublications([]);
        });
    } catch (error) {
      console.error('❌ Erreur parsing user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    console.log('🚪 Déconnexion...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEdit = () => {
    console.log('✏️ Mode édition activé');
    setEditing(true);
  };

  const handleSave = async () => {
    console.log('💾 Sauvegarde du profil...');
    
    // Vérifier les données
    if (!editData.nom_utilisateur || !editData.email) {
      alert('Le nom d\'utilisateur et l\'email sont obligatoires');
      return;
    }
    
    setSaving(true);
    
    try {
      // Récupérer le token
      const token = localStorage.getItem('token');
      console.log('🔑 Token récupéré:', token ? token.substring(0, 20) + '...' : 'NULL');
      
      if (!token) {
        throw new Error('Token manquant. Veuillez vous reconnecter.');
      }
      
      console.log('📤 Données envoyées:', editData);
      console.log('📡 Envoi requête PUT...');
      
      const response = await axios.put(
        'https://aventures-alpines-production.up.railway.app/api/auth/profile', 
        editData, 
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Réponse serveur:', response.data);
      
      if (response.data.message && response.data.user && response.data.token) {
        // METTRE À JOUR le state
        setUser(response.data.user);
        
        // METTRE À JOUR le localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        console.log('🔄 Token et user mis à jour dans localStorage');
        
        // METTRE À JOUR le header globalement
        window.postMessage({
          type: 'USER_UPDATED',
          user: response.data.user
        }, '*');
        
        console.log('📢 Message USER_UPDATED envoyé', response.data.user);
        
        setEditing(false);
        alert('✅ Profil mis à jour avec succès !');
      } else {
        throw new Error('Réponse serveur invalide');
      }
      
    } catch (error) {
      console.error('❌ Erreur détaillée mise à jour profil:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      let errorMessage = 'Erreur lors de la mise à jour du profil';
      
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        switch (error.response.status) {
          case 401:
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            break;
          case 400:
            errorMessage = error.response.data?.error || 'Données invalides';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          default:
            errorMessage = `Erreur ${error.response.status}: ${error.response.data?.error || 'Erreur inconnue'}`;
        }
      } else if (error.request) {
        // La requête a été faite mais pas de réponse
        errorMessage = 'Pas de réponse du serveur. Vérifiez votre connexion.';
      } else {
        // Erreur de configuration
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}`);
      
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ Annulation des modifications');
    setEditData({
      nom_utilisateur: user.nom_utilisateur,
      email: user.email
    });
    setEditing(false);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center' 
      }}>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Vérifier si c'est un nouveau compte (moins de 24h)
  const isNewAccount = user.date_inscription ? 
    (Date.now() - new Date(user.date_inscription).getTime()) < 24 * 60 * 60 * 1000 : 
    true;

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem 1rem',
      minHeight: 'calc(100vh - 200px)' 
    }}>
      {/* En-tête du profil */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem', 
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#333'
        }}> 
          {user.nom_utilisateur?.charAt(0).toUpperCase() || 'U'}
        </div> 
        
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: '2rem', 
            marginBottom: '0.5rem',
            fontWeight: '600'
          }}>
            {user.nom_utilisateur}
          </h1><br></br>
          <p style={{ 
            color: '#666', 
            marginBottom: '0.5rem',
            fontSize: '1rem'
          }}>
            {user.email}
          </p>
          <p style={{ 
            color: '#888', 
            fontSize: '0.875rem' 
          }}>
            Membre depuis {user.date_inscription ? 
              new Date(user.date_inscription).toLocaleDateString('fr-FR') : 
              'récemment'}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <button
          onClick={() => setActiveTab('infos')}
          style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'infos' ? '2px solid #000' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'infos' ? '600' : '400',
            fontSize: '1rem',
            color: activeTab === 'infos' ? '#000' : '#666'
          }}
        >
          Mes informations
        </button>
        <button
          onClick={() => setActiveTab('publications')}
          style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'publications' ? '2px solid #000' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'publications' ? '600' : '400',
            fontSize: '1rem',
            color: activeTab === 'publications' ? '#000' : '#666'
          }}
        >
          Mes publications ({publications.length})
        </button>
        <button
          onClick={() => setActiveTab('activites')}
          style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'activites' ? '2px solid #000' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'activites' ? '600' : '400',
            fontSize: '1rem',
            color: activeTab === 'activites' ? '#000' : '#666'
          }}
        >
          Activités réservées
        </button>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'infos' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Informations personnelles
              </h2>
              {!editing && (
                <button
                  onClick={handleEdit}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #666',
                    color: '#666',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem'
                  }}
                >
                  ✏️ Modifier
                </button>
              )}
            </div>
            
            <div style={{ 
              backgroundColor: '#f9f9f9', 
              padding: '2rem',
              borderRadius: '8px'
            }}>
              {/* Nom d'utilisateur */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Nom d'utilisateur
                </label>
                {editing ? (
                  <input
                    type="text"
                    name="nom_utilisateur"
                    value={editData.nom_utilisateur}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      color: '#333'
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    color: '#333'
                  }}>
                    {user.nom_utilisateur}
                  </div>
                )}
              </div>
              
              {/* Email */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Email
                </label>
                {editing ? (
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      color: '#333'
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    color: '#333'
                  }}>
                    {user.email}
                  </div>
                )}
              </div>
              
              {/* Date d'inscription (lecture seule) */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Date d'inscription
                </label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  {user.date_inscription ? 
                    new Date(user.date_inscription).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 
                    'Date non disponible'}
                </div>
              </div>
              
              {/* Boutons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: saving ? '#666' : '#000',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '1rem',
                        opacity: saving ? 0.7 : 1
                      }}
                    >
                      {saving ? '💾 Enregistrement...' : '💾 Enregistrer'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #666',
                        color: '#666',
                        borderRadius: '4px',
                        cursor: saving ? 'not-allowed' : 'pointer',
                        fontWeight: '500',
                        fontSize: '1rem',
                        opacity: saving ? 0.7 : 1
                      }}
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      border: '1px solid #ef4444',
                      color: '#ef4444',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      fontSize: '1rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fee';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    Se déconnecter
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publications' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Mes publications
              </h2>
              <Link 
                to="/blog/new" 
                style={{ 
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                <button style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#000';
                }}>
                  ✏️ Nouvelle publication
                </button>
              </Link>
            </div>
            
            {publications.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                marginTop: '2rem'
              }}>
                <p style={{ 
                  fontSize: '1.125rem', 
                  marginBottom: '1rem',
                  color: '#333'
                }}>
                  {isNewAccount ? `👋 Bienvenue ${user.nom_utilisateur} !` : `Bonjour ${user.nom_utilisateur} !`}
                </p>
                <p style={{ 
                  color: '#666', 
                  marginBottom: '2rem',
                  fontSize: '1rem'
                }}>
                  {isNewAccount 
                    ? 'Commencez votre aventure en partageant votre première expérience en montagne !' 
                    : 'Partagez votre prochaine aventure avec la communauté !'}
                </p>
                <Link to="/blog/new" style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '1rem',
                    transition: 'background-color 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#000';
                  }}>
                    {isNewAccount ? 'Publier mon premier article' : 'Nouvelle publication'}
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gap: '1.5rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
              }}>
                {publications.map(pub => (
                  <div 
                    key={pub.id} 
                    style={{
                      padding: '1.5rem',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 style={{ 
                      marginBottom: '0.75rem',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {pub.titre}
                    </h3>
                    <p style={{ 
                      color: '#555', 
                      marginBottom: '1rem',
                      lineHeight: 1.5,
                      fontSize: '0.95rem'
                    }}>
                      {pub.contenu.length > 150 
                        ? `${pub.contenu.substring(0, 150)}...` 
                        : pub.contenu}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#666',
                      marginTop: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid #f0f0f0'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        📍 {pub.lieu || 'Lieu non spécifié'}
                      </span>
                      <span>
                        {new Date(pub.date_publication).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '1rem'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#f0f0f0',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        color: '#666'
                      }}>
                        {pub.type || 'récit'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activites' && (
          <div>
            <h2 style={{ 
              marginBottom: '1.5rem',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Mes activités réservées
            </h2>
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <p style={{ 
                fontSize: '1.125rem', 
                marginBottom: '1rem',
                color: '#333'
              }}>
                Vous n'avez pas encore réservé d'activité
              </p>
              <p style={{ 
                color: '#666', 
                marginBottom: '2rem',
                fontSize: '1rem'
              }}>
                Découvrez nos activités en montagne et réservez votre prochaine aventure !
              </p>
              <button 
                onClick={() => navigate('/activities')}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '1rem',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#000';
                }}
              >
                Découvrir les activités
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
