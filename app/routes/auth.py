# app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app import db
from app.utils.logger import log_action


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        log_action(None, 'LOGIN_ATTEMPT', 'Failed login attempt - missing credentials')
        return jsonify({'message': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=str(user.id))
        log_action(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', 
                  additional_data={'username': user.username})
        return jsonify({'token': access_token}), 200
    
    log_action(None, 'LOGIN_FAILURE', 'Invalid login attempt', 
              additional_data={'attempted_username': data.get('username')})
    return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/create_user', methods=['POST'])
@jwt_required()
def create_user():
    current_user_id = get_jwt_identity()
    try:
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            log_action(current_user_id, 'CREATE_USER_UNAUTHORIZED', 
                      'Unauthorized attempt to create user')
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            log_action(current_user_id, 'CREATE_USER_INVALID', 
                      'Invalid user creation attempt - missing fields')
            return jsonify({'message': 'Username and password are required'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            log_action(current_user_id, 'CREATE_USER_DUPLICATE', 
                      f'Attempted to create duplicate user: {data["username"]}')
            return jsonify({'message': 'Username already exists'}), 409
        
        new_user = User(username=data['username'])
        new_user.set_password(data['password'])
        new_user.is_admin = data.get('is_admin', False)
        
        db.session.add(new_user)
        db.session.commit()
        
        log_action(current_user_id, 'CREATE_USER_SUCCESS', 
                  f'Created user: {data["username"]}',
                  additional_data={
                      'new_user_id': new_user.id,
                      'is_admin': new_user.is_admin
                  })
        return jsonify({'message': 'User created successfully', 'user_id': new_user.id}), 201
    
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'CREATE_USER_ERROR', 
                  f'Failed to create user: {str(e)}',
                  level='error')
        return jsonify({'message': 'An error occurred while creating the user'}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWT doesn't have a built-in logout mechanism, but we can log the action
    current_user_id = get_jwt_identity()
    log_action(current_user_id, 'LOGOUT', 'User logged out')
    
    # In a production app, you might implement token blacklisting here
    return jsonify({'message': 'Successfully logged out'}), 200