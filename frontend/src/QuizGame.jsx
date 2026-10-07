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

  const [quizId, setQuizId] = useState(null)

  const [currentQuestion, setCurrentQuestion] = useState(0)

  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const [userAnswers, setUserAnswers] = useState({})

  const [score, setScore] = useState(0)

  const [answered, setAnswered] = useState(false)

  const [finished, setFinished] = useState(false)

  const [loadingError, setLoadingError] = useState("")

  const [hint, setHint] = useState("")

  const [hintLoading, setHintLoading] = useState(false)

  const [hintError, setHintError] = useState("")

  const [translated, setTranslated] = useState(false)

  const [checkingQuiz, setCheckingQuiz] = useState(false)

  const [serverResult, setServerResult] = useState(null)


  // ========================================
  // CHARGER QUESTIONS
  // ========================================

  async function loadQuestions() {

    setLoadingError("")
    setQuestions([])
    setQuizId(null)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setUserAnswers({})
    setScore(0)
    setAnswered(false)
    setFinished(false)
    setHint("")
    setHintError("")
    setTranslated(false)
    setCheckingQuiz(false)
    setServerResult(null)

    const count = Math.min(
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

    const token =
      localStorage.getItem("access_token")

    if (!token) {

      setLoadingError(
        "Tu dois être connecté pour jouer à un quiz."
      )

      return
    }

    try {

      const params = new URLSearchParams({

        subject: selectedSubject,

        difficulty: selectedDifficulty,

        amount: String(count),

        language: selectedLanguage,

        country: selectedCountry

      })

      const response = await fetch(
        `https://funia.onrender.com/trivia/questions?${params.toString()}`,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 401) {

        localStorage.removeItem(
          "access_token"
        )

        localStorage.removeItem(
          "user_id"
        )

        throw new Error(
          "Ta session a expiré. Reconnecte-toi."
        )
      }

      const data =
        await response.json().catch(() => null)

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Impossible de récupérer les questions."
        )
      }

      if (!data?.quiz_id) {

        throw new Error(
          "Le serveur n'a pas créé la session du quiz."
        )
      }

      if (!data.questions?.length) {

        throw new Error(
          "Aucune question disponible."
        )
      }

      setQuizId(data.quiz_id)

      setQuestions(data.questions)

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

      const response = await fetch(
        "https://funia.onrender.com/ai/hint",
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
        await response.json().catch(() => null)

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Impossible d'obtenir un indice."
        )
      }

      setHint(
        data?.hint ||
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

    setUserAnswers(previous => ({
      ...previous,
      [question.question_id]: index
    }))
  }


  // ========================================
  // ENVOYER LE QUIZ AU SERVEUR
  // ========================================

  async function submitQuiz() {

    if (!quizId || checkingQuiz) {
      return null
    }

    const token =
      localStorage.getItem("access_token")

    if (!token) {

      setLoadingError(
        "Ta session a expiré. Reconnecte-toi."
      )

      return null
    }

    setCheckingQuiz(true)

    try {

      const response = await fetch(
        `https://funia.onrender.com/trivia/questions/check?quiz_id=${encodeURIComponent(quizId)}`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            answers: userAnswers
          })
        }
      )

      if (response.status === 401) {

        localStorage.removeItem(
          "access_token"
        )

        localStorage.removeItem(
          "user_id"
        )

        throw new Error(
          "Ta session a expiré. Reconnecte-toi."
        )
      }

      const data =
        await response
          .json()
          .catch(() => null)

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Impossible de vérifier le quiz."
        )
      }

      setScore(data.score)

      setServerResult(data)

      return data

    } catch (error) {

      console.error(
        "Erreur vérification quiz :",
        error
      )

      setLoadingError(
        error.message ||
        "Impossible de vérifier le quiz."
      )

      return null

    } finally {

      setCheckingQuiz(false)
    }
  }


  // ========================================
  // SAUVEGARDER LE RESULTAT
  // ========================================

  async function saveQuizResult(finalScore) {

    const token =
      localStorage.getItem("access_token")

    if (!token) {

      console.error(
        "Utilisateur non connecté."
      )

      return null
    }

    try {

      const response = await fetch(
        `https://funia.onrender.com/users/me/quiz-result?score=${encodeURIComponent(finalScore)}`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            Authorization:
              `Bearer ${token}`
          }
        }
      )

      if (response.status === 401) {

        localStorage.removeItem(
          "access_token"
        )

        localStorage.removeItem(
          "user_id"
        )

        throw new Error(
          "Session expirée."
        )
      }

      const data =
        await response
          .json()
          .catch(() => null)

      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Impossible d'enregistrer le résultat."
        )
      }

      if (data?.xp !== undefined) {

        localStorage.setItem(
          "xp",
          String(data.xp)
        )
      }

      if (data?.level !== undefined) {

        localStorage.setItem(
          "level",
          String(data.level)
        )
      }

      return data

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

    if (!answered || checkingQuiz) {
      return
    }

    if (
      currentQuestion >=
      questions.length - 1
    ) {

      const result =
        await submitQuiz()

      if (!result) {
        return
      }

      await saveQuizResult(
        result.score
      )

      setScore(
        result.score
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

    const total =
      serverResult?.total ||
      questions.length

    const finalScore =
      serverResult?.score ??
      score

    const percentage =
      total > 0
        ? (finalScore / total) * 100
        : 0

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
            🏆 {finalScore} / {total}
          </div>

        </header>

        <main className="quiz-result">

          <div className="result-icon">

            {percentage === 100
              ? "🏆"
              : percentage >= 50
                ? "🔥"
                : "💪"}

          </div>

          <p className="result-label">
            QUIZ TERMINÉ
          </p>

          <h1>

            {percentage === 100
              ? "Score parfait !"
              : percentage >= 50
                ? "Bien joué !"
                : "Continue à t'entraîner !"}

          </h1>

          <div className="result-score">
            {finalScore} / {total}
          </div>

          <p className="result-message">
            Tu gagnes {finalScore * 10} XP ⭐
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
  // QUESTION ACTUELLE
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


        <section className="question-card">

          <div className="question-number">
            QUESTION {currentQuestion + 1}
          </div>


          <h1>
            {question.question}
          </h1>


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


          <div className="answers">

            {question.answers.map(
              (answer, index) => {

                let className =
                  "answer-button"

                /*
                 * Le frontend ne connaît plus
                 * la bonne réponse.
                 *
                 * On montre simplement la réponse
                 * choisie par l'utilisateur.
                 */

                if (
                  answered &&
                  index === selectedAnswer
                ) {

                  className +=
                    " selected"
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

                  </button>
                )
              }
            )}

          </div>


          {answered && (

            <div className="explanation">

              <strong>
                Réponse enregistrée ✓
              </strong>

              <p>
                🧠 Le serveur vérifiera ta réponse
                à la fin du quiz.
              </p>

            </div>
          )}


          {answered && (

            <button
              className="next-button"
              onClick={nextQuestion}
              disabled={checkingQuiz}
            >

              {checkingQuiz
                ? "🔐 Vérification..."
                : currentQuestion ===
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