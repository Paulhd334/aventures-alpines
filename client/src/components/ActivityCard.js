// client/src/components/ActivityCard.js
import React from 'react';

const ActivityCard = ({ activity }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '10px',
      padding: '20px',
      margin: '15px',
      width: '300px',
      backgroundColor: 'white',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <img 
        src={activity.image} 
        alt={activity.name}
        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }}
      />
      <h3 style={{ marginTop: '15px', marginBottom: '10px' }}>{activity.name}</h3>
      <p style={{ color: '#666', marginBottom: '15px' }}>{activity.description}</p>
      <div style={{
        display: 'inline-block',
        backgroundColor: activity.difficulty === 'Facile' ? '#4CAF50' : 
                        activity.difficulty === 'Intermédiaire' ? '#FF9800' : '#F44336',
        color: 'white',
        padding: '5px 15px',
        borderRadius: '20px',
        fontSize: '0.9rem'
      }}>
        {activity.difficulty}
      </div>
    </div>
  );
};

export default ActivityCard;