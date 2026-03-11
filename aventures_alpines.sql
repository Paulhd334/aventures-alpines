-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : lun. 26 jan. 2026 à 14:46
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
  `capacite` int(11) DEFAULT '30',
  `image` varchar(255) DEFAULT NULL,
  `difficulte` varchar(50) DEFAULT NULL,
  `niveau` enum('facile','moyen','difficile') DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `activites`
--

INSERT INTO `activites` (`id`, `nom`, `description`, `capacite`, `image`, `difficulte`, `niveau`, `type`) VALUES
(51, 'Ski Alpin', 'Descente sur pistes enneigées.', 15, 'https://pierrelonchampt.com/wp-content/uploads/2025/11/PL250916-0299-ecrins.jpg', 'moyen', NULL, 'ski'),
(52, 'Snowboard', 'Descente freeride sur neige fraîche.', 12, 'https://pierrelonchampt.com/wp-content/uploads/2025/11/PL241220-1433-belledonne-768x512.jpg', 'moyen', NULL, 'ski'),
(53, 'Randonnée', 'Balade guidée dans les sentiers de montagne.', 20, 'https://pierrelonchampt.com/wp-content/uploads/2024/11/PL240910-0887-taillante-queyras.jpg', 'facile', NULL, 'randonnee'),
(54, 'Escalade', 'Parois rocheuses pour grimpeurs.', 8, 'https://pierrelonchampt.com/wp-content/uploads/2025/11/PL250915-0282-arves-768x1151.jpg', 'difficile', NULL, 'escalade'),
(55, 'Raquettes', 'Randonnée en raquettes à neige.', 18, 'https://pierrelonchampt.com/wp-content/uploads/2022/08/PL220814-00071-aiguilles-arves-coucher-soleil-768x512.jpg', 'facile', NULL, 'randonnee'),
(56, 'Parapente', 'Vol panoramique au‑dessus des sommets.', 6, 'https://pierrelonchampt.com/wp-content/uploads/2018/07/photo-lever-du-jour-sur-le-lac-guichard-et-les-aiguilles-darves.jpg', 'difficile', NULL, 'autre');

-- --------------------------------------------------------

--
-- Structure de la table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `auteur_id` int(11) NOT NULL,
  `lieu` varchar(255) DEFAULT '',
  `type` varchar(50) DEFAULT 'récit',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `articles`
--

INSERT INTO `articles` (`id`, `titre`, `contenu`, `auteur_id`, `lieu`, `type`, `created_at`) VALUES
(1, 'test', 'test parfait ou pas', 1, 'test ok ou non ?', 'récit', '2026-01-22 10:39:36');

-- --------------------------------------------------------

--
-- Structure de la table `commentaires`
--

CREATE TABLE `commentaires` (
  `id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `contenu` text NOT NULL,
  `date_post` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `contact`
--

CREATE TABLE `contact` (
  `id` int(11) NOT NULL,
  `nom_complet` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `sujet` varchar(100) NOT NULL,
  `message` text NOT NULL,
  `date_envoi` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `contact`
--

INSERT INTO `contact` (`id`, `nom_complet`, `email`, `sujet`, `message`, `date_envoi`) VALUES
(1, 'test', 'test@gmail.com', 'guide', 'TEST\ntest \ntg', '2026-01-22 13:44:08');

-- --------------------------------------------------------

--
-- Structure de la table `galerie_randonnee`
--

CREATE TABLE `galerie_randonnee` (
  `id` int(11) NOT NULL,
  `utilisateur_id` int(11) NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `localisation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `altitude` decimal(8,2) DEFAULT NULL,
  `difficulte` enum('facile','moyen','difficile','expert') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `saison` enum('printemps','été','automne','hiver') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_prise` date DEFAULT NULL,
  `date_publication` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `likes` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `galerie_randonnee`
--

INSERT INTO `galerie_randonnee` (`id`, `utilisateur_id`, `titre`, `description`, `image_url`, `localisation`, `altitude`, `difficulte`, `saison`, `date_prise`, `date_publication`, `likes`) VALUES
(11, 1, 'Sommet du Mont Blanc', 'Vue imprenable depuis le toit de l\'Europe', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Chamonix, France', '4808.73', 'expert', 'été', '2024-07-15', '2026-01-26 14:15:53', 42),
(12, 2, 'Lac d\'Annecy', 'Randonnée autour du lac le plus pur d\'Europe', 'https://images.unsplash.com/photo-1564507004663-b6dfb3e2ede5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Annecy, France', '446.97', 'facile', 'printemps', '2024-05-20', '2026-01-26 14:15:53', 28),
(13, 3, 'Aiguille du Midi', 'Téléphérique et vue à couper le souffle', 'https://images.unsplash.com/photo-1508169351866-777fc0047ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Chamonix, France', '3842.00', 'difficile', 'hiver', '2024-02-10', '2026-01-26 14:15:53', 35),
(14, 4, 'Vanoise en hiver', 'Randonnée en raquettes dans le parc national', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Vanoise, France', '2500.00', 'moyen', 'hiver', '2024-01-25', '2026-01-26 14:15:53', 19),
(15, 1, 'Gorges du Verdon', 'Les plus belles gorges d\'Europe', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Verdon, France', '700.00', 'moyen', 'été', '2024-08-05', '2026-01-26 14:15:53', 31),
(16, 2, 'Circuit des lacs', 'Tour des 5 lacs d\'altitude', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Vanoise, France', '2300.00', 'moyen', 'été', '2024-07-30', '2026-01-26 14:15:53', 24),
(17, 3, 'Refuge du Plan de l\'Aiguille', 'Bivouac avec vue sur les Drus', 'https://images.unsplash.com/photo-1536152471326-642d7465f66b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Chamonix, France', '2207.00', 'facile', 'automne', '2024-09-15', '2026-01-26 14:15:53', 17),
(18, 4, 'Traversée de la Meije', 'Grande classique des Alpes', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'La Grave, France', '3983.00', 'expert', 'été', '2024-07-22', '2026-01-26 14:15:53', 39),
(19, 1, 'Col du Galibier', 'Passage mythique du Tour de France', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Hautes-Alpes, France', '2642.00', 'difficile', 'été', '2024-08-12', '2026-01-26 14:15:53', 22),
(20, 2, 'Balcon du Léman', 'Vue sur le lac Léman depuis les hauteurs', 'https://images.unsplash.com/photo-1512273222628-4daea6e55abb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Évian-les-Bains, France', '1200.00', 'facile', 'printemps', '2024-04-18', '2026-01-26 14:15:53', 15),
(21, 3, 'Massif des Écrins', 'Randonnée glaciaire', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Écrins, France', '4102.00', 'expert', 'été', '2024-08-20', '2026-01-26 14:15:53', 47),
(22, 4, 'Forêt de Fontainebleau', 'Escalade en bloc', 'https://images.unsplash.com/photo-1508169351866-777fc0047ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Fontainebleau, France', '150.00', 'moyen', 'automne', '2024-10-05', '2026-01-26 14:15:53', 12);

-- --------------------------------------------------------

--
-- Structure de la table `inscriptions`
--

CREATE TABLE `inscriptions` (
  `id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `activite_id` int(11) NOT NULL,
  `date_inscription` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `itineraires`
--

CREATE TABLE `itineraires` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `difficulte` enum('facile','moyen','difficile','expert') COLLATE utf8mb4_unicode_ci NOT NULL,
  `duree` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `distance` decimal(6,2) NOT NULL,
  `denivele_positif` int(11) NOT NULL,
  `denivele_negatif` int(11) NOT NULL,
  `point_depart` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `point_arrivee` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saison_recommandee` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `equipement` text COLLATE utf8mb4_unicode_ci,
  `points_interet` text COLLATE utf8mb4_unicode_ci,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `itineraires`
--

INSERT INTO `itineraires` (`id`, `nom`, `description`, `difficulte`, `duree`, `distance`, `denivele_positif`, `denivele_negatif`, `point_depart`, `point_arrivee`, `region`, `saison_recommandee`, `equipement`, `points_interet`, `photo_url`, `created_at`) VALUES
(1, 'Tour du Mont Blanc', 'L\'un des plus beaux treks d\'Europe qui fait le tour du massif du Mont Blanc', 'difficile', '7-10 jours', '170.00', 10000, 10000, 'Les Houches', 'Les Houches', 'Alpes', 'Juillet à Septembre', 'Sac de randonnée 50L, bâtons, chaussures de trek, vêtements techniques', 'Refuge du Lac Blanc, Col de la Seigne, Courmayeur', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(2, 'GR20 Corse', 'Le sentier de grande randonnée le plus difficile d\'Europe', 'expert', '15 jours', '180.00', 12000, 12000, 'Calenzana', 'Conca', 'Corse', 'Juin à Septembre', 'Sac ultra-léger, équipement bivouac, chaussures de trail', 'Lacs de montagne, Cirque de la Solitude, villages corses', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(3, 'Lac d\'Annecy - Tour du lac', 'Randonnée facile autour du célèbre lac d\'Annecy', 'facile', '3-4 jours', '42.00', 800, 800, 'Annecy', 'Annecy', 'Alpes', 'Avril à Octobre', 'Sac 30L, chaussures de randonnée, appareil photo', 'Châteaux, plages, villages médiévaux', 'https://images.unsplash.com/photo-1564507004663-b6dfb3e2ede5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(4, 'Traversée des Écrins', 'Itinéraire mythique à travers le parc national des Écrins', 'difficile', '8 jours', '110.00', 7500, 7500, 'La Chapelle-en-Valgaudemar', 'La Grave', 'Alpes', 'Juillet à Août', 'Crampons légers, piolet, équipement d\'alpinisme', 'Glacier Blanc, Barre des Écrins, lacs d\'altitude', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(5, 'Chemin de Stevenson', 'Sur les traces de l\'écrivain dans les Cévennes', 'moyen', '12 jours', '272.00', 5000, 5000, 'Le Puy-en-Velay', 'Alès', 'Massif Central', 'Mai à Octobre', 'Sac 40L, bâtons, vêtements de pluie', 'Villages médiévaux, paysages volcaniques, forêts', 'https://images.unsplash.com/photo-1508169351866-777fc0047ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(6, 'Sentier du littoral Basque', 'Entre mer et montagne sur la côte basque', 'moyen', '7 jours', '80.00', 4500, 4500, 'Hendaye', 'Biarritz', 'Pyrénées', 'Mars à Novembre', 'Chaussures de marche, maillot de bain, crème solaire', 'Falaises, plages, villages basques, surf spots', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(7, 'Balcon du Léman', 'Randonnée avec vue sur le lac Léman', 'facile', '2 jours', '25.00', 600, 600, 'Thonon-les-Bains', 'Évian-les-Bains', 'Alpes', 'Avril à Octobre', 'Sac jour, pique-nique, jumelles', 'Vignobles, villages lacustres, panorama lac', 'https://images.unsplash.com/photo-1512273222628-4daea6e55abb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(8, 'Haute Route Pyrénéenne', 'Traversée des Pyrénées d\'est en ouest', 'expert', '45 jours', '800.00', 45000, 45000, 'Banyuls-sur-Mer', 'Hendaye', 'Pyrénées', 'Juillet à Septembre', 'Équipement complet haute montagne, matériel de camping', 'Lacs, cols, refuges, sommets de 3000m', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(9, 'Circuit des 5 lacs', 'Randonnée familiale autour de lacs d\'altitude', 'facile', '1 jour', '12.00', 300, 300, 'Station de ski', 'Station de ski', 'Alpes', 'Juin à Septembre', 'Sac à dos léger, pique-nique, eau', '5 lacs de montagne, marmottes, flore alpine', 'https://images.unsplash.com/photo-1536152471326-642d7465f66b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54'),
(10, 'Ascension du Vignemale', 'Plus haut sommet des Pyrénées françaises', 'expert', '2 jours', '18.00', 1800, 1800, 'Gavarnie', 'Gavarnie', 'Pyrénées', 'Juillet à Août', 'Crampons, piolet, casque, baudrier', 'Glacier d\'Ossoue, refuge Bayssellance, vue panoramique', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', '2026-01-26 14:21:54');

-- --------------------------------------------------------

--
-- Structure de la table `membres`
--

CREATE TABLE `membres` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `date_adhesion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `offres_ski`
--

CREATE TABLE `offres_ski` (
  `id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `titre` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type_offre` enum('forfait','hebergement','cours','pack') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prix` decimal(8,2) NOT NULL,
  `reduction` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `lien_resa` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `offres_ski`
--

INSERT INTO `offres_ski` (`id`, `station_id`, `titre`, `description`, `type_offre`, `prix`, `reduction`, `date_debut`, `date_fin`, `lien_resa`, `actif`, `created_at`) VALUES
(1, 1, 'Forfait 6 jours Early Bird', 'Réservez avant le 15 décembre et économisez 20% sur votre forfait 6 jours', 'forfait', '280.00', '-20%', '2024-12-01', '2024-12-15', 'https://www.chamonix.com/offre-early', 1, '2026-01-26 14:36:58'),
(2, 2, 'Pack Famille 4 personnes', 'Forfaits + hébergement en appartement 4* pour une semaine', 'pack', '1899.00', '-15%', '2025-01-05', '2025-03-15', 'https://www.courchevel.com/pack-famille', 1, '2026-01-26 14:36:58'),
(3, 3, 'Cours particuliers débutants', '5 sessions de 2h avec moniteur ESF pour débuter en confiance', 'cours', '450.00', 'Premier cours offert', '2024-12-14', '2025-01-31', 'https://www.avoriaz.com/cours-debutants', 1, '2026-01-26 14:36:58'),
(4, 5, 'Week-end Freeride', '2 jours avec guide + matériel sécurité inclus', 'pack', '350.00', '-25%', '2025-01-10', '2025-04-20', 'https://www.valdisere.com/freeride', 1, '2026-01-26 14:36:58');

-- --------------------------------------------------------

--
-- Structure de la table `photos`
--

CREATE TABLE `photos` (
  `id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `chemin` varchar(255) NOT NULL,
  `nom_fichier_original` varchar(255) DEFAULT NULL,
  `date_upload` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

CREATE TABLE `reservations` (
  `id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `activite_id` int(11) NOT NULL,
  `date_reservation` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `resultats`
--

CREATE TABLE `resultats` (
  `id` int(11) NOT NULL,
  `membre_id` int(11) NOT NULL,
  `activite_id` int(11) NOT NULL,
  `date_evenement` date NOT NULL,
  `performance` varchar(100) NOT NULL,
  `commentaire` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Structure de la table `stations_ski`
--

CREATE TABLE `stations_ski` (
  `id` int(11) NOT NULL,
  `nom` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altitude_min` int(11) NOT NULL,
  `altitude_max` int(11) NOT NULL,
  `nb_pistes` int(11) NOT NULL,
  `nb_remontees` int(11) NOT NULL,
  `km_pistes` decimal(6,2) NOT NULL,
  `type_station` enum('petite','moyenne','grande','très grande') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prix_journee` decimal(6,2) DEFAULT NULL,
  `ouverture` date DEFAULT NULL,
  `fermeture` date DEFAULT NULL,
  `photo_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enneigement_actuel` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `stations_ski`
--

INSERT INTO `stations_ski` (`id`, `nom`, `description`, `region`, `altitude_min`, `altitude_max`, `nb_pistes`, `nb_remontees`, `km_pistes`, `type_station`, `prix_journee`, `ouverture`, `fermeture`, `photo_url`, `site_web`, `enneigement_actuel`, `created_at`) VALUES
(1, 'Chamonix Mont-Blanc', 'Station mythique au pied du Mont-Blanc, paradis du ski alpin et du freeride', 'Alpes du Nord', 1035, 3842, 150, 49, '155.00', 'très grande', '62.50', '2024-12-14', '2025-04-27', 'https://images.unsplash.com/photo-1508169351866-777fc0047ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.chamonix.com', 120, '2026-01-26 14:36:58'),
(2, 'Courchevel', 'Partie des Trois Vallées, domaine skiable immense et luxueux', 'Savoie', 1100, 2738, 150, 58, '150.00', 'très grande', '65.00', '2024-12-07', '2025-04-20', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.courchevel.com', 110, '2026-01-26 14:36:58'),
(3, 'Avoriaz', 'Station piétonne intégrée au domaine des Portes du Soleil', 'Haute-Savoie', 1100, 2466, 49, 37, '75.00', 'grande', '58.00', '2024-12-14', '2025-04-13', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.avoriaz.com', 90, '2026-01-26 14:36:58'),
(4, 'Les Arcs', 'Station moderne avec vaste domaine skiable pour tous niveaux', 'Savoie', 1200, 3226, 106, 54, '200.00', 'très grande', '56.50', '2024-12-14', '2025-04-27', 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.lesarcs.com', 100, '2026-01-26 14:36:58'),
(5, 'Val d\'Isère', 'Légendaire station reliée à Tignes, terrain de jeu exceptionnel', 'Savoie', 1550, 3456, 150, 78, '300.00', 'très grande', '67.00', '2024-11-30', '2025-05-04', 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.valdisere.com', 130, '2026-01-26 14:36:58'),
(6, 'Font-Romeu', 'Station ensoleillée des Pyrénées, idéale ski de fond et alpin', 'Pyrénées', 1550, 2212, 29, 16, '58.00', 'moyenne', '45.00', '2024-12-21', '2025-03-30', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.font-romeu.fr', 60, '2026-01-26 14:36:58'),
(7, 'Le Grand-Bornand', 'Station authentique avec domaine skiable varié', 'Haute-Savoie', 1000, 2100, 84, 42, '90.00', 'grande', '48.50', '2024-12-14', '2025-04-06', 'https://images.unsplash.com/photo-1512273222628-4daea6e55abb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://www.legrandbornand.com', 85, '2026-01-26 14:36:58');

-- --------------------------------------------------------

--
-- Structure de la table `temoignages_ski`
--

CREATE TABLE `temoignages_ski` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type_ski` enum('alpin','fond','rando','freeride','freestyle') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `station_id` int(11) DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `note` int(11) DEFAULT NULL,
  `approuve` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `temoignages_ski`
--

INSERT INTO `temoignages_ski` (`id`, `nom`, `email`, `type_ski`, `station_id`, `message`, `note`, `approuve`, `created_at`) VALUES
(1, 'Thomas L.', 'thomas@email.com', 'freeride', 1, 'Incroyable ! Les couloirs du Mont-Blanc sont exceptionnels. Guide indispensable pour la sécurité.', 5, 1, '2026-01-26 14:36:58'),
(2, 'Marie D.', 'marie@email.com', 'alpin', 2, 'Domaine immense, pistes parfaitement damées. Service impeccable dans les restaurants d\'altitude.', 4, 1, '2026-01-26 14:36:58'),
(3, 'Jean P.', 'jean@email.com', 'fond', 6, 'Magnifiques pistes de ski de fond à travers la forêt. Cadre féerique après la neige.', 5, 1, '2026-01-26 14:36:58'),
(4, 'Sophie M.', 'sophie@email.com', 'rando', 5, 'Ski de randonnée inoubliable. Montée tôt le matin pour profiter de la neige vierge.', 5, 1, '2026-01-26 14:36:58'),
(5, 'Luc R.', 'luc@email.com', 'freestyle', 4, 'Snowpark bien aménagé avec modules pour tous niveaux. Ambiance sympa.', 4, 1, '2026-01-26 14:36:58');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `created_at`) VALUES
(1, 'Test', 'test@gmail.com', '$2b$10$S7i.JR8Htz2Icy5N9PICQ.AysAR.VaPafHJseNIQ1IKN.XqWcbwfe', 'user', '2026-01-22 11:37:44'),
(2, 'alpiniste123', 'jean.dupont@email.com', '$2b$10$abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'user', '2026-01-26 15:15:06'),
(3, 'randonneur56', 'marie.martin@email.com', '$2b$10$zyxwvutsrqponmlkjihgfedcba9876543210ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'user', '2026-01-26 15:15:06'),
(4, 'aventurier42', 'pierre.durand@email.com', '$2b$10$1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 'user', '2026-01-26 15:15:06'),
(5, 'grimpeuse88', 'sophie.leroy@email.com', '$2b$10$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'user', '2026-01-26 15:15:06');

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
-- Index pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membre_id` (`membre_id`);

--
-- Index pour la table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `galerie_randonnee`
--
ALTER TABLE `galerie_randonnee`
  ADD PRIMARY KEY (`id`),
  ADD KEY `utilisateur_id` (`utilisateur_id`),
  ADD KEY `idx_difficulte` (`difficulte`),
  ADD KEY `idx_saison` (`saison`),
  ADD KEY `idx_date_publication` (`date_publication`);

--
-- Index pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membre_id` (`membre_id`),
  ADD KEY `activite_id` (`activite_id`);

--
-- Index pour la table `itineraires`
--
ALTER TABLE `itineraires`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `membres`
--
ALTER TABLE `membres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `user_id` (`user_id`);

--
-- Index pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  ADD PRIMARY KEY (`id`),
  ADD KEY `station_id` (`station_id`);

--
-- Index pour la table `photos`
--
ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membre_id` (`membre_id`);

--
-- Index pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membre_id` (`membre_id`),
  ADD KEY `activite_id` (`activite_id`);

--
-- Index pour la table `resultats`
--
ALTER TABLE `resultats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `membre_id` (`membre_id`),
  ADD KEY `activite_id` (`activite_id`);

--
-- Index pour la table `stations_ski`
--
ALTER TABLE `stations_ski`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `temoignages_ski`
--
ALTER TABLE `temoignages_ski`
  ADD PRIMARY KEY (`id`),
  ADD KEY `station_id` (`station_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT pour la table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `commentaires`
--
ALTER TABLE `commentaires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `contact`
--
ALTER TABLE `contact`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `galerie_randonnee`
--
ALTER TABLE `galerie_randonnee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `itineraires`
--
ALTER TABLE `itineraires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `membres`
--
ALTER TABLE `membres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `resultats`
--
ALTER TABLE `resultats`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stations_ski`
--
ALTER TABLE `stations_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `temoignages_ski`
--
ALTER TABLE `temoignages_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `articles`
--
ALTER TABLE `articles`
  ADD CONSTRAINT `articles_ibfk_1` FOREIGN KEY (`auteur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `commentaires`
--
ALTER TABLE `commentaires`
  ADD CONSTRAINT `commentaires_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `galerie_randonnee`
--
ALTER TABLE `galerie_randonnee`
  ADD CONSTRAINT `galerie_randonnee_ibfk_1` FOREIGN KEY (`utilisateur_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  ADD CONSTRAINT `inscriptions_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inscriptions_ibfk_2` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `membres`
--
ALTER TABLE `membres`
  ADD CONSTRAINT `membres_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  ADD CONSTRAINT `offres_ski_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations_ski` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `photos`
--
ALTER TABLE `photos`
  ADD CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `resultats`
--
ALTER TABLE `resultats`
  ADD CONSTRAINT `resultats_ibfk_1` FOREIGN KEY (`membre_id`) REFERENCES `membres` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `resultats_ibfk_2` FOREIGN KEY (`activite_id`) REFERENCES `activites` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `temoignages_ski`
--
ALTER TABLE `temoignages_ski`
  ADD CONSTRAINT `temoignages_ski_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations_ski` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
