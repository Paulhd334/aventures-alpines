// Register.js - VERSION FINALE AVEC RECAPTCHA
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

  // clé reCAPTCHA
  const RECAPTCHA_SITE_KEY = "6LerRmEsAAAAAG3gS4jlukF-6cV9tNue1Sy_33tz"; // Clé Google reCAPTCHA v2

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

    // Validation email améliorée
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

    // Vérification reCAPTCHA
    if (!recaptchaToken) {
      setRecaptchaError(true);
      setError('Veuillez vérifier que vous n\'êtes pas un robot');
      return;
    }

    setLoading(true);

    try {
      // ENVOI DIRECT avec reCAPTCHA
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        recaptchaToken: recaptchaToken // Envoyez le token au serveur
      });

      console.log('✅ Réponse API:', response.data);
      
      // Stocker l'utilisateur
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      setSuccess('Inscription réussie ! Redirection vers le profil...');
      
      // Réinitialiser le formulaire
      setFormData({
        username: '',
        email: '',
        password: '',
        confirm_password: ''
      });
      resetRecaptcha();
      
      // Redirection vers profil après 2 secondes
      setTimeout(() => {
        navigate('/Profile');
      }, 2000);

    } catch (err) {
      console.error('❌ Erreur API:', err.response?.data || err.message);
      
      // Réinitialiser le reCAPTCHA en cas d'erreur
      resetRecaptcha();
      
      // Gestion des erreurs spécifiques
      if (err.response?.status === 400) {
        if (err.response.data?.error?.includes('reCAPTCHA')) {
          setError('Erreur de vérification reCAPTCHA. Veuillez réessayer.');
          setRecaptchaError(true);
        } else {
          setError(err.response.data?.error || 'Données invalides');
        }
      } else if (err.response?.status === 409) {
        setError('Cet email ou nom d\'utilisateur est déjà utilisé');
      } else {
        const errorMsg = err.response?.data?.error || 
                        err.response?.data?.message || 
                        'Erreur lors de l\'inscription. Veuillez réessayer.';
        setError(errorMsg);
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

          {/* reCAPTCHA */}
          <div style={{ 
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={resetRecaptcha}
              onErrored={() => {
                setRecaptchaError(true);
                setError('Erreur reCAPTCHA. Veuillez réessayer.');
              }}
              style={{
                border: recaptchaError ? '1px solid #dc3545' : 'none',
                borderRadius: '4px'
              }}
            />
          </div>

          {recaptchaError && (
            <div style={{
              color: '#dc3545',
              fontSize: '0.875rem',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              ⚠️ Veuillez compléter le reCAPTCHA
            </div>
          )}

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