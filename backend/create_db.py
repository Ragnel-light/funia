from database import Base, engine

from models.user import User
from models.quiz import Question
from models.history import QuestionHistory

Base.metadata.create_all(bind=engine)

print("Database created successfully!")