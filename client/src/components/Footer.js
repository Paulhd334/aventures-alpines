// Footer component 
import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#34495e',
      color: 'white',
      padding: '30px 20px',
      marginTop: '50px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          &copy; 2024 Aventures Alpines - Projet BTS SLAM
        </p>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
          Site éducatif développé avec React, Node.js et Express
        </p>
        <div style={{ marginTop: '20px' }}>
          <span style={{ margin: '0 10px', opacity: 0.7 }}>⛷️ Ski</span>
          <span style={{ margin: '0 10px', opacity: 0.7 }}>🥾 Randonnée</span>
          <span style={{ margin: '0 10px', opacity: 0.7 }}>🧗‍♂️ Escalade</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;