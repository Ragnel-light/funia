import { useEffect, useState } from "react"
import "./Challenges.css"

function Challenges({ onBack }) {

  const [user, setUser] = useState(null)
  const [claimedChallenges, setClaimedChallenges] = useState([])

  const userId = localStorage.getItem("user_id")

  useEffect(() => {

    if (!userId) return

    fetch(`https://funia.onrender.com/users/${userId}`)
      .then(res => {

        if (!res.ok) {
          throw new Error("Impossible de récupérer les données.")
        }

        return res.json()
      })
      .then(data => {
        setUser(data)
      })
      .catch(error => {
        console.error("Erreur Challenges :", error)
      })

    const saved =
      JSON.parse(
        localStorage.getItem(
          `funia_claimed_challenges_${userId}`
        ) || "[]"
      )

    setClaimedChallenges(saved)

  }, [userId])


  const challenges = user
    ? [
        {
          id: "first_quiz",
          icon: "🧠",
          title: "Premier quiz",
          description: "Termine ton premier quiz.",
          reward: 20,
          completed: user.quizzes_played >= 1
        },
        {
          id: "first_game",
          icon: "🎮",
          title: "Premier jeu",
          description: "Termine ton premier mini-jeu.",
          reward: 20,
          completed: user.games_played >= 1
        },
        {
          id: "xp_100",
          icon: "⭐",
          title: "Cap des 100 XP",
          description: "Atteins 100 XP.",
          reward: 50,
          completed: user.xp >= 100
        },
        {
          id: "five_quizzes",
          icon: "🔥",
          title: "Série de quiz",
          description: "Termine 5 quiz.",
          reward: 50,
          completed: user.quizzes_played >= 5
        },
        {
          id: "score_five",
          icon: "🏆",
          title: "Bon score",
          description: "Obtiens au moins 5 bonnes réponses dans un quiz.",
          reward: 75,
          completed: user.best_quiz_score >= 5
        },
        {
          id: "xp_500",
          icon: "💎",
          title: "500 XP",
          description: "Atteins 500 XP.",
          reward: 100,
          completed: user.xp >= 500
        }
      ]
    : []


  const claimReward = async (challenge) => {

    if (!challenge.completed) {
      return
    }

    if (claimedChallenges.includes(challenge.id)) {
      return
    }

    try {

      const response = await fetch(
        `https://funia.onrender.com/users/${userId}/add-xp?xp=${challenge.reward}`,
        {
          method: "POST"
        }
      )

      if (!response.ok) {
        throw new Error("Impossible de récupérer la récompense.")
      }

      const data = await response.json()

      const newClaimed = [
        ...claimedChallenges,
        challenge.id
      ]

      setClaimedChallenges(newClaimed)

      localStorage.setItem(
        `funia_claimed_challenges_${userId}`,
        JSON.stringify(newClaimed)
      )

      setUser(prev => ({
        ...prev,
        xp: data.xp,
        coins: data.coins
      }))

    } catch (error) {

      console.error(
        "Erreur récompense :",
        error
      )

    }
  }


  const badges = user
    ? [
        {
          id: "badge_quiz",
          icon: "🧠",
          title: "Esprit curieux",
          description: "Ton premier quiz",
          unlocked: user.quizzes_played >= 1
        },
        {
          id: "badge_game",
          icon: "🎮",
          title: "Joueur",
          description: "Ton premier mini-jeu",
          unlocked: user.games_played >= 1
        },
        {
          id: "badge_xp100",
          icon: "⭐",
          title: "Premiers pas",
          description: "100 XP atteints",
          unlocked: user.xp >= 100
        },
        {
          id: "badge_quiz5",
          icon: "🔥",
          title: "Acharné",
          description: "5 quiz terminés",
          unlocked: user.quizzes_played >= 5
        },
        {
          id: "badge_score",
          icon: "🏆",
          title: "Bon niveau",
          description: "Score de 5 ou plus",
          unlocked: user.best_quiz_score >= 5
        },
        {
          id: "badge_xp500",
          icon: "💎",
          title: "Expert",
          description: "500 XP atteints",
          unlocked: user.xp >= 500
        }
      ]
    : []


  if (!user) {

    return (
      <div className="challenges-loading">
        Chargement...
      </div>
    )

  }


  const level =
    Math.floor(user.xp / 100) + 1

  const progress =
    user.xp % 100


  return (
    <div className="challenges-page">

      <header className="challenges-navbar">

        <button
          className="challenges-back"
          onClick={onBack}
        >
          ← Retour
        </button>

        <div className="challenges-logo">
          FUNIA 🏆
        </div>

        <div className="challenges-xp">
          ⭐ {user.xp} XP
        </div>

      </header>


      <main className="challenges-container">

        <section className="challenges-hero">

          <div>

            <span className="challenges-badge">
              FUNIA • DÉFIS
            </span>

            <h1>
              Dépasse-toi.
              <br />
              <span>Gagne des récompenses.</span>
            </h1>

            <p>
              Termine des objectifs, gagne de l'XP
              et débloque de nouveaux badges.
            </p>

          </div>


          <div className="level-card">

            <span>
              Niveau actuel
            </span>

            <strong>
              {level}
            </strong>

            <div className="level-progress">

              <div
                style={{
                  width: `${progress}%`
                }}
              />

            </div>

            <small>
              {progress} / 100 XP vers le prochain niveau
            </small>

          </div>

        </section>


        <section className="challenge-section">

          <div className="section-heading">

            <div>
              <h2>
                🎯 Tes défis
              </h2>

              <p>
                Complète les objectifs pour gagner de l'XP.
              </p>
            </div>

          </div>


          <div className="challenge-grid">

            {challenges.map(challenge => {

              const claimed =
                claimedChallenges.includes(
                  challenge.id
                )

              return (

                <div
                  key={challenge.id}
                  className={
                    `challenge-card ${
                      challenge.completed
                        ? "completed"
                        : ""
                    } ${
                      claimed
                        ? "claimed"
                        : ""
                    }`
                  }
                >

                  <div className="challenge-top">

                    <div className="challenge-icon">
                      {challenge.icon}
                    </div>

                    {challenge.completed && (
                      <span className="challenge-status">
                        {claimed
                          ? "✓ Réclamé"
                          : "✓ Terminé"}
                      </span>
                    )}

                  </div>


                  <h3>
                    {challenge.title}
                  </h3>

                  <p>
                    {challenge.description}
                  </p>


                  <div className="challenge-bottom">

                    <strong>
                      +{challenge.reward} XP
                    </strong>


                    {challenge.completed && !claimed ? (

                      <button
                        onClick={() =>
                          claimReward(challenge)
                        }
                      >
                        Réclamer
                      </button>

                    ) : claimed ? (

                      <button
                        className="claimed-button"
                        disabled
                      >
                        Récompense obtenue
                      </button>

                    ) : (

                      <span className="locked">
                        🔒 Verrouillé
                      </span>

                    )}

                  </div>

                </div>

              )

            })}

          </div>

        </section>


        <section className="badge-section">

          <div className="section-heading">

            <div>

              <h2>
                🏅 Tes badges
              </h2>

              <p>
                Continue à jouer pour tous les débloquer.
              </p>

            </div>

          </div>


          <div className="badge-grid">

            {badges.map(badge => (

              <div
                key={badge.id}
                className={
                  `badge-card ${
                    badge.unlocked
                      ? "unlocked"
                      : "locked-badge"
                  }`
                }
              >

                <div className="badge-icon">
                  {badge.unlocked
                    ? badge.icon
                    : "🔒"}
                </div>

                <h3>
                  {badge.title}
                </h3>

                <p>
                  {badge.description}
                </p>

                <span>
                  {badge.unlocked
                    ? "Débloqué ✓"
                    : "À débloquer"}
                </span>

              </div>

            ))}

          </div>

        </section>

      </main>

    </div>
  )
}

export default Challenges