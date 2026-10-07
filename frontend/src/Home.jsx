import "./Home.css"

function Home() {
  const username = localStorage.getItem("username") || "Joueur"

  const logout = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <header className="dashboard-navbar">

        <div className="dashboard-logo">
          FUNIA <span>🎮</span>
        </div>

        <div className="dashboard-user">

          <div className="avatar">
            {username.charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <strong>{username}</strong>
            <span>Joueur</span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            ⏻
          </button>

        </div>

      </header>


      {/* CONTENU */}
      <main className="dashboard-content">

        {/* BIENVENUE */}
        <section className="welcome-section">

          <div>
            <p className="small-title">
              TABLEAU DE BORD
            </p>

            <h1>
              Salut {username} 👋
            </h1>

            <p>
              Prêt à apprendre, jouer et relever des défis ?
            </p>
          </div>

          <div className="welcome-emoji">
            🚀
          </div>

        </section>


        {/* STATISTIQUES */}
        <section className="stats">

          <div className="stat-card">
            <span className="stat-icon">🏆</span>

            <div>
              <span>Score</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">🔥</span>

            <div>
              <span>Série</span>
              <strong>0 jours</strong>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">🧠</span>

            <div>
              <span>Quiz terminés</span>
              <strong>0</strong>
            </div>
          </div>


          <div className="stat-card">
            <span className="stat-icon">⭐</span>

            <div>
              <span>Niveau</span>
              <strong>1</strong>
            </div>
          </div>

        </section>


        {/* ACTIVITÉS */}
        <section className="activities">

          <div className="section-heading">

            <div>
              <h2>
                Que veux-tu faire ?
              </h2>

              <p>
                Choisis ton activité et commence à t'amuser.
              </p>
            </div>

          </div>


          <div className="activity-grid">


            {/* QUIZ */}
            <div className="activity-card quiz-card">

              <div className="activity-icon">
                🧠
              </div>

              <div className="activity-text">

                <h3>
                  Quiz
                </h3>

                <p>
                  Teste tes connaissances dans différentes matières.
                </p>

              </div>

              <button>
                Commencer →
              </button>

            </div>


            {/* MINI-JEUX */}
            <div className="activity-card games-card">

              <div className="activity-icon">
                🎮
              </div>

              <div className="activity-text">

                <h3>
                  Mini-jeux
                </h3>

                <p>
                  Joue à des jeux rapides et amusants.
                </p>

              </div>

              <button>
                Jouer →
              </button>

            </div>


            {/* CULTURE */}
            <div className="activity-card culture-card">

              <div className="activity-icon">
                🌍
              </div>

              <div className="activity-text">

                <h3>
                  Culture générale
                </h3>

                <p>
                  Découvre de nouvelles choses chaque jour.
                </p>

              </div>

              <button>
                Découvrir →
              </button>

            </div>


            {/* DÉFIS */}
            <div className="activity-card challenge-card">

              <div className="activity-icon">
                🏆
              </div>

              <div className="activity-text">

                <h3>
                  Défis
                </h3>

                <p>
                  Relève des défis et améliore ton classement.
                </p>

              </div>

              <button>
                Relever →
              </button>

            </div>

          </div>

        </section>


        {/* CLASSEMENT */}
        <section className="leaderboard">

          <div className="leaderboard-title">

            <div>
              <h2>
                🏆 Classement
              </h2>

              <p>
                Les meilleurs joueurs
              </p>
            </div>

            <button>
              Voir tout →
            </button>

          </div>


          <div className="ranking">

            <div className="rank-row">

              <span className="rank-number">
                1
              </span>

              <div className="rank-avatar">
                👑
              </div>

              <div className="rank-user">
                <strong>
                  Joueur Funia
                </strong>

                <span>
                  Niveau 10
                </span>
              </div>

              <strong className="rank-score">
                12 540 pts
              </strong>

            </div>


            <div className="rank-row">

              <span className="rank-number">
                2
              </span>

              <div className="rank-avatar">
                🥈
              </div>

              <div className="rank-user">
                <strong>
                  Quiz Master
                </strong>

                <span>
                  Niveau 9
                </span>
              </div>

              <strong className="rank-score">
                10 820 pts
              </strong>

            </div>


            <div className="rank-row">

              <span className="rank-number">
                3
              </span>

              <div className="rank-avatar">
                🥉
              </div>

              <div className="rank-user">
                <strong>
                  Brain Player
                </strong>

                <span>
                  Niveau 8
                </span>
              </div>

              <strong className="rank-score">
                9 450 pts
              </strong>

            </div>

          </div>

        </section>


      </main>

    </div>
  )
}

export default Home