require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'dev-secret-key-aventures-alpines-2024';

console.log('🔧 Démarrage serveur...');

// Configuration MySQL Railway avec SSL
const dbConfig = {
  host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
  database: process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQL_PORT || 11303,
  
  // CONFIGURATION SSL OBLIGATOIRE POUR RAILWAY
  ssl: {
    rejectUnauthorized: false
  },
  
  // Configuration pour Vercel
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 10000, // 10 secondes
  idleTimeout: 60000, // Fermer après 60s d'inactivité
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let pool;

// Fonction pour créer/re-créer le pool
async function createPool() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test de connexion
    const connection = await pool.getConnection();
    console.log('✅ Connexion MySQL Railway établie!');
    
    // Initialisation DB
    await initializeDatabase(connection);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error.message);
    console.error('Code erreur:', error.code);
    return false;
  }
}

// Initialisation DB
async function initializeDatabase(connection) {
  try {
    // Vérifier/Créer tables
    await connection.execute(`
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
      )
    `);
    
    // Vérifier si vide
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM activites');
    
    if (rows[0].count === 0) {
      console.log('📥 Insertion des activités...');
      const activities = [
        ['Ski alpin à Chamonix', 'ski', 'Intermédiaire', 'Des pistes mythiques', 'https://picsum.photos/800/600?random=1', 'Chamonix', 45.00, '1 journée', 'Hiver'],
        ['Randonnée du Lac Blanc', 'randonnee', 'Facile', 'Randonnée familiale', 'https://picsum.photos/800/600?random=2', 'Argentière', 25.00, '3h30', 'Été']
      ];
      
      for (const activity of activities) {
        await connection.execute(
          'INSERT IGNORE INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          activity
        );
      }
      console.log('✅ Activités insérées');
    }
    
    console.log(`📊 ${rows[0].count} activités dans la base`);
  } catch (error) {
    console.error('❌ Erreur initialisation DB:', error.message);
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// Middleware pour gérer la DB
app.use(async (req, res, next) => {
  if (!pool) {
    await createPool();
  }
  next();
});

// ====================
// ROUTES
// ====================

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Aventures Alpines',
    status: 'online',
    mysql: pool ? 'connecté' : 'déconnecté',
    timestamp: new Date().toISOString()
  });
});

// Test connexion MySQL
app.get('/api/test-mysql', async (req, res) => {
  try {
    if (!pool) {
      const connected = await createPool();
      if (!connected) {
        return res.status(503).json({ error: 'MySQL non disponible' });
      }
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query('SELECT 1 as test, NOW() as time');
    connection.release();
    
    res.json({
      success: true,
      message: 'MySQL connecté',
      data: result[0]
    });
  } catch (error) {
    console.error('Test MySQL error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// Récupérer activités
app.get('/api/activites', async (req, res) => {
  try {
    if (!pool) {
      return res.json([
        {
          id: 1,
          nom: "Ski alpin à Chamonix",
          type: "ski",
          difficulte: "Intermédiaire",
          description: "Données mockées - DB hors ligne",
          image_url: "https://picsum.photos/800/600?random=1",
          lieu: "Chamonix",
          prix: 45.00,
          duree: "1 journée",
          saison: "Hiver"
        }
      ]);
    }
    
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM activites ORDER BY created_at DESC');
    connection.release();
    
    res.json(results);
  } catch (error) {
    console.error('Erreur /api/activites:', error.message);
    
    // Données mockées en cas d'erreur
    res.json([
      {
        id: 1,
        nom: "Ski alpin à Chamonix (erreur DB)",
        type: "ski",
        difficulte: "Intermédiaire",
        description: "Erreur base de données",
        image_url: "https://picsum.photos/800/600?random=1",
        lieu: "Chamonix",
        prix: 45.00,
        duree: "1 journée",
        saison: "Hiver"
      }
    ]);
  }
});

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nom_utilisateur, email, mot_de_passe } = req.body;
    
    if (!nom_utilisateur || !email || !mot_de_passe) {
      return res.status(400).json({ error: 'Tous les champs requis' });
    }
    
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const token = jwt.sign(
      { userId: Date.now(), nom_utilisateur, email, role: 'user' },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Inscription réussie',
      token,
      user: { id: Date.now(), nom_utilisateur, email, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;
    
    if (!email || !mot_de_passe) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    // Simulation - dans la vraie version, vérifier dans la DB
    const token = jwt.sign(
      { userId: 1, email, role: 'user' },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: 1, email, role: 'user' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ====================
// DÉMARRAGE SERVEUR
// ====================
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Essayer de connecter à MySQL
    await createPool();
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 SERVEUR DÉMARRÉ SUR LE PORT ${PORT}`);
      console.log('='.repeat(50));
      console.log(`🌐 http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api/activites`);
      console.log(`🔍 Test MySQL: http://localhost:${PORT}/api/test-mysql`);
      console.log('='.repeat(50));
    });
  } catch (error) {
    console.error('Erreur démarrage serveur:', error);
  }
}

// Pour Vercel
module.exports = app;

// Pour développement local
if (require.main === module) {
  startServer();
}