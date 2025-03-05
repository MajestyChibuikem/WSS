from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql import func
from app.models import User, Wine
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
