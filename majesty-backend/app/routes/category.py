from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Category, User, db

category_bp = Blueprint('category', __name__, url_prefix='/categories')

@category_bp.route('/create', methods=['POST'])
@jwt_required()
def create_category():
    current_user = User.query.get(get_jwt_identity())
    if not current_user.can_manage_categories():
        return jsonify({"msg": "Insufficient permissions"}), 403

    data = request.get_json()
    if not data.get('name'):
        return jsonify({"msg": "Category name required"}), 400

    if Category.query.filter_by(name=data['name']).first():
        return jsonify({"msg": "Category already exists"}), 400

    new_category = Category(
        name=data['name'],
        description=data.get('description'),
        created_by=current_user.id
    )
    db.session.add(new_category)
    db.session.commit()
    return jsonify(new_category.to_dict()), 201

@category_bp.route('/get', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories]), 200