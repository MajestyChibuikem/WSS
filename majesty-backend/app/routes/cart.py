from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Cart
from app import db
from app.utils.logger import log_action
import datetime
from app.utils.decorators import token_required

carts_bp = Blueprint('carts', __name__, url_prefix='/carts')

@carts_bp.route('', methods=['GET'])
@jwt_required()
@token_required
def get_cart():
    """Retrieve all cart items for the logged-in user."""
    current_user_id = get_jwt_identity()
    try:
        cart_items = Cart.query.filter_by(user_id=current_user_id).all()
        items = []
        for item in cart_items:
            items.append({
                'id': item.id,
                'wine_id': item.wine_id,
                'quantity': item.quantity,
                'added_at': item.added_at.isoformat() if item.added_at else None,
                'category' : item.wine.category.name,
            })
        log_action(
            current_user_id, 
            'GET_CART', 
            'Retrieved cart items',
            affected_name=f'User ID {current_user_id}'  # Affected user
        )
        return jsonify({'cart': items}), 200
    except Exception as e:
        log_action(
            current_user_id, 
            'GET_CART_ERROR', 
            f'Error retrieving cart: {str(e)}', 
            level='error',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'An error occurred while retrieving the cart'}), 500

@carts_bp.route('/add', methods=['POST'])
@jwt_required()
@token_required
def add_to_cart():
    """Add a new item to the user's cart or update quantity if it already exists."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('wine_id'):
        log_action(
            current_user_id, 
            'ADD_CART_INVALID', 
            'Missing wine_id in request',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'wine_id is required'}), 400

    quantity = data.get('quantity', 1)
    try:
        cart_item = Cart.query.filter_by(user_id=current_user_id, wine_id=data['wine_id']).first()
        if cart_item:
            cart_item.quantity += quantity
            log_action(
                current_user_id, 
                'UPDATE_CART_ITEM', 
                f'Updated quantity for wine_id {data["wine_id"]}',
                affected_name=f'Wine ID {data["wine_id"]}'  # Affected wine
            )
        else:
            cart_item = Cart(user_id=current_user_id, wine_id=data['wine_id'], quantity=quantity)
            db.session.add(cart_item)
            log_action(
                current_user_id, 
                'ADD_CART_ITEM', 
                f'Added wine_id {data["wine_id"]} to cart',
                affected_name=f'Wine ID {data["wine_id"]}'  # Affected wine
            )
        db.session.commit()
        return jsonify({'message': 'Item added to cart successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'ADD_CART_ERROR', 
            f'Error adding item to cart: {str(e)}', 
            level='error',
            affected_name=f'Wine ID {data["wine_id"]}'
        )
        return jsonify({'message': 'An error occurred while adding item to cart'}), 500

@carts_bp.route('/update', methods=['PUT'])
@jwt_required()
@token_required
def update_cart():
    """Update the quantity of a specific cart item."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('wine_id') or 'quantity' not in data:
        log_action(
            current_user_id, 
            'UPDATE_CART_INVALID', 
            'Missing wine_id or quantity in request',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'wine_id and quantity are required'}), 400

    try:
        cart_item = Cart.query.filter_by(user_id=current_user_id, wine_id=data['wine_id']).first()
        if not cart_item:
            log_action(
                current_user_id, 
                'UPDATE_CART_NOT_FOUND', 
                f'Cart item not found for wine_id {data["wine_id"]}',
                affected_name=f'Wine ID {data["wine_id"]}'
            )
            return jsonify({'message': 'Cart item not found'}), 404

        cart_item.quantity = data['quantity']
        db.session.commit()
        log_action(
            current_user_id, 
            'UPDATE_CART_SUCCESS', 
            f'Updated cart item for wine_id {data["wine_id"]}',
            affected_name=f'Wine ID {data["wine_id"]}'
        )
        return jsonify({'message': 'Cart updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'UPDATE_CART_ERROR', 
            f'Error updating cart: {str(e)}', 
            level='error',
            affected_name=f'Wine ID {data["wine_id"]}'
        )
        return jsonify({'message': 'An error occurred while updating the cart'}), 500

@carts_bp.route('/remove', methods=['DELETE'])
@jwt_required()
@token_required
def remove_from_cart():
    """Remove a specific item from the user's cart."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('wine_id'):
        log_action(
            current_user_id, 
            'REMOVE_CART_INVALID', 
            'Missing wine_id in request',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'wine_id is required'}), 400

    try:
        cart_item = Cart.query.filter_by(user_id=current_user_id, wine_id=data['wine_id']).first()
        if not cart_item:
            log_action(
                current_user_id, 
                'REMOVE_CART_NOT_FOUND', 
                f'Cart item not found for wine_id {data["wine_id"]}',
                affected_name=f'Wine ID {data["wine_id"]}'
            )
            return jsonify({'message': 'Cart item not found'}), 404

        db.session.delete(cart_item)
        db.session.commit()
        log_action(
            current_user_id, 
            'REMOVE_CART_SUCCESS', 
            f'Removed wine_id {data["wine_id"]} from cart',
            affected_name=f'Wine ID {data["wine_id"]}'
        )
        return jsonify({'message': 'Item removed from cart successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'REMOVE_CART_ERROR', 
            f'Error removing item from cart: {str(e)}', 
            level='error',
            affected_name=f'Wine ID {data["wine_id"]}'
        )
        return jsonify({'message': 'An error occurred while removing item from cart'}), 500

@carts_bp.route('/clear', methods=['DELETE'])
@jwt_required()
@token_required
def clear_cart():
    """Clear all items from the user's cart."""
    current_user_id = get_jwt_identity()
    try:
        cart_items = Cart.query.filter_by(user_id=current_user_id).all()
        for item in cart_items:
            db.session.delete(item)
        db.session.commit()
        log_action(
            current_user_id, 
            'CLEAR_CART_SUCCESS', 
            'Cleared all items from cart',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'Cart cleared successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'CLEAR_CART_ERROR', 
            f'Error clearing cart: {str(e)}', 
            level='error',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'An error occurred while clearing the cart'}), 500