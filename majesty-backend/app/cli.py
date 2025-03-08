import click

def register_cli_commands(app):
    """Register custom CLI commands."""
    @app.cli.command("create-admin")
    @click.argument("username")
    @click.argument("password")
    def create_admin(username, password):
        """Create an admin user."""
        from app.models import User, Role
        from app import db

        with app.app_context():
            # Create the 'admin' role if it doesn't exist
            admin_role = Role.query.filter_by(name='admin').first()
            if not admin_role:
                admin_role = Role(name='admin')
                db.session.add(admin_role)
                db.session.commit()
                print("Created 'admin' role.")

            # Check if the admin user already exists
            admin = User.query.filter_by(username=username).first()
            if admin:
                print(f"User '{username}' already exists.")
                return

            # Create the admin user
            admin = User(username=username, is_admin=True)  # Set is_admin=True
            admin.set_password(password)
            admin.roles.append(admin_role)  # Assign the 'admin' role
            db.session.add(admin)
            db.session.commit()
            print(f"Admin user '{username}' created successfully!")