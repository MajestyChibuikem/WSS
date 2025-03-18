from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
jwt = JWTManager()

# Token Blacklisting Logic
@jwt.token_in_blocklist_loader
def check_if_token_is_blacklisted(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    from app.models.models import BlacklistedToken
    token = BlacklistedToken.query.filter_by(jti=jti).first()
    return token is not None