import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('infos');
  
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Charger les données du profil
    axios.get('http://localhost:5000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(response => {
        setUser(response.data.user);
        // Charger les publications de l'utilisateur
        return axios.get(`http://localhost:5000/api/users/${response.data.user.id}/publications`);
      })
      .then(response => {
        setPublications(response.data);
      })
      .catch(error => {
        console.error('Erreur chargement profil:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div>Chargement du profil...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* En-tête du profil */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem', 
        marginBottom: '3rem',
        paddingBottom: '2rem',
        borderBottom: '1px solid var(--gray-light)'
      }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'var(--gray-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem'
        }}>
          {user.nom_utilisateur?.charAt(0).toUpperCase()}
        </div>
        
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {user.nom_utilisateur}
          </h1><br></br>
          <p style={{ color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>
            📧 {user.email}
          </p>
          <p style={{ color: 'var(--gray-medium)', fontSize: '0.875rem' }}>
            Membre depuis {new Date(user.date_inscription).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ 
        display: 'flex', 
        gap: '2rem', 
        marginBottom: '2rem',
        borderBottom: '1px solid var(--gray-light)'
      }}>
        <button
          onClick={() => setActiveTab('infos')}
          style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'infos' ? '2px solid #000' : '2px solid transparent',
            cursor: 'pointer',
            fontWeight: activeTab === 'infos' ? '600' : '400'
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
            fontWeight: activeTab === 'publications' ? '600' : '400'
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
            fontWeight: activeTab === 'activites' ? '600' : '400'
          }}
        >
          Activités réservées
        </button>
      </div>

      {/* Contenu des onglets */}
      <div>
        {activeTab === 'infos' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Informations personnelles</h2>
            <div style={{ 
              backgroundColor: 'var(--gray-50)', 
              padding: '2rem',
              borderRadius: '8px'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Nom d'utilisateur
                </label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '4px'
                }}>
                  {user.nom_utilisateur}
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Email
                </label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '4px'
                }}>
                  {user.email}
                </div>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Date d'inscription
                </label>
                <div style={{ 
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  border: '1px solid var(--gray-light)',
                  borderRadius: '4px'
                }}>
                  {new Date(user.date_inscription).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
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
              <h2>Mes publications</h2>
              {/* BOUTON FONCTIONNEL : Nouvelle publication */}
              <Link to="/blog/new" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  + Nouvelle publication
                </button>
              </Link>
            </div>
            
            {publications.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '8px'
              }}>
                <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                  Vous n'avez pas encore publié d'expérience
                </p>
                {/* BOUTON FONCTIONNEL : Publier première expérience */}
                <Link to="/blog/new" style={{ textDecoration: 'none' }}>
                  <button style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#000',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}>
                    Publier ma première expérience
                  </button>
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {publications.map(pub => (
                  <div key={pub.id} style={{
                    padding: '1.5rem',
                    border: '1px solid var(--gray-light)',
                    borderRadius: '8px'
                  }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{pub.titre}</h3>
                    <p style={{ 
                      color: 'var(--gray-dark)', 
                      marginBottom: '1rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {pub.contenu}
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: 'var(--gray-medium)'
                    }}>
                      <span>{pub.lieu}</span>
                      <span>{new Date(pub.date_publication).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activites' && (
          <div>
            <h2 style={{ marginBottom: '1.5rem' }}>Mes activités réservées</h2>
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              backgroundColor: 'var(--gray-50)',
              borderRadius: '8px'
            }}>
              <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
                Vous n'avez pas encore réservé d'activité
              </p>
              <button 
                onClick={() => navigate('/activities')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
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