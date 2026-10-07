
import { useEffect, useState } from "react"
import "./QuizGame.css"


function QuizGame({
  subject,
  difficulty,
  questionCount,
  language,
  country,
  onBack,
  onFinish
}) {

  const [questions, setQuestions] = useState([])

  const [currentQuestion, setCurrentQuestion] =
    useState(0)

  const [selectedAnswer, setSelectedAnswer] =
    useState(null)

  const [score, setScore] =
    useState(0)

  const [answered, setAnswered] =
    useState(false)

  const [finished, setFinished] =
    useState(false)

  const [loadingError, setLoadingError] =
    useState("")

  const [hint, setHint] =
    useState("")

  const [hintLoading, setHintLoading] =
    useState(false)

  const [hintError, setHintError] =
    useState("")

  const [translated, setTranslated] =
    useState(false)


  // ========================================
  // CHARGER QUESTIONS
  // ========================================

  async function loadQuestions() {

    setLoadingError("")

    setQuestions([])

    setCurrentQuestion(0)

    setSelectedAnswer(null)

    setScore(0)

    setAnswered(false)

    setFinished(false)

    setHint("")

    setHintError("")

    setTranslated(false)


    const count =
      Math.min(
        Number(questionCount) || 5,
        50
      )


    const selectedSubject =
      subject || "general"


    const selectedDifficulty =
      difficulty || "medium"


    const selectedLanguage =
      language ||
      localStorage.getItem("language") ||
      "Français"


    const selectedCountry =
      country ||
      localStorage.getItem("country") ||
      ""


    try {

      const params =
        new URLSearchParams({

          subject:
            selectedSubject,

          difficulty:
            selectedDifficulty,

          amount:
            String(count),

          language:
            selectedLanguage,

          country:
            selectedCountry

        })


      const response =
        await fetch(
          `http://127.0.0.1:8000/trivia/questions?${params.toString()}`
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Impossible de récupérer les questions."
        )

      }


      if (!data.questions?.length) {

        throw new Error(
          "Aucune question disponible."
        )

      }


      setQuestions(
        data.questions
      )


      setTranslated(
        Boolean(data.translated)
      )


    } catch (error) {

      console.error(
        "Erreur chargement quiz :",
        error
      )


      setLoadingError(
        error.message ||
        "Impossible de charger le quiz."
      )

    }

  }


  // ========================================
  // CHARGEMENT
  // ========================================

  useEffect(() => {

    loadQuestions()

  }, [
    subject,
    difficulty,
    questionCount,
    language,
    country
  ])


  // ========================================
  // INDICE FUNIA AI
  // ========================================

  async function askForHint() {

    const question =
      questions[currentQuestion]


    if (!question || hintLoading) {
      return
    }


    setHintLoading(true)

    setHintError("")


    try {

      const response =
        await fetch(
          "http://127.0.0.1:8000/ai/hint",
          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              question:
                question.question,

              answers:
                question.answers

            })

          }
        )


      const data =
        await response.json()


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Impossible d'obtenir un indice."
        )

      }


      setHint(
        data.hint ||
        "Réfléchis aux notions principales de cette question. 💡"
      )


    } catch (error) {

      console.error(
        "Erreur indice IA :",
        error
      )


      setHintError(
        "Impossible d'obtenir un indice pour le moment."
      )


    } finally {

      setHintLoading(false)

    }

  }


  // ========================================
  // REPONSE
  // ========================================

  function handleAnswer(index) {

    if (answered) {
      return
    }


    const question =
      questions[currentQuestion]


    if (!question) {
      return
    }


    setSelectedAnswer(index)

    setAnswered(true)


    if (
      index ===
      question.correct
    ) {

      setScore(
        previous =>
          previous + 1
      )

    }

  }


  // ========================================
  // SAUVEGARDE SCORE
  // ========================================

  async function saveQuizResult(
    finalScore
  ) {

    const userId =
      localStorage.getItem(
        "user_id"
      )


    if (!userId) {

      console.error(
        "Utilisateur non connecté."
      )

      return null
    }


    const xpEarned =
      finalScore * 10


    try {

      const response =
        await fetch(
          `http://127.0.0.1:8000/users/${userId}/quiz-result?score=${finalScore}&xp=${xpEarned}`,
          {
            method:
              "POST"
          }
        )


      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => null)


        throw new Error(
          errorData?.detail ||
          "Impossible d'enregistrer le résultat."
        )

      }


      return await response.json()


    } catch (error) {

      console.error(
        "Erreur sauvegarde quiz :",
        error
      )


      return null

    }

  }


  // ========================================
  // QUESTION SUIVANTE
  // ========================================

  async function nextQuestion() {

    if (!answered) {
      return
    }


    const question =
      questions[currentQuestion]


    if (!question) {
      return
    }


    const lastAnswerCorrect =
      selectedAnswer ===
      question.correct


    if (
      currentQuestion >=
      questions.length - 1
    ) {

      const finalScore =
        score +
        (
          lastAnswerCorrect
            ? 1
            : 0
        )


      await saveQuizResult(
        finalScore
      )


      setScore(
        finalScore
      )


      setFinished(true)

      return
    }


    setCurrentQuestion(
      previous =>
        previous + 1
    )


    setSelectedAnswer(null)

    setAnswered(false)

    setHint("")

    setHintError("")

  }


  // ========================================
  // RECOMMENCER
  // ========================================

  function restartQuiz() {

    loadQuestions()

  }


  // ========================================
  // CHARGEMENT
  // ========================================

  if (!questions.length) {

    return (

      <div className="quiz-game-page loading-page">

        <div className="loading-card">

          <div className="loading-icon">
            🧠
          </div>


          <h2>
            Préparation du quiz...
          </h2>


          <p>

            {loadingError
              ? loadingError
              : "Funia prépare les questions dans ta langue 🌍"}

          </p>


          {loadingError && (

            <button
              className="next-button"
              onClick={loadQuestions}
            >
              🔄 Réessayer
            </button>

          )}

        </div>

      </div>

    )

  }


  // ========================================
  // RESULTAT
  // ========================================

  if (finished) {

    return (

      <div className="quiz-game-page">

        <header className="quiz-game-navbar">

          <button
            className="quiz-back-button"
            onClick={onBack}
          >
            ← Quiz
          </button>


          <div className="quiz-game-logo">
            FUNIA 🎮
          </div>


          <div className="quiz-game-score">
            🏆 {score} / {questions.length}
          </div>

        </header>


        <main className="quiz-result">

          <div className="result-icon">

            {score === questions.length
              ? "🏆"
              : score >= questions.length / 2
                ? "🔥"
                : "💪"}

          </div>


          <p className="result-label">
            QUIZ TERMINÉ
          </p>


          <h1>

            {score === questions.length
              ? "Score parfait !"
              : score >= questions.length / 2
                ? "Bien joué !"
                : "Continue à t'entraîner !"}

          </h1>


          <div className="result-score">
            {score} / {questions.length}
          </div>


          <p className="result-message">
            Tu gagnes {score * 10} XP ⭐
          </p>


          <div className="result-actions">

            <button
              className="restart-button"
              onClick={restartQuiz}
            >
              🔄 Nouveau quiz
            </button>


            <button
              className="result-back-button"
              onClick={onFinish}
            >
              🏠 Dashboard
            </button>

          </div>


          <p
            style={{
              marginTop: "25px",
              fontSize: "11px",
              color: "#9aa2b1"
            }}
          >
            {translated
              ? `Questions traduites en ${language}.`
              : "Questions fournies par Open Trivia DB."}
          </p>

        </main>

      </div>

    )

  }


  // ========================================
  // QUESTION
  // ========================================

  const question =
    questions[currentQuestion]


  const progress =
    (
      (currentQuestion + 1) /
      questions.length
    ) * 100


  return (

    <div className="quiz-game-page">


      {/* NAVBAR */}

      <header className="quiz-game-navbar">

        <button
          className="quiz-back-button"
          onClick={onBack}
        >
          ← Quitter
        </button>


        <div className="quiz-game-logo">
          FUNIA 🎮
        </div>


        <div className="quiz-game-score">
          🏆 {score} pts
        </div>

      </header>


      <main className="quiz-game-content">


        {/* INFOS */}

        <div className="quiz-info">

          <span>
            {subject || "Quiz"}
          </span>


          <span>
            🌍 {language || "Français"}
          </span>


          <span>
            ⚡ {difficulty || "medium"}
          </span>

        </div>


        {/* PROGRESSION */}

        <div className="progress-container">

          <div className="progress-text">

            Question{" "}

            {currentQuestion + 1}

            {" / "}

            {questions.length}

          </div>


          <div className="progress-bar">

            <div
              className="progress-fill"
              style={{
                width:
                  `${progress}%`
              }}
            />

          </div>

        </div>


        {/* QUESTION */}

        <section className="question-card">

          <div className="question-number">
            QUESTION {currentQuestion + 1}
          </div>


          <h1>
            {question.question}
          </h1>


          {/* INDICE */}

          <button
            type="button"
            className="hint-button"
            onClick={askForHint}
            disabled={hintLoading}
          >

            {hintLoading
              ? "🤖 Funia AI réfléchit..."
              : "💡 Demander un indice à Funia AI"}

          </button>


          {hint && (

            <div className="ai-hint-box">

              <div className="ai-hint-title">
                🤖 Indice Funia AI
              </div>


              <p>
                {hint}
              </p>

            </div>

          )}


          {hintError && (

            <div className="ai-hint-error">
              ⚠️ {hintError}
            </div>

          )}


          {/* REPONSES */}

          <div className="answers">

            {question.answers.map(
              (answer, index) => {

                let className =
                  "answer-button"


                if (answered) {

                  if (
                    index ===
                    question.correct
                  ) {

                    className +=
                      " correct"

                  } else if (
                    index ===
                    selectedAnswer
                  ) {

                    className +=
                      " incorrect"

                  }

                }


                return (

                  <button
                    key={index}
                    className={className}
                    onClick={() =>
                      handleAnswer(index)
                    }
                    disabled={answered}
                  >

                    <span className="answer-letter">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>


                    <span className="answer-text">
                      {answer}
                    </span>


                    {answered &&
                      index ===
                      question.correct && (

                        <span className="answer-icon">
                          ✓
                        </span>

                    )}


                    {answered &&
                      index === selectedAnswer &&
                      index !== question.correct && (

                        <span className="answer-icon">
                          ✕
                        </span>

                    )}

                  </button>

                )

              }
            )}

          </div>


          {/* EXPLICATION */}

          {answered && (

            <div
              className={
                selectedAnswer ===
                question.correct
                  ? "explanation correct-box"
                  : "explanation incorrect-box"
              }
            >

              <strong>

                {selectedAnswer ===
                question.correct
                  ? "✅ Bonne réponse !"
                  : "❌ Mauvaise réponse"}

              </strong>


              <p>
                💡 {question.explanation}
              </p>

            </div>

          )}


          {/* SUIVANT */}

          {answered && (

            <button
              className="next-button"
              onClick={nextQuestion}
            >

              {currentQuestion ===
              questions.length - 1
                ? "Voir mon résultat 🏆"
                : "Question suivante →"}

            </button>

          )}

        </section>


        <p
          style={{
            textAlign: "center",
            fontSize: "10px",
            color: "#9aa2b1",
            marginTop: "15px"
          }}
        >
          Questions fournies par Open Trivia DB
        </p>

      </main>

    </div>
  )
}


export default QuizGame

