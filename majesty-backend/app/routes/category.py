from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import Category, User, db

category_bp = Blueprint('category', __name__, url_prefix='/categories')

@category_bp.route('/create', methods=['POST'])
@jwt_required()
def create_category():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if not data or not data.get('name'):
        return jsonify({'message': 'Category name is required'}), 400

    # Check if category already exists
    if Category.query.filter_by(name=data['name']).first():
        return jsonify({'message': 'Category already exists'}), 409

    # Create the category
    category = Category(
        name=data['name'],
        description=data.get('description', ''),  # Optional field
        created_by=current_user_id  # Automatically set from JWT
    )

    db.session.add(category)
    db.session.commit()

    return jsonify({
        'message': 'Category created successfully',
        'category': category.to_dict()
    }), 201
@category_bp.route('/get', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([c.to_dict() for c in categories]), 200

