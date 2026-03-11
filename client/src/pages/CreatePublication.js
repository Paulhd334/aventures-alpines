import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreatePublication = () => {
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    lieu: '',
    type: 'récit'  // Note: 'récit' avec accent dans votre API
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Récupérer l'utilisateur connecté
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Utilisateur connecté:', parsedUser);
      } catch (error) {
        console.error('Erreur parsing user:', error);
        setError('Erreur de session. Veuillez vous reconnecter.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } else {
      setError('Veuillez vous connecter pour publier un article');
      setTimeout(() => navigate('/login'), 2000);
    }
  }, [navigate]);

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
    
    // Vérifier que l'utilisateur est connecté
    if (!user || !user.id) {
      setError('Veuillez vous connecter pour publier');
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    // Validation
    if (!formData.titre.trim()) {
      setError('Le titre est requis');
      return;
    }
    if (!formData.contenu.trim()) {
      setError('Le contenu est requis');
      return;
    }

    setLoading(true);

    // Préparer les données POUR L'API
    const articleData = {
      titre: formData.titre.trim(),
      contenu: formData.contenu.trim(),
      auteur_id: user.id,  // <-- TRÈS IMPORTANT : envoie l'ID
      lieu: formData.lieu.trim() || '',
      type: formData.type || 'récit'
    };

    console.log('Données envoyées à l\'API:', articleData);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/articles',
        articleData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(' Publication réussie:', response.data);
      
      // Afficher message de succès
      alert('Article publié avec succès !');
      
      // Rediriger vers les articles
      navigate('/articles');
      
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      console.error('❌ Réponse erreur:', err.response?.data);
      
      if (err.response?.status === 400) {
        if (err.response.data.error === 'Titre, contenu et auteur sont requis') {
          setError('Erreur : L\'ID utilisateur n\'est pas envoyé correctement');
          console.error('DEBUG - User ID:', user.id);
          console.error('DEBUG - User object:', user);
        } else {
          setError(err.response.data.error || 'Données invalides');
        }
      } else if (err.response?.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => navigate('/login'), 1500);
      } else if (err.response?.status === 500) {
        setError('Erreur serveur. Veuillez réessayer plus tard.');
      } else if (err.message.includes('Network Error')) {
        setError('Erreur de connexion au serveur. Vérifiez que le serveur backend est démarré.');
      } else {
        setError('Erreur inconnue. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Si pas d'utilisateur, afficher message
  if (!user) {
    return (
      <div style={{ 
        padding: '3rem', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Connexion requise</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>
          Vous devez être connecté pour publier un article.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'transparent',
              color: '#000',
              border: '1px solid #000',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            S'inscrire
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Publier un article</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Partagez votre aventure avec la communauté (connecté en tant que <strong>{user.username}</strong>)
      </p>
      
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
          {error.includes('ID utilisateur') && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              ID utilisateur: {user.id} (stocké dans localStorage)
            </div>
          )}
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
            placeholder="Donnez un titre accrocheur à votre article"
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Type d'article
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
            <option value="récit">Récit d'aventure</option>
            <option value="conseil">Conseils pratiques</option>
            <option value="équipement">Test d'équipement</option>
            <option value="itinéraire">Itinéraire détaillé</option>
            <option value="sécurité">Sécurité en montagne</option>
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
            placeholder="Ex: Chamonix, Mont-Blanc, Alpes"
          />
        </div>

        {/* Contenu */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            Contenu *
          </label>
          <textarea
            name="contenu"
            value={formData.contenu}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '0.875rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
              fontFamily: 'inherit',
              minHeight: '300px',
              resize: 'vertical'
            }}
            placeholder="Racontez votre aventure en détail..."
          />
        </div>

        {/* Info utilisateur */}
        <div style={{ 
          marginBottom: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f8ff',
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <div><strong>Publication au nom de:</strong> {user.username}</div>
          <div><strong>ID utilisateur:</strong> {user.id}</div>
          <div><small>Cet ID sera envoyé au serveur comme auteur de l'article</small></div>
        </div>

        {/* Boutons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              color: '#666',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading ? '#666' : '#000',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            {loading ? 'Publication en cours...' : 'Publier l\'article'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePublication;