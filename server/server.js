// ============================================
// server.js - VERSION AVEC ARTICLES
// ============================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Configuration MySQL MAMP
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'aventure_alpine',
  port: 3306,
  connectTimeout: 10000
};

// Créer l'application Express
const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// ============================================
// ROUTES DU SITE
// ============================================

// Route de test
app.get('/api', (req, res) => {
  res.json({
    message: 'API Aventures Alpines - Version Complète',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// 1. ACTIVITÉS
app.get('/api/activites', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM activites ORDER BY id');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

app.get('/api/activites/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM activites WHERE id = ?', [id]);
    await connection.end();
    if (rows.length === 0) return res.status(404).json({ error: 'Activité non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// 4. CONTACT
// ============================================
app.post('/api/contact', async (req, res) => {
  const { nom, email, sujet, message } = req.body;

  // Validation serveur (OBLIGATOIRE)
  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'INSERT INTO contact (nom_complet, email, sujet, message) VALUES (?, ?, ?, ?)',
      [nom, email, sujet, message]
    );

    await connection.end();

    res.status(201).json({
      message: 'Message envoyé avec succès'
    });

  } catch (error) {
    console.error('Erreur contact:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});



// 2. ARTICLES/BLOG
// Récupérer tous les articles
app.get('/api/articles', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT a.*, u.username as auteur_nom 
      FROM articles a 
      LEFT JOIN users u ON a.auteur_id = u.id 
      ORDER BY a.created_at DESC
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur articles:', error.message);
    // Si la table n'existe pas, retourner un tableau vide
    if (error.message.includes('articles')) {
      res.json([]);
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// Récupérer les articles d'un utilisateur spécifique
app.get('/api/users/:username/articles', async (req, res) => {
  const username = req.params.username;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // D'abord, trouver l'utilisateur par son username
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const userId = users[0].id;
    
    // Récupérer les articles de cet utilisateur
    const [articles] = await connection.execute(
      'SELECT * FROM articles WHERE auteur_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    await connection.end();
    res.json(articles);
    
  } catch (error) {
    console.error('Erreur articles utilisateur:', error.message);
    // Si la table n'existe pas, retourner un tableau vide
    if (error.message.includes('articles')) {
      res.json([]);
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

// Créer un nouvel article
app.post('/api/articles', async (req, res) => {
  const { titre, contenu, auteur_id, lieu, type } = req.body;
  
  if (!titre || !contenu || !auteur_id) {
    return res.status(400).json({ error: 'Titre, contenu et auteur sont requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'INSERT INTO articles (titre, contenu, auteur_id, lieu, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [titre, contenu, auteur_id, lieu || '', type || 'récit']
    );
    
    // Récupérer l'article créé
    const [newArticle] = await connection.execute(
      'SELECT * FROM articles WHERE id = ?',
      [result.insertId]
    );
    
    await connection.end();
    
    res.status(201).json({
      message: 'Article créé avec succès',
      article: newArticle[0]
    });
    
  } catch (error) {
    console.error('Erreur création article:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un article spécifique
app.get('/api/articles/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT a.*, u.username as auteur_nom FROM articles a LEFT JOIN users u ON a.auteur_id = u.id WHERE a.id = ?',
      [id]
    );
    
    await connection.end();
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    
    res.json(rows[0]);
    
  } catch (error) {
    console.error('Erreur article:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 3. AUTHENTIFICATION
// Route d'inscription AVEC HASH
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email invalide' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password min 6 caractères' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si username ou email existe déjà
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ error: 'Username ou email déjà pris' });
    }
    
    // HACHER le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insérer avec mot de passe HACHÉ
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    // Récupérer l'utilisateur créé
    const [newUser] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    await connection.end();
    
    res.status(201).json({
      message: 'Inscription réussie !',
      user: {
        id: newUser[0].id,
        username: newUser[0].username,
        email: newUser[0].email,
        created_at: newUser[0].created_at
      }
    });
    
  } catch (error) {
    console.error('Erreur inscription:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion AVEC VÉRIFICATION HASH
app.post('/api/auth/login', async (req, res) => {
  const { username, email, password } = req.body;
  
  const identifier = username || email;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant et password requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.execute(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Identifiant incorrect' });
    }
    
    const user = users[0];
    
    // VÉRIFIER le hash avec bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    res.json({
      message: 'Connexion réussie !',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      }
    });
    
  } catch (error) {
    console.error('Erreur connexion:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer un profil utilisateur
app.get('/api/auth/me', async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [users] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE username = ?',
      [username]
    );
    
    await connection.end();
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ user: users[0] });
    
  } catch (error) {
    console.error('Erreur profil:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Mise à jour du profil
app.put('/api/auth/profile', async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;
  const tokenUsername = req.query.username; // ou depuis le token JWT si vous en avez
  
  if (!username || !email) {
    return res.status(400).json({ error: 'Username et email sont requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si le nouvel username ou email existe déjà (pour un autre utilisateur)
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE (username = ? OR email = ?) AND username != ?',
      [username, email, tokenUsername || username]
    );
    
    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ error: 'Username ou email déjà pris' });
    }
    
    let updateQuery = 'UPDATE users SET username = ?, email = ?';
    const queryParams = [username, email];
    
    // Si changement de mot de passe
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        await connection.end();
        return res.status(400).json({ error: 'Nouveau mot de passe min 6 caractères' });
      }
      
      // Récupérer le hash actuel
      const [currentUser] = await connection.execute(
        'SELECT password_hash FROM users WHERE username = ?',
        [tokenUsername || username]
      );
      
      if (currentUser.length === 0) {
        await connection.end();
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      
      // Vérifier l'ancien mot de passe
      const passwordMatch = await bcrypt.compare(currentPassword, currentUser[0].password_hash);
      if (!passwordMatch) {
        await connection.end();
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }
      
      // Hacher le nouveau mot de passe
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery += ', password_hash = ?';
      queryParams.push(newHashedPassword);
    }
    
    updateQuery += ' WHERE username = ?';
    queryParams.push(tokenUsername || username);
    
    await connection.execute(updateQuery, queryParams);
    
    // Récupérer l'utilisateur mis à jour
    const [updatedUser] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE username = ?',
      [username]
    );
    
    await connection.end();
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser[0]
    });
    
  } catch (error) {
    console.error('Erreur mise à jour profil:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = 5000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 SERVEUR AVEC ARTICLES DÉMARRÉ SUR http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n🔗 ENDPOINTS DISPONIBLES:');
  console.log(`📍 Test API: http://localhost:${PORT}/api`);
  console.log(`📍 Toutes activités: http://localhost:${PORT}/api/activites`);
  console.log(`📍 Tous articles: http://localhost:${PORT}/api/articles`);
  console.log(`📍 Articles utilisateur: http://localhost:${PORT}/api/users/:username/articles`);
  console.log(`📍 Inscription: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`📍 Connexion: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📍 Profil: GET http://localhost:${PORT}/api/auth/me?username=...`);
  console.log(`📍 Update profil: PUT http://localhost:${PORT}/api/auth/profile`);
  console.log('='.repeat(60));
});