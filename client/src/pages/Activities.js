// src/pages/Activities.js - VERSION SIMPLIFIÉE ET CORRIGÉE
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('/api/activites')
      .then(response => {
        // GARANTIR que c'est un tableau
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('Activités chargées:', data.length);
        setActivities(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setActivities([]); // Tableau vide en cas d'erreur
        setLoading(false);
      });
  }, []);

  // Utiliser toujours un tableau sécurisé
  const safeActivities = Array.isArray(activities) ? activities : [];

  // Grouper les activités par catégorie (avec tableau sécurisé)
  const activitiesByCategory = safeActivities.reduce((acc, activity) => {
    const category = activity.type || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(activity);
    return acc;
  }, {});

  // Catégories sans emoji
  const categories = [
    { id: 'all', name: 'Toutes les activités' },
    { id: 'ski', name: 'Ski & Snowboard' },
    { id: 'randonnee', name: 'Randonnée' },
    { id: 'escalade', name: 'Escalade' },
  ];

  // FILTRAGE SIMPLIFIÉ
  // 1. Filtrer par catégorie
  const filteredByCategory = selectedCategory === 'all' 
    ? safeActivities 
    : safeActivities.filter(activity => activity.type === selectedCategory);

  // 2. Filtrer par recherche
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

  // Données pour l'affichage
  const displayCount = selectedCategory === 'all' 
    ? safeActivities.length 
    : (activitiesByCategory[selectedCategory] || []).length;

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
          </div>
        </div>
      </section>

      {/* Filtres et recherche */}
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
                  ? safeActivities.length 
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