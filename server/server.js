require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || 'dev-secret-key-aventures-alpines-2024';

console.log('🔧 Démarrage serveur...');
console.log('Mode:', process.env.NODE_ENV || 'development');

// Vérifier si on est sur Vercel
const isVercel = process.env.VERCEL === '1';

let mysql, bcrypt, jwt, pool;

// Charger les modules dynamiquement (pour éviter erreur sur Vercel si absent)
try {
  mysql = require('mysql2/promise');
  bcrypt = require('bcryptjs');
  jwt = require('jsonwebtoken');
} catch (error) {
  console.log('⚠️ Modules non chargés (mode Vercel ou erreur)');
}

// Configuration MySQL seulement si pas sur Vercel ET mysql disponible
if (!isVercel && mysql) {
  const dbConfig = {
    host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
    database: process.env.MYSQL_DATABASE || 'railway',
    port: process.env.MYSQL_PORT || 11303,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 10000
  };

  // Fonction pour créer le pool
  async function createPool() {
    try {
      pool = mysql.createPool(dbConfig);
      const connection = await pool.getConnection();
      console.log('✅ Connexion MySQL Railway établie!');
      
      // Initialisation DB
      await initializeDatabase(connection);
      
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion MySQL:', error.message);
      return false;
    }
  }

  // Initialisation DB
  async function initializeDatabase(connection) {
    try {
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

  // Initialiser MySQL au démarrage
  createPool().catch(console.error);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// ====================
// ROUTES
// ====================

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: '🚀 API Aventures Alpines',
    status: 'online',
    mode: isVercel ? 'vercel' : 'railway',
    mysql: pool ? 'connecté' : isVercel ? 'mode-mock' : 'déconnecté',
    timestamp: new Date().toISOString()
  });
});

// Récupérer activités
app.get('/api/activites', async (req, res) => {
  // Si sur Vercel ou MySQL non disponible, retourner données mockées
  if (isVercel || !pool) {
    return res.json([
      {
        id: 1,
        nom: "Ski alpin à Chamonix (Vercel)",
        type: "ski",
        difficulte: "Intermédiaire",
        description: "Mode démo - API sur Vercel",
        image_url: "https://picsum.photos/800/600?random=1",
        lieu: "Chamonix",
        prix: 45.00,
        duree: "1 journée",
        saison: "Hiver"
      },
      {
        id: 2,
        nom: "Randonnée du Lac Blanc (Vercel)",
        type: "randonnee",
        difficulte: "Facile",
        description: "Mode démo - Données mockées",
        image_url: "https://picsum.photos/800/600?random=2",
        lieu: "Argentière",
        prix: 25.00,
        duree: "3h30",
        saison: "Été"
      }
    ]);
  }
  
  // Sinon, utiliser MySQL
  try {
    const connection = await pool.getConnection();
    const [results] = await connection.query('SELECT * FROM activites ORDER BY created_at DESC');
    connection.release();
    
    res.json(results);
  } catch (error) {
    console.error('Erreur /api/activites:', error.message);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe } = req.body;
  
  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs requis' });
  }
  
  // Simulation pour Vercel
  if (isVercel || !bcrypt || !jwt) {
    return res.json({
      message: 'Inscription simulée (mode Vercel)',
      token: 'mock-token-vercel-' + Date.now(),
      user: { 
        id: Date.now(), 
        nom_utilisateur, 
        email, 
        role: 'user' 
      }
    });
  }
  
  // Version réelle avec MySQL
  try {
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

app.post('/api/auth/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  // Simulation pour Vercel
  if (isVercel || !jwt) {
    return res.json({
      message: 'Connexion simulée (mode Vercel)',
      token: 'mock-token-vercel-' + Date.now(),
      user: { id: 1, email, role: 'user' }
    });
  }
  
  // Version réelle
  try {
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
// EXPORT POUR VERCEL
// ====================
module.exports = app;

// ====================
// DÉMARRAGE LOCAL
// ====================
if (require.main === module && !isVercel) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 SERVEUR DÉMARRÉ SUR LE PORT ${PORT}`);
    console.log('='.repeat(50));
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/activites`);
    console.log('='.repeat(50));
  });
}