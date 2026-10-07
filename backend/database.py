
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


# =========================
# DATABASE
# =========================

DATABASE_URL = os.getenv("DATABASE_URL")


# =========================
# LOCAL : SQLite
# ONLINE : PostgreSQL
# =========================

if DATABASE_URL:
    # Render / PostgreSQL
    engine = create_engine(DATABASE_URL)

else:
    # Local development
    DATABASE_URL = "sqlite:///./funia.db"

    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )


# =========================
# SESSION
# =========================

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# =========================
# BASE
# =========================

Base = declarative_base()

