import { useState, useEffect } from "react"
import "./Games.css"

function Games({ onBack }) {

  const [selectedGame, setSelectedGame] = useState(null)

  // =========================
  // USER XP
  // =========================

  const [userXP, setUserXP] = useState(0)

  const userId = localStorage.getItem("user_id")

  useEffect(() => {

    if (!userId) return

    fetch(`http://127.0.0.1:8000/users/${userId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Impossible de récupérer le profil")
        }

        return res.json()
      })
      .then(data => {
        setUserXP(data.xp)
      })
      .catch(err => {
        console.error("Erreur XP :", err)
      })

  }, [userId])


  // =========================
  // ADD XP
  // =========================

  const addXP = async (amount) => {

    if (!userId || amount <= 0) return

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/users/${userId}/game-result?xp=${amount}`,
        {
          method: "POST"
        }
      )

      if (!response.ok) {
        throw new Error("Impossible d'ajouter les XP")
      }

      const data = await response.json()

      console.log(`Jeu terminé : +${amount} XP`)
      console.log("Nouveau total :", data.xp)

      setUserXP(data.xp)

    } catch (error) {

      console.error("Erreur enregistrement du jeu :", error)

    }
  }


  // =========================
  // MEMORY
  // =========================

  const createMemoryCards = () => {

    const symbols = ["🍎", "🚀", "⚽", "🎮", "🐱", "🔥"]

    return [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false
      }))
  }

  const [memoryCards, setMemoryCards] = useState(createMemoryCards)
  const [memoryFirst, setMemoryFirst] = useState(null)
  const [memoryLock, setMemoryLock] = useState(false)
  const [memoryScore, setMemoryScore] = useState(0)
  const [memoryRewarded, setMemoryRewarded] = useState(false)

  const handleMemoryClick = (index) => {

    if (memoryLock) return
    if (memoryCards[index].flipped) return
    if (memoryCards[index].matched) return

    const updatedCards = [...memoryCards]
    updatedCards[index].flipped = true

    setMemoryCards(updatedCards)

    if (memoryFirst === null) {

      setMemoryFirst(index)

    } else {

      const firstCard = memoryCards[memoryFirst]
      const secondCard = memoryCards[index]

      if (firstCard.symbol === secondCard.symbol) {

        updatedCards[memoryFirst].matched = true
        updatedCards[index].matched = true

        setMemoryCards(updatedCards)

        const newScore = memoryScore + 1

        setMemoryScore(newScore)
        setMemoryFirst(null)

        if (newScore === 6 && !memoryRewarded) {

          setMemoryRewarded(true)
          addXP(60)

        }

      } else {

        setMemoryLock(true)

        setTimeout(() => {

          const resetCards = [...updatedCards]

          resetCards[memoryFirst].flipped = false
          resetCards[index].flipped = false

          setMemoryCards(resetCards)
          setMemoryFirst(null)
          setMemoryLock(false)

        }, 800)
      }
    }
  }

  const resetMemory = () => {

    setMemoryCards(createMemoryCards())
    setMemoryFirst(null)
    setMemoryLock(false)
    setMemoryScore(0)
    setMemoryRewarded(false)

  }


  // =========================
  // GUESS NUMBER
  // =========================

  const generateNumber = () => {
    return Math.floor(Math.random() * 100) + 1
  }

  const [secretNumber, setSecretNumber] = useState(generateNumber)
  const [guess, setGuess] = useState("")
  const [guessMessage, setGuessMessage] = useState(
    "Devine un nombre entre 1 et 100."
  )
  const [guessAttempts, setGuessAttempts] = useState(0)
  const [guessFinished, setGuessFinished] = useState(false)

  const handleGuess = () => {

    const number = Number(guess)

    if (!number || number < 1 || number > 100) {

      setGuessMessage("Entre un nombre entre 1 et 100.")

      return
    }

    setGuessAttempts(guessAttempts + 1)

    if (number === secretNumber) {

      setGuessMessage(
        `🎉 Bravo ! Tu as trouvé en ${guessAttempts + 1} tentative(s).`
      )

      setGuessFinished(true)

      addXP(30)

    } else if (number < secretNumber) {

      setGuessMessage("⬆️ Trop petit !")

    } else {

      setGuessMessage("⬇️ Trop grand !")

    }

    setGuess("")
  }

  const resetGuess = () => {

    setSecretNumber(generateNumber())
    setGuess("")
    setGuessMessage("Devine un nombre entre 1 et 100.")
    setGuessAttempts(0)
    setGuessFinished(false)

  }


  // =========================
  // RAPID QUIZ
  // =========================

  const rapidQuestions = [
    {
      question: "Quelle est la capitale du Togo ?",
      answers: ["Lomé", "Kara", "Sokodé", "Atakpamé"],
      correct: 0
    },
    {
      question: "Combien font 9 × 7 ?",
      answers: ["54", "63", "72", "81"],
      correct: 1
    },
    {
      question: "Quel langage est utilisé avec React ?",
      answers: ["Python", "Java", "JavaScript", "C"],
      correct: 2
    },
    {
      question: "Quelle planète est appelée la planète rouge ?",
      answers: ["Mars", "Vénus", "Jupiter", "Mercure"],
      correct: 0
    },
    {
      question: "Combien de côtés possède un hexagone ?",
      answers: ["5", "6", "7", "8"],
      correct: 1
    }
  ]

  const [rapidQuestion, setRapidQuestion] = useState(0)
  const [rapidScore, setRapidScore] = useState(0)
  const [rapidAnswered, setRapidAnswered] = useState(false)
  const [rapidFinished, setRapidFinished] = useState(false)
  const [rapidRewarded, setRapidRewarded] = useState(false)

  const handleRapidAnswer = (index) => {

    if (rapidAnswered) return

    setRapidAnswered(true)

    const isCorrect =
      index === rapidQuestions[rapidQuestion].correct

    const newScore =
      rapidScore + (isCorrect ? 1 : 0)

    if (isCorrect) {
      setRapidScore(newScore)
    }

    setTimeout(() => {

      if (rapidQuestion === rapidQuestions.length - 1) {

        setRapidFinished(true)

        if (!rapidRewarded) {

          setRapidRewarded(true)

          const xpEarned = newScore * 10

          addXP(xpEarned)

        }

      } else {

        setRapidQuestion(rapidQuestion + 1)
        setRapidAnswered(false)

      }

    }, 700)
  }

  const resetRapid = () => {

    setRapidQuestion(0)
    setRapidScore(0)
    setRapidAnswered(false)
    setRapidFinished(false)
    setRapidRewarded(false)

  }


  // =========================
  // LOGIC GAME
  // =========================

  const logicQuestions = [
    {
      question: "Quelle est la suite : 2, 4, 8, 16, ?",
      answers: ["20", "24", "32", "36"],
      correct: 2
    },
    {
      question:
        "Si tous les chats sont des animaux et Miaou est un chat, alors Miaou est...",
      answers: ["Une plante", "Un animal", "Un objet", "Une voiture"],
      correct: 1
    },
    {
      question: "Quelle est la suite : 5, 10, 15, 20, ?",
      answers: ["22", "24", "25", "30"],
      correct: 2
    }
  ]

  const [logicQuestion, setLogicQuestion] = useState(0)
  const [logicScore, setLogicScore] = useState(0)
  const [logicAnswered, setLogicAnswered] = useState(false)
  const [logicFinished, setLogicFinished] = useState(false)
  const [logicRewarded, setLogicRewarded] = useState(false)

  const handleLogicAnswer = (index) => {

    if (logicAnswered) return

    setLogicAnswered(true)

    const isCorrect =
      index === logicQuestions[logicQuestion].correct

    const newScore =
      logicScore + (isCorrect ? 1 : 0)

    if (isCorrect) {
      setLogicScore(newScore)
    }

    setTimeout(() => {

      if (logicQuestion === logicQuestions.length - 1) {

        setLogicFinished(true)

        if (!logicRewarded) {

          setLogicRewarded(true)

          const xpEarned = newScore * 15

          addXP(xpEarned)

        }

      } else {

        setLogicQuestion(logicQuestion + 1)
        setLogicAnswered(false)

      }

    }, 700)
  }

  const resetLogic = () => {

    setLogicQuestion(0)
    setLogicScore(0)
    setLogicAnswered(false)
    setLogicFinished(false)
    setLogicRewarded(false)

  }


  // =========================
  // PAGE MEMORY
  // =========================

  if (selectedGame === "memory") {

    return (
      <div className="game-placeholder">

        <button
          className="games-back"
          onClick={() => setSelectedGame(null)}
        >
          ← Retour aux jeux
        </button>

        <div className="placeholder-card">

          <div className="placeholder-icon">
            🧠
          </div>

          <span className="placeholder-label">
            FUNIA • MEMORY
          </span>

          <h1>
            Memory
          </h1>

          <p>
            Trouve toutes les paires !
          </p>

          <div className="memory-score">
            Paires trouvées : {memoryScore} / 6
          </div>

          <div className="memory-grid">

            {memoryCards.map((card, index) => (

              <button
                key={card.id}
                className={
                  `memory-card ${
                    card.flipped || card.matched
                      ? "flipped"
                      : ""
                  }`
                }
                onClick={() => handleMemoryClick(index)}
              >

                {card.flipped || card.matched
                  ? card.symbol
                  : "?"}

              </button>

            ))}

          </div>

          {memoryScore === 6 && (

            <div className="game-success">
              🏆 Bravo ! Tu as trouvé toutes les paires !
              <br />
              +60 XP
            </div>

          )}

          <button
            className="restart-game"
            onClick={resetMemory}
          >
            🔄 Recommencer
          </button>

        </div>

      </div>
    )
  }


  // =========================
  // PAGE GUESS NUMBER
  // =========================

  if (selectedGame === "guess") {

    return (
      <div className="game-placeholder">

        <button
          className="games-back"
          onClick={() => setSelectedGame(null)}
        >
          ← Retour aux jeux
        </button>

        <div className="placeholder-card">

          <div className="placeholder-icon">
            🔢
          </div>

          <span className="placeholder-label">
            FUNIA • GUESS NUMBER
          </span>

          <h1>
            Guess Number
          </h1>

          <p>
            Devine le nombre entre 1 et 100.
          </p>

          <div className="guess-box">

            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGuess()
                }
              }}
              placeholder="Ton nombre..."
              disabled={guessFinished}
            />

            <button
              onClick={handleGuess}
              disabled={guessFinished}
            >
              Deviner
            </button>

          </div>

          <div className="game-message">
            {guessMessage}
          </div>

          <p>
            Tentatives : {guessAttempts}
          </p>

          {guessFinished && (

            <>
              <p>
                🏆 +30 XP
              </p>

              <button
                className="restart-game"
                onClick={resetGuess}
              >
                🔄 Nouvelle partie
              </button>
            </>

          )}

        </div>

      </div>
    )
  }


  // =========================
  // PAGE RAPID QUIZ
  // =========================

  if (selectedGame === "rapid") {

    if (rapidFinished) {

      return (
        <div className="game-placeholder">

          <button
            className="games-back"
            onClick={() => setSelectedGame(null)}
          >
            ← Retour aux jeux
          </button>

          <div className="placeholder-card">

            <div className="placeholder-icon">
              ⚡
            </div>

            <span className="placeholder-label">
              RAPID QUIZ • TERMINÉ
            </span>

            <h1>
              Bien joué !
            </h1>

            <div className="game-final-score">
              {rapidScore} / {rapidQuestions.length}
            </div>

            <p>
              Tu as obtenu {rapidScore} bonne
              {rapidScore > 1 ? "s" : ""} réponse
              {rapidScore > 1 ? "s" : ""}.
            </p>

            <p>
              🏆 +{rapidScore * 10} XP
            </p>

            <button
              className="restart-game"
              onClick={resetRapid}
            >
              🔄 Recommencer
            </button>

          </div>

        </div>
      )
    }

    const current = rapidQuestions[rapidQuestion]

    return (
      <div className="game-placeholder">

        <button
          className="games-back"
          onClick={() => setSelectedGame(null)}
        >
          ← Retour aux jeux
        </button>

        <div className="placeholder-card">

          <div className="placeholder-icon">
            ⚡
          </div>

          <span className="placeholder-label">
            RAPID QUIZ
          </span>

          <h1>
            Question {rapidQuestion + 1} / {rapidQuestions.length}
          </h1>

          <h2>
            {current.question}
          </h2>

          <div className="mini-answer-grid">

            {current.answers.map((answer, index) => (

              <button
                key={index}
                className={
                  rapidAnswered &&
                  index === current.correct
                    ? "mini-answer correct"
                    : "mini-answer"
                }
                onClick={() => handleRapidAnswer(index)}
                disabled={rapidAnswered}
              >
                {String.fromCharCode(65 + index)}. {answer}
              </button>

            ))}

          </div>

          <p>
            Score : {rapidScore}
          </p>

        </div>

      </div>
    )
  }


  // =========================
  // PAGE LOGIC GAME
  // =========================

  if (selectedGame === "logic") {

    if (logicFinished) {

      return (
        <div className="game-placeholder">

          <button
            className="games-back"
            onClick={() => setSelectedGame(null)}
          >
            ← Retour aux jeux
          </button>

          <div className="placeholder-card">

            <div className="placeholder-icon">
              🧩
            </div>

            <span className="placeholder-label">
              LOGIC GAME • TERMINÉ
            </span>

            <h1>
              Résultat
            </h1>

            <div className="game-final-score">
              {logicScore} / {logicQuestions.length}
            </div>

            <p>
              Ton score de logique.
            </p>

            <p>
              🏆 +{logicScore * 15} XP
            </p>

            <button
              className="restart-game"
              onClick={resetLogic}
            >
              🔄 Recommencer
            </button>

          </div>

        </div>
      )
    }

    const current = logicQuestions[logicQuestion]

    return (
      <div className="game-placeholder">

        <button
          className="games-back"
          onClick={() => setSelectedGame(null)}
        >
          ← Retour aux jeux
        </button>

        <div className="placeholder-card">

          <div className="placeholder-icon">
            🧩
          </div>

          <span className="placeholder-label">
            LOGIC GAME
          </span>

          <h1>
            Question {logicQuestion + 1} / {logicQuestions.length}
          </h1>

          <h2>
            {current.question}
          </h2>

          <div className="mini-answer-grid">

            {current.answers.map((answer, index) => (

              <button
                key={index}
                className={
                  logicAnswered &&
                  index === current.correct
                    ? "mini-answer correct"
                    : "mini-answer"
                }
                onClick={() => handleLogicAnswer(index)}
                disabled={logicAnswered}
              >
                {String.fromCharCode(65 + index)}. {answer}
              </button>

            ))}

          </div>

          <p>
            Score : {logicScore}
          </p>

        </div>

      </div>
    )
  }


  // =========================
  // LISTE DES JEUX
  // =========================

  const games = [
    {
      id: "memory",
      icon: "🧠",
      title: "Memory",
      description:
        "Retrouve les paires et entraîne ta mémoire.",
      color: "blue"
    },
    {
      id: "guess",
      icon: "🔢",
      title: "Guess Number",
      description:
        "Devine le nombre caché entre 1 et 100.",
      color: "red"
    },
    {
      id: "rapid",
      icon: "⚡",
      title: "Rapid Quiz",
      description:
        "Réponds rapidement à une série de questions.",
      color: "green"
    },
    {
      id: "logic",
      icon: "🧩",
      title: "Logic Game",
      description:
        "Résous des problèmes et teste ta logique.",
      color: "blue"
    }
  ]


  return (
    <div className="games-page">

      <header className="games-navbar">

        <button
          className="games-back"
          onClick={onBack}
        >
          ← Retour
        </button>

        <div className="games-logo">
          FUNIA 🎮
        </div>

        <div className="games-xp">
          🏆 {userXP} XP
        </div>

      </header>


      <main className="games-container">

        <section className="games-header">

          <span className="games-badge">
            🎮 MODE MINI-JEUX
          </span>

          <h1>
            Joue.
            <br />
            <span>Teste-toi.</span>
          </h1>

          <p>
            Choisis un jeu et montre ce que tu sais faire.
          </p>

        </section>


        <section className="games-grid">

          {games.map((game) => (

            <button
              key={game.id}
              className={`game-card ${game.color}`}
              onClick={() => setSelectedGame(game.id)}
            >

              <div className="game-card-top">

                <div className="game-icon">
                  {game.icon}
                </div>

                <span className="game-arrow">
                  →
                </span>

              </div>


              <div className="game-card-content">

                <h2>
                  {game.title}
                </h2>

                <p>
                  {game.description}
                </p>

              </div>


              <div className="game-card-footer">

                Jouer maintenant

                <span>
                  →
                </span>

              </div>

            </button>

          ))}

        </section>

      </main>

    </div>
  )
}

export default Games