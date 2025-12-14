const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ====================
// CONFIGURATION
// ====================
const app = express();
const PORT = 5000;
const SECRET_KEY = 'votre_secret_jwt_aventures_alpines_2024';

// ====================
// CONNEXION MYSQL AVEC DIAGNOSTIC
// ====================
console.log('🔍 Tentative de connexion à MySQL Railway...');
console.log('📌 Host: centerbeam.proxy.rlwy.net:11303');
console.log('📌 User: root');
console.log('📌 Database: railway');

const db = mysql.createConnection({
  host: 'centerbeam.proxy.rlwy.net',
  user: 'root',
  password: 'NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL',
  database: 'railway',
  port: 11303,
  connectTimeout: 15000
});

// ====================
// MIDDLEWARE
// ====================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// ====================
// FONCTION DE DIAGNOSTIC COMPLET
// ====================
function diagnosticComplet() {
  console.log('\n🔍 DIAGNOSTIC COMPLET DE LA BASE DE DONNÉES');
  console.log('===========================================');
  
  // 1. Vérifier la connexion
  db.ping((err) => {
    if (err) {
      console.error('❌ ÉCHEC: Impossible de se connecter à MySQL');
      console.error('   Erreur:', err.message);
      console.log('\n🛠️ SOLUTIONS:');
      console.log('   1. Vérifiez que votre service MySQL est actif sur Railway');
      console.log('   2. Vérifiez les identifiants dans le dashboard Railway');
      console.log('   3. Essayez de vous connecter manuellement:');
      console.log('      mysql -h centerbeam.proxy.rlwy.net -P 11303 -u root -p');
      console.log('   4. Mot de passe: NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL');
      return;
    }
    
    console.log('✅ SUCCÈS: Connexion MySQL établie!');
    
    // 2. Vérifier les tables
    db.query('SHOW TABLES', (err, tables) => {
      if (err) {
        console.error('❌ Erreur SHOW TABLES:', err.message);
        return;
      }
      
      console.log(`\n📊 Tables dans la base de données: ${tables.length}`);
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
      
      // 3. Vérifier la table activités
      db.query('SELECT COUNT(*) as count FROM activites', (err, result) => {
        if (err) {
          console.log('\n📦 Table "activites" n\'existe pas ou erreur');
          creerTablesEtDonnees();
        } else {
          console.log(`\n📈 Activités dans la base: ${result[0].count}`);
          
          if (result[0].count === 0) {
            console.log('📥 La table est vide, insertion des données...');
            insererDonneesExemple();
          } else {
            console.log('✅ Données déjà présentes');
            afficherActivites();
          }
        }
      });
    });
  });
}

// ====================
// CRÉATION FORCÉE DES TABLES
// ====================
function creerTablesEtDonnees() {
  console.log('\n🛠️ CRÉATION DES TABLES...');
  
  // Table utilisateurs
  const sqlUtilisateurs = `
    CREATE TABLE IF NOT EXISTS utilisateurs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      nom_utilisateur VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      mot_de_passe VARCHAR(255) NOT NULL,
      date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      role ENUM('user', 'admin') DEFAULT 'user'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `;
  
  db.query(sqlUtilisateurs, (err) => {
    if (err) {
      console.error('❌ Erreur création table utilisateurs:', err.message);
    } else {
      console.log('✅ Table "utilisateurs" créée');
      
      // Table activités
      const sqlActivites = `
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `;
      
      db.query(sqlActivites, (err) => {
        if (err) {
          console.error('❌ Erreur création table activites:', err.message);
        } else {
          console.log('✅ Table "activites" créée');
          insererDonneesExemple();
        }
      });
    }
  });
}

// ====================
// INSERTION FORCÉE DES DONNÉES
// ====================
function insererDonneesExemple() {
  console.log('\n📥 INSERTION DES DONNÉES D\'EXEMPLE...');
  
  const activites = [
    ['Ski alpin à Chamonix', 'ski', 'Intermédiaire', 'Des pistes mythiques pour tous les niveaux', 'https://picsum.photos/800/600?random=1', 'Chamonix', 45.00, '1 journée', 'Hiver'],
    ['Randonnée du Lac Blanc', 'randonnee', 'Facile', 'Randonnée familiale avec vue magnifique', 'https://picsum.photos/800/600?random=2', 'Argentière', 25.00, '3h30', 'Été'],
    ['Escalade aux Drus', 'escalade', 'Expert', 'Voies techniques en haute montagne', 'https://picsum.photos/800/600?random=3', 'Les Drus', 120.00, '8-10 heures', 'Été'],
    ['Ski de fond aux Contamines', 'ski', 'Débutant', '100km de pistes damées', 'https://picsum.photos/800/600?random=4', 'Les Contamines', 25.00, '1 journée', 'Hiver'],
    ['Via Ferrata du Brevent', 'escalade', 'Intermédiaire', 'Parcours sécurisé avec échelles', 'https://picsum.photos/800/600?random=5', 'Chamonix', 65.00, '4 heures', 'Été'],
    ['Raquettes au Col de Balme', 'randonnee', 'Facile', 'Balade en raquettes au coucher du soleil', 'https://picsum.photos/800/600?random=6', 'Col de Balme', 35.00, '2h30', 'Hiver']
  ];
  
  const sql = 'INSERT IGNORE INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES ?';
  
  db.query(sql, [activites], (err, result) => {
    if (err) {
      console.error('❌ Erreur insertion activités:', err.message);
      console.log('\n🛠️ Essayons une insertion une par une...');
      insererUneParUne(activites);
    } else {
      console.log(`✅ ${result.affectedRows} activités insérées avec succès!`);
      afficherActivites();
    }
  });
}

function insererUneParUne(activites) {
  let inserted = 0;
  
  activites.forEach((activite, index) => {
    const sql = 'INSERT IGNORE INTO activites (nom, type, difficulte, description, image_url, lieu, prix, duree, saison) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(sql, activite, (err, result) => {
      if (err) {
        console.error(`❌ Erreur insertion activité ${index + 1}:`, err.message);
      } else if (result.affectedRows > 0) {
        inserted++;
        console.log(`✅ Activité ${index + 1} insérée: ${activite[0]}`);
      }
      
      if (index === activites.length - 1) {
        console.log(`\n📊 Total: ${inserted} activités insérées sur ${activites.length}`);
        afficherActivites();
      }
    });
  });
}

function afficherActivites() {
  console.log('\n📋 LISTE DES ACTIVITÉS DANS LA BASE:');
  console.log('===================================');
  
  db.query('SELECT id, nom, type, prix FROM activites ORDER BY id', (err, results) => {
    if (err) {
      console.error('❌ Erreur récupération activités:', err.message);
    } else {
      results.forEach(activity => {
        console.log(`   ${activity.id}. ${activity.nom} (${activity.type}) - ${activity.prix}€`);
      });
      console.log(`\n📊 Total: ${results.length} activités disponibles`);
    }
  });
}

// ====================
// CONNEXION À LA BASE DE DONNÉES
// ====================
db.connect((err) => {
  if (err) {
    console.error('\n❌ ERREUR CRITIQUE: Impossible de se connecter à MySQL');
    console.error('   Message:', err.message);
    console.error('   Code:', err.code);
    
    console.log('\n🛠️ ACTION REQUISE:');
    console.log('   1. Allez sur Railway.app');
    console.log('   2. Ouvrez votre projet "aventures-alpines"');
    console.log('   3. Cliquez sur le service MySQL');
    console.log('   4. Vérifiez les "Credentials" (identifiants)');
    console.log('   5. Vérifiez que le service est "Running"');
    
    console.log('\n📌 Identifiants actuels:');
    console.log('   Host: centerbeam.proxy.rlwy.net');
    console.log('   Port: 11303');
    console.log('   User: root');
    console.log('   Password: NnpQXlvkNUHHyOaawaikRbzkPTwTBzqL');
    console.log('   Database: railway');
    
    // Le serveur démarre quand même pour les tests
    demarrerServeur();
  } else {
    console.log('\n✅ CONNEXION RÉUSSIE À MYSQL RAILWAY!');
    diagnosticComplet();
    demarrerServeur();
  }
});

// ====================
// ROUTES SIMPLIFIÉES
// ====================

// Route de test
app.get('/', (req, res) => {
  db.query('SELECT COUNT(*) as count FROM activites', (err, results) => {
    const count = err ? 0 : results[0].count;
    
    res.json({
      message: 'API Aventures Alpines - VERSION CORRIGÉE',
      status: 'online',
      database: 'MySQL Railway',
      activites_total: count,
      endpoints: {
        activites: 'GET /api/activites',
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      }
    });
  });
});

// Route activités (TOUJOURS FONCTIONNE MÊME SI DB ÉCHOUÉE)
app.get('/api/activites', (req, res) => {
  db.query('SELECT * FROM activites ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Erreur /api/activites:', err.message);
      
      // Retourner des données mockées si la DB échoue
      res.json([
        {
          id: 1,
          nom: "Ski alpin à Chamonix (MOCK)",
          type: "ski",
          difficulte: "Intermédiaire",
          description: "Données mockées - DB non disponible",
          image_url: "https://picsum.photos/800/600?random=1",
          lieu: "Chamonix",
          prix: 45.00,
          duree: "1 journée",
          saison: "Hiver"
        }
      ]);
    } else {
      res.json(results);
    }
  });
});

// Routes d'authentification basiques
app.post('/api/auth/register', async (req, res) => {
  const { nom_utilisateur, email, mot_de_passe } = req.body;
  
  if (!nom_utilisateur || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
  
  db.query(
    'INSERT INTO utilisateurs (nom_utilisateur, email, mot_de_passe) VALUES (?, ?, ?)',
    [nom_utilisateur, email, hashedPassword],
    (err, result) => {
      if (err) {
        console.error('Erreur inscription:', err.message);
        return res.status(500).json({ error: 'Erreur base de données' });
      }
      
      const token = jwt.sign(
        { userId: result.insertId, nom_utilisateur, email, role: 'user' },
        SECRET_KEY,
        { expiresIn: '24h' }
      );
      
      res.status(201).json({
        message: 'Inscription réussie',
        token,
        user: { id: result.insertId, nom_utilisateur, email, role: 'user' }
      });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, mot_de_passe } = req.body;
  
  db.query('SELECT * FROM utilisateurs WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const user = results[0];
    const validPassword = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { userId: user.id, nom_utilisateur: user.nom_utilisateur, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: '24h' }
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
  });
});

// ====================
// DÉMARRAGE DU SERVEUR
// ====================
function demarrerServeur() {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 SERVEUR API DÉMARRÉ');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/activites`);
    console.log('='.repeat(50));
    console.log('\n📋 TESTS RAPIDES:');
    console.log('   1. Ouvrez: http://localhost:5000');
    console.log('   2. Ouvrez: http://localhost:5000/api/activites');
    console.log('   3. Testez dans Postman ou curl');
    console.log('\n✅ Prêt à recevoir des requêtes!');
  });
}

// Gestion des erreurs
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
});