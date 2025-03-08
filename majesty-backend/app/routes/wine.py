from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
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
    """Get wine stock count grouped by category"""
    current_user_id = get_jwt_identity()
    if isinstance(current_user_id, dict):
        current_user_id = current_user_id.get('id')

    try:
        stock_data = db.session.query(Wine.category, func.sum(Wine.in_stock)).group_by(Wine.category).all()
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

    period1_start_str = request.args.get('period1_start')
    period1_end_str = request.args.get('period1_end')
    period2_start_str = request.args.get('period2_start')
    period2_end_str = request.args.get('period2_end')

    try:
        period1_start = datetime.strptime(period1_start_str, '%Y-%m-%d')
        period1_end = datetime.strptime(period1_end_str, '%Y-%m-%d')
        period2_start = datetime.strptime(period2_start_str, '%Y-%m-%d')
        period2_end = datetime.strptime(period2_end_str, '%Y-%m-%d')
    except ValueError:
        log_action(current_user_id, 'COMPARE_SALES_ERROR', 'Invalid date format. Use YYYY-MM-DD.', level='error')
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    try:
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