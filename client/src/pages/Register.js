// Register.js - VERSION FINALE CORRECTE
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',      // nom direct pour l'API
    email: '',
    password: '',      // nom direct pour l'API
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
    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validation email basique
    if (!formData.email.includes('@')) {
      setError('Email invalide');
      return;
    }

    setLoading(true);

    try {
      // ENVOI DIRECT avec les bons noms
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      console.log(' Réponse API:', response.data);
      
      // Stocker l'utilisateur (pas de token pour l'instant)
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      setSuccess('Inscription réussie ! Redirection vers le profil...');
      
      // Redirection vers login après 2 secondes
      setTimeout(() => {
        navigate('/Profile');
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur API:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Erreur lors de l\'inscription. Vérifiez le serveur.';
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
        border: '1px solid #e5e7eb',
        padding: '3rem 2.5rem',
        backgroundColor: 'white'
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 300,
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em',
          color: '#000'
        }}>
          Inscription
        </h1>
        <br></br>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          Créez votre compte pour accéder à toutes les fonctionnalités
        </p>

        {/* Messages d'erreur/succès */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            borderRadius: '4px'
          }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#efe',
            color: '#3a3',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            borderRadius: '4px'
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: '#666'
            }}>
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="Votre nom d'utilisateur"
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
              color: '#666'
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
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="votre@email.com"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: '#666'
            }}>
              Mot de passe *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="Min. 6 caractères"
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: '#666'
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
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                borderRadius: '4px',
                outline: 'none'
              }}
              placeholder="Retapez votre mot de passe"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading ? '#d1d5db' : '#000',
              color: 'white',
              border: 'none',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: '4px',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Inscription en cours...' : 'Créer mon compte'}
          </button>
        </form>

        {/* Link to Login */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
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
              fontWeight: '500'
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;