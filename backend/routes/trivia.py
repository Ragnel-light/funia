import html
import json
import os
import random
import re

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel


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


class TriviaQuestion(BaseModel):
    question: str
    answers: list[str]
    correct: int
    explanation: str
    difficulty: str
    category: str


class TriviaResponse(BaseModel):
    questions: list[TriviaQuestion]
    language: str
    translated: bool


def clean_text(text: str) -> str:
    return html.unescape(text)


def extract_json(text: str):
    text = text.strip()

    # Retire les fences markdown éventuelles.
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.I)
    text = re.sub(r"\s*```$", "", text)

    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Cherche le premier objet JSON dans la réponse.
    start = text.find("{")
    end = text.rfind("}")

    if start == -1 or end == -1 or end <= start:
        raise ValueError("Aucun JSON valide trouvé dans la réponse IA.")

    return json.loads(text[start:end + 1])


async def translate_questions(questions, target_language, country):
    if target_language == "English":
        return questions, False

    if not openrouter_client:
        raise RuntimeError("OPENROUTER_API_KEY absente.")

    language_name = LANGUAGE_MAP.get(target_language, target_language)

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
                for answer_index, answer in enumerate(question["answers"])
            ],
            "correct": question["correct"],
            "explanation": question["explanation"]
        })

    country_hint = ""

    if country:
        country_hint = f"Le joueur se trouve au {country}. Utilise un vocabulaire naturel pour ce public."

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
- NE change PAS la valeur 'correct'.
- NE supprime aucune réponse.
- NE change pas le nombre de questions.
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
      "correct": 0,
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
                "content": json.dumps(payload, ensure_ascii=False)
            }
        ]
    )

    content = response.choices[0].message.content or ""
    data = extract_json(content)
    translated_items = data.get("questions", [])

    if len(translated_items) != len(questions):
        raise ValueError("Le nombre de questions traduites est incorrect.")

    result = []

    for original, translated in zip(questions, translated_items):
        answers = translated.get("answers", [])

        if len(answers) != len(original["answers"]):
            raise ValueError("Le nombre de réponses traduites est incorrect.")

        answer_map = {}

        for item in answers:
            idx = item.get("index")
            text = item.get("text")

            if not isinstance(idx, int) or not isinstance(text, str):
                raise ValueError("Réponse traduite invalide.")

            answer_map[idx] = text

        expected_indexes = set(range(len(original["answers"])))

        if set(answer_map.keys()) != expected_indexes:
            raise ValueError("Les index des réponses ont été modifiés.")

        result.append({
            "question": translated.get("question", original["question"]),
            "answers": [answer_map[i] for i in range(len(original["answers"]))],
            "correct": original["correct"],
            "explanation": translated.get("explanation", original["explanation"]),
            "difficulty": original["difficulty"],
            "category": original["category"]
        })

    return result, True


@router.get("/questions", response_model=TriviaResponse)
async def get_questions(
    subject: str = "general",
    difficulty: str = "medium",
    amount: int = 5,
    language: str = "English",
    country: str = ""
):
    amount = max(1, min(int(amount), 50))
    subject = subject.lower()
    difficulty = difficulty.lower()

    if subject == "all":
        subject = "general"

    if subject not in CATEGORY_MAP:
        subject = "general"

    if difficulty == "easy":
        api_difficulty = "easy"
    elif difficulty in ("hard", "extreme"):
        api_difficulty = "hard"
    else:
        api_difficulty = "medium"

    if language not in LANGUAGE_MAP:
        language = "English"

    params = {
        "amount": amount,
        "category": CATEGORY_MAP[subject],
        "difficulty": api_difficulty,
        "type": "multiple",
    }

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(OPEN_TDB_URL, params=params)
            response.raise_for_status()
            data = response.json()
    except Exception as error:
        print("Erreur Open Trivia DB :", repr(error))
        raise HTTPException(
            status_code=502,
            detail="Impossible de contacter la base de questions."
        )

    response_code = data.get("response_code")

    if response_code != 0:
        if response_code == 1:
            detail = "Pas assez de questions disponibles pour cette catégorie et cette difficulté."
        elif response_code == 2:
            detail = "Les paramètres du quiz sont invalides."
        elif response_code == 5:
            detail = "Trop de demandes. Réessaie dans quelques secondes."
        else:
            detail = "La base de questions n'a pas pu fournir de questions."

        raise HTTPException(status_code=400, detail=detail)

    questions = []

    for item in data.get("results", []):
        correct_answer = clean_text(item["correct_answer"])
        answers = [
            correct_answer,
            *[clean_text(a) for a in item["incorrect_answers"]]
        ]
        random.shuffle(answers)

        questions.append({
            "question": clean_text(item["question"]),
            "answers": answers,
            "correct": answers.index(correct_answer),
            "explanation": f"La bonne réponse est « {correct_answer} ».",
            "difficulty": difficulty,
            "category": item.get("category", "General Knowledge")
        })

    if not questions:
        raise HTTPException(status_code=404, detail="Aucune question disponible.")

    translated = False

    if language != "English":
        try:
            questions, translated = await translate_questions(
                questions,
                language,
                country
            )
        except Exception as error:
            # On log l'erreur réelle. Le frontend reçoit également une erreur claire
            # au lieu de prétendre que la traduction a fonctionné.
            print("Erreur traduction OpenRouter :", repr(error))
            raise HTTPException(
                status_code=502,
                detail="La traduction du quiz a échoué. Vérifie OpenRouter puis réessaie."
            )

    return TriviaResponse(
        questions=questions,
        language=language,
        translated=translated
    )
