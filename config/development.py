import os

class DevelopmentConfig:
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///dev.db"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "default_dev_secret_key")