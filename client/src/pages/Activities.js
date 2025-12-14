// src/pages/Activities.js - SEARCHBAR CORRIGÉE
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
        console.log('Activités chargées:', response.data.length);
        setActivities(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur:', error);
        setLoading(false);
      });
  }, []);

  // Grouper les activités par catégorie
  const activitiesByCategory = activities.reduce((acc, activity) => {
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

  // FILTRAGE CORRIGÉ
  // 1. Filtrer par catégorie
  const filteredByCategory = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedCategory);

  // 2. Filtrer par recherche SI il y a un terme de recherche
  const finalActivities = searchTerm.trim() === '' 
    ? filteredByCategory  // Pas de recherche, on garde juste le filtrage catégorie
    : filteredByCategory.filter(activity => {
        // Recherche dans plusieurs champs
        const nom = (activity.nom || '').toLowerCase();
        const description = (activity.description || '').toLowerCase();
        const lieu = (activity.lieu || '').toLowerCase();
        const difficulte = (activity.difficulte || '').toLowerCase();
        const saison = (activity.saison || '').toLowerCase();
        
        const searchLower = searchTerm.toLowerCase();
        
        return (
          nom.includes(searchLower) ||
          description.includes(searchLower) ||
          lieu.includes(searchLower) ||
          difficulte.includes(searchLower) ||
          saison.includes(searchLower)
        );
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

      {/* Filtres et recherche - SECTION CORRIGÉE */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          {/* Barre de recherche CORRIGÉE */}
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
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
                    outline: 'none',
                    paddingRight: '100px' // Espace pour le compteur
                  }}
                />
                {searchTerm && (
                  <div style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.875rem',
                    color: '#666',
                    backgroundColor: '#f3f4f6',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {finalActivities.length} résultat{finalActivities.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Recherche dans: nom, description, lieu, difficulté, saison
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={handleClearSearch}
                    disabled={!searchTerm}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: searchTerm ? '#555' : '#e5e7eb',
                      color: searchTerm ? 'white' : '#999',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: searchTerm ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap',
                      opacity: searchTerm ? 1 : 0.6
                    }}
                  >
                    Effacer la recherche
                  </button>
                  <button 
                    onClick={handleResetAll}
                    disabled={!searchTerm && selectedCategory === 'all'}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: (searchTerm || selectedCategory !== 'all') ? '#000' : '#e5e7eb',
                      color: (searchTerm || selectedCategory !== 'all') ? 'white' : '#999',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: (searchTerm || selectedCategory !== 'all') ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap',
                      opacity: (searchTerm || selectedCategory !== 'all') ? 1 : 0.6
                    }}
                  >
                    Tout réinitialiser
                  </button>
                </div>
              </div>
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
                  : activitiesByCategory[category.id]?.length || 0;
                
                const isSelected = selectedCategory === category.id;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
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
                    <span style={{ fontWeight: '500' }}>{category.name}</span>
                    <span style={{
                      fontSize: '0.875rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#f3f4f6',
                      color: isSelected ? 'white' : '#666'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats avec informations de filtrage */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px'
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '400',
                  marginBottom: '0.25rem',
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
                  {selectedCategory !== 'all' && ` dans la catégorie ${categories.find(c => c.id === selectedCategory)?.name}`}
                </p>
              </div>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#666',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
              }}>
                <div>Total disponible: {activities.length}</div>
                {searchTerm && (
                  <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#888' }}>
                    Filtre: {searchTerm}
                  </div>
                )}
              </div>
            </div>

            {/* Affichage par catégorie */}
            {finalActivities.length === 0 ? (
              <div style={{ 
                padding: '3rem 1.5rem', 
                textAlign: 'center',
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                marginTop: '1rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '400',
                  marginBottom: '1rem',
                  color: '#000'
                }}>
                  {searchTerm 
                    ? `Aucun résultat pour "${searchTerm}"`
                    : 'Aucune activité trouvée'}
                </h3>
                <p style={{ 
                  color: '#666', 
                  maxWidth: '400px', 
                  margin: '0 auto 2rem auto' 
                }}>
                  {searchTerm 
                    ? `Essayez avec d'autres mots-clés ou élargissez votre recherche.`
                    : `Modifiez vos filtres ou explorez d'autres catégories.`
                  }
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button 
                    onClick={handleClearSearch}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#000',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '400'
                    }}
                  >
                    Effacer la recherche
                  </button>
                  <button 
                    onClick={handleResetAll}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'transparent',
                      color: '#000',
                      border: '1px solid #000',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '400'
                    }}
                  >
                    Voir toutes les activités
                  </button>
                </div>
              </div>
            ) : selectedCategory === 'all' ? (
              // Afficher TOUTES les catégories
              Object.entries(activitiesByCategory)
                .filter(([category]) => {
                  // Filtrer les catégories vides après recherche
                  const categoryActivities = activitiesByCategory[category];
                  if (searchTerm) {
                    return categoryActivities.some(activity => 
                      finalActivities.includes(activity)
                    );
                  }
                  return true;
                })
                .map(([category, categoryActivities]) => {
                  // Filtrer les activités de cette catégorie selon la recherche
                  const filteredCategoryActivities = categoryActivities.filter(activity => 
                    finalActivities.includes(activity)
                  );
                  
                  if (filteredCategoryActivities.length === 0) return null;
                  
                  const categoryName = 
                    category === 'ski' ? 'Ski & Snowboard' : 
                    category === 'randonnee' ? 'Randonnée' : 
                    category === 'escalade' ? 'Escalade' : category;
                  
                  return (
                    <div key={category} style={{ marginBottom: '3rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{
                          width: '56px',
                          height: '56px',
                          backgroundColor: '#000',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.25rem',
                          fontWeight: 'bold'
                        }}>
                          {category.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 style={{ 
                            fontSize: '1.5rem',
                            fontWeight: '400',
                            marginBottom: '0.25rem',
                            color: '#000'
                          }}>
                            {categoryName}
                            {searchTerm && (
                              <span style={{
                                fontSize: '0.875rem',
                                marginLeft: '0.5rem',
                                color: '#666',
                                fontWeight: 'normal'
                              }}>
                                ({filteredCategoryActivities.length} résultat{filteredCategoryActivities.length !== 1 ? 's' : ''})
                              </span>
                            )}
                          </h2>
                          <p style={{ color: '#666' }}>
                            {filteredCategoryActivities.length} activité{filteredCategoryActivities.length > 1 ? 's' : ''} disponible{filteredCategoryActivities.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '1.5rem'
                      }}>
                        {filteredCategoryActivities.map(activity => (
                          <ActivityCard key={activity.id} activity={activity} />
                        ))}
                      </div>
                    </div>
                  );
                })
            ) : (
              // Afficher une SEULE catégorie
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

          {/* Statistiques */}
          <div style={{ 
            padding: '2rem',
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem',
              fontWeight: '400',
              marginBottom: '1.5rem',
              color: '#000'
            }}>Statistiques de recherche</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
              }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '300',
                  color: '#000',
                  marginBottom: '0.5rem'
                }}>
                  {finalActivities.length}
                </div>
                <div style={{ color: '#666', fontWeight: '400' }}>
                  Résultats trouvés
                </div>
                {searchTerm && (
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#888',
                    marginTop: '0.5rem'
                  }}>
                    pour "{searchTerm}"
                  </div>
                )}
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
              }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '300',
                  color: '#000',
                  marginBottom: '0.5rem'
                }}>
                  {selectedCategory === 'all' ? activities.length : activitiesByCategory[selectedCategory]?.length || 0}
                </div>
                <div style={{ color: '#666', fontWeight: '400' }}>
                  Dans la catégorie
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#888',
                  marginTop: '0.5rem'
                }}>
                  {selectedCategory === 'all' ? 'Toutes' : categories.find(c => c.id === selectedCategory)?.name}
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '4px'
              }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '300',
                  color: '#000',
                  marginBottom: '0.5rem'
                }}>
                  {activities.length - finalActivities.length}
                </div>
                <div style={{ color: '#666', fontWeight: '400' }}>
                  Non retenus
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: '#888',
                  marginTop: '0.5rem'
                }}>
                  filtrés par vos critères
                </div>
              </div>
            </div>
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