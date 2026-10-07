from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, EmailStr
from pwdlib import PasswordHash
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

from database import SessionLocal
from models.user import User


router = APIRouter()

password_hash = PasswordHash.recommended()

security = HTTPBearer()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY n'est pas configurée dans les variables d'environnement."
    )

ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 1


# =========================================================
# SCHEMAS
# =========================================================

class RegisterPayload(BaseModel):

    username: str = Field(
        min_length=3,
        max_length=30
    )

    email: EmailStr

    password: str = Field(
        min_length=6,
        max_length=100
    )

    age: int = Field(
        ge=5,
        le=100
    )

    country: str = Field(
        min_length=2,
        max_length=50
    )

    region: str = Field(
        default="",
        max_length=100
    )

    level: str = Field(
        default="",
        max_length=50
    )


class LoginPayload(BaseModel):

    email: EmailStr

    password: str = Field(
        min_length=1,
        max_length=100
    )


# =========================================================
# CREATION DU TOKEN
# =========================================================

def create_access_token(user_id: int):

    expire = (
        datetime.utcnow()
        + timedelta(days=TOKEN_EXPIRE_DAYS)
    )

    payload = {
        "user_id": user_id,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =========================================================
# VERIFICATION DU TOKEN
# =========================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Token invalide."
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Token invalide ou expiré."
        )

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

        return user.id

    finally:

        db.close()


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(
    data: RegisterPayload
):

    db = SessionLocal()

    try:

        # Vérification email
        existing_email = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )

        if existing_email:

            raise HTTPException(
                status_code=400,
                detail="Cet email est déjà utilisé."
            )


        # Vérification username
        existing_username = (
            db.query(User)
            .filter(User.username == data.username)
            .first()
        )

        if existing_username:

            raise HTTPException(
                status_code=400,
                detail="Ce nom d'utilisateur existe déjà."
            )


        # Hash du mot de passe
        hashed_password = password_hash.hash(
            data.password
        )


        # Création du compte
        user = User(

            username=data.username.strip(),

            email=data.email,

            password=hashed_password,

            age=data.age,

            country=data.country.strip(),

            region=data.region.strip(),

            level=data.level.strip(),

            xp=0,

            coins=100,

            quizzes_played=0,

            games_played=0,

            best_quiz_score=0
        )


        db.add(user)

        db.commit()

        db.refresh(user)


        # Création du token
        token = create_access_token(
            user.id
        )


        return {

            "message":
                "Compte créé !",

            "access_token":
                token,

            "token_type":
                "bearer",

            "user_id":
                user.id,

            "username":
                user.username,

            "xp":
                user.xp,

            "coins":
                user.coins,

            "quizzes_played":
                user.quizzes_played,

            "games_played":
                user.games_played,

            "best_quiz_score":
                user.best_quiz_score
        }

    finally:

        db.close()


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(
    data: LoginPayload
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.email == data.email)
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=401,
                detail="Email incorrect."
            )


        # Vérification du mot de passe
        try:

            password_correct = (
                password_hash.verify(
                    data.password,
                    user.password
                )
            )

        except Exception:

            password_correct = False


        if not password_correct:

            raise HTTPException(
                status_code=401,
                detail="Mot de passe incorrect."
            )


        # Création du JWT
        token = create_access_token(
            user.id
        )


        return {

            "message":
                "Connexion réussie.",

            "access_token":
                token,

            "token_type":
                "bearer",

            "user_id":
                user.id,

            "username":
                user.username
        }

    finally:

        db.close()


# =========================================================
# PROFIL DE L'UTILISATEUR CONNECTÉ
# =========================================================

@router.get("/users/me")
def get_my_profile(
    user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )


        level_number = (
            user.xp // 100
        ) + 1


        return {

            "id":
                user.id,

            "username":
                user.username,

            "email":
                user.email,

            "country":
                user.country,

            "region":
                user.region,

            "level":
                user.level,

            "level_number":
                level_number,

            "age":
                user.age,

            "xp":
                user.xp,

            "coins":
                user.coins,

            "quizzes_played":
                user.quizzes_played,

            "games_played":
                user.games_played,

            "best_quiz_score":
                user.best_quiz_score
        }

    finally:

        db.close()


# =========================================================
# AJOUT XP
# =========================================================
#
# Route protégée par JWT.
#
# IMPORTANT :
# Le frontend ne choisit PAS combien d'XP il veut ajouter.
#
# Cette route donne une récompense fixe.
# =========================================================

@router.post("/users/me/add-xp")
def add_xp(
    user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )


        # Récompense décidée par le serveur
        xp_earned = 10

        coins_earned = (
            xp_earned // 2
        )


        user.xp += xp_earned

        user.coins += coins_earned


        db.commit()

        db.refresh(user)


        level_number = (
            user.xp // 100
        ) + 1


        return {

            "message":
                "XP ajoutée.",

            "xp_gained":
                xp_earned,

            "xp":
                user.xp,

            "coins_gained":
                coins_earned,

            "coins":
                user.coins,

            "level":
                level_number
        }

    finally:

        db.close()


# =========================================================
# RESULTAT MEMORY
# =========================================================
#
# Le frontend envoie le score du Memory.
#
# Le serveur vérifie que :
#
# score >= 0
# score <= 800
#
# car le Memory possède 8 paires
# à 100 points chacune.
# =========================================================

@router.post("/users/me/game-result")
def game_result(
    score: int,
    user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )


        # Validation du score
        if score < 0:

            raise HTTPException(
                status_code=400,
                detail="Score invalide."
            )


        # Maximum du Memory actuel :
        # 8 paires × 100 points = 800
        if score > 800:

            raise HTTPException(
                status_code=400,
                detail="Score Memory invalide."
            )


        # XP calculée côté serveur
        xp_earned = score

        coins_earned = (
            xp_earned // 2
        )


        user.xp += xp_earned

        user.coins += coins_earned

        user.games_played += 1


        db.commit()

        db.refresh(user)


        level_number = (
            user.xp // 100
        ) + 1


        return {

            "message":
                "Jeu enregistré.",

            "score":
                score,

            "xp_gained":
                xp_earned,

            "xp":
                user.xp,

            "coins_gained":
                coins_earned,

            "coins":
                user.coins,

            "games_played":
                user.games_played,

            "level":
                level_number
        }

    finally:

        db.close()


# =========================================================
# RESULTAT QUIZ
# =========================================================
#
# Le frontend envoie uniquement le SCORE.
#
# Il n'envoie plus :
#
# xp=999999
#
# Le serveur calcule lui-même :
#
# XP = score × 10
# =========================================================

@router.post("/users/me/quiz-result")
def quiz_result(
    score: int,
    user_id: int = Depends(get_current_user)
):

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )


        if not user:

            raise HTTPException(
                status_code=404,
                detail="Utilisateur introuvable."
            )


        # Score négatif impossible
        if score < 0:

            raise HTTPException(
                status_code=400,
                detail="Score invalide."
            )


        # Protection contre les scores absurdes
        if score > 100:

            raise HTTPException(
                status_code=400,
                detail="Score trop élevé."
            )


        # XP calculée par le serveur
        xp_earned = (
            score * 10
        )


        coins_earned = (
            xp_earned // 2
        )


        user.xp += xp_earned

        user.coins += coins_earned

        user.quizzes_played += 1


        # Meilleur score
        if score > user.best_quiz_score:

            user.best_quiz_score = score


        db.commit()

        db.refresh(user)


        level_number = (
            user.xp // 100
        ) + 1


        return {

            "message":
                "Résultat du quiz enregistré.",

            "score":
                score,

            "xp_gained":
                xp_earned,

            "xp":
                user.xp,

            "coins_gained":
                coins_earned,

            "coins":
                user.coins,

            "quizzes_played":
                user.quizzes_played,

            "best_quiz_score":
                user.best_quiz_score,

            "level":
                level_number
        }

    finally:

        db.close()