require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Version promise pour Vercel
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ====================
// CONFIGURATION SÉCURISÉE
// ====================
const app = express();

// IMPORTANT: Dans Vercel, définis ces variables dans Settings > Environment Variables
const SECRET_KEY = process.env.SECRET_KEY || process.env.JWT_SECRET;
if (!SECRET_KEY) {
  console.warn('⚠️  SECRET_KEY non définie. Utilise une valeur temporaire pour le développement.');
}

// Configuration MySQL avec pool (obligatoire pour Vercel Serverless)
const dbConfig = {
  host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
  database: process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQL_PORT || 11303,
  waitForConnections: true,
  connectionLimit: 10, // Réduit pour Serverless
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Création du pool de connexions
let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log('✅ Pool MySQL créé avec succès');
} catch (err) {
  console.error('❌ Erreur création pool MySQL:', err.message);
}

// ====================
// MIDDLEWARE SÉCURISÉ
// ====================
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://ton-site.vercel.app']
    : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de sécurité
app.use((req, res, next) => {
  // Headers de sécurité
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Logging
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ====================
// FONCTIONS UTILITAIRES
// ====================
async function getConnection() {
  try {
    if (!pool) {
      throw new Error('Pool MySQL non initialisé');
    }
    const connection = await pool.getConnection();
    return connection;
  } catch (err) {
    console.error('❌ Erreur de connexion MySQL:', err.message);
    throw err;
  }
}

async function initializeDatabase() {
  if (!pool) return;
  
  let connection;
  try {
    connection = await getConnection();
    
    console.log('🔍 Initialisation de la base de données...');
    
    // Table utilisateurs
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mot_de_passe VARCHAR(255) NOT NULL,
        date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        role ENUM('user', 'admin') DEFAULT 'user',
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Table "utilisateurs" vérifiée/créée');

    // Table activités
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_saison (saison)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Table "activites" vérifiée/créée');

    // Vérifier si des données existent
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM activites');
    
    if (rows[0].count === 0) {
      console.log('📥 Insertion des données exemple...');
      await insertSampleData(connection);
    }

  } catch (err) {
    console.error('❌ Erreur initialisation DB:', err.message);
  } finally {
    if (connection) connection.release();
  }
}

async function insertSampleData(connection) {
  const activites = [
    ['Ski alpin à Chamonix', 'ski', 'Intermédiaire', 'Des pistes mythiques pour tous les niveaux', 'https://picsum.photos/800/600?random=1', 'Chamonix', 45.00, '1 journée', 'Hiver'],
    ['Randonnée du Lac Blanc', 'randonnee', 'Facile', 'Randonnée familiale avec vue magnifique', 'https://picsum.photos/800/600?random=2', 'Argentière', 25.00, '3h30', 'Été'],
    ['Escalade aux Drus', 'escalade', 'Expert', 'Voies techniques en haute montagne', 'https://picsum.photos/800/600?random=3', 'Les Drus', 120.00, '8-10 heures', 'Été'],
    ['Ski de fond aux Contamines', 'ski', 'Débutant', '100km de pistes damées', 'https://picsum.photos/800/600?random=4', 'Les Contamines', 25.00, '1 journée', 'Hiver'],
    ['Via Ferrata du Brevent', 'escalade', 'Intermédiaire', 'Parcours sécurisé avec échelles', 'https://picsum.photos/800/600?random=5', 'Chamonix', 65.00, '4 heures', 'Été'],
    ['Raquettes au Col de Balme', 'randonnee', 'Facile', 'Balade en raquettes au coucher du soleil', 'https://picsum.photos/800/600?random=6', 'Col de Balme', 35.00, '2h30', 'Hiver']
  ];

  try {
    for (const activite of activites) {
      await connection.execute(
        'INSERT IGNORE INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        activite
      );
    }
    console.log('✅ Données exemple insérées');
  } catch (err) {
    console.error('❌ Erreur insertion données:', err.message);
  }
}

// ====================
// MIDDLEWARE D'AUTHENTIFICATION
// ====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide ou expiré' });
    }
    req.user = user;
    next();
  });
}

// ====================
// ROUTES API
// ====================

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API Aventures Alpines - VERSION SÉCURISÉE',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      activites: 'GET /api/activites',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      profile: 'GET /api/profile (authentifié)',
      health: 'GET /api/health'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
    
    const connection = await getConnection();
    const [result] = await connection.execute('SELECT 1 as status');
    connection.release();
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Récupérer toutes les activités
app.get('/api/activites', async (req, res) => {
  try {
    const connection = await getConnection();
    const [results] = await connection.execute(
      'SELECT * FROM activites ORDER BY created_at DESC'
    );
    connection.release();
    
    res.json(results);
  } catch (err) {
    console.error('Erreur /api/activites:', err.message);
    res.status(500).json({ 
      error: 'Erreur serveur',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Recherche d'activités
app.get('/api/activites/search', async (req, res) => {
  const { q, type, saison } = req.query;
  
  try {
    const connection = await getConnection();
    let query = 'SELECT * FROM activites WHERE 1=1';
    const params = [];
    
    if (q) {
      query += ' AND (nom LIKE ? OR description LIKE ? OR lieu LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (saison) {
      query += ' AND saison = ?';
      params.push(saison);
    }
    
    query += ' ORDER BY nom';
    
    const [results] = await connection.execute(query, params);
    connection.release();
    
    res.json(results);
  } catch (err) {
    console.error('Erreur recherche:', err.message);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Inscription sécurisée
app.post('/api/auth/register', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe } = req.body;
  
  // Validation
  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  if (!SECRET_KEY) {
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }
  
  if (mot_de_passe.length < 8) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }

  let connection;
  try {
    connection = await getConnection();
    const hashedPassword = await bcrypt.hash(mot_de_passe, 12); // Coût plus élevé pour plus de sécurité
    
    const [result] = await connection.execute(
      'INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe) VALUES (?, ?, ?)',
      [nom_utilisateur, email, hashedPassword]
    );

    const token = jwt.sign(
      { 
        userId: result.insertId, 
        nom_utilisateur, 
        email, 
        role: 'user' 
      },
      SECRET_KEY,
      { expiresIn: '7d' } // Expiration plus courte pour plus de sécurité
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

  } catch (err) {
    console.error('Erreur inscription:', err.message);
    
    let errorMessage = 'Erreur serveur';
    let statusCode = 500;
    
    if (err.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Nom d\'utilisateur ou email déjà utilisé';
      statusCode = 409;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  } finally {
    if (connection) connection.release();
  }
});

// Connexion sécurisée
app.post('/api/auth/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  if (!SECRET_KEY) {
    return res.status(500).json({ error: 'Configuration serveur incomplète' });
  }

  let connection;
  try {
    connection = await getConnection();
    const [users] = await connection.execute(
      'SELECT * FROM utilisateurs WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Ne pas révéler si l'email existe ou pas (security)
      await bcrypt.compare(mot_de_passe, '$2a$12$fakehashforsecurity'); // Timing attack protection
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        nom_utilisateur: user.nom_utilisateur, 
        email: user.email, 
        role: user.role 
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom_utilisateur: user.nom_utilisateur,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('Erreur connexion:', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) connection.release();
  }
});

// Route protégée
app.get('/api/profile', authenticateToken, async (req, res) => {
  res.json({ 
    message: 'Accès autorisé', 
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Middleware pour les erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Middleware pour les erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ====================
// DÉMARRAGE ADAPTÉ POUR VERCEL
// ====================
async function startServer() {
  // Initialisation de la base de données
  if (pool) {
    await initializeDatabase();
  }

  // Démarrer le serveur seulement en local
  if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 5000;
    
    // Trouver un port libre
    const net = require('net');
    const findFreePort = (startPort) => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.once('error', () => resolve(findFreePort(startPort + 1)));
        server.once('listening', () => {
          const port = server.address().port;
          server.close(() => resolve(port));
        });
        server.listen(startPort);
      });
    };
    
    const port = await findFreePort(PORT);
    
    app.listen(port, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 SERVEUR DÉMARRÉ SUR LE PORT ${port}`);
      console.log('='.repeat(50));
      console.log(`🌐 URL: http://localhost:${port}`);
      console.log(`📡 API: http://localhost:${port}/api/activites`);
      console.log(`🔒 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
    });
  }
}

// Démarrer le serveur
startServer().catch(err => {
  console.error('❌ Échec démarrage serveur:', err);
  process.exit(1);
});

// Export pour Vercel Serverless Functions
module.exports = app;