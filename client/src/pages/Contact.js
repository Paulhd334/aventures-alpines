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
  const [status, setStatus] = useState(''); // 'success', 'error', 'sending'
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    if (!formData.sujet.trim()) newErrors.sujet = 'Le sujet est requis';
    if (!formData.message.trim()) newErrors.message = 'Le message est requis';
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setStatus('sending');
    setErrors({});
    
    try {
      // À remplacer par ton endpoint API
      await axios.post('http://localhost:5000/api/contact', formData);
      
      setStatus('success');
      setFormData({ nom: '', email: '', sujet: '', message: '' });
      
      // Reset du statut après 5 secondes
      setTimeout(() => setStatus(''), 5000);
    } catch (error) {
      console.error('Erreur:', error);
      setStatus('error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Efface l'erreur quand l'utilisateur commence à taper
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#2c3e50', marginBottom: '10px' }}>
        📞 Contactez-nous
      </h1>
      <p style={{ fontSize: '1.1rem', color: '#7f8c8d', marginBottom: '40px' }}>
        Une question ? Une suggestion ? N'hésitez pas à nous contacter !
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
        {/* Formulaire */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <form onSubmit={handleSubmit} style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {status === 'success' && (
              <div style={{
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #c3e6cb'
              }}>
                ✅ Message envoyé avec succès !
              </div>
            )}
            
            {status === 'error' && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '15px',
                borderRadius: '6px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
              }}>
                ❌ Une erreur est survenue. Veuillez réessayer.
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Nom complet *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.nom ? '#dc3545' : '#ddd'}`,
                  fontSize: '1rem'
                }}
                placeholder="Votre nom"
              />
              {errors.nom && <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>{errors.nom}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Adresse email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.email ? '#dc3545' : '#ddd'}`,
                  fontSize: '1rem'
                }}
                placeholder="votre@email.com"
              />
              {errors.email && <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Sujet *
              </label>
              <select
                name="sujet"
                value={formData.sujet}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.sujet ? '#dc3545' : '#ddd'}`,
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Sélectionnez un sujet</option>
                <option value="information">Demande d'information</option>
                <option value="reservation">Réservation</option>
                <option value="partenaire">Devenir partenaire</option>
                <option value="autre">Autre</option>
              </select>
              {errors.sujet && <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>{errors.sujet}</p>}
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: `1px solid ${errors.message ? '#dc3545' : '#ddd'}`,
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                placeholder="Votre message..."
              />
              {errors.message && <p style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: status === 'sending' ? '#6c757d' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                opacity: status === 'sending' ? 0.7 : 1
              }}
            >
              {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>

        {/* Informations de contact */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{
            backgroundColor: '#2c3e50',
            color: 'white',
            padding: '30px',
            borderRadius: '12px',
            height: '100%'
          }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px' }}>📞 Nos coordonnées</h2>
            
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#ecf0f1' }}>
                🏔️ Aventures Alpines
              </h3>
              <p>123 Rue des Montagnes</p>
              <p>74000 Chamonix</p>
              <p>France</p>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#ecf0f1' }}>
                📱 Contact
              </h3>
              <p>📞 <strong>Téléphone:</strong> +33 4 50 00 00 00</p>
              <p>✉️ <strong>Email:</strong> contact@aventures-alpines.fr</p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#ecf0f1' }}>
                🕒 Horaires d'ouverture
              </h3>
              <p><strong>Lundi - Vendredi:</strong> 9h - 18h</p>
              <p><strong>Samedi:</strong> 9h - 12h</p>
              <p><strong>Dimanche:</strong> Fermé</p>
            </div>

            <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #4a6572' }}>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                <strong>⚠️ Note:</strong> Ce formulaire est en phase de test pour le projet BTS SLAM.
                Les messages ne sont pas réellement envoyés.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;