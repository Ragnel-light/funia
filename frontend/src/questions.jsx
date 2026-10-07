const questions = [
  // =========================
  // MATH - FACILE
  // =========================

  {
    id: 1,
    subject: "math",
    difficulty: "easy",
    question: "Combien font 12 × 8 ?",
    answers: ["86", "96", "108", "112"],
    correct: 1,
    explanation: "12 × 8 = 96."
  },

  {
    id: 2,
    subject: "math",
    difficulty: "easy",
    question: "Combien font 25 + 17 ?",
    answers: ["40", "42", "45", "52"],
    correct: 1,
    explanation: "25 + 17 = 42."
  },

  {
    id: 3,
    subject: "math",
    difficulty: "easy",
    question: "Combien font 100 - 37 ?",
    answers: ["53", "63", "73", "67"],
    correct: 1,
    explanation: "100 - 37 = 63."
  },

  {
    id: 4,
    subject: "math",
    difficulty: "easy",
    question: "Combien font 9 × 7 ?",
    answers: ["56", "63", "72", "49"],
    correct: 1,
    explanation: "9 × 7 = 63."
  },

  {
    id: 5,
    subject: "math",
    difficulty: "easy",
    question: "Quelle est la moitié de 50 ?",
    answers: ["10", "20", "25", "30"],
    correct: 2,
    explanation: "La moitié de 50 est 25."
  },

  {
    id: 6,
    subject: "math",
    difficulty: "easy",
    question: "Combien font 15 + 27 ?",
    answers: ["32", "40", "42", "45"],
    correct: 2,
    explanation: "15 + 27 = 42."
  },

  {
    id: 7,
    subject: "math",
    difficulty: "easy",
    question: "Combien font 81 ÷ 9 ?",
    answers: ["7", "8", "9", "10"],
    correct: 2,
    explanation: "81 ÷ 9 = 9."
  },

  {
    id: 8,
    subject: "math",
    difficulty: "easy",
    question: "Quel est le carré de 5 ?",
    answers: ["10", "15", "20", "25"],
    correct: 3,
    explanation: "5² = 25."
  },


  // =========================
  // MATH - MOYEN
  // =========================

  {
    id: 9,
    subject: "math",
    difficulty: "medium",
    question: "Résous : 3x + 6 = 18.",
    answers: ["x = 2", "x = 3", "x = 4", "x = 6"],
    correct: 2,
    explanation: "3x = 12 donc x = 4."
  },

  {
    id: 10,
    subject: "math",
    difficulty: "medium",
    question: "Quelle est la valeur de 7² - 3² ?",
    answers: ["40", "42", "46", "49"],
    correct: 0,
    explanation: "49 - 9 = 40."
  },

  {
    id: 11,
    subject: "math",
    difficulty: "medium",
    question: "Combien font 15% de 200 ?",
    answers: ["20", "25", "30", "35"],
    correct: 2,
    explanation: "15/100 × 200 = 30."
  },


  // =========================
  // PHYSIQUE - FACILE
  // =========================

  {
    id: 12,
    subject: "physics",
    difficulty: "easy",
    question: "Quelle est l'unité de la vitesse dans le système international ?",
    answers: ["Newton", "Joule", "m/s", "Watt"],
    correct: 2,
    explanation: "La vitesse s'exprime en mètres par seconde (m/s)."
  },

  {
    id: 13,
    subject: "physics",
    difficulty: "easy",
    question: "Quelle force attire les objets vers la Terre ?",
    answers: [
      "La force électrique",
      "La gravité",
      "La force magnétique",
      "La poussée"
    ],
    correct: 1,
    explanation: "La gravité attire les objets vers le centre de la Terre."
  },

  {
    id: 14,
    subject: "physics",
    difficulty: "easy",
    question: "Quelle est approximativement la valeur de g sur Terre ?",
    answers: ["5 m/s²", "9,8 m/s²", "15 m/s²", "20 m/s²"],
    correct: 1,
    explanation: "L'accélération gravitationnelle terrestre vaut environ 9,8 m/s²."
  },


  // =========================
  // HISTOIRE
  // =========================

  {
    id: 15,
    subject: "history",
    difficulty: "easy",
    question: "En quelle année la Seconde Guerre mondiale s'est-elle terminée ?",
    answers: ["1943", "1944", "1945", "1946"],
    correct: 2,
    explanation: "La Seconde Guerre mondiale s'est terminée en 1945."
  },

  {
    id: 16,
    subject: "history",
    difficulty: "easy",
    question: "Qui était Napoléon Bonaparte ?",
    answers: [
      "Un scientifique",
      "Un empereur français",
      "Un explorateur",
      "Un écrivain"
    ],
    correct: 1,
    explanation: "Napoléon Bonaparte fut empereur des Français."
  },


  // =========================
  // GEOGRAPHIE
  // =========================

  {
    id: 17,
    subject: "geography",
    difficulty: "easy",
    question: "Quelle est la capitale du Togo ?",
    answers: ["Kara", "Lomé", "Sokodé", "Atakpamé"],
    correct: 1,
    explanation: "Lomé est la capitale du Togo."
  },

  {
    id: 18,
    subject: "geography",
    difficulty: "easy",
    question: "Quel est le plus grand continent ?",
    answers: ["Afrique", "Europe", "Asie", "Amérique"],
    correct: 2,
    explanation: "L'Asie est le plus grand continent."
  },


  // =========================
  // INFORMATIQUE
  // =========================

  {
    id: 19,
    subject: "computer",
    difficulty: "easy",
    question: "Quel langage est principalement utilisé avec React ?",
    answers: ["Python", "JavaScript", "C++", "Java"],
    correct: 1,
    explanation: "React est une bibliothèque JavaScript."
  },

  {
    id: 20,
    subject: "computer",
    difficulty: "easy",
    question: "Que signifie HTML ?",
    answers: [
      "HyperText Markup Language",
      "HighText Machine Language",
      "HyperTool Modern Language",
      "HomeText Markup Language"
    ],
    correct: 0,
    explanation: "HTML signifie HyperText Markup Language."
  },


  // =========================
  // ANGLAIS
  // =========================

  {
    id: 21,
    subject: "english",
    difficulty: "easy",
    question: "Que signifie 'Hello' ?",
    answers: ["Au revoir", "Bonjour", "Merci", "Bonne nuit"],
    correct: 1,
    explanation: "'Hello' signifie 'Bonjour'."
  },


  // =========================
  // CULTURE GENERALE
  // =========================

  {
    id: 22,
    subject: "general",
    difficulty: "easy",
    question: "Quelle planète est surnommée la planète rouge ?",
    answers: ["Vénus", "Mars", "Jupiter", "Mercure"],
    correct: 1,
    explanation: "Mars est surnommée la planète rouge."
  },

  {
    id: 23,
    subject: "general",
    difficulty: "easy",
    question: "Combien y a-t-il de continents généralement reconnus ?",
    answers: ["5", "6", "7", "8"],
    correct: 2,
    explanation: "On compte généralement 7 continents."
  }
]

export default questions