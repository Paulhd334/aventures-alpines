// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Activities from './pages/Activities';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CreatePublication from './pages/CreatePublication';
import Articles from './pages/Articles';
import ProfilePublic from './pages/ProfilePublic';
import Itineraires from './pages/Itineraires';
import Randonnee from './pages/Randonnee';
import Escalade from './pages/Escalade';
import Ski from './pages/Ski';
import VideosPage from './pages/Videos'; // ← CORRECTION ICI

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:username" element={<ProfilePublic />} />
            
            {/* Pages d'activités */}
            <Route path="/randonnee" element={<Randonnee />} />
            <Route path="/escalade" element={<Escalade />} />
            <Route path="/ski" element={<Ski />} />
            <Route path="/itineraires" element={<Itineraires />} />
            
            {/* Articles et publications */}
            <Route path="/blog/new" element={<CreatePublication />} />
            <Route path="/blog" element={<Articles />} />
            <Route path="/articles" element={<Articles />} />

            <Route path="/videos" element={<VideosPage />} /> {/* ← Chemin en minuscule */}
            
            {/* Route 404 */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;