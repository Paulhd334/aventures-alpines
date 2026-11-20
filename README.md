# Aventures Alpines

Application web full-stack pour explorer et partager des aventures en montagne.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)

##  Architecture

    ┌─────────────────┐     HTTP/JSON     ┌─────────────────┐
    │   FRONTEND      │◄────────────────►│    BACKEND       │
    │   React 18      │     Port: 5000    │   Node.js 18    │
    │   Port: 3000    │                   │   Express 4.x   │
    └────────┬────────┘                   └────────┬────────┘
             │                                     │
             ▼                                     ▼
    ┌─────────────────┐                   ┌─────────────────┐
    │    Navigateur   │                   │   PHP MY ADMIN  │
    │    Chrome       │                   │      MAMP       │
    └─────────────────┘                   └─────────────────┘



Frontend : http://localhost:3000

Backend API : http://localhost:5000/api

phpMyAdmin : http://localhost/phpmyadmin (MAMP)


## Quick Start

1. Start MAMP and open phpMyAdmin. For a fresh setup, create a database named `aventures_alpines` and import `aventures_alpines.sql`. Make sure the MySQL settings in `server/server.js` match MAMP.

2. With Node.js 20.x installed, start the backend from the project root.

   ```bash
   cd server
   npm install
   npm start
   ```

3. Open a second terminal at the project root and start the frontend.

   ```bash
   cd client
   npm install
   npm start
   ```

Open [Aventures Alpines](http://localhost:3000) in your browser. Keep both terminals running. You only need to run `npm install` once per folder.

