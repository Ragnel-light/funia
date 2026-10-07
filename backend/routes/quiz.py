from fastapi import APIRouter, Depends
from database import SessionLocal
from models.quiz import Question
from pydantic import BaseModel
from sqlalchemy.sql.expression import func

from routes.auth import get_current_user


router = APIRouter()


class QuizAnswers(BaseModel):
    answers: dict[str, str]


@router.get("/quiz")
def get_quiz(
    category: str = "all",
    difficulty: str = "all",
    country: str = "all",
    level: str = "all",
    number: int = 10
):
    db = SessionLocal()

    try:
        # Limite de sécurité
        if number < 1:
            number = 1

        if number > 50:
            number = 50

        query = db.query(Question)

        if category != "all":
            query = query.filter(
                Question.category == category
            )

        if difficulty != "all":
            query = query.filter(
                Question.difficulty == difficulty
            )

        if country != "all":
            query = query.filter(
                (Question.country == country) |
                (Question.country == "all")
            )

        if level != "all":
            query = query.filter(
                (Question.level == level) |
                (Question.level == "all")
            )

        questions = (
            query
            .order_by(func.random())
            .limit(number)
            .all()
        )

        result = []

        for q in questions:
            result.append({
                "id": q.id,
                "question": q.question,
                "options": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d
                },
                "category": q.category,
                "difficulty": q.difficulty
            })

        return {
            "number": len(result),
            "questions": result
        }

    finally:
        db.close()


@router.post("/quiz/check")
def check_quiz(
    data: QuizAnswers,
    current_user_id: int = Depends(get_current_user)
):
    db = SessionLocal()

    try:
        answers = data.answers

        score = 0
        corrections = []

        # Limite du nombre de réponses
        if len(answers) > 50:
            answers = dict(list(answers.items())[:50])

        for question_id, user_answer in answers.items():

            # Vérification de l'identifiant
            try:
                question_id_int = int(question_id)
            except ValueError:
                continue

            question = (
                db.query(Question)
                .filter(Question.id == question_id_int)
                .first()
            )

            if not question:
                continue

            # Vérification de la réponse
            if not isinstance(user_answer, str):
                user_answer = ""

            user_answer = user_answer.strip().upper()
            correct_answer = question.correct_answer.strip().upper()

            if user_answer == correct_answer:
                score += 1
                correct_result = True
            else:
                correct_result = False

            corrections.append({
                "question_id": question.id,
                "question": question.question,
                "your_answer": user_answer,
                "correct_answer": correct_answer,
                "correct": correct_result,
                "explanation": question.explanation
            })

        return {
            "user_id": current_user_id,
            "score": score,
            "total": len(corrections),
            "corrections": corrections
        }

    finally:
        db.close()