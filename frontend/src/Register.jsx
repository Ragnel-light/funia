import { useState } from "react"
import "./Register.css"

const COUNTRIES = [
  "Nigeria",
  "Cameroon",
  "Ghana",
  "Benin",
  "Togo",
  "Ivory Coast",
  "Senegal",
  "Mali",
  "Burkina Faso",
  "Niger",
  "France",
  "United States",
  "United Kingdom",
  "Canada",
  "Other"
]

const LANGUAGES = [
  "Français",
  "English"
]

function Register({ onRegister, onBack }) {

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    country: "",
    region: "",
    level: "",
    language: "Français"
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function handleChange(e) {
    const { name, value } = e.target

    setForm((previous) => ({
      ...previous,
      [name]: value
    }))

    setError("")
    setSuccess("")
  }

  function getErrorMessage(data) {

    if (Array.isArray(data?.detail)) {

      return data.detail
        .map((err) => {

          const field =
            Array.isArray(err.loc)
              ? err.loc[err.loc.length - 1]
              : "champ"

          const fieldNames = {
            username: "Nom d'utilisateur",
            email: "Email",
            password: "Mot de passe",
            age: "Âge",
            country: "Pays",
            region: "Région",
            level: "Niveau"
          }

          const readableField =
            fieldNames[field] || field

          return `${readableField}: ${err.msg}`
        })
        .join("\n")
    }

    if (typeof data?.detail === "string") {
      return data.detail
    }

    return "Impossible de créer le compte."
  }

  async function handleSubmit(e) {

    e.preventDefault()

    setError("")
    setSuccess("")

    const username = form.username.trim()
    const email = form.email.trim()
    const region = form.region.trim()
    const level = form.level.trim()

    if (username.length < 3) {
      setError(
        "Le nom d'utilisateur doit contenir au moins 3 caractères."
      )
      return
    }

    if (form.password.length < 6) {
      setError(
        "Le mot de passe doit contenir au moins 6 caractères."
      )
      return
    }

    if (form.password !== form.confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas."
      )
      return
    }

    if (!email) {
      setError("Entre ton adresse email.")
      return
    }

    if (!form.age) {
      setError("Entre ton âge.")
      return
    }

    if (!form.country) {
      setError("Choisis ton pays.")
      return
    }

    setLoading(true)

    try {
      console.log("DONNÉES ENVOYÉES :", {
  username,
  email,
  password: form.password,
  age: Number(form.age),
  country: form.country,
  region,
  level
})

      const response = await fetch(
        "https://funia.onrender.com/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },

          body: JSON.stringify({
            username,
            email,
            password: form.password,
            age: Number(form.age),
            country: form.country,
            region,
            level
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(getErrorMessage(data))
      }

      if (!data.access_token) {
        throw new Error(
          "Le serveur n'a pas retourné de token de connexion."
        )
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      )

      localStorage.setItem(
        "user_id",
        String(data.user_id)
      )

      localStorage.setItem(
        "username",
        data.username || username
      )

      localStorage.setItem(
        "email",
        email
      )

      localStorage.setItem(
        "country",
        form.country
      )

      localStorage.setItem(
        "language",
        form.language
      )

      localStorage.setItem(
        "region",
        region
      )

      localStorage.setItem(
        "level",
        level
      )

      localStorage.setItem(
        "age",
        String(form.age)
      )

      setSuccess(
        "Compte créé avec succès ! 🎉"
      )

      if (onRegister) {
        onRegister(data)
      }

    } catch (error) {

      setError(
        error.message ||
        "Impossible de contacter le serveur."
      )

    } finally {

      setLoading(false)

    }
  }

  return (
    <div className="register-container">

      <div className="register-background">
        <div className="register-orb orb-one"></div>
        <div className="register-orb orb-two"></div>
        <div className="register-orb orb-three"></div>
      </div>

      <div className="register-card">

        <div className="register-logo">
          🚀
        </div>

        <div className="register-header">

          <span className="register-badge">
            ✨ FUNIA
          </span>

          <h1>
            Crée ton compte
          </h1>

          <p>
            Rejoins Funia et découvre un monde de
            quiz, jeux et défis 🎮
          </p>

        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          <div className="form-section">

            <h2>
              👤 Ton compte
            </h2>

            <div className="input-group">

              <label htmlFor="username">
                Nom d'utilisateur
              </label>

              <input
                id="username"
                type="text"
                name="username"
                placeholder="Ex : Ragnel"
                value={form.username}
                onChange={handleChange}
                minLength={3}
                maxLength={30}
                autoComplete="username"
                required
              />

            </div>

            <div className="input-group">

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                placeholder="tonemail@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

            </div>

            <div className="input-row">

              <div className="input-group">

                <label htmlFor="password">
                  Mot de passe
                </label>

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="6 caractères minimum"
                  value={form.password}
                  onChange={handleChange}
                  minLength={6}
                  maxLength={100}
                  autoComplete="new-password"
                  required
                />

              </div>

              <div className="input-group">

                <label htmlFor="confirmPassword">
                  Confirmation
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirme ton mot de passe"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="new-password"
                  required
                />

              </div>

            </div>

          </div>

          <div className="form-section">

            <h2>
              🌍 À propos de toi
            </h2>

            <div className="input-row">

              <div className="input-group">

                <label htmlFor="age">
                  Âge
                </label>

                <input
                  id="age"
                  type="number"
                  name="age"
                  placeholder="Ton âge"
                  value={form.age}
                  onChange={handleChange}
                  min="5"
                  max="100"
                  required
                />

              </div>

              <div className="input-group">

                <label htmlFor="country">
                  Pays
                </label>

                <select
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                >

                  <option value="">
                    Choisir ton pays
                  </option>

                  {COUNTRIES.map((country) => (
                    <option
                      key={country}
                      value={country}
                    >
                      {country}
                    </option>
                  ))}

                </select>

              </div>

            </div>

            <div className="input-group">

              <label htmlFor="region">
                Région / État
                <span> facultatif</span>
              </label>

              <input
                id="region"
                type="text"
                name="region"
                placeholder="Ex : Lagos"
                value={form.region}
                onChange={handleChange}
                maxLength={100}
              />

            </div>

            <div className="input-group">

              <label htmlFor="level">
                Niveau scolaire
                <span> facultatif</span>
              </label>

              <input
                id="level"
                type="text"
                name="level"
                placeholder="Ex : Bac C, Terminale..."
                value={form.level}
                onChange={handleChange}
                maxLength={50}
              />

            </div>

            <div className="input-group">

              <label htmlFor="language">
                Langue
              </label>

              <select
                id="language"
                name="language"
                value={form.language}
                onChange={handleChange}
              >

                {LANGUAGES.map((language) => (
                  <option
                    key={language}
                    value={language}
                  >
                    {language}
                  </option>
                ))}

              </select>

            </div>

          </div>

          {error && (
            <div className="register-message error-message">
              <span>❌</span>
              <div>
                {error.split("\n").map((message, index) => (
                  <p key={index}>
                    {message}
                  </p>
                ))}
              </div>
            </div>
          )}

          {success && (
            <div className="register-message success-message">
              <span>✅</span>
              <p>{success}</p>
            </div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Création du compte...
              </>
            ) : (
              <>
                🚀 Créer mon compte
              </>
            )}

          </button>

        </form>

        {onBack && (
          <button
            type="button"
            className="back-button"
            onClick={onBack}
            disabled={loading}
          >
            ← Retour
          </button>
        )}

        <div className="register-footer">
          <span>🔒</span>
          Tes informations sont protégées.
        </div>

      </div>

    </div>
  )
}

export default Register