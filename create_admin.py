from app import create_app, db
from app.models import User, Role

app = create_app()

with app.app_context():
    # Check if the admin user already exists
    admin = User.query.filter_by(username='admin').first()
    if admin:
        print('Admin user already exists!')
    else:
        # Create an admin user
        admin = User(username='admin')
        admin.set_password('adminpassword')  # Set a secure password
        admin.add_role('admin')  # Assign the 'admin' role
        db.session.add(admin)
        db.session.commit()
        print('Admin user created successfully!')





