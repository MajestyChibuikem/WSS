from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, User
from app import db
from app.utils.logger import log_action
import datetime
import uuid

invoices_bp = Blueprint('invoices', __name__, url_prefix='/invoices')

@invoices_bp.route('', methods=['GET'])
@jwt_required()
def get_invoices():
    """
    Retrieve all invoices for the logged-in user.
    """
    current_user_id = get_jwt_identity()
    try:
        invoices = Invoice.query.filter_by(user_id=current_user_id).all()
        result = []
        for invoice in invoices:
            result.append({
                'id': invoice.id,
                'invoice_number': str(invoice.invoice_number),
                'total_amount': str(invoice.total_amount),
                'created_at': invoice.created_at.isoformat() if invoice.created_at else None,
                'status': invoice.status,
                'notes': invoice.notes,
            })
        log_action(current_user_id, 'GET_INVOICES', 'Retrieved invoices for user')
        return jsonify({'invoices': result}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_INVOICES_ERROR', f'Error retrieving invoices: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while retrieving invoices'}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    """
    Retrieve a single invoice by its ID.
    """
    current_user_id = get_jwt_identity()
    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user_id).first()
        if not invoice:
            log_action(current_user_id, 'GET_INVOICE_NOT_FOUND', f'Invoice {invoice_id} not found')
            return jsonify({'message': 'Invoice not found'}), 404

        result = {
            'id': invoice.id,
            'invoice_number': str(invoice.invoice_number),
            'total_amount': str(invoice.total_amount),
            'created_at': invoice.created_at.isoformat() if invoice.created_at else None,
            'status': invoice.status,
            'notes': invoice.notes,
        }
        log_action(current_user_id, 'GET_INVOICE', f'Retrieved invoice {invoice_id}')
        return jsonify({'invoice': result}), 200
    except Exception as e:
        log_action(current_user_id, 'GET_INVOICE_ERROR', f'Error retrieving invoice: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while retrieving the invoice'}), 500

@invoices_bp.route('', methods=['POST'])
@jwt_required()
def create_invoice():
    """
    Create a new invoice for the logged-in user.
    Expects a JSON payload with at least a total_amount.
    Optionally, notes can be provided.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data or not data.get('total_amount'):
        log_action(current_user_id, 'CREATE_INVOICE_INVALID', 'Missing total_amount in request')
        return jsonify({'message': 'Total amount is required'}), 400

    try:
        total_amount = data.get('total_amount')
        notes = data.get('notes', '')
        invoice = Invoice(user_id=current_user_id, total_amount=total_amount, notes=notes)
        db.session.add(invoice)
        db.session.commit()
        log_action(current_user_id, 'CREATE_INVOICE_SUCCESS', f'Invoice {invoice.id} created successfully')
        return jsonify({'message': 'Invoice created successfully', 'invoice_id': invoice.id}), 201
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'CREATE_INVOICE_ERROR', f'Error creating invoice: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while creating the invoice'}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['PUT'])
@jwt_required()
def update_invoice(invoice_id):
    """
    Update an existing invoice.
    Allows updating notes and status.
    Only the owner of the invoice is allowed to update it.
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        log_action(current_user_id, 'UPDATE_INVOICE_INVALID', 'No data provided for update')
        return jsonify({'message': 'No data provided'}), 400

    try:
        invoice = Invoice.query.filter_by(id=invoice_id, user_id=current_user_id).first()
        if not invoice:
            log_action(current_user_id, 'UPDATE_INVOICE_NOT_FOUND', f'Invoice {invoice_id} not found')
            return jsonify({'message': 'Invoice not found'}), 404

        if 'notes' in data:
            invoice.notes = data['notes']
        if 'status' in data:
            invoice.status = data['status']

        db.session.commit()
        log_action(current_user_id, 'UPDATE_INVOICE_SUCCESS', f'Invoice {invoice_id} updated successfully')
        return jsonify({'message': 'Invoice updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'UPDATE_INVOICE_ERROR', f'Error updating invoice: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while updating the invoice'}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['DELETE'])
@jwt_required()
def delete_invoice(invoice_id):
    """
    Delete an invoice.
    For this operation, only an admin user is allowed.
    """
    current_user_id = get_jwt_identity()
    try:
        current_user = User.query.get(current_user_id)
        if not current_user or not current_user.is_admin:
            log_action(current_user_id, 'DELETE_INVOICE_UNAUTHORIZED', f'Unauthorized deletion attempt for invoice {invoice_id}')
            return jsonify({'message': 'Unauthorized'}), 403

        invoice = Invoice.query.get(invoice_id)
        if not invoice:
            log_action(current_user_id, 'DELETE_INVOICE_NOT_FOUND', f'Invoice {invoice_id} not found')
            return jsonify({'message': 'Invoice not found'}), 404

        db.session.delete(invoice)
        db.session.commit()
        log_action(current_user_id, 'DELETE_INVOICE_SUCCESS', f'Invoice {invoice_id} deleted successfully')
        return jsonify({'message': 'Invoice deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        log_action(current_user_id, 'DELETE_INVOICE_ERROR', f'Error deleting invoice: {str(e)}', level='error')
        return jsonify({'message': 'An error occurred while deleting the invoice'}), 500
