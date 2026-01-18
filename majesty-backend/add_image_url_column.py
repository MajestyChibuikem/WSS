#!/usr/bin/env python3
"""
Script to add image_url column to products table.
Run this once to update the database schema.
"""
import sqlite3
import os

# Determine the database path
db_path = os.path.join(os.path.dirname(__file__), 'instance', 'dev.db')

if not os.path.exists(db_path):
    # Try alternative paths
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'app.db')

if not os.path.exists(db_path):
    db_path = os.path.join(os.path.dirname(__file__), 'app.db')

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    print("Please ensure the database exists before running this script.")
    exit(1)

print(f"Using database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check if column already exists
cursor.execute("PRAGMA table_info(products)")
columns = [col[1] for col in cursor.fetchall()]

if 'image_url' in columns:
    print("Column 'image_url' already exists in products table.")
else:
    try:
        cursor.execute("ALTER TABLE products ADD COLUMN image_url VARCHAR(500)")
        conn.commit()
        print("Successfully added 'image_url' column to products table.")
    except Exception as e:
        print(f"Error adding column: {e}")

conn.close()
