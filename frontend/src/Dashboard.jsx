
import { useEffect, useState } from "react"
import "./Dashboard.css"

function Dashboard({
  username,
  onHome,
  onQuiz,
  onGames,
  onCulture,
  onChallenges,
  onProfile,
  onAI,
  onLogout
}) {

  const [user, setUser] = useState(null)

  const userId = localStorage.getItem("user_id")


  // =========================
  // CHARGEMENT UTILISATEUR
  // =========================

  useEffect(() => {

    if (!userId) {
      return
    }

    fetch(`http://127.0.0.1:8000/users/${userId}`)
      .then(response => {

        if (!response.ok) {
          throw new Error(
            `Erreur serveur : ${response.status}`
          )
        }

        return response.json()
      })
      .then(data => {

        console.log("Utilisateur Dashboard :", data)

        setUser(data)

      })
      .catch(error => {

        console.error(
          "Erreur Dashboard :",
          error
        )

      })

  }, [userId])


  // =========================
  // CHARGEMENT
  // =========================

  if (!user) {

    return (
      <div className="loading-profile">
        Chargement...
      </div>
    )

  }


  // =========================
  // XP
  // =========================

  const xp = Number(user.xp || 0)

  const level =
    Math.floor(xp / 100) + 1


  // =========================
  // DASHBOARD
  // =========================

  return (

    <div className="dashboard">

      {/* =================================
          NAVBAR
      ================================= */}

      <header className="dashboard-navbar">

        <div
          className="dashboard-logo"
          onClick={onHome}
        >
          FUNIA 🎮
        </div>


        <div className="dashboard-nav">

          <button onClick={onHome}>
            🏠 Accueil
          </button>


          <button onClick={onProfile}>
            👤 Profil
          </button>


          {/* =============================
              FUNIA AI
          ============================= */}

          <button
            type="button"
            onClick={() => {

              console.log("BOUTON FUNIA AI")

              if (onAI) {
                onAI()
              }

            }}
          >
            🤖 Funia AI
          </button>


          <button onClick={onLogout}>
            🚪 Déconnexion
          </button>


          <div className="user-info">
            👋 {user.username || username || "Joueur"}
          </div>

        </div>

      </header>


      {/* =================================
          CONTENU
      ================================= */}

      <main className="dashboard-content">


        {/* =================================
            BIENVENUE
        ================================= */}

        <section className="dashboard-welcome">

          <p className="dashboard-label">
            FUNIA • TON ESPACE
          </p>


          <h1>

            Bienvenue{" "}

            <span>
              {user.username || username || "Joueur"}
            </span>{" "}

            👋

          </h1>


          <p>
            Alors, on fait quoi aujourd'hui ?
          </p>

        </section>


        {/* =================================
            STATISTIQUES
        ================================= */}

        <section className="player-stats">


          <div className="stat-card">

            <span>
              ⭐
            </span>

            <small>
              NIVEAU
            </small>

            <strong>
              {level}
            </strong>

          </div>


          <div className="stat-card">

            <span>
              🔥
            </span>

            <small>
              XP
            </small>

            <strong>
              {xp}
            </strong>

          </div>


          <div className="stat-card">

            <span>
              🎮
            </span>

            <small>
              MODE
            </small>

            <strong>
              Fun
            </strong>

          </div>

        </section>


        {/* =================================
            CARTES PRINCIPALES
        ================================= */}

        <section className="dashboard-grid">


          {/* =================================
              QUIZ
          ================================= */}

          <button
            type="button"
            className="dashboard-card blue"
            onClick={onQuiz}
          >

            <div className="dashboard-icon">
              🧠
            </div>


            <h2>
              Quiz
            </h2>


            <p>
              Teste tes connaissances
              dans plusieurs matières.
            </p>


            <span>
              Jouer →
            </span>

          </button>


          {/* =================================
              MINI-JEUX
          ================================= */}

          <button
            type="button"
            className="dashboard-card red"
            onClick={onGames}
          >

            <div className="dashboard-icon">
              🎮
            </div>


            <h2>
              Mini-jeux
            </h2>


            <p>
              Des jeux rapides pour
              tester tes réflexes.
            </p>


            <span>
              Jouer →
            </span>

          </button>


          {/* =================================
              CULTURE
          ================================= */}

          <button
            type="button"
            className="dashboard-card green"
            onClick={onCulture}
          >

            <div className="dashboard-icon">
              🌍
            </div>


            <h2>
              Culture générale
            </h2>


            <p>
              Découvre le monde et
              développe tes connaissances.
            </p>


            <span>
              Découvrir →
            </span>

          </button>


          {/* =================================
              DÉFIS
          ================================= */}

          <button
            type="button"
            className="dashboard-card yellow"
            onClick={onChallenges}
          >

            <div className="dashboard-icon">
              🏆
            </div>


            <h2>
              Défis
            </h2>


            <p>
              Relève des challenges
              et bats tes records.
            </p>


            <span>
              Voir les défis →
            </span>

          </button>


          {/* =================================
              FUNIA AI
          ================================= */}

          <button
            type="button"
            className="dashboard-card ai"
            onClick={() => {

              console.log(
                "Ouverture de Funia AI"
              )

              if (onAI) {
                onAI()
              }

            }}
          >

            <div className="dashboard-icon">
              🤖
            </div>


            <h2>
              Funia AI
            </h2>


            <p>
              Pose tes questions, demande
              des explications et apprends
              avec ton assistant intelligent.
            </p>


            <span>
              Parler à l'IA →
            </span>

          </button>


        </section>

      </main>

    </div>
  )
}


export default Dashboard

