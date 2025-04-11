# /Users/macbookpro/Documents/projects/WSS/majesty-backend/initialize.py
import os
import sys
from app import create_app
from app.models.models import db, User, Role

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Create the application instance
app = create_app()

def initialize_database():
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        
        print("Initializing roles...")
        # Initialize roles
        roles = ['admin', 'staff', 'super_user']
        for role_name in roles:
            if not Role.query.filter_by(name=role_name).first():
                role = Role(name=role_name)
                db.session.add(role)
        
        print("Creating admin user...")
        # Create admin user
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin', is_admin=True)
            admin.set_password('adminpassword')
            admin_role = Role.query.filter_by(name='admin').first()
            if admin_role:
                admin.roles.append(admin_role)
            db.session.add(admin)
        
        db.session.commit()
        print("Database initialized successfully!")

if __name__ == '__main__':
    initialize_database()