# app/routes/wine.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Wine
from app import db
from app.utils.logger import log_action

wine_bp = Blueprint('wine', __name__, url_prefix='/wine')

@wine_bp.route('', methods=['GET'])
@jwt_required()
def get_wines():
    """Get all wines (accessible to all authenticated users)"""
    try:
        wines = Wine.query.all()
        wine_list = []
        
        for wine in wines:
            wine_data = {
                'id': wine.id,
                'name': wine.name,
                'vintage': wine.vintage,
                'varietal': wine.varietal,
                'region': wine.region,
                'country': wine.country,
                'price': float(wine.price) if wine.price else None,
                'stock_quantity': wine.stock_quantity,
                'bottle_size': wine.bottle_size,
                'description': wine.description,
                'tags': wine.tags
            }
            wine_list.append(wine_data)
        
        return jsonify({'wines': wine_list}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error fetching wines: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>', methods=['GET'])
@jwt_required()
def get_wine(wine_id):
    """Get a specific wine (accessible to all authenticated users)"""
    wine = Wine.query.get(wine_id)
    if not wine:
        return jsonify({'message': 'Wine not found'}), 404
    
    wine_data = {
        'id': wine.id,
        'name': wine.name,
        'vintage': wine.vintage,
        'varietal': wine.varietal,
        'region': wine.region,
        'country': wine.country,
        'price': float(wine.price) if wine.price else None,
        'stock_quantity': wine.stock_quantity,
        'bottle_size': wine.bottle_size,
        'description': wine.description,
        'tags': wine.tags
    }
    
    return jsonify({'wine': wine_data}), 200

@wine_bp.route('', methods=['POST'])
@jwt_required()
def add_wine():
    """Add a new wine (accessible only to admin and super_user)"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.can_manage_inventory():
        log_action(current_user_id, 'ADD_WINE_UNAUTHORIZED', 
                  'Unauthorized attempt to add wine to inventory')
        return jsonify({'message': 'Unauthorized - only admins and super users can add wines'}), 403
    
    data = request.get_json()
    if not data or not data.get('name') or not data.get('bottle_size'):
        return jsonify({'message': 'Name and bottle size are required'}), 400
    
    try:
        # Check if wine with same name already exists
        existing_wine = Wine.query.filter_by(name=data['name']).first()
        if existing_wine:
            return jsonify({'message': 'Wine with this name already exists'}), 409
        
        # Use the static method from the Wine model to add the wine
        wine = Wine.add_to_inventory(current_user, data)
        
        log_action(current_user_id, 'ADD_WINE_SUCCESS', 
                  f'Added wine: {data["name"]}',
                  additional_data={
                      'wine_id': wine.id,
                      'user_role': [role.name for role in current_user.roles]
                  })
        
        return jsonify({
            'message': 'Wine added successfully',
            'wine_id': wine.id
        }), 201
        
    except PermissionError as e:
        log_action(current_user_id, 'ADD_WINE_PERMISSION_ERROR', str(e))
        return jsonify({'message': str(e)}), 403
        
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'ADD_WINE_ERROR', 
                  f'Failed to add wine: {str(e)}',
                  level='error')
        return jsonify({'message': f'An error occurred while adding the wine: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>', methods=['PUT'])
@jwt_required()
def update_wine(wine_id):
    """Update wine details (accessible only to admin and super_user)"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.can_manage_inventory():
        log_action(current_user_id, 'UPDATE_WINE_UNAUTHORIZED', 
                  f'Unauthorized attempt to update wine {wine_id}')
        return jsonify({'message': 'Unauthorized - only admins and super users can update wines'}), 403
    
    wine = Wine.query.get(wine_id)
    if not wine:
        return jsonify({'message': 'Wine not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    try:
        # Update wine fields
        if 'name' in data:
            wine.name = data['name']
        if 'vintage' in data:
            wine.vintage = data['vintage']
        if 'varietal' in data:
            wine.varietal = data['varietal']
        if 'region' in data:
            wine.region = data['region']
        if 'country' in data:
            wine.country = data['country']
        if 'price' in data:
            wine.price = data['price']
        if 'stock_quantity' in data:
            wine.stock_quantity = data['stock_quantity']
        if 'bottle_size' in data:
            wine.bottle_size = data['bottle_size']
        if 'description' in data:
            wine.description = data['description']
        if 'tags' in data:
            wine.tags = data['tags']
        
        db.session.commit()
        
        log_action(current_user_id, 'UPDATE_WINE_SUCCESS', 
                  f'Updated wine {wine.name} (ID: {wine_id})')
        
        return jsonify({'message': 'Wine updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'UPDATE_WINE_ERROR', 
                  f'Failed to update wine: {str(e)}',
                  level='error')
        return jsonify({'message': f'An error occurred while updating the wine: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>/stock', methods=['PATCH'])
@jwt_required()
def update_stock(wine_id):
    """Update wine stock (accessible only to admin and super_user)"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')
        
    current_user = User.query.get(current_user_id)
    if not current_user or not current_user.can_manage_inventory():
        log_action(current_user_id, 'UPDATE_STOCK_UNAUTHORIZED', 
                  f'Unauthorized attempt to update stock for wine {wine_id}')
        return jsonify({'message': 'Unauthorized - only admins and super users can update stock'}), 403
    
    wine = Wine.query.get(wine_id)
    if not wine:
        return jsonify({'message': 'Wine not found'}), 404
    
    data = request.get_json()
    if not data or 'quantity' not in data:
        return jsonify({'message': 'Quantity is required'}), 400
    
    try:
        previous_quantity = wine.stock_quantity
        wine.stock_quantity = data['quantity']
        db.session.commit()
        
        log_action(current_user_id, 'UPDATE_STOCK_SUCCESS', 
                  f'Updated stock for {wine.name} from {previous_quantity} to {wine.stock_quantity}')
        
        return jsonify({
            'message': 'Stock updated successfully',
            'previous_quantity': previous_quantity,
            'new_quantity': wine.stock_quantity
        }), 200
        
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'UPDATE_STOCK_ERROR', 
                  f'Failed to update stock: {str(e)}',
                  level='error')
        return jsonify({'message': f'An error occurred while updating the stock: {str(e)}'}), 500