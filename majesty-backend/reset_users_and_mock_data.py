"""
Script to reset users and create mock data for testing.
Run from majesty-backend directory: python reset_users_and_mock_data.py
"""
import os
import sys
import random
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models.models import db, User, Role, Category, Product, Cart, Invoice, InvoiceItem, logEntry

app = create_app()

def reset_users_and_create_mock_data():
    with app.app_context():
        print("=" * 50)
        print("Starting user reset and mock data creation...")
        print("=" * 50)

        # Get newadmin user (keep this one)
        newadmin = User.query.filter_by(username='newadmin').first()
        if not newadmin:
            print("ERROR: newadmin user not found!")
            return

        newadmin_id = newadmin.id
        print(f"Keeping newadmin (ID: {newadmin_id})")

        # Delete related data for users to be removed
        users_to_delete = User.query.filter(User.id != newadmin_id).all()
        user_ids_to_delete = [u.id for u in users_to_delete]

        print(f"\nUsers to delete: {[u.username for u in users_to_delete]}")

        # Delete in order to respect foreign keys
        print("\nDeleting related data...")

        # Delete invoice items for invoices belonging to these users
        invoices_to_delete = Invoice.query.filter(Invoice.user_id.in_(user_ids_to_delete)).all()
        invoice_ids = [inv.id for inv in invoices_to_delete]
        if invoice_ids:
            InvoiceItem.query.filter(InvoiceItem.invoice_id.in_(invoice_ids)).delete(synchronize_session=False)
            print(f"  - Deleted invoice items for {len(invoice_ids)} invoices")

        # Delete invoices
        Invoice.query.filter(Invoice.user_id.in_(user_ids_to_delete)).delete(synchronize_session=False)
        print(f"  - Deleted invoices")

        # Delete cart items
        Cart.query.filter(Cart.user_id.in_(user_ids_to_delete)).delete(synchronize_session=False)
        print(f"  - Deleted cart items")

        # Delete log entries
        logEntry.query.filter(logEntry.user_id.in_(user_ids_to_delete)).delete(synchronize_session=False)
        print(f"  - Deleted log entries")

        # Now delete the users
        for user in users_to_delete:
            user.roles.clear()  # Clear role associations
            db.session.delete(user)

        db.session.commit()
        print(f"  - Deleted {len(users_to_delete)} users")

        # Ensure roles exist
        print("\nEnsuring roles exist...")
        roles = ['admin', 'staff', 'super_user']
        for role_name in roles:
            if not Role.query.filter_by(name=role_name).first():
                db.session.add(Role(name=role_name))
                print(f"  - Created role: {role_name}")
        db.session.commit()

        # Create new users
        print("\nCreating new users...")
        users_data = [
            {'username': 'admin', 'password': 'adminpassword', 'is_admin': True, 'role': 'admin'},
            {'username': 'sales', 'password': 'salespassword', 'is_admin': False, 'role': 'staff'},
            {'username': 'manager', 'password': 'managerpassword', 'is_admin': False, 'role': 'super_user'},
        ]

        created_users = []
        for user_data in users_data:
            user = User(username=user_data['username'], is_admin=user_data['is_admin'])
            user.set_password(user_data['password'])
            role = Role.query.filter_by(name=user_data['role']).first()
            if role:
                user.roles.append(role)
            db.session.add(user)
            db.session.flush()  # Get the ID
            created_users.append(user)
            print(f"  - Created user: {user.username} (role: {user_data['role']}, ID: {user.id})")

        db.session.commit()

        # Clear existing products and categories for fresh mock data
        print("\nClearing existing products and categories...")
        InvoiceItem.query.delete()
        Invoice.query.delete()
        Cart.query.delete()
        Product.query.delete()
        Category.query.delete()
        db.session.commit()
        print("  - Cleared existing data")

        # Create categories
        print("\nCreating categories...")
        categories_data = [
            {'name': 'Red Wine', 'description': 'Full-bodied red wines'},
            {'name': 'White Wine', 'description': 'Crisp and refreshing white wines'},
            {'name': 'Rosé', 'description': 'Light and fruity rosé wines'},
            {'name': 'Sparkling', 'description': 'Champagne and sparkling wines'},
            {'name': 'Dessert Wine', 'description': 'Sweet dessert wines'},
        ]

        categories = []
        for cat_data in categories_data:
            cat = Category(name=cat_data['name'], description=cat_data['description'], created_by=newadmin_id)
            db.session.add(cat)
            db.session.flush()
            categories.append(cat)
            print(f"  - Created category: {cat.name}")

        db.session.commit()

        # Create products
        print("\nCreating products...")
        products_data = [
            # Red Wines
            {'name': 'Cabernet Sauvignon Reserve', 'abv': 14.5, 'price': 45.00, 'category': 'Red Wine', 'bottle_size': '750ml', 'in_stock': 50},
            {'name': 'Merlot Classic', 'abv': 13.5, 'price': 28.00, 'category': 'Red Wine', 'bottle_size': '750ml', 'in_stock': 75},
            {'name': 'Pinot Noir Estate', 'abv': 13.0, 'price': 55.00, 'category': 'Red Wine', 'bottle_size': '750ml', 'in_stock': 30},
            {'name': 'Shiraz Bold', 'abv': 15.0, 'price': 35.00, 'category': 'Red Wine', 'bottle_size': '750ml', 'in_stock': 60},
            {'name': 'Malbec Argentina', 'abv': 14.0, 'price': 32.00, 'category': 'Red Wine', 'bottle_size': '750ml', 'in_stock': 45},
            # White Wines
            {'name': 'Chardonnay Oak Aged', 'abv': 13.5, 'price': 38.00, 'category': 'White Wine', 'bottle_size': '750ml', 'in_stock': 55},
            {'name': 'Sauvignon Blanc Fresh', 'abv': 12.5, 'price': 25.00, 'category': 'White Wine', 'bottle_size': '750ml', 'in_stock': 80},
            {'name': 'Riesling Sweet', 'abv': 11.0, 'price': 22.00, 'category': 'White Wine', 'bottle_size': '750ml', 'in_stock': 65},
            {'name': 'Pinot Grigio Italian', 'abv': 12.0, 'price': 27.00, 'category': 'White Wine', 'bottle_size': '750ml', 'in_stock': 70},
            # Rosé
            {'name': 'Provence Rosé', 'abv': 12.5, 'price': 30.00, 'category': 'Rosé', 'bottle_size': '750ml', 'in_stock': 40},
            {'name': 'White Zinfandel Blush', 'abv': 10.5, 'price': 18.00, 'category': 'Rosé', 'bottle_size': '750ml', 'in_stock': 55},
            # Sparkling
            {'name': 'Champagne Brut', 'abv': 12.0, 'price': 75.00, 'category': 'Sparkling', 'bottle_size': '750ml', 'in_stock': 25},
            {'name': 'Prosecco Italian', 'abv': 11.0, 'price': 22.00, 'category': 'Sparkling', 'bottle_size': '750ml', 'in_stock': 60},
            {'name': 'Cava Spanish', 'abv': 11.5, 'price': 20.00, 'category': 'Sparkling', 'bottle_size': '750ml', 'in_stock': 45},
            # Dessert Wine
            {'name': 'Port Ruby', 'abv': 19.5, 'price': 40.00, 'category': 'Dessert Wine', 'bottle_size': '750ml', 'in_stock': 20},
            {'name': 'Moscato Sweet', 'abv': 7.0, 'price': 18.00, 'category': 'Dessert Wine', 'bottle_size': '750ml', 'in_stock': 35},
            {'name': 'Ice Wine Canadian', 'abv': 10.0, 'price': 65.00, 'category': 'Dessert Wine', 'bottle_size': '375ml', 'in_stock': 15},
        ]

        products = []
        for prod_data in products_data:
            cat = next(c for c in categories if c.name == prod_data['category'])
            product = Product(
                name=prod_data['name'],
                abv=prod_data['abv'],
                price=prod_data['price'],
                category_id=cat.id,
                bottle_size=prod_data['bottle_size'],
                in_stock=prod_data['in_stock'],
                added_by=newadmin_id
            )
            db.session.add(product)
            db.session.flush()
            products.append(product)
            print(f"  - Created product: {product.name} (${product.price})")

        db.session.commit()

        # Create mock invoices/sales for each user
        print("\nCreating mock sales data...")
        all_users = [newadmin] + created_users

        # Generate invoices over the past 60 days
        base_date = datetime.now()
        invoice_count = 0

        for user in all_users:
            # Each user gets 5-15 invoices
            num_invoices = random.randint(5, 15)

            for _ in range(num_invoices):
                # Random date in the past 60 days
                days_ago = random.randint(0, 60)
                invoice_date = base_date - timedelta(days=days_ago)

                # Create invoice
                invoice = Invoice(
                    user_id=user.id,
                    total_amount=0,
                    created_at=invoice_date,
                    status='completed',
                    notes=f'Sale by {user.username}'
                )
                db.session.add(invoice)
                db.session.flush()

                # Add 1-5 items to each invoice
                num_items = random.randint(1, 5)
                selected_products = random.sample(products, min(num_items, len(products)))
                total = 0

                for product in selected_products:
                    quantity = random.randint(1, 4)
                    item_price = product.price

                    invoice_item = InvoiceItem(
                        invoice_id=invoice.id,
                        product_id=product.id,
                        quantity=quantity,
                        price=item_price
                    )
                    db.session.add(invoice_item)
                    total += item_price * quantity

                invoice.total_amount = total
                invoice_count += 1

            print(f"  - Created {num_invoices} invoices for {user.username}")

        db.session.commit()

        # Summary
        print("\n" + "=" * 50)
        print("SUMMARY")
        print("=" * 50)
        print(f"\nUsers created:")
        for user_data in users_data:
            print(f"  - {user_data['username']} / {user_data['password']} ({user_data['role']})")
        print(f"\nExisting admin:")
        print(f"  - newadmin / adminpassword (admin)")
        print(f"\nData created:")
        print(f"  - {len(categories)} categories")
        print(f"  - {len(products)} products")
        print(f"  - {invoice_count} invoices across all users")
        print("\n" + "=" * 50)
        print("Done!")
        print("=" * 50)

if __name__ == '__main__':
    reset_users_and_create_mock_data()
