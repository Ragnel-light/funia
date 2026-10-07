
import os

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel


# =========================
# ENVIRONNEMENT
# =========================

load_dotenv()


# =========================
# ROUTER
# =========================

router = APIRouter(
    prefix="/ai",
    tags=["AI"]
)


# =========================
# OPENROUTER
# =========================

api_key = os.getenv("OPENROUTER_API_KEY")

client = None

if api_key:
    client = OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1"
    )


# =========================
# MODELES
# =========================

class ChatRequest(BaseModel):
    message: str


class HintRequest(BaseModel):
    question: str
    answers: list[str]


# =========================
# FONCTION IA
# =========================

def call_ai(
    system_message: str,
    user_message: str
):

    if not api_key or not client:

        raise HTTPException(
            status_code=500,
            detail="La clé OpenRouter n'est pas configurée."
        )


    try:

        response = client.chat.completions.create(

            model="openrouter/free",

            messages=[
                {
                    "role": "system",
                    "content": system_message
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ]
        )


        answer = (
            response
            .choices[0]
            .message
            .content
        )


        if not answer:
            raise Exception(
                "OpenRouter n'a retourné aucune réponse."
            )


        return answer


    except Exception as error:

        print("=================================")
        print("ERREUR OPENROUTER :", repr(error))
        print("=================================")

        raise HTTPException(
            status_code=500,
            detail="Impossible de contacter Funia AI."
        )


# =========================
# CHAT NORMAL
# =========================

@router.post("/chat")
async def chat_with_ai(request: ChatRequest):

    message = request.message.strip()


    if not message:

        raise HTTPException(
            status_code=400,
            detail="Le message est vide."
        )


    if len(message) > 4000:

        raise HTTPException(
            status_code=400,
            detail="Le message est trop long."
        )


    system_message = """
Tu es Funia AI, l'assistant éducatif de Funia.

Ton objectif est d'aider les utilisateurs à apprendre
et à s'amuser.

Règles :

- Réponds principalement en français.
- Si l'utilisateur écrit en anglais, réponds en anglais.
- Explique simplement.
- Pour les maths et la physique, montre les étapes.
- Pour l'informatique, donne des exemples simples.
- Pour les questions scolaires, aide l'utilisateur à comprendre.
- Tu peux proposer des exercices et des quiz.
- Sois clair, amical et concis.
- Utilise quelques emojis lorsque cela est naturel.
- Ne prétends jamais être humain.
"""


    answer = call_ai(
        system_message,
        message
    )


    return {
        "success": True,
        "answer": answer
    }


# =========================
# INDICE DE QUIZ
# =========================

@router.post("/hint")
async def get_quiz_hint(request: HintRequest):

    question = request.question.strip()

    answers = request.answers


    if not question:

        raise HTTPException(
            status_code=400,
            detail="La question est vide."
        )


    if len(question) > 2000:

        raise HTTPException(
            status_code=400,
            detail="La question est trop longue."
        )


    options_text = "\n".join(
        f"{chr(65 + index)}. {answer}"
        for index, answer in enumerate(answers)
    )


    system_message = """
Tu es Funia AI, l'assistant pédagogique d'un jeu de quiz.

L'utilisateur veut un INDICE pour l'aider à réfléchir.

RÈGLE ABSOLUE :
Tu ne dois jamais révéler directement la bonne réponse.

Tu ne dois pas :
- dire quelle option est correcte ;
- donner la lettre de la bonne réponse ;
- donner exactement la réponse ;
- dire "la bonne réponse est..." ;
- éliminer explicitement toutes les mauvaises réponses.

Tu dois :
- donner un indice court ;
- rappeler une notion utile ;
- orienter la réflexion ;
- utiliser 1 à 3 phrases maximum ;
- rester pédagogique et encourageant.

Même si tu connais la réponse, donne uniquement un indice.
"""


    user_message = f"""
Question :

{question}


Choix proposés :

{options_text}


Donne uniquement un indice permettant de résoudre cette question.
"""


    answer = call_ai(
        system_message,
        user_message
    )


    return {
        "success": True,
        "hint": answer
    }

