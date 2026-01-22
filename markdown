Fiche de synthèse – Aventures Alpines
1. Introduction
Aventures Alpines est une plateforme web complète dédiée aux passionnés de sports de montagne, développée dans le cadre du Bloc2 spécialité SLAM. Cette application permet aux utilisateurs de découvrir des activités en montagne, de partager leurs expériences, et de gérer leur profil au sein d'une communauté engagée.

Contexte technique : Application fullstack utilisant React pour le frontend, Node.js/Express pour le backend, et MySQL (via MAMP) pour la gestion des données, avec une architecture REST API moderne.

2. Schéma MCD
2.1 Modèle Conceptuel de Données (MCD)
text
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   UTILISATEURS  │      │    ACTIVITÉS    │      │   PUBLICATIONS  │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id (PK)         │◄──┐  │ id (PK)         │      │ id (PK)         │
│ nom_utilisateur │   │  │ nom             │      │ user_id (FK)    │◄─┐
│ email           │   │  │ type            │      │ titre           │  │
│ mot_de_passe    │   │  │ difficulte      │      │ contenu         │  │
│ date_inscription│   │  │ description     │      │ type            │  │
│ role            │   │  │ image_url       │      │ image_url       │  │
└─────────────────┘   │  │ lieu            │      │ lieu            │  │
                      │  │ prix            │      │ date_publication│  │
                      │  │ duree           │      └─────────────────┘  │
                      │  │ saison          │                           │
                      │  │ created_at      │                           │
                      │  └─────────────────┘                           │
                      │                                                │
                      └────────────────────────────────────────────────┘



┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    SQL Queries    ┌─────────────────┐
│    CLIENT       │ ◄─────────────► │     SERVER      │ ◄───────────────► │      BDD        │
│   (React)       │    API Calls    │   (Node.js)     │   MySQL/MAMP     │   (MySQL)       │
│   localhost:3000│                 │  localhost:5000 │                   │  localhost:8889 │
└─────────────────┘                 └─────────────────┘                   └─────────────────┘
       │                                   │                                       │
       └─────── Browser (SPA) ────────────┘                                       │
                                                                                  │
                                                                        phpMyAdmin (interface web)

4.2 Structure détaillée du projet


text
aventures-alpines/
├── client/                    # Frontend React
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/        # Composants réutilisables
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   ├── ActivityCard.js
│   │   │   └── ...
│   │   ├── pages/             # Pages de l'application
│   │   │   ├── Home.js
│   │   │   ├── Activities.js
│   │   │   ├── Profile.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Contact.js
│   │   ├── App.js             # Routeur principal
│   │   └── index.js           # Point d'entrée
│   └── package.json           # Dépendances React + proxy
│
├── server/                    # Backend Node.js
│   ├── server.js             # Configuration serveur + routes
│   └── package.json          # Dépendances Node.js
│



4.3 Workflow de développement
Frontend : cd client && npm start (port 3000)

Backend : cd server && node server.js (port 5000)

Base de données : MAMP démarré (port 8889)

Proxy : React redirige /api/* vers localhost:5000




5.4 API REST complète
text
Endpoints principaux :
GET    /api/activites          # Liste toutes les activités
GET    /api/activites/:id      # Détail d'une activité
POST   /api/activites          # Créer une activité (protégé)

POST   /api/auth/register      # Inscription
POST   /api/auth/login         # Connexion
GET    /api/auth/profile       # Profil utilisateur (protégé)
GET    /api/auth/verify        # Vérification token

GET    /api/users/:id/publications  # Publications utilisateur
POST   /api/publications       # Créer publication (protégé)
5.5 Gestion des données
MySQL via MAMP : Base de données relationnelle


6. Difficultés rencontrées
6.1 Intégration BDD/API
Problème : Connexion MySQL MAMP sur port 8889

Solution : Configuration spécifique dans mysql.createConnection()

Résultat : Connexion stable avec timeout et gestion d'erreurs

6.2 Communication React/API
Problème : CORS entre localhost:3000 et localhost:5000

Solution : Configuration CORS Express + proxy React

Résultat : Communication transparente avec axios.get('/api/...')

6.3 Gestion des états React
Problème : Synchronisation état auth entre composants



6.4 Authentification sécurisée
Problème : Stockage sécurisé des mots de passe

Solution : bcrypt pour le hash + JWT pour les sessions

Résultat : Système auth professionnel avec tokens expirants

6.5 Déploiement et environnement
Problème : Variables d'environnement et ports

Solution : Configuration modularisée avec fallbacks

Résultat : Application facilement déployable


9. Conclusion
Aventures Alpines représente un projet fullstack abouti qui démontre une maîtrise complète du cycle de développement web moderne. De la conception de la base de données à l'interface utilisateur en passant par l'API REST sécurisée, chaque étape a été menée avec rigueur et professionnalisme.

Ce projet valide non seulement des compétences techniques solides en React, Node.js, et MySQL, mais aussi des compétences méthodologiques essentielles en gestion de projet, résolution de problèmes, et travail autonome.

Technologies maîtrisées : React, Node.js, Express, MySQL, JWT, bcrypt, Axios, React Router, MAMP, REST API, Git

Compétences démontrées : Conception BDD, développement fullstack, sécurité web, UX/UI, documentation technique, débogage complexe

