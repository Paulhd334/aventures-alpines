import React, { useState } from 'react';

const Escalade = () => {
  const [activeTab, setActiveTab] = useState('intro');

  // Sites d'escalade classés par difficulté
  const climbingSites = [
    {
      niveau: "Débutant",
      sites: [
        { 
          nom: "Forêt de Fontainebleau", 
          pays: "France",
          description: "Le paradis du bloc pour débutants, avec des circuits bien marqués",
          cotation: "3 à 5a",
          altitude: "80m",
          meilleureSaison: "Printemps-Automne"
        },
        { 
          nom: "Orpierre", 
          pays: "France",
          description: "Site idéal pour premières voies en extérieur",
          cotation: "3 à 5c",
          altitude: "900m",
          meilleureSaison: "Avril à Octobre"
        }
      ]
    },
    {
      niveau: "Intermédiaire",
      sites: [
        { 
          nom: "Céüse", 
          pays: "France",
          description: "Calcaire de qualité mondiale pour le perfectionnement",
          cotation: "6a à 7c",
          altitude: "1800m",
          meilleureSaison: "Été"
        },
        { 
          nom: "Kalymnos", 
          pays: "Grèce",
          description: "Falaises au-dessus de la mer avec voies variées",
          cotation: "5c à 7b",
          altitude: "0-300m",
          meilleureSaison: "Septembre à Mai"
        }
      ]
    },
    {
      niveau: "Expert",
      sites: [
        { 
          nom: "Yosemite - El Capitan", 
          pays: "USA",
          description: "La cathédrale de l'escalade mondiale, grandes voies mythiques",
          cotation: "5.9 à 5.14",
          altitude: "2307m",
          meilleureSaison: "Mai à Octobre"
        },
        { 
          nom: "La Dura Dura", 
          pays: "Espagne",
          description: "Considérée comme la voie la plus dure au monde",
          cotation: "9b+",
          altitude: "1200m",
          meilleureSaison: "Printemps-Automne"
        }
      ]
    }
  ];

  // Conseils pour débutants
  const beginnerTips = [
    {
      title: "Choisir le bon équipement",
      tips: [
        "Chaussons bien ajustés mais pas trop serrés",
        "Baudrier confortable",
        "Magnésie pour les mains moites",
        "Casque obligatoire en extérieur"
      ]
    },
    {
      title: "Apprendre les bases",
      tips: [
        "Prendre un cours avec un moniteur diplômé",
        "Commencer en salle avant d'aller en extérieur",
        "Apprendre à bien assurer son partenaire",
        "Connaître les nœuds essentiels (huit, double huit)"
      ]
    },
    {
      title: "Progresser sainement",
      tips: [
        "Écouter son corps pour éviter les blessures",
        "Travailler la souplesse et le renforcement",
        "Ne pas brûler les étapes",
        "Grimper régulièrement mais avec repos"
      ]
    }
  ];

  // Vidéos de démonstration
  const videos = [
    {
      id: 1,
      title: "Techniques de base en bloc",
      description: "Apprendre les placements et l'équilibre",
      duration: "4:30",
      level: "Débutant"
    },
    {
      id: 2,
      title: "Assurage et sécurité",
      description: "Les bonnes pratiques pour grimper en sécurité",
      duration: "6:15",
      level: "Intermédiaire"
    },
    {
      id: 3,
      title: "Grande voie en multi-longueurs",
      description: "Ascension complète avec bivouac",
      duration: "12:45",
      level: "Expert"
    }
  ];

  return (
    <div className="randonnee-page">
      {/* Hero Section */}
      <div className="randonnee-hero" style={{
        background: '#fff',
        color: '#000',
        padding: '5rem 2rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '300', 
          marginBottom: '1rem',
          letterSpacing: '-0.02em' 
        }}>
          Escalade
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          maxWidth: '600px', 
          margin: '0 auto',
          fontWeight: '300',
          lineHeight: '1.6',
          color: '#666'
        }}>
          L'art vertical de l'escalade. Des premiers pas en falaise aux grandes voies alpines.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="randonnee-tabs" style={{ 
        display: 'flex', 
        borderBottom: '1px solid #eee',
        background: '#fff'
      }}>
        {['intro', 'sites', 'videos'].map((tab) => (
          <button
            key={tab}
            className={`randonnee-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '1.5rem 2rem',
              background: 'none',
              border: 'none',
              borderBottom: '2px solid transparent',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab === 'intro' && 'Introduction'}
            {tab === 'sites' && 'Sites de Grimpe'}
            {tab === 'videos' && 'Vidéos'}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="randonnee-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        
        {/* Introduction pour débutants */}
        {activeTab === 'intro' && (
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '300', 
              marginBottom: '2rem',
              color: '#333',
              paddingBottom: '1rem',
              borderBottom: '1px solid #eee'
            }}>
              Commencer l'escalade en sécurité
            </h2>

            {/* Alerte sécurité */}
            <div style={{
              background: '#f8f8f8',
              borderLeft: '1px solid #ccc',
              padding: '2rem',
              marginBottom: '3rem'
            }}>
              <h3 style={{ 
                marginBottom: '1rem', 
                fontWeight: '400',
                color: '#333'
              }}>
                Consignes de sécurité essentielles
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: '0',
                color: '#555'
              }}>
                <li style={{ marginBottom: '0.8rem', paddingLeft: '1.2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#999' }}>•</span>
                  Toujours grimper avec un partenaire
                </li>
                <li style={{ marginBottom: '0.8rem', paddingLeft: '1.2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#999' }}>•</span>
                  Vérifier son matériel systématiquement
                </li>
                <li style={{ marginBottom: '0.8rem', paddingLeft: '1.2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#999' }}>•</span>
                  Consulter les prévisions météo
                </li>
                <li style={{ marginBottom: '0.8rem', paddingLeft: '1.2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#999' }}>•</span>
                  Avoir un plan B en cas de changement de conditions
                </li>
                <li style={{ paddingLeft: '1.2rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '0', color: '#999' }}>•</span>
                  Connaître et respecter ses limites
                </li>
              </ul>
            </div>

            {/* Conseils pour débutants */}
            <h3 style={{ 
              fontSize: '1.8rem', 
              fontWeight: '300', 
              marginBottom: '2rem',
              color: '#333'
            }}>
              Conseils pour bien débuter
            </h3>
            
            <div className="info-cards" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {beginnerTips.map((section, idx) => (
                <div key={idx} className="info-card" style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  padding: '2rem',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: '400', 
                    marginBottom: '1.2rem',
                    color: '#222'
                  }}>
                    {section.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
                    {section.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} style={{
                        marginBottom: '0.8rem',
                        paddingLeft: '1.2rem',
                        position: 'relative',
                        color: '#555',
                        lineHeight: '1.5',
                        fontSize: '0.95rem'
                      }}>
                        <span style={{ position: 'absolute', left: '0', color: '#999' }}>•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Progression */}
            <div style={{ 
              background: '#fafafa', 
              border: '1px solid #eee',
              padding: '2rem',
              marginTop: '2rem'
            }}>
              <h3 style={{ 
                marginBottom: '1.5rem', 
                fontWeight: '400',
                color: '#333'
              }}>
                Progression typique d'un grimpeur
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem'
              }}>
                {[
                  { stage: '0-6 mois', level: '5a-5c', focus: 'Technique de base' },
                  { stage: '6-18 mois', level: '6a-6c', focus: 'Force et endurance' },
                  { stage: '1.5-3 ans', level: '7a-7c', focus: 'Spécifique et mental' },
                  { stage: '3+ ans', level: '8a+', focus: 'Performance et projet' }
                ].map((step, idx) => (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    <div style={{ marginBottom: '0.8rem' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '400', color: '#333' }}>{step.stage}</div>
                      <div style={{ fontSize: '1rem', color: '#666', marginTop: '0.3rem' }}>{step.level}</div>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#777' }}>
                      {step.focus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sites d'escalade */}
        {activeTab === 'sites' && (
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '300', 
              marginBottom: '2rem',
              color: '#333',
              paddingBottom: '1rem',
              borderBottom: '1px solid #eee'
            }}>
              Sites d'escalade renommés
            </h2>
            
            <div style={{ marginBottom: '3rem' }}>
              {climbingSites.map((category, catIdx) => (
                <div key={catIdx} style={{ marginBottom: '3rem' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '400', 
                    marginBottom: '1.5rem',
                    color: '#333',
                    paddingBottom: '0.8rem',
                    borderBottom: '1px solid #eee'
                  }}>
                    {category.niveau}
                  </h3>
                  
                  <div className="info-cards" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                  }}>
                    {category.sites.map((site, siteIdx) => (
                      <div key={siteIdx} className="info-card" style={{
                        background: '#fff',
                        border: '1px solid #eee',
                        padding: '2rem',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                      }}>
                        <h3 style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: '400', 
                          marginBottom: '1rem',
                          color: '#222'
                        }}>
                          {site.nom}
                        </h3>
                        
                        <div style={{ marginBottom: '1rem', color: '#666', fontSize: '0.9rem' }}>
                          {site.pays}
                        </div>
                        
                        <p style={{ 
                          marginBottom: '1.5rem', 
                          lineHeight: '1.6',
                          color: '#555',
                          fontSize: '0.95rem'
                        }}>
                          {site.description}
                        </p>
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                          marginBottom: '1.5rem'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                              COTATION
                            </div>
                            <div style={{ fontWeight: '400', color: '#333' }}>
                              {site.cotation}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                              ALTITUDE
                            </div>
                            <div style={{ fontWeight: '400', color: '#333' }}>
                              {site.altitude}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                              SAISON
                            </div>
                            <div style={{ fontWeight: '400', color: '#333' }}>
                              {site.meilleureSaison}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75rem', color: '#777', marginBottom: '0.3rem', letterSpacing: '0.05em' }}>
                              NIVEAU
                            </div>
                            <div style={{ fontWeight: '400', color: '#333' }}>
                              {category.niveau}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vidéos */}
        {activeTab === 'videos' && (
          <div>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '300', 
              marginBottom: '2rem',
              color: '#333',
              paddingBottom: '1rem',
              borderBottom: '1px solid #eee'
            }}>
              Vidéos techniques et démonstrations
            </h2>
            
            <p style={{ 
              marginBottom: '2rem', 
              lineHeight: '1.6',
              color: '#666',
              fontSize: '1rem'
            }}>
              Apprenez des meilleurs grimpeurs grâce à ces démonstrations techniques.
              De la base aux manœuvres avancées, progressez en toute sécurité.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginBottom: '3rem'
            }}>
              {videos.map((video) => (
                <div key={video.id} className="info-card" style={{
                  background: '#fff',
                  border: '1px solid #eee',
                  padding: '2rem',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '0.4rem 0.8rem',
                      border: '1px solid #ddd',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      color: '#666',
                      letterSpacing: '0.05em'
                    }}>
                      {video.level}
                    </div>
                  </div>
                  
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: '400', 
                    marginBottom: '1rem',
                    color: '#222'
                  }}>
                    {video.title}
                  </h3>
                  
                  <p style={{ 
                    marginBottom: '1.5rem', 
                    lineHeight: '1.6',
                    color: '#555',
                    fontSize: '0.95rem'
                  }}>
                    {video.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    color: '#666',
                    fontSize: '0.85rem',
                    borderTop: '1px solid #eee',
                    paddingTop: '1rem'
                  }}>
                    <span>Durée: {video.duration}</span>
                    <span>Technique</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ 
              background: '#fafafa', 
              border: '1px solid #eee',
              padding: '2rem',
              marginTop: '2rem'
            }}>
              <h3 style={{ 
                marginBottom: '1.5rem', 
                fontWeight: '400',
                color: '#333'
              }}>
                Playlist recommandée
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  "Sécurité en grande voie",
                  "Techniques de repos",
                  "Gestion du mental",
                  "Récupération et blessures"
                ].map((playlist, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    borderBottom: '1px solid #eee'
                  }}>
                    <div style={{ fontWeight: '400', marginBottom: '0.3rem', color: '#333' }}>
                      {playlist}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      5 vidéos
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer avec avertissement */}
      <div className="randonnee-warning" style={{
        background: '#f8f8f8',
        borderTop: '1px solid #eee',
        padding: '2rem',
        textAlign: 'center',
        marginTop: '4rem'
      }}>
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem',
          maxWidth: '700px', 
          margin: '0 auto',
          lineHeight: '1.5'
        }}>
          L'escalade est un sport à risque. Toujours grimper avec un partenaire compétent, 
          vérifier son matériel systématiquement, et respecter ses limites. 
          En extérieur, consulter les prévisions météo et prévenir quelqu'un de son itinéraire.
        </p>
      </div>
    </div>
  );
};

export default Escalade;