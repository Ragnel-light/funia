
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.quiz import router as quiz_router
from routes.ai import router as ai_router
from routes.trivia import router as trivia_router
from database import Base, engine

from models.user import User
from models.quiz import Question
from models.history import QuestionHistory


# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",

        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================
# ROUTES
# =========================

app.include_router(auth_router)

app.include_router(quiz_router)

app.include_router(ai_router)

app.include_router(trivia_router)


# =========================
# TEST
# =========================

@app.get("/")
def accueil():

    return {
        "message": "Bienvenue sur Funia 🚀"
    }

