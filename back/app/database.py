import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()


def get_database_url() -> str:
    url = os.getenv("DATABASE_URL", "")
    if not url:
        return ""
    if "sslmode=" not in url:
        separator = "&" if "?" in url else "?"
        url = f"{url}{separator}sslmode=require"
    return url


DATABASE_URL = get_database_url()

engine = (
    create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
)

SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
    if engine
    else None
)


class Base(DeclarativeBase):
    pass


def get_db():
    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL não configurada. Copie .env.example para .env e preencha a variável."
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
