from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Product
from app import db
from app.utils.logger import log_action

bp = Blueprint('products', __name__, url_prefix='/products')

@bp.route('/', methods=['GET'])
@jwt_required()
def get_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'stock': p.stock
    } for p in products]), 200

@bp.route('/', methods=['POST'])
@jwt_required()
def add_product():
    current_user = User.query.get(get_jwt_identity())
    if not current_user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    new_product = Product(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        stock=data['stock']
    )
    db.session.add(new_product)
    db.session.commit()
    
    log_action(current_user.id, 'CREATE_PRODUCT', f'Created product: {data["name"]}')
    return jsonify({'message': 'Product added successfully'}), 201
