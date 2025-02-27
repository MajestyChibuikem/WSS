import logging
import json
import os
from datetime import datetime
from flask import request, g, has_request_context
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
import traceback
from app import db

#models to log records into the database
class logEntry(db.Model):
    #table name
    __tablename__ = 'log_entries'
    id = db.Column(db.Integer, primary_key = True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)#i will chang this to false later to test the logging feature
    action = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    endpoint = db.Column(db.String(255), nullable=True)
    method = db.Column(db.String(10), nullable=True)
    status_code = db.Column(db.Integer, nullable=True)
    additional_data = db.Column(db.Text, nullable=True)

    #table indexing
    __table_args__ =(
        db.Index('idx_log_timestamp', timestamp),
        db.Index('idx_log_user_id', user_id),
        db.Index('idx_log_action', action),
    )






# logger configuration
def setup_logger(app):
    """
    this method configures the applications logging system
    """
    # Ensure log directory exists
    log_dir = os.path.join(app.root_path, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Set up file logging
    log_file = os.path.join(log_dir, 'wine_inventory.log')
    
    # Configure the main logger
    logger = logging.getLogger('wine_inventory')
    logger.setLevel(logging.INFO)
    
    # Clear existing handlers to avoid duplicates on reloads
    if logger.handlers:
        logger.handlers.clear()
    
    # File handler with rotation (10 MB per file, max 10 files)
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10*1024*1024, backupCount=10
    )
    file_handler.setLevel(logging.INFO)
    
    # Daily rotating file handler
    daily_handler = TimedRotatingFileHandler(
        os.path.join(log_dir, 'daily_wine_inventory.log'),
        when='midnight',
        interval=1,
        backupCount=30
    )
    daily_handler.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG if app.debug else logging.INFO)
    
    # Formatter
    formatter = logging.Formatter(
        '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
    )
    
    # Apply formatter to handlers
    file_handler.setFormatter(formatter)
    daily_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(daily_handler)
    logger.addHandler(console_handler)
    
    # Replace Flask's default logger
    app.logger.handlers = logger.handlers
    app.logger.setLevel(logger.level)
    
    # Log basic app startup info
    app.logger.info(f"Wine Inventory API Started - Environment: {app.config.get('ENV', 'development')}")
    
    return logger


def log_action(user_id, action, message, additional_data=None, save_to_db=True, level='info'):
    """
    Log user actions with detailed information
    
    Args:
        user_id (int): ID of the user performing the action (None for anonymous)
        action (str): Type of action being performed (e.g., LOGIN, LOGOUT, CREATE_WINE)
        message (str): Description of the action
        additional_data (dict, optional): Any extra data to log
        save_to_db (bool): Whether to save the log to the database
        level (str): Log level (debug, info, warning, error, critical)
    """
    logger = logging.getLogger('wine_inventory')
    
    # Build log data object
    log_data = {
        'timestamp': datetime.utcnow().isoformat(),
        'user_id': user_id,
        'action': action,
        'message': message,
    }
    
    # Add request context data if available
    if has_request_context():
        log_data.update({
            'ip_address': request.remote_addr,
            'user_agent': request.user_agent.string if request.user_agent else None,
            'endpoint': request.endpoint,
            'method': request.method,
            'path': request.path,
        })
    
    # Add additional data if provided
    if additional_data:
        log_data['additional_data'] = additional_data
    
    # Convert to a string for the logger
    log_message = f"[{action}] User {user_id}: {message}"
    
    # Log with the appropriate level
    log_method = getattr(logger, level.lower())
    log_method(log_message)
    
    # Save to database if requested
    if save_to_db:
        try:
            log_entry = logEntry(
                user_id=user_id,
                action=action,
                message=message,
                ip_address=log_data.get('ip_address'),
                user_agent=log_data.get('user_agent'),
                endpoint=log_data.get('endpoint'),
                method=log_data.get('method'),
                additional_data=json.dumps(additional_data) if additional_data else None,
                status_code=getattr(g, 'status_code', None) if has_request_context() else None
            )
            db.session.add(log_entry)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save log entry to database: {str(e)}")
            logger.debug(traceback.format_exc())
    
    return log_data


# Request logging middleware
def log_request():
    """To be called before each request to log incoming requests"""
    logger = logging.getLogger('wine_inventory')
    logger.debug(f"Request: {request.method} {request.path} from {request.remote_addr}")


def log_response(response):
    """To be called after each request to log the response"""
    logger = logging.getLogger('wine_inventory')
    
    # Store the status code in Flask's g object for potential use in log_action
    if has_request_context():
        g.status_code = response.status_code
    
    logger.debug(f"Response: {response.status_code}")
    return response


# Error logging
def log_exception(exception):
    """Log unhandled exceptions"""
    logger = logging.getLogger('wine_inventory')
    
    user_id = None
    if has_request_context():
        # Try to get the current user ID if authenticated
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
        except:
            pass
    
    log_data = {
        'exception_type': exception.__class__.__name__,
        'exception_message': str(exception),
        'traceback': traceback.format_exc()
    }
    
    if has_request_context():
        log_action(
            user_id=user_id,
            action='EXCEPTION',
            message=f"Unhandled exception: {exception.__class__.__name__}",
            additional_data=log_data,
            level='error'
        )
    else:
        logger.error(f"Unhandled exception: {exception.__class__.__name__}: {str(exception)}")
        logger.debug(traceback.format_exc())
    
    # Continue with the normal exception handling
    raise exception


# Setup function for Flask app
def init_app(app):
    """Initialize logging for the Flask app"""
    logger = setup_logger(app)
    
    # Register before_request handlers
    app.before_request(log_request)
    
    # Register after_request handlers
    app.after_request(log_response)
    
    # Register errorhandler
    app.errorhandler(Exception)(log_exception)
    
    return logger