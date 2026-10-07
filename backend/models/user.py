from sqlalchemy import Column, Integer, String
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    age = Column(Integer)
    country = Column(String)
    region = Column(String)
    level = Column(String)

    # ===== FUNIA STATS =====
    xp = Column(Integer, default=0)
    coins = Column(Integer, default=100)
    quizzes_played = Column(Integer, default=0)
    games_played = Column(Integer, default=0)
    best_quiz_score = Column(Integer, default=0)