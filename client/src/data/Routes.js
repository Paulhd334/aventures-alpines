// src/data/Routes.js

export const hikingRoutes = [
  {
    id: 1,
    nom: "Tour du Mont Blanc",
    description: "L'un des plus célèbres treks d'Europe.",
    difficulte: "Difficile",
    duree: "10 jours",
    distance: "170 km",
    denivele: "+10000m",
    pointDepart: "Les Houches",
    pointArrivee: "Les Houches",
    saison: "Juin à Septembre",
    image: "https://fichier0.cirkwi.com/image/photo/circuit/800x500/680855/fr/0.jpg?1763618988",
    gpsTrack: "/tracks/tmb.gpx",
    altitudeMax: "2665m",
    refuges: "12 refuges",
    region: "Alpes",
    type: "Grande randonnée",
    note: 4.8,
    votes: 124
  },
  {
    id: 2,
    nom: "Tour du Lac d'Annecy",
    description: "Randonnée panoramique autour du lac.",
    difficulte: "Intermédiaire",
    duree: "5 jours",
    distance: "85 km",
    denivele: "+4500m",
    pointDepart: "Annecy",
    pointArrivee: "Annecy",
    saison: "Mai à Octobre",
    image: "https://www.oisans.com/app/uploads/2024/11/plateau-d-emparis-05.webp",
    gpsTrack: "/tracks/annecy.gpx",
    altitudeMax: "1937m",
    refuges: "7 refuges",
    region: "Haute-Savoie",
    type: "Tour",
    note: 4.5,
    votes: 89
  },
  {
    id: 3,
    nom: "Traversée des Écrins",
    description: "Parcours alpin exigeant.",
    difficulte: "Expert",
    duree: "7 jours",
    distance: "120 km",
    denivele: "+8000m",
    pointDepart: "Monêtier",
    pointArrivee: "Valgaudémar",
    saison: "Juillet à Août",
    image: "https://www.oisans.com/app/uploads/2024/11/plateau-d-emparis-04.webp",
    gpsTrack: "/tracks/ecrins.gpx",
    altitudeMax: "3568m",
    refuges: "9 refuges",
    region: "Hautes-Alpes",
    type: "Traversée",
    note: 4.9,
    votes: 67
  },
  {
    id: 4,
    nom: "GR20 Corse",
    description: "Le GR le plus difficile d'Europe.",
    difficulte: "Expert",
    duree: "15 jours",
    distance: "180 km",
    denivele: "+12000m",
    pointDepart: "Calenzana",
    pointArrivee: "Conca",
    saison: "Juin à Septembre",
    image: "https://www.oisans.com/app/uploads/iris-images/12857/randonnee-muzelle-04-1920x1080-f42_76.webp",
    gpsTrack: "/tracks/gr20.gpx",
    altitudeMax: "2625m",
    refuges: "15 refuges",
    region: "Corse",
    type: "Grande randonnée",
    note: 4.7,
    votes: 203
  },
  {
    id: 5,
    nom: "Tour du Queyras",
    description: "Randonnée familiale alpine.",
    difficulte: "Intermédiaire",
    duree: "6 jours",
    distance: "95 km",
    denivele: "+5500m",
    pointDepart: "Arvieux",
    pointArrivee: "Arvieux",
    saison: "Juin à Octobre",
    image: "https://fichier0.cirkwi.com/image/photo/circuit/800x400/680855/fr/1.jpg?1763618988",
    gpsTrack: "/tracks/queyras.gpx",
    altitudeMax: "2880m",
    refuges: "8 refuges",
    region: "Hautes-Alpes",
    type: "Tour",
    note: 4.4,
    votes: 56
  },
  {
    id: 6,
    nom: "Chamonix - Zermatt",
    description: "Haute Route alpine mythique.",
    difficulte: "Difficile",
    duree: "12 jours",
    distance: "200 km",
    denivele: "+13000m",
    pointDepart: "Chamonix",
    pointArrivee: "Zermatt",
    saison: "Juillet à Août",
    image: "https://fichier0.cirkwi.com/image/photo/circuit/800x400/680855/fr/2.jpg?1763618988",
    gpsTrack: "/tracks/haute-route.gpx",
    altitudeMax: "3800m",
    refuges: "11 refuges",
    region: "Alpes",
    type: "Haute route",
    note: 4.9,
    votes: 145
  }
];


// EXPORTS — corrigés

export const difficulteOptions = [
  { value: "", label: "Tous niveaux" },
  { value: "Facile", label: "Facile" },
  { value: "Intermédiaire", label: "Intermédiaire" },
  { value: "Difficile", label: "Difficile" },
  { value: "Expert", label: "Expert" }
];

export const dureeOptions = [
  { value: "", label: "Toutes durées" },
  { value: "1", label: "1 journée" },
  { value: "2-3", label: "2-3 jours" },
  { value: "4-7", label: "4-7 jours" },
  { value: "8+", label: "8+ jours" }
];

export const distanceOptions = [
  { value: "", label: "Toutes distances" },
  { value: "<20", label: "< 20 km" },
  { value: "20-50", label: "20-50 km" },
  { value: "50-100", label: "50-100 km" },
  { value: "100+", label: "> 100 km" }
];
