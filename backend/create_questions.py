from database import Base, engine
from models.quiz import Question

Base.metadata.create_all(bind=engine)

print("Questions table created!")
