// src/pages/Home.js - VERSION AVEC NOUVEAU CSS PROFESSIONNEL
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActivityCard from '../components/ActivityCard';

const Home = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/activites')
      .then(response => {
        setActivities(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur API:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="section-lg bg-gray-50">
        <div className="container">
          <div className="text-center animate-fadeIn">
            <h1 className="mb-4">
              Aventures Alpines
            </h1>
            <p className="lead mb-6 max-w-2xl mx-auto">
              Découvrez les plus belles activités de montagne dans les Alpes.
              Expériences uniques pour tous les niveaux.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn btn-primary btn-lg">
                Découvrir
              </button>
              <button className="btn btn-outline btn-lg">
                En savoir plus
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Activities */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="mb-4">Activités sélectionnées</h2>
            <p className="text-gray max-w-xl mx-auto">
              Nos meilleures expériences, soigneusement choisies pour vous.
            </p>
          </div>

          {loading ? (
            <div className="text-center p-12">
              <div className="inline-block w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
              <p className="mt-4 text-gray">Chargement des activités...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-3 gap-8 mb-10">
                {activities.slice(0, 3).map((activity, index) => (
                  <ActivityCard key={activity.id || index} activity={activity} />
                ))}
              </div>

              <div className="text-center">
                <a 
                  href="/activities" 
                  className="btn btn-secondary"
                >
                  Voir toutes les activités →
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="mb-4">Pourquoi nous choisir</h2>
            <p className="text-gray max-w-xl mx-auto">
              Tout ce qui fait de nous votre partenaire idéal pour l'aventure en montagne.
            </p>
          </div>
          
          <div className="grid grid-3 gap-8">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-6">
                ⛰️
              </div>
              <h3 className="mb-4">Expériences uniques</h3>
              <p className="text-gray">
                Des activités soigneusement sélectionnées pour leur qualité et leur originalité.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-6">
                👨‍🏫
              </div>
              <h3 className="mb-4">Guides experts</h3>
              <p className="text-gray">
                Accompagnement par des professionnels certifiés et passionnés.
              </p>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-6">
                🏔️
              </div>
              <h3 className="mb-4">Lieux exceptionnels</h3>
              <p className="text-gray">
                Accès aux plus beaux sites des Alpes, préservés et authentiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section">
        <div className="container">
          <div className="grid grid-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {activities.length}
              </div>
              <div className="text-gray font-medium">Activités</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                100%
              </div>
              <div className="text-gray font-medium">Satisfaction</div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                24/7
              </div>
              <div className="text-gray font-medium">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projet BTS */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="card p-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white text-xl">
                📋
              </div>
              <div>
                <h3 className="mb-1">Projet BTS SLAM</h3>
                <p className="text-gray text-sm">
                  Aventures Alpines - Site éducatif
                </p>
              </div>
            </div>
            
            <p className="mb-6">
              Ce site est développé dans le cadre du BTS Services Logiciels et Applications Métiers.
              Une application complète avec frontend React, backend Node.js/Express et base de données MySQL.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <span className="badge badge-primary">React</span>
              <span className="badge badge-secondary">Node.js</span>
              <span className="badge badge-success">Express</span>
              <span className="badge badge-warning">MySQL</span>
              <span className="badge badge-danger">Axios</span>
              <span className="badge">JavaScript</span>
              <span className="badge">CSS3</span>
              <span className="badge">HTML5</span>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray">
                <strong>Note pédagogique :</strong> Cette application démontre la maîtrise des compétences 
                du BTS SLAM : développement full-stack, gestion de bases de données, API REST, et déploiement.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;