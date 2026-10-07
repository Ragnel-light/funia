from sqlalchemy import Column, Integer, String, Text
from database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    question = Column(Text, nullable=False)

    option_a = Column(String, nullable=False)
    option_b = Column(String, nullable=False)
    option_c = Column(String, nullable=False)
    option_d = Column(String, nullable=False)

    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=False)

    category = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)

    country = Column(String, default="all")
    level = Column(String, default="all")