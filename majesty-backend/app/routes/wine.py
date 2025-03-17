from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql import func
from datetime import datetime, timedelta
from app.models import User, Wine, Invoice, InvoiceItem
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
            affected_name='Total Stock'
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

@wine_bp.route('/revenue', methods=['GET'])
@jwt_required()
def get_revenue():
    """Calculate revenue within a specified time period"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        log_action(
            current_user_id, 
            'GET_REVENUE_ERROR', 
            'Missing start_date or end_date', 
            level='error',
            affected_name='Revenue'
        )
        return jsonify({"error": "Both start_date and end_date are required."}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d')
    except ValueError:
        log_action(
            current_user_id, 
            'GET_REVENUE_ERROR', 
            'Invalid date format. Use YYYY-MM-DD.', 
            level='error',
            affected_name='Revenue'
        )
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    try:
        revenue = Invoice.calculate_revenue(start_date, end_date)
        log_action(
            current_user_id, 
            'GET_REVENUE', 
            f'Revenue calculated: {revenue}',
            affected_name='Revenue'
        )
        return jsonify({"revenue": revenue}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_REVENUE_ERROR', 
            str(e), 
            level='error',
            affected_name='Revenue'
        )
        return jsonify({"error": f"Error calculating revenue: {str(e)}"}), 500

@wine_bp.route('/compare-sales', methods=['GET'])
@jwt_required()
def compare_sales():
    """Compare revenue between two time periods"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    period1_start_str = request.args.get('period1_start')
    period1_end_str = request.args.get('period1_end')
    period2_start_str = request.args.get('period2_start')
    period2_end_str = request.args.get('period2_end')

    if not all([period1_start_str, period1_end_str, period2_start_str, period2_end_str]):
        log_action(
            current_user_id, 
            'COMPARE_SALES_ERROR', 
            'Missing required query parameters', 
            level='error',
            affected_name='Sales Comparison'
        )
        return jsonify({"error": "All period parameters are required."}), 400

    try:
        period1_start = datetime.strptime(period1_start_str, '%Y-%m-%d')
        period1_end = datetime.strptime(period1_end_str, '%Y-%m-%d')
        period2_start = datetime.strptime(period2_start_str, '%Y-%m-%d')
        period2_end = datetime.strptime(period2_end_str, '%Y-%m-%d')
    except ValueError:
        log_action(
            current_user_id, 
            'COMPARE_SALES_ERROR', 
            'Invalid date format. Use YYYY-MM-DD.', 
            level='error',
            affected_name='Sales Comparison'
        )
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    try:
        percentage_change = Invoice.compare_sales_periods(period1_start, period1_end, period2_start, period2_end)
        log_action(
            current_user_id, 
            'COMPARE_SALES', 
            f'Sales compared: {percentage_change}%',
            affected_name='Sales Comparison'
        )
        return jsonify({"percentage_change": percentage_change}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'COMPARE_SALES_ERROR', 
            str(e), 
            level='error',
            affected_name='Sales Comparison'
        )
        return jsonify({"error": f"Error comparing sales: {str(e)}"}), 500

@wine_bp.route('/inventory-value', methods=['GET'])
@jwt_required()
def get_inventory_value():
    """Get inventory value by category"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        inventory_value = Wine.get_inventory_value_by_category()
        log_action(
            current_user_id, 
            'GET_INVENTORY_VALUE', 
            'Inventory value fetched',
            affected_name='Inventory Value by Category'
        )
        return jsonify(inventory_value), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_INVENTORY_VALUE_ERROR', 
            str(e), 
            level='error',
            affected_name='Inventory Value by Category'
        )
        return jsonify({"error": f"Error fetching inventory value: {str(e)}"}), 500

@wine_bp.route('/user-sales/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_sales(user_id):
    """Get sales for a specific user"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        user = User.query.get(user_id)
        if not user:
            log_action(
                current_user_id, 
                'GET_USER_SALES_ERROR', 
                f'User not found: {user_id}', 
                level='error',
                affected_name=f'User ID {user_id}'
            )
            return jsonify({"error": "User not found"}), 404

        user_sales = user.get_user_sales()
        log_action(
            current_user_id, 
            'GET_USER_SALES', 
            f'Sales fetched for user {user_id}',
            affected_name=f'User ID {user_id}'
        )
        return jsonify({"user_id": user_id, "total_sales": user_sales}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_USER_SALES_ERROR', 
            str(e), 
            level='error',
            affected_name=f'User ID {user_id}'
        )
        return jsonify({"error": f"Error fetching user sales: {str(e)}"}), 500

@wine_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_wines():
    """Get all wines in inventory"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        wines = Wine.query.all()
        wines_list = [{
            "id": wine.id,
            "name": wine.name,
            "abv": wine.abv,
            "price": float(wine.price),
            "category": wine.category,
            "bottle_size": wine.bottle_size,
            "in_stock": wine.in_stock,
            "added_by": wine.added_by,
            "added_at": wine.added_at.isoformat() if wine.added_at else None
        } for wine in wines]

        log_action(
            current_user_id, 
            'GET_ALL_WINES', 
            'Fetched all wines',
            affected_name='All Wines'
        )
        return jsonify({"wines": wines_list}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_ALL_WINES_ERROR', 
            str(e), 
            level='error',
            affected_name='All Wines'
        )
        return jsonify({"error": f"Error fetching wines: {str(e)}"}), 500

@wine_bp.route('/add', methods=['POST'])
@jwt_required()
def add_wine():
    """Add new wine to inventory"""
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
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    if not data:
        log_action(
            current_user_id, 
            'ADD_WINE_ERROR', 
            'No data provided',
            level='error',
            affected_name='Wine Inventory'
        )
        return jsonify({'message': 'No data provided'}), 400

    required_fields = ['name', 'abv', 'price', 'category', 'bottle_size']
    for field in required_fields:
        if field not in data:
            log_action(
                current_user_id, 
                'ADD_WINE_ERROR', 
                f'Missing field: {field}',
                level='error',
                affected_name='Wine Inventory'
            )
            return jsonify({'message': f'Missing {field}'}), 400

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
            f'Added wine: {wine.name}',
            affected_name=wine.name
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
    """Update existing wine"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(
            current_user_id, 
            'UPDATE_WINE_ERROR', 
            'Unauthorized attempt',
            level='error',
            affected_name='Wine Inventory'
        )
        return jsonify({'message': 'Unauthorized'}), 403

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
            'No update data',
            level='error',
            affected_name=wine.name
        )
        return jsonify({'message': 'No data provided'}), 400

    try:
        if 'name' in data: wine.name = data['name']
        if 'abv' in data: wine.abv = data['abv']
        if 'price' in data: wine.price = data['price']
        if 'category' in data: wine.category = data['category']
        if 'bottle_size' in data: wine.bottle_size = data['bottle_size']
        if 'in_stock' in data: wine.in_stock = data['in_stock']

        db.session.commit()
        log_action(
            current_user_id, 
            'UPDATE_WINE_SUCCESS', 
            f'Updated {wine.name}',
            affected_name=wine.name
        )
        return jsonify({
            'message': 'Wine updated',
            'wine': {
                'id': wine.id,
                'name': wine.name,
                'abv': wine.abv,
                'price': float(wine.price),
                'category': wine.category,
                'bottle_size': wine.bottle_size,
                'in_stock': wine.in_stock
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'UPDATE_WINE_ERROR', 
            str(e), 
            level='error',
            affected_name=wine.name
        )
        return jsonify({'message': f'Update error: {str(e)}'}), 500

@wine_bp.route('/<int:wine_id>', methods=['DELETE'])
@jwt_required()
def delete_wine(wine_id):
    """Delete a wine"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    user = User.query.get(current_user_id)
    if not user.can_manage_inventory():
        log_action(
            current_user_id, 
            'DELETE_WINE_ERROR', 
            'Unauthorized attempt',
            level='error',
            affected_name=f'Wine ID {wine_id}'
        )
        return jsonify({'message': 'Unauthorized'}), 403

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
            f'Deleted {wine_name}',
            affected_name=wine_name
        )
        return jsonify({'message': 'Wine deleted'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'DELETE_WINE_ERROR', 
            str(e), 
            level='error',
            affected_name=f'Wine ID {wine_id}'
        )
        return jsonify({'message': f'Delete error: {str(e)}'}), 500

@wine_bp.route('/top_wines', methods=['GET'])
def get_top_wines():
    # Get the current date and the date one month ago
    now = datetime.utcnow()
    last_month = now - timedelta(days=30)

    # Query to get the top three most sold wines
    top_wines = db.session.query(
        Wine.name,
        func.sum(InvoiceItem.quantity).label('total_sold'),
        func.sum(InvoiceItem.quantity * InvoiceItem.price).label('total_revenue')
    ).join(InvoiceItem, InvoiceItem.wine_id == Wine.id) \
     .join(Invoice, Invoice.id == InvoiceItem.invoice_id) \
     .filter(Invoice.created_at >= last_month) \
     .group_by(Wine.name) \
     .order_by(func.sum(InvoiceItem.quantity).desc()) \
     .limit(3).all()

    # Query to get the total sales for the previous month
    previous_month_start = last_month - timedelta(days=30)
    previous_month_sales = db.session.query(
        Wine.name,
        func.sum(InvoiceItem.quantity).label('total_sold')
    ).join(InvoiceItem, InvoiceItem.wine_id == Wine.id) \
     .join(Invoice, Invoice.id == InvoiceItem.invoice_id) \
     .filter(Invoice.created_at >= previous_month_start, Invoice.created_at < last_month) \
     .group_by(Wine.name).all()

    # Convert previous month sales to a dictionary for easy lookup
    previous_sales_dict = {name: total_sold for name, total_sold in previous_month_sales}

    # Prepare the response data
    result = []
    for wine in top_wines:
        name, total_sold, total_revenue = wine
        previous_sold = previous_sales_dict.get(name, 0)
        if previous_sold == 0:
            percentage_change = 0
        else:
            percentage_change = ((total_sold - previous_sold) / previous_sold) * 100

        result.append({
            'name': name,
            'total_sold': total_sold,
            'total_revenue': float(total_revenue),
            'percentage_change': round(percentage_change, 2)
        })

    return jsonify(result)