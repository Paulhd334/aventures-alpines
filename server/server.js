// ============================================
// server.js - VERSION COMPLÈTE AVEC RÉSERVATIONS
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

// Route pour test
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
      auth: '/api/auth/register, /api/auth/login',
      reservations: '/api/reservations, /api/reservations/user/:id'
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
// 3. GALERIE RANDONNÉE
// ============================================

// GET toutes les photos de la galerie
app.get('/api/galerie-randonnee', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      ORDER BY g.date_publication DESC
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur galerie:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET une photo spécifique
app.get('/api/galerie-randonnee/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      WHERE g.id = ?
    `, [id]);
    await connection.end();
    
    if (rows.length === 0) return res.status(404).json({ error: 'Photo non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur photo:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST ajouter une nouvelle photo
app.post('/api/galerie-randonnee', async (req, res) => {
  const { 
    utilisateur_id, 
    titre, 
    description, 
    image_url, 
    localisation, 
    altitude, 
    difficulte, 
    saison, 
    date_prise 
  } = req.body;
  
  if (!utilisateur_id || !titre || !image_url) {
    return res.status(400).json({ error: 'Utilisateur, titre et image sont requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
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
    await connection.end();
    
    res.status(201).json({
      message: 'Photo ajoutée avec succès',
      photo: newPhoto[0]
    });
  } catch (error) {
    console.error('Erreur ajout photo:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT mettre à jour les likes d'une photo
app.put('/api/galerie-randonnee/:id/like', async (req, res) => {
  const id = req.params.id;
  const { action } = req.body; // 'increment' ou 'decrement'
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    if (action === 'increment') {
      await connection.execute(
        'UPDATE galerie_randonnee SET likes = likes + 1 WHERE id = ?',
        [id]
      );
    } else if (action === 'decrement') {
      await connection.execute(
        'UPDATE galerie_randonnee SET likes = GREATEST(likes - 1, 0) WHERE id = ?',
        [id]
      );
    }
    
    const [updated] = await connection.execute(
      'SELECT likes FROM galerie_randonnee WHERE id = ?',
      [id]
    );
    await connection.end();
    
    res.json({
      message: 'Like mis à jour',
      likes: updated[0]?.likes || 0
    });
  } catch (error) {
    console.error('Erreur like:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET photos filtrées par difficulté
app.get('/api/galerie-randonnee/filtre/difficulte', async (req, res) => {
  const { difficulte } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      WHERE g.difficulte = ?
      ORDER BY g.date_publication DESC
    `, [difficulte]);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur filtre:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET photos filtrées par saison
app.get('/api/galerie-randonnee/filtre/saison', async (req, res) => {
  const { saison } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT g.*, u.username 
      FROM galerie_randonnee g
      LEFT JOIN users u ON g.utilisateur_id = u.id
      WHERE g.saison = ?
      ORDER BY g.date_publication DESC
    `, [saison]);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur filtre saison:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// 4. ACTIVITÉS
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
// 5. CONTACT
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
// 6. SKI
// ============================================

// GET toutes les stations
app.get('/api/ski/stations', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT * FROM stations_ski 
      ORDER BY region, nom
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur stations ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET une station spécifique
app.get('/api/ski/stations/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM stations_ski WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (rows.length === 0) return res.status(404).json({ error: 'Station non trouvée' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur station:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET témoignages
app.get('/api/ski/temoignages', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT t.*, s.nom as station_nom 
      FROM temoignages_ski t
      LEFT JOIN stations_ski s ON t.station_id = s.id
      WHERE t.approuve = TRUE
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur témoignages ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST nouveau témoignage
app.post('/api/ski/temoignages', async (req, res) => {
  const { nom, email, type_ski, station_id, message, note } = req.body;
  
  if (!nom || !message) {
    return res.status(400).json({ error: 'Nom et message requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO temoignages_ski (nom, email, type_ski, station_id, message, note) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, email || null, type_ski || null, station_id || null, message, note || null]
    );
    await connection.end();
    
    res.status(201).json({
      message: 'Témoignage envoyé avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('Erreur création témoignage:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET offres spéciales
app.get('/api/ski/offres', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT o.*, s.nom as station_nom, s.photo_url as station_photo
      FROM offres_ski o
      LEFT JOIN stations_ski s ON o.station_id = s.id
      WHERE o.actif = TRUE
      ORDER BY o.prix
      LIMIT 10
    `);
    
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur offres ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur', details: error.message });
  }
});

// GET stations filtrées par région
app.get('/api/ski/filtre/region', async (req, res) => {
  const { region } = req.query;
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT * FROM stations_ski WHERE region = ? ORDER BY nom',
      [region]
    );
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur filtre région:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET stations avec bon enneigement (> 80cm)
app.get('/api/ski/enneigement', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(`
      SELECT * FROM stations_ski 
      WHERE enneigement_actuel >= 80
      ORDER BY enneigement_actuel DESC
    `);
    await connection.end();
    res.json(rows);
  } catch (error) {
    console.error('Erreur enneigement:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// ============================================
// 7. RÉSERVATIONS (GRATUIT) - VERSION CORRIGÉE
// ============================================

// POST - Créer une nouvelle réservation (gratuit)
app.post('/api/reservations', async (req, res) => {
  const { 
    userId,           // ID de l'utilisateur connecté
    activityId,       // ID de l'activité
    activityName,     // Nom de l'activité
    date,            // Date de la réservation
    nbPersonnes,     // Nombre de personnes
    notes            // Notes optionnelles
  } = req.body;
  
  // Validation basique
  if (!userId || !activityId || !date) {
    return res.status(400).json({ 
      error: 'ID utilisateur, ID activité et date sont requis' 
    });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier si l'utilisateur existe
    const [users] = await connection.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    // 2. Vérifier si l'activité existe
    const [activities] = await connection.execute(
      'SELECT id, nom FROM activites WHERE id = ?',
      [activityId]
    );
    
    if (activities.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Activité non trouvée' });
    }
    
    // 3. Créer la réservation (gratuit donc pas de prix)
    // Note: heure_debut et heure_fin peuvent être NULL
    const [result] = await connection.execute(`
      INSERT INTO reservations 
      (membre_id, activite_id, date_reservation, nb_personnes, notes, statut)
      VALUES (?, ?, ?, ?, ?, 'confirmée')
    `, [
      userId,          // membre_id
      activityId,      // activite_id
      date,            // date_reservation
      nbPersonnes || 1, // nb_personnes
      notes || null     // notes
    ]);
    
    // 4. Récupérer la réservation créée
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
    
    await connection.end();
    
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
  }
});

// GET - Réservations d'un utilisateur (sans prix)
app.get('/api/reservations/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`🔍 Chargement réservations pour l'utilisateur (membre_id): ${userId}`);
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Requête CORRIGÉE avec membre_id au lieu de utilisateur_id
    const [reservations] = await connection.execute(`
      SELECT r.*, 
             a.nom as activite_nom,
             a.type as activite_type,
             a.description,
             a.image_url,
             a.duree,
             a.difficulte,
             a.saison,
             a.lieu,
             u.username as membre_nom
      FROM reservations r
      LEFT JOIN activites a ON r.activite_id = a.id
      LEFT JOIN users u ON r.membre_id = u.id
      WHERE r.membre_id = ?
      ORDER BY r.date_reservation DESC
    `, [userId]);
    
    await connection.end();
    
    console.log(`✅ ${reservations.length} réservations trouvées pour le membre ${userId}`);
    res.json(reservations);
    
  } catch (error) {
    console.error('❌ Erreur liste réservations:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur lors du chargement des réservations',
      details: error.message 
    });
  }
});

// DELETE - Supprimer une réservation
app.delete('/api/reservations/:id', async (req, res) => {
  const reservationId = req.params.id;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'ID utilisateur requis' });
  }
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier que la réservation appartient à l'utilisateur (avec membre_id)
    const [reservation] = await connection.execute(
      'SELECT * FROM reservations WHERE id = ? AND membre_id = ?',
      [reservationId, userId]
    );
    
    if (reservation.length === 0) {
      await connection.end();
      return res.status(404).json({ 
        error: 'Réservation non trouvée ou non autorisée' 
      });
    }
    
    // Supprimer la réservation
    await connection.execute(
      'DELETE FROM reservations WHERE id = ?',
      [reservationId]
    );
    
    await connection.end();
    
    res.json({
      message: '✅ Réservation supprimée avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression:', error.message);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la suppression',
      details: error.message 
    });
  }
});

// GET - Vérifier disponibilité d'une activité
app.get('/api/activites/:id/disponibilite', async (req, res) => {
  const activityId = req.params.id;
  const { date } = req.query;
  
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Compter les réservations pour cette activité à cette date
    const [reservations] = await connection.execute(
      'SELECT COUNT(*) as count FROM reservations WHERE activite_id = ? AND date_reservation = ?',
      [activityId, date]
    );
    
    // Récupérer la capacité max de l'activité
    const [activity] = await connection.execute(
      'SELECT capacite_max FROM activites WHERE id = ?',
      [activityId]
    );
    
    await connection.end();
    
    const reservationsCount = reservations[0].count;
    const capaciteMax = activity[0]?.capacite_max || 10; // Default 10
    
    res.json({
      disponible: reservationsCount < capaciteMax,
      places_restantes: capaciteMax - reservationsCount,
      reservations_count: reservationsCount,
      capacite_max: capaciteMax
    });
    
  } catch (error) {
    console.error('Erreur disponibilité:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// 8. AUTHENTIFICATION
// ============================================

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  const emailRegex = /^[a-zA-Z][^\s@]+@[^\s@]+\.[^\s@]+$/;
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



const axios = require('axios');

// Route d'inscription  pour google captcha
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, recaptchaToken } = req.body;

    // Vérification reCAPTCHA
    const recaptchaSecretKey = "6LerRmEsAAAAAG3gS4jlukF-6cV9tNue1Sy_33tz"; //  Google ConsoleReCAPTCHA v2 - Clé secrète 
    const recaptchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

    const recaptchaResponse = await axios.post(recaptchaVerifyUrl, null, {
      params: {
        secret: recaptchaSecretKey,
        response: recaptchaToken
      }
    });

    const { success: recaptchaSuccess } = recaptchaResponse.data;

    if (!recaptchaSuccess) {
      return res.status(400).json({ 
        error: "Échec de la vérification reCAPTCHA" 
      });
    }

    // Continuer avec l'inscription...
    // Votre logique d'inscription existante

  } catch (error) {
    console.error('Erreur reCAPTCHA:', error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

const PORT = 5000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(` SERVEUR DÉMARRÉ SUR http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('Routes disponibles:');
  console.log('  • GET  /api                    - Test API');
  console.log('  • GET  /api/articles           - Liste articles');
  console.log('  • GET  /api/activites          - Liste activités');
  console.log('  • GET  /api/reservations/user/:id - Réservations utilisateur');
  console.log('  • POST /api/reservations       - Créer réservation');
  console.log('  • POST /api/auth/login         - Connexion');
  console.log('  • POST /api/auth/register      - Inscription');
  console.log('='.repeat(60));
});