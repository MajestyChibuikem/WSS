from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Cart, Product, Category
from app import db
from app.utils.logger import log_action
import datetime
from app.utils.decorators import token_required

carts_bp = Blueprint('carts', __name__, url_prefix='/carts')

@carts_bp.route('', methods=['GET'])
@jwt_required()
@token_required
def get_cart():
    current_user_id = get_jwt_identity()
    try:
        cart_items = db.session.query(
            Cart,
            Product,
            Category
        ).join(
            Product, Cart.product_id == Product.id
        ).join(
            Category, Product.category_id == Category.id
        ).filter(
            Cart.user_id == current_user_id
        ).all()

        items = []
        for cart_item, product, category in cart_items:
            items.append({
                'cart_item_id': cart_item.id,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': float(product.price),
                    'abv': product.abv,
                    'bottle_size': product.bottle_size,
                    'in_stock': product.in_stock
                },
                'category': {
                    'id': category.id,
                    'name': category.name
                },
                'quantity': cart_item.quantity,
                'added_at': cart_item.added_at.isoformat()
            })

        log_action(current_user_id, 'GET_CART_SUCCESS', 'Retrieved cart items')
        return jsonify({'cart': items}), 200

    except Exception as e:
        log_action(current_user_id, 'GET_CART_ERROR', str(e), level='error')
        return jsonify({'message': 'Error retrieving cart'}), 500
@carts_bp.route('/add', methods=['POST'])
@jwt_required()
@token_required
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    # Validate input
    if not data or 'product_id' not in data:
        return jsonify({'message': 'product_id is required'}), 400

    try:
        quantity = int(data.get('quantity', 1))
        if quantity <= 0:
            return jsonify({'message': 'Quantity must be at least 1'}), 400

        # Verify product exists and is available
        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        if product.in_stock < quantity:
            return jsonify({'message': 'Not enough stock available'}), 400

        # Check if item already in cart
        cart_item = Cart.query.filter_by(
            user_id=current_user_id,
            product_id=data['product_id']
        ).first()

        if cart_item:
            new_quantity = cart_item.quantity + quantity
            if product.in_stock < new_quantity:
                return jsonify({'message': 'Exceeds available stock'}), 400
            cart_item.quantity = new_quantity
        else:
            cart_item = Cart(
                user_id=current_user_id,
                product_id=data['product_id'],
                quantity=quantity
            )
            db.session.add(cart_item)

        db.session.commit()
        return jsonify({
            'message': 'Item added to cart',
            'cart_item_id': cart_item.id,
            'new_quantity': cart_item.quantity
        }), 200

    except ValueError:
        return jsonify({'message': 'Invalid quantity format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
@carts_bp.route('/update', methods=['PUT'])
@jwt_required()
@token_required
def update_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or 'product_id' not in data or 'quantity' not in data:
        return jsonify({'message': 'product_id and quantity are required'}), 400

    try:
        quantity = int(data['quantity'])
        if quantity <= 0:
            return jsonify({'message': 'Quantity must be positive'}), 400

        cart_item = Cart.query.filter_by(
            user_id=current_user_id,
            product_id=data['product_id']
        ).first()

        if not cart_item:
            return jsonify({'message': 'Item not found in cart'}), 404

        product = Product.query.get(data['product_id'])
        if not product:
            return jsonify({'message': 'Product no longer available'}), 404
        if product.in_stock < quantity:
            return jsonify({'message': 'Not enough stock available'}), 400

        cart_item.quantity = quantity
        db.session.commit()

        return jsonify({
            'message': 'Cart updated',
            'new_quantity': quantity
        }), 200

    except ValueError:
        return jsonify({'message': 'Invalid quantity format'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
@carts_bp.route('/remove', methods=['DELETE'])
@jwt_required()
@token_required
def remove_from_cart():
    """Remove a specific item from the user's cart."""
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('product_id'):
        log_action(
            current_user_id, 
            'REMOVE_CART_INVALID', 
            'Missing product_id in request',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'product_id is required'}), 400

    try:
        cart_item = Cart.query.filter_by(user_id=current_user_id, product_id=data['product_id']).first()
        if not cart_item:
            log_action(
                current_user_id, 
                'REMOVE_CART_NOT_FOUND', 
                f'Cart item not found for product_id {data["product_id"]}',
                affected_name=f'product ID {data["product_id"]}'
            )
            return jsonify({'message': 'Cart item not found'}), 404

        db.session.delete(cart_item)
        db.session.commit()
        log_action(
            current_user_id, 
            'REMOVE_CART_SUCCESS', 
            f'Removed product_id {data["product_id"]} from cart',
            affected_name=f'product ID {data["product_id"]}'
        )
        return jsonify({'message': 'Item removed from cart successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'REMOVE_CART_ERROR', 
            f'Error removing item from cart: {str(e)}', 
            level='error',
            affected_name=f'product ID {data["product_id"]}'
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