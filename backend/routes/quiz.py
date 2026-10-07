from fastapi import APIRouter
from database import SessionLocal
from models.quiz import Question
from pydantic import BaseModel
from sqlalchemy.sql.expression import func

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

    query = db.query(Question)

    if category != "all":
        query = query.filter(Question.category == category)

    if difficulty != "all":
        query = query.filter(Question.difficulty == difficulty)

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

    questions = query.order_by(func.random()).limit(number).all()

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

    db.close()

    return {
        "number": len(result),
        "questions": result
    }
@router.post("/quiz/check")
def check_quiz(data: QuizAnswers):
    db = SessionLocal()

    answers = data.answers
    score = 0
    corrections = []

    for question_id, user_answer in answers.items():

        question = db.query(Question).filter(
            Question.id == int(question_id)
        ).first()

        if not question:
            continue

        correct = question.correct_answer

        if user_answer.upper() == correct.upper():
            score += 1
            correct_result = True
        else:
            correct_result = False

        corrections.append({
            "question_id": question.id,
            "question": question.question,
            "your_answer": user_answer,
            "correct_answer": correct,
            "correct": correct_result,
            "explanation": question.explanation
        })

    db.close()

    return {
        "score": score,
        "total": len(corrections),
        "corrections": corrections
    }