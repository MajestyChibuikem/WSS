#!/usr/bin/env python3
"""
Script to update product prices and add more wine products.
"""
import sqlite3
import os
from datetime import datetime

# Determine the database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'dev.db')

if not os.path.exists(db_path):
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'app.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

print(f"Using database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get categories
cursor.execute("SELECT id, name FROM categories")
categories = {row[1]: row[0] for row in cursor.fetchall()}
print(f"Found categories: {categories}")

# Get admin user id for added_by
cursor.execute("SELECT id FROM users WHERE is_admin = 1 LIMIT 1")
admin_row = cursor.fetchone()
admin_id = admin_row[0] if admin_row else 1

# Wine products with realistic Nigerian prices (in Naira)
# Using actual category names from DB: 'Red Wine', 'White Wine', 'Rosé', 'Sparkling', 'Dessert Wine'
wines = [
    # Red Wines
    {"name": "Château Margaux 2015", "abv": 13.5, "price": 1250000, "category": "Red Wine", "bottle_size": 750, "in_stock": 8},
    {"name": "Opus One 2019", "abv": 14.5, "price": 850000, "category": "Red Wine", "bottle_size": 750, "in_stock": 12},
    {"name": "Penfolds Grange 2018", "abv": 14.0, "price": 780000, "category": "Red Wine", "bottle_size": 750, "in_stock": 6},
    {"name": "Sassicaia 2020", "abv": 14.0, "price": 650000, "category": "Red Wine", "bottle_size": 750, "in_stock": 15},
    {"name": "Caymus Cabernet Sauvignon", "abv": 14.8, "price": 185000, "category": "Red Wine", "bottle_size": 750, "in_stock": 25},
    {"name": "Robert Mondavi Reserve", "abv": 14.5, "price": 145000, "category": "Red Wine", "bottle_size": 750, "in_stock": 30},
    {"name": "19 Crimes Red Blend", "abv": 13.5, "price": 45000, "category": "Red Wine", "bottle_size": 750, "in_stock": 50},
    {"name": "Apothic Red", "abv": 13.5, "price": 38000, "category": "Red Wine", "bottle_size": 750, "in_stock": 45},
    {"name": "Josh Cellars Cabernet", "abv": 13.5, "price": 52000, "category": "Red Wine", "bottle_size": 750, "in_stock": 35},
    {"name": "Meiomi Pinot Noir", "abv": 13.7, "price": 68000, "category": "Red Wine", "bottle_size": 750, "in_stock": 28},

    # White Wines
    {"name": "Cloudy Bay Sauvignon Blanc", "abv": 13.0, "price": 95000, "category": "White Wine", "bottle_size": 750, "in_stock": 40},
    {"name": "Cakebread Chardonnay", "abv": 14.1, "price": 125000, "category": "White Wine", "bottle_size": 750, "in_stock": 22},
    {"name": "Kim Crawford Sauvignon Blanc", "abv": 13.0, "price": 48000, "category": "White Wine", "bottle_size": 750, "in_stock": 55},
    {"name": "Kendall-Jackson Chardonnay", "abv": 13.5, "price": 42000, "category": "White Wine", "bottle_size": 750, "in_stock": 60},
    {"name": "La Crema Sonoma Chardonnay", "abv": 13.5, "price": 78000, "category": "White Wine", "bottle_size": 750, "in_stock": 32},
    {"name": "Rombauer Chardonnay", "abv": 14.5, "price": 145000, "category": "White Wine", "bottle_size": 750, "in_stock": 18},
    {"name": "Oyster Bay Sauvignon Blanc", "abv": 12.5, "price": 35000, "category": "White Wine", "bottle_size": 750, "in_stock": 48},
    {"name": "Santa Margherita Pinot Grigio", "abv": 12.0, "price": 65000, "category": "White Wine", "bottle_size": 750, "in_stock": 38},

    # Sparkling
    {"name": "Dom Pérignon 2012", "abv": 12.5, "price": 950000, "category": "Sparkling", "bottle_size": 750, "in_stock": 10},
    {"name": "Moët & Chandon Brut Imperial", "abv": 12.0, "price": 185000, "category": "Sparkling", "bottle_size": 750, "in_stock": 25},
    {"name": "Veuve Clicquot Yellow Label", "abv": 12.0, "price": 195000, "category": "Sparkling", "bottle_size": 750, "in_stock": 20},
    {"name": "Perrier-Jouët Grand Brut", "abv": 12.0, "price": 165000, "category": "Sparkling", "bottle_size": 750, "in_stock": 18},
    {"name": "Prosecco Superiore DOCG", "abv": 11.5, "price": 55000, "category": "Sparkling", "bottle_size": 750, "in_stock": 45},
    {"name": "Chandon Brut Classic", "abv": 12.5, "price": 85000, "category": "Sparkling", "bottle_size": 750, "in_stock": 30},
    {"name": "Mumm Cordon Rouge", "abv": 12.0, "price": 145000, "category": "Sparkling", "bottle_size": 750, "in_stock": 22},

    # Rosé
    {"name": "Whispering Angel Rosé", "abv": 13.0, "price": 85000, "category": "Rosé", "bottle_size": 750, "in_stock": 35},
    {"name": "Miraval Provence Rosé", "abv": 13.0, "price": 95000, "category": "Rosé", "bottle_size": 750, "in_stock": 28},
    {"name": "AIX Rosé Magnum", "abv": 13.0, "price": 125000, "category": "Rosé", "bottle_size": 1500, "in_stock": 15},
    {"name": "Château d'Esclans Rock Angel", "abv": 13.0, "price": 115000, "category": "Rosé", "bottle_size": 750, "in_stock": 20},
    {"name": "Josh Rosé", "abv": 12.5, "price": 42000, "category": "Rosé", "bottle_size": 750, "in_stock": 40},

    # Dessert Wine
    {"name": "Château d'Yquem 2018", "abv": 13.5, "price": 1100000, "category": "Dessert Wine", "bottle_size": 375, "in_stock": 5},
    {"name": "Tokaji Aszú 6 Puttonyos", "abv": 11.5, "price": 185000, "category": "Dessert Wine", "bottle_size": 500, "in_stock": 12},
    {"name": "Inniskillin Ice Wine", "abv": 9.5, "price": 225000, "category": "Dessert Wine", "bottle_size": 375, "in_stock": 8},
    {"name": "Royal Tokaji 5 Puttonyos", "abv": 11.0, "price": 145000, "category": "Dessert Wine", "bottle_size": 500, "in_stock": 15},
    {"name": "Moscato d'Asti", "abv": 5.5, "price": 35000, "category": "Dessert Wine", "bottle_size": 750, "in_stock": 30},
]

# First, delete existing products
cursor.execute("DELETE FROM products")
print("Cleared existing products")

# Insert new products
now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
inserted = 0

for wine in wines:
    category_id = categories.get(wine["category"])
    if not category_id:
        print(f"Warning: Category '{wine['category']}' not found, skipping {wine['name']}")
        continue

    try:
        cursor.execute("""
            INSERT INTO products (name, abv, price, category_id, bottle_size, in_stock, added_by, added_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (wine["name"], wine["abv"], wine["price"], category_id, wine["bottle_size"], wine["in_stock"], admin_id, now))
        inserted += 1
    except Exception as e:
        print(f"Error inserting {wine['name']}: {e}")

conn.commit()
print(f"Successfully inserted {inserted} products")

# Show some stats
cursor.execute("SELECT COUNT(*) FROM products")
total = cursor.fetchone()[0]
print(f"Total products in database: {total}")

cursor.execute("SELECT c.name, COUNT(p.id), AVG(p.price) FROM products p JOIN categories c ON p.category_id = c.id GROUP BY c.name")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} products, avg price: ₦{row[2]:,.0f}")

conn.close()
