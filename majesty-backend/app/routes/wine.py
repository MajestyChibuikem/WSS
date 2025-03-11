from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt 
from sqlalchemy.sql import func, and_
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
        log_action(current_user_id, 'GET_TOTAL_STOCK', f'Total stock checked: {total_stock}')
        return jsonify({'total_stock': total_stock}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_TOTAL_STOCK_ERROR', str(e), level='error')
        return jsonify({'message': f'Error fetching total stock: {str(e)}'}), 500

@wine_bp.route('/stock-by-category', methods=['GET'])
@jwt_required()
def get_stock_by_category():
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        # Fetch stock data grouped by category
        stock_data = db.session.query(Wine.category, func.sum(Wine.in_stock)).group_by(Wine.category).all()
        
        # If the database is empty, return an empty response
        if not stock_data:
            log_action(current_user_id, 'GET_STOCK_BY_CATEGORY', 'No stock data found')
            return jsonify({'stock_by_category': {}}), 200
        
        # Convert stock data to a dictionary
        result = {row[0]: row[1] for row in stock_data if row[0] is not None}
        
        log_action(current_user_id, 'GET_STOCK_BY_CATEGORY', 'Stock by category fetched successfully')
        return jsonify({'stock_by_category': result}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_STOCK_BY_CATEGORY_ERROR', str(e), level='error')
        return jsonify({'message': f'Error fetching stock by category: {str(e)}'}), 500

@wine_bp.route('/revenue', methods=['GET'])
@jwt_required()
def get_revenue():
    """Calculate revenue within a specified time period"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    # Check if start_date and end_date are provided
    if not start_date_str or not end_date_str:
        log_action(current_user_id, 'GET_REVENUE_ERROR', 'Missing start_date or end_date', level='error')
        return jsonify({"error": "Both start_date and end_date are required."}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    except ValueError:
        log_action(current_user_id, 'GET_REVENUE_ERROR', 'Invalid date format. Use YYYY-MM-DD.', level='error')
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    try:
        revenue = Invoice.calculate_revenue(start_date, end_date)
        log_action(current_user_id, 'GET_REVENUE', f'Revenue calculated: {revenue}')
        return jsonify({"revenue": revenue}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_REVENUE_ERROR', str(e), level='error')
        return jsonify({"error": f"Error calculating revenue: {str(e)}"}), 500
@wine_bp.route('/compare-sales', methods=['GET'])
@jwt_required()
def compare_sales():
    """Compare revenue between two time periods and calculate percentage change"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    # Get query parameters
    period1_start_str = request.args.get('period1_start')
    period1_end_str = request.args.get('period1_end')
    period2_start_str = request.args.get('period2_start')
    period2_end_str = request.args.get('period2_end')

    # Check if all required parameters are provided
    if not all([period1_start_str, period1_end_str, period2_start_str, period2_end_str]):
        log_action(current_user_id, 'COMPARE_SALES_ERROR', 'Missing required query parameters', level='error')
        return jsonify({"error": "All parameters (period1_start, period1_end, period2_start, period2_end) are required."}), 400

    try:
        # Parse dates
        period1_start = datetime.strptime(period1_start_str, '%Y-%m-%d')
        period1_end = datetime.strptime(period1_end_str, '%Y-%m-%d')
        period2_start = datetime.strptime(period2_start_str, '%Y-%m-%d')
        period2_end = datetime.strptime(period2_end_str, '%Y-%m-%d')
    except ValueError:
        log_action(current_user_id, 'COMPARE_SALES_ERROR', 'Invalid date format. Use YYYY-MM-DD.', level='error')
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    try:
        # Compare sales
        percentage_change = Invoice.compare_sales_periods(period1_start, period1_end, period2_start, period2_end)
        log_action(current_user_id, 'COMPARE_SALES', f'Sales compared: {percentage_change}%')
        return jsonify({"percentage_change": percentage_change}), 200
    except Exception as e:
        log_action(current_user_id, 'COMPARE_SALES_ERROR', str(e), level='error')
        return jsonify({"error": f"Error comparing sales: {str(e)}"}), 500
@wine_bp.route('/inventory-value', methods=['GET'])
@jwt_required()
def get_inventory_value():
    """Get the total value of the current inventory, grouped by category"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        inventory_value = Wine.get_inventory_value_by_category()
        log_action(current_user_id, 'GET_INVENTORY_VALUE', 'Inventory value fetched successfully')
        return jsonify(inventory_value), 200
    except Exception as e:
        log_action(current_user_id, 'GET_INVENTORY_VALUE_ERROR', str(e), level='error')
        return jsonify({"error": f"Error fetching inventory value: {str(e)}"}), 500

@wine_bp.route('/user-sales/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_sales(user_id):
    """Track the total sales (invoices) for a particular user"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        user = User.query.get(user_id)
        if not user:
            log_action(current_user_id, 'GET_USER_SALES_ERROR', f'User not found: {user_id}', level='error')
            return jsonify({"error": "User not found"}), 404

        user_sales = user.get_user_sales()
        log_action(current_user_id, 'GET_USER_SALES', f'Sales fetched for user {user_id}: {user_sales}')
        return jsonify({"user_id": user_id, "total_sales": user_sales}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_USER_SALES_ERROR', str(e), level='error')
        return jsonify({"error": f"Error fetching user sales: {str(e)}"}), 500   
@wine_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_wines():
    """
    Get all wines in the inventory.
    """
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        # Fetch all wines from the database
        wines = Wine.query.all()
        
        # Convert wines to a list of dictionaries
        wines_list = [{
            "id": wine.id,
            "name": wine.name,
            "abv": wine.abv,
            "price": float(wine.price),  # Convert Decimal to float for JSON serialization
            "category": wine.category,
            "bottle_size": wine.bottle_size,
            "in_stock": wine.in_stock,
            "added_by": wine.added_by,
            "added_at": wine.added_at.isoformat() if wine.added_at else None
        } for wine in wines]

        log_action(current_user_id, 'GET_ALL_WINES', 'All wines fetched successfully')
        return jsonify({"wines": wines_list}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_ALL_WINES_ERROR', str(e), level='error')
        return jsonify({"error": f"Error fetching all wines: {str(e)}"}), 500
    
@wine_bp.route('/test', methods=['GET'])
@jwt_required()
def test():
    current_user_id = get_jwt_identity()
    return jsonify({"user_id": current_user_id}), 200


@wine_bp.route('/add', methods=['POST'])
@jwt_required()
def add_wine():
    """
    Add a new wine to the inventory.
    """
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    # Check if the user has permission to manage inventory
    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(current_user_id, 'ADD_WINE_ERROR', 'Unauthorized attempt to add wine')
        return jsonify({'message': 'Only administrators and super users can add wines'}), 403

    # Get the wine data from the request
    data = request.get_json()
    if not data:
        log_action(current_user_id, 'ADD_WINE_ERROR', 'No data provided for new wine')
        return jsonify({'message': 'No data provided for new wine'}), 400

    # Validate required fields
    required_fields = ['name', 'abv', 'price', 'category', 'bottle_size']
    for field in required_fields:
        if field not in data:
            log_action(current_user_id, 'ADD_WINE_ERROR', f'Missing required field: {field}')
            return jsonify({'message': f'Missing required field: {field}'}), 400

    try:
        # Create a new wine
        wine = Wine(
            name=data['name'],
            abv=data['abv'],
            price=data['price'],
            category=data['category'],
            bottle_size=data['bottle_size'],
            in_stock=data.get('in_stock', 0),  # Default to 0 if not provided
            added_by=current_user_id
        )

        # Add the wine to the database
        db.session.add(wine)
        db.session.commit()

        log_action(current_user_id, 'ADD_WINE_SUCCESS', f'Wine added: {wine.id}')
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
        log_action(current_user_id, 'ADD_WINE_ERROR', str(e), level='error')
        return jsonify({'message': f'Error adding wine: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>', methods=['PUT'])
@jwt_required()
def update_wine(wine_id):
    """
    Update a wine's details.
    """
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    # Check if the user has permission to manage inventory
    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(current_user_id, 'UPDATE_WINE_ERROR', 'Unauthorized attempt to update wine')
        return jsonify({'message': 'Only administrators and super users can update wines'}), 403

    # Get the wine to update
    wine = Wine.query.get(wine_id)
    if not wine:
        log_action(current_user_id, 'UPDATE_WINE_ERROR', f'Wine not found: {wine_id}')
        return jsonify({'message': 'Wine not found'}), 404

    # Get the updated data from the request
    data = request.get_json()
    if not data:
        log_action(current_user_id, 'UPDATE_WINE_ERROR', 'No data provided for update')
        return jsonify({'message': 'No data provided for update'}), 400

    try:
        # Update the wine's details
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

        log_action(current_user_id, 'UPDATE_WINE_SUCCESS', f'Wine updated: {wine_id}')
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
        log_action(current_user_id, 'UPDATE_WINE_ERROR', str(e), level='error')
        return jsonify({'message': f'Error updating wine: {str(e)}'}), 500
    
@wine_bp.route('/<int:wine_id>', methods=['DELETE'])
@jwt_required()
def delete_wine(wine_id):
    """
    Delete a wine from the inventory.
    """
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    # Check if the user has permission to manage inventory
    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(current_user_id, 'DELETE_WINE_ERROR', 'Unauthorized attempt to delete wine')
        return jsonify({'message': 'Only administrators and super users can delete wines'}), 403

    # Get the wine to delete
    wine = Wine.query.get(wine_id)
    if not wine:
        log_action(current_user_id, 'DELETE_WINE_ERROR', f'Wine not found: {wine_id}')
        return jsonify({'message': 'Wine not found'}), 404

    try:
        # Delete the wine
        db.session.delete(wine)
        db.session.commit()

        log_action(current_user_id, 'DELETE_WINE_SUCCESS', f'Wine deleted: {wine_id}')
        return jsonify({'message': 'Wine deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'DELETE_WINE_ERROR', str(e), level='error')
        return jsonify({'message': f'Error deleting wine: {str(e)}'}), 500