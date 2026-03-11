// ============================================
// server.js - VERSION FINALE CORRIGÉE
// Gère les réservations ski, randonnées ET activités
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
    console.log('🔄 Tentative de connexion à MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion MySQL établie');
    return connection;
  } catch (error) {
    console.error('❌ Erreur connexion MySQL:', error.message);
    console.error('📝 Détail:', error);
    throw error;
  }
}

// ============================================
// ROUTE DE TEST PRINCIPALE
// ============================================
app.get('/api', (req, res) => {
  res.json({
    message: 'API Aventures Alpines',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: {
      articles: '/api/articles, /api/articles/utilisateur/:id',
      itineraires: '/api/Itineraires',
      activites: '/api/activites',
      galerie: '/api/galerie-randonnee',
      ski: '/api/ski/stations, /api/ski/temoignages, /api/ski/offres',
      randonnee: '/api/randonnee/offres',
      contact: '/api/contact (POST)',
      auth: '/api/auth/register, /api/auth/login, /api/auth/me',
      reservations: '/api/reservations (POST), /api/reservations/user/:id (GET), /api/reservations/:id (DELETE)'
    }
  });
});

// ============================================
// 1. ARTICLES
// ============================================

// Articles par utilisateur
app.get('/api/articles/utilisateur/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`🔍 Recherche des articles pour l'utilisateur ID: ${userId}`);
  
  let connection;
  try {
    connection = await getConnection();
    
    const [rows] = await connection.execute(`
      SELECT a.*, u.username as auteur_nom, u.email as auteur_email
      FROM articles a 
      LEFT JOIN users u ON a.auteur_id = u.id 
      WHERE a.auteur_id = ?
      ORDER BY a.created_at DESC
    `, [userId]);
    
    console.log(`✅ ${rows.length} articles trouvés`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur chargement articles utilisateur:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// Tous les articles
app.get('/api/articles', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT a.*, u.username as auteur_nom, u.email as auteur_email
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

// Article par ID
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

// Créer un article
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

// Supprimer un article
app.delete('/api/articles/:id', async (req, res) => {
  const articleId = req.params.id;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'ID utilisateur requis' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const [article] = await connection.execute(
      'SELECT * FROM articles WHERE id = ? AND auteur_id = ?',
      [articleId, userId]
    );
    
    if (article.length === 0) {
      return res.status(404).json({ error: 'Article non trouvé ou non autorisé' });
    }
    
    await connection.execute('DELETE FROM articles WHERE id = ?', [articleId]);
    
    res.json({ message: 'Article supprimé avec succès', success: true });
  } catch (error) {
    console.error('❌ Erreur suppression article:', error.message);
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
    const [rows] = await connection.execute('SELECT * FROM itineraires ORDER BY difficulte, nom');
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
    const [rows] = await connection.execute('SELECT * FROM itineraires WHERE id = ?', [req.params.id]);
    
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
      await connection.execute('UPDATE galerie_randonnee SET likes = likes + 1 WHERE id = ?', [req.params.id]);
    } else if (action === 'decrement') {
      await connection.execute('UPDATE galerie_randonnee SET likes = GREATEST(likes - 1, 0) WHERE id = ?', [req.params.id]);
    }
    
    const [updated] = await connection.execute('SELECT likes FROM galerie_randonnee WHERE id = ?', [req.params.id]);
    
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
// 5. CONTACT
// ============================================

app.post('/api/contact', async (req, res) => {
  const { nom, email, sujet, message } = req.body;
  
  console.log('📨 Données reçues contact:', { nom, email, sujet, message });
  
  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email invalide' });
  }
  
  let connection;
  try {
    connection = await getConnection();
    
    const [tables] = await connection.execute("SHOW TABLES LIKE 'contact_messages'");
    
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
    }
    
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
    res.status(500).json({ error: 'Erreur serveur' });
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
    const [rows] = await connection.execute('SELECT * FROM stations_ski ORDER BY region, nom');
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
    const [rows] = await connection.execute('SELECT * FROM stations_ski WHERE id = ?', [req.params.id]);
    
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
    `);
    
    console.log(`✅ ${rows.length} offres de ski chargées`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur offres ski:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 7. RÉSERVATIONS - VERSION CORRIGÉE
// ============================================

// ✅ POST - Créer une réservation (ski, randonnée, activité)
app.post('/api/reservations', async (req, res) => {
  console.log('\n' + '='.repeat(50));
  console.log('🔥 ROUTE POST /api/reservations APPELEE !');
  console.log('📦 Corps de la requête reçu:', JSON.stringify(req.body, null, 2));
  console.log('='.repeat(50));
  
  const { userId, activityId, type_activite, date, nbPersonnes, notes } = req.body;
  
  // Validation avec type_activite requis
  if (!userId || !activityId || !type_activite || !date) {
    console.log('❌ Erreur validation: champs manquants');
    return res.status(400).json({ 
      error: 'ID utilisateur, ID activité, type activité et date sont requis' 
    });
  }

  console.log(`✅ Validation OK - userId: ${userId}, activityId: ${activityId}, type: ${type_activite}, date: ${date}`);
  
  let connection;
  try {
    console.log('📡 Tentative de connexion à MySQL...');
    connection = await getConnection();
    console.log('✅ Connexion MySQL établie');
    
    // Vérifier que l'utilisateur existe
    console.log(`🔍 Vérification utilisateur ID: ${userId}...`);
    const [users] = await connection.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      console.log('❌ Utilisateur non trouvé');
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    console.log(`✅ Utilisateur trouvé: ${users[0].username}`);
    
    // Vérifier que l'offre/activité existe selon le type
    if (type_activite === 'ski') {
      const [offres] = await connection.execute(
        'SELECT id, titre FROM offres_ski WHERE id = ?',
        [activityId]
      );
      if (offres.length === 0) {
        return res.status(404).json({ error: 'Offre de ski non trouvée' });
      }
      console.log(`✅ Offre de ski trouvée: ${offres[0].titre}`);
    } 
    else if (type_activite === 'randonnee') {
      const [offres] = await connection.execute(
        'SELECT id, titre FROM offres_randonnee WHERE id = ?',
        [activityId]
      );
      if (offres.length === 0) {
        return res.status(404).json({ error: 'Offre de randonnée non trouvée' });
      }
      console.log(`✅ Offre de randonnée trouvée: ${offres[0].titre}`);
    }
    else if (type_activite === 'activite') {
      const [activities] = await connection.execute(
        'SELECT id, nom FROM activites WHERE id = ?',
        [activityId]
      );
      if (activities.length === 0) {
        return res.status(404).json({ error: 'Activité non trouvée' });
      }
      console.log(`✅ Activité trouvée: ${activities[0].nom}`);
    }
    
    // Formater les notes
    let notesStr = notes;
    if (typeof notes === 'object') {
      notesStr = JSON.stringify(notes);
    }
    
    // ✅ INSERTION CORRECTE avec 7 paramètres
    const [result] = await connection.execute(`
      INSERT INTO reservations 
      (membre_id, activite_id, type_activite, date_reservation, nb_personnes, notes, statut, date_creation) 
      VALUES (?, ?, ?, ?, ?, ?, 'confirmée', NOW())
    `, [
      parseInt(userId),
      parseInt(activityId),
      type_activite,
      date,
      nbPersonnes || 1,
      notesStr
    ]);
    
    console.log(`✅ RÉSERVATION CRÉÉE AVEC ID: ${result.insertId} (type: ${type_activite})`);
    
    res.status(201).json({
      message: '✅ Réservation effectuée avec succès',
      success: true,
      reservationId: result.insertId,
      type: type_activite
    });
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error('📝 Détail:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la réservation',
      details: error.message
    });
  } finally {
    if (connection) await connection.end();
    console.log('='.repeat(50) + '\n');
  }
});

// ✅ GET - Réservations d'un utilisateur
app.get('/api/reservations/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log(`🔍 Recherche des réservations pour l'utilisateur ID: ${userId}`);
  
  let connection;
  try {
    connection = await getConnection();
    
    const [reservations] = await connection.execute(`
      SELECT r.*, u.username as membre_nom
      FROM reservations r
      LEFT JOIN users u ON r.membre_id = u.id
      WHERE r.membre_id = ?
      ORDER BY r.date_reservation DESC
    `, [userId]);
    
    console.log(`✅ ${reservations.length} réservations trouvées`);
    
    // Enrichir chaque réservation avec les détails selon le type
    const enrichedReservations = await Promise.all(reservations.map(async (res) => {
      try {
        let notesData = {};
        if (res.notes) {
          try {
            notesData = JSON.parse(res.notes);
          } catch (e) {
            console.log('⚠️ Notes non JSON pour réservation', res.id);
          }
        }
        
        const typeReservation = res.type_activite || 'activite';
        
        if (typeReservation === 'ski') {
          const [offres] = await connection.execute(`
            SELECT o.*, s.nom as station_nom, s.photo_url as station_photo
            FROM offres_ski o
            LEFT JOIN stations_ski s ON o.station_id = s.id
            WHERE o.id = ?
          `, [res.activite_id]);
          
          if (offres.length > 0) {
            const offre = offres[0];
            return {
              id: res.id,
              type: 'ski',
              activite_nom: offre.titre,
              activite_type: offre.type_offre,
              lieu: offre.station_nom || 'Station de ski',
              date_reservation: res.date_reservation,
              nb_personnes: res.nb_personnes || 1,
              statut: res.statut || 'confirmée',
              prix: offre.prix,
              reduction: offre.reduction,
              description: offre.description,
              date_debut: offre.date_debut,
              date_fin: offre.date_fin,
              image_url: offre.station_photo || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
              notes: res.notes,
              details: notesData
            };
          }
        }
        else if (typeReservation === 'randonnee') {
          const [offres] = await connection.execute(
            'SELECT * FROM offres_randonnee WHERE id = ?',
            [res.activite_id]
          );
          
          if (offres.length > 0) {
            const offre = offres[0];
            return {
              id: res.id,
              type: 'randonnee',
              activite_nom: offre.titre,
              activite_type: 'randonnee',
              lieu: offre.lieu,
              date_reservation: res.date_reservation,
              nb_personnes: res.nb_personnes || 1,
              statut: res.statut || 'confirmée',
              difficulte: offre.difficulte,
              duree: offre.duree,
              prix: offre.prix,
              guide_inclus: offre.guide_inclus,
              image_url: offre.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
              notes: res.notes,
              details: notesData
            };
          }
        }
        
        // Par défaut (activités)
        const [activities] = await connection.execute(
          'SELECT * FROM activites WHERE id = ?',
          [res.activite_id]
        );
        
        if (activities.length > 0) {
          const activity = activities[0];
          return {
            id: res.id,
            type: 'activite',
            activite_nom: activity.nom,
            activite_type: activity.type || 'activite',
            lieu: activity.lieu || 'Non spécifié',
            date_reservation: res.date_reservation,
            nb_personnes: res.nb_personnes || 1,
            statut: res.statut || 'confirmée',
            difficulte: activity.difficulte,
            duree: activity.duree,
            image_url: activity.image_url || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop',
            notes: res.notes,
            details: notesData
          };
        }
        
        return {
          id: res.id,
          type: typeReservation,
          activite_nom: notesData.nom || 'Réservation',
          date_reservation: res.date_reservation,
          nb_personnes: res.nb_personnes || 1,
          statut: res.statut || 'confirmée',
          image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop'
        };
        
      } catch (error) {
        console.error('❌ Erreur enrichissement réservation', res.id, error.message);
        return {
          id: res.id,
          type: 'erreur',
          activite_nom: 'Réservation',
          date_reservation: res.date_reservation,
          nb_personnes: res.nb_personnes || 1,
          statut: res.statut || 'confirmée',
          image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop'
        };
      }
    }));
    
    console.log(`✅ ${enrichedReservations.length} réservations enrichies`);
    res.json(enrichedReservations);
    
  } catch (error) {
    console.error('❌ Erreur liste réservations:', error.message);
    console.error('📝 Détail:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors du chargement des réservations'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// ✅ DELETE - Supprimer une réservation
app.delete('/api/reservations/:id', async (req, res) => {
  const reservationId = req.params.id;
  const { userId } = req.body;
  
  console.log(`🗑️ Suppression réservation ID: ${reservationId} pour user: ${userId}`);
  
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
    
    await connection.execute('DELETE FROM reservations WHERE id = ?', [reservationId]);
    
    console.log(`✅ Réservation ${reservationId} supprimée`);
    res.json({
      message: '✅ Réservation supprimée avec succès',
      success: true
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// 9. ROUTES POUR OFFRES RANDONNEE
// ============================================

// GET - Toutes les offres de randonnée
app.get('/api/randonnee/offres', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM offres_randonnee 
      WHERE actif = TRUE 
      ORDER BY prix
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur chargement offres randonnée:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Une offre par ID
app.get('/api/randonnee/offres/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM offres_randonnee WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur chargement offre:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});



// ============================================
// ROUTES POUR OFFRES ESCALADE
// ============================================

// GET - Toutes les offres d'escalade
app.get('/api/escalade/offres', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM offres_escalade 
      WHERE actif = TRUE 
      ORDER BY prix
    `);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur chargement offres escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Une offre par ID
app.get('/api/escalade/offres/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM offres_escalade WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur chargement offre:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
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
    
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Nom d\'utilisateur ou email déjà utilisé' });
    }
    
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
    res.status(500).json({ error: 'Erreur serveur' });
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
        nom_utilisateur: user.username,
        username: user.username,
        email: user.email,
        date_inscription: user.created_at
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
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
    
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    
    await connection.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [nom_utilisateur, email, userId]
    );
    
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
// ROUTES POUR ESCALADE - SITES
// ============================================
app.get('/api/escalade/temoignages', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT * FROM temoignages_escalade
      WHERE approuve = 1
      ORDER BY created_at DESC
      LIMIT 20
    `);
    console.log(`✅ ${rows.length} témoignages escalade chargés`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur témoignages escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

app.post('/api/escalade/temoignages', async (req, res) => {
  const { nom, email, type_escalade, message, note } = req.body;

  if (!nom || !message) {
    return res.status(400).json({ error: 'Nom et message requis' });
  }

  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      `INSERT INTO temoignages_escalade 
       (nom, email, type_escalade, message, note, approuve) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [nom, email || null, type_escalade || null, message, note || 5]
    );
    console.log(`✅ Témoignage escalade créé ID: ${result.insertId}`);
    res.status(201).json({ 
      message: 'Témoignage envoyé avec succès', 
      id: result.insertId 
    });
  } catch (error) {
    console.error('❌ Erreur création témoignage escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});
// ============================================
// ROUTES POUR ESCALADE - TÉMOIGNAGES
// ============================================



app.post('/api/escalade/temoignages', async (req, res) => {
  const { nom, email, type_escalade, site_id, message, note } = req.body;

  if (!nom || !message) {
    return res.status(400).json({ error: 'Nom et message requis' });
  }

  let connection;
  try {
    connection = await getConnection();
    const [result] = await connection.execute(
      `INSERT INTO temoignages_escalade 
       (nom, email, type_escalade, site_id, message, note, approuve) 
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nom, email || null, type_escalade || null, site_id || null, message, note || 5]
    );
    console.log(`✅ Témoignage escalade créé ID: ${result.insertId}`);
    res.status(201).json({ message: 'Témoignage envoyé avec succès', id: result.insertId });
  } catch (error) {
    console.error('❌ Erreur création témoignage escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// ROUTES POUR ESCALADE - TÉMOIGNAGES
// ============================================

// GET - Tous les témoignages escalade
app.get('/api/escalade/temoignages', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    // Crée la table automatiquement si elle n'existe pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS temoignages_escalade (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        type_escalade VARCHAR(100),
        site_id INT DEFAULT NULL,
        message TEXT NOT NULL,
        note INT DEFAULT 5,
        approuve TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [rows] = await connection.execute(`
      SELECT t.*, s.nom as site_nom
      FROM temoignages_escalade t
      LEFT JOIN sites_escalade s ON t.site_id = s.id
      WHERE t.approuve = 1
      ORDER BY t.created_at DESC
      LIMIT 20
    `);

    console.log(`✅ ${rows.length} témoignages escalade chargés`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur témoignages escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// POST - Ajouter un témoignage escalade
app.post('/api/escalade/temoignages', async (req, res) => {
  const { nom, email, type_escalade, site_id, message, note } = req.body;

  if (!nom || !message) {
    return res.status(400).json({ error: 'Nom et message requis' });
  }

  let connection;
  try {
    connection = await getConnection();

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS temoignages_escalade (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        type_escalade VARCHAR(100),
        site_id INT DEFAULT NULL,
        message TEXT NOT NULL,
        note INT DEFAULT 5,
        approuve TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [result] = await connection.execute(
      'INSERT INTO temoignages_escalade (nom, email, type_escalade, site_id, message, note) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, email || null, type_escalade || null, site_id || null, message, note || 5]
    );

    console.log(`✅ Témoignage escalade créé avec ID: ${result.insertId}`);
    res.status(201).json({
      message: 'Témoignage envoyé avec succès',
      id: result.insertId
    });
  } catch (error) {
    console.error('❌ Erreur création témoignage escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Tous les sites d'escalade
app.get('/api/escalade/sites', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    
    // Vérifier si la table existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'sites_escalade'");
    
    if (tables.length === 0) {
      console.log('📝 Création de la table sites_escalade...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS sites_escalade (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(255) NOT NULL,
          lieu VARCHAR(255),
          region VARCHAR(100),
          difficulte VARCHAR(50),
          type_voie VARCHAR(100),
          hauteur INT,
          nombre_voies INT,
          description TEXT,
          image_url VARCHAR(500),
          coordonnees VARCHAR(255),
          acces TEXT,
          periode_recommandee VARCHAR(255),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Ajouter des données de test
      await connection.execute(`
        INSERT INTO sites_escalade (nom, lieu, region, difficulte, type_voie, hauteur, nombre_voies, description, image_url) VALUES
        ('Aiguille du Midi', 'Chamonix', 'Haute-Savoie', 'TD', 'Grande voie', 3842, 15, 'Site mythique de haute montagne', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800'),
        ('Céüse', 'Gap', 'Hautes-Alpes', '7a', 'Falaise', 1200, 350, 'Spot international de grimpe', 'https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=800'),
        ('Saussois', 'Merry-sur-Yonne', 'Bourgogne', '6b', 'Falaise', 60, 180, 'Falaise calcaire réputée', 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800'),
        ('Verdon', 'Castellane', 'Alpes-de-Haute-Provence', '6c', 'Grande voie', 700, 1500, 'Les plus grandes falaises d\'Europe', 'https://images.unsplash.com/photo-1516307365426-bea59173b509?w=800'),
        ('Fontainebleau', 'Fontainebleau', 'Île-de-France', '6a', 'Bloc', 15, 30000, 'Spot mondial de bloc', 'https://images.unsplash.com/photo-1590114538159-9f8a7e9e9c7a?w=800')
      `);
    }
    
    const [rows] = await connection.execute('SELECT * FROM sites_escalade ORDER BY region, nom');
    console.log(`✅ ${rows.length} sites d'escalade chargés`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Erreur chargement sites escalade:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});

// GET - Un site d'escalade par ID
app.get('/api/escalade/sites/:id', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM sites_escalade WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('❌ Erreur chargement site:', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
  } finally {
    if (connection) await connection.end();
  }
});


// ============================================
// MIDDLEWARE DE GESTION D'ERREURS
// ============================================

app.use((req, res) => {
  console.log(`❌ Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route non trouvée' });
});

app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
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
  console.log('   ├─ GET  /api');
  console.log('   ├─ GET  /api/articles');
  console.log('   ├─ GET  /api/activites');
  console.log('   ├─ GET  /api/galerie-randonnee');
  console.log('   ├─ GET  /api/ski/offres');
  console.log('   ├─ GET  /api/randonnee/offres');
  console.log('   └─ POST /api/reservations ✅ (ski, randonnée, activités)');
  console.log('='.repeat(70));
});