from flask import Blueprint, jsonify, request
from app import db
from app.models import logEntry  
from app.utils.decorators import token_required

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