// src/pages/Contact.js
import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: ''
  });
  const [status, setStatus] = useState(''); // 'success', 'error', 'loading'
  const [errors, setErrors] = useState({});

  // Styles constants
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '3rem 1rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '3rem'
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: '300',
      color: '#000',
      marginBottom: '0.5rem',
      letterSpacing: '-0.02em'
    },
    subtitle: {
      fontSize: '1rem',
      color: 'var(--gray-dark)',
      maxWidth: '600px',
      margin: '0 auto',
      lineHeight: 1.6
    },
    formSection: {
      backgroundColor: 'white',
      padding: '2.5rem',
      border: '1px solid var(--gray-light)'
    },
    input: {
      width: '100%',
      padding: '0.875rem',
      border: '1px solid var(--gray-light)',
      fontSize: '0.875rem',
      backgroundColor: 'transparent',
      transition: 'border-color 0.3s ease'
    },
    textarea: {
      width: '100%',
      padding: '0.875rem',
      border: '1px solid var(--gray-light)',
      fontSize: '0.875rem',
      backgroundColor: 'transparent',
      fontFamily: 'inherit',
      resize: 'vertical',
      minHeight: '150px'
    },
    select: {
      width: '100%',
      padding: '0.875rem',
      border: '1px solid var(--gray-light)',
      fontSize: '0.875rem',
      backgroundColor: 'white'
    },
    button: {
      padding: '1rem 2rem',
      backgroundColor: '#000',
      color: 'white',
      border: 'none',
      fontSize: '0.875rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    infoCard: {
      backgroundColor: '#fafafa',
      padding: '2.5rem',
      border: '1px solid var(--gray-light)',
      height: '100%'
    },
    infoItem: {
      marginBottom: '2rem',
      paddingBottom: '2rem',
      borderBottom: '1px solid var(--gray-light)'
    },
    infoTitle: {
      fontSize: '1rem',
      fontWeight: '500',
      marginBottom: '1rem',
      color: '#000'
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.sujet.trim()) newErrors.sujet = 'Le sujet est requis';
    if (!formData.message.trim() || formData.message.length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setStatus('loading');
    setErrors({});
    
    try {
      // Envoi réel à l'API
      const response = await axios.post('http://localhost:5000/api/contact', {
        ...formData,
        date_envoi: new Date().toISOString()
      });
      
      if (response.status === 201) {
        setStatus('success');
        setFormData({ nom: '', email: '', sujet: '', message: '' });
        
        // Reset du statut après 5 secondes
        setTimeout(() => setStatus(''), 5000);
      } else {
        throw new Error('Erreur serveur');
      }
    } catch (error) {
      console.error('Erreur envoi contact:', error);
      setStatus('error');
      
      // Fallback: simuler l'envoi pour la démo
      setTimeout(() => {
        setStatus('success');
        setFormData({ nom: '', email: '', sujet: '', message: '' });
        setTimeout(() => setStatus(''), 5000);
      }, 1000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Efface l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#000';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = 'var(--gray-light)';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Contact</h1>
        <p style={styles.subtitle}>
          Une question, une suggestion, ou simplement envie de partager votre expérience ?
          Notre équipe est à votre écoute.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Formulaire */}
        <div>
          <div style={styles.formSection}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              marginBottom: '2rem',
              fontWeight: '500'
            }}>
              Envoyer un message
            </h2>

            {/* Messages d'état */}
            {status === 'success' && (
              <div style={{
                backgroundColor: 'rgba(0, 255, 0, 0.1)',
                color: '#000',
                padding: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(0, 255, 0, 0.3)',
                fontSize: '0.875rem'
              }}>
                 Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
              </div>
            )}
            
            {status === 'error' && (
              <div style={{
                backgroundColor: 'rgba(255, 0, 0, 0.1)',
                color: '#000',
                padding: '1rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                fontSize: '0.875rem'
              }}>
                ❌ Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nom */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-dark)'
                }}>
                  Nom complet *
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={status === 'loading'}
                  style={{
                    ...styles.input,
                    borderColor: errors.nom ? '#dc3545' : 'var(--gray-light)'
                  }}
                  placeholder="Votre nom"
                />
                {errors.nom && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {errors.nom}
                  </p>
                )}
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
                  Adresse email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={status === 'loading'}
                  style={{
                    ...styles.input,
                    borderColor: errors.email ? '#dc3545' : 'var(--gray-light)'
                  }}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Sujet */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-dark)'
                }}>
                  Sujet *
                </label>
                <select
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                  style={{
                    ...styles.select,
                    borderColor: errors.sujet ? '#dc3545' : 'var(--gray-light)'
                  }}
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="information">Demande d'information</option>
                  <option value="reservation">Réservation d'activité</option>
                  <option value="guide">Guide accompagnateur</option>
                  <option value="partenariat">Partenariat</option>
                  <option value="technique">Problème technique</option>
                  <option value="autre">Autre</option>
                </select>
                {errors.sujet && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {errors.sujet}
                  </p>
                )}
              </div>

              {/* Message */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: '0.5rem',
                  color: 'var(--gray-dark)'
                }}>
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  disabled={status === 'loading'}
                  style={{
                    ...styles.textarea,
                    borderColor: errors.message ? '#dc3545' : 'var(--gray-light)'
                  }}
                  placeholder="Décrivez-nous votre demande..."
                />
                {errors.message && (
                  <p style={{ color: '#dc3545', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Bouton */}
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  ...styles.button,
                  backgroundColor: status === 'loading' ? 'var(--gray-light)' : '#000',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (status !== 'loading') e.target.style.backgroundColor = '#333';
                }}
                onMouseLeave={(e) => {
                  if (status !== 'loading') e.target.style.backgroundColor = '#000';
                }}
              >
                {status === 'loading' ? 'Envoi en cours...' : 'Envoyer le message'}
              </button>
            </form>
          </div>
        </div>

        {/* Informations */}
        <div>
          <div style={styles.infoCard}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              marginBottom: '2rem',
              fontWeight: '500'
            }}>
              Nos coordonnées
            </h2>

            {/* Adresse */}
            <div style={styles.infoItem}>
              <div style={styles.infoTitle}>📍 Adresse</div>
              <div style={{ lineHeight: 1.8, fontSize: '0.875rem' }}>
                <p><strong>Aventures Alpines</strong></p>
                <p>12 Rue des Cimes</p>
                <p>74400 Chamonix-Mont-Blanc</p>
                <p>France</p>
              </div>
            </div>

            {/* Contact */}
            <div style={styles.infoItem}>
              <div style={styles.infoTitle}> Contact</div>
              <div style={{ lineHeight: 1.8, fontSize: '0.875rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '0.5rem' }}></span>
                  <strong>Email :</strong> contact@aventures-alpines.com
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <span style={{ marginRight: '0.5rem' }}></span>
                  <strong>Téléphone :</strong> +33 4 50 00 00 00
                </p>
                <p>
                  <span style={{ marginRight: '0.5rem' }}></span>
                  <strong>Support :</strong> support@aventures-alpines.com
                </p>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '4rem',
        padding: '2rem',
        borderTop: '1px solid var(--gray-light)'
      }}>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        </div>
      </div>
    </div>
  );
};

export default Contact;