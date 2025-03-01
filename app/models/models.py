from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSON
from werkzeug.security import check_password_hash, generate_password_hash
import uuid

# Join table to connect users and roles in a many-to-many relationship
user_roles = db.Table('user_roles',
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
    password_hash = db.Column(db.String(128), nullable=False)  # Password hash column
    is_admin = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    roles = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))
    invoices = db.relationship('Invoice', backref='created_by', lazy='dynamic')
    cart_items = db.relationship('Cart', backref='user', lazy='dynamic')

    # Password methods
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    # Role methods
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
        """Check if the user can add to wine inventory"""
        return self.has_role('admin') or self.has_role('super_user')
    
    def can_manage_users(self):
        """Check if the user can manage other users"""
        return self.has_role('admin')

    # Admin controls
    @staticmethod
    def create_user(admin_user, username, password, roles=None):
        if not admin_user.has_role('admin'):
            raise PermissionError("Only administrators can create new users")
        new_user = User(username=username)
        new_user.set_password(password)
        
        # Add roles if provided
        if roles:
            for role_name in roles:
                new_user.add_role(role_name)
                
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def delete_user(admin_user, user_id):
        if not admin_user.has_role('admin'):
            raise PermissionError("Only administrators can delete users")
        user_to_delete = User.query.get(user_id)
        if user_to_delete:
            db.session.delete(user_to_delete)
            db.session.commit()
            return True
        return False

    # Automatically create roles and admin user
    @staticmethod
    def initialize_roles_and_admin():
        # Create roles if they don't exist
        roles = ['admin', 'staff', 'super_user']
        for role_name in roles:
            role = Role.query.filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name)
                db.session.add(role)
        
        # Create admin user if it doesn't exist
        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin')
            admin.set_password('adminpassword')  # Set a secure password
            admin.add_role('admin')  # Assign the 'admin' role
            db.session.add(admin)
        
        db.session.commit()

class Wine(db.Model):
    __tablename__ = 'wines'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    vintage = db.Column(db.Integer)
    varietal = db.Column(db.String(100))
    region = db.Column(db.String(100))
    country = db.Column(db.String(100))
    price = db.Column(db.Numeric(10, 2))
    stock_quantity = db.Column(db.Integer, default=0)
    bottle_size = db.Column(db.String(10), nullable=False)
    description = db.Column(db.Text)
    tags = db.Column(JSON, default=[])  # Fixed JSON column definition
    added_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    invoice_items = db.relationship('InvoiceItem', backref='wine', lazy='dynamic')
    creator = db.relationship('User', foreign_keys=[added_by])
    
    @staticmethod
    def add_to_inventory(user, wine_data):
        """Add wine to inventory, only admin and super_user can do this"""
        if not user.can_manage_inventory():
            raise PermissionError("Only administrators and super users can add wines")
        
        wine = Wine(
            name=wine_data.get('name'),
            vintage=wine_data.get('vintage'),
            varietal=wine_data.get('varietal'),
            region=wine_data.get('region'),
            country=wine_data.get('country'),
            price=wine_data.get('price'),
            stock_quantity=wine_data.get('stock_quantity', 0),
            bottle_size=wine_data.get('bottle_size'),
            description=wine_data.get('description'),
            tags=wine_data.get('tags', []),
            added_by=user.id
        )
        
        db.session.add(wine)
        db.session.commit()
        return wine

class Invoice(db.Model):
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='completed')
    notes = db.Column(db.Text)

    # Indexes
    __table_args__ = (
        db.Index('idx_invoice_created_at', 'created_at'),
        db.Index('idx_invoice_user', 'user_id')
    )

    # Relationships
    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic')

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_items'

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False)
    wine_id = db.Column(db.Integer, db.ForeignKey('wines.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    # Indexes
    __table_args__ = (
        db.Index('idx_invoice_item_invoice', 'invoice_id'),
        db.Index('idx_invoice_item_wine', 'wine_id')
    )

class Cart(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    wine_id = db.Column(db.Integer, db.ForeignKey('wines.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('user_id', 'wine_id', name='uq_user_wine'),
        db.Index('idx_cart_user', 'user_id')
    )