from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import User
from app import db
from app.utils.logger import log_action

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login',methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message':'Username and password are required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
