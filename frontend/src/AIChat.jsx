import { useState, useRef, useEffect } from "react"
import "./AIChat.css"


function AIChat({ onBack }) {

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Salut 👋 Je suis Funia AI !\n\nJe peux t'aider avec les maths, la physique, l'informatique, l'anglais, l'histoire et plein d'autres choses. 🧠"
    }
  ])

  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef(null)


  // =========================
  // SCROLL AUTOMATIQUE
  // =========================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    })

  }, [messages, loading])


  // =========================
  // ENVOYER MESSAGE
  // =========================

  async function sendMessage() {

    const message = input.trim()

    if (!message || loading) {
      return
    }

    setMessages(previous => [
      ...previous,
      {
        role: "user",
        text: message
      }
    ])

    setInput("")
    setLoading(true)


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/ai/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            message: message
          })
        }
      )


      const data = await response.json()


      if (!response.ok) {

        throw new Error(
          data?.detail ||
          "Erreur avec Funia AI."
        )

      }


      setMessages(previous => [
        ...previous,
        {
          role: "ai",
          text: data.answer
        }
      ])


    } catch (error) {

      console.error(
        "Erreur Funia AI :",
        error
      )

      setMessages(previous => [
        ...previous,
        {
          role: "ai",
          text: "❌ Impossible de contacter Funia AI pour le moment. Vérifie que le serveur FastAPI fonctionne et que la clé API est configurée."
        }
      ])

    } finally {

      setLoading(false)

    }
  }


  // =========================
  // ENTRÉE CLAVIER
  // =========================

  function handleKeyDown(event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault()

      sendMessage()
    }
  }


  // =========================
  // QUESTIONS RAPIDES
  // =========================

  function quickQuestion(text) {

    if (loading) {
      return
    }

    setInput(text)

  }


  return (

    <div className="ai-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <header className="ai-navbar">

        <button
          className="ai-back-button"
          onClick={onBack}
        >
          ← Retour
        </button>


        <div className="ai-logo">

          <div className="ai-logo-icon">
            🤖
          </div>

          <div>

            <strong>
              Funia AI
            </strong>

            <span>
              Assistant éducatif
            </span>

          </div>

        </div>


        <div className="ai-status">

          <span className="status-dot"></span>

          En ligne

        </div>

      </header>


      {/* =========================
          CHAT
      ========================= */}

      <main className="ai-chat-container">

        <div className="ai-chat-card">


          {/* =========================
              HEADER
          ========================= */}

          <div className="ai-chat-header">

            <div className="ai-big-icon">
              🤖
            </div>

            <div>

              <h1>
                Funia AI
              </h1>

              <p>
                Ton assistant pour apprendre et t'amuser.
              </p>

            </div>

          </div>


          {/* =========================
              QUESTIONS RAPIDES
          ========================= */}

          <div className="quick-questions">

            <button
              onClick={() =>
                quickQuestion(
                  "Explique-moi la deuxième loi de Newton simplement."
                )
              }
            >
              ⚡ Physique
            </button>


            <button
              onClick={() =>
                quickQuestion(
                  "Donne-moi un exercice de mathématiques avec sa correction."
                )
              }
            >
              🧮 Maths
            </button>


            <button
              onClick={() =>
                quickQuestion(
                  "Explique-moi une notion importante en informatique."
                )
              }
            >
              💻 Informatique
            </button>


            <button
              onClick={() =>
                quickQuestion(
                  "Fais-moi un petit quiz de culture générale."
                )
              }
            >
              🌍 Culture
            </button>

          </div>


          {/* =========================
              MESSAGES
          ========================= */}

          <div className="ai-messages">

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "message-row user-row"
                      : "message-row ai-row"
                  }
                >

                  {message.role === "ai" && (

                    <div className="message-avatar">
                      🤖
                    </div>

                  )}


                  <div
                    className={
                      message.role === "user"
                        ? "message user-message"
                        : "message ai-message"
                    }
                  >
                    {message.text}
                  </div>

                </div>

              )
            )}


            {loading && (

              <div className="message-row ai-row">

                <div className="message-avatar">
                  🤖
                </div>

                <div className="message ai-message typing">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            )}


            <div ref={messagesEndRef}></div>

          </div>


          {/* =========================
              INPUT
          ========================= */}

          <div className="ai-input-area">

            <textarea
              value={input}
              onChange={event =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question à Funia AI..."
              rows="1"
              disabled={loading}
            />


            <button
              className="send-button"
              onClick={sendMessage}
              disabled={
                loading ||
                !input.trim()
              }
            >
              {loading
                ? "..."
                : "➤"}
            </button>

          </div>


          <p className="ai-disclaimer">
            Funia AI peut faire des erreurs. Vérifie les informations importantes.
          </p>

        </div>

      </main>

    </div>
  )
}


export default AIChat