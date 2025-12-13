const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Pour parser le JSON

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API Aventures Alpines fonctionne !' });
});

// Routes des activités (GET)
app.get('/api/activites', (req, res) => {
  // À remplacer par connexion MySQL
  const activites = [
    { 
      id: 1, 
      name: "Ski à Chamonix",
      type: "ski", 
      difficulty: "Intermédiaire",
      description: "Des pistes mythiques pour tous les niveaux",
      image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=400&h=250&fit=crop"
    },
    { 
      id: 2, 
      name: "Randonnée Lac Blanc", 
      type: "randonnee", 
      difficulty: "Facile",
      description: "Randonnée familiale avec vue magnifique",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop"
    }
  ];
  res.json(activites);
});

// Route POST (ajouter activité)
app.post('/api/activites', (req, res) => {
  const nouvelleActivite = req.body;
  console.log('Nouvelle activité reçue:', nouvelleActivite);
  // Ici: insérer dans MySQL
  res.status(201).json({ message: 'Activité créée avec succès', activite: nouvelleActivite });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
});