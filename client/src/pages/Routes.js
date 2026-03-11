// src/pages/Routes.js
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import HikingRoute from '../components/HikingRoute';

const Routes = () => {
  const [itineraires, setItineraires] = useState([]);
  const [filteredItineraires, setFilteredItineraires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulte: '',
    duree: '',
    distance: '',
    region: '',
    type: ''
  });

  const API_BASE_URL = 'http://localhost:5000';

  // Charger les itinéraires depuis la BDD
  useEffect(() => {
    const fetchItineraires = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/itineraires`);
        console.log('✅ Itinéraires chargés:', response.data);
        setItineraires(response.data);
        setFilteredItineraires(response.data);
      } catch (err) {
        console.error('❌ Erreur chargement itinéraires:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraires();
  }, []);

  // Extraire les options de filtres uniques depuis les données
  const regionOptions = useMemo(() => {
    const regions = [...new Set(itineraires.map(route => route.region))];
    return [
      { value: "", label: "Toutes régions" },
      ...regions.map(region => ({ value: region, label: region }))
    ];
  }, [itineraires]);

  const difficulteOptions = [
    { value: "", label: "Toutes difficultés" },
    { value: "facile", label: "Facile" },
    { value: "moyen", label: "Moyen" },
    { value: "difficile", label: "Difficile" },
    { value: "expert", label: "Expert" }
  ];

  // Catégoriser les durées
  const getDureeCategorie = (duree) => {
    if (!duree) return '';
    if (duree.includes('jour')) {
      const jours = parseInt(duree.split(' ')[0]);
      if (jours === 1) return '1 jour';
      if (jours <= 3) return '2-3 jours';
      if (jours <= 7) return '4-7 jours';
      if (jours <= 14) return '8-14 jours';
      return '15+ jours';
    }
    return '';
  };

  const dureeOptions = [
    { value: "", label: "Toutes durées" },
    { value: "1 jour", label: "1 jour" },
    { value: "2-3 jours", label: "2-3 jours" },
    { value: "4-7 jours", label: "4-7 jours" },
    { value: "8-14 jours", label: "8-14 jours" },
    { value: "15+ jours", label: "15+ jours" }
  ];

  // Catégoriser les distances
  const getDistanceCategorie = (distance) => {
    const dist = parseFloat(distance);
    if (dist < 20) return "< 20km";
    if (dist <= 50) return "20-50km";
    if (dist <= 100) return "50-100km";
    return "> 100km";
  };

  const distanceOptions = [
    { value: "", label: "Toutes distances" },
    { value: "< 20km", label: "Moins de 20km" },
    { value: "20-50km", label: "20 - 50km" },
    { value: "50-100km", label: "50 - 100km" },
    { value: "> 100km", label: "Plus de 100km" }
  ];

  const typeOptions = [
    { value: "", label: "Tous types" },
    { value: "randonnée", label: "Randonnée" },
    { value: "trek", label: "Trek" },
    { value: "alpinisme", label: "Alpinisme" }
  ];

  // Filtrer les itinéraires
  useEffect(() => {
    setLoading(true);
    
    const filtered = itineraires.filter(route => {
      // Filtre difficulté
      if (filters.difficulte && route.difficulte !== filters.difficulte) return false;
      
      // Filtre région
      if (filters.region && route.region !== filters.region) return false;
      
      // Filtre distance
      if (filters.distance) {
        const distCat = getDistanceCategorie(route.distance);
        if (distCat !== filters.distance) return false;
      }
      
      // Filtre durée
      if (filters.duree) {
        const dureeCat = getDureeCategorie(route.duree);
        if (dureeCat !== filters.duree) return false;
      }
      
      // Filtre type (si vous avez un champ type dans votre table)
      if (filters.type) {
        // Adaptez selon votre logique de type
        if (route.difficulte === 'expert' && filters.type !== 'alpinisme') return false;
        if (route.distance > 100 && filters.type !== 'trek') return false;
      }
      
      return true;
    });

    setTimeout(() => {
      setFilteredItineraires(filtered);
      setLoading(false);
    }, 300);
  }, [filters, itineraires]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      difficulte: '',
      duree: '',
      distance: '',
      region: '',
      type: ''
    });
  };

  // Statistiques
  const totalRoutes = itineraires.length;
  const activeFilters = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="routes-page">
      {/* Hero Section */}
      <section className="routes-hero">
        <div className="container">
          <h1 style={{ 
            fontSize: '3rem',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            color: 'var(--black-soft)',
            textAlign: 'center'
          }}> <br></br>
            NOS ITINÉRAIRES
          </h1>
          <p className="lead" style={{ 
            textAlign: 'center', 
            marginBottom: '1rem',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto 2rem'
          }}>
            Découvrez {totalRoutes} itinéraires de randonnée soigneusement sélectionnés 
            dans les plus belles régions de France.
          </p>
        </div>
      </section>

      {/* Filtres */}
      <section style={{ 
        padding: '2rem 0', 
        backgroundColor: 'var(--white-smoke)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      }}>
        <div className="container">
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: 500,
                color: 'var(--black-soft)',
                margin: 0
              }}>
                Filtrer les itinéraires
                {activeFilters > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.875rem',
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '12px'
                  }}>
                    {activeFilters} filtre{activeFilters > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              
              <button 
                className="btn btn-text"
                onClick={resetFilters}
                style={{ 
                  fontSize: '0.875rem',
                  color: 'var(--gray-dark)'
                }}
              >
                ↻ Réinitialiser
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              alignItems: 'end'
            }}>
              <div>
                <label className="form-label">Difficulté</label>
                <select 
                  className="form-control"
                  name="difficulte" 
                  value={filters.difficulte}
                  onChange={handleFilterChange}
                >
                  {difficulteOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Durée</label>
                <select 
                  className="form-control"
                  name="duree" 
                  value={filters.duree}
                  onChange={handleFilterChange}
                >
                  {dureeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Distance</label>
                <select 
                  className="form-control"
                  name="distance" 
                  value={filters.distance}
                  onChange={handleFilterChange}
                >
                  {distanceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Région</label>
                <select 
                  className="form-control"
                  name="region" 
                  value={filters.region}
                  onChange={handleFilterChange}
                >
                  {regionOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Type</label>
                <select 
                  className="form-control"
                  name="type" 
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  {typeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des itinéraires */}
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '2px solid var(--gray-light)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '1rem'
              }}></div>
              <p style={{ color: 'var(--gray-dark)' }}>Chargement des itinéraires...</p>
            </div>
          ) : filteredItineraires.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '4rem',
              border: '1px solid var(--platinum)',
              background: 'var(--white)',
              borderRadius: '8px'
            }}>
              <div style={{ 
                fontSize: '3rem',
                marginBottom: '1rem',
                color: 'var(--gray-light)'
              }}>
                🗺️
              </div>
              <h3 style={{ 
                marginBottom: '0.5rem', 
                color: 'var(--charcoal)',
                fontSize: '1.5rem'
              }}>
                Aucun itinéraire ne correspond
              </h3>
              <p style={{ 
                color: 'var(--gray-dark)',
                marginBottom: '1.5rem'
              }}>
                Modifiez vos critères de recherche pour voir plus d'itinéraires.
              </p>
              <button 
                className="btn btn-secondary"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <div style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--platinum)'
              }}>
                <div style={{ 
                  color: 'var(--charcoal-light)',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  {filteredItineraires.length} itinéraire{filteredItineraires.length > 1 ? 's' : ''} trouvé{filteredItineraires.length > 1 ? 's' : ''}
                </div>
                
                <div style={{
                  fontSize: '0.875rem',
                  color: 'var(--gray-dark)'
                }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    background: 'var(--success)',
                    borderRadius: '50%',
                    marginRight: '0.5rem'
                  }}></span>
                  Données issues de notre base de données
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                {filteredItineraires.map((itineraire) => (
                  <HikingRoute 
                    key={itineraire.id}
                    itineraire={itineraire}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 0',
        backgroundColor: 'var(--white-smoke)'
      }}>
        <div className="container">
          <div style={{ 
            background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%)',
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '12px',
            color: 'white'
          }}>
            <h2 style={{ 
              fontSize: '2rem',
              fontWeight: 300,
              marginBottom: '1rem'
            }}>
              Un itinéraire à partager ?
            </h2>
            <p style={{ 
              maxWidth: '500px',
              margin: '0 auto 2rem',
              lineHeight: '1.7',
              opacity: 0.9
            }}>
              Rejoignez notre communauté de randonneurs et partagez vos plus belles découvertes.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <a href="/contribuer" className="btn btn-white">
                Publier un itinéraire
              </a>
              <a href="/contact" className="btn btn-outline-white">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Style pour l'animation de spin */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Routes;