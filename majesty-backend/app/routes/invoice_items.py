from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, InvoiceItem, User
from app import db
from app.utils.logger import log_action

invoice_items_bp = Blueprint('invoice_items', __name__, url_prefix='/invoice_items')

@invoice_items_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice_items(invoice_id):
    """
    Retrieve all invoice items for a given invoice.
    Only accessible to the invoice owner or an admin.
    """
    current_user_id = get_jwt_identity()
    try:
        invoice = Invoice.query.filter_by(id=invoice_id).first()
        if not invoice:
            log_action(current_user_id, 'GET_INVOICE_ITEMS_NOT_FOUND', f'Invoice {invoice_id} not found')
            return jsonify({'message': 'Invoice not found'}), 404
        
        current_user = User.query.get(current_user_id)
        if invoice.user_id != current_user_id and not (current_user and current_user.is_admin):
            log_action(current_user_id, 'GET_INVOICE_ITEMS_UNAUTHORIZED', f'Unauthorized access for invoice {invoice_id}')
            return jsonify({'message': 'Unauthorized'}), 403
        
        items = InvoiceItem.query.filter_by(invoice_id=invoice_id).all()
        result = [{
            'id': item.id,
            'wine_id': item.wine_id,
            'quantity': item.quantity,
            'price': str(item.price)
        } for item in items]
        
        log_action(current_user_id, 'GET_INVOICE_ITEMS_SUCCESS', f'Retrieved items for invoice {invoice_id}')
        return jsonify({'invoice_items': result}), 200

    except Exception as e:
        log_action(current_user_id, 'GET_INVOICE_ITEMS_ERROR', f'Error retrieving invoice items: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while retrieving invoice items'}), 500

@invoice_items_bp.route('/invoice_items', methods=['POST'])
@jwt_required()
def create_invoice_item():
    """
    Create a new invoice item.
    Expects a JSON payload with invoice_id, wine_id, quantity, and price.
    Validates that the invoice exists and is owned by the current user or the user is an admin.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('invoice_id') or not data.get('wine_id') or not data.get('quantity') or not data.get('price'):
        log_action(current_user_id, 'CREATE_INVOICE_ITEM_INVALID', 'Missing required fields for invoice item creation')
        return jsonify({'message': 'invoice_id, wine_id, quantity, and price are required'}), 400

    try:
        invoice = Invoice.query.filter_by(id=data['invoice_id']).first()
        if not invoice:
            log_action(current_user_id, 'CREATE_INVOICE_ITEM_INVOICE_NOT_FOUND', f'Invoice {data["invoice_id"]} not found')
            return jsonify({'message': 'Invoice not found'}), 404
        
        current_user = User.query.get(current_user_id)
        if invoice.user_id != current_user_id and not (current_user and current_user.is_admin):
            log_action(current_user_id, 'CREATE_INVOICE_ITEM_UNAUTHORIZED', f'Unauthorized to add item to invoice {data["invoice_id"]}')
            return jsonify({'message': 'Unauthorized'}), 403
        
        new_item = InvoiceItem(
            invoice_id=data['invoice_id'],
            wine_id=data['wine_id'],
            quantity=data['quantity'],
            price=data['price']
        )
        db.session.add(new_item)
        db.session.commit()
        log_action(current_user_id, 'CREATE_INVOICE_ITEM_SUCCESS', f'Created invoice item {new_item.id} for invoice {data["invoice_id"]}')
        return jsonify({'message': 'Invoice item created successfully', 'invoice_item_id': new_item.id}), 201

    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'CREATE_INVOICE_ITEM_ERROR', f'Error creating invoice item: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while creating the invoice item'}), 500

@invoice_items_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_invoice_item(item_id):
    """
    Update an existing invoice item.
    Allows modifying the quantity and/or price.
    Only accessible to the invoice owner or an admin.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        log_action(current_user_id, 'UPDATE_INVOICE_ITEM_INVALID', 'No data provided for invoice item update')
        return jsonify({'message': 'No data provided'}), 400

    try:
        item = InvoiceItem.query.get(item_id)
        if not item:
            log_action(current_user_id, 'UPDATE_INVOICE_ITEM_NOT_FOUND', f'Invoice item {item_id} not found')
            return jsonify({'message': 'Invoice item not found'}), 404

        invoice = Invoice.query.filter_by(id=item.invoice_id).first()
        current_user = User.query.get(current_user_id)
        if invoice.user_id != current_user_id and not (current_user and current_user.is_admin):
            log_action(current_user_id, 'UPDATE_INVOICE_ITEM_UNAUTHORIZED', f'Unauthorized update for invoice item {item_id}')
            return jsonify({'message': 'Unauthorized'}), 403

        if 'quantity' in data:
            item.quantity = data['quantity']
        if 'price' in data:
            item.price = data['price']
        
        db.session.commit()
        log_action(current_user_id, 'UPDATE_INVOICE_ITEM_SUCCESS', f'Updated invoice item {item_id}')
        return jsonify({'message': 'Invoice item updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'UPDATE_INVOICE_ITEM_ERROR', f'Error updating invoice item: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while updating the invoice item'}), 500

@invoice_items_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice_item(item_id):
    """
    Delete an invoice item.
    Only the owner of the associated invoice or an admin can delete the item.
    """
    current_user_id = get_jwt_identity()
    try:
        item = InvoiceItem.query.get(item_id)
        if not item:
            log_action(current_user_id, 'DELETE_INVOICE_ITEM_NOT_FOUND', f'Invoice item {item_id} not found')
            return jsonify({'message': 'Invoice item not found'}), 404
        
        invoice = Invoice.query.filter_by(id=item.invoice_id).first()
        current_user = User.query.get(current_user_id)
        if invoice.user_id != current_user_id and not (current_user and current_user.is_admin):
            log_action(current_user_id, 'DELETE_INVOICE_ITEM_UNAUTHORIZED', f'Unauthorized deletion for invoice item {item_id}')
            return jsonify({'message': 'Unauthorized'}), 403
        
        db.session.delete(item)
        db.session.commit()
        log_action(current_user_id, 'DELETE_INVOICE_ITEM_SUCCESS', f'Deleted invoice item {item_id}')
        return jsonify({'message': 'Invoice item deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'DELETE_INVOICE_ITEM_ERROR', f'Error deleting invoice item: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while deleting the invoice item'}), 500
