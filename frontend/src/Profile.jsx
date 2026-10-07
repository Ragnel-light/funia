import { useEffect, useState } from "react"
import "./Profile.css"

function Profile({ onBack }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const userId = localStorage.getItem("user_id")

  async function loadProfile() {
    if (!userId) {
      setError("Utilisateur non connecté.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`http://127.0.0.1:8000/users/${userId}`)

      if (!res.ok) {
        throw new Error(`Erreur serveur : ${res.status}`)
      }

      const data = await res.json()
      console.log("Profil mis à jour :", data)

      setUser(data)
      setError("")
    } catch (err) {
      console.error("Erreur Profile :", err)
      setError("Impossible de charger le profil.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="loading-profile">
        Chargement...
      </div>
    )
  }

  if (error) {
    return (
      <div className="loading-profile">
        <h2>{error}</h2>
        <button onClick={onBack}>← Retour</button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="loading-profile">
        Aucun utilisateur trouvé.
      </div>
    )
  }

  const level = Math.floor(user.xp / 100) + 1
  const progress = user.xp % 100

  return (
    <div className="profile-page">
      <header className="profile-navbar">
        <button onClick={onBack}>← Retour</button>
        <h2>FUNIA 👤</h2>
      </header>

      <main className="profile-container">
        <div className="profile-card">
          <div className="avatar">
            {user.username[0].toUpperCase()}
          </div>

          <h1>{user.username}</h1>

          <p>
            {user.country} • {user.level}
          </p>

          <div className="xp-box">
            <h2>Niveau {level}</h2>

            <div className="progress">
              <div
                className="fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span>{user.xp} XP</span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <h3>🏆 XP</h3>
            <p>{user.xp}</p>
          </div>

          <div className="stat">
            <h3>🪙 Coins</h3>
            <p>{user.coins}</p>
          </div>

          <div className="stat">
            <h3>🎯 Quiz</h3>
            <p>{user.quizzes_played}</p>
          </div>

          <div className="stat">
            <h3>🎮 Jeux</h3>
            <p>{user.games_played}</p>
          </div>

          <div className="stat full">
            <h3>🥇 Meilleur score</h3>
            <p>{user.best_quiz_score}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Profile