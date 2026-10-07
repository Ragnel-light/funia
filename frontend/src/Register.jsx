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

    setForm({
      ...form,
      [e.target.name]: e.target.value
    })

  }

  async function handleSubmit(e) {

    e.preventDefault()

    setError("")
    setSuccess("")

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      return
    }

    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.")
      return
    }

    if (!form.username.trim()) {
      setError("Entre un nom d'utilisateur.")
      return
    }

    if (!form.email.trim()) {
      setError("Entre ton email.")
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

      const response = await fetch(
        "https://funia.onrender.com/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },

          body: JSON.stringify({
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,

            age: Number(form.age),

            country: form.country,
            region: form.region.trim(),
            level: form.level.trim()
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || "Impossible de créer le compte."
        )
      }

      // Token JWT
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
        data.username
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
        form.region
      )

      localStorage.setItem(
        "level",
        form.level
      )

      localStorage.setItem(
        "age",
        String(form.age)
      )

      setSuccess("Compte créé avec succès ! 🎉")

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

      <div className="register-card">

        <h1>🚀 Bienvenue sur Funia</h1>

        <p>
          Crée ton compte et commence à t'amuser !
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={30}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmer le mot de passe"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="age"
            placeholder="Âge"
            value={form.age}
            onChange={handleChange}
            min="5"
            max="100"
            required
          />

          <select
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

          <input
            type="text"
            name="region"
            placeholder="Région / État"
            value={form.region}
            onChange={handleChange}
            maxLength={100}
          />

          <input
            type="text"
            name="level"
            placeholder="Niveau scolaire"
            value={form.level}
            onChange={handleChange}
            maxLength={50}
          />

          <select
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

          {error && (
            <p className="error-message">
              ❌ {error}
            </p>
          )}

          {success && (
            <p className="success-message">
              ✅ {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Création..."
              : "Créer mon compte"}
          </button>

        </form>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="back-button"
          >
            Retour
          </button>
        )}

      </div>

    </div>
  )
}

export default Register