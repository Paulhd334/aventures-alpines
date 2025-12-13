const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 5000;

// ====================
// CONFIGURATION MAMP
// ====================
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'aventures_alpines',
  port: 8889,
  connectTimeout: 10000
});

// ====================
// TEST CONNEXION MAMP
// ====================
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL MAMP:', err.message);
  } else {
    console.log('✅ Connecté à MySQL MAMP!');
    console.log('   Host: localhost:8889');
    console.log('   Base: aventures_alpines');
    setupDatabase(); // UNE SEULE FONCTION
  }
});

// ====================
// SETUP DATABASE (une seule fonction)
// ====================
function setupDatabase() {
  console.log('📦 Configuration de la base de données...');
  
  // Étape 1: Supprimer l'ancienne table si elle existe
  db.query('DROP TABLE IF EXISTS activites', (dropErr) => {
    if (dropErr) {
      console.error('❌ Erreur suppression table:', dropErr.message);
      return;
    }
    
    console.log('♻️  Ancienne table supprimée (si existante)');
    
    // Étape 2: Créer la nouvelle table
    const createTableSQL = `
      CREATE TABLE activites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        difficulte VARCHAR(50),
        description TEXT,
        image_url VARCHAR(255),
        lieu VARCHAR(100),
        prix DECIMAL(10,2),
        duree VARCHAR(50),
        saison VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    db.query(createTableSQL, (createErr) => {
      if (createErr) {
        console.error('❌ Erreur création table:', createErr.message);
        return;
      }
      
      console.log('✅ Table "activites" créée');
      
      // Étape 3: Vérifier si la table est vide
      db.query('SELECT COUNT(*) as count FROM activites', (countErr, results) => {
        if (countErr) {
          console.error('❌ Erreur vérification données:', countErr.message);
          return;
        }
        
        if (results[0].count === 0) {
          console.log('📥 Table vide, insertion des données...');
          insertSampleData();
        } else {
          console.log(`📊 ${results[0].count} activités déjà présentes`);
        }
      });
    });
  });
}

// ====================
// INSERTION DONNÉES
// ====================
function insertSampleData() {
  const activites = [
    // nom, type, difficulte, description, image_url, lieu, prix, duree, saison
    ['Ski alpin à Chamonix', 'ski', 'Intermédiaire', 'Des pistes mythiques pour tous les niveaux', 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=400&h=250&fit=crop', 'Chamonix', 45.00, '1 journée', 'Hiver'],
    ['Randonnée du Lac Blanc', 'randonnee', 'Facile', 'Randonnée familiale avec vue magnifique', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop', 'Argentière', 25.00, '3h30', 'Été'],
    ['Escalade aux Drus', 'escalade', 'Expert', 'Voies techniques en haute montagne', 'https://images.unsplash.com/photo-1519627913492-3f77d9ec0e20?w=400&h=250&fit=crop', 'Les Drus', 120.00, '8-10 heures', 'Été'],
    ['Ski de fond aux Contamines', 'ski', 'Débutant', '100km de pistes damées', 'https://images.unsplash.com/photo-1543321269-9d86d3680e1c?w=400&h=250&fit=crop', 'Les Contamines', 25.00, '1 journée', 'Hiver'],
    ['Via Ferrata du Brevent', 'escalade', 'Intermédiaire', 'Parcours sécurisé avec échelles', 'https://images.unsplash.com/photo-1559295807-7d10f5370e82?w=400&h=250&fit=crop', 'Chamonix', 65.00, '4 heures', 'Été'],
    ['Raquettes au Col de Balme', 'randonnee', 'Facile', 'Balade en raquettes', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=250&fit=crop', 'Col de Balme', 35.00, '2h30', 'Hiver']
  ];
  
  const sql = 'INSERT INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES ?';
  
  db.query(sql, [activites], (err, result) => {
    if (err) {
      console.error('❌ Erreur insertion:', err.message);
      console.log('Détail:', err.sqlMessage);
    } else {
      console.log(`✅ ${result.affectedRows} activités insérées`);
    }
  });
}

// ====================
// MIDDLEWARE
// ====================
app.use(cors());
app.use(express.json());

// ====================
// ROUTES API
// ====================

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Aventures Alpines fonctionne !',
    status: 'online',
    database: 'MySQL MAMP',
    timestamp: new Date().toISOString()
  });
});

// GET toutes les activités
app.get('/api/activites', (req, res) => {
  const sql = 'SELECT * FROM activites ORDER BY created_at DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erreur MySQL:', err.message);
      // Fallback aux données mockées
      res.json(getMockData());
    } else {
      // Transformer les noms de champs
      const activites = results.map(activite => ({
        id: activite.id,
        name: activite.nom,
        type: activite.type,
        difficulty: activite.difficulte,
        description: activite.description,
        image: activite.image_url,
        location: activite.lieu,
        price: activite.prix,
        duration: activite.duree,
        season: activite.saison,
        created_at: activite.created_at
      }));
      res.json(activites);
    }
  });
});

// GET une activité par ID
app.get('/api/activites/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM activites WHERE id = ?';
  
  db.query(sql, [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'Activité non trouvée' });
    } else {
      const activite = results[0];
      res.json({
        id: activite.id,
        name: activite.nom,
        type: activite.type,
        difficulty: activite.difficulte,
        description: activite.description,
        image: activite.image_url,
        location: activite.lieu,
        price: activite.prix,
        duration: activite.duree,
        season: activite.saison
      });
    }
  });
});

// Données mockées en cas d'erreur
function getMockData() {
  return [
    { 
      id: 1, 
      name: "Ski à Chamonix",
      type: "ski", 
      difficulty: "Intermédiaire",
      description: "Des pistes mythiques pour tous les niveaux",
      image: "https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=400&h=250&fit=crop",
      location: "Chamonix",
      price: 45.00,
      duration: "1 journée",
      season: "Hiver"
    },
    { 
      id: 2, 
      name: "Randonnée Lac Blanc", 
      type: "randonnee", 
      difficulty: "Facile",
      description: "Randonnée familiale avec vue magnifique",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=250&fit=crop",
      location: "Argentière",
      price: 25.00,
      duration: "3h30",
      season: "Été"
    }
  ];
}

// ====================
// DÉMARRAGE
// ====================
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📊 MySQL MAMP: localhost:8889`);
  console.log(`👤 Utilisateur: root`);
  console.log(`💾 Base: aventures_alpines`);
  console.log(`🔄 Redémarrage: Ctrl+C puis "npm run dev"\n`);
});