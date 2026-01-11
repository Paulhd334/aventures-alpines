#  Aventures Alpines

---

## 📌 Présentation du projet

**Aventures Alpines** est une application web composée :

* d’un **backend (server)** chargé de la logique métier et de l’API,
* d’un **frontend (client)** qui constitue l’interface utilisateur.

Le projet est structuré selon une architecture claire séparant les responsabilités entre le client et le serveur.

🧰 Prérequis

Avant de lancer le projet, assurez‑vous d’avoir installé :

Git

Node.js (version 18 ou supérieure recommandée)

npm

Un terminal (PowerShell, Invite de commandes, Terminal Linux/Mac)

## 📥 Installation du projet

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/Paulhd334/aventures-alpines.git
cd aventures-alpines
```

---

## ⚙️ Lancement du serveur (Backend)

Le serveur gère l’API et les traitements côté serveur.

```bash
cd server
npm install
npm start
```

➡️ Le serveur démarre sur le port configuré (par défaut : `http://localhost:3000`).

---

## 💻 Lancement du client (Frontend)

Le client correspond à l’interface utilisateur de l’application.

> ⚠️ Ouvrez **un nouveau terminal** avant de lancer le client.

```bash
cd aventures-alpines
cd client
npm install
npm run dev
```

➡️ L’application est accessible via le navigateur à l’adresse indiquée dans le terminal (ex : `http://localhost:5173`).

---

## 📁 Structure du projet

```text
aventures-alpines/
│
├── client/        # Frontend (interface utilisateur)
├── server/        # Backend (API, logique métier)
└── README.md      # Documentation du projet
```

---

## 🧪 Développement

* Le backend est développé avec **Node.js**
* Le frontend utilise un framework  REACT et JavaScript
* Les dépendances sont gérées avec **npm**

---

## 👤 Auteur

**Paul**
Projet réalisé dans le cadre du **BTS SIO – option SLAM**.

---

## 📄 Licence

Projet à usage pédagogique.
