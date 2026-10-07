
import { useState } from "react"

import Register from "./Register"
import Dashboard from "./Dashboard"
import Quiz from "./Quiz"
import QuizGame from "./QuizGame"
import Games from "./Games"
import MemoryGame from "./MemoryGame"
import Profile from "./Profile"
import Challenges from "./Challenges"
import AIChat from "./AIChat"

import "./App.css"


function App() {

  const [page, setPage] = useState("home")

  const [profileRefresh, setProfileRefresh] = useState(0)

  const userId = localStorage.getItem("user_id")
  const username = localStorage.getItem("username")

  const language =
    localStorage.getItem("language") ||
    "Français"

  const country =
    localStorage.getItem("country") ||
    ""


  // ========================================
  // INSCRIPTION
  // ========================================

  if (page === "register") {

    return (
      <Register
        onRegister={() => {
          setPage("dashboard")
        }}
      />
    )
  }


  // ========================================
  // DASHBOARD
  // ========================================

  if (page === "dashboard") {

    return (
      <Dashboard

        username={username}

        onHome={() => {
          setPage("home")
        }}

        onQuiz={() => {
          setPage("quiz")
        }}

        onGames={() => {
          setPage("games")
        }}

        onProfile={() => {
          setPage("profile")
        }}

        onCulture={() => {
          setPage("culture")
        }}

        onChallenges={() => {
          setPage("challenges")
        }}

        onAI={() => {
          setPage("ai")
        }}

        onLogout={() => {

          localStorage.removeItem("user_id")
          localStorage.removeItem("username")

          localStorage.removeItem("xp")
          localStorage.removeItem("level")

          localStorage.removeItem("quizSettings")

          localStorage.removeItem("country")
          localStorage.removeItem("language")
          localStorage.removeItem("region")
          localStorage.removeItem("age")

          setPage("home")
        }}
      />
    )
  }


  // ========================================
  // PROFILE
  // ========================================

  if (page === "profile") {

    return (
      <Profile
        key={profileRefresh}
        onBack={() => {
          setPage("dashboard")
        }}
      />
    )
  }


  // ========================================
  // FUNIA AI
  // ========================================

  if (page === "ai") {

    return (
      <AIChat
        onBack={() => {
          setPage("dashboard")
        }}
      />
    )
  }


  // ========================================
  // CONFIGURATION QUIZ
  // ========================================

  if (page === "quiz") {

    return (
      <Quiz

        onBack={() => {
          setPage("dashboard")
        }}

        onStartQuiz={(settings) => {

          localStorage.setItem(
            "quizSettings",
            JSON.stringify(settings)
          )

          setPage("quiz-game")
        }}
      />
    )
  }


  // ========================================
  // JEU QUIZ
  // ========================================

  if (page === "quiz-game") {

    const settings = JSON.parse(
      localStorage.getItem(
        "quizSettings"
      ) || "{}"
    )


    return (
      <QuizGame

        subject={
          settings.subject ||
          "general"
        }

        difficulty={
          settings.difficulty ||
          "medium"
        }

        questionCount={
          settings.questionCount ||
          5
        }

        language={
          settings.language ||
          language
        }

        country={
          country
        }

        onBack={() => {
          setPage("quiz")
        }}

        onFinish={() => {

          setProfileRefresh(
            previous => previous + 1
          )

          setPage("dashboard")
        }}
      />
    )
  }


  // ========================================
  // MEMORY GAME
  // ========================================

  if (page === "memory") {

    return (
      <MemoryGame
        onBack={() => {
          setPage("games")
        }}
      />
    )
  }


  // ========================================
  // MINI-JEUX
  // ========================================

  if (page === "games") {

    return (
      <Games
        onBack={() => {
          setPage("dashboard")
        }}
      />
    )
  }


  // ========================================
  // CULTURE
  // ========================================

  if (page === "culture") {

    return (
      <div className="simple-feature-page">

        <button
          className="simple-back-button"
          onClick={() => {
            setPage("dashboard")
          }}
        >
          ← Retour
        </button>


        <div className="simple-feature-content">

          <div className="simple-feature-icon">
            🌍
          </div>


          <p className="simple-feature-label">
            FUNIA • CULTURE
          </p>


          <h1>
            Culture générale
          </h1>


          <p>
            Découvre des questions sur le monde,
            l'histoire, la géographie, les sciences
            et bien plus.
          </p>


          <div className="coming-soon">
            🚀 Cette section arrive bientôt.
          </div>

        </div>

      </div>
    )
  }


  // ========================================
  // DÉFIS
  // ========================================

  if (page === "challenges") {

    return (
      <Challenges
        onBack={() => {
          setPage("dashboard")
        }}
      />
    )
  }


  // ========================================
  // ACCUEIL
  // ========================================

  return (

    <div className="app">


      {/* ==================================
          NAVBAR
      ================================== */}

      <header className="navbar">

        <div
          className="logo"
          onClick={() => {
            setPage("home")
          }}
        >
          FUNIA 🎮
        </div>


        <div className="nav-buttons">


          {/* MON ESPACE */}

          <button
            onClick={() => {

              setPage(
                userId
                  ? "dashboard"
                  : "register"
              )

            }}
          >
            {
              userId
                ? "Mon espace"
                : "Connexion"
            }
          </button>


          {/* MON COMPTE */}

          <button
            className="register"
            onClick={() => {

              setPage(
                userId
                  ? "dashboard"
                  : "register"
              )

            }}
          >
            {
              userId
                ? "Mon compte"
                : "Créer un compte"
            }
          </button>

        </div>

      </header>


      {/* ==================================
          HERO
      ================================== */}

      <main className="hero">


        {/* ================================
            HERO CONTENT
        ================================= */}

        <div className="hero-content">

          <p className="welcome">
            👋 Bienvenue sur Funia
          </p>


          <h1>

            Apprends.
            <br />

            Joue.
            <br />

            <span>
              Amuse-toi.
            </span>

          </h1>


          <p className="description">

            Des quiz, des mini-jeux, de la culture
            générale, des défis et une IA pour
            apprendre tout en t'amusant.

          </p>


          <button
            className="start-button"
            onClick={() => {

              setPage(
                userId
                  ? "dashboard"
                  : "register"
              )

            }}
          >

            {
              userId
                ? "Continuer 🚀"
                : "Commencer 🚀"
            }

          </button>

        </div>


        {/* =================================
            HERO CARD
        ================================== */}

        <div className="hero-card">


          <div className="card-icon">
            🧠
          </div>


          <h2>
            Quel est ton mood ?
          </h2>


          <div className="choices">


            {/* APPRENDRE */}

            <button
              onClick={() => {

                setPage(
                  userId
                    ? "quiz"
                    : "register"
                )

              }}
            >
              🧠 Apprendre
            </button>


            {/* JOUER */}

            <button
              onClick={() => {

                setPage(
                  userId
                    ? "games"
                    : "register"
                )

              }}
            >
              🎮 Jouer
            </button>


            {/* DÉFI */}

            <button
              onClick={() => {

                setPage(
                  userId
                    ? "challenges"
                    : "register"
                )

              }}
            >
              🏆 Défi
            </button>


            {/* CULTURE */}

            <button
              onClick={() => {

                setPage(
                  userId
                    ? "culture"
                    : "register"
                )

              }}
            >
              🌍 Culture générale
            </button>


            {/* FUNIA AI */}

            <button
              onClick={() => {

                setPage(
                  userId
                    ? "ai"
                    : "register"
                )

              }}
            >
              🤖 Funia AI
            </button>


          </div>

        </div>

      </main>

    </div>
  )
}


export default App

