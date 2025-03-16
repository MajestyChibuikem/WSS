from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql import func
from datetime import datetime
from app.models import User, Wine, Invoice
from app import db
from app.utils.logger import log_action

wine_bp = Blueprint('wine', __name__, url_prefix='/wine')

@wine_bp.route('/total_stock', methods=['GET'])
@jwt_required()
def get_total_stock():
    """Get total wine stock count"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        total_stock = db.session.query(func.sum(Wine.in_stock)).scalar() or 0
        log_action(
            current_user_id, 
            'GET_TOTAL_STOCK', 
            f'Total stock checked: {total_stock}',
            affected_name='Total Stock'  # Affected entity
        )
        return jsonify({'total_stock': total_stock}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_TOTAL_STOCK_ERROR', 
            str(e), 
            level='error',
            affected_name='Total Stock'
        )
        return jsonify({'message': f'Error fetching total stock: {str(e)}'}), 500

@wine_bp.route('/stock-by-category', methods=['GET'])
@jwt_required()
def get_stock_by_category():
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        stock_data = db.session.query(Wine.category, func.sum(Wine.in_stock)).group_by(Wine.category).all()
        if not stock_data:
            log_action(
                current_user_id, 
                'GET_STOCK_BY_CATEGORY', 
                'No stock data found',
                affected_name='Stock by Category'
            )
            return jsonify({'stock_by_category': {}}), 200
        
        result = {row[0]: row[1] for row in stock_data if row[0] is not None}
        log_action(
            current_user_id, 
            'GET_STOCK_BY_CATEGORY', 
            'Stock by category fetched successfully',
            affected_name='Stock by Category'
        )
        return jsonify({'stock_by_category': result}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_STOCK_BY_CATEGORY_ERROR', 
            str(e), 
            level='error',
            affected_name='Stock by Category'
        )
        return jsonify({'message': f'Error fetching stock by category: {str(e)}'}), 500

@wine_bp.route('/add', methods=['POST'])
@jwt_required()
def add_wine():
    """Add a new wine to the inventory."""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(
            current_user_id, 
            'ADD_WINE_ERROR', 
            'Unauthorized attempt to add wine',
            level='error',
            affected_name='Wine Inventory'
        )
        return jsonify({'message': 'Only administrators and super users can add wines'}), 403

    data = request.get_json()
    if not data:
        log_action(
            current_user_id, 
            'ADD_WINE_ERROR', 
            'No data provided for new wine',
            level='error',
            affected_name='Wine Inventory'
        )
        return jsonify({'message': 'No data provided for new wine'}), 400

    required_fields = ['name', 'abv', 'price', 'category', 'bottle_size']
    for field in required_fields:
        if field not in data:
            log_action(
                current_user_id, 
                'ADD_WINE_ERROR', 
                f'Missing required field: {field}',
                level='error',
                affected_name='Wine Inventory'
            )
            return jsonify({'message': f'Missing required field: {field}'}), 400

    try:
        wine = Wine(
            name=data['name'],
            abv=data['abv'],
            price=data['price'],
            category=data['category'],
            bottle_size=data['bottle_size'],
            in_stock=data.get('in_stock', 0),
            added_by=current_user_id
        )
        db.session.add(wine)
        db.session.commit()

        log_action(
            current_user_id, 
            'ADD_WINE_SUCCESS', 
            f'Wine added: {wine.name}',
            affected_name=wine.name  # Affected wine name
        )
        return jsonify({
            'message': 'Wine added successfully',
            'wine': {
                'id': wine.id,
                'name': wine.name,
                'abv': wine.abv,
                'price': float(wine.price),
                'category': wine.category,
                'bottle_size': wine.bottle_size,
                'in_stock': wine.in_stock,
                'added_by': wine.added_by,
                'added_at': wine.added_at.isoformat() if wine.added_at else None
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'ADD_WINE_ERROR', 
            str(e), 
            level='error',
            affected_name='Wine Inventory'
        )
        return jsonify({'message': f'Error adding wine: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>', methods=['PUT'])
@jwt_required()
def update_wine(wine_id):
    """Update a wine's details."""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(
            current_user_id, 
            'UPDATE_WINE_ERROR', 
            'Unauthorized attempt to update wine',
            level='error',
            affected_name='Wine Inventory'
        )
        return jsonify({'message': 'Only administrators and super users can update wines'}), 403

    wine = Wine.query.get(wine_id)
    if not wine:
        log_action(
            current_user_id, 
            'UPDATE_WINE_ERROR', 
            f'Wine not found: {wine_id}',
            level='error',
            affected_name=f'Wine ID {wine_id}'
        )
        return jsonify({'message': 'Wine not found'}), 404

    data = request.get_json()
    if not data:
        log_action(
            current_user_id, 
            'UPDATE_WINE_ERROR', 
            'No data provided for update',
            level='error',
            affected_name=wine.name
        )
        return jsonify({'message': 'No data provided for update'}), 400

    try:
        if 'name' in data:
            wine.name = data['name']
        if 'abv' in data:
            wine.abv = data['abv']
        if 'price' in data:
            wine.price = data['price']
        if 'category' in data:
            wine.category = data['category']
        if 'bottle_size' in data:
            wine.bottle_size = data['bottle_size']
        if 'in_stock' in data:
            wine.in_stock = data['in_stock']

        db.session.commit()

        log_action(
            current_user_id, 
            'UPDATE_WINE_SUCCESS', 
            f'Wine updated: {wine.name}',
            affected_name=wine.name  # Affected wine name
        )
        return jsonify({'message': 'Wine updated successfully', 'wine': {
            'id': wine.id,
            'name': wine.name,
            'abv': wine.abv,
            'price': float(wine.price),
            'category': wine.category,
            'bottle_size': wine.bottle_size,
            'in_stock': wine.in_stock
        }}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'UPDATE_WINE_ERROR', 
            str(e), 
            level='error',
            affected_name=wine.name
        )
        return jsonify({'message': f'Error updating wine: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>', methods=['DELETE'])
@jwt_required()
def delete_wine(wine_id):
    """Delete a wine from the inventory."""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(
            current_user_id, 
            'DELETE_WINE_ERROR', 
            'Unauthorized attempt to delete wine',
            level='error',
            affected_name=f'Wine ID {wine_id}'
        )
        return jsonify({'message': 'Only administrators and super users can delete wines'}), 403

    wine = Wine.query.get(wine_id)
    if not wine:
        log_action(
            current_user_id, 
            'DELETE_WINE_ERROR', 
            f'Wine not found: {wine_id}',
            level='error',
            affected_name=f'Wine ID {wine_id}'
        )
        return jsonify({'message': 'Wine not found'}), 404

    try:
        wine_name = wine.name
        db.session.delete(wine)
        db.session.commit()

        log_action(
            current_user_id, 
            'DELETE_WINE_SUCCESS', 
            f'Wine deleted: {wine_name}',
            affected_name=wine_name  # Affected wine name
        )
        return jsonify({'message': 'Wine deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'DELETE_WINE_ERROR', 
            str(e), 
            level='error',
            affected_name=f'Wine ID {wine_id}'
        )
        return jsonify({'message': f'Error deleting wine: {str(e)}'}), 500