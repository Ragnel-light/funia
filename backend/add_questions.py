from database import SessionLocal
from models.quiz import Question

db = SessionLocal()

questions = [

    # EASY
    {
        "question": "Combien font 5 + 7 ?",
        "a": "10",
        "b": "12",
        "c": "13",
        "d": "14",
        "correct": "B",
        "explanation": "5 + 7 = 12.",
        "category": "Mathematiques",
        "difficulty": "easy",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quelle planete est la plus proche du Soleil ?",
        "a": "Mars",
        "b": "Venus",
        "c": "Mercure",
        "d": "Jupiter",
        "correct": "C",
        "explanation": "Mercure est la planete la plus proche du Soleil.",
        "category": "Sciences",
        "difficulty": "easy",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quel langage est utilise pour rendre une page web interactive ?",
        "a": "HTML",
        "b": "CSS",
        "c": "JavaScript",
        "d": "SQL",
        "correct": "C",
        "explanation": "JavaScript permet notamment de rendre les pages web interactives.",
        "category": "Informatique",
        "difficulty": "easy",
        "country": "all",
        "level": "all"
    },

    # MEDIUM
    {
        "question": "Quelle est la derivee de x^2 ?",
        "a": "x",
        "b": "2x",
        "c": "x^3",
        "d": "2",
        "correct": "B",
        "explanation": "La derivee de x^2 est 2x.",
        "category": "Mathematiques",
        "difficulty": "medium",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quel est le symbole chimique de l'or ?",
        "a": "Ag",
        "b": "Fe",
        "c": "Au",
        "d": "O",
        "correct": "C",
        "explanation": "Le symbole chimique de l'or est Au.",
        "category": "Sciences",
        "difficulty": "medium",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quel protocole est principalement utilise pour charger une page web ?",
        "a": "FTP",
        "b": "HTTP",
        "c": "SMTP",
        "d": "SSH",
        "correct": "B",
        "explanation": "HTTP est utilise pour la communication entre un navigateur et un serveur web.",
        "category": "Informatique",
        "difficulty": "medium",
        "country": "all",
        "level": "all"
    },

    # HARD
    {
        "question": "Quelle est la complexite moyenne d'une recherche binaire ?",
        "a": "O(n)",
        "b": "O(n^2)",
        "c": "O(log n)",
        "d": "O(1)",
        "correct": "C",
        "explanation": "La recherche binaire divise l'espace de recherche par deux a chaque etape.",
        "category": "Informatique",
        "difficulty": "hard",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quelle est la limite de sin(x)/x lorsque x tend vers 0 ?",
        "a": "0",
        "b": "1",
        "c": "Infinity",
        "d": "-1",
        "correct": "B",
        "explanation": "La limite classique de sin(x)/x en 0 vaut 1.",
        "category": "Mathematiques",
        "difficulty": "hard",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quelle particule possede une charge electrique negative ?",
        "a": "Proton",
        "b": "Neutron",
        "c": "Electron",
        "d": "Photon",
        "correct": "C",
        "explanation": "L'electron porte une charge electrique negative.",
        "category": "Sciences",
        "difficulty": "hard",
        "country": "all",
        "level": "all"
    },

    # EXTREME
    {
        "question": "Quel probleme est classiquement associe a la classe NP-complete ?",
        "a": "Tri par insertion",
        "b": "Probleme du sac a dos",
        "c": "Recherche lineaire",
        "d": "Addition de deux nombres",
        "correct": "B",
        "explanation": "Certaines formulations du probleme du sac a dos sont NP-completes.",
        "category": "Informatique",
        "difficulty": "extreme",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Quelle est la dimension d'un espace vectoriel dont une base contient 5 vecteurs ?",
        "a": "2",
        "b": "3",
        "c": "5",
        "d": "10",
        "correct": "C",
        "explanation": "La dimension d'un espace vectoriel est le nombre de vecteurs d'une base.",
        "category": "Mathematiques",
        "difficulty": "extreme",
        "country": "all",
        "level": "all"
    },

    {
        "question": "Dans quel cas une fonction est-elle dite injective ?",
        "a": "Chaque image possede plusieurs antecedents",
        "b": "Deux elements differents ont toujours des images differentes",
        "c": "Tous les elements ont la meme image",
        "d": "La fonction n'a aucune image",
        "correct": "B",
        "explanation": "Une fonction est injective lorsque deux elements distincts ne peuvent pas avoir la meme image.",
        "category": "Mathematiques",
        "difficulty": "extreme",
        "country": "all",
        "level": "all"
    }
]

for q in questions:

    question = Question(
        question=q["question"],
        option_a=q["a"],
        option_b=q["b"],
        option_c=q["c"],
        option_d=q["d"],
        correct_answer=q["correct"],
        explanation=q["explanation"],
        category=q["category"],
        difficulty=q["difficulty"],
        country=q["country"],
        level=q["level"]
    )

    db.add(question)

db.commit()
db.close()

print("12 questions added!")