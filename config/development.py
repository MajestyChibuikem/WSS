import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()  # Load environment variables from .env
DB_USER = os.getenv("DB_USER")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME")
DB_PASSWORD = quote_plus(os.getenv("DB_PASSWORD"))
class DevelopmentConfig:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')
    DEBUG = True

    # Database Configuration
    SQLALCHEMY_DATABASE_URI = f"mysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret')
