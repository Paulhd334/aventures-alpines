import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    nom_utilisateur: '',
    email: '',
    mot_de_passe: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setSuccess('');

    // Validation
    if (formData.mot_de_passe !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.mot_de_passe.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        nom_utilisateur: formData.nom_utilisateur,
        email: formData.email,
        mot_de_passe: formData.mot_de_passe
      });

      // Connexion automatique après inscription
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccess('Inscription réussie ! Redirection...');
      
      // Redirection après 2 secondes
      setTimeout(() => {
        navigate('/');
        window.location.reload();
      }, 2000);

    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erreur lors de l\'inscription';
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
          Inscription
        </h1>
        
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--gray-dark)',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}> <br></br>
          Créez votre compte pour accéder à toutes les fonctionnalités d'Aventures Alpines
        </p>

        {/* Messages d'erreur/succès */}
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

        {success && (
          <div style={{
            backgroundColor: '#efe',
            color: '#3a3',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Nom d'utilisateur */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: 'var(--gray-dark)'
            }}>
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              name="nom_utilisateur"
              value={formData.nom_utilisateur}
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
          <div style={{ marginBottom: '1.5rem' }}>
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

          {/* Confirmation mot de passe */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: 'var(--gray-dark)'
            }}>
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
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

          {/* Bouton d'inscription */}
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
            {loading ? 'Inscription en cours...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Lien vers connexion */}
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
            Déjà un compte ?
          </p>
          <Link 
            to="/login"
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
            Se connecter
          </Link>
        </div>

        {/* Conditions */}
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--gray-medium)',
          marginTop: '2rem',
          textAlign: 'center',
          lineHeight: 1.6
        }}>
          En créant un compte, vous acceptez nos Conditions d'utilisation 
          et notre Politique de confidentialité.
        </p>
      </div>
    </div>
  );
};

export default Register;