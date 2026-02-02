// src/components/HikingRoute.js
import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const HikingRoute = ({ itineraire }) => {
  // Protection si données non chargées
  if (!itineraire || typeof itineraire !== "object") {
    return null;
  }

  const {
    id,
    nom = "Itinéraire",
    image,
    difficulte = "Inconnue",
    duree = "?",
    distance = "?",
    denivele = "?",
    description = "",
    pointDepart = "Non précisé",
    pointArrivee = "Non précisé",
    saison = "Non précisée",
    gpsTrack
  } = itineraire;

  const getDifficultyColor = (d) => {
    switch (d) {
      case 'Facile': return '#4caf50';
      case 'Intermédiaire': return '#ff9800';
      case 'Difficile': return '#f44336';
      case 'Expert': return '#9c27b0';
      default: return '#607d8b';
    }
  };

  const handleDownloadGPX = () => {
    if (!gpsTrack) {
      console.warn("Track GPS non disponible");
      return;
    }

    // Sécurité : noopener + noreferrer
    const newWindow = window.open(gpsTrack, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
  };

  const imageSrc = image || "https://picsum.photos/800/600";

  return (
    <article className="hiking-route-card">
      <div className="route-image">
        <img
          src={imageSrc}
          alt={`Itinéraire ${nom}`}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://picsum.photos/800/600?fallback";
          }}
        />

        <div
          className="route-difficulty"
          style={{ backgroundColor: getDifficultyColor(difficulte) }}
        >
          {difficulte}
        </div>
      </div>

      <div className="route-content">
        <div className="route-header">
          <h3>{nom}</h3>

          <div className="route-meta">
            <span>⏱️ {duree}</span>
            <span>📏 {distance}</span>
            <span>⛰️ {denivele}</span>
          </div>
        </div>

        {description && (
          <p className="route-description">
            {description}
          </p>
        )}

        <div className="route-details">
          <div className="detail-item">
            <span>📍 Départ:</span>
            <span>{pointDepart}</span>
          </div>

          <div className="detail-item">
            <span>🏁 Arrivée:</span>
            <span>{pointArrivee}</span>
          </div>

          <div className="detail-item">
            <span>🌤️ Saison:</span>
            <span>{saison}</span>
          </div>
        </div>

        <div className="route-actions">
          {id && (
            <Link to={`/itineraires/${id}`} className="btn btn-primary">
              Voir les détails
            </Link>
          )}

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleDownloadGPX}
            disabled={!gpsTrack}
          >
            📥 Télécharger GPX
          </button>
        </div>
      </div>
    </article>
  );
};

HikingRoute.propTypes = {
  itineraire: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    nom: PropTypes.string,
    image: PropTypes.string,
    difficulte: PropTypes.string,
    duree: PropTypes.string,
    distance: PropTypes.string,
    denivele: PropTypes.string,
    description: PropTypes.string,
    pointDepart: PropTypes.string,
    pointArrivee: PropTypes.string,
    saison: PropTypes.string,
    gpsTrack: PropTypes.string
  })
};

export default HikingRoute;
