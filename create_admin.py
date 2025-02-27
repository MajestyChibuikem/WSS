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





curl -X POST http://localhost:5000/auth/create_user \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0MDYwMjAzMSwianRpIjoiNjA1MTc3YjgtODkzYy00YjE4LTk2M2UtODYyYzA1YTkwZGY1IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NDA2MDIwMzEsImNzcmYiOiIwODY1MTU5Yy01ZTBjLTQ5MDAtODcwOS1mNDhhYTNkMzkwMWYiLCJleHAiOjE3NDA2MDI5MzF9.NV_Z72nOHs3uANbzn-o47m5-5vTntorZdRVSLi4X1Sk" \
-d '{"username": "testuser", "password": "testpassword", "is_admin": false}'