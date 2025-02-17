from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config.development import DevelopmentConfig

from app.utils.database import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)

    db.init_app(app)
    JWTManager(app)
    
    with app.app_context():
        db.create_all()
    
    from app.routes.auth import auth_bp
    from app.routes.products import product_bp
    from app.routes.invoice import invoice_bp
    from app.routes.cart import cart_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(product_bp, url_prefix='/products')
    app.register_blueprint(invoice_bp, url_prefix='/invoice')
    app.register_blueprint(cart_bp, url_prefix='/cart')
    
    return app