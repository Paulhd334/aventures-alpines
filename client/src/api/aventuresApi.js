import axios from 'axios';

// Configuration de base pour Axios
const aventuresApi = axios.create({
  baseURL: 'http://localhost:5000/api', // Votre API Express
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Fonctions API
export const activitesAPI = {
  // Récupérer toutes les activités
  getAll: () => aventuresApi.get('/activites'),
  
  // Récupérer une activité par ID
  getById: (id) => aventuresApi.get(`/activites/${id}`),
  
  // Créer une nouvelle activité
  create: (activiteData) => aventuresApi.post('/activites', activiteData)
};

export default aventuresApi;