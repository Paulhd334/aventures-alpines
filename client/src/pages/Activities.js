// src/pages/Activities.js - VERSION CORRIGÉE POUR CSS NORMAL
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/activites')
      .then(response => {
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

  // Catégories avec classes CSS fixes
  const categories = [
    { id: 'all', name: 'Toutes les activités', icon: '' },
    { id: 'ski', name: 'Ski & Snowboard', icon: '' },
    { id: 'randonnee', name: 'Randonnée', icon: '' },
    { id: 'escalade', name: 'Escalade', icon: '' },
  ];

  // Filtrer les activités
  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedCategory);

  // Filtrer par recherche
  const finalActivities = searchTerm 
    ? filteredActivities.filter(activity => 
        (activity.name || activity.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : filteredActivities;

  // Classes CSS pour chaque catégorie
  const getCategoryButtonClass = (categoryId) => {
    const baseClass = "flex items-center gap-3 px-6 py-3 rounded-lg border transition-all cursor-pointer";
    
    if (selectedCategory === categoryId) {
      switch(categoryId) {
        case 'all': return `${baseClass} bg-primary text-white border-primary`;
        case 'ski': return `${baseClass} bg-secondary text-white border-secondary`;
        case 'randonnee': return `${baseClass} bg-success text-white border-success`;
        case 'escalade': return `${baseClass} bg-warning text-white border-warning`;
        default: return `${baseClass} bg-primary text-white border-primary`;
      }
    } else {
      return `${baseClass} bg-white text-gray-700 border-gray-300 hover:border-gray-400`;
    }
  };

  // Couleur pour chaque catégorie
  const getCategoryColor = (categoryId) => {
    switch(categoryId) {
      case 'all': return 'primary';
      case 'ski': return 'secondary';
      case 'randonnee': return 'success';
      case 'escalade': return 'warning';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="text-center py-12">
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: '4px solid var(--gray-200)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p className="mt-4 text-gray">Chargement des activités...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="section" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="container">
          <div className="text-center">
            <h1 className="mb-4">Nos activités de montagne</h1>
            <p className="lead" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
              Découvrez toutes nos activités classées par catégorie. 
              Trouvez l'aventure qui vous correspond.
            </p>
          </div>
        </div>
      </section>

      {/* Filtres et recherche */}
      <section className="section">
        <div className="container">
          {/* Barre de recherche */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Rechercher une activité..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Effacer
                </button>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="btn btn-outline"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Tout réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 className="mb-3">Catégories</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {categories.map(category => {
                const count = category.id === 'all' 
                  ? activities.length 
                  : activitiesByCategory[category.id]?.length || 0;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={getCategoryButtonClass(category.id)}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{category.icon}</span>
                    <span style={{ fontWeight: '500' }}>{category.name}</span>
                    <span style={{
                      fontSize: '0.875rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '9999px',
                      backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : 'var(--gray-100)'
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Résultats */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem'
            }}>
              <div>
                <h3 style={{ marginBottom: '0.25rem' }}>
                  {selectedCategory === 'all' 
                    ? 'Toutes les activités' 
                    : categories.find(c => c.id === selectedCategory)?.name}
                </h3>
                <p style={{ color: 'var(--gray-600)' }}>
                  {finalActivities.length} résultat{finalActivities.length !== 1 ? 's' : ''}
                  {searchTerm && ` pour "${searchTerm}"`}
                </p>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                Total : {activities.length} activités
              </div>
            </div>

            {/* Affichage par catégorie */}
            {selectedCategory === 'all' ? (
              // Afficher TOUTES les catégories
              Object.entries(activitiesByCategory).map(([category, categoryActivities]) => (
                <div key={category} style={{ marginBottom: '3rem' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem'
                    }}>
                      {category === 'ski' ? '' : 
                       category === 'randonnee' ? '' : ''}
                    </div>
                    <div>
                      <h2 style={{ marginBottom: '0.25rem' }}>
                        {category === 'ski' ? 'Ski & Snowboard' : 
                         category === 'randonnee' ? 'Randonnée' : 'Escalade'}
                      </h2>
                      <p style={{ color: 'var(--gray-600)' }}>
                        {categoryActivities.length} activité{categoryActivities.length > 1 ? 's' : ''} disponible{categoryActivities.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                  }}>
                    {categoryActivities.map(activity => (
                      <ActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Afficher une SEULE catégorie
              <div>
                {finalActivities.length === 0 ? (
                  <div className="card" style={{ 
                    padding: '3rem 1.5rem', 
                    textAlign: 'center' 
                  }}>
                    <div style={{ fontSize: '3.75rem', marginBottom: '1.5rem' }}>🏔️</div>
                    <h3 style={{ marginBottom: '1rem' }}>Aucune activité trouvée</h3>
                    <p style={{ 
                      color: 'var(--gray-600)', 
                      maxWidth: '400px', 
                      margin: '0 auto 2rem' 
                    }}>
                      {searchTerm 
                        ? `Aucune activité ne correspond à "${searchTerm}" dans cette catégorie.`
                        : `Aucune activité disponible dans cette catégorie pour le moment.`
                      }
                    </p>
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                      }}
                      className="btn btn-primary"
                    >
                      Voir toutes les activités
                    </button>
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
            )}
          </div>

          {/* Statistiques */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>📊 Statistiques</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem'
              }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginBottom: '0.5rem'
                }}>
                  {activities.length}
                </div>
                <div style={{ color: 'var(--gray-600)', fontWeight: '500' }}>
                  Activités totales
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem'
              }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginBottom: '0.5rem'
                }}>
                  {Object.keys(activitiesByCategory).length}
                </div>
                <div style={{ color: 'var(--gray-600)', fontWeight: '500' }}>
                  Catégories
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem',
                backgroundColor: 'var(--gray-50)',
                borderRadius: '0.75rem'
              }}>
                <div style={{
                  fontSize: '2.25rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  marginBottom: '0.5rem'
                }}>
                  {finalActivities.length}
                </div>
                <div style={{ color: 'var(--gray-600)', fontWeight: '500' }}>
                  Résultats
                </div>
              </div>
            </div>
            
            <div style={{ 
              paddingTop: '1.5rem', 
              borderTop: '1px solid var(--gray-200)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1.5rem'
              }}>
                {Object.entries(activitiesByCategory).map(([category, catActivities]) => (
                  <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '1.125rem' }}>
                        {category === 'ski' ? '⛷️' : 
                         category === 'randonnee' ? '🥾' : '🧗‍♂️'}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {category === 'ski' ? 'Ski' : 
                         category === 'randonnee' ? 'Randonnée' : 'Escalade'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                        {catActivities.length} activité{catActivities.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div style={{ marginTop: '3rem', textAlign: 'center' }}>
            <div className="card" style={{ 
              padding: '2rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: 'white'
            }}>
              <h3 style={{ marginBottom: '1rem', color: 'white' }}>Besoin d'aide pour choisir ?</h3>
              <p style={{ 
                marginBottom: '1.5rem', 
                opacity: '0.9',
                maxWidth: '800px', 
                margin: '0 auto' 
              }}>
                Notre équipe d'experts est à votre disposition pour vous conseiller 
                et trouver l'activité parfaite selon vos envies et votre niveau.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn" style={{ 
                  backgroundColor: 'white', 
                  color: 'var(--primary)',
                  border: 'none'
                }}>
                  Nous contacter
                </button>
                <button className="btn btn-outline" style={{ 
                  borderColor: 'white', 
                  color: 'white',
                  backgroundColor: 'transparent'
                }}>
                  Télécharger le guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Activities;