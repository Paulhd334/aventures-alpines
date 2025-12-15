// AJOUTE CES LIGNES EN PREMIER
process.env.DEBUG = '';
delete require.cache[require.resolve('debug')];

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const cors = require('cors');


app.use(cors({
  origin: [
    'https://aventures-alpines.vercel.app',
    'http://localhost:3000'  // pour le développement
  ]
}));

const app = express();

// Détecter la plateforme
const isVercel = process.env.VERCEL === '1';
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_GIT_COMMIT_SHA;

console.log('🔧 Démarrage serveur...');
console.log('Platform:', isVercel ? 'Vercel' : isRailway ? 'Railway' : 'Local');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(express.json());

// ====================
// SERVIR LE FRONTEND (MAIS APRÈS LES ROUTES API !)
// ====================

// ====================
// ROUTES API (DOIVENT ÊTRE EN PREMIER !)
// ====================

// Route test API
app.get('/api', (req, res) => {
  res.json({
    message: '🚀 API Aventures Alpines',
    status: 'online',
    platform: isVercel ? 'Vercel' : isRailway ? 'Railway' : 'Local',
    timestamp: new Date().toISOString()
  });
});

// Récupérer activités
app.get('/api/activites', async (req, res) => {
  // Données de base pour toutes les plateformes
  const baseActivities = [
    {
      id: 1,
      nom: "Ski alpin à Chamonix",
      type: "ski",
      difficulte: "Intermédiaire",
      description: "Des pistes mythiques pour tous les niveaux",
      image_url: "https://picsum.photos/800/600?random=1",
      lieu: "Chamonix",
      prix: 45.00,
      duree: "1 journée",
      saison: "Hiver"
    },
    {
      id: 2,
      nom: "Randonnée du Lac Blanc",
      type: "randonnee",
      difficulte: "Facile",
      description: "Randonnée familiale avec vue magnifique",
      image_url: "https://picsum.photos/800/600?random=2",
      lieu: "Argentière",
      prix: 25.00,
      duree: "3h30",
      saison: "Été"
    }
  ];

  // Sur Vercel, retourner données mockées
  if (isVercel) {
    return res.json(baseActivities.map(act => ({
      ...act,
      nom: act.nom + ' (Vercel Demo)'
    })));
  }

  // Sur Railway ou Local, essayer MySQL
  try {
    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
      database: process.env.MYSQL_DATABASE || 'railway',
      port: process.env.MYSQL_PORT || 11303,
      ssl: { rejectUnauthorized: false }
    });

    // Vérifier/créer table
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
      // Insérer données
      for (const activity of baseActivities) {
        await connection.execute(
          'INSERT IGNORE INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [activity.nom, activity.type, activity.difficulte, activity.description, 
           activity.image_url, activity.lieu, activity.prix, activity.duree, activity.saison]
        );
      }
    }

    // Récupérer toutes les activités
    const [results] = await connection.query('SELECT * FROM activites ORDER BY created_at DESC');
    await connection.end();

    res.json(results);
  } catch (error) {
    console.error('Erreur MySQL:', error.message);
    // Fallback: données de base
    res.json(baseActivities.map(act => ({
      ...act,
      nom: act.nom + ' (DB Offline)'
    })));
  }
});

// Inscription
app.post('/api/auth/register', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe } = req.body;
  
  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs requis' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const bcrypt = require('bcryptjs');
    
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const token = jwt.sign(
      { userId: Date.now(), nom_utilisateur, email, role: 'user' },
      process.env.SECRET_KEY || 'dev-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Inscription réussie',
      token,
      user: { id: Date.now(), nom_utilisateur, email, role: 'user' }
    });
  } catch (error) {
    // Fallback pour Vercel
    res.json({
      message: 'Inscription simulée',
      token: 'demo-token-' + Date.now(),
      user: { id: Date.now(), nom_utilisateur, email, role: 'user' }
    });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    
    const token = jwt.sign(
      { userId: 1, email, role: 'user' },
      process.env.SECRET_KEY || 'dev-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: { id: 1, email, role: 'user' }
    });
  } catch (error) {
    // Fallback pour Vercel
    res.json({
      message: 'Connexion simulée',
      token: 'demo-token-' + Date.now(),
      user: { id: 1, email, role: 'user' }
    });
  }
});

// ====================
// SERVIR LE FRONTEND (EN DERNIER !)
// ====================

// Chercher les fichiers frontend à différents emplacements
const staticDirs = [
  path.join(__dirname, '..', 'build'),
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'client', 'build')
];

let foundStaticDir = null;

for (const dir of staticDirs) {
  if (fs.existsSync(dir)) {
    console.log(`📁 Dossier frontend trouvé: ${dir}`);
    app.use(express.static(dir, {
      maxAge: isVercel || isRailway ? '1d' : 0
    }));
    foundStaticDir = dir;
    break;
  }
}

// Route racine pour afficher soit l'API soit le frontend
app.get('/', (req, res) => {
  if (foundStaticDir) {
    // Si frontend trouvé, servir index.html
    res.sendFile(path.join(foundStaticDir, 'index.html'));
  } else {
    // Sinon, montrer les infos API
    res.json({
      message: '🚀 API Aventures Alpines',
      note: 'Frontend non trouvé. Utilisez /api/ pour les endpoints API.',
      endpoints: {
        api: '/api',
        activities: '/api/activites',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    });
  }
});

// Route catch-all pour servir le frontend (EN DERNIÈRE POSITION !)
if (foundStaticDir) {
  app.get('*', (req, res) => {
    // Ne pas intercepter les routes API
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Route API non trouvée' });
    }
    res.sendFile(path.join(foundStaticDir, 'index.html'));
  });
}

// ====================
// EXPORT POUR VERCEL
// ====================
module.exports = app;

// ====================
// DÉMARRAGE LOCAL/RAILWAY
// ====================
if (require.main === module && !isVercel) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log(`🚀 SERVEUR DÉMARRÉ SUR LE PORT ${PORT}`);
    console.log('='.repeat(50));
    
    if (foundStaticDir) {
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    }
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`📡 Activités: http://localhost:${PORT}/api/activites`);
    console.log('='.repeat(50));
  });
}