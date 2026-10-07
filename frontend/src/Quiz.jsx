
import { useState } from "react"
import "./Quiz.css"


const LANGUAGES = [
  "Français",
  "English",
  "Español",
  "Português",
  "Deutsch",
  "Italiano",
  "日本語",
  "中文"
]


function Quiz({
  onBack,
  onStartQuiz
}) {

  const savedLanguage =
    localStorage.getItem("language") ||
    "Français"


  const savedCountry =
    localStorage.getItem("country") ||
    ""


  const [subject, setSubject] =
    useState("")


  const [difficulty, setDifficulty] =
    useState("")


  const [language, setLanguage] =
    useState(savedLanguage)


  const [questionCount, setQuestionCount] =
    useState(5)


  const subjects = [

    [
      "math",
      "Mathématiques",
      "📐",
      "blue"
    ],

    [
      "physics",
      "Physique",
      "⚛️",
      "red"
    ],

    [
      "history",
      "Histoire",
      "🏛️",
      "green"
    ],

    [
      "geography",
      "Géographie",
      "🌍",
      "blue"
    ],

    [
      "computer",
      "Informatique",
      "💻",
      "red"
    ],

    [
      "english",
      "Anglais",
      "🇬🇧",
      "green"
    ],

    [
      "general",
      "Culture générale",
      "🧠",
      "blue"
    ],

    [
      "all",
      "Toutes les matières",
      "🎯",
      "red"
    ]

  ]


  const difficulties = [

    [
      "easy",
      "Facile",
      "🌱",
      "Pour commencer tranquillement"
    ],

    [
      "medium",
      "Moyen",
      "🔥",
      "Un peu plus de challenge"
    ],

    [
      "hard",
      "Difficile",
      "⚡",
      "Il va falloir réfléchir"
    ],

    [
      "extreme",
      "Extrême",
      "💀",
      "Pour les cerveaux solides"
    ]

  ]


  const questionCounts = [
    5,
    10,
    15,
    20
  ]


  // =========================
  // LANCER
  // =========================

  function startQuiz() {

    if (!subject) {

      alert(
        "Choisis une matière 📚"
      )

      return
    }


    if (!difficulty) {

      alert(
        "Choisis une difficulté ⚡"
      )

      return
    }


    if (!language) {

      alert(
        "Choisis une langue 🗣️"
      )

      return
    }


    onStartQuiz({

      subject,

      difficulty,

      language,

      questionCount

    })

  }


  return (

    <div className="quiz-page">


      {/* =========================
          NAVBAR
      ========================= */}

      <header className="quiz-navbar">

        <button
          className="quiz-back"
          onClick={onBack}
        >
          ← Retour
        </button>


        <div className="quiz-logo">
          FUNIA 🎮
        </div>


        <div className="quiz-points">
          🏆 XP
        </div>

      </header>


      <main className="quiz-container">


        {/* =========================
            TITRE
        ========================= */}

        <section className="quiz-title">

          <div className="quiz-badge">
            🧠 MODE QUIZ
          </div>


          <h1>
            Teste tes{" "}
            <span>
              connaissances.
            </span>
          </h1>


          <p>
            Choisis ta matière, ta langue
            et ton niveau.
          </p>

        </section>


        {/* =========================
            PROFIL
        ========================= */}

        <section className="quiz-box">

          <div className="section-title">

            <div>

              <span className="section-number">
                01
              </span>

              <h2>
                Ton expérience
              </h2>

            </div>

          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "16px"
            }}
          >

            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700"
                }}
              >
                🌍 Pays
              </label>


              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "#f5f6fa",
                  color: "#606978",
                  fontWeight: "600"
                }}
              >
                {savedCountry || "Non renseigné"}
              </div>

            </div>


            <div>

              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "700"
                }}
              >
                🗣️ Langue du quiz
              </label>


              <select
                value={language}
                onChange={event =>
                  setLanguage(
                    event.target.value
                  )
                }
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid #e1e4eb",
                  background: "white",
                  fontWeight: "600"
                }}
              >

                {LANGUAGES.map(lang => (

                  <option
                    key={lang}
                    value={lang}
                  >
                    {lang}
                  </option>

                ))}

              </select>

            </div>

          </div>

        </section>


        {/* =========================
            MATIERE
        ========================= */}

        <section className="quiz-box">

          <div className="section-title">

            <div>

              <span className="section-number">
                02
              </span>

              <h2>
                Choisis une matière
              </h2>

            </div>


            <span className="selection-info">

              {subject
                ? "✓ Sélectionnée"
                : "Aucune sélection"}

            </span>

          </div>


          <div className="subjects-grid">

            {subjects.map(item => {

              const [
                id,
                name,
                icon,
                color
              ] = item


              return (

                <button
                  key={id}
                  type="button"
                  className={`subject-card ${color} ${
                    subject === id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setSubject(id)
                  }
                >

                  <div className="subject-icon">
                    {icon}
                  </div>


                  <div className="subject-text">

                    <strong>
                      {name}
                    </strong>


                    <span>
                      {subject === id
                        ? "Sélectionné ✓"
                        : "Choisir"}
                    </span>

                  </div>


                  <div className="card-arrow">
                    →
                  </div>

                </button>

              )

            })}

          </div>

        </section>


        {/* =========================
            DIFFICULTE
        ========================= */}

        <section className="quiz-box">

          <div className="section-title">

            <div>

              <span className="section-number">
                03
              </span>

              <h2>
                Choisis la difficulté
              </h2>

            </div>


            <span className="selection-info">

              {difficulty
                ? "✓ Sélectionnée"
                : "Aucune sélection"}

            </span>

          </div>


          <div className="difficulty-grid">

            {difficulties.map(item => {

              const [
                id,
                name,
                icon,
                description
              ] = item


              return (

                <button
                  key={id}
                  type="button"
                  className={`difficulty-card ${
                    difficulty === id
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setDifficulty(id)
                  }
                >

                  <div className="difficulty-icon">
                    {icon}
                  </div>


                  <div className="difficulty-info">

                    <strong>
                      {name}
                    </strong>

                    <span>
                      {description}
                    </span>

                  </div>


                  <div className="difficulty-check">

                    {difficulty === id
                      ? "✓"
                      : ""}

                  </div>

                </button>

              )

            })}

          </div>

        </section>


        {/* =========================
            NOMBRE DE QUESTIONS
        ========================= */}

        <section className="quiz-box">

          <div className="section-title">

            <div>

              <span className="section-number">
                04
              </span>

              <h2>
                Nombre de questions
              </h2>

            </div>


            <span className="selection-info">

              {questionCount} questions

            </span>

          </div>


          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, 1fr)",
              gap: "12px"
            }}
          >

            {questionCounts.map(count => (

              <button
                key={count}
                type="button"
                onClick={() =>
                  setQuestionCount(count)
                }
                style={{
                  padding: "18px",
                  borderRadius: "14px",
                  border:
                    questionCount === count
                      ? "2px solid #5b5cf0"
                      : "1px solid #e2e5eb",
                  background:
                    questionCount === count
                      ? "#f0f0ff"
                      : "white",
                  color:
                    questionCount === count
                      ? "#5b5cf0"
                      : "#505765",
                  fontWeight: "800",
                  cursor: "pointer"
                }}
              >
                {count}
              </button>

            ))}

          </div>

        </section>


        {/* =========================
            LANCEMENT
        ========================= */}

        <section className="quiz-launch">

          <div className="launch-info">

            <span className="launch-icon">
              🚀
            </span>


            <div>

              <strong>
                Prêt à relever le défi ?
              </strong>


              <p>
                {questionCount} questions •{" "}
                {language}
              </p>

            </div>

          </div>


          <button
            type="button"
            className="start-quiz-button"
            onClick={startQuiz}
          >
            Commencer le quiz →
          </button>

        </section>

      </main>

    </div>
  )
}


export default Quiz

