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

  // Récupérer l'utilisateur depuis localStorage
  const getUser = () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (error) {
      console.error('Erreur parsing user:', error);
    }
    return { nom_utilisateur: 'Utilisateur Anonyme' };
  };

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
    const user = getUser();
    
    if (!user.nom_utilisateur) {
      setError('Veuillez vous connecter pour publier');
      setLoading(false);
      return;
    }

    // Préparer les données avec nom_utilisateur
    const publicationData = {
      ...formData,
      nom_utilisateur: user.nom_utilisateur,
      lieu: formData.lieu || 'Lieu non spécifié',
      type: formData.type || 'recit'
    };

    // Validation
    if (!publicationData.titre.trim()) {
      setError('Le titre est requis');
      setLoading(false);
      return;
    }
    if (!publicationData.contenu.trim()) {
      setError('Le contenu est requis');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/articles', publicationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Publication réussie:', response.data);
      
      // Rediriger vers le profil après succès
      navigate('/profile');
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      console.error('Réponse erreur:', err.response?.data);
      
      if (err.response?.status === 400) {
        // Erreur de validation côté serveur
        const serverError = err.response.data;
        if (serverError.error) {
          setError(serverError.error);
        } else if (typeof serverError === 'string') {
          setError(serverError);
        } else {
          setError('Données invalides. Vérifiez tous les champs requis.');
        }
      } else if (err.response?.status === 401) {
        setError('Veuillez vous connecter pour publier');
        navigate('/login');
      } else if (err.response?.status === 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else {
        setError('Erreur réseau. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '2rem' }}> Publier une expérience</h1>
      
      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c33',
          padding: '1rem',
          marginBottom: '1.5rem',
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          <strong>Erreur:</strong> {error}
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
            <option value="famille">Expérience familiale</option>
            <option value="difficile">Défi sportif</option>
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
            rows="12"
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '200px'
            }}
            placeholder="Racontez votre aventure en détail... (minimum 100 caractères)"
          />
          <div style={{
            fontSize: '0.875rem',
            color: formData.contenu.length < 100 ? '#c33' : '#666',
            marginTop: '0.5rem'
          }}>
            {formData.contenu.length} caractères {formData.contenu.length < 100 ? '(minimum 100 recommandés)' : ''}
          </div>
        </div>

        {/* Aperçu utilisateur */}
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f8ff',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <strong>Publication au nom de:</strong> {getUser().nom_utilisateur}
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
              flex: 1,
              fontWeight: '500',
              transition: 'background-color 0.3s'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#333';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#000';
            }}
          >
            {loading ? 'Publication en cours...' : 'Publier l\'article'}
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
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f5f5f5';
              e.target.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#ddd';
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
        color: '#666',
        borderLeft: '4px solid #4CAF50'
      }}>
        <h3 style={{ 
          marginBottom: '0.75rem', 
          color: '#333',
          fontSize: '1.1rem'
        }}>
          💡 Conseils pour une bonne publication
        </h3>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '1.5rem',
          lineHeight: '1.6'
        }}>
          <li><strong>Soyez descriptif:</strong> Décrivez l'itinéraire, la météo, les difficultés rencontrées</li>
          <li><strong>Partagez des conseils pratiques:</strong> Équipement, durée, meilleure période</li>
          <li><strong>Ajoutez des détails personnels:</strong> Ce que vous avez appris, vos émotions</li>
          <li><strong>Respectez la communauté:</strong> Langage approprié, pas de discrimination</li>
          <li><strong>Vérifiez l'orthographe:</strong> Une publication bien écrite est plus appréciée</li>
        </ul>
      </div>
    </div>
  );
};

export default CreatePublication;