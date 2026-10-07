import { useEffect, useState } from "react"
import "./Profile.css"

function Profile({ onBack }) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    async function loadProfile() {

      const token = localStorage.getItem("access_token")

      if (!token) {
        setError("Tu dois être connecté.")
        setLoading(false)
        return
      }

      try {

        const response = await fetch(
          "https://funia.onrender.com/users/me",
          {
            method: "GET",

            headers: {
              "Accept": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        )

        if (response.status === 401) {

          localStorage.removeItem("access_token")
          localStorage.removeItem("user_id")

          setError("Session expirée. Reconnecte-toi.")
          setLoading(false)

          return
        }

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data.detail || "Impossible de charger le profil."
          )
        }

        setUser(data)

      } catch (error) {

        setError(
          error.message ||
          "Impossible de contacter le serveur."
        )

      } finally {

        setLoading(false)

      }
    }

    loadProfile()

  }, [])

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Chargement du profil...</h2>
      </div>
    )
  }

  if (error) {
    return (
      <div className="profile-container">

        <h2>❌ {error}</h2>

        {onBack && (
          <button onClick={onBack}>
            Retour
          </button>
        )}

      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="profile-container">

      <div className="profile-card">

        <h1>👤 {user.username}</h1>

        <div className="profile-info">

          <p>
            <strong>Email :</strong>{" "}
            {user.email}
          </p>

          <p>
            <strong>Âge :</strong>{" "}
            {user.age}
          </p>

          <p>
            <strong>Pays :</strong>{" "}
            {user.country}
          </p>

          <p>
            <strong>Région :</strong>{" "}
            {user.region || "Non renseignée"}
          </p>

          <p>
            <strong>Niveau :</strong>{" "}
            {user.level || "Non renseigné"}
          </p>

        </div>

        <div className="profile-stats">

          <div>
            <span>⭐</span>
            <strong>{user.xp}</strong>
            <small>XP</small>
          </div>

          <div>
            <span>🪙</span>
            <strong>{user.coins}</strong>
            <small>Coins</small>
          </div>

          <div>
            <span>🏆</span>
            <strong>{user.level_number}</strong>
            <small>Niveau</small>
          </div>

          <div>
            <span>🧠</span>
            <strong>{user.quizzes_played}</strong>
            <small>Quiz</small>
          </div>

          <div>
            <span>🎮</span>
            <strong>{user.games_played}</strong>
            <small>Jeux</small>
          </div>

          <div>
            <span>🥇</span>
            <strong>{user.best_quiz_score}</strong>
            <small>Meilleur score</small>
          </div>

        </div>

        {onBack && (
          <button onClick={onBack}>
            Retour
          </button>
        )}

      </div>

    </div>
  )
}

export default Profile