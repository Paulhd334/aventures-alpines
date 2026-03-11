import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMontagneOpen, setIsMontagneOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // ✅ ÉTAT utilisateur - Initialisé depuis localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  // ✅ ÉCOUTER tous les événements d'authentification
  useEffect(() => {
    console.log(' Header - Utilisateur actuel:', user);

    // 1. Écouter l'événement personnalisé 'user-login'
    const handleUserLogin = (event) => {
      console.log('🔄 Header: Événement login reçu', event.detail);
      const userData = event.detail || localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = typeof userData === 'string' ? JSON.parse(userData) : userData;
          setUser(parsed);
          console.log('✅ Header: Utilisateur mis à jour après login');
        } catch (e) {
          console.error('❌ Erreur parsing login:', e);
        }
      }
    };

    // 2. Écouter l'événement personnalisé 'user-register'
    const handleUserRegister = (event) => {
      console.log('🔄 Header: Événement register reçu', event.detail);
      const userData = event.detail || localStorage.getItem('user');
      if (userData) {
        try {
          const parsed = typeof userData === 'string' ? JSON.parse(userData) : userData;
          setUser(parsed);
          console.log('✅ Header: Utilisateur mis à jour après inscription');
        } catch (e) {
          console.error('❌ Erreur parsing register:', e);
        }
      }
    };

    // 3. Écouter l'événement personnalisé 'user-logout'
    const handleUserLogout = () => {
      console.log('🔄 Header: Événement logout reçu');
      setUser(null);
      console.log('✅ Header: Utilisateur déconnecté');
    };

    // 4. Écouter les changements localStorage (pour cross-tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        console.log('🔄 Header: Changement localStorage détecté');
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            setUser(parsed);
          } catch (e) {
            console.error('❌ Erreur parsing storage:', e);
          }
        } else {
          setUser(null);
        }
      }
    };

    // ✅ AJOUTER tous les écouteurs d'événements
    window.addEventListener('user-login', handleUserLogin);
    window.addEventListener('user-register', handleUserRegister);
    window.addEventListener('user-logout', handleUserLogout);
    window.addEventListener('storage', handleStorageChange);

    // ✅ NETTOYAGE
    return () => {
      window.removeEventListener('user-login', handleUserLogin);
      window.removeEventListener('user-register', handleUserRegister);
      window.removeEventListener('user-logout', handleUserLogout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Dépendances vides = exécuté 1 fois au montage

  // ✅ Vérifier si connecté
  const isLoggedIn = !!user;
  const userName = user?.username || user?.nom_utilisateur || user?.prenom || user?.nom || 'Mon Profil';

  // Fonction pour remonter en haut de la page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  };

  // Fonction pour gérer la navigation
  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      scrollToTop();
    }
  };

  // ✅ Fonction de déconnexion améliorée
  const handleLogout = () => {
    // Supprimer du localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('auth');
    
    // Mettre à jour l'état
    setUser(null);
    
    // Émettre l'événement logout
    window.dispatchEvent(new CustomEvent('user-logout'));
    
    // Scroll en haut
    scrollToTop();
    
    // Rediriger vers l'accueil
    navigate('/');
    
    console.log('✅ Déconnexion réussie');
  };

  // Tous les liens en UNE ligne
  const navItems = [
    { path: '/', label: 'Accueil' },
    { path: '/activities', label: 'Activités' },
    { path: '/articles', label: 'Articles' },
    { path: '/contact', label: 'Contact' },
    { 
      type: 'dropdown',
      label: 'Aventures',
      submenu: [
        { path: '/randonnee', label: 'Randonnée' },
        { path: '/escalade', label: 'Escalade' },
        { path: '/ski', label: 'Ski' },
        { path: '/Routes', label: 'Itinéraires' }
      ]
    },
  ];

  return (
    <header style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E8E8E8',
      padding: '1rem 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 2rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}>
          
          {/* Logo */}
          <Link 
            to="/" 
            style={{ textDecoration: 'none' }}
            onClick={() => handleNavigation('/')}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 300, letterSpacing: '-0.01em' }}>
              AVENTURES
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#7A7A7A', 
              textTransform: 'uppercase',
              marginTop: '0.25rem',
              letterSpacing: '0.25em'
            }}>
              ALPINES
            </div>
          </Link>

          {/* Menu Desktop - UNE SEULE LIGNE */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const isDropdown = item.type === 'dropdown';
              
              if (isDropdown) {
                return (
                  <div 
                    key={index} 
                    style={{ position: 'relative' }}
                    onMouseEnter={() => setIsMontagneOpen(true)}
                    onMouseLeave={() => setIsMontagneOpen(false)}
                  >
                    <div style={{ 
                      padding: '0 2rem',
                      cursor: 'pointer',
                      position: 'relative',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <span style={{ 
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: 300,
                        color: item.submenu?.some(sub => location.pathname === sub.path) ? '#000' : '#7A7A7A',
                        transition: 'color 0.3s ease'
                      }}>
                        {item.label}
                        <span style={{ fontSize: '0.7em', marginLeft: '0.5rem' }}>▼</span>
                      </span>
                    </div>

                    {/* Dropdown */}
                    {isMontagneOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        backgroundColor: '#FFFFFF',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #E8E8E8',
                        minWidth: '250px',
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease'
                      }}>
                        {item.submenu?.map((page, idx) => (
                          <Link
                            key={idx}
                            to={page.path}
                            onClick={() => {
                              handleNavigation(page.path);
                              setIsMontagneOpen(false);
                            }}
                            style={{
                              display: 'block',
                              padding: '1rem',
                              borderBottom: '1px solid #E8E8E8',
                              textDecoration: 'none',
                              color: '#2E2E2E',
                              fontSize: '0.875rem',
                              transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8F8F8'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                          >
                            {page.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <div key={index} style={{ position: 'relative' }}>
                  <Link
                    to={item.path}
                    onClick={() => handleNavigation(item.path)}
                    style={{ 
                      padding: '0 2rem',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      height: '60px',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.querySelector('.nav-text').style.color = '#000';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.querySelector('.nav-text').style.color = '#7A7A7A';
                      }
                    }}
                  >
                    <span 
                      className="nav-text"
                      style={{ 
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: isActive ? 500 : 300,
                        color: isActive ? '#000' : '#7A7A7A',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {item.label}
                    </span>
                    
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '30px',
                        height: '1px',
                        backgroundColor: '#000'
                      }}></div>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/*  Authentification - Mise à jour AUTOMATIQUE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isLoggedIn ? (
              <>
                {/* Nom utilisateur cliquable */}
                <Link
                  to="/profile"
                  onClick={() => handleNavigation('/profile')}
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: '#000',
                    border: '1px solid #000',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease',
                    fontWeight: 500
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#000';
                  }}
                >
                  {userName}
                </Link>
                
                {/* Bouton déconnexion */}
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0.5rem 1rem',
                    border: '1px solid #D9D9D9',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    color: '#7A7A7A'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#ff4444';
                    e.currentTarget.style.color = '#ff4444';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D9D9D9';
                    e.currentTarget.style.color = '#7A7A7A';
                  }}
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  onClick={() => handleNavigation('/login')}
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: '#7A7A7A',
                    border: '1px solid #D9D9D9',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#000';
                    e.currentTarget.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D9D9D9';
                    e.currentTarget.style.color = '#7A7A7A';
                  }}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register"
                  onClick={() => handleNavigation('/register')}
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    backgroundColor: '#000',
                    color: 'white',
                    border: '1px solid #000',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.borderColor = '#333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                    e.currentTarget.style.borderColor = '#000';
                  }}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Animation CSS inline */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;