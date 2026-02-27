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
    region: ''
  });

  const API_BASE_URL = 'http://localhost:5000';

  // Charger les itinéraires depuis la BDD
  useEffect(() => {
    const fetchItineraires = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Itineraires`);
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
    const regions = [...new Set(itineraires.map(route => route.region).filter(Boolean))];
    return [
      { value: "", label: "Toutes régions" },
      ...regions.map(region => ({ value: region, label: region }))
    ];
  }, [itineraires]);

  const difficulteOptions = [
    { value: "", label: "Toutes difficultés" },
    { value: "Facile", label: "Facile" },
    { value: "Moyen", label: "Moyen" },
    { value: "Difficile", label: "Difficile" },
    { value: "Très Difficile", label: "Très difficile" }
  ];

  // Fonction pour extraire le nombre de jours depuis la durée
  const getDureeJours = (duree) => {
    if (!duree) return 0;
    // Extrait le premier nombre trouvé (ex: "7-10 jours" -> 7)
    const match = duree.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Catégoriser les durées
  const getDureeCategorie = (duree) => {
    const jours = getDureeJours(duree);
    if (jours === 0) return '';
    if (jours <= 2) return '1-2 jours';
    if (jours <= 4) return '3-4 jours';
    if (jours <= 7) return '5-7 jours';
    if (jours <= 10) return '8-10 jours';
    return '11+ jours';
  };

  const dureeOptions = [
    { value: "", label: "Toutes durées" },
    { value: "1-2 jours", label: "1-2 jours" },
    { value: "3-4 jours", label: "3-4 jours" },
    { value: "5-7 jours", label: "5-7 jours" },
    { value: "8-10 jours", label: "8-10 jours" },
    { value: "11+ jours", label: "11 jours et plus" }
  ];

  // Extraire la distance en km depuis la chaîne
  const getDistanceKm = (distance) => {
    if (!distance) return 0;
    const match = distance.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  // Catégoriser les distances
  const getDistanceCategorie = (distance) => {
    const dist = getDistanceKm(distance);
    if (dist === 0) return '';
    if (dist < 50) return "Moins de 50km";
    if (dist <= 100) return "50-100km";
    if (dist <= 150) return "100-150km";
    return "Plus de 150km";
  };

  const distanceOptions = [
    { value: "", label: "Toutes distances" },
    { value: "Moins de 50km", label: "Moins de 50 km" },
    { value: "50-100km", label: "50 - 100 km" },
    { value: "100-150km", label: "100 - 150 km" },
    { value: "Plus de 150km", label: "Plus de 150 km" }
  ];

  // Filtrer les itinéraires
  useEffect(() => {
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
      
      return true;
    });

    setFilteredItineraires(filtered);
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
      region: ''
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