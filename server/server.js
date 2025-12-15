// AJOUTE CES LIGNES EN PREMIER
process.env.DEBUG = '';
delete require.cache[require.resolve('debug')];

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// CRÉER L'APP EN PREMIER
const app = express();

// Détecter la plateforme
const isVercel = process.env.VERCEL === '1';
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_GIT_COMMIT_SHA;

console.log('🔧 Démarrage serveur...');
console.log('Platform:', isVercel ? 'Vercel' : isRailway ? 'Railway' : 'Local');

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://aventures-alpines.vercel.app'],
  credentials: true
}));

app.use(express.json());

// ====================
// ROUTES API
// ====================

// Route test API
app.get('/api', (req, res) => {
  res.json({
    message: 'API Aventures Alpines',
    status: 'online',
    platform: isVercel ? 'Vercel' : isRailway ? 'Railway' : 'Local',
    timestamp: new Date().toISOString()
  });
});

// Récupérer activités
app.get('/api/activites', async (req, res) => {
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

  if (isVercel) {
    return res.json(baseActivities.map(act => ({
      ...act,
      nom: act.nom + ' (Vercel Demo)'
    })));
  }

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
      for (const activity of baseActivities) {
        await connection.execute(
          'INSERT IGNORE INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [activity.nom, activity.type, activity.difficulte, activity.description, 
           activity.image_url, activity.lieu, activity.prix, activity.duree, activity.saison]
        );
      }
    }

    const [results] = await connection.query('SELECT * FROM activites ORDER BY created_at DESC');
    await connection.end();

    res.json(results);
  } catch (error) {
    console.error('Erreur MySQL:', error.message);
    res.json(baseActivities.map(act => ({
      ...act,
      nom: act.nom + ' (DB Offline)'
    })));
  }
});

// Récupérer tous les articles
app.get('/api/articles', async (req, res) => {
  const baseArticles = [
    {
      id: 1,
      titre: "Ma première ascension du Mont-Blanc",
      contenu: "Une expérience inoubliable avec des vues à couper le souffle. Le départ à l'aube, le froid mordant, et cette sensation incroyable d'atteindre le sommet après 8 heures d'effort. Les paysages étaient tout simplement époustouflants.",
      nom_utilisateur: "Jean Dupont",
      lieu: "Mont-Blanc, France",
      date_publication: new Date().toISOString(),
      type: "recit"
    },
    {
      id: 2,
      titre: "Ski hors-piste à Val d'Isère",
      contenu: "Des pentes vierges et de la poudreuse légère toute la journée. Nous avons exploré des couloirs secrets avec un guide local. La neige était parfaite et nous avons eu la chance de profiter d'un soleil magnifique toute la journée.",
      nom_utilisateur: "Marie Laurent",
      lieu: "Val d'Isère",
      date_publication: new Date(Date.now() - 86400000).toISOString(),
      type: "aventure"
    },
    {
      id: 3,
      titre: "Randonnée en famille aux Aiguilles Rouges",
      contenu: "Parfait pour une sortie en famille avec des enfants. Le sentier est bien aménagé et les vues sur la vallée sont magnifiques. Nous avons pique-niqué au lac avec les chamois en arrière-plan. Une journée magique !",
      nom_utilisateur: "Thomas Bernard",
      lieu: "Chamonix",
      date_publication: new Date(Date.now() - 172800000).toISOString(),
      type: "familial"
    }
  ];

  if (isVercel) {
    return res.json(baseArticles);
  }

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

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS publications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        titre VARCHAR(200) NOT NULL,
        contenu TEXT NOT NULL,
        nom_utilisateur VARCHAR(100) NOT NULL,
        lieu VARCHAR(100),
        date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM publications');
    
    if (rows[0].count === 0) {
      for (const article of baseArticles) {
        await connection.execute(
          'INSERT IGNORE INTO publications (titre, contenu, nom_utilisateur, lieu, type) VALUES (?, ?, ?, ?, ?)',
          [article.titre, article.contenu, article.nom_utilisateur, article.lieu, article.type]
        );
      }
    }

    const [results] = await connection.query(
      'SELECT * FROM publications ORDER BY date_publication DESC'
    );
    await connection.end();

    res.json(results);
  } catch (error) {
    console.error('Erreur MySQL articles:', error.message);
    res.json(baseArticles);
  }
});

// Créer un article (ROUTE PRINCIPALE)
app.post('/api/articles', async (req, res) => {
  const { titre, contenu, nom_utilisateur, lieu, type } = req.body;
  
  if (!titre || !contenu || !nom_utilisateur) {
    return res.status(400).json({ error: 'Titre, contenu et nom d\'utilisateur requis' });
  }
  
  try {
    if (isVercel) {
      const newArticle = {
        id: Date.now(),
        titre,
        contenu,
        nom_utilisateur,
        lieu: lieu || 'Non spécifié',
        type: type || 'recit',
        date_publication: new Date().toISOString()
      };
      return res.status(201).json({ 
        message: 'Article créé (simulé)', 
        article: newArticle 
      });
    }

    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
      database: process.env.MYSQL_DATABASE || 'railway',
      port: process.env.MYSQL_PORT || 11303,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'publications'"
      );
      
      if (tables.length === 0) {
        await connection.execute(`
          CREATE TABLE publications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            titre VARCHAR(200) NOT NULL,
            contenu TEXT NOT NULL,
            nom_utilisateur VARCHAR(100) NOT NULL,
            lieu VARCHAR(100),
            date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Table publications créée');
      }
    } catch (createError) {
      console.error('Erreur création table:', createError.message);
    }

    try {
      const [result] = await connection.execute(
        'INSERT INTO publications (titre, contenu, nom_utilisateur, lieu, type) VALUES (?, ?, ?, ?, ?)',
        [titre, contenu, nom_utilisateur, lieu || null, type || 'recit']
      );
      
      const [rows] = await connection.execute(
        'SELECT * FROM publications WHERE id = ?',
        [result.insertId]
      );

      await connection.end();

      res.status(201).json({
        message: 'Article créé avec succès',
        article: rows[0]
      });
    } catch (insertError) {
      if (insertError.message.includes("Unknown column 'nom_utilisateur'")) {
        console.log('Colonne nom_utilisateur manquante, recréation de la table...');
        
        await connection.execute('DROP TABLE IF EXISTS publications');
        
        await connection.execute(`
          CREATE TABLE publications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            titre VARCHAR(200) NOT NULL,
            contenu TEXT NOT NULL,
            nom_utilisateur VARCHAR(100) NOT NULL,
            lieu VARCHAR(100),
            date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        const [result] = await connection.execute(
          'INSERT INTO publications (titre, contenu, nom_utilisateur, lieu, type) VALUES (?, ?, ?, ?, ?)',
          [titre, contenu, nom_utilisateur, lieu || null, type || 'recit']
        );
        
        const [rows] = await connection.execute(
          'SELECT * FROM publications WHERE id = ?',
          [result.insertId]
        );

        await connection.end();

        res.status(201).json({
          message: 'Article créé avec succès (table recréée)',
          article: rows[0]
        });
      } else {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Erreur création article:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error.message 
    });
  }
});

// Route POST /api/publications (alias pour compatibilité)
app.post('/api/publications', async (req, res) => {
  const { titre, contenu, nom_utilisateur, lieu, type } = req.body;
  
  if (!titre || !contenu || !nom_utilisateur) {
    return res.status(400).json({ error: 'Titre, contenu et nom d\'utilisateur requis' });
  }
  
  try {
    if (isVercel) {
      const newArticle = {
        id: Date.now(),
        titre,
        contenu,
        nom_utilisateur,
        lieu: lieu || 'Non spécifié',
        type: type || 'recit',
        date_publication: new Date().toISOString()
      };
      return res.status(201).json({ 
        message: 'Article créé (simulé)', 
        article: newArticle 
      });
    }

    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
      database: process.env.MYSQL_DATABASE || 'railway',
      port: process.env.MYSQL_PORT || 11303,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const [tables] = await connection.execute(
        "SHOW TABLES LIKE 'publications'"
      );
      
      if (tables.length === 0) {
        await connection.execute(`
          CREATE TABLE publications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            titre VARCHAR(200) NOT NULL,
            contenu TEXT NOT NULL,
            nom_utilisateur VARCHAR(100) NOT NULL,
            lieu VARCHAR(100),
            date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('Table publications créée');
      }
    } catch (createError) {
      console.error('Erreur création table:', createError.message);
    }

    try {
      const [result] = await connection.execute(
        'INSERT INTO publications (titre, contenu, nom_utilisateur, lieu, type) VALUES (?, ?, ?, ?, ?)',
        [titre, contenu, nom_utilisateur, lieu || null, type || 'recit']
      );
      
      const [rows] = await connection.execute(
        'SELECT * FROM publications WHERE id = ?',
        [result.insertId]
      );

      await connection.end();

      res.status(201).json({
        message: 'Article créé avec succès (via publications)',
        article: rows[0]
      });
    } catch (insertError) {
      if (insertError.message.includes("Unknown column 'nom_utilisateur'")) {
        console.log('Colonne nom_utilisateur manquante, recréation de la table...');
        
        await connection.execute('DROP TABLE IF EXISTS publications');
        
        await connection.execute(`
          CREATE TABLE publications (
            id INT PRIMARY KEY AUTO_INCREMENT,
            titre VARCHAR(200) NOT NULL,
            contenu TEXT NOT NULL,
            nom_utilisateur VARCHAR(100) NOT NULL,
            lieu VARCHAR(100),
            date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        const [result] = await connection.execute(
          'INSERT INTO publications (titre, contenu, nom_utilisateur, lieu, type) VALUES (?, ?, ?, ?, ?)',
          [titre, contenu, nom_utilisateur, lieu || null, type || 'recit']
        );
        
        const [rows] = await connection.execute(
          'SELECT * FROM publications WHERE id = ?',
          [result.insertId]
        );

        await connection.end();

        res.status(201).json({
          message: 'Article créé avec succès (table recréée)',
          article: rows[0]
        });
      } else {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Erreur création article:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur', 
      details: error.message 
    });
  }
});

// Récupérer un article spécifique
app.get('/api/articles/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (isVercel) {
      const demoArticles = [
        {
          id: 1,
          titre: "Ma première ascension du Mont-Blanc",
          contenu: "Une expérience inoubliable...",
          nom_utilisateur: "Jean Dupont",
          lieu: "Mont-Blanc, France",
          date_publication: new Date().toISOString(),
          type: "recit"
        }
      ];
      
      const article = demoArticles.find(a => a.id === parseInt(id)) || demoArticles[0];
      return res.json(article);
    }

    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
      database: process.env.MYSQL_DATABASE || 'railway',
      port: process.env.MYSQL_PORT || 11303,
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await connection.execute(
      'SELECT * FROM publications WHERE id = ?',
      [id]
    );
    
    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération article:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer articles par utilisateur
app.get('/api/users/:username/articles', async (req, res) => {
  const { username } = req.params;
  
  try {
    if (isVercel) {
      const demoArticles = [
        {
          id: 1,
          titre: "Ma première ascension du Mont-Blanc",
          contenu: "Une expérience inoubliable avec des vues à couper le souffle...",
          nom_utilisateur: username === "jean" ? "Jean Dupont" : username,
          lieu: "Mont-Blanc, France",
          date_publication: new Date().toISOString(),
          type: "recit"
        }
      ];
      
      const userArticles = demoArticles.filter(a => 
        a.nom_utilisateur.toLowerCase() === username.toLowerCase()
      );
      return res.json(userArticles);
    }

    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
      database: process.env.MYSQL_DATABASE || 'railway',
      port: process.env.MYSQL_PORT || 11303,
      ssl: { rejectUnauthorized: false }
    });

    const [rows] = await connection.execute(
      'SELECT * FROM publications WHERE nom_utilisateur = ? ORDER BY date_publication DESC',
      [username]
    );
    
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur récupération articles utilisateur:', error);
    res.json([]);
  }
});

// Récupérer profil public d'un utilisateur
app.get('/api/users/:username/profile', async (req, res) => {
  const { username } = req.params;
  
  try {
    if (isVercel) {
      return res.json({
        user: {
          nom_utilisateur: username,
          nombre_articles: 1,
          premiere_publication: new Date().toISOString()
        }
      });
    }

    const mysql = require('mysql2/promise');
    
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'centerbeam.proxy.rlwy.net',
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
      database: process.env.MYSQL_DATABASE || 'railway',
      port: process.env.MYSQL_PORT || 11303,
      ssl: { rejectUnauthorized: false }
    });

    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM publications WHERE nom_utilisateur = ?',
      [username]
    );
    
    const [firstResult] = await connection.execute(
      'SELECT MIN(date_publication) as premiere_publication FROM publications WHERE nom_utilisateur = ?',
      [username]
    );
    
    await connection.end();

    res.json({
      user: {
        nom_utilisateur: username,
        nombre_articles: countResult[0].count || 0,
        premiere_publication: firstResult[0].premiere_publication || null
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil public:', error);
    res.json({
      user: {
        nom_utilisateur: username,
        nombre_articles: 0,
        premiere_publication: null
      }
    });
  }
});

// Récupérer le profil utilisateur (connexion)
app.get('/api/auth/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.json({
      user: {
        id: 1,
        nom_utilisateur: "Utilisateur Démo",
        email: "demo@example.com",
        date_inscription: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        role: 'user'
      }
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY || 'dev-key');
    
    const user = {
      id: decoded.userId || 1,
      nom_utilisateur: decoded.nom_utilisateur || 'Utilisateur Demo',
      email: decoded.email || 'demo@example.com',
      date_inscription: decoded.date_inscription || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      role: decoded.role || 'user'
    };
    
    res.json({ user });
  } catch (error) {
    console.error('Erreur vérification token:', error.message);
    res.json({
      user: {
        id: 1,
        nom_utilisateur: 'Utilisateur Démo',
        email: 'demo@example.com',
        date_inscription: new Date().toISOString(),
        role: 'user'
      }
    });
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
      { 
        userId: Date.now(), 
        nom_utilisateur, 
        email, 
        role: 'user',
        date_inscription: new Date().toISOString()
      },
      process.env.SECRET_KEY || 'dev-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Inscription réussie',
      token,
      user: { 
        id: Date.now(), 
        nom_utilisateur, 
        email, 
        role: 'user',
        date_inscription: new Date().toISOString()
      }
    });
  } catch (error) {
    res.json({
      message: 'Inscription simulée',
      token: 'demo-token-' + Date.now(),
      user: { 
        id: Date.now(), 
        nom_utilisateur, 
        email, 
        role: 'user',
        date_inscription: new Date().toISOString()
      }
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
      { 
        userId: 1, 
        nom_utilisateur: email.split('@')[0] || 'Utilisateur',
        email, 
        role: 'user',
        date_inscription: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      process.env.SECRET_KEY || 'dev-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Connexion réussie',
      token,
      user: { 
        id: 1, 
        nom_utilisateur: email.split('@')[0] || 'Utilisateur',
        email, 
        role: 'user',
        date_inscription: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  } catch (error) {
    res.json({
      message: 'Connexion simulée',
      token: 'demo-token-' + Date.now(),
      user: { 
        id: 1, 
        nom_utilisateur: email.split('@')[0] || 'Utilisateur',
        email, 
        role: 'user',
        date_inscription: new Date().toISOString()
      }
    });
  }
});

// ====================
// SERVIR LE FRONTEND
// ====================

const staticDirs = [
  path.join(__dirname, '..', 'build'),
  path.join(__dirname, '..', 'dist'),
  path.join(__dirname, '..', 'public'),
  path.join(__dirname, '..', 'client', 'build')
];

let foundStaticDir = null;

for (const dir of staticDirs) {
  if (fs.existsSync(dir)) {
    console.log(`Dossier frontend trouvé: ${dir}`);
    app.use(express.static(dir, {
      maxAge: isVercel || isRailway ? '1d' : 0
    }));
    foundStaticDir = dir;
    break;
  }
}

// Route racine
app.get('/', (req, res) => {
  if (foundStaticDir) {
    res.sendFile(path.join(foundStaticDir, 'index.html'));
  } else {
    res.json({
      message: 'API Aventures Alpines',
      note: 'Frontend non trouvé. Utilisez /api/ pour les endpoints API.',
      endpoints: {
        api: '/api',
        activities: '/api/activites',
        articles: '/api/articles',
        article_detail: '/api/articles/:id',
        user_articles: '/api/users/:username/articles',
        user_profile: '/api/users/:username/profile',
        profile: 'GET /api/auth/profile',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    });
  }
});

// Route catch-all
if (foundStaticDir) {
  app.get('*', (req, res) => {
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
    console.log(`SERVEUR DÉMARRÉ SUR LE PORT ${PORT}`);
    console.log('='.repeat(50));
    
    if (foundStaticDir) {
      console.log(`Frontend: http://localhost:${PORT}`);
    }
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Activités: http://localhost:${PORT}/api/activites`);
    console.log(`Articles: http://localhost:5000/api/articles`);
    console.log(`Créer article: POST http://localhost:5000/api/articles`);
    console.log(`Profil public: http://localhost:5000/api/users/:username/profile`);
    console.log('='.repeat(50));
  });
}