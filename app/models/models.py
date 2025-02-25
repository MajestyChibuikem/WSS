from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from werkzeug.security import check_password_hash, generate_password_hash
import uuid

#join table to connect users and roles in a many to many relationship
user_roles = db.Table(
    'user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('users_id'), primary_key = True),
    db.Column('roles_id', db.Integer, db.ForeignKey('roles_id'), primary_key = True)

)

class User(db.Model):

    #table name
    __tablename__ = 'users'

    #columns
    id = db.Column(db.Interger, primary_key = True)
    username = db.Column(db.String(100), nullable = False, unique = True)
    role = db.Column(db.String(50), nullable = False, default= 'staff')
    created_at = db.Column(db.Datetime, default = datetime.timezone.utc)


    #relationship
    # im using dynamic here so i can just query or order the records
    invoices = db.relationship('Invoice', backref = 'created_by', lazy = 'dynamic') 
    cart_items = db.relationship('Cart', backref = 'user', lazy = 'dynamic')


    #set and check passwords
    def set_password(self, password):
        """
        this method sets and hashes the passwords
        """
        self.password_hash = generate_password_hash(password)


    def check_password(self, password):
        """
        this method checks if the passwords are hashed 
        """
        return check_password_hash(self.password_hash, password)
    

    #add role
    def add_role(self, role_name):
        """
        this method adds a new role to the database
        """
        role = Role.query.Filter_by(name=role_name).first()
        if role and role not in self.roles:
            self.roles.append(role)
    def remove_role(self, role_name):
        """
        this method removes a role and authorities it bears from the database
        """
        role = Role.query.Filter_by(name=role_name).first()
        if role and role in self.roles:
            self.roles.remove(role)


    #Admin Controls
    #create a new user
    @staticmethod
    def create_user(admin_user, username, password):
        if not admin_user.has_role('admin'):
            return PermissionError("only admminstrators can create new users")
        new_user = User(username=username)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        return new_user
    
    #delete a user
    def delete_user(admin_user, user_id):
        if not admin_user.has_role('admin'):
            return PermissionError("only admminstrators can delete users")
        user_to_delete = User.query.get(user_id)
        if user_to_delete:
            db.session.delete(user_to_delete)
            db.session.commit()
            return True
        return False
    




class Role(db.Models):

    #table name
    __tablename__ = 'roles'


    #columns
    id = db.Column(db.Interger, primary_key = True)
    name = db.Column(db.String(50), unique = True, nullable = False)
    def __repr__(self):
        return f'Role{self.name}'
    

class Wine(db.Models):

    #table name
    __tablename__ = 'wines'


    #Columns
    id = db.Column(db.Interger, primary_key = True)
    name = db.Column(db.String(50), unique = True, nullable = False)
    vintage = db.Column(db.Integer)
    varietal = db.Column(db.String(100))
    region = db.Column(db.String(100))
    country = db.Column(db.String(100))
    price = db.Column(db.Numeric(10, 2))
    stock_quantity = db.Column(db.Interger, default = 0)
    bottle_size = db.Column(db.String(10), nullable = False)
    description = db.Column(db.Text)

    #Tags - an array to store all the tags
    tags = db.Column(ARRAY(db.String), default =[])

    #relationships

    invoice_items = db.relationship()


class Invoice(db.Models):

    #table name
    __tablename__ = 'invoices'


    #columns
    id = db.column(db.Interger, primary_key = True)
    invoice_number = db.Column(UUID(as_uuid=True), default = uuid.uuid4, unique = True)
    user_id = db.Column(db.Interger, db.ForeignKey('users.id'), nullable = False)
    total_amount = db.Column(db.Numeric(10,2), nullable = False)
    created_at = db.Column(db.Datetime, default = datetime.timezone.utc)
    status = db.Column(db.String(20), default = 'completed')
    notes = db.Column(db.Text)


    #these indexes should be able to allow for faster lookups
    __table_args__ = (
        db.Index('idx_invoice_created_at', created_at),
        db.Index('idx_invoice_user', user_id)
    )

    #relationships
    items = db.relationship('InvoiceItem', backref = 'invoice', lazy = 'dynamic')


class InvoiceItem(db.Models):

    #table name
    __tablename__ = 'invoice_items'

    #columns
    id = db.Column(db.Integer, primary_key = True)
    invoice_id = db.Column(db.Interger, db.ForeignKey('invoices.id', ondelete='CASCADE'), nullable = False) #added the cascade property to prevent orphans
    wine_id = db.Column(db.Interger, db.ForeingKey('wines.id'), nullable=False)
    quantity = db.Column(db.Interger, nullable = False)
    price = db.Column(db.Numeric(10,2), nullable = False)


    #indexes
    __table_args__ = (
        db.Index('idx_invoice_item_invoice', invoice_id),
        db.Index('idx_invoice_item_wine', wine_id)
    )

class Cart(db.Models):
    #table name
    __tablename__ = 'cart_items'

    #columns
    id = db.Column(db.Interger, primary_key = True)
    user_id = db.Column(db.Interger, db.ForeignKey('users.id'), nullable = False)
    wine_id = db.Column(db.Interger, db.ForeignKey('wines.id'), nullable = False)
    quantity = db.Column(db.Interger, nullable = False, default = 1)
    added_at = db.Column(db.DateTime, default = datetime.timezone.utc)


    #unique constraint for duplicate cart entries

    __table_args__ = (
        db.UniqueConstraint('user_id', 'wine_id', name = 'uq_user_wine'),
        db.Index('idx_cart_user', user_id)
    )


