import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = localStorage.getItem('token') !== null;
  const userName = isLoggedIn ? JSON.parse(localStorage.getItem('user'))?.nom_utilisateur : null;

  const navItems = [
    { path: '/', label: 'Accueil' },
    { path: '/activities', label: 'Activités' },
    { path: '/blog', label: 'Blog' },
    { path: '/contact', label: 'Contact' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <header className="navbar bg-white border-b border-gray-light">
      <div className="container">
        <div className="flex items-center justify-between min-h-[80px]">
          
          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div className="text-xl font-light tracking-tight leading-none">
              AVENTURE
            </div>
            <div className="text-xs text-gray-dark uppercase mt-1" 
                 style={{ letterSpacing: '0.25em' }}>
              ALPINES
            </div>
          </Link>

          {/* Navigation */}
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              
              return (
                <div key={index} style={{ position: 'relative' }}>
                  <Link
                    to={item.path}
                    style={{ 
                      padding: '1.5rem 2.5rem',
                      textDecoration: 'none',
                      display: 'block',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        const line = e.currentTarget.querySelector('.nav-hover-line');
                        if (line) {
                          line.style.width = '80px';
                          line.style.opacity = '1';
                        }
                        e.currentTarget.querySelector('.nav-text').style.color = '#000';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        const line = e.currentTarget.querySelector('.nav-hover-line');
                        if (line) {
                          line.style.width = '0px';
                          line.style.opacity = '0';
                        }
                        e.currentTarget.querySelector('.nav-text').style.color = 'var(--gray-dark)';
                      }
                    }}
                  >
                    <span 
                      className="nav-text"
                      style={{ 
                        fontSize: '0.875rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        fontWeight: isActive ? '500' : '300',
                        color: isActive ? '#000' : 'var(--gray-dark)',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {item.label}
                    </span>
                    
                    {isActive && (
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '30px',
                          height: '1px',
                          backgroundColor: '#000'
                        }}
                      ></div>
                    )}
                    
                    {!isActive && (
                      <div 
                        className="nav-hover-line"
                        style={{
                          position: 'absolute',
                          bottom: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0px',
                          height: '1px',
                          backgroundColor: '#000',
                          opacity: 0,
                          transition: 'width 0.3s ease, opacity 0.3s ease'
                        }}
                      ></div>
                    )}
                  </Link>
                </div>
              );
            })}
            
            {/* Lien vers Profile (uniquement si connecté) */}
            {isLoggedIn && (
              <div style={{ position: 'relative', marginLeft: '1rem' }}>
                <Link
                  to="/profile"
                  style={{ 
                    padding: '1.5rem 2.5rem',
                    textDecoration: 'none',
                    display: 'block',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    const line = e.currentTarget.querySelector('.nav-hover-line');
                    if (line) {
                      line.style.width = '80px';
                      line.style.opacity = '1';
                    }
                    e.currentTarget.querySelector('.nav-text').style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    const line = e.currentTarget.querySelector('.nav-hover-line');
                    if (line) {
                      line.style.width = '0px';
                      line.style.opacity = '0';
                    }
                    e.currentTarget.querySelector('.nav-text').style.color = 'var(--gray-dark)';
                  }}
                >
                  <span 
                    className="nav-text"
                    style={{ 
                      fontSize: '0.875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      fontWeight: location.pathname === '/profile' ? '500' : '300',
                      color: location.pathname === '/profile' ? '#000' : 'var(--gray-dark)',
                      transition: 'color 0.3s ease'
                    }}
                  >
                    {userName}
                  </span>
                  
                  {location.pathname === '/profile' && (
                    <div 
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '30px',
                        height: '1px',
                        backgroundColor: '#000'
                      }}
                    ></div>
                  )}
                  
                  {location.pathname !== '/profile' && (
                    <div 
                      className="nav-hover-line"
                      style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '0px',
                        height: '1px',
                        backgroundColor: '#000',
                        opacity: 0,
                        transition: 'width 0.3s ease, opacity 0.3s ease'
                      }}
                    ></div>
                  )}
                </Link>
              </div>
            )}
          </nav>

          {/* Section authentification */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  padding: '0.5rem 1rem',
                  border: '1px solid var(--gray-light)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#000';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-light)';
                  e.currentTarget.style.color = 'var(--gray-dark)';
                }}
              >
                Déconnexion
              </button>
            ) : (
              <>
                <Link 
                  to="/login"
                  style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    padding: '0.5rem 1rem',
                    textDecoration: 'none',
                    color: 'var(--gray-dark)',
                    border: '1px solid var(--gray-light)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#000';
                    e.currentTarget.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gray-light)';
                    e.currentTarget.style.color = 'var(--gray-dark)';
                  }}
                >
                  Connexion
                </Link>
                <Link 
                  to="/register"
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
    </header>
  );
};

export default Header;