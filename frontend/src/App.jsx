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

  const token = localStorage.getItem("access_token")
  const userId = localStorage.getItem("user_id")

  const username =
    localStorage.getItem("username") || ""

  const language =
    localStorage.getItem("language") || "Français"

  const country =
    localStorage.getItem("country") || ""

  const isLoggedIn =
    Boolean(token && userId)


  function handleRegister() {
    setPage("dashboard")
  }


  function handleLogout() {

    localStorage.removeItem("access_token")
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
  }


  function goTo(pageName) {

    if (!isLoggedIn) {
      setPage("register")
      return
    }

    setPage(pageName)
  }


  // =====================================================
  // REGISTER
  // =====================================================

  if (page === "register") {

    return (
      <Register
        onRegister={handleRegister}
        onBack={() => setPage("home")}
      />
    )
  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  if (page === "dashboard") {

    if (!isLoggedIn) {
      return (
        <Register
          onRegister={handleRegister}
          onBack={() => setPage("home")}
        />
      )
    }

    return (
      <Dashboard
        username={username}
        language={language}
        country={country}

        onProfile={() => setPage("profile")}
        onQuiz={() => setPage("quiz")}
        onGames={() => setPage("games")}
        onChallenges={() => setPage("challenges")}
        onAI={() => setPage("ai")}

        onLogout={handleLogout}
      />
    )
  }


  // =====================================================
  // PROFILE
  // =====================================================

  if (page === "profile") {

    return (
      <Profile
        onBack={() => setPage("dashboard")}
      />
    )
  }


  // =====================================================
  // QUIZ
  // =====================================================

  if (page === "quiz") {

    return (
      <Quiz
        onBack={() => setPage("dashboard")}
        onStart={() => setPage("quiz-game")}
      />
    )
  }


  // =====================================================
  // QUIZ GAME
  // =====================================================

  if (page === "quiz-game") {

    return (
      <QuizGame
        onBack={() => setPage("quiz")}
        onFinish={() => setPage("dashboard")}
      />
    )
  }


  // =====================================================
  // GAMES
  // =====================================================

  if (page === "games") {

    return (
      <Games
        onBack={() => setPage("dashboard")}
      />
    )
  }


  // =====================================================
  // MEMORY
  // =====================================================

  if (page === "memory") {

    return (
      <MemoryGame
        onBack={() => setPage("games")}
      />
    )
  }


  // =====================================================
  // CHALLENGES
  // =====================================================

  if (page === "challenges") {

    return (
      <Challenges
        onBack={() => setPage("dashboard")}
      />
    )
  }


  // =====================================================
  // AI
  // =====================================================

  if (page === "ai") {

    return (
      <AIChat
        onBack={() => setPage("dashboard")}
      />
    )
  }


  // =====================================================
  // HOME
  // =====================================================

  return (
    <div className="app">

      <div className="home-container">

        <h1>🎮 Funia</h1>

        <h2>
          Bienvenue sur Funia !
        </h2>

        <p>
          Apprends, joue et amuse-toi.
        </p>

        <button
          onClick={() =>
            setPage(
              isLoggedIn
                ? "dashboard"
                : "register"
            )
          }
        >
          {isLoggedIn
            ? "Continuer 🚀"
            : "Commencer 🚀"}
        </button>

      </div>

    </div>
  )
}


export default App