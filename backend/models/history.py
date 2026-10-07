from sqlalchemy import Column, Integer
from database import Base


class QuestionHistory(Base):
    __tablename__ = "question_history"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, nullable=False)
    question_id = Column(Integer, nullable=False)