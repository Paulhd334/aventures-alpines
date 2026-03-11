// src/pages/Activities.js - VERSION API SEULEMENT
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const API_URL = 'http://localhost:5000/api/activites';
        console.log('Chargement des activités depuis:', API_URL);
        
        const response = await axios.get(API_URL);
        const data = response.data;
        
        console.log('Activités reçues:', data);
        
        if (!Array.isArray(data)) {
          throw new Error('Format de données invalide');
        }
        
        setActivities(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur de chargement:', err);
        setError('Impossible de charger les activités. Veuillez vérifier que le serveur est en marche.');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Catégories basées sur les types d'activités disponibles
  const getCategories = () => {
    const allCategories = [
      { id: 'all', name: 'Toutes les activités' }
    ];
    
    // Extraire les catégories uniques des activités
    const uniqueTypes = [...new Set(activities.map(activity => activity.type))];
    
    uniqueTypes.forEach(type => {
      if (type) {
        const displayName = {
          ski: 'Ski & Snowboard',
          randonnee: 'Randonnée',
          escalade: 'Escalade',
          vtt: 'VTT'
        }[type] || type.charAt(0).toUpperCase() + type.slice(1);
        
        allCategories.push({ id: type, name: displayName });
      }
    });
    
    return allCategories;
  };

  // Grouper les activités par catégorie
  const activitiesByCategory = activities.reduce((acc, activity) => {
    const category = activity.type || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {});

  // FILTRAGE
  const filteredByCategory = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedCategory);

  const finalActivities = searchTerm.trim() === '' 
    ? filteredByCategory 
    : filteredByCategory.filter(activity => {
        const searchLower = searchTerm.toLowerCase();
        const searchableText = [
          activity.nom || '',
          activity.description || '',
          activity.lieu || '',
          activity.difficulte || '',
          activity.saison || ''
        ].join(' ').toLowerCase();
        
        return searchableText.includes(searchLower);
      });

  // Fonction pour effacer la recherche
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Fonction pour réinitialiser tous les filtres
  const handleResetAll = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#000',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }}></div>
            <p style={{ color: '#666' }}>Chargement des activités...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ 
            padding: '3rem 1.5rem', 
            textAlign: 'center',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              fontWeight: '300',
              marginBottom: '1rem',
              color: '#000'
            }}>
              Erreur de chargement
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              {error}
            </p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              Vérifiez que le serveur backend est démarré sur http://localhost:5000
            </p>
          </div>
        </div>
      </section>
    );
  }

  const categories = getCategories();

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 0',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: '3rem',
              fontWeight: 300,
              marginBottom: '1rem',
              color: '#000'
            }}>
              Nos activités de montagne
            </h1>
            
            <p style={{
              color: '#666',
              maxWidth: '600px',
              margin: '0 auto 2rem auto',
              fontSize: '1.125rem',
              lineHeight: 1.6
            }}>
              Découvrez toutes nos activités classées par catégorie. 
              Trouvez l'aventure qui vous correspond.
            </p>
            
            <div style={{
              fontSize: '0.875rem',
              color: '#666',
              backgroundColor: '#f9fafb',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              display: 'inline-block',
              marginBottom: '1rem'
            }}>
              {activities.length} activité{activities.length !== 1 ? 's' : ''} disponibles
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          {/* Barre de recherche */}
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Rechercher une activité, un lieu, une difficulté..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
              {searchTerm && (
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.875rem',
                  color: '#666'
                }}>
                  {finalActivities.length} résultat{finalActivities.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={handleClearSearch}
                disabled={!searchTerm}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: searchTerm ? '#555' : '#e5e7eb',
                  color: searchTerm ? 'white' : '#999',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: searchTerm ? 'pointer' : 'not-allowed',
                  fontSize: '0.875rem'
                }}
              >
                Effacer recherche
              </button>
              <button 
                onClick={handleResetAll}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#000',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Tout réinitialiser
              </button>
            </div>
          </div>

          {/* Catégories */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '400',
              marginBottom: '1rem',
              color: '#000'
            }}>Catégories</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(category => {
                const count = category.id === 'all' 
                  ? activities.length 
                  : (activitiesByCategory[category.id] || []).length;
                
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '4px',
                      border: `1px solid ${isSelected ? '#000' : '#d1d5db'}`,
                      backgroundColor: isSelected ? '#000' : 'white',
                      color: isSelected ? 'white' : '#333',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: '400'
                    }}
                  >
                    {category.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: '400',
                marginBottom: '0.5rem',
                color: '#000'
              }}>
                {selectedCategory === 'all' 
                  ? 'Toutes les activités' 
                  : categories.find(c => c.id === selectedCategory)?.name}
                {searchTerm && ` - Recherche: "${searchTerm}"`}
              </h3>
              <p style={{ color: '#666' }}>
                {finalActivities.length} activité{finalActivities.length !== 1 ? 's' : ''} trouvée{finalActivities.length !== 1 ? 's' : ''}
                {searchTerm && ` pour "${searchTerm}"`}
              </p>
            </div>

            {/* Affichage des activités */}
            {finalActivities.length === 0 ? (
              <div style={{ 
                padding: '3rem 1.5rem', 
                textAlign: 'center',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '400',
                  marginBottom: '1rem',
                  color: '#000'
                }}>
                  Aucune activité trouvée
                </h3>
                <p style={{ color: '#666', marginBottom: '2rem' }}>
                  Modifiez vos critères de recherche ou explorez d'autres catégories.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {finalActivities.map(activity => (
                  <ActivityCard key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>

          {/* Style pour l'animation de spin */}
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </section>
    </div>
  );
};

export default Activities;