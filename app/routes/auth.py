from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app import db
from app.utils.logger import log_action

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({'token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

@bp.route('/create_user', methods=['POST'])
@jwt_required()
def create_user():
    current_user = User.query.get(get_jwt_identity())
    if not current_user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    new_user.is_admin = data.get('is_admin', False)
    
    db.session.add(new_user)
    db.session.commit()
    
    log_action(current_user.id, 'CREATE_USER', f'Created user: {data["username"]}')
    return jsonify({'message': 'User created successfully'}), 201