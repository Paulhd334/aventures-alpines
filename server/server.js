// ============================================
// server.js - VERSION AVEC ROUTES EN MAJUSCULES
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
  database: 'aventures_alpines',
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
    message: 'API Aventures Alpines',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      articles: '/api/articles',
      itineraires: '/api/Itineraires',
      activites: '/api/activites',
      contact: '/api/contact (POST)',
      auth: '/api/auth/register, /api/auth/login'
    }
  });
});

// ============================================
// 1. ARTICLES
// ============================================

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
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT a.*, u.username as auteur_nom FROM articles a LEFT JOIN users u ON a.auteur_id = u.id WHERE a.id = ?',
      [id]
    );
    await connection.end();
    
    if (rows.length === 0) return res.status(404).json({ error: 'Article non trouvé' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur article:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

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
    
    const [newArticle] = await connection.execute(
      'SELECT a.*, u.username as auteur_nom FROM articles a LEFT JOIN users u ON a.auteur_id = u.id WHERE a.id = ?',
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

// ============================================
// 2. ITINÉRAIRES (EN MAJUSCULE)
// ============================================

// Récupérer tous les itinéraires
app.get('/api/Itineraires', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT * FROM itineraires 
      ORDER BY difficulte, nom
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur Itineraires:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Récupérer un itinéraire spécifique
app.get('/api/Itineraires/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM itineraires WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (rows.length === 0) return res.status(404).json({ error: 'Itinéraire non trouvé' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur Itineraire:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// 3. ACTIVITÉS
// ============================================

app.get('/api/activites', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM activites ORDER BY id');
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur activités:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
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
    console.error('Erreur activité:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// 4. CONTACT
// ============================================

app.post('/api/contact', async (req, res) => {
  const { nom, email, sujet, message } = req.body;
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
    res.status(201).json({ message: 'Message envoyé avec succès' });
  } catch (error) {
    console.error('Erreur contact:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// 5. AUTHENTIFICATION
// ============================================

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
    return res.status(400).json({ error: 'Mot de passe minimum 6 caractères' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existing.length > 0) {
      await connection.end();
      return res.status(409).json({ error: 'Username ou email déjà utilisé' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    const [newUser] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    await connection.end();
    
    res.status(201).json({
      message: 'Inscription réussie',
      user: newUser[0]
    });
  } catch (error) {
    console.error('Erreur inscription:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
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
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }
    
    res.json({
      message: 'Connexion réussie',
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

app.get('/api/auth/me', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: 'Username requis' });
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [users] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE username = ?',
      [username]
    );
    await connection.end();
    
    if (users.length === 0) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json({ user: users[0] });
  } catch (error) {
    console.error('Erreur profil:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('\n🔗 ENDPOINTS EN MAJUSCULES:');
  console.log(`📍 Test: http://localhost:${PORT}/api`);
  console.log(`📍 Articles: http://localhost:${PORT}/api/articles`);
  console.log(`📍 Itinéraires: http://localhost:${PORT}/api/Itineraires`);
  console.log(`📍 Activités: http://localhost:${PORT}/api/activites`);
  console.log('='.repeat(60));
});