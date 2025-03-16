from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, InvoiceItem, User, Wine
from app import db
from app.utils.logger import log_action

invoices_bp = Blueprint('invoices', __name__, url_prefix='/invoices')

@invoices_bp.route('/', methods=['GET', 'POST'])
@jwt_required()
def manage_invoices():
    """
    Handle GET (retrieve all invoices for the user) and POST (create a new invoice with items).
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if request.method == 'GET':
        # Retrieve all invoices for the current user
        try:
            invoices = Invoice.query.filter_by(user_id=current_user_id).all()
            result = []
            for invoice in invoices:
                items = []
                for item in invoice.items:
                    wine = Wine.query.get(item.wine_id)
                    items.append({
                        'item': {'name': wine.name, 'id': wine.id},
                        'number_sold': item.quantity,
                        'price': str(item.price)
                    })
                result.append({
                    'invoice_id': invoice.id,
                    'user_id': invoice.user_id,
                    'items': items,
                    'total_amount': str(invoice.total_amount)
                })
            log_action(
                current_user_id, 
                'GET_INVOICES_SUCCESS', 
                'Retrieved all invoices',
                affected_name=f'User ID {current_user_id}'  # Affected user
            )
            return jsonify({'invoices': result}), 200
        except Exception as e:
            log_action(
                current_user_id, 
                'GET_INVOICES_ERROR', 
                f'Error retrieving invoices: {str(e)}', 
                level='error',
                affected_name=f'User ID {current_user_id}'
            )
            return jsonify({'message': 'An error occurred while retrieving invoices'}), 500

    elif request.method == 'POST':
        # Create a new invoice with items
        data = request.get_json()
        if not data or not data.get('items') or not data.get('total_amount'):
            log_action(
                current_user_id, 
                'CREATE_INVOICE_INVALID', 
                'Missing required fields for invoice creation',
                affected_name=f'User ID {current_user_id}'
            )
            return jsonify({'message': 'items and total_amount are required'}), 400

        try:
            new_invoice = Invoice(
                user_id=current_user_id,
                total_amount=data['total_amount']
            )
            db.session.add(new_invoice)
            db.session.commit()

            for item_data in data['items']:
                new_item = InvoiceItem(
                    invoice_id=new_invoice.id,
                    wine_id=item_data['wine_id'],
                    quantity=item_data['quantity'],
                    price=item_data['price']
                )
                db.session.add(new_item)
            db.session.commit()

            log_action(
                current_user_id, 
                'CREATE_INVOICE_SUCCESS', 
                f'Created invoice {new_invoice.id}',
                affected_name=f'Invoice ID {new_invoice.id}'  # Affected invoice
            )
            return jsonify({'message': 'Invoice created successfully', 'invoice_id': new_invoice.id}), 201
        except Exception as e:
            db.session.rollback()
            log_action(
                current_user_id, 
                'CREATE_INVOICE_ERROR', 
                f'Error creating invoice: {str(e)}', 
                level='error',
                affected_name=f'User ID {current_user_id}'
            )
            return jsonify({'message': 'An error occurred while creating the invoice'}), 500

@invoices_bp.route('/<int:invoice_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def manage_single_invoice(invoice_id):
    """
    Handle GET (retrieve a single invoice), PUT (update an invoice), and DELETE (delete an invoice).
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    try:
        invoice = Invoice.query.filter_by(id=invoice_id).first()
        if not invoice:
            log_action(
                current_user_id, 
                'INVOICE_NOT_FOUND', 
                f'Invoice {invoice_id} not found',
                affected_name=f'Invoice ID {invoice_id}'
            )
            return jsonify({'message': 'Invoice not found'}), 404

        if invoice.user_id != current_user_id and not (current_user and current_user.is_admin):
            log_action(
                current_user_id, 
                'INVOICE_UNAUTHORIZED', 
                f'Unauthorized access for invoice {invoice_id}',
                affected_name=f'Invoice ID {invoice_id}'
            )
            return jsonify({'message': 'Unauthorized'}), 403

        if request.method == 'GET':
            # Retrieve a single invoice with its items
            items = []
            for item in invoice.items:
                wine = Wine.query.get(item.wine_id)
                items.append({
                    'item': {'name': wine.name, 'id': wine.id},
                    'number_sold': item.quantity,
                    'price': str(item.price)
                })
            log_action(
                current_user_id, 
                'GET_INVOICE_SUCCESS', 
                f'Retrieved invoice {invoice_id}',
                affected_name=f'Invoice ID {invoice_id}'
            )
            return jsonify({
                'invoice_id': invoice.id,
                'user_id': invoice.user_id,
                'items': items,
                'total_amount': str(invoice.total_amount)
            }), 200

        elif request.method == 'PUT':
            # Update an invoice and its items
            data = request.get_json()
            if not data:
                log_action(
                    current_user_id, 
                    'UPDATE_INVOICE_INVALID', 
                    'No data provided for invoice update',
                    affected_name=f'Invoice ID {invoice_id}'
                )
                return jsonify({'message': 'No data provided'}), 400

            if 'total_amount' in data:
                invoice.total_amount = data['total_amount']

            if 'items' in data:
                # Delete existing items and add new ones
                InvoiceItem.query.filter_by(invoice_id=invoice_id).delete()
                for item_data in data['items']:
                    new_item = InvoiceItem(
                        invoice_id=invoice_id,
                        wine_id=item_data['wine_id'],
                        quantity=item_data['quantity'],
                        price=item_data['price']
                    )
                    db.session.add(new_item)

            db.session.commit()
            log_action(
                current_user_id, 
                'UPDATE_INVOICE_SUCCESS', 
                f'Updated invoice {invoice_id}',
                affected_name=f'Invoice ID {invoice_id}'
            )
            return jsonify({'message': 'Invoice updated successfully'}), 200

        elif request.method == 'DELETE':
            # Delete an invoice and its associated items
            db.session.delete(invoice)
            db.session.commit()
            log_action(
                current_user_id, 
                'DELETE_INVOICE_SUCCESS', 
                f'Deleted invoice {invoice_id}',
                affected_name=f'Invoice ID {invoice_id}'
            )
            return jsonify({'message': 'Invoice deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'INVOICE_ERROR', 
            f'Error processing invoice: {str(e)}', 
            level='error',
            affected_name=f'Invoice ID {invoice_id}'
        )
        return jsonify({'message': 'An error occurred while processing the invoice'}), 500

@invoices_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    """
    Handle the checkout process.
    """
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    data = request.get_json()
    if not data or not data.get('items') or not data.get('total_amount'):
        log_action(
            current_user_id, 
            'CHECKOUT_INVALID', 
            'Missing required fields for checkout',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'items and total_amount are required'}), 400

    try:
        # Update the stock of each item in the cart
        for item_data in data['items']:
            wine = Wine.query.get(item_data['item']['id'])
            if not wine:
                log_action(
                    current_user_id, 
                    'CHECKOUT_ERROR', 
                    f'Wine {item_data["item"]["id"]} not found', 
                    level='error',
                    affected_name=f'Wine ID {item_data["item"]["id"]}'
                )
                return jsonify({'message': f'Wine {item_data["item"]["id"]} not found'}), 404

            if wine.in_stock < item_data['number_sold']:
                log_action(
                    current_user_id, 
                    'CHECKOUT_ERROR', 
                    f'Not enough stock for wine {wine.name}', 
                    level='error',
                    affected_name=f'Wine ID {wine.id}'
                )
                return jsonify({'message': f'Not enough stock for wine {wine.name}'}), 400

            wine.in_stock -= item_data['number_sold']
            db.session.add(wine)

        # Create the invoice
        new_invoice = Invoice(
            user_id=current_user_id,
            total_amount=data['total_amount']
        )
        db.session.add(new_invoice)
        db.session.commit()

        # Create invoice items
        for item_data in data['items']:
            new_item = InvoiceItem(
                invoice_id=new_invoice.id,
                wine_id=item_data['item']['id'],
                quantity=item_data['number_sold'],
                price=Wine.query.get(item_data['item']['id']).price
            )
            db.session.add(new_item)

        db.session.commit()

        log_action(
            current_user_id, 
            'CHECKOUT_SUCCESS', 
            f'Checkout completed for invoice {new_invoice.id}',
            affected_name=f'Invoice ID {new_invoice.id}'
        )
        return jsonify({'message': 'Checkout completed successfully', 'invoice_id': new_invoice.id}), 201

    except Exception as e:
        db.session.rollback()
        log_action(
            current_user_id, 
            'CHECKOUT_ERROR', 
            f'Error during checkout: {str(e)}', 
            level='error',
            affected_name=f'User ID {current_user_id}'
        )
        return jsonify({'message': 'An error occurred during checkout'}), 500