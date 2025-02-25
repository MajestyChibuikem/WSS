import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config.development import DevelopmentConfig
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()





def create_app(config=None):
    app = Flask(__name__,instance_relative_config=True)



    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev-key-please-change'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'postgresql://wineuser:winepassword@db:5432/wineinventory'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key-please-change'),
        JWT_ACCESS_TOKEN_EXPIRES=86400, #24hour expiry for the token
    )


    #load the config 
    if config:
        app.config.from_object(config)

    #load the extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    

    #configure logging
    from app.utils import logger
    logger.init_app(app)

    #register my blueprints
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, urll_prefix = '/auth')




    #create database tables if context is true
    if app.config.get('ENV') == 'development':
        with app.app_context():
            db.create_all()
    
    return app