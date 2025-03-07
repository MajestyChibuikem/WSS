from flask import Blueprint, jsonify, request
from app import db
from app.models import logEntry  # Adjust if necessary

logs_bp = Blueprint("logs", __name__, url_prefix='/logs')

@logs_bp.route("/logs", methods=["GET"])
def get_all_logs():
    """Retrieve all log entries."""
    logs = logEntry.query.all()
    return jsonify([log.to_dict() for log in logs]), 200

@logs_bp.route("/logs/user/<int:user_id>", methods=["GET"])
def get_user_logs(user_id):
    """Retrieve all log entries for a specific user."""
    logs = logEntry.query.filter_by(user_id=user_id).all()
    return jsonify([log.to_dict() for log in logs]), 200

@logs_bp.route("/logs/action/<string:action>", methods=["GET"])
def get_logs_by_action(action):
    """Retrieve logs filtered by action type."""
    logs = logEntry.query.filter_by(action=action).all()
    return jsonify([log.to_dict() for log in logs]), 200
