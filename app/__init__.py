from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
import os
import click  # Import click for CLI commands
from app.utils.logger import init_app as init_logger

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
    init_logger(app)  # Initialize logging
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints (definitive registrations)
    from app.routes.auth import auth_bp
    from app.routes.cart import carts_bp
    from app.routes.invoice import invoices_bp
    from app.routes.invoice_items import invoice_items_bp
    from app.routes.logs import logs_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(carts_bp)
    app.register_blueprint(invoices_bp)
    app.register_blueprint(invoice_items_bp)
    app.register_blueprint(logs_bp)

    # Automatically create tables if they don't exist
    with app.app_context():
        db.create_all()

    # Register CLI commands
    register_cli_commands(app)

    return app

def register_cli_commands(app):
    """Register custom CLI commands."""
    @app.cli.command("create-admin")
    @click.argument("username")
    @click.argument("password")
    def create_admin(username, password):
        """Create an admin user."""
        from app.models import User, Role

        with app.app_context():
            # Create the 'admin' role if it doesn't exist
            admin_role = Role.query.filter_by(name='admin').first()
            if not admin_role:
                admin_role = Role(name='admin')
                db.session.add(admin_role)
                db.session.commit()
                print("Created 'admin' role.")

            # Check if the admin user already exists
            admin = User.query.filter_by(username=username).first()
            if admin:
                print(f"User '{username}' already exists.")
                return

            # Create the admin user
            admin = User(username=username, is_admin=True)  # Set is_admin=True
            admin.set_password(password)
            admin.roles.append(admin_role)  # Assign the 'admin' role
            db.session.add(admin)
            db.session.commit()
            print(f"Admin user '{username}' created successfully!")