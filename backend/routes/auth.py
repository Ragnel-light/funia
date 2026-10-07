from fastapi import APIRouter, HTTPException
from pwdlib import PasswordHash
from jose import jwt
from datetime import datetime, timedelta

from database import SessionLocal
from models.user import User

router = APIRouter()

password_hash = PasswordHash.recommended()

SECRET_KEY = "funia-secret-key-change-later"
ALGORITHM = "HS256"


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(
    username: str,
    email: str,
    password: str,
    age: int,
    country: str,
    region: str = "",
    level: str = ""
):
    db = SessionLocal()

    try:

        if db.query(User).filter(User.email == email).first():
            raise HTTPException(
                status_code=400,
                detail="Cet email est déjà utilisé."
            )

        if db.query(User).filter(User.username == username).first():
            raise HTTPException(
                status_code=400,
                detail="Ce nom d'utilisateur existe déjà."
            )

        user = User(
            username=username,
            email=email,
            password=password_hash.hash(password),
            age=age,
            country=country,
            region=region,
            level=level,

            xp=0,
            coins=100,
            quizzes_played=0,
            games_played=0,
            best_quiz_score=0
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "Compte créé !",
            "user_id": user.id,
            "username": user.username,
            "xp": user.xp,
            "coins": user.coins,
            "quizzes_played": user.quizzes_played,
            "games_played": user.games_played,
            "best_quiz_score": user.best_quiz_score
        }

    finally:
        db.close()


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(email: str, password: str):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Email incorrect."
            )

        if not password_hash.verify(
            password,
            user.password
        ):
            raise HTTPException(
                status_code=401,
                detail="Mot de passe incorrect."
            )

        token = jwt.encode(
            {
                "user_id": user.id,
                "exp": datetime.utcnow() + timedelta(days=1)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )

        return {
            "access_token": token,
            "user_id": user.id,
            "username": user.username
        }

    finally:
        db.close()


# =========================================================
# PROFILE
# =========================================================

@router.get("/users/{user_id}")
def get_user(user_id: int):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )

        # Niveau calculé à partir de l'XP
        level_number = (user.xp // 100) + 1

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "country": user.country,
            "region": user.region,
            "level": user.level,
            "level_number": level_number,
            "age": user.age,

            "xp": user.xp,
            "coins": user.coins,
            "quizzes_played": user.quizzes_played,
            "games_played": user.games_played,
            "best_quiz_score": user.best_quiz_score
        }

    finally:
        db.close()


# =========================================================
# ADD XP
# =========================================================

@router.post("/users/{user_id}/add-xp")
def add_xp(
    user_id: int,
    xp: int
):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )

        if xp <= 0:
            raise HTTPException(
                status_code=400,
                detail="Le nombre d'XP doit être supérieur à 0."
            )

        user.xp += xp

        user.coins += xp // 2

        db.commit()
        db.refresh(user)

        level_number = (user.xp // 100) + 1

        return {
            "message": "XP ajoutée.",
            "xp": user.xp,
            "coins": user.coins,
            "level": level_number
        }

    finally:
        db.close()


# =========================================================
# GAME RESULT
# =========================================================

@router.post("/users/{user_id}/game-result")
def game_result(
    user_id: int,
    xp: int
):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )

        if xp < 0:
            raise HTTPException(
                status_code=400,
                detail="XP invalide."
            )

        user.xp += xp

        user.coins += xp // 2

        user.games_played += 1

        db.commit()
        db.refresh(user)

        level_number = (user.xp // 100) + 1

        return {
            "message": "Jeu enregistré.",
            "xp": user.xp,
            "coins": user.coins,
            "games_played": user.games_played,
            "level": level_number
        }

    finally:
        db.close()


# =========================================================
# QUIZ RESULT
# =========================================================

@router.post("/users/{user_id}/quiz-result")
def quiz_result(
    user_id: int,
    score: int,
    xp: int
):

    db = SessionLocal()

    try:

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if not user:
            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )

        if score < 0:
            raise HTTPException(
                status_code=400,
                detail="Score invalide."
            )

        if xp < 0:
            raise HTTPException(
                status_code=400,
                detail="XP invalide."
            )

        user.xp += xp

        user.coins += xp // 2

        user.quizzes_played += 1

        if score > user.best_quiz_score:
            user.best_quiz_score = score

        db.commit()
        db.refresh(user)

        level_number = (user.xp // 100) + 1

        return {
            "message": "Résultat du quiz enregistré.",
            "xp": user.xp,
            "coins": user.coins,
            "quizzes_played": user.quizzes_played,
            "best_quiz_score": user.best_quiz_score,
            "level": level_number
        }

    finally:
        db.close()