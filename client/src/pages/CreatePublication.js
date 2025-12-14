import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePublication = () => {
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    lieu: '',
    type: 'recit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/publications', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Rediriger vers le profil après succès
      navigate('/profile');
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>📝 Publier une expérience</h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Titre */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Titre *
          </label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            placeholder="Ex: Ma première ascension du Mont Blanc"
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Type d'expérience
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              backgroundColor: 'white'
            }}
          >
            <option value="recit">Récit d'aventure</option>
            <option value="conseil">Conseils pratiques</option>
            <option value="photo">Galerie photo</option>
            <option value="article">Article technique</option>
          </select>
        </div>

        {/* Lieu */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Lieu
          </label>
          <input
            type="text"
            name="lieu"
            value={formData.lieu}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
            placeholder="Ex: Chamonix, Alpes françaises"
          />
        </div>

        {/* Contenu */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Votre expérience *
          </label>
          <textarea
            name="contenu"
            value={formData.contenu}
            onChange={handleChange}
            required
            rows="10"
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            placeholder="Racontez votre aventure en détail..."
          />
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1rem 2rem',
              backgroundColor: loading ? '#ccc' : '#000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              flex: 1
            }}
          >
            {loading ? 'Publication en cours...' : 'Publier'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/profile')}
            style={{
              padding: '1rem 2rem',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              color: '#666',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Annuler
          </button>
        </div>
      </form>

      <div style={{ 
        marginTop: '3rem', 
        padding: '1.5rem',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>💡 Conseils pour une bonne publication</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li>Soyez descriptif et précis</li>
          <li>Incluez des détails sur la difficulté</li>
          <li>Partagez vos conseils et apprentissages</li>
          <li>Respectez les autres membres de la communauté</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePublication;