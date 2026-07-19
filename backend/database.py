"""
Database configuration and session management.
Uses SQLite for development; change DATABASE_URL in .env for MySQL/PostgreSQL in production.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mediai.db")

# connect_args is required for SQLite to allow multi-threaded access
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency to get a DB session, closes it after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
