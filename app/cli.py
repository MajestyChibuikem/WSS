import click
from app import create_app, db
from app.models import User, Role

app = create_app()

@app.cli.command("create-admin")
@click.argument("username")
@click.argument("password")
def create_admin(username, password):
    """Create an admin user."""
    with app.app_context():
        admin = User.query.filter_by(username=username).first()
        if admin:
            print(f"User '{username}' already exists.")
            return

        admin = User(username=username)
        admin.set_password(password)
        admin_role = Role.query.filter_by(name='admin').first()
        if admin_role:
            admin.roles.append(admin_role)
            db.session.add(admin)
            db.session.commit()
            print(f"Admin user '{username}' created successfully!")
        else:
            print("Admin role does not exist. Please create the 'admin' role first.")

if __name__ == '__main__':
    app.cli()