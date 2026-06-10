from pydantic_settings import BaseSettings
import os
import re

_HERE = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_DB_PATH = os.path.normpath(os.path.join(_HERE, "..", "..", "..", "..", ".emp_pro.db"))


def _normalize_db_url(url: str) -> str:
    """
    Convert a raw DATABASE_URL to a SQLAlchemy-compatible URL.
    - mysql://  → mysql+pymysql://  (PyMySQL driver)
    - Strips ?ssl-mode=... query params (SSL handled via connect_args)
    """
    if url.startswith("mysql://"):
        url = "mysql+pymysql://" + url[len("mysql://"):]
    # Remove ssl-mode query param — PyMySQL handles SSL via connect_args
    url = re.sub(r"[?&]ssl-mode=[^&]*", "", url)
    url = re.sub(r"[?&]ssl_mode=[^&]*", "", url)
    return url.rstrip("?&")


class Settings(BaseSettings):
    # If MYSQL_URL is set, it takes priority over local SQLite DB_PATH
    MYSQL_URL: str = ""
    DB_PATH: str = _DEFAULT_DB_PATH

    SECRET_KEY: str = "emp-pro-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    @property
    def database_url(self) -> str:
        if self.MYSQL_URL:
            return _normalize_db_url(self.MYSQL_URL)
        return f"sqlite:///{self.DB_PATH}"

    class Config:
        env_file = ".env"


settings = Settings()
