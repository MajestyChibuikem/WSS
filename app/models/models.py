from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSON
from werkzeug.security import check_password_hash, generate_password_hash
import uuid

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
            for role_name in roles:
                new_user.add_role(role_name)
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def initialize_roles_and_admin():
        roles = ['admin', 'staff', 'super_user']
        for role_name in roles:
            role = Role.query.filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name)
                db.session.add(role)

        admin = User.query.filter_by(username='admin').first()
        if not admin:
            admin = User(username='admin')
            admin.set_password('adminpassword')
            admin.add_role('admin')
            db.session.add(admin)

        db.session.commit()

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
    invoice_number = db.Column(UUID(as_uuid=True), default=uuid.uuid4, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='completed')
    notes = db.Column(db.Text)

    __table_args__ = (
        db.Index('idx_invoice_created_at', 'created_at'),
        db.Index('idx_invoice_user', 'user_id')
    )

    items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic')

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
