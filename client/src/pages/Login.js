import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: formData.email,
        mot_de_passe: formData.mot_de_passe
      });

      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirection vers la page d'accueil
      navigate('/');
      window.location.reload(); // Pour mettre à jour l'état d'authentification
      
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur de connexion';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 160px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        border: '1px solid var(--gray-light)',
        padding: '3rem 2.5rem'
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 300,
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Connexion
        </h1>
        
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--gray-dark)',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}> <br></br>
          Connectez-vous à votre compte pour accéder à votre espace personnel
        </p> 

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: 'var(--gray-dark)'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid var(--gray-light)',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-light)';
              }}
            />
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: 'var(--gray-dark)'
            }}>
              Mot de passe *
            </label>
            <input
              type="password"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid var(--gray-light)',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#000';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--gray-light)';
              }}
            />
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading ? 'var(--gray-light)' : '#000',
              color: 'white',
              border: 'none',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#333';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#000';
              }
            }}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers inscription */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--gray-light)'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--gray-dark)',
            marginBottom: '0.5rem'
          }}>
            Pas encore de compte ?
          </p>
          <Link 
            to="/register"
            style={{
              fontSize: '0.875rem',
              textDecoration: 'none',
              color: '#000',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderBottomColor = '#000';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderBottomColor = 'transparent';
            }}
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;