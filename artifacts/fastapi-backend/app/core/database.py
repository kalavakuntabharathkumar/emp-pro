from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def _make_sqlite_engine(db_path: str):
    from sqlalchemy import event
    eng = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
        echo=False,
    )

    @event.listens_for(eng, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return eng


def _make_mysql_engine(url: str):
    return create_engine(
        url,
        connect_args={"ssl": {}},
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False,
    )


def _build_engine():
    url = settings.database_url

    if not url.startswith("sqlite"):
        try:
            eng = _make_mysql_engine(url)
            # Test the connection immediately
            with eng.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected to MySQL database.")
            return eng
        except Exception as e:
            logger.warning(
                f"MySQL connection failed ({e}). "
                "Falling back to local SQLite for development."
            )
            # Fall through to SQLite below

    return _make_sqlite_engine(settings.DB_PATH)


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
