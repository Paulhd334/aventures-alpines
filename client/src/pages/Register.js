// Register.js - VERSION FINALE AVEC ÉVÉNEMENT HEADER
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaError, setRecaptchaError] = useState(false);
  
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();

  // ✅ CLÉ SITE (publique) pour reCAPTCHA
  const RECAPTCHA_SITE_KEY = "6LerRmEsAAAAAG3gS4jlukF-6cV9tNue1Sy_33tz";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de la réponse reCAPTCHA
  const handleRecaptchaChange = (token) => {
    if (token) {
      console.log('✅ reCAPTCHA token reçu');
      setRecaptchaToken(token);
      setRecaptchaError(false);
    }
  };

  // Réinitialiser le reCAPTCHA
  const resetRecaptcha = () => {
    setRecaptchaToken('');
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setRecaptchaError(false);

    // Validation des champs
    if (!formData.username.trim()) {
      setError('Le nom d\'utilisateur est requis');
      return;
    }

    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    // ✅ Vérification reCAPTCHA obligatoire
    if (!recaptchaToken) {
      setRecaptchaError(true);
      setError('Veuillez vérifier que vous n\'êtes pas un robot');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Envoi inscription avec reCAPTCHA...');
      
      // ✅ Envoi au serveur avec le token reCAPTCHA
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        recaptchaToken: recaptchaToken
      });

      console.log('✅ Réponse API:', response.data);
      
      // ✅ 1. STOCKER l'utilisateur
      if (response.data.user) {
        const userData = {
          id: response.data.user.id,
          username: response.data.user.username,
          email: response.data.user.email,
          created_at: response.data.user.created_at
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('💾 Utilisateur stocké:', userData);
        
        // ✅ 2. ÉMETTRE L'ÉVÉNEMENT POUR METTRE À JOUR LE HEADER !!!
        window.dispatchEvent(new CustomEvent('user-register', { 
          detail: userData 
        }));
        console.log('📢 Événement user-register émis');
      }
      
      setSuccess('✅ Inscription réussie ! Redirection...');
      
      // Réinitialiser le formulaire
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: ''
      });
      resetRecaptcha();
      
      // ✅ 3. Redirection vers le profil (SANS rechargement)
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (err) {
      console.error('❌ Erreur API:', err.response?.data || err.message);
      
      // Réinitialiser le reCAPTCHA en cas d'erreur
      resetRecaptcha();
      
      // Gestion des erreurs
      if (err.response?.status === 400) {
        if (err.response.data?.error?.includes('reCAPTCHA')) {
          setError('❌ Erreur de vérification reCAPTCHA. Veuillez réessayer.');
          setRecaptchaError(true);
        } else {
          setError(err.response.data?.error || 'Données invalides');
        }
      } else if (err.response?.status === 409) {
        setError('❌ Cet email ou nom d\'utilisateur est déjà utilisé');
      } else if (err.response?.status === 503) {
        setError('❌ Service reCAPTCHA indisponible. Réessayez plus tard.');
      } else {
        setError('❌ Erreur lors de l\'inscription. Veuillez réessayer.');
      }
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
      padding: '2rem 1rem',
      backgroundColor: '#fafafa'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        border: '1px solid #e5e7eb',
        padding: '3rem 2.5rem',
        backgroundColor: 'white',
        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
        borderRadius: '8px'
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
        <br />
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
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            borderRadius: '6px',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            color: '#16a34a',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            borderRadius: '6px',
            border: '1px solid #bbf7d0'
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
              color: '#666',
              fontWeight: 500
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
                backgroundColor: 'white',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Votre nom d'utilisateur"
              disabled={loading}
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
              color: '#666',
              fontWeight: 500
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
                backgroundColor: 'white',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="votre@email.com"
              disabled={loading}
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
              color: '#666',
              fontWeight: 500
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
                backgroundColor: 'white',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Min. 6 caractères"
              disabled={loading}
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
              color: '#666',
              fontWeight: 500
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
                backgroundColor: 'white',
                borderRadius: '6px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Retapez votre mot de passe"
              disabled={loading}
            />
          </div>

          {/* reCAPTCHA */}
          <div style={{ 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center',
            border: recaptchaError ? '2px solid #dc2626' : 'none',
            borderRadius: '6px',
            padding: recaptchaError ? '0.5rem' : '0'
          }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={() => {
                setRecaptchaToken('');
                setRecaptchaError(true);
                setError('reCAPTCHA expiré, veuillez réessayer');
              }}
              onErrored={() => {
                setRecaptchaToken('');
                setRecaptchaError(true);
                setError('Erreur de chargement reCAPTCHA. Rafraîchissez la page.');
              }}
            />
          </div>

          {recaptchaError && !recaptchaToken && (
            <div style={{
              color: '#dc2626',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              backgroundColor: '#fef2f2',
              padding: '0.75rem',
              borderRadius: '6px'
            }}>
              ⚠️ Veuillez compléter le reCAPTCHA
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !recaptchaToken}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: loading || !recaptchaToken ? '#9ca3af' : '#000',
              color: 'white',
              border: 'none',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: loading || !recaptchaToken ? 'not-allowed' : 'pointer',
              borderRadius: '6px',
              transition: 'all 0.2s',
              opacity: loading || !recaptchaToken ? 0.7 : 1,
              fontWeight: 500
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
              fontWeight: '600',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.borderBottomColor = '#000'}
            onMouseLeave={(e) => e.target.style.borderBottomColor = 'transparent'}
          >
            Se connecter →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;