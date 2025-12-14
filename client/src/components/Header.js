import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Accueil' },
    { path: '/activities', label: 'Activités' },
    { path: '/contact', label: 'Contact' },
  ];

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

          {/* Navigation - TOUT EN INLINE STYLES pour éviter les conflits */}
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
                    {/* Texte */}
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
                    
                    {/* Ligne active */}
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
                    
                    {/* Ligne au survol (cachée par défaut) */}
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
          </nav>

          {/* CTA caché sur mobile */}
          <div style={{ display: 'none' }}>
            <Link 
              to="/activities" 
              className="text-xs uppercase border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-300"
              style={{ letterSpacing: '0.2em' }}
            >
              Explorer
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;