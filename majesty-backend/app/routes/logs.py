from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
from app import db
from sqlalchemy import or_
from app.models import logEntry, Invoice, InvoiceItem, Wine, User
from flask_jwt_extended import jwt_required, get_jwt_identity 
from app.utils.decorators import token_required
from app.utils.logger import log_action
from app.utils.pagination import paginate_query

logs_bp = Blueprint("logs", __name__, url_prefix='/logs')

@logs_bp.route("/logs", methods=["GET"])
@token_required
def get_all_logs():
    """Retrieve all log entries."""
    try:
        logs = logEntry.query.all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        # Log the error (if logging is enabled)
        return jsonify({'message': f'Error retrieving logs: {str(e)}'}), 500

@logs_bp.route("/logs/user/<int:user_id>", methods=["GET"])
@token_required
def get_user_logs(user_id):
    """Retrieve all log entries for a specific user."""
    try:
        logs = logEntry.query.filter_by(user_id=user_id).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        # Log the error (if logging is enabled)
        return jsonify({'message': f'Error retrieving logs for user {user_id}: {str(e)}'}), 500

@logs_bp.route("/logs/action/<string:action>", methods=["GET"])
@token_required
def get_logs_by_action(action):
    """Retrieve logs filtered by action type."""
    try:
        logs = logEntry.query.filter_by(action=action).all()
        return jsonify([log.to_dict() for log in logs]), 200
    except Exception as e:
        # Log the error (if logging is enabled)
        return jsonify({'message': f'Error retrieving logs for action {action}: {str(e)}'}), 500

@logs_bp.route('/sales', methods=['GET'])
@jwt_required()
def get_sales_logs():
    """
    Retrieve sales-related logs with filtering options.
    Only returns logs related to checkout operations.
    
    Query Parameters:
        - days: Number of days to look back (default: 7)
        - page: Page number for pagination (default: 1)
        - per_page: Items per page (default: 20)
        - user_id: Filter by specific user ID
        - sort: Sort by 'newest' or 'oldest' (default: 'newest')
        - include_errors: Include error logs (default: false)
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Get query parameters with defaults
        days = int(request.args.get('days', 7))
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        user_id = request.args.get('user_id')
        sort = request.args.get('sort', 'newest')
        include_errors = request.args.get('include_errors', 'false').lower() == 'true'
        
        # Validate inputs
        if days < 1 or days > 365:
            return jsonify({'error': 'Days must be between 1 and 365'}), 400
        if page < 1:
            return jsonify({'error': 'Page must be at least 1'}), 400
        if per_page < 1 or per_page > 100:
            return jsonify({'error': 'Items per page must be between 1 and 100'}), 400
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Base query - filter by checkout-related actions and date range
        query = logEntry.query.filter(
            or_(
                logEntry.action.like('CHECKOUT%'),
                logEntry.action.like('INVOICE%')
            ),
            logEntry.timestamp >= start_date,
            logEntry.timestamp <= end_date
        )
        
        # Filter out errors unless requested
        if not include_errors:
            query = query.filter(logEntry.action != 'CHECKOUT_ERROR')
        
        # Additional filters
        if user_id:
            query = query.filter(logEntry.user_id == user_id)
        
        # Sorting
        if sort == 'oldest':
            query = query.order_by(logEntry.timestamp.asc())
        else:  # default to newest first
            query = query.order_by(logEntry.timestamp.desc())
        
        # Paginate the results
        paginated_results = paginate_query(query, page, per_page)
        
        # Enhance log data with invoice information where available
        enhanced_logs = []
        for log in paginated_results.items:
            log_data = log.to_dict()
            
            # Try to extract invoice ID from affected_name or message
            invoice_id = None
            if log.affected_name and 'Invoice ID' in log.affected_name:
                invoice_id = log.affected_name.split('Invoice ID ')[1]
            elif 'invoice' in log.message.lower():
                # Try to find invoice ID in message
                import re
                match = re.search(r'invoice (\d+)', log.message.lower())
                if match:
                    invoice_id = match.group(1)
            
            # Add invoice details if found
            if invoice_id:
                try:
                    invoice = Invoice.query.get(invoice_id)
                    if invoice:
                        log_data['invoice'] = {
                            'id': invoice.id,
                            'total_amount': invoice.total_amount,
                            'created_at': invoice.created_at.isoformat(),
                            'items': []
                        }
                        
                        # Add invoice items
                        for item in invoice.items:
                            wine = Wine.query.get(item.wine_id)
                            log_data['invoice']['items'].append({
                                'wine_id': item.wine_id,
                                'wine_name': wine.name if wine else 'Unknown',
                                'quantity': item.quantity,
                                'price': item.price
                            })
                except:
                    pass
            
            enhanced_logs.append(log_data)
        
        # Prepare response
        response = {
            'logs': enhanced_logs,
            'total': paginated_results.total,
            'pages': paginated_results.pages,
            'current_page': page,
            'per_page': per_page,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }
        
        return jsonify(response)
    
    except ValueError as e:
        return jsonify({'error': 'Invalid parameter value'}), 400
    except Exception as e:
        log_action(
            current_user_id,
            'SALES_LOGS_ERROR',
            f'Failed to retrieve sales logs: {str(e)}',
            level='error'
        )
        return jsonify({'error': 'Failed to retrieve sales logs'}), 500
    
@logs_bp.route('/sales/user', methods=['GET'])
@jwt_required()
def get_user_sales_logs():
    """
    Retrieve sales logs filtered by user ID.
    - For regular users: returns only their own sales
    - For admins: can specify any user_id parameter
    
    Query Parameters:
        - user_id: (admin only) Specific user ID to filter by
        - days: Number of days to look back (default: 30)
        - page: Page number (default: 1)
        - per_page: Items per page (default: 10)
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        # Get query parameters
        requested_user_id = request.args.get('user_id')
        days = int(request.args.get('days', 30))
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        
        # Determine which user's logs to show
        if requested_user_id:
            if not current_user.is_admin:  # Assuming you have an is_admin flag
                return jsonify({'error': 'Unauthorized'}), 403
            filter_user_id = requested_user_id
        else:
            filter_user_id = current_user_id
        
        # Date range calculation
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Base query - successful checkouts for the specified user
        query = logEntry.query.filter(
            logEntry.action == 'CHECKOUT_SUCCESS',
            logEntry.user_id == filter_user_id,
            logEntry.timestamp >= start_date,
            logEntry.timestamp <= end_date
        ).order_by(logEntry.timestamp.desc())
        
        # Pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Enhance with invoice data
        sales_data = []
        for log in paginated.items:
            log_data = log.to_dict()
            
            # Extract invoice ID
            invoice_id = None
            if log.affected_name and 'Invoice ID' in log.affected_name:
                invoice_id = log.affected_name.split('Invoice ID ')[1]
            
            if invoice_id:
                invoice = Invoice.query.get(invoice_id)
                if invoice:
                    log_data['invoice'] = {
                        'id': invoice.id,
                        'total': invoice.total_amount,
                        'date': invoice.created_at.isoformat(),
                        'items': [{
                            'wine_id': item.wine_id,
                            'wine_name': Wine.query.get(item.wine_id).name,
                            'quantity': item.quantity,
                            'price': item.price
                        } for item in invoice.items]
                    }
            
            sales_data.append(log_data)
        
        return jsonify({
            'sales': sales_data,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page,
            'user_id': filter_user_id,
            'time_period': f'{start_date.date()} to {end_date.date()}'
        })
    
    except Exception as e:
        log_action(
            current_user_id,
            'SALES_LOGS_ERROR',
            f'Failed to retrieve user sales: {str(e)}',
            level='error'
        )
        return jsonify({'error': 'Failed to retrieve sales data'}), 500