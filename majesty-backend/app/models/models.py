from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSON
from werkzeug.security import check_password_hash, generate_password_hash
from uuid import UUID, uuid4
from sqlalchemy import func, and_, String



# Initialize SQLAlchemy
from app import db

# Join table for many-to-many relationship between Users and Roles
user_roles = db.Table(
    'user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'), primary_key=True)
)

class Role(db.Model):
    __tablename__ = 'roles'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<Role {self.name}>'

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    roles = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))
    invoices = db.relationship('Invoice', backref='created_by', lazy='dynamic')
    cart_items = db.relationship('Cart', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def add_role(self, role_name):
        role = Role.query.filter_by(name=role_name).first()
        if role and role not in self.roles:
            self.roles.append(role)

    def remove_role(self, role_name):
        role = Role.query.filter_by(name=role_name).first()
        if role and role in self.roles:
            self.roles.remove(role)

    def has_role(self, role_name):
        return role_name in [role.name for role in self.roles]

    def can_manage_inventory(self):
        return self.has_role('admin') or self.has_role('super_user')

    def can_manage_users(self):
        return self.has_role('admin')

    @staticmethod
    def create_user(admin_user, username, password, roles=None):
        if not admin_user.has_role('admin'):
            raise PermissionError("Only administrators can create new users")
        new_user = User(username=username)
        new_user.set_password(password)
        if roles:
            if isinstance(roles, str):
                roles = [roles]
            for role_name in roles:
                new_user.add_role(role_name)
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def initialize_roles_and_admin():
        # Create roles if they don't exist
        roles = ['admin', 'staff', 'super_user']
        for role_name in roles:
            role = Role.query.filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name)
                db.session.add(role)
                print(f"Created role: {role_name}")
            else:
                print(f"Role already exists: {role_name}")

        # Commit roles to the database
        db.session.commit()

        # Create admin user if it doesn't exist
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin', is_admin=True)
            admin.set_password('adminpassword')  # Set a secure password
            db.session.add(admin)
            print("Created admin user.")
        else:
            print("Admin user already exists.")

        # Assign the 'admin' role to the admin user if not already assigned
        admin_role = Role.query.filter_by(name='admin').first()
        if admin_role and admin_role not in admin.roles:
            admin.roles.append(admin_role)
            print("Assigned 'admin' role to the admin user.")
        elif admin_role in admin.roles:
            print("Admin user already has the 'admin' role.")
        else:
            print("Admin role not found. Cannot assign role to admin user.")

        # Commit changes to the database
        db.session.commit()
    def get_user_sales(self):
        """
        Track the total sales (invoices) for a particular user.
        """
        user_sales = db.session.query(
            func.sum(Invoice.total_amount).label('total_sales')
        ).filter(Invoice.user_id == self.id).scalar()

        return user_sales or 0

class Wine(db.Model):
    __tablename__ = 'wines'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    abv = db.Column(db.Float, nullable=False)  # Alcohol by Volume %
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Price in Naira
    category = db.Column(db.Enum("Red", "White", "Rosé", "Sparkling", "Dessert", "Fortified", name="wine_category"), nullable=False)
    bottle_size = db.Column(db.Integer, nullable=False)  # Bottle size in ml
    in_stock = db.Column(db.Integer, default=0, nullable=False)  # Number of bottles available
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    creator = db.relationship('User', foreign_keys=[added_by])

    @staticmethod
    def add_to_inventory(user, wine_data):
        if not user.can_manage_inventory():
            raise PermissionError("Only administrators and super users can add wines")
        
        wine = Wine(
            name=wine_data.get('name'),
            abv=wine_data.get('abv'),
            price=wine_data.get('price'),
            category=wine_data.get('category'),
            bottle_size=wine_data.get('bottleSize'),
            in_stock=wine_data.get('inStock', 0),
            added_by=user.id
        )
        
        db.session.add(wine)
        db.session.commit()
        return wine

    @staticmethod
    def get_inventory_value_by_category():
        """
        Get the total value of the current inventory, grouped by category.
        """
        inventory_value = db.session.query(
            Wine.category,
            func.sum(Wine.price * Wine.in_stock).label('total_value')
        ).group_by(Wine.category).all()

        return {category: total_value for category, total_value in inventory_value}

class Cart(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    wine_id = db.Column(db.Integer, db.ForeignKey('wines.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'wine_id', name='uq_user_wine'),
        db.Index('idx_cart_user', 'user_id')
    )



class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(String(36), default=lambda: str(uuid4()), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='completed')
    notes = db.Column(db.Text)

    __table_args__ = (
        db.Index('idx_invoice_created_at', 'created_at'),
        db.Index('idx_invoice_user', 'user_id')
    )

    # Relationship to InvoiceItem with cascade delete
    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic', cascade='all, delete-orphan')

    @staticmethod
    def calculate_revenue(start_date, end_date):
        """
        Calculate the total revenue within a specified time period.
        """
        total_revenue = db.session.query(func.sum(Invoice.total_amount)).filter(
            and_(Invoice.created_at >= start_date, Invoice.created_at <= end_date)
        ).scalar()
        return total_revenue or 0

    @staticmethod
    def compare_sales_periods(period1_start, period1_end, period2_start, period2_end):
        """
        Compare revenue between two time periods and calculate the percentage increase or decrease.
        """
        revenue_period1 = Invoice.calculate_revenue(period1_start, period1_end)
        revenue_period2 = Invoice.calculate_revenue(period2_start, period2_end)

        if revenue_period1 == 0:
            return 0  # Avoid division by zero

        percentage_change = ((revenue_period2 - revenue_period1) / revenue_period1) * 100
        return percentage_change

    def to_dict(self):
        """
        Convert the Invoice object to a dictionary, including its items.
        """
        return {
            'id': self.id,
            'invoice_number': str(self.invoice_number),
            'user_id': self.user_id,
            'total_amount': str(self.total_amount),
            'created_at': self.created_at.isoformat(),
            'status': self.status,
            'notes': self.notes,
            'items': [item.to_dict() for item in self.items]
        }

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False)
    wine_id = db.Column(db.Integer, db.ForeignKey('wines.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    __table_args__ = (
        db.Index('idx_invoice_item_invoice', 'invoice_id'),
        db.Index('idx_invoice_item_wine', 'wine_id')
    )

    def to_dict(self):
        """
        Convert the InvoiceItem object to a dictionary, including wine details.
        """
        wine = Wine.query.get(self.wine_id)
        return {
            'id': self.id,
            'invoice_id': self.invoice_id,
            'wine': {
                'id': wine.id,
                'name': wine.name
            },
            'quantity': self.quantity,
            'price': str(self.price)
        }

class logEntry(db.Model):
    # Table name
    __tablename__ = 'log_entries'
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    endpoint = db.Column(db.String(255), nullable=True)
    method = db.Column(db.String(10), nullable=True)
    status_code = db.Column(db.Integer, nullable=True)
    additional_data = db.Column(db.Text, nullable=True)
    acting_username = db.Column(db.String(100), nullable=True)
    affected_name = db.Column(db.String(255), nullable=True)

    # Table indexing
    __table_args__ = (
        db.Index('idx_log_timestamp', timestamp),
        db.Index('idx_log_user_id', user_id),
        db.Index('idx_log_action', action),
    )
    def to_dict(self):
        """Convert log entry to a dictionary for JSON responses."""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "message": self.message,
            "timestamp": self.timestamp.isoformat(),
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "endpoint": self.endpoint,
            "method": self.method,
            "additional_data": self.additional_data,
            "status_code": self.status_code,
            "acting_username": self.acting_username,
            "affected_name": self.affected_name,
        }
    
class BlacklistedToken(db.Model):
    __tablename__ = 'blacklisted_tokens'

    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)  # JWT ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<BlacklistedToken {self.jti}>"