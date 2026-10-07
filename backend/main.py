import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine

# Importer les modèles pour que SQLAlchemy connaisse leurs tables
from models.user import User
from models.quiz import Question
from models.history import QuestionHistory

# Importer les routes
from routes.auth import router as auth_router
from routes.quiz import router as quiz_router
from routes.ai import router as ai_router
from routes.trivia import router as trivia_router


# Créer les tables de la base de données si elles n'existent pas
Base.metadata.create_all(bind=engine)


# Créer l'application FastAPI
app = FastAPI(
    title="Funia API",
    description="API du site Funia",
    version="1.0.0",
)


# Configurer CORS pour autoriser le frontend
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "https://funia-lyart.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Enregistrer les routes
app.include_router(auth_router)
app.include_router(quiz_router)
app.include_router(ai_router)
app.include_router(trivia_router)


# Route d'accueil
@app.get("/")
def accueil():
    return {"message": "Bienvenue sur Funia 🚀"}


# Vérifier que l'API fonctionne
@app.get("/health")
def health_check():
    return {"status": "ok"}