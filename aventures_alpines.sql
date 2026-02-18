-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : mer. 18 fév. 2026 à 16:38
-- Version du serveur : 5.7.24
-- Version de PHP : 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `aventures_alpines`
--

-- --------------------------------------------------------

--
-- Structure de la table `activites`
--

CREATE TABLE `activites` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `type` varchar(50) NOT NULL,
  `date_debut` datetime NOT NULL,
  `date_fin` datetime NOT NULL,
  `lieu` varchar(150) DEFAULT NULL,
  `capacite_max` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `image_url` varchar(255) DEFAULT 'https://picsum.photos/800/600',
  `duree` varchar(50) DEFAULT NULL,
  `difficulte` varchar(50) DEFAULT NULL,
  `saison` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `activites`
--

INSERT INTO `activites` (`id`, `nom`, `description`, `type`, `date_debut`, `date_fin`, `lieu`, `capacite_max`, `created_at`, `image_url`, `duree`, `difficulte`, `saison`) VALUES
(1, 'Ski alpin à Chamonix', 'Des pistes mythiques pour tous les niveaux. Expérience unique dans la vallée de Chamonix avec moniteurs qualifiés.', 'ski', '2026-01-20 09:00:00', '2026-01-20 17:00:00', 'Chamonix', 20, '2026-01-19 20:54:13', 'https://picsum.photos/id/1015/800/600', '1 journée', 'Intermédiaire', 'Hiver'),
(2, 'Randonnée du Lac Blanc', 'Randonnée familiale avec vue magnifique sur les Alpes. Accessible à tous les âges.', 'randonnee', '2026-06-15 08:30:00', '2026-06-15 12:00:00', 'Argentière', 15, '2026-01-19 20:54:13', 'https://picsum.photos/id/1018/800/600', '3h30', 'Facile', 'Été'),
(3, 'Escalade aux Drus', 'Voies d\'escalade technique pour grimpeurs expérimentés. Équipement fourni.', 'escalade', '2026-07-10 08:00:00', '2026-07-10 18:00:00', 'Les Drus', 8, '2026-01-19 20:54:13', 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop', '1 journée', 'Difficile', 'Été'),
(4, 'VTT descente à Morzine', 'Descentes techniques dans les Alpes avec équipement fourni. Pour les amateurs de sensations fortes.', 'vtt', '2026-07-20 14:00:00', '2026-07-20 16:30:00', 'Morzine', 12, '2026-01-19 20:54:13', 'https://pierrelonchampt.com/wp-content/uploads/2020/11/photo-mont-margeriaz-hiver-bauges-020219.jpg', '2h30', 'Intermédiaire', 'Été'),
(5, 'Randonnée glaciaire sur la Mer de Glace', 'Découverte des glaciers avec guide professionnel. Équipement de sécurité fourni.', 'randonnee', '2026-05-10 07:00:00', '2026-05-10 11:00:00', 'Mer de Glace', 10, '2026-01-19 20:54:13', 'https://pierrelonchampt.com/wp-content/uploads/2023/12/PL231111-01382-vallon-ecrins-768x1151.jpg', '4 heures', 'Moyen', 'Printemps-Été'),
(6, 'Ski freeride à Val Thorens', 'Hors-piste encadré par des guides experts. Pour les skieurs confirmés.', 'ski', '2026-02-15 09:00:00', '2026-02-15 16:00:00', 'Val Thorens', 6, '2026-01-19 20:54:13', 'https://picsum.photos/id/1019/800/600', '1 journée', 'Expert', 'Hiver'),
(7, 'Via ferrata des Aravis', 'Parcours sécurisé pour découvrir l\'escalade en montagne. Parfait pour les débutants.', 'escalade', '2026-08-05 10:00:00', '2026-08-05 13:00:00', 'Les Aravis', 12, '2026-01-19 20:54:13', 'https://picsum.photos/id/1057/800/600', '3 heures', 'Intermédiaire', 'Été'),
(8, 'Raquettes au Col de la Croix', 'Balade en raquettes avec vue panoramique. Accessible sans expérience.', 'randonnee', '2026-01-25 13:30:00', '2026-01-25 16:00:00', 'Col de la Croix', 15, '2026-01-19 20:54:13', 'https://pierrelonchampt.com/wp-content/uploads/2020/11/photo-vallee-ga-meije-ecrins-080720.jpg', '2h30', 'Facile', 'Hiver');

-- --------------------------------------------------------

--
-- Structure de la table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contenu` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `auteur_id` int(11) NOT NULL,
  `lieu` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'récit',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `articles`
--

INSERT INTO `articles` (`id`, `titre`, `contenu`, `auteur_id`, `lieu`, `type`, `created_at`) VALUES
(1, 'Ascension du Mont Blanc', 'Une expérience incroyable pour gravir le plus haut sommet d’Europe. Prévoir équipement et guide.', 4, 'Mont Blanc', 'récit', '2026-02-18 09:00:00'),
(2, 'Randonnée autour du Mont Blanc', 'Itinéraire panoramique traversant les vallées et glaciers autour du Mont Blanc.', 8, 'Mont Blanc', 'guide', '2026-02-18 09:30:00'),
(3, 'Découverte des Alpes du Nord', 'Présentation des plus belles montagnes des Alpes du Nord et conseils pour les randonneurs.', 11, 'Alpes du Nord', 'article', '2026-02-18 10:00:00'),
(4, 'Escalade aux Drus', 'Voies techniques pour grimpeurs expérimentés dans les Drus. Équipement fourni.', 14, 'Les Drus', 'récit', '2026-02-18 10:30:00'),
(5, 'Tour du Beaufortain', 'Randonnée dans le massif du Beaufortain, alpages et vues sur le Mont Blanc.', 8, 'Beaufortain', 'guide', '2026-02-18 11:00:00'),
(6, 'Sommets des Vosges', 'Randonnée facile pour découvrir les sommets des Vosges et profiter de paysages variés.', 4, 'Vosges', 'article', '2026-02-18 11:30:00'),
(7, 'Raquettes au Col de la Croix', 'Balade hivernale en raquettes avec vue panoramique sur les montagnes.', 11, 'Col de la Croix', 'récit', '2026-02-18 12:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `contact_messages`
--

CREATE TABLE `contact_messages` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `sujet` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `date_envoi` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `contact_messages`
--

INSERT INTO `contact_messages` (`id`, `nom`, `email`, `sujet`, `message`, `date_envoi`) VALUES
(1, 'vuobhipnj', 'njio@gmail.com', 'guide', 'fezdfzraGFRZE', '2026-02-18 16:24:30');

-- --------------------------------------------------------

--
-- Structure de la table `galerie_randonnee`
--

CREATE TABLE `galerie_randonnee` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) DEFAULT NULL,
  `titre` varchar(200) NOT NULL,
  `description` text,
  `image_url` varchar(500) NOT NULL,
  `localisation` varchar(200) DEFAULT NULL,
  `altitude` int(11) DEFAULT NULL,
  `difficulte` enum('facile','moyen','difficile','tres_difficile') DEFAULT NULL,
  `saison` enum('printemps','ete','automne','hiver') DEFAULT NULL,
  `date_prise` date DEFAULT NULL,
  `likes` int(11) DEFAULT '0',
  `date_publication` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `galerie_randonnee`
--

INSERT INTO `galerie_randonnee` (`id`, `utilisateur_id`, `titre`, `description`, `image_url`, `localisation`, `altitude`, `difficulte`, `saison`, `date_prise`, `likes`, `date_publication`) VALUES
(1, NULL, 'Sommet du Mont Blanc', 'Vue depuis le sommet à 4809m', 'https://www.montagnes-magazine.com/media/Pedago/conseil/pe%CC%81dago%20rando%20conseils.jpg', 'Mont Blanc', 4809, 'tres_difficile', 'ete', '2024-07-15', 42, '2026-01-26 10:22:28'),
(2, 4, 'Lac d\'altitude', 'Lac bleu turquoise', 'https://www.montagnes-magazine.com/media/Pedago/conseil/rando%20glaciaire.jpg', 'Alpes', 2350, 'moyen', 'ete', '2024-08-20', 28, '2026-01-26 10:22:28'),
(3, NULL, 'Randonnée automnale', 'Couleurs d\'automne', 'https://magazine.sportihome.com/wp-content/uploads/2019/04/randonnee-alpes-1068x712.jpg', 'Vosges', 1247, 'facile', 'automne', '2024-10-12', 35, '2026-01-26 10:22:28'),
(4, NULL, 'Coucher de soleil', 'Derniers rayons', 'https://www.france-montagnes.com/wp-content/uploads/2025/01/randonnee-c-anastasia-600x500.jpg', 'Alpes du Nord', 2100, 'moyen', 'hiver', '2024-02-28', 19, '2026-01-26 10:22:28');

-- --------------------------------------------------------

--
-- Structure de la table `itineraires`
--

CREATE TABLE `itineraires` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `difficulte` varchar(20) NOT NULL,
  `duree` varchar(50) NOT NULL,
  `distance` varchar(50) NOT NULL,
  `denivele` varchar(50) NOT NULL,
  `meilleure_saison` varchar(100) NOT NULL,
  `points_interet` text NOT NULL,
  `region` varchar(100) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `itineraires`
--

INSERT INTO `itineraires` (`id`, `nom`, `description`, `difficulte`, `duree`, `distance`, `denivele`, `meilleure_saison`, `points_interet`, `region`, `image_url`, `created_at`) VALUES
(11, 'Tour du Mont Blanc', 'Le tour du Mont Blanc est une randonnée mythique qui fait le tour du plus haut sommet d\'Europe occidentale. L\'itinéraire traverse trois pays : la France, l\'Italie et la Suisse.', 'Difficile', '7-10 jours', '170 km', '+10000 m', 'Juillet à Septembre', 'Vue sur le Mont Blanc, glaciers, refuges typiques, villages alpins', 'Alpes', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', '2026-01-26 08:50:16'),
(12, 'GR20 Corse', 'Considéré comme le sentier de grande randonnée le plus difficile d\'Europe, le GR20 traverse la Corse du Nord au Sud à travers les montagnes corses.', 'Très Difficile', '15 jours', '180 km', '+12000 m', 'Juin à Septembre', 'Lacs de montagne, aiguilles de Bavella, forêts, bergeries', 'Corse', 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop', '2026-01-26 08:50:16'),
(13, 'Chemin de Stevenson', 'Sur les traces de Robert Louis Stevenson et son âne à travers les Cévennes. Randonnée culturelle et historique.', 'Facile', '12 jours', '220 km', '+5000 m', 'Avril à Octobre', 'Villages cévenols, châtaigneraies, histoire, patrimoine', 'Cévennes', 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?w=800&auto=format&fit=crop', '2026-01-26 08:50:16'),
(14, 'Tour des Écrins', 'Randonnée autour du massif des Écrins, parc national avec une biodiversité exceptionnelle. Itinéraire sauvage et préservé.', 'Difficile', '10-12 jours', '150 km', '+9000 m', 'Juillet à Septembre', 'Glaciers, chamois, villages authentiques, faune sauvage', 'Alpes', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop', '2026-01-26 08:50:16'),
(15, 'Tour du Queyras', 'Randonnée dans le Parc Naturel Régional du Queyras, région préservée aux paysages minéraux impressionnants.', 'Moyen', '6-8 jours', '110 km', '+6000 m', 'Juin à Septembre', 'Mélèzes, lacs, fortifications militaires, villages perchés', 'Alpes', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop', '2026-01-26 08:50:16'),
(18, 'Tour du Beaufortain', 'Randonnée dans le massif du Beaufortain, région réputée pour ses alpages et son fromage.', 'Moyen', '4-6 jours', '70 km', '+3500 m', 'Juin à Septembre', 'Alpages, fromageries, vues sur le Mont Blanc', 'Alpes', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop', '2026-01-26 08:50:16');

-- --------------------------------------------------------

--
-- Structure de la table `offres_ski`
--

CREATE TABLE `offres_ski` (
  `id` int(11) NOT NULL,
  `titre` varchar(150) NOT NULL,
  `station_id` int(11) NOT NULL,
  `type_offre` enum('forfait','hébergement','pack','cours','matériel') NOT NULL,
  `description` text NOT NULL,
  `prix` decimal(7,2) NOT NULL,
  `reduction` varchar(50) DEFAULT NULL,
  `date_debut` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `lien_resa` varchar(255) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `offres_ski`
--

INSERT INTO `offres_ski` (`id`, `titre`, `station_id`, `type_offre`, `description`, `prix`, `reduction`, `date_debut`, `date_fin`, `lien_resa`, `actif`, `created_at`, `updated_at`) VALUES
(9, 'Forfait Famille 4 jours', 1, 'forfait', 'Forfait ski 4 jours pour 2 adultes + 2 enfants. Accès illimité à toutes les remontées mécaniques.', '320.00', '-25%', '2024-12-15', '2025-01-31', 'https://www.chamonix.com/reservation', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(10, 'Chalet Montagne Vue Panoramique', 2, 'hébergement', 'Chalet 8 personnes avec sauna, cheminée et vue imprenable sur les montagnes. Wifi inclus.', '1800.00', '-15%', '2025-01-10', '2025-02-28', 'https://www.courchevel.com/chalets', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(11, 'Pack Débutant Complet', 3, 'pack', 'Forfait 3 jours + location matériel moderne + 6h de cours avec moniteur diplômé.', '195.00', '-30%', '2024-12-01', '2025-03-15', 'https://www.valthorens.com/debutant', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(12, 'Forfait Early Bird', 4, 'forfait', 'Forfait 6 jours ski alpin. Réservation avant le 15 décembre pour économiser 20%.', '285.00', '-20%', '2025-01-05', '2025-01-31', 'https://www.tignes.net/earlybird', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(13, 'Location Matériel Haute Gamme', 5, 'matériel', 'Location skis carving professionnels + chaussures dernière génération pour 7 jours.', '89.00', '-35%', '2025-03-01', '2025-04-15', 'https://www.les2alpes.com/location', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(14, 'Cours Privé Expert', 6, 'cours', '3h de cours privé avec moniteur champion de France. Personnalisation totale.', '120.00', '-10%', '2024-12-01', '2025-04-01', 'https://www.la-plagne.com/cours', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(15, 'Pack Luxe Tout Compris', 1, 'pack', 'Hébergement 5* + forfait illimité + spa + demi-pension pour 2 personnes.', '950.00', '-12%', '2025-02-01', '2025-03-15', 'https://www.chamonix.com/luxe', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26'),
(16, 'Offre Dernière Minute', 2, 'forfait', 'Forfait 5 jours réservé moins de 7 jours avant arrivée. Sous réserve de disponibilité.', '220.00', '-40%', '2025-01-15', '2025-03-20', 'https://www.courchevel.com/lastminute', 1, '2026-01-28 14:06:26', '2026-01-28 14:06:26');

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `activite_id` int(11) NOT NULL,
  `date_reservation` datetime NOT NULL,
  `nb_personnes` int(11) DEFAULT '1',
  `notes` text,
  `statut` varchar(50) DEFAULT 'confirmée',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `membre_id`, `activite_id`, `date_reservation`, `nb_personnes`, `notes`, `statut`, `date_creation`) VALUES
(1, 21, 1, '2026-02-18 00:00:00', 1, NULL, 'confirmée', '2026-02-18 16:27:41');

-- --------------------------------------------------------

--
-- Structure de la table `stations_ski`
--

CREATE TABLE `stations_ski` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `region` varchar(50) NOT NULL,
  `description` text,
  `type_station` enum('petite','moyenne','grande','très grande') NOT NULL,
  `altitude_min` int(11) NOT NULL,
  `altitude_max` int(11) NOT NULL,
  `nb_pistes` int(11) NOT NULL,
  `km_pistes` decimal(5,1) NOT NULL,
  `nb_remontees` int(11) NOT NULL,
  `enneigement_actuel` int(11) DEFAULT '0',
  `prix_journee` decimal(5,2) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `site_web` varchar(255) DEFAULT NULL,
  `ouverture` date NOT NULL,
  `fermeture` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `stations_ski`
--

INSERT INTO `stations_ski` (`id`, `nom`, `region`, `description`, `type_station`, `altitude_min`, `altitude_max`, `nb_pistes`, `km_pistes`, `nb_remontees`, `enneigement_actuel`, `prix_journee`, `photo_url`, `site_web`, `ouverture`, `fermeture`, `created_at`, `updated_at`) VALUES
(1, 'Chamonix-Mont-Blanc', 'Alpes du Nord', 'Capitale mondiale du ski et de l\'alpinisme au pied du Mont-Blanc', 'grande', 1035, 3842, 150, '170.0', 49, 145, '62.50', 'https://www.ski-republic.com/sites/default/files/inline-images/val%20thorens_1.jpg', 'ski-republic.com', '2024-12-14', '2025-04-20', '2026-01-28 13:48:19', '2026-01-28 13:49:52'),
(2, 'Courchevel', 'Alpes du Nord', 'Station prestigieuse des 3 Vallées', 'très grande', 1300, 3230, 150, '150.0', 60, 120, '68.00', 'https://www.ski-republic.com/sites/default/files/inline-images/Tignes_0.jpg', 'ski-republic.com', '2024-12-07', '2025-04-13', '2026-01-28 13:48:19', '2026-01-28 13:50:27'),
(3, 'Val Thorens', 'Alpes du Nord', 'Plus haute station d\'Europe', 'très grande', 2300, 3230, 150, '140.0', 29, 180, '59.50', 'https://www.mmv.fr/images/cms/stations-ski-les-plus-connues/courchevel.jpg?frz-v=628', 'www.mmv.fr', '2024-11-16', '2025-05-04', '2026-01-28 13:48:19', '2026-01-28 13:52:34'),
(4, 'Tignes', 'Alpes du Nord', 'Station avec glacier accessible toute l\'année', 'très grande', 1550, 3456, 150, '300.0', 78, 155, '64.00', 'https://www.mmv.fr/images/cms/stations-ski-les-plus-connues/zermatt.jpg?frz-v=628', 'mmv.fr', '2024-11-23', '2025-05-04', '2026-01-28 13:48:19', '2026-01-28 13:53:50'),
(5, 'Les 2 Alpes', 'Alpes du Nord', 'Deuxième plus grand domaine skiable de France', 'grande', 1300, 3600, 96, '220.0', 44, 130, '53.00', 'https://petit-montagnard.fr/wp-content/uploads/2024/02/Top-5-stations-ski-Suisse-Verbier.jpeg', 'petit-montagnard.fr', '2024-11-30', '2025-04-20', '2026-01-28 13:48:19', '2026-01-28 13:55:36'),
(6, 'La Plagne', 'Alpes du Nord', 'Station familiale avec vaste domaine', 'très grande', 1250, 3250, 225, '225.0', 110, 95, '56.00', 'https://www.mmv.fr/images/cms/stations-ski-les-plus-connues/zermatt.jpg?frz-v=628', 'mmv.fr', '2024-12-14', '2025-04-20', '2026-01-28 13:48:19', '2026-01-28 13:54:41');

-- --------------------------------------------------------

--
-- Structure de la table `temoignages_ski`
--

CREATE TABLE `temoignages_ski` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `type_ski` enum('alpin','fond','rando','freeride','freestyle','autre') DEFAULT 'alpin',
  `station_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `note` int(11) DEFAULT '5',
  `approuve` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `temoignages_ski`
--

INSERT INTO `temoignages_ski` (`id`, `nom`, `email`, `type_ski`, `station_id`, `message`, `note`, `approuve`, `created_at`, `updated_at`) VALUES
(1, 'Test', 'test@gmail.cim', 'rando', NULL, 'tesr', 4, 1, '2026-01-28 14:02:11', '2026-01-28 14:02:11');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`, `created_at`, `email`) VALUES
(4, 'Sophie', '$2b$10$...', '2026-01-26 09:10:56', 'sophie@aventure-alpine.com'),
(8, 'paul65', '$2b$10$VtwirTzPx0hMtfxGvcCvbu5aur0FDkQaC2Z0RWudnn3C2Yuqmxg6i', '2026-02-04 12:02:38', 'paul3@gmail.com'),
(9, 'TEST', '$2b$10$zaNmwsSKKsGykzkGNGFCcubsvg0qeql34gGJ.CQItpJtrvCpxOG8y', '2026-02-04 15:59:14', 'TEST@GMAIL.COM'),
(10, 'test23', '$2b$10$V445kCGU73FLcJ69WdVipOFm4tWhyZwM4x5YkEwZI3YME9VcsiR3q', '2026-02-04 16:22:37', 'test2@gmail.com'),
(11, 'Paul8', '$2b$10$PborY5fZpHVDQUFRgUVqRunpnWbkCFzPKtJdwN1.VIM3lg/MHgqRW', '2026-02-05 08:20:47', 'paul8@gmail.com'),
(12, 'po', '$2b$10$Pzw2DMUASsF5zqUcWSSiq.sZuDLjON04fSEQ6Qe0dCcfxHAKQHV1C', '2026-02-05 08:23:18', '1@g.fr'),
(13, 'fff', '$2b$10$0rbSYbSd/gVJ1zZg3Bax3ewNrNzTSPmG6mDy1nXYtwXHiqnDtnuMq', '2026-02-05 08:25:11', 'a.toto@gouv.fr'),
(14, 'Paul_', '$2b$10$PQc7U1D1ZbrQvLe9LrpnG.zfBourHK/zIGbx6nCXveQq1oMps63qi', '2026-02-05 09:02:44', 'paik@gmail.com'),
(15, 'PAULLLL', '$2b$10$5NJjileLDT3VfltL8qEn1OfgJaClO5WyvlsyUvE9O.W8IFXNvfocK', '2026-02-05 09:30:15', 'PPZZ@gmail.com'),
(16, 'Paul9999', '$2b$10$sfo2timtCJiETX8Tg6a93OfREmhrGroiVanZp32YoaM3KQrZXjyNi', '2026-02-05 09:34:26', 'oz@gmail.com'),
(17, 'PAUL', '$2b$10$M8LUn4oReAYxobnGeW01eecklfbRZIe5ikUyNYdx2Vfi4tZ60uy02', '2026-02-11 09:47:47', 'paul99@gmail.com'),
(18, 'frjuizp', '$2b$10$9zhd1CTEUO9uTst/9IkJVek7sSZsxYGMaLcIzyG4uSY43/FWhc.O6', '2026-02-11 11:01:36', 'ioppsdj@gmail.com'),
(19, 'AZERTY', '$2b$10$QaefnvEBeBLTvKiCWZMiBuRW3l9Q0vP3fMQJGCDefYvQkL3mtS2PS', '2026-02-11 11:15:12', 'AZERTY@GMAIL.COM'),
(20, 'JKLHGF', '$2b$10$iKk7.tZ0G4vq0gDKmizHOuAdI41X.92OhEstBCzUeXO4NxK87.kHG', '2026-02-11 11:19:58', 'HJJ@gmail.coom'),
(21, 'PAPO', '$2b$10$y47/7zzu.RY8mV3..i826ugCVEFkkSWBz5GL4Si4tZ7RkqJwNYT2G', '2026-02-18 16:25:14', 'PAPO@GMAIL.COM');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `activites`
--
ALTER TABLE `activites`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auteur_id` (`auteur_id`);

--
-- Index pour la table `contact_messages`
--
ALTER TABLE `contact_messages`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `galerie_randonnee`
--
ALTER TABLE `galerie_randonnee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`);

--
-- Index pour la table `itineraires`
--
ALTER TABLE `itineraires`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_station` (`station_id`),
  ADD KEY `idx_dates` (`date_debut`,`date_fin`);

--
-- Index pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membre_id` (`membre_id`),
  ADD KEY `activite_id` (`activite_id`);

--
-- Index pour la table `stations_ski`
--
ALTER TABLE `stations_ski`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_region` (`region`),
  ADD KEY `idx_type` (`type_station`);

--
-- Index pour la table `temoignages_ski`
--
ALTER TABLE `temoignages_ski`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_station` (`station_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `activites`
--
ALTER TABLE `activites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `contact_messages`
--
ALTER TABLE `contact_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `galerie_randonnee`
--
ALTER TABLE `galerie_randonnee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `itineraires`
--
ALTER TABLE `itineraires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT pour la table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `stations_ski`
--
ALTER TABLE `stations_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `temoignages_ski`
--
ALTER TABLE `temoignages_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `galerie_randonnee`
--
ALTER TABLE `galerie_randonnee`
  ADD CONSTRAINT `galerie_randonnee_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  ADD CONSTRAINT `offres_ski_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations_ski` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `temoignages_ski`
--
ALTER TABLE `temoignages_ski`
  ADD CONSTRAINT `temoignages_ski_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations_ski` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
