
import { useState } from "react"
import "./Register.css"

const COUNTRIES = [
  {
    value: "Nigeria",
    label: "🇳🇬 Nigeria",
    language: "English"
  },
  {
    value: "Togo",
    label: "🇹🇬 Togo",
    language: "Français"
  },
  {
    value: "Benin",
    label: "🇧🇯 Bénin",
    language: "Français"
  },
  {
    value: "Ghana",
    label: "🇬🇭 Ghana",
    language: "English"
  },
  {
    value: "Cameroon",
    label: "🇨🇲 Cameroun",
    language: "Français"
  },
  {
    value: "France",
    label: "🇫🇷 France",
    language: "Français"
  },
  {
    value: "Spain",
    label: "🇪🇸 Espagne",
    language: "Español"
  },
  {
    value: "Portugal",
    label: "🇵🇹 Portugal",
    language: "Português"
  },
  {
    value: "Brazil",
    label: "🇧🇷 Brésil",
    language: "Português"
  },
  {
    value: "Germany",
    label: "🇩🇪 Allemagne",
    language: "Deutsch"
  },
  {
    value: "Italy",
    label: "🇮🇹 Italie",
    language: "Italiano"
  },
  {
    value: "Belgium",
    label: "🇧🇪 Belgique",
    language: "Français"
  },
  {
    value: "Switzerland",
    label: "🇨🇭 Suisse",
    language: "Français"
  },
  {
    value: "Canada",
    label: "🇨🇦 Canada",
    language: "Français"
  },
  {
    value: "United Kingdom",
    label: "🇬🇧 Royaume-Uni",
    language: "English"
  },
  {
    value: "United States",
    label: "🇺🇸 États-Unis",
    language: "English"
  },
  {
    value: "Japan",
    label: "🇯🇵 Japon",
    language: "日本語"
  },
  {
    value: "China",
    label: "🇨🇳 Chine",
    language: "中文"
  },
  {
    value: "India",
    label: "🇮🇳 Inde",
    language: "English"
  },
  {
    value: "South Africa",
    label: "🇿🇦 Afrique du Sud",
    language: "English"
  }
]


const LANGUAGES = [
  "Français",
  "English",
  "Español",
  "Português",
  "Deutsch",
  "Italiano",
  "日本語",
  "中文"
]


function Register({ onRegister }) {

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    country: "",
    region: "",
    level: "",
    language: ""
  })

  const [loading, setLoading] = useState(false)


  // =========================
  // MODIFICATION
  // =========================

  function handleChange(event) {

    const {
      name,
      value
    } = event.target


    // Quand le pays change,
    // on choisit automatiquement
    // sa langue par défaut.

    if (name === "country") {

      const selectedCountry =
        COUNTRIES.find(
          country =>
            country.value === value
        )


      setForm(previous => ({
        ...previous,
        country: value,
        language:
          selectedCountry?.language ||
          previous.language
      }))

      return
    }


    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }


  // =========================
  // INSCRIPTION
  // =========================

  async function handleSubmit(event) {

    event.preventDefault()


    if (
      form.password !==
      form.confirmPassword
    ) {

      alert(
        "Les mots de passe ne correspondent pas."
      )

      return
    }


    if (!form.country) {

      alert(
        "Choisis ton pays 🌍"
      )

      return
    }


    if (!form.language) {

      alert(
        "Choisis ta langue 🗣️"
      )

      return
    }


    setLoading(true)


    try {

      const params =
        new URLSearchParams({

          username:
            form.username.trim(),

          email:
            form.email.trim(),

          password:
            form.password,

          age:
            form.age,

          country:
            form.country,

          region:
            form.region.trim(),

          level:
            form.level.trim(),

          language:
            form.language

        })


      const response =
        await fetch(
          `http://127.0.0.1:8000/register?${params.toString()}`,
          {
            method: "POST",

            headers: {
              "Accept":
                "application/json"
            }
          }
        )


      const text =
        await response.text()


      let data


      try {

        data =
          JSON.parse(text)

      } catch {

        data = {
          detail: text
        }

      }


      if (!response.ok) {

        alert(
          data.detail ||
          `Erreur serveur : ${response.status}`
        )

        return
      }


      // =========================
      // SAUVEGARDE SESSION
      // =========================

      localStorage.setItem(
        "username",
        data.username
      )


      localStorage.setItem(
        "user_id",
        String(data.user_id)
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
        form.age
      )


      console.log(
        "✅ Compte créé !",
        data
      )


      if (onRegister) {
        onRegister(data)
      }


    } catch (error) {

      console.error(
        "❌ Erreur inscription :",
        error
      )


      alert(
        "Impossible de contacter le serveur."
      )


    } finally {

      setLoading(false)

    }
  }


  return (

    <div className="register-page">

      <div className="register-card">


        {/* =========================
            TITRE
        ========================= */}

        <div className="register-header">

          <div className="register-icon">
            🌍
          </div>

          <h1>
            Bienvenue sur Funia 🎉
          </h1>

          <p className="subtitle">
            Crée ton compte et personnalise
            ton expérience Funia.
          </p>

        </div>


        <form onSubmit={handleSubmit}>


          {/* =========================
              IDENTITE
          ========================= */}

          <div className="form-section">

            <h3>
              👤 Ton profil
            </h3>


            <input
              type="text"
              name="username"
              placeholder="Nom d'utilisateur"
              value={form.username}
              onChange={handleChange}
              required
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
              type="number"
              name="age"
              placeholder="Âge"
              min="1"
              max="120"
              value={form.age}
              onChange={handleChange}
              required
            />

          </div>


          {/* =========================
              PAYS
          ========================= */}

          <div className="form-section">

            <h3>
              🌍 Où habites-tu ?
            </h3>


            <select
              name="country"
              value={form.country}
              onChange={handleChange}
              required
            >

              <option value="">
                Choisir ton pays
              </option>


              {COUNTRIES.map(country => (

                <option
                  key={country.value}
                  value={country.value}
                >
                  {country.label}
                </option>

              ))}

            </select>


            <input
              type="text"
              name="region"
              placeholder="Ville / Région (optionnel)"
              value={form.region}
              onChange={handleChange}
            />

          </div>


          {/* =========================
              LANGUE
          ========================= */}

          <div className="form-section">

            <h3>
              🗣️ Ta langue
            </h3>


            <select
              name="language"
              value={form.language}
              onChange={handleChange}
              required
            >

              <option value="">
                Choisir ta langue
              </option>


              {LANGUAGES.map(language => (

                <option
                  key={language}
                  value={language}
                >
                  {language}
                </option>

              ))}

            </select>


            <p className="language-help">
              Funia utilisera cette langue
              pour personnaliser les quiz.
            </p>

          </div>


          {/* =========================
              NIVEAU
          ========================= */}

          <div className="form-section">

            <h3>
              🎓 Ton niveau
            </h3>


            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              required
            >

              <option value="">
                Choisir ton niveau
              </option>

              <option value="Primaire">
                Primaire
              </option>

              <option value="Collège">
                Collège
              </option>

              <option value="Lycée">
                Lycée
              </option>

              <option value="Université">
                Université
              </option>

              <option value="Autodidacte">
                Autodidacte
              </option>

            </select>

          </div>


          {/* =========================
              MOT DE PASSE
          ========================= */}

          <div className="form-section">

            <h3>
              🔐 Sécurité
            </h3>


            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={handleChange}
              required
            />


            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmer le mot de passe"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>


          {/* =========================
              BOUTON
          ========================= */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Création du compte..."
              : "Créer mon compte 🚀"}

          </button>

        </form>

      </div>

    </div>
  )
}


export default Register

