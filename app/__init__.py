from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()
migrate = Migrate()

def create_app(config_class=None):
    app = Flask(__name__)

    # Load configuration based on FLASK_ENV
    if not config_class:
        env = os.environ.get('FLASK_ENV', 'development')
        if env == 'production':
            from config.production import ProductionConfig
            config_class = ProductionConfig
        else:
            from config.development import DevelopmentConfig
            config_class = DevelopmentConfig

    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints (definitive registrations)
    from app.routes.auth import auth_bp
    from app.routes.cart import carts_bp
    from app.routes.invoice import invoices_bp
    from app.routes.invoice_items import invoice_items_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(carts_bp)
    app.register_blueprint(invoices_bp)
    app.register_blueprint(invoice_items_bp)

    # Automatically create roles and admin user
    with app.app_context():
        db.create_all()  # Create tables if they don't exist
        from app.models import User
        User.initialize_roles_and_admin()  # Initialize roles and admin user

    return app