import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>🏔️ Aventures Alpines</h1>
          <p style={{ margin: '5px 0 0 0', opacity: 0.8, fontSize: '0.9rem' }}>
            Votre guide des sports de montagne
          </p>
        </div>
        
        <nav>
          <Link to="/" style={{ color: 'white', margin: '0 15px', textDecoration: 'none', fontWeight: '500' }}>
            Accueil
          </Link>
          <Link to="/activities" style={{ color: 'white', margin: '0 15px', textDecoration: 'none', fontWeight: '500' }}>
            Activités
          </Link>
          <Link to="/contact" style={{ color: 'white', margin: '0 15px', textDecoration: 'none', fontWeight: '500' }}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;