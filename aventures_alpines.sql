-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:3306
-- Généré le : ven. 13 mars 2026 à 21:34
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
  `image_url` varchar(500) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'récit',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `articles`
--

INSERT INTO `articles` (`id`, `titre`, `contenu`, `auteur_id`, `lieu`, `image_url`, `type`, `created_at`) VALUES
(12, 'Ascension du Mont Blanc', 'Une expérience incroyable pour gravir le plus haut sommet des Alpes. Partis du refuge des Cosmiques à 4h du matin, nous avons affronté les séracs du Mont-Blanc du Tacul avant d\'atteindre l\'arête des Bosses. Le sommet à 4809m offre un panorama à couper le souffle sur toutes les Alpes. Une aventure exigeante qui demande une excellente condition physique et une météo parfaite. Retour au refuge après 10h d\'effort, épuisés mais comblés.', 4, 'Mont Blanc', 'https://jeromeobiols.com/wordpress/wp-content/uploads/photo-montagne-vallee-blanche-chamonix-mont-blanc.jpg', 'récit', '2026-02-18 09:00:00'),
(13, 'Randonnée autour du Mont Blanc', 'Itinéraire panoramique traversant les vallées et glaciers autour du massif du Mont Blanc. Le Tour du Mont Blanc est l\'un des circuits les plus emblématiques d\'Europe, traversant la France, l\'Italie et la Suisse sur 170km. Chaque étape révèle des paysages différents : alpages fleuris, moraines glaciaires, villages savoyards authentiques. Un incontournable pour tout randonneur passionné.', 2, 'Mont Blanc', 'https://jeromeobiols.com/wordpress/wp-content/uploads/photo-montagne-vallee-blanche-chamonix-mont-blanc.jpg', 'guide', '2026-02-18 09:30:00'),
(14, 'Découverte des Alpes du Nord', 'Présentation des plus belles montagnes des Alpes du Nord et leurs itinéraires phares. Des Aravis au Vercors en passant par la Chartreuse et le Belledonne, les Alpes du Nord regorgent de trésors cachés. Cet article vous guide à travers les massifs incontournables, les refuges mythiques et les cols légendaires qui ont fait la renommée de cette région exceptionnelle.', 3, 'Alpes du Nord', 'https://jeromeobiols.com/wordpress/wp-content/uploads/07072019_JOB5622F-paysage-paradis-vanoise-1920.jpg', 'article', '2026-02-18 10:00:00'),
(15, 'Tour du Beaufortain', 'Randonnée dans le massif du Beaufortain, alpages et lacs d\'altitude au cœur de la Savoie. Ce massif méconnu offre des paysages d\'une beauté sauvage : vastes alpages où paissent les troupeaux, lacs de montagne aux eaux turquoise, et sommets offrant des panoramas grandioses sur le Mont Blanc et la Vanoise. Un circuit de 5 jours accessible aux randonneurs confirmés.', 2, 'Beaufortain', 'https://jeromeobiols.com/wordpress/wp-content/uploads/19072015_JOB1202_Dome-de-Chasseforet-Pelve-1920.jpg', 'guide', '2026-02-18 11:00:00');

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
(11, 1, 'Sommet du Mont Blanc', 'Vue imprenable depuis le toit de l\'Europe', 'https://www.oisans.com/app/uploads/iris-images/12857/randonnee-muzelle-04-1920x1080-f42_76.webp', 'Chamonix, France', '4808.73', 'expert', 'été', '2024-07-15', '2026-01-26 14:15:53', 42),
(12, 2, 'Lac d\'Annecy', 'Randonnée autour du lac le plus pur d\'Europe', 'https://media.istockphoto.com/id/1996377443/fr/photo/divers-amis-profitant-dune-randonn%C3%A9e-en-montagne-ensoleill%C3%A9e.jpg?s=612x612&w=0&k=20&c=WxYF2ZHQVwcsJA3gx3FAPCU1310BoR3X0gPTCjUUwIk=', 'Annecy, France', '446.97', 'facile', 'printemps', '2024-05-20', '2026-01-26 14:15:53', 28),
(13, 3, 'Aiguille du Midi', 'Téléphérique et vue à couper le souffle', 'https://media.istockphoto.com/id/2134108698/fr/photo/randonneuse-trekking-sur-un-sentier-de-randonn%C3%A9e-dans-la-vall%C3%A9e-de-claree-en-automne-dans-les.jpg?s=612x612&w=0&k=20&c=P9mDKLO7K641HWSD5M4yZUiQiXknJ-oOAY2nD7gQk6k=', 'Chamonix, France', '3842.00', 'difficile', 'hiver', '2024-02-10', '2026-01-26 14:15:53', 35),
(14, 4, 'Vanoise en hiver', 'Randonnée en raquettes dans le parc national', 'https://media.istockphoto.com/id/2024393466/fr/photo/homme-avec-sac-%C3%A0-dos-se-prom%C3%A8ne-dans-les-montagnes-au-coucher-du-soleil.jpg?s=612x612&w=0&k=20&c=pfPUlPRjFq-7ZyBWjkGPYbW0OILh70efU0DCJDXiits=', 'Vanoise, France', '2500.00', 'moyen', 'hiver', '2024-01-25', '2026-01-26 14:15:53', 19),
(15, 1, 'Gorges du Verdon', 'Les plus belles gorges d\'Europe', 'https://media.istockphoto.com/id/1141196125/fr/photo/randonn%C3%A9es-dans-les-alpes-dallgaeu.jpg?s=612x612&w=0&k=20&c=IEQSH9u6_Cdf4UnF_F2E8IzHMf1cAXyzktcuyq_q1XE=', 'Verdon, France', '700.00', 'moyen', 'été', '2024-08-05', '2026-01-26 14:15:53', 31),
(16, 2, 'Circuit des lacs', 'Tour des 5 lacs d\'altitude', 'https://media.istockphoto.com/id/1443409611/fr/photo/homme-sur-pierre-sur-la-colline-et-belles-montagnes-dans-la-brume-au-coucher-de-soleil-color%C3%A9.jpg?s=612x612&w=0&k=20&c=NwI1dzGvGJwrl6m7FxyEg7voauHZAJgmSY94he-CO6c=', 'Vanoise, France', '2300.00', 'moyen', 'été', '2024-07-30', '2026-01-26 14:15:53', 24),
(17, 3, 'Refuge du Plan de l\'Aiguille', 'Bivouac avec vue sur les Drus', 'https://media.istockphoto.com/id/1949006055/fr/photo/groupe-de-randonneurs-actifs-qui-montent-en-montagne.jpg?s=612x612&w=0&k=20&c=HvPWjcKGdc96yzptRb1SWqsx-1Xl5jUgcMlSfDo-yAI=', 'Chamonix, France', '2207.00', 'facile', 'automne', '2024-09-15', '2026-01-26 14:15:53', 17),
(18, 4, 'Traversée de la Meije', 'Grande classique des Alpes', 'https://media.istockphoto.com/id/1417307686/fr/photo/p%C3%A8re-et-adolescents-randonn%C3%A9e-dans-les-hautes-montagnes-dautriche.jpg?s=612x612&w=0&k=20&c=xdVu9uJGCPAAIBOgI-VnHQdSleQdgJR3BRnYQZFWSPs=', 'La Grave, France', '3983.00', 'expert', 'été', '2024-07-22', '2026-01-26 14:15:53', 39),
(19, 1, 'Col du Galibier', 'Passage mythique du Tour de France', 'https://media.istockphoto.com/id/1457945028/fr/vid%C3%A9o/femme-randonnant-dans-les-montagnes-norv%C3%A9giennes.avif?s=640x640&k=20&c=PGyt7gSOi5ibluhHXmcAA_ckuFRKcaBVwhW_NYncHjM=', 'Hautes-Alpes, France', '2642.00', 'difficile', 'été', '2024-08-12', '2026-01-26 14:15:53', 22);

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
(1, 'Tour du Mont Blanc', 'L\'un des plus beaux treks d\'Europe faisant le tour complet du massif du Mont Blanc à travers la France, l\'Italie et la Suisse. Refuges mythiques, glaciers imposants et villages alpins authentiques jalonnent ce parcours inoubliable.', 'difficile', '7-10 jours', '170.00', 10000, 10000, 'Les Houches', 'Les Houches', 'Alpes', 'Juillet à Septembre', 'Sac 50L, bâtons, chaussures imperméables, couches thermiques, gants', 'Refuge du Lac Blanc, Col de la Seigne, Courmayeur, Champex-Lac', 'https://images.pexels.com/photos/1054218/pexels-photo-1054218.jpeg?auto=compress&cs=tinysrgb&w=1200', '2026-03-13 21:33:24'),
(2, 'GR20 — Traversée de la Corse', 'Le sentier le plus sauvage de France. Deux semaines de trek entre lacs glaciaires, crêtes vertigineuses et maquis embaumé. Une aventure hors du commun réservée aux randonneurs aguerris.', 'expert', '15 jours', '180.00', 12000, 12000, 'Calenzana', 'Conca', 'Corse', 'Juin à Septembre', 'Sac ultra-léger, équipement bivouac, chaussures techniques, bâtons', 'Lac de Capitello, Monte Cinto, Cirque de la Solitude, Vizzavona', 'https://images.pexels.com/photos/4215110/pexels-photo-4215110.jpeg?auto=compress&cs=tinysrgb&w=1200', '2026-03-13 21:33:24'),
(3, 'Traversée des Écrins', 'Itinéraire mythique à travers le parc national des Écrins entre glaciers suspendus, lacs cobalt et sommets de 4000m. Une traversée alpine exigeante au cœur de la haute montagne française.', 'difficile', '8 jours', '110.00', 7500, 7500, 'La Chapelle-en-Valgaudemar', 'La Grave', 'Alpes', 'Juillet à Août', 'Crampons légers, piolet, sac 55L, carte IGN, équipement alpinisme', 'Glacier Blanc, Barre des Écrins 4102m, Lac du Pavé, Refuge Glacier Blanc', 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1200', '2026-03-13 21:33:24'),
(4, 'Sentier du Littoral Basque', 'Entre mer et montagne sur la côte basque sauvage. Falaises déchiquetées, plages de surf légendaires et villages aux maisons à colombages rouges pour un trek côtier unique en Europe.', 'moyen', '7 jours', '80.00', 4500, 4500, 'Hendaye', 'Biarritz', 'Pyrénées', 'Mars à Novembre', 'Chaussures imperméables, maillot de bain, crème solaire indice élevé', 'Falaises d\'Illbarritz, Plage de la Côte des Basques, Village d\'Ainhoa, Rocher de la Vierge', 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=1200', '2026-03-13 21:33:24'),
(5, 'Circuit des 5 Lacs — Chamonix', 'Randonnée familiale emblématique autour de cinq lacs d\'altitude dans le massif du Mont Blanc. Marmottes, flore alpine et panoramas sur les glaciers pour une journée magique accessible à tous.', 'facile', '1 jour', '12.00', 300, 300, 'Flégère', 'Flégère', 'Alpes', 'Juin à Septembre', 'Sac léger, pique-nique, eau, veste coupe-vent, lunettes de soleil', 'Lac Blanc, Lac des Chéserys, marmottes, panorama Aiguilles de Chamonix', 'https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&cs=tinysrgb&w=1200', '2026-03-13 21:33:24'),
(6, 'Ascension du Vignemale', 'Plus haut sommet des Pyrénées françaises à 3298m. Une ascension alpine engagée avec passage sur le glacier d\'Ossoue, récompensée par un panorama à 360° sur les Pyrénées franco-espagnoles.', 'expert', '2 jours', '18.00', 1800, 1800, 'Gavarnie', 'Gavarnie', 'Pyrénées', 'Juillet à Août', 'Crampons 10 pointes, piolet, casque, baudrier, corde, lunettes glacier', 'Glacier d\'Ossoue, Refuge Bayssellance 2651m, panorama sur le cirque de Gavarnie', 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=1200', '2026-03-13 21:33:24');

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
-- Structure de la table `offres_escalade`
--

CREATE TABLE `offres_escalade` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text,
  `lieu` varchar(255) DEFAULT NULL,
  `duree` varchar(50) DEFAULT NULL,
  `difficulte` varchar(50) DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `capacite_max` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `offres_escalade`
--

INSERT INTO `offres_escalade` (`id`, `titre`, `description`, `lieu`, `duree`, `difficulte`, `prix`, `capacite_max`, `image_url`, `actif`, `created_at`) VALUES
(1, 'Initiation bloc - en Forêt ', 'Découverte de l\'escalade en forêt. Parfait pour débuter dans un cadre magnifique. Matériel fourni.', 'Chamonix', '4h', 'Débutant', '45.00', 8, 'https://img2.wallspic.com/crops/7/8/1/5/2/125187/125187-aventure-lescalade_sportive-les_jeux_video-lescalade-3840x2160.jpg', 1, '2026-02-25 16:39:47'),
(2, 'Escalade sportive à Orpierre', 'Journée d\'escalade dans le célèbre site d\'Orpierre. Voies équipées pour tous les niveaux.', 'Orpierre', '1 journée', 'Débutant/Intermédiaire', '65.00', 6, 'https://img.freepik.com/photos-gratuite/tir-magique-beau-sommet-montagne-enneige-recouvert-nuages_181624-5229.jpg?t=st=1772035375~exp=1772038975~hmac=154dc038611cfe91d1ec2b6cb789b3b8864abe3632d9ec71e4c08fbae3b09f16&w=1480', 1, '2026-02-25 16:39:47'),
(3, 'Perfectionnement à Céüse', 'Stage de perfectionnement dans l\'un des plus beaux sites calcaires des Alpes.', 'Céüse', '2 jours', 'Intermédiaire', '180.00', 4, 'https://img.freepik.com/photos-premium/vue-faible-angle-homme-grimpant-rocher_1645678-514.jpg?w=1480', 1, '2026-02-25 16:39:47'),
(4, 'Grande voie aux Drus', 'Ascension d\'une grande voie mythique au cœur du massif du Mont-Blanc. Niveau confirmé requis.', 'Les Drus - Chamonix', '2 jours', 'Expert', '350.00', 2, 'https://www.valleedeladrome-tourisme.com/wp-content/uploads/wpetourisme/28257715-diaporama.jpg', 1, '2026-02-25 16:39:47'),
(5, 'Via ferrata des Aiguilles Rouges', 'Parcours sécurisé dans la réserve naturelle. Superbes vues sur la chaîne du Mont-Blanc.', 'Chamonix', '5h', 'Intermédiaire', '35.00', 10, 'https://www.valleedeladrome-tourisme.com/wp-content/uploads/wpetourisme/28257713-diaporama.jpg', 1, '2026-02-25 16:39:47'),
(6, 'Stage multivoies - Calanques', 'Week-end escalade dans les Calanques de Marseille. Plusieurs voies avec vue sur mer.', 'Calanques', '2 jours', 'Intermédiaire', '220.00', 6, 'https://www.sncf-connect.com/assets/styles/ratio_2_1_max_width_961/public/media/2024-04/calanques-d-en-vau-cassis-mer-istock-janoka82.jpg?h=842e90a5&itok=Ntn-kTQD', 1, '2026-02-25 16:39:47');

-- --------------------------------------------------------

--
-- Structure de la table `offres_randonnee`
--

CREATE TABLE `offres_randonnee` (
  `id` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `description` text,
  `lieu` varchar(255) DEFAULT NULL,
  `duree` varchar(50) DEFAULT NULL,
  `difficulte` varchar(50) DEFAULT NULL,
  `capacite_max` int(11) DEFAULT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `guide_inclus` tinyint(1) DEFAULT '0',
  `actif` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `offres_randonnee`
--

INSERT INTO `offres_randonnee` (`id`, `titre`, `description`, `lieu`, `duree`, `difficulte`, `capacite_max`, `prix`, `image_url`, `guide_inclus`, `actif`, `created_at`) VALUES
(1, 'Lac Blanc - Chamonix', 'Randonnée familiale avec vue magnifique sur le Mont Blanc. Lac d\'altitude accessible.', 'Chamonix', '4h', 'Facile', 15, '25.00', 'https://www.oisans.com/app/uploads/iris-images/12437/randonnee-05-1920x1080-f50_50.webp', 0, 1, '2026-02-25 15:46:23'),
(2, 'Tour du Mont Blanc - Étape 1', 'Première étape du célèbre tour du Mont Blanc. Paysages grandioses.', 'Les Houches', '6h', 'Moyen', 10, '35.00', 'https://www.france-montagnes.com/wp-content/uploads/2025/01/randonnee-c-anastasia-600x500.jpg', 1, 1, '2026-02-25 15:46:23'),
(3, 'Aiguilles Rouges - Réserve naturelle', 'Randonnée dans la réserve naturelle des Aiguilles Rouges. Faune et flore exceptionnelles.', 'Chamonix', '5h', 'Moyen', 12, '30.00', 'https://i0.wp.com/conseilsante.cliniquecmi.com/wp-content/uploads/2022/05/bienfait-randonnee-conseil-sante.jpg?w=1200&ssl=1', 1, 1, '2026-02-25 15:46:23'),
(4, 'Mer de Glace - Vallée Blanche', 'Randonnée glaciaire accompagnée par un guide. Découverte des crevasses et séracs.', 'Chamonix', '5h', 'Difficile', 8, '45.00', 'https://www.touteleurope.eu/wp-content/uploads/2023/07/tour-mont-blanc.jpg', 1, 1, '2026-02-25 15:46:23'),
(5, 'Col du Brévent - Panorama', 'Randonnée offrant une vue imprenable sur la chaîne du Mont Blanc.', 'Chamonix', '5h', 'Moyen', 15, '28.00', 'https://www.touteleurope.eu/wp-content/uploads/2023/07/ordesa.jpg', 0, 1, '2026-02-25 15:46:23'),
(6, 'Lacs des Chéserys', 'Magnifique randonnée vers les lacs d\'altitude aux eaux turquoises.', 'Argentière', '4h', 'Facile', 20, '22.00', 'https://www.touteleurope.eu/wp-content/uploads/2023/07/tatras-randonnee.jpg', 0, 1, '2026-02-25 15:46:23');

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
(3, 3, 'Cours particuliers débutants', '5 sessions de 2h avec moniteur ESF pour débuter en confiance', 'cours', '450.00', 'Premier cours offert', '2024-12-14', '2025-01-31', 'https://www.avoriaz.com/cours-debutants', 1, '2026-01-26 14:36:58');

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
  `type_activite` varchar(50) DEFAULT 'ski',
  `date_reservation` date NOT NULL,
  `nb_personnes` int(11) DEFAULT '1',
  `notes` text,
  `statut` varchar(50) DEFAULT 'confirmée',
  `date_creation` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_modification` datetime DEFAULT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin` time DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `membre_id`, `activite_id`, `type_activite`, `date_reservation`, `nb_personnes`, `notes`, `statut`, `date_creation`, `date_modification`, `heure_debut`, `heure_fin`) VALUES
(8, 6, 1, 'ski', '2026-02-27', 1, '{\"offre\":\"Forfait 6 jours Early Bird\",\"station\":\"Chamonix Mont-Blanc\",\"dateFin\":\"2026-03-01\",\"options\":{\"forfaitSki\":true,\"coursSki\":false,\"locationMateriel\":false,\"typeCours\":\"collectif\",\"niveau\":\"débutant\",\"assurance\":false,\"parking\":false,\"garderie\":false,\"restauration\":false},\"clientInfo\":{\"civilite\":\"M.\",\"nom\":\"paul\",\"prenom\":\"paul\",\"email\":\"paul@gmail.com\",\"telephone\":\"08  89 89 86  54\",\"adresse\":\"PAUL\",\"cp\":\"788999\",\"ville\":\"PARIS\",\"pays\":\"France\"},\"prixTotal\":840,\"typeReservation\":\"ski\"}', 'confirmée', '2026-02-25 15:36:17', NULL, '09:00:00', '17:00:00'),
(9, 6, 6, 'randonnee', '2026-02-25', 1, '{\"randonnee\":\"Lacs des Chéserys\",\"lieu\":\"Argentière\",\"duree\":\"4h\",\"difficulte\":\"Facile\",\"niveau\":\"débutant\",\"options\":{\"guide\":false,\"guide_inclus\":0},\"clientInfo\":{\"civilite\":\"M.\",\"nom\":\"paul\",\"prenom\":\"paul\",\"email\":\"paul@gmail.com\",\"telephone\":\"09\",\"adresse\":\"paul\",\"cp\":\"67\",\"ville\":\"PAR\",\"pays\":\"France\"},\"prixTotal\":22,\"notes\":\"\"}', 'confirmée', '2026-02-25 15:58:29', NULL, NULL, NULL),
(10, 6, 5, 'escalade', '2026-02-26', 1, '{\"activite\":\"Via ferrata des Aiguilles Rouges\",\"lieu\":\"Chamonix\",\"duree\":\"5h\",\"difficulte\":\"Intermédiaire\",\"niveau\":\"débutant\",\"clientInfo\":{\"civilite\":\"M.\",\"nom\":\"paul\",\"prenom\":\"knl\",\"email\":\"paul@gmail.com\",\"telephone\":\"08089\",\"adresse\":\"BIG\",\"cp\":\"BJK\",\"ville\":\"KLJ\",\"pays\":\"France\"},\"prixTotal\":35,\"notes\":\"\"}', 'confirmée', '2026-02-25 16:45:16', NULL, NULL, NULL),
(11, 6, 6, 'escalade', '2026-02-26', 6, '{\"activite\":\"Stage multivoies - Calanques\",\"lieu\":\"Calanques\",\"duree\":\"2 jours\",\"difficulte\":\"Intermédiaire\",\"niveau\":\"débutant\",\"clientInfo\":{\"civilite\":\"M.\",\"nom\":\"paul\",\"prenom\":\"?KM??\",\"email\":\"paul@gmail.com\",\"telephone\":\"09\",\"adresse\":\"PAUL\",\"cp\":\"78\",\"ville\":\"PAUL\",\"pays\":\"France\"},\"prixTotal\":1320,\"notes\":\"\"}', 'confirmée', '2026-02-25 17:36:15', NULL, NULL, NULL);

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
(1, 'Chamonix Mont-Blanc', 'Station mythique au pied du Mont-Blanc, paradis du ski alpin et du freeride', 'Alpes du Nord', 1035, 3842, 150, 49, '155.00', 'très grande', '62.50', '2024-12-14', '2025-04-27', 'https://cdn-s-www.ledauphine.com/images/dd55bd91-a9ba-44a6-8287-d25ded589bc6/NW_RAW/photo-ot-chamonix-mont-blanc_mr.jpg', 'https://www.chamonix.com', 120, '2026-01-26 14:36:58'),
(2, 'Courchevel', 'Partie des Trois Vallées, domaine skiable immense et luxueux', 'Savoie', 1100, 2738, 150, 58, '150.00', 'très grande', '65.00', '2024-12-07', '2025-04-20', 'https://radiomontblanc.fr/photos/articles/vignettes/dolomites-winter-pistes-ski_47776.jpg', 'https://www.courchevel.com', 110, '2026-01-26 14:36:58'),
(3, 'Avoriaz', 'Station piétonne intégrée au domaine des Portes du Soleil', 'Haute-Savoie', 1100, 2466, 49, 37, '75.00', 'grande', '58.00', '2024-12-14', '2025-04-13', 'https://radiomontblanc.fr/uploads/val-gardena-station-ski-italie.jpg', 'https://www.avoriaz.com', 90, '2026-01-26 14:36:58'),
(4, 'Les Arcs', 'Station moderne avec vaste domaine skiable pour tous niveaux', 'Savoie', 1200, 3226, 106, 54, '200.00', 'très grande', '56.50', '2024-12-14', '2025-04-27', 'https://radiomontblanc.fr/uploads/skyway-courmayeur-station-ski-italie.jpg', 'https://www.lesarcs.com', 100, '2026-01-26 14:36:58'),
(6, 'Font-Romeu', 'Station ensoleillée des Pyrénées, idéale ski de fond et alpin', 'Pyrénées', 1550, 2212, 29, 16, '58.00', 'moyenne', '45.00', '2024-12-21', '2025-03-30', 'https://cdn-s-www.ledauphine.com/images/7320817a-550d-4f1e-bbc1-594db4b35c91/NW_RAW/photo-renzo-vanden-bussche_unsplash.jpg', 'https://www.font-romeu.fr', 60, '2026-01-26 14:36:58'),
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
(4, 'Sophie M.', 'sophie@email.com', 'rando', NULL, 'Ski de randonnée inoubliable. Montée tôt le matin pour profiter de la neige vierge.', 5, 1, '2026-01-26 14:36:58'),
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
(5, 'grimpeuse88', 'sophie.leroy@email.com', '$2b$10$ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', 'user', '2026-01-26 15:15:06'),
(6, 'paul', 'paul@gmail.com', '$2b$10$zJQmls67pjuASCogKUPwv.iagUH9xmZmAS0FdErVE9EtdbhxZ0byu', 'user', '2026-02-24 13:47:42');

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
-- Index pour la table `offres_escalade`
--
ALTER TABLE `offres_escalade`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `offres_randonnee`
--
ALTER TABLE `offres_randonnee`
  ADD PRIMARY KEY (`id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT pour la table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `inscriptions`
--
ALTER TABLE `inscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `itineraires`
--
ALTER TABLE `itineraires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `membres`
--
ALTER TABLE `membres`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `offres_escalade`
--
ALTER TABLE `offres_escalade`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `offres_randonnee`
--
ALTER TABLE `offres_randonnee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `offres_ski`
--
ALTER TABLE `offres_ski`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `photos`
--
ALTER TABLE `photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reservations`
--
ALTER TABLE `reservations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
  ADD CONSTRAINT `reservations_membre_id_fk` FOREIGN KEY (`membre_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
