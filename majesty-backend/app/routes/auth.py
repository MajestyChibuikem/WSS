# app/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User, Role
from app import db
from app.utils.logger import log_action


auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

from flask_jwt_extended import create_access_token

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        log_action(None, 'LOGIN_ATTEMPT', 'Failed login attempt - missing credentials')
        return jsonify({'message': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        # Include user roles and admin status in additional claims
        user_roles = [role.name for role in user.roles]
        additional_claims = {
            'roles': user_roles,
            'is_admin': user.is_admin
        }

        # Create a JWT with the user's ID as the identity (must be a string)
        # and the additional claims as the JWT body itself
        #the token was a dictionary
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)
        
        log_action(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', 
                  additional_data={'username': user.username, 'roles': user_roles})
        return jsonify({
            'token': access_token,
            'roles': user_roles,
            'is_admin': user.is_admin
        }), 200
    
    log_action(None, 'LOGIN_FAILURE', 'Invalid login attempt', 
              additional_data={'attempted_username': data.get('username')})
    return jsonify({'message': 'Invalid credentials'}), 401
@auth_bp.route('/create_user', methods=['POST'])
@jwt_required()
def create_user():
    current_user_id = get_jwt_identity()
    try:
        if isinstance(current_user_id, dict):
            current_user_id = current_user_id.get('id')
            
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.can_manage_users():
            log_action(current_user_id, 'CREATE_USER_UNAUTHORIZED', 
                      'Unauthorized attempt to create user')
            return jsonify({'message': 'Unauthorized - only admins can create users'}), 403
        
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
        
        # Assign roles
        roles = data.get('roles', [])
        for role_name in roles:
            new_user.add_role(role_name)
        
        db.session.add(new_user)
        db.session.commit()
        
        log_action(current_user_id, 'CREATE_USER_SUCCESS', 
                  f'Created user: {data["username"]}',
                  additional_data={
                      'new_user_id': new_user.id,
                      'is_admin': new_user.is_admin,
                      'roles': roles
                  })
        return jsonify({
            'message': 'User created successfully', 
            'user_id': new_user.id,
            'roles': [role.name for role in new_user.roles]
        }), 201
    
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
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    log_action(current_user_id, 'LOGOUT', 'User logged out')
    
    # In a production app, you might implement token blacklisting here
    return jsonify({'message': 'Successfully logged out'}), 200

@auth_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.can_manage_users():
        log_action(current_user_id, 'GET_USERS_UNAUTHORIZED', 
                  'Unauthorized attempt to view users')
        return jsonify({'message': 'Unauthorized - only admins can view user records'}), 403
    
    users = User.query.all()
    user_list = []
    
    for user in users:
        user_data = {
            'id': user.id,
            'username': user.username,
            'created_at': user.created_at.isoformat(),
            'is_admin': user.is_admin,
            'roles': [role.name for role in user.roles]
        }
        user_list.append(user_data)
    
    log_action(current_user_id, 'GET_USERS_SUCCESS', 'Admin retrieved user list')
    return jsonify({'users': user_list}), 200

@auth_bp.route('/user/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.can_manage_users():
        log_action(current_user_id, 'GET_USER_UNAUTHORIZED', 
                  f'Unauthorized attempt to view user {user_id}')
        return jsonify({'message': 'Unauthorized - only admins can view user details'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    user_data = {
        'id': user.id,
        'username': user.username,
        'created_at': user.created_at.isoformat(),
        'is_admin': user.is_admin,
        'roles': [role.name for role in user.roles]
    }
    
    log_action(current_user_id, 'GET_USER_SUCCESS', f'Admin retrieved user details for user {user_id}')
    return jsonify({'user': user_data}), 200

@auth_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """
    Update a user's details (username, password, roles, or admin status).
    - Admins can update any user.
    - Non-admins can only update their own username/password.
    - Roles can be sent as a string (e.g., "admin") or array (e.g., ["admin", "staff"]).
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    target_user = User.query.get(user_id)

    # Check if target user exists
    if not target_user:
        log_action(current_user_id, 'UPDATE_USER_ERROR', f'User not found: {user_id}')
        return jsonify({"message": "User not found"}), 404

    # Check permissions
    is_admin = current_user.can_manage_users()
    if current_user_id != target_user.id and not is_admin:
        log_action(current_user_id, 'UPDATE_USER_ERROR', 'Unauthorized attempt to update user')
        return jsonify({"message": "Unauthorized"}), 403

    data = request.get_json()
    if not data:
        log_action(current_user_id, 'UPDATE_USER_ERROR', 'No data provided for update')
        return jsonify({"message": "No data provided"}), 400

    # Update username (if provided)
    if 'username' in data:
        new_username = data['username']
        if User.query.filter(User.username == new_username).first() and new_username != target_user.username:
            log_action(current_user_id, 'UPDATE_USER_ERROR', f'Username already exists: {new_username}')
            return jsonify({"message": "Username already exists"}), 400
        target_user.username = new_username

    # Update password (if provided)
    if 'password' in data:
        target_user.set_password(data['password'])

    # Only admins can update roles or admin status
    if is_admin:
        # Update is_admin status (if provided)
        if 'is_admin' in data:
            target_user.is_admin = data['is_admin']

        # Update roles (if provided)
        if 'roles' in data:
            # Convert roles to a list if it's a string
            roles = data['roles']
            if isinstance(roles, str):
                roles = [role.strip() for role in roles.split(',')]  # Handle "admin" or "admin, staff"

            # Validate roles exist
            valid_roles = Role.query.filter(Role.name.in_(roles)).all()
            valid_role_names = [role.name for role in valid_roles]
            invalid_roles = set(roles) - set(valid_role_names)
            
            if invalid_roles:
                log_action(current_user_id, 'UPDATE_USER_ERROR', f'Invalid roles: {invalid_roles}')
                return jsonify({"message": f"Invalid roles: {', '.join(invalid_roles)}"}), 400

            # Clear existing roles
            for role in list(target_user.roles):
                target_user.roles.remove(role)
            
            # Add new roles
            for role_name in valid_role_names:
                role = Role.query.filter_by(name=role_name).first()
                if role and role not in target_user.roles:
                    target_user.roles.append(role)

            # Sync is_admin with admin role
            target_user.is_admin = 'admin' in valid_role_names

    try:
        db.session.commit()
        log_action(current_user_id, 'UPDATE_USER_SUCCESS', f'User updated: {user_id}')
        return jsonify({
            "message": "User updated successfully",
            "user": {
                "id": target_user.id,
                "username": target_user.username,
                "is_admin": target_user.is_admin,
                "roles": [role.name for role in target_user.roles]
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'UPDATE_USER_ERROR', str(e), level='error')
        return jsonify({"message": f"Error updating user: {str(e)}"}), 500
    
@auth_bp.route('/user/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.can_manage_users():
        log_action(current_user_id, 'DELETE_USER_UNAUTHORIZED', 
                  f'Unauthorized attempt to delete user {user_id}')
        return jsonify({'message': 'Unauthorized - only admins can delete users'}), 403
    
    # Prevent deleting yourself
    if int(current_user_id) == user_id:
        log_action(current_user_id, 'DELETE_USER_SELF', 
                  'Attempted to delete own account')
        return jsonify({'message': 'Cannot delete your own account'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    username = user.username
    db.session.delete(user)
    db.session.commit()
    
    log_action(current_user_id, 'DELETE_USER_SUCCESS', 
              f'Deleted user {username} (ID: {user_id})')
    
    return jsonify({'message': f'User {username} deleted successfully'}), 200