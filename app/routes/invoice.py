from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, InvoiceItem, Cart, Product
from app import db
from app.utils.logger import log_action
import uuid
from datetime import datetime

bp = Blueprint('invoice', __name__, url_prefix='/invoice')

@bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_invoice():
    current_user_id = get_jwt_identity()
    cart_items = Cart.query.filter_by(user_id=current_user_id).all()
    
    if not cart_items:
        return jsonify({'message': 'Cart is empty'}), 400
    
    total_amount = 0
    invoice_number = f'INV-{datetime.utcnow().strftime("%Y%m%d")}-{uuid.uuid4().hex[:6]}'
    
    invoice = Invoice(
        invoice_number=invoice_number,
        user_id=current_user_id,
        total_amount=0
    )
    db.session.add(invoice)
    db.session.flush()
    
    for cart_item in cart_items:
        product = Product.query.get(cart_item.product_id)
        if product.stock < cart_item.quantity:
            db.session.rollback()
            return jsonify({'message': f'Insufficient stock for {product.name}'}), 400
        
        item_total = product.price * cart_item.quantity
        total_amount += item_total
        
        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price=product.price
        )
        db.session.add(invoice_item)
        
        product.stock -= cart_item.quantity
    
    invoice.total_amount = total_amount
    Cart.query.filter_by(user_id=current_user_id).delete()
    
    db.session.commit()
    log_action(current_user_id, 'GENERATE_INVOICE', f'Generated invoice: {invoice_number}')
    
    return jsonify({
        'invoice_number': invoice_number,
        'total_amount': total_amount
    }), 201
