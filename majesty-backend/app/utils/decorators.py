from functools import wraps
from flask import request, jsonify
import jwt  # Ensure you have imported the jwt library (usually PyJWT)
from app import db
from config.development import DevelopmentConfig  # Make sure you import your config where the SECRET_KEY is defined

def extract_jti(token: str) -> str:
    """
    Extract the JWT ID (jti) from the token.
    """
    try:
        from config.development import DevelopmentConfig  # Import your config class
        decoded_token = jwt.decode(token, DevelopmentConfig.JWT_SECRET_KEY, algorithms=["HS256"])

        return decoded_token.get("jti")  # Extract the 'jti' field
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def is_token_blacklisted(token: str) -> bool:
    """
    Check if the given token's jti is blacklisted.
    """
    from app.models import BlacklistedToken  # Import here to avoid circular import
    
    jti = extract_jti(token)
    if not jti:
        return True  # Token is invalid or expired, treat it as blacklisted

    # Check if the jti exists in the database
    blacklisted = BlacklistedToken.query.filter_by(jti=jti).first()
    return blacklisted is not None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        # Remove 'Bearer ' prefix if it exists
        if token.startswith("Bearer "):
            token = token.split(" ")[1]

        # Check if token is blacklisted
        if is_token_blacklisted(token):
            return jsonify({"message": "Unauthorized!: User has been logged out"}), 401

        return f(*args, **kwargs)
    return decorated
