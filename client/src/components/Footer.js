// Footer component - Version noir et blanc 
import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--white)',
      borderTop: '1px solid var(--gray-light)',
      padding: '4rem 0',
      marginTop: '4rem'
    }}>
      <div className="container">
        {/* Structure architecturale */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem'
        }}>
          
          {/* Logo minimaliste */}
          <div style={{
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 300,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--black-soft)',
              marginBottom: '0.5rem'
            }}>
             AVENTURE ALPINES
            </div>
            <div style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'var(--black)',
              margin: '0 auto'
            }}></div>
          </div>


            
            {/* Badges technologiques */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0.5rem',
              margin: '1rem 0'
            }}>
              {['React', 'Node.js', 'Express', 'MySQL', 'JavaScript'].map((tech, index) => (
                <span 
                  key={index}
                  style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.75rem',
                    border: '1px solid var(--gray-light)',
                    color: 'var(--gray-dark)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = 'var(--black)';
                    e.target.style.color = 'var(--black)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = 'var(--gray-light)';
                    e.target.style.color = 'var(--gray-dark)';
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Copyright */}
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--gray-medium)',
              letterSpacing: '0.05em',
              marginTop: '1rem'
            }}>
              <div style={{ marginBottom: '0.25rem' }}>
                © {new Date().getFullYear()} — AVENTURE APINES
              </div>
 
            </div>
          </div>
      </div>
    </footer>
  );
};

export default Footer;