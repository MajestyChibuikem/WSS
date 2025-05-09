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
#delete category
from sqlalchemy.exc import IntegrityError

@category_bp.route('/delete/<int:category_id>', methods=['DELETE'])
@jwt_required()
def delete_category(category_id):
    current_user_id = get_jwt_identity()

    # Fetch the category by ID
    category = Category.query.get(category_id)

    # Check if the category exists
    if not category:
        return jsonify({'message': 'Category not found'}), 404

    # Check if the current user has permission to delete the category
    # if category.created_by != current_user_id:
    #     return jsonify({'message': 'You do not have permission to delete this category'}), 403

    try:
        # Delete the category (this will cascade to delete all associated products)
        db.session.delete(category)
        db.session.commit()

        return jsonify({'message': 'Category and all associated products deleted successfully'}), 200

    except IntegrityError as e:
        # Rollback in case of database integrity error
        db.session.rollback()
        return jsonify({'message': 'An error occurred while deleting the category', 'error': str(e)}), 500