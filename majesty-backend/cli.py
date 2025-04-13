# import click

# def register_cli_commands(app):
#     """Register custom CLI commands."""
#     @app.cli.command("create-admin")
#     @click.argument("username")
#     @click.argument("password")
# def create_admin(app, username, password):
#     """Create an admin user and additional roles."""
#     from app.models import User, Role
#     from app import db


#     with app.app_context():
#         # Define the roles to create
#         roles_to_create = ['admin', 'staff', 'super_user']

#          # Create roles if they don't exist
#         for role_name in roles_to_create:
#             role = Role.query.filter_by(name=role_name).first()
#             if not role:
#                 role = Role(name=role_name)
#                 db.session.add(role)
#                 print(f"Created '{role_name}' role.")
#             else:
#                 print(f"Role '{role_name}' already exists.")

#         # Commit roles to the database
#         db.session.commit()

#         # Check if the admin user already exists
#         admin = User.query.filter_by(username=username).first()
#         if admin:
#             print(f"User '{username}' already exists.")
#             return

#         # Create the admin user
#         admin = User(username=username, is_admin=True)  # Set is_admin=True
#         admin.set_password(password)

#         # Assign the 'admin' role to the admin user
#         admin_role = Role.query.filter_by(name='admin').first()
#         if admin_role:
#             admin.roles.append(admin_role)
#             print(f"Assigned 'admin' role to user '{username}'.")
#         else:
#             print("Error: 'admin' role not found. Cannot assign role to admin user.")
#             return

#         db.session.add(admin)
#         db.session.commit()
#         print(f"Admin user '{username}' created successfully!")