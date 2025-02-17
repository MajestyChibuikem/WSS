from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Cart, Product
from app import db

bp = Blueprint('cart', __name__, url_prefix='/cart')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    current_user_id = get_jwt_identity()
    cart_items = Cart.query.filter_by(user_id=current_user_id).all()
    return jsonify([{
        'product_id': item.product_id,
        'quantity': item.quantity
    } for item in cart_items]), 200

@bp.route('/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    product = Product.query.get_or_404(data['product_id'])
    if product.stock < data['quantity']:
        return jsonify({'message': 'Insufficient stock'}), 400
    
    cart_item = Cart.query.filter_by(
        user_id=current_user_id,
        product_id=data['product_id']
    ).first()
    
    if cart_item:
        cart_item.quantity += data['quantity']
    else:
        cart_item = Cart(
            user_id=current_user_id,
            product_id=data['product_id'],
            quantity=data['quantity']
        )
        db.session.add(cart_item)
    
    db.session.commit()
    return jsonify({'message': 'Item added to cart'}), 200
