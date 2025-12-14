const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ====================
// CONFIGURATION INITIALE
// ====================
const app = express();
const PORT = 5000;
const SECRET_KEY = 'votre_secret_jwt_aventures_alpines_2024'; // À changer en production

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
// MIDDLEWARE
// ====================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// ====================
// TEST CONNEXION MAMP
// ====================
db.connect((err) => {
  if (err) {
    console.error('❌ Erreur connexion MySQL MAMP:', err.message);
    console.log('📌 Vérifiez que:');
    console.log('   1. MAMP est démarré');
    console.log('   2. MySQL tourne sur le port 8889');
    console.log('   3. La base "aventures_alpines" existe dans phpMyAdmin');
  } else {
    console.log('✅ Connecté à MySQL MAMP!');
    console.log('   Host: localhost:8889');
    console.log('   Base: aventures_alpines');
    setupAllTables();
  }
});

// ====================
// SETUP DE TOUTES LES TABLES
// ====================
async function setupAllTables() {
  console.log('📦 Configuration des tables...');
  
  // Créer la table utilisateurs si elle n'existe pas
  const createUsersTableSQL = `
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      mot_de_passe VARCHAR(255) NOT NULL,
      date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      role ENUM('user', 'admin') DEFAULT 'user'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;
  
  db.query(createUsersTableSQL, (err) => {
    if (err) {
      console.error('❌ Erreur création table utilisateurs:', err.message);
    } else {
      console.log('✅ Table "utilisateurs" vérifiée/créée');
    }
  });
  
  // Créer la table activités si elle n'existe pas
  const createActivitesTableSQL = `
    CREATE TABLE IF NOT EXISTS activites (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;
  
  db.query(createActivitesTableSQL, (err) => {
    if (err) {
      console.error('❌ Erreur création table activites:', err.message);
    } else {
      console.log('✅ Table "activites" vérifiée/créée');
      
      // Vérifier si la table est vide
      db.query('SELECT COUNT(*) as count FROM activites', (countErr, results) => {
        if (countErr) {
          console.error('❌ Erreur vérification données activites:', countErr.message);
        } else {
          if (results[0].count === 0) {
            console.log('📥 Table activites vide, insertion des données...');
            insertSampleActivites();
          } else {
            console.log(`📊 ${results[0].count} activités déjà présentes`);
          }
        }
      });
    }
  });
}

// ====================
// INSERTION DONNÉES D'EXEMPLE (activités)
// ====================
function insertSampleActivites() {
  const activites = [
    ['Ski alpin à Chamonix', 'ski', 'Intermédiaire', 'Des pistes mythiques pour tous les niveaux', 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?w=800&h=600&fit=crop', 'Chamonix', 45.00, '1 journée', 'Hiver'],
    ['Randonnée du Lac Blanc', 'randonnee', 'Facile', 'Randonnée familiale avec vue magnifique', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop', 'Argentière', 25.00, '3h30', 'Été'],
    ['Escalade aux Drus', 'escalade', 'Expert', 'Voies techniques en haute montagne', 'https://images.unsplash.com/photo-1597250861267-429663f244a8?w=800&h=600&fit=crop', 'Les Drus', 120.00, '8-10 heures', 'Été'],
    ['Ski de fond aux Contamines', 'ski', 'Débutant', '100km de pistes damées', 'https://images.unsplash.com/photo-1645999139629-9fd6e5128a17?w=800&h=600&fit=crop', 'Les Contamines', 25.00, '1 journée', 'Hiver'],
    ['Via Ferrata du Brevent', 'escalade', 'Intermédiaire', 'Parcours sécurisé avec échelles', 'https://images.unsplash.com/photo-1597250861267-429663f244a8?w=800&h=600&fit=crop', 'Chamonix', 65.00, '4 heures', 'Été'],
    ['Raquettes au Col de Balme', 'randonnee', 'Facile', 'Balade en raquettes au coucher du soleil', 'https://images.unsplash.com/photo-1728081931321-259cebd46e2c?w=800&h=600&fit=crop', 'Col de Balme', 35.00, '2h30', 'Hiver']
  ];
  
  const sql = 'INSERT INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES ?';
  
  db.query(sql, [activites], (err, result) => {
    if (err) {
      console.error('❌ Erreur insertion activités:', err.message);
    } else {
      console.log(`✅ ${result.affectedRows} activités insérées`);
    }
  });
}

// ====================
// ROUTES D'AUTHENTIFICATION
// ====================

// Route d'inscription
app.post('/api/auth/register', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe } = req.body;

  // Validation basique
  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  if (mot_de_passe.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const checkSql = 'SELECT * FROM utilisateurs WHERE email = ? OR nom_utilisateur = ?';
    db.query(checkSql, [email, nom_utilisateur], async (err, results) => {
      if (err) {
        console.error('❌ Erreur vérification utilisateur:', err.message);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ error: 'Email ou nom d\'utilisateur déjà utilisé' });
      }

      // Hacher le mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      // Insérer l'utilisateur
      const insertSql = 'INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe) VALUES (?, ?, ?)';
      db.query(insertSql, [nom_utilisateur, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('❌ Erreur insertion utilisateur:', err.message);
          return res.status(500).json({ error: 'Erreur lors de l\'inscription' });
        }

        // Créer un token JWT
        const token = jwt.sign(
          { 
            userId: result.insertId, 
            nom_utilisateur, 
            email,
            role: 'user'
          },
          SECRET_KEY,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          message: 'Inscription réussie',
          token,
          user: {
            id: result.insertId,
            nom_utilisateur,
            email,
            role: 'user'
          }
        });
      });
    });
  } catch (error) {
    console.error('❌ Erreur inscription:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route de connexion
app.post('/api/auth/login', (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const sql = 'SELECT * FROM utilisateurs WHERE email = ?';
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('❌ Erreur connexion:', err.message);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = results[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Créer un token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        nom_utilisateur: user.nom_utilisateur, 
        email: user.email,
        role: user.role
      },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role,
        date_inscription: user.date_inscription
      }
    });
  });
});

// Route pour vérifier le token
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({ 
      valid: true, 
      user: decoded 
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      error: 'Token invalide ou expiré' 
    });
  }
});

// Route pour récupérer le profil utilisateur
app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    const sql = 'SELECT id, nom_utilisateur, email, date_inscription, role FROM utilisateurs WHERE id = ?';
    db.query(sql, [decoded.userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      res.json({ user: results[0] });
    });
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

// ====================
// ROUTES DES ACTIVITÉS
// ====================

// Route de test
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Aventures Alpines',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
        profile: 'GET /api/auth/profile'
      },
      activities: {
        all: 'GET /api/activites',
        byId: 'GET /api/activites/:id',
        create: 'POST /api/activites'
      }
    }
  });
});


// ====================
// ROUTES DES PUBLICATIONS
// ====================

// Créer la table publications si elle n'existe pas (AJOUTE CETTE LIGNE)
const createPublicationsTableSQL = `
  CREATE TABLE IF NOT EXISTS publications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    titre VARCHAR(200) NOT NULL,
    contenu TEXT NOT NULL,
    type ENUM('article', 'photo', 'recit', 'conseil') DEFAULT 'recit',
    image_url VARCHAR(255),
    lieu VARCHAR(100),
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
`;

// Exécuter la création de table (AJOUTE CETTE FONCTION)
db.query(createPublicationsTableSQL, (err) => {
  if (err) {
    console.error('❌ Erreur création table publications:', err.message);
  } else {
    console.log('✅ Table "publications" vérifiée/créée');
  }
});

// Route pour récupérer les publications d'un utilisateur (AJOUTE CETTE ROUTE)
app.get('/api/users/:userId/publications', (req, res) => {
  const userId = req.params.userId;
  
  const sql = `
    SELECT p.*, u.nom_utilisateur 
    FROM publications p
    JOIN utilisateurs u ON p.user_id = u.id
    WHERE p.user_id = ?
    ORDER BY p.date_publication DESC
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('❌ Erreur publications:', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

// Route pour créer une publication (AJOUTE CETTE ROUTE)
app.post('/api/publications', (req, res) => {
  // Vérifier l'authentification
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  const token = authHeader.split(' ')[1];
  let userId;
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    userId = decoded.userId;
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }

  const { titre, contenu, type, image_url, lieu } = req.body;
  
  // Validation
  if (!titre || !contenu) {
    return res.status(400).json({ error: 'Titre et contenu requis' });
  }

  const sql = 'INSERT INTO publications (user_id, titre, contenu, type, image_url, lieu) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [userId, titre, contenu, type || 'recit', image_url, lieu];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erreur création publication:', err.message);
      res.status(500).json({ error: 'Erreur création publication' });
    } else {
      res.status(201).json({ 
        message: 'Publication créée avec succès',
        id: result.insertId 
      });
    }
  });
});

// Dans server.js, ajoute :
app.get('/api/publications', (req, res) => {
  const sql = `
    SELECT p.*, u.nom_utilisateur 
    FROM publications p
    JOIN utilisateurs u ON p.user_id = u.id
    ORDER BY p.date_publication DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erreur récupération publications:', err.message);
      res.status(500).json({ error: 'Erreur serveur' });
    } else {
      res.json(results);
    }
  });
});

// GET toutes les activités
app.get('/api/activites', (req, res) => {
  const sql = 'SELECT * FROM activites ORDER BY created_at DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Erreur MySQL:', err.message);
      res.status(500).json({ error: 'Erreur base de données' });
    } else {
      res.json(results);
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
      res.json(results[0]);
    }
  });
});

// POST nouvelle activité (protégé)
app.post('/api/activites', (req, res) => {
  // Vérifier l'authentification
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Non autorisé. Connectez-vous d\'abord.' });
  }

  const { nom, type, difficulte, description, image_url, lieu, prix, duree, saison } = req.body;
  
  const sql = 'INSERT INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [nom, type, difficulte, description, image_url, lieu, prix || 0, duree, saison];
  
  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Erreur insertion activité:', err.message);
      res.status(500).json({ error: 'Erreur création activité' });
    } else {
      res.status(201).json({ 
        message: 'Activité créée avec succès',
        id: result.insertId 
      });
    }
  });
});

// ====================
// DÉMARRAGE SERVEUR
// ====================
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur API démarré sur http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles:`);
  console.log(`   🔐 AUTH: http://localhost:${PORT}/api/auth/register`);
  console.log(`   🏔️ ACTIVITÉS: http://localhost:${PORT}/api/activites`);
  console.log(`\n📊 MySQL: localhost:8889/aventures_alpines`);
  console.log(`👤 User: root | Pass: root`);
  console.log(`\n🔄 Redémarrage: Ctrl+C puis "npm run dev"`);
  console.log(`==============================================\n`);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});