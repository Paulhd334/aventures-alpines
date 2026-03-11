import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '',    // Peut être email OU username
    password: ''
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
      // Décider si l'identifier est un email ou un username
      const identifier = formData.identifier;
      const isEmail = identifier.includes('@');
      
      // Envoyer la requête avec la bonne structure
      const requestData = {
        password: formData.password
      };
      
      if (isEmail) {
        requestData.email = identifier;
      } else {
        requestData.username = identifier;
      }

      console.log('Données envoyées:', requestData);

      const response = await axios.post('http://localhost:5000/api/auth/login', requestData);

      console.log('✅ Connexion réussie:', response.data);
      
      // Stocker l'utilisateur avec TOUTES ses données
      if (response.data.user) {
        const userData = {
          id: response.data.user.id,           // ← TRÈS IMPORTANT
          username: response.data.user.username,
          email: response.data.user.email,
          created_at: response.data.user.created_at
        };
        
        console.log('Stockage dans localStorage:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Vérifier que c'est bien stocké
        const storedUser = JSON.parse(localStorage.getItem('user'));
        console.log('Vérification storage - ID:', storedUser?.id);
      } else {
        console.error('⚠️ Pas de user dans la réponse:', response.data);
      }
      
      // Redirection
      navigate('/');
      window.location.reload();
      
    } catch (err) {
      console.error('❌ Erreur login:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      'Email/mot de passe incorrect ou problème de connexion';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de test - à supprimer après
  const testLocalStorage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    console.log('User ID type:', typeof user?.id);
    console.log('==========================');
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
          Connexion
        </h1>
        <br />
        
        {/* Bouton de debug - à supprimer */}
        <button 
          onClick={testLocalStorage}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            marginBottom: '1rem',
            fontSize: '0.75rem',
            cursor: 'pointer'
          }}
        >
          Debug localStorage
        </button>
        
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          marginBottom: '2rem',
          lineHeight: 1.6
        }}>
          Connectez-vous avec votre email ou nom d'utilisateur
        </p>

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

        <form onSubmit={handleSubmit}>
          {/* Email ou Username */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '0.5rem',
              color: '#666'
            }}>
              Email ou nom d'utilisateur *
            </label>
            <input
              type="text"
              name="identifier"
              value={formData.identifier}
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
              placeholder="paul@gmail.com ou 'Paul'"
            />
            <small style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
              Test avec: Paul (username) ou paul@gmail.com (email)
            </small>
          </div>

          {/* Mot de passe */}
          <div style={{ marginBottom: '2rem' }}>
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
              placeholder="Votre mot de passe"
            />
            <small style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
              Mot de passe que vous avez utilisé lors de l'inscription
            </small>
          </div>

          {/* Bouton de connexion */}
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
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {/* Test manuel - à supprimer */}
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9' }}>
          <p style={{ fontSize: '0.75rem', color: '#666' }}>
            <strong>Debug:</strong> Après connexion, cliquez sur "Debug localStorage" pour vérifier que l'ID est bien stocké.
          </p>
        </div>

        {/* Lien vers inscription */}
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
            Pas encore de compte ?
          </p>
          <Link 
            to="/register"
            style={{
              fontSize: '0.875rem',
              textDecoration: 'none',
              color: '#000',
              fontWeight: '500'
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