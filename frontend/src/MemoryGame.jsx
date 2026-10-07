import { useEffect, useState } from "react"
import "./MemoryGame.css"

const SYMBOLS = [
  "🚀",
  "🎮",
  "🧠",
  "⚡",
  "🌍",
  "🏆",
  "🔥",
  "💻"
]


function shuffle(array) {
  return [...array].sort(
    () => Math.random() - 0.5
  )
}


function createCards() {

  const pairs = [
    ...SYMBOLS,
    ...SYMBOLS
  ]

  return shuffle(pairs).map(
    (symbol, index) => ({
      id: index,
      symbol,
      flipped: false,
      matched: false
    })
  )
}


function MemoryGame({ onBack }) {

  const [cards, setCards] =
    useState(createCards)

  const [firstCard, setFirstCard] =
    useState(null)

  const [secondCard, setSecondCard] =
    useState(null)

  const [moves, setMoves] =
    useState(0)

  const [score, setScore] =
    useState(0)

  const [locked, setLocked] =
    useState(false)

  const [finished, setFinished] =
    useState(false)

  const [rewardSaved, setRewardSaved] =
    useState(false)


  // ========================================
  // CLIQUER SUR UNE CARTE
  // ========================================

  const handleCardClick = (card) => {

    if (
      locked ||
      card.flipped ||
      card.matched ||
      card.id === firstCard?.id
    ) {
      return
    }

    const updatedCards =
      cards.map((item) =>
        item.id === card.id
          ? {
              ...item,
              flipped: true
            }
          : item
      )

    setCards(updatedCards)

    if (!firstCard) {

      setFirstCard({
        ...card,
        flipped: true
      })

      return
    }

    setSecondCard({
      ...card,
      flipped: true
    })

    setLocked(true)

    setMoves(
      (previous) =>
        previous + 1
    )
  }


  // ========================================
  // VERIFIER LES PAIRES
  // ========================================

  useEffect(() => {

    if (
      !firstCard ||
      !secondCard
    ) {
      return
    }

    if (
      firstCard.symbol ===
      secondCard.symbol
    ) {

      setCards(
        (previousCards) =>
          previousCards.map(
            (card) =>
              card.symbol ===
              firstCard.symbol
                ? {
                    ...card,
                    matched: true,
                    flipped: true
                  }
                : card
          )
      )

      setScore(
        (previous) =>
          previous + 100
      )

      setFirstCard(null)
      setSecondCard(null)
      setLocked(false)

      return
    }

    const timer =
      setTimeout(() => {

        setCards(
          (previousCards) =>
            previousCards.map(
              (card) =>
                card.id === firstCard.id ||
                card.id === secondCard.id
                  ? {
                      ...card,
                      flipped: false
                    }
                  : card
            )
        )

        setFirstCard(null)
        setSecondCard(null)
        setLocked(false)

      }, 800)

    return () =>
      clearTimeout(timer)

  }, [
    firstCard,
    secondCard
  ])


  // ========================================
  // FIN DU JEU
  // ========================================

  useEffect(() => {

    const allMatched =
      cards.every(
        (card) => card.matched
      )

    if (
      allMatched &&
      cards.length > 0 &&
      !finished
    ) {

      setFinished(true)

    }

  }, [
    cards,
    finished
  ])


  // ========================================
  // ENREGISTRER LA PARTIE
  // ========================================

  useEffect(() => {

    if (
      !finished ||
      rewardSaved
    ) {
      return
    }

    const token =
      localStorage.getItem(
        "access_token"
      )

    if (!token) {

      console.error(
        "Utilisateur non connecté."
      )

      return
    }

    let cancelled = false


    async function saveGameResult() {

      try {

        /*
         * Le score est maintenant envoyé
         * au backend avec le JWT.
         *
         * Le backend vérifie l'utilisateur.
         */

        const response =
          await fetch(
            `https://funia.onrender.com/users/me/game-result?score=${encodeURIComponent(score)}`,
            {
              method: "POST",

              headers: {
                "Accept":
                  "application/json",

                "Authorization":
                  `Bearer ${token}`
              }
            }
          )


        if (
          response.status === 401
        ) {

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
            "Impossible d'enregistrer le jeu."
          )

        }


        if (!cancelled) {

          setRewardSaved(true)

          // Synchroniser les données locales
          if (
            data?.xp !== undefined
          ) {

            localStorage.setItem(
              "xp",
              String(data.xp)
            )

          }

          if (
            data?.level !== undefined
          ) {

            localStorage.setItem(
              "level",
              String(data.level)
            )

          }

          console.log(
            "Memory enregistré :",
            data
          )

        }

      } catch (error) {

        console.error(
          "Erreur enregistrement Memory :",
          error
        )

      }

    }


    saveGameResult()


    return () => {
      cancelled = true
    }

  }, [
    finished,
    rewardSaved,
    score
  ])


  // ========================================
  // RECOMMENCER
  // ========================================

  const restartGame = () => {

    setCards(
      createCards()
    )

    setFirstCard(null)

    setSecondCard(null)

    setMoves(0)

    setScore(0)

    setLocked(false)

    setFinished(false)

    setRewardSaved(false)
  }


  // ========================================
  // ECRAN DE FIN
  // ========================================

  if (finished) {

    return (

      <div className="memory-page">

        <header className="memory-navbar">

          <button
            className="memory-back"
            onClick={onBack}
          >
            ← Retour
          </button>

          <div className="memory-logo">
            FUNIA 🎮
          </div>

          <div className="memory-stats">
            🏆 {score} XP
          </div>

        </header>


        <main className="memory-result">

          <div className="memory-result-icon">
            🧠🏆
          </div>

          <span className="memory-label">
            MEMORY TERMINÉ
          </span>

          <h1>
            Bravo !
          </h1>

          <p>
            Tu as retrouvé toutes les paires.
          </p>


          <div className="result-stats">

            <div>
              <strong>
                {moves}
              </strong>

              <span>
                Coups
              </span>
            </div>


            <div>
              <strong>
                {score}
              </strong>

              <span>
                XP
              </span>
            </div>

          </div>


          <div className="memory-actions">

            <button
              className="restart-memory"
              onClick={restartGame}
            >
              🔄 Rejouer
            </button>


            <button
              className="back-memory"
              onClick={onBack}
            >
              ← Autres jeux
            </button>

          </div>

        </main>

      </div>

    )
  }


  // ========================================
  // JEU
  // ========================================

  return (

    <div className="memory-page">

      <header className="memory-navbar">

        <button
          className="memory-back"
          onClick={onBack}
        >
          ← Retour
        </button>


        <div className="memory-logo">
          FUNIA 🎮
        </div>


        <div className="memory-stats">
          🏆 {score} XP
        </div>

      </header>


      <main className="memory-container">

        <section className="memory-header">

          <span className="memory-badge">
            🧠 MINI-JEU
          </span>

          <h1>
            Memory
          </h1>

          <p>
            Retrouve toutes les paires.
          </p>

        </section>


        <div className="memory-info">

          <div>

            <span>
              COUPS
            </span>

            <strong>
              {moves}
            </strong>

          </div>


          <div>

            <span>
              XP
            </span>

            <strong>
              {score}
            </strong>

          </div>


          <div>

            <span>
              PAIRES
            </span>

            <strong>

              {
                cards.filter(
                  (card) =>
                    card.matched
                ).length / 2
              }

              /8

            </strong>

          </div>

        </div>


        <section className="memory-board">

          {cards.map(
            (card) => (

              <button
                key={card.id}

                className={
                  `memory-card ${
                    card.flipped ||
                    card.matched
                      ? "flipped"
                      : ""
                  } ${
                    card.matched
                      ? "matched"
                      : ""
                  }`
                }

                onClick={() =>
                  handleCardClick(card)
                }

                disabled={
                  locked ||
                  card.flipped ||
                  card.matched
                }
              >

                <div className="card-inner">

                  <div className="card-front">
                    ?
                  </div>

                  <div className="card-back">
                    {card.symbol}
                  </div>

                </div>

              </button>

            )
          )}

        </section>


        <button
          className="reset-memory"
          onClick={restartGame}
        >
          🔄 Recommencer
        </button>

      </main>

    </div>

  )
}


export default MemoryGame