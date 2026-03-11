// ============================================
// server.js - VERSION FINALE OPTIMISÉE
// ============================================

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const axios = require('axios');

// Configuration MySQL MAMP
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'aventures_alpines',
  port: 3306,
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Créer l'application Express
const app = express();

// Middleware CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`📌 ${req.method} ${req.url}`);
  next();
});

// ============================================
// FONCTION UTILITAIRE DE CONNEXION
// ============================================
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error.message);
    throw error;
  }
}

// ============================================
// ROUTE DE TEST
// ============================================

app.get('/api', (req, res) => {
  res.json({
    message: 'API Aventures Alpines',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      articles: '/api/articles',
      itineraires: '/api/Itineraires',
      activites: '/api/activites',
      galerie: '/api/galerie-randonnee',
      ski: '/api/ski/stations, /api/ski/temoignages, /api/ski/offres',
      contact: '/api/contact (POST)',
      auth: '/api/auth/register, /api/auth/login, /api/auth/me',
      reservations: '/api/reservations, /api/reservations/user/:id'
    }
  });
});

// ============================================
// 1. ARTICLES
// ============================================

app.get('/api/articles', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT a.*, u.username as auteur_nom 
      FROM articles a 
      LEFT JOIN users u ON a.auteur_id = u.id 
      ORDER BY a.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur articles:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/articles/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT a.*, u.username as auteur_nom FROM articles a LEFT JOIN users u ON a.auteur_id = u.id WHERE a.id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur article:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/articles', async (req, res) => {
  const { titre, contenu, auteur_id, lieu, type } = req.body;
  
  if (!titre || !contenu || !auteur_id) {
    return res.status(400).json({ error: 'Titre, contenu et auteur sont requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO articles (titre, contenu, auteur_id, lieu, type, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [titre, contenu, auteur_id, lieu || '', type || 'récit']
    );
    
    const [newArticle] = await connection.execute(
      'SELECT a.*, u.username as auteur_nom FROM articles a LEFT JOIN users u ON a.auteur_id = u.id WHERE a.id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Article créé avec succès',
      article: newArticle[0]
    });
  } catch (error) {
    console.error('❌ Erreur création article:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 2. ITINÉRAIRES
// ============================================

app.get('/api/Itineraires', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM itineraires 
      ORDER BY difficulte, nom
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur Itineraires:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/Itineraires/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM itineraires WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Itinéraire non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur Itineraire:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 3. GALERIE RANDONNÉE
// ============================================

app.get('/api/galerie-randonnee', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      ORDER BY g.date_publication DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur galerie:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/galerie-randonnee/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      WHERE g.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Photo non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur photo:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/galerie-randonnee', async (req, res) => {
  const { utilisateur_id, titre, description, image_url, localisation, altitude, difficulte, saison, date_prise } = req.body;
  
  if (!utilisateur_id || !titre || !image_url) {
    return res.status(400).json({ error: 'Utilisateur, titre et image sont requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      `INSERT INTO galerie_randonnee 
       (utilisateur_id, titre, description, image_url, localisation, altitude, difficulte, saison, date_prise, date_publication) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        utilisateur_id, 
        titre, 
        description || null, 
        image_url, 
        localisation || null, 
        altitude || null, 
        difficulte || null, 
        saison || null, 
        date_prise || null
      ]
    );
    
    const [newPhoto] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      WHERE g.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: 'Photo ajoutée avec succès',
      photo: newPhoto[0]
    });
  } catch (error) {
    console.error('❌ Erreur ajout photo:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.put('/api/galerie-randonnee/:id/like', async (req, res) => {
  const { action } = req.body;
  
  let connection;
  try {
    connection = await getConnection();
    
    if (action === 'increment') {
      await connection.execute(
        'UPDATE galerie_randonnee SET likes = likes + 1 WHERE id = ?',
        [req.params.id]
      );
    } else if (action === 'decrement') {
      await connection.execute(
        'UPDATE galerie_randonnee SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
        [req.params.id]
      );
    }
    
    const [updated] = await connection.execute(
      'SELECT likes FROM galerie_randonnee WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      message: 'Like mis à jour',
      likes: updated[0]?.likes || 0
    });
  } catch (error) {
    console.error('❌ Erreur like:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 4. ACTIVITÉS
// ============================================

app.get('/api/activites', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM activites ORDER BY id');
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur activités:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/activites/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM activites WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur activité:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 5. CONTACT - CORRIGÉ POUR TABLE contact_messages
// ============================================

app.post('/api/contact', async (req, res) => {
  const { nom, email, sujet, message } = req.body;
  
  console.log('📨 Données reçues contact:', { nom, email, sujet, message });
  
  // Validation
  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ 
      error: 'Tous les champs sont requis',
      missing: {
        nom: !nom,
        email: !email,
        sujet: !sujet,
        message: !message
      }
    });
  }
  
  // Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email invalide' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Vérifier si la table contact_messages existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'contact_messages'"
    );
    
    // Si la table n'existe pas, la créer
    if (tables.length === 0) {
      console.log('📝 Création de la table contact_messages...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          sujet VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Table contact_messages créée avec succès');
    }
    
    // Insérer le message dans contact_messages
    const [result] = await connection.execute(
      'INSERT INTO contact_messages (nom, email, sujet, message, date_envoi) VALUES (?, ?, ?, ?, NOW())',
      [nom, email, sujet, message]
    );
    
    console.log(`✅ Message contact enregistré avec ID: ${result.insertId}`);
    
    res.status(201).json({ 
      message: 'Message envoyé avec succès',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('❌ Erreur contact:', error.message);
    console.error('📝 Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erreur serveur lors de l\'envoi du message',
      details: error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 6. SKI
// ============================================

app.get('/api/ski/stations', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM stations_ski 
      ORDER BY region, nom
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur stations ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/ski/stations/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM stations_ski WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Station non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur station:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/ski/temoignages', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT t.*, s.nom as station_nom 
      FROM temoignages_ski t
      LEFT JOIN stations_ski s ON t.station_id = s.id
      WHERE t.approuve = TRUE
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur témoignages ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/ski/temoignages', async (req, res) => {
  const { nom, email, type_ski, station_id, message, note } = req.body;
  
  if (!nom || !message) {
    return res.status(400).json({ error: 'Nom et message requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO temoignages_ski (nom, email, type_ski, station_id, message, note) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, email || null, type_ski || null, station_id || null, message, note || null]
    );
    
    res.status(201).json({
      message: 'Témoignage envoyé avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Erreur création témoignage:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/ski/offres', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT o.*, s.nom as station_nom, s.photo_url as station_photo
      FROM offres_ski o
      LEFT JOIN stations_ski s ON o.station_id = s.id
      WHERE o.actif = TRUE
      ORDER BY o.prix
      LIMIT 10
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur offres ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 7. RÉSERVATIONS
// ============================================

app.post('/api/reservations', async (req, res) => {
  const { userId, activityId, date, nbPersonnes, notes } = req.body;
  
  if (!userId || !activityId || !date) {
    return res.status(400).json({ 
      error: 'ID utilisateur, ID activité et date sont requis' 
    });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Vérifier utilisateur
    const [users] = await connection.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // Vérifier activité
    const [activities] = await connection.execute(
      'SELECT id, nom, capacite_max FROM activites WHERE id = ?',
      [activityId]
    );
    
    if (activities.length === 0) {
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    // Vérifier disponibilité
    const [existing] = await connection.execute(
      'SELECT COUNT(*) as count FROM reservations WHERE activite_id = ? AND date_reservation = ?',
      [activityId, date]
    );
    
    const capaciteMax = activities[0].capacite_max || 10;
    if (existing[0].count >= capaciteMax) {
      return res.status(400).json({ error: 'Complet pour cette date' });
    }
    
    // Créer réservation
    const [result] = await connection.execute(`
      INSERT INTO reservations 
      (membre_id, activite_id, date_reservation, nb_personnes, notes, statut, date_creation)
      VALUES (?, ?, ?, ?, ?, 'confirmée', NOW())
    `, [
      userId,
      activityId,
      date,
      nbPersonnes || 1,
      notes || null
    ]);
    
    // Récupérer la réservation créée
    const [newReservation] = await connection.execute(`
      SELECT r.*, 
             a.nom as activite_nom,
             a.type as activite_type,
             a.image_url,
             u.username as client_nom
      FROM reservations r
      LEFT JOIN activites a ON r.activite_id = a.id
      LEFT JOIN users u ON r.membre_id = u.id
      WHERE r.id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      message: '✅ Réservation effectuée avec succès',
      success: true,
      reservation: newReservation[0]
    });
    
  } catch (error) {
    console.error('❌ Erreur réservation:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de la réservation',
      details: error.message 
    });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/reservations/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  
  let connection;
  try {
    connection = await getConnection();
    
    const [reservations] = await connection.execute(`
      SELECT r.*, 
             a.nom as activite_nom,
             a.type as activite_type,
             a.description,
             a.image_url,
             a.duree,
             a.difficulte,
             a.lieu,
             u.username as membre_nom
      FROM reservations r
      LEFT JOIN activites a ON r.activite_id = a.id
      LEFT JOIN users u ON r.membre_id = u.id
      WHERE r.membre_id = ?
      ORDER BY r.date_reservation DESC
    `, [userId]);
    
    res.json(reservations);
    
  } catch (error) {
    console.error('❌ Erreur liste réservations:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur lors du chargement des réservations'
    });
  } finally {
    if (connection) await connection.end();
  }
});

app.delete('/api/reservations/:id', async (req, res) => {
  const reservationId = req.params.id;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'ID utilisateur requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const [reservation] = await connection.execute(
      'SELECT * FROM reservations WHERE id = ? AND membre_id = ?',
      [reservationId, userId]
    );
    
    if (reservation.length === 0) {
      return res.status(404).json({ 
        error: 'Réservation non trouvée ou non autorisée' 
      });
    }
    
    await connection.execute(
      'DELETE FROM reservations WHERE id = ?',
      [reservationId]
    );
    
    res.json({
      message: '✅ Réservation supprimée avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 8. AUTHENTIFICATION
// ============================================

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validations
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
  
  let connection;
  try {
    connection = await getConnection();
    
    // Vérifier si l'utilisateur existe déjà
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
    }
    
    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, NOW())',
      [username, email, hashedPassword]
    );
    
    const [newUser] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      message: 'Inscription réussie',
      user: newUser[0]
    });
    
  } catch (error) {
    console.error('❌ Erreur inscription:', error.message);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, email, password } = req.body;
  const identifier = username || email;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant et mot de passe requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, username, email, password_hash, created_at FROM users WHERE username = ? OR email = ?',
      [identifier, identifier]
    );
    
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
    console.error('❌ Erreur connexion:', error.message);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  } finally {
    if (connection) await connection.end();
  }
});

app.get('/api/auth/me', async (req, res) => {
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ error: 'Username requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const [users] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE username = ?',
      [username]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json({ user: users[0] });
    
  } catch (error) {
    console.error('❌ Erreur profil:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// ROUTE POUR METTRE À JOUR LE PROFIL
// ============================================

app.put('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  const { nom_utilisateur, email } = req.body;
  
  if (!nom_utilisateur || !email) {
    return res.status(400).json({ error: 'Nom utilisateur et email requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    // Vérifier si l'email est déjà pris par un autre utilisateur
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    
    // Mettre à jour l'utilisateur
    await connection.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [nom_utilisateur, email, userId]
    );
    
    // Récupérer l'utilisateur mis à jour
    const [updated] = await connection.execute(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: updated[0].id,
        nom_utilisateur: updated[0].username,
        email: updated[0].email,
        date_inscription: updated[0].created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur mise à jour profil:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});


// ============================================
// ROUTE DE TEST POUR VÉRIFIER LA TABLE CONTACT
// ============================================

app.get('/api/test/contact', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Vérifier les tables
    const [tables] = await connection.execute("SHOW TABLES");
    
    // Chercher spécifiquement contact_messages
    const [contactTable] = await connection.execute("SHOW TABLES LIKE 'contact_messages'");
    
    let structure = null;
    let count = 0;
    
    if (contactTable.length > 0) {
      const [columns] = await connection.execute("DESCRIBE contact_messages");
      structure = columns;
      
      const [rowCount] = await connection.execute("SELECT COUNT(*) as count FROM contact_messages");
      count = rowCount[0].count;
    }
    
    res.json({
      message: 'Test table contact',
      tables: tables.map(t => Object.values(t)[0]),
      contact_table_exists: contactTable.length > 0,
      contact_table_name: contactTable.length > 0 ? 'contact_messages' : null,
      structure: structure,
      total_messages: count
    });
    
  } catch (error) {
    console.error('❌ Erreur test contact:', error.message);
    res.status(500).json({ error: error.message });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// MIDDLEWARE DE GESTION D'ERREURS
// ============================================

app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: err.message 
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log(`🚀 SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
  console.log('='.repeat(70));
  console.log('\n📡 ROUTES DISPONIBLES:');
  console.log('   ┌─ Tests');
  console.log('   │  ├─ GET  /api');
  console.log('   │  └─ GET  /api/test/contact');
  console.log('   │');
  console.log('   ├─ Authentification');
  console.log('   │  ├─ POST /api/auth/register');
  console.log('   │  ├─ POST /api/auth/login');
  console.log('   │  └─ GET  /api/auth/me');
  console.log('   │');
  console.log('   ├─ Contenu');
  console.log('   │  ├─ GET  /api/articles');
  console.log('   │  ├─ GET  /api/activites');
  console.log('   │  ├─ GET  /api/Itineraires');
  console.log('   │  └─ GET  /api/galerie-randonnee');
  console.log('   │');
  console.log('   ├─ Ski');
  console.log('   │  ├─ GET  /api/ski/stations');
  console.log('   │  ├─ GET  /api/ski/temoignages');
  console.log('   │  └─ GET  /api/ski/offres');
  console.log('   │');
  console.log('   ├─ Contact');
  console.log('   │  └─ POST /api/contact');
  console.log('   │');
  console.log('   └─ Réservations');
  console.log('      ├─ POST   /api/reservations');
  console.log('      ├─ GET    /api/reservations/user/:id');
  console.log('      └─ DELETE /api/reservations/:id');
  console.log('='.repeat(70));
});