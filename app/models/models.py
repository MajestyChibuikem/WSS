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
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    

    #add role
    def add_role(self, role_name):
        role = Role.query.Filter_by(name=role_name).first()

class Wine(db.Model):
    
    #table name
    __tablename__ = 'wines'

    
    #columns
    id = db.Column(db.Interger, primary_key = True)

class Role(db.Models):
    __tablename__ = 'roles'

    id = db.Column(db.Interger, primary_key = True)
    name = db.Column(db.String(50), unique = True, nullable = False)
    def __repr__(self):
        return f'Role{self.name}'