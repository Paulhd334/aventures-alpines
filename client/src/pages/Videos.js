// src/pages/Videos.js
import React from 'react';


const Videos = () => {
  // Données de vidéos
  const videosData = [
    {
      id: 1,
      title: "Randonnée en montagne",
      description: "Découvrez les plus beaux sentiers de randonnée en montagne avec nos guides experts.",
      thumbnail: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      duration: "15:30",
      views: 15420,
      author: "Alpine Adventures",
      uploadDate: "2023-08-15",
      category: "Randonnée"
    },
    {
      id: 2,
      title: "Techniques d'escalade débutant",
      description: "Apprenez les bases de l'escalade avec notre guide complet pour débutants.",
      thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      duration: "22:45",
      views: 8921,
      author: "ClimbingPro",
      uploadDate: "2023-07-22",
      category: "Escalade"
    },
    {
      id: 3,
      title: "Ski hors-piste sécurité",
      description: "Les règles de sécurité essentielles pour pratiquer le ski hors-piste en toute sécurité.",
      thumbnail: "https://images.unsplash.com/photo-1543321269-9d86d3680e1c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      duration: "18:15",
      views: 23105,
      author: "SkiExpert",
      uploadDate: "2023-09-10",
      category: "Ski"
    },
    {
      id: 4,
      title: "Préparation physique montagne",
      description: "Programme d'entraînement pour préparer votre corps aux défis de la montagne.",
      thumbnail: "https://images.unsplash.com/photo-1534367507877-0edd93bd013b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      duration: "25:40",
      views: 12456,
      author: "MountainCoach",
      uploadDate: "2023-06-05",
      category: "Fitness"
    },
    {
      id: 5,
      title: "Matériel d'alpinisme",
      description: "Guide complet pour choisir le matériel d'alpinisme adapté à votre niveau.",
      thumbnail: "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      duration: "28:20",
      views: 18765,
      author: "GearGuide",
      uploadDate: "2023-05-28",
      category: "Matériel"
    },
    {
      id: 6,
      title: "Itinéraires Alpes françaises",
      description: "Découverte des plus beaux itinéraires de randonnée dans les Alpes françaises.",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      duration: "32:10",
      views: 9345,
      author: "AlpineGuide",
      uploadDate: "2023-08-12",
      category: "Randonnée"
    }
  ];

  const [filter, setFilter] = React.useState('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredVideos = videosData.filter(video => {
    const matchesCategory = filter === 'all' || video.category === filter;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['all', ...new Set(videosData.map(video => video.category))];

  return (
    <div className="videos-page">
      <header className="videos-header">
        <h1>Vidéos Aventures Alpines</h1>
        <p className="subtitle">Découvrez nos tutoriels, guides et aventures en montagne</p>
        
        <div className="controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Rechercher une vidéo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${filter === category ? 'active' : ''}`}
                onClick={() => setFilter(category)}
              >
                {category === 'all' ? 'Toutes' : category}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="videos-container">
        {filteredVideos.length > 0 ? (
          <div className="videos-grid">
            {filteredVideos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  <div className="video-duration">{video.duration}</div>
                  <div className="video-category">{video.category}</div>
                </div>
                
                <div className="video-content">
                  <h3 className="video-title">{video.title}</h3>
                  <p className="video-description">{video.description}</p>
                  
                  <div className="video-meta">
                    <div className="video-author">
                      <span className="author-icon">👤</span>
                      <span>{video.author}</span>
                    </div>
                    
                    <div className="video-stats">
                      <div className="views">
                        <span className="views-icon">👁️</span>
                        <span>{video.views.toLocaleString()} vues</span>
                      </div>
                      <div className="upload-date">
                        <span className="date-icon">📅</span>
                        <span>{new Date(video.uploadDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button className="watch-btn">
                    <span className="play-icon">▶</span>
                    Regarder la vidéo
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <p>Aucune vidéo ne correspond à votre recherche.</p>
            <button onClick={() => {
              setFilter('all');
              setSearchTerm('');
            }}>Réinitialiser les filtres</button>
          </div>
        )}
        
        <div className="stats">
          <p>{filteredVideos.length} vidéo{filteredVideos.length !== 1 ? 's' : ''} trouvée{filteredVideos.length !== 1 ? 's' : ''}</p>
        </div>
      </main>
    </div>
  );
};

export default Videos;