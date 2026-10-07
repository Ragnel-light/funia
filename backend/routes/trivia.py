import html
import json
import os
import random
import re
import secrets
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from routes.auth import get_current_user


load_dotenv()

router = APIRouter(
    prefix="/trivia",
    tags=["Trivia"]
)

OPEN_TDB_URL = "https://opentdb.com/api.php"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

openrouter_client = None

if OPENROUTER_API_KEY:
    openrouter_client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url="https://openrouter.ai/api/v1"
    )


CATEGORY_MAP = {
    "general": 9,
    "computer": 18,
    "math": 19,
    "history": 23,
    "geography": 22,
    "physics": 17,
    "english": 9,
}


LANGUAGE_MAP = {
    "Français": "français",
    "English": "anglais",
    "Español": "espagnol",
    "Português": "portugais",
    "Deutsch": "allemand",
    "Italiano": "italien",
    "日本語": "japonais",
    "中文": "chinois",
}


# =========================================================
# STOCKAGE DES SESSIONS DE QUIZ
# =========================================================
#
# Pour l'instant, les sessions sont conservées en mémoire.
#
# Une session contient :
# - l'utilisateur propriétaire
# - les bonnes réponses
# - la date d'expiration
#
# Le "correct" n'est donc PLUS envoyé au frontend.
#
# Important :
# Render peut redémarrer le serveur et effacer ce stockage.
# Pour une version encore plus robuste, on pourra ensuite
# déplacer ces sessions dans PostgreSQL.
#

quiz_sessions = {}

SESSION_DURATION_MINUTES = 30


# =========================================================
# MODELES
# =========================================================

class TriviaQuestion(BaseModel):
    question_id: str
    question: str
    answers: list[str]
    explanation: str
    difficulty: str
    category: str


class TriviaResponse(BaseModel):
    quiz_id: str
    questions: list[TriviaQuestion]
    language: str
    translated: bool


class QuizAnswers(BaseModel):
    answers: dict[str, int]


# =========================================================
# OUTILS
# =========================================================

def clean_text(text: str) -> str:
    return html.unescape(text)


def extract_json(text: str):
    text = text.strip()

    text = re.sub(
        r"^```(?:json)?\s*",
        "",
        text,
        flags=re.I
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    try:
        return json.loads(text)

    except json.JSONDecodeError:
        pass

    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError(
            "Aucun JSON valide trouvé dans la réponse IA."
        )

    return json.loads(
        text[start:end + 1]
    )


def cleanup_expired_sessions():
    now = datetime.now(timezone.utc)

    expired = []

    for quiz_id, session in quiz_sessions.items():

        if session["expires_at"] <= now:
            expired.append(quiz_id)

    for quiz_id in expired:
        del quiz_sessions[quiz_id]


# =========================================================
# TRADUCTION
# =========================================================

async def translate_questions(
    questions,
    target_language,
    country
):

    if target_language == "English":
        return questions, False

    if not openrouter_client:
        raise RuntimeError(
            "OPENROUTER_API_KEY absente."
        )

    language_name = LANGUAGE_MAP.get(
        target_language,
        target_language
    )

    payload = []

    for index, question in enumerate(questions):

        payload.append({
            "id": index,
            "question": question["question"],
            "answers": [
                {
                    "index": answer_index,
                    "text": answer
                }
                for answer_index, answer
                in enumerate(question["answers"])
            ],
            "explanation": question["explanation"]
        })

    country_hint = ""

    if country:
        country_hint = (
            f"Le joueur se trouve au {country}. "
            "Utilise un vocabulaire naturel pour ce public."
        )

    system_prompt = f"""
Tu es le traducteur officiel de Funia.

Traduis le quiz en {language_name}.
{country_hint}

IMPÉRATIF :

- Traduis la question.
- Traduis chaque proposition.
- Traduis l'explication.
- NE change PAS la valeur de 'id'.
- NE change PAS les valeurs 'index' des réponses.
- NE supprime aucune réponse.
- NE change PAS le nombre de questions.
- Retourne uniquement du JSON valide.

Format exact :

{{
  "questions": [
    {{
      "id": 0,
      "question": "...",
      "answers": [
        {{"index": 0, "text": "..."}},
        {{"index": 1, "text": "..."}},
        {{"index": 2, "text": "..."}},
        {{"index": 3, "text": "..."}}
      ],
      "explanation": "..."
    }}
  ]
}}
"""

    response = openrouter_client.chat.completions.create(
        model="openrouter/free",
        temperature=0.1,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": json.dumps(
                    payload,
                    ensure_ascii=False
                )
            }
        ]
    )

    content = (
        response.choices[0].message.content
        or ""
    )

    data = extract_json(content)

    translated_items = data.get(
        "questions",
        []
    )

    if len(translated_items) != len(questions):
        raise ValueError(
            "Le nombre de questions traduites est incorrect."
        )

    result = []

    for original, translated in zip(
        questions,
        translated_items
    ):

        answers = translated.get(
            "answers",
            []
        )

        if len(answers) != len(
            original["answers"]
        ):
            raise ValueError(
                "Le nombre de réponses traduites est incorrect."
            )

        answer_map = {}

        for item in answers:

            idx = item.get("index")
            text = item.get("text")

            if not isinstance(idx, int):
                raise ValueError(
                    "Index de réponse invalide."
                )

            if not isinstance(text, str):
                raise ValueError(
                    "Texte de réponse invalide."
                )

            answer_map[idx] = text

        expected_indexes = set(
            range(len(original["answers"]))
        )

        if set(answer_map.keys()) != expected_indexes:
            raise ValueError(
                "Les index des réponses ont été modifiés."
            )

        result.append({
            "question": translated.get(
                "question",
                original["question"]
            ),
            "answers": [
                answer_map[i]
                for i in range(
                    len(original["answers"])
                )
            ],
            "explanation": translated.get(
                "explanation",
                original["explanation"]
            ),
            "difficulty": original["difficulty"],
            "category": original["category"]
        })

    return result, True


# =========================================================
# CREER UN QUIZ
# =========================================================

@router.get(
    "/questions",
    response_model=TriviaResponse
)
async def get_questions(
    subject: str = "general",
    difficulty: str = "medium",
    amount: int = 5,
    language: str = "English",
    country: str = "",
    current_user_id: int = Depends(get_current_user)
):

    cleanup_expired_sessions()

    amount = max(
        1,
        min(int(amount), 50)
    )

    subject = subject.lower()
    difficulty = difficulty.lower()

    if subject == "all":
        subject = "general"

    if subject not in CATEGORY_MAP:
        subject = "general"

    if difficulty == "easy":
        api_difficulty = "easy"

    elif difficulty in (
        "hard",
        "extreme"
    ):
        api_difficulty = "hard"

    else:
        api_difficulty = "medium"

    if language not in LANGUAGE_MAP:
        language = "English"

    params = {
        "amount": amount,
        "category": CATEGORY_MAP[subject],
        "difficulty": api_difficulty,
        "type": "multiple"
    }

    try:

        async with httpx.AsyncClient(
            timeout=15
        ) as client:

            response = await client.get(
                OPEN_TDB_URL,
                params=params
            )

            response.raise_for_status()

            data = response.json()

    except Exception as error:

        print(
            "Erreur Open Trivia DB :",
            repr(error)
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "Impossible de contacter "
                "la base de questions."
            )
        )

    response_code = data.get(
        "response_code"
    )

    if response_code != 0:

        if response_code == 1:
            detail = (
                "Pas assez de questions disponibles "
                "pour cette catégorie et cette difficulté."
            )

        elif response_code == 2:
            detail = (
                "Les paramètres du quiz sont invalides."
            )

        elif response_code == 5:
            detail = (
                "Trop de demandes. "
                "Réessaie dans quelques secondes."
            )

        else:
            detail = (
                "La base de questions n'a pas pu "
                "fournir de questions."
            )

        raise HTTPException(
            status_code=400,
            detail=detail
        )

    questions = []

    for item in data.get(
        "results",
        []
    ):

        correct_answer = clean_text(
            item["correct_answer"]
        )

        answers = [
            correct_answer,
            *[
                clean_text(answer)
                for answer
                in item["incorrect_answers"]
            ]
        ]

        random.shuffle(
            answers
        )

        correct_index = answers.index(
            correct_answer
        )

        questions.append({
            "question": clean_text(
                item["question"]
            ),
            "answers": answers,
            "correct": correct_index,
            "explanation": (
                f"La bonne réponse est "
                f"« {correct_answer} »."
            ),
            "difficulty": difficulty,
            "category": item.get(
                "category",
                "General Knowledge"
            )
        })

    if not questions:

        raise HTTPException(
            status_code=404,
            detail="Aucune question disponible."
        )

    translated = False

    if language != "English":

        try:

            questions, translated = (
                await translate_questions(
                    questions,
                    language,
                    country
                )
            )

        except Exception as error:

            print(
                "Erreur traduction OpenRouter :",
                repr(error)
            )

            raise HTTPException(
                status_code=502,
                detail=(
                    "La traduction du quiz a échoué. "
                    "Vérifie OpenRouter puis réessaie."
                )
            )

    # =====================================================
    # CREATION D'UNE SESSION SECURISEE
    # =====================================================

    quiz_id = secrets.token_urlsafe(32)

    correct_answers = {}

    public_questions = []

    for index, question in enumerate(
        questions
    ):

        question_id = str(index)

        correct_answers[
            question_id
        ] = question["correct"]

        public_questions.append({
            "question_id": question_id,
            "question": question["question"],
            "answers": question["answers"],
            "explanation": question["explanation"],
            "difficulty": question["difficulty"],
            "category": question["category"]
        })

    quiz_sessions[quiz_id] = {
        "user_id": current_user_id,
        "correct_answers": correct_answers,
        "expires_at": (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=SESSION_DURATION_MINUTES
            )
        )
    }

    return TriviaResponse(
        quiz_id=quiz_id,
        questions=public_questions,
        language=language,
        translated=translated
    )


# =========================================================
# VERIFIER LE QUIZ
# =========================================================

@router.post("/questions/check")
def check_trivia_quiz(
    quiz_id: str,
    data: QuizAnswers,
    current_user_id: int = Depends(get_current_user)
):

    cleanup_expired_sessions()

    session = quiz_sessions.get(
        quiz_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail=(
                "Quiz introuvable ou expiré. "
                "Lance un nouveau quiz."
            )
        )

    # Le quiz appartient-il bien à cet utilisateur ?
    if session["user_id"] != current_user_id:

        raise HTTPException(
            status_code=403,
            detail="Ce quiz ne t'appartient pas."
        )

    correct_answers = session[
        "correct_answers"
    ]

    answers = data.answers

    if len(answers) > 50:

        raise HTTPException(
            status_code=400,
            detail="Trop de réponses envoyées."
        )

    score = 0
    corrections = []

    for question_id, user_answer in answers.items():

        if question_id not in correct_answers:
            continue

        if not isinstance(
            user_answer,
            int
        ):
            continue

        correct_index = correct_answers[
            question_id
        ]

        correct = (
            user_answer == correct_index
        )

        if correct:
            score += 1

        corrections.append({
            "question_id": question_id,
            "your_answer": user_answer,
            "correct": correct
        })

    total = len(correct_answers)

    # Le résultat ne peut être envoyé qu'une seule fois.
    del quiz_sessions[quiz_id]

    return {
        "score": score,
        "total": total,
        "corrections": corrections
    }