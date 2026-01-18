"""Add image_url column to products table

Revision ID: add_image_url
Revises:
Create Date: 2026-01-18

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_image_url'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add image_url column to products table
    op.add_column('products', sa.Column('image_url', sa.String(500), nullable=True))


def downgrade():
    # Remove image_url column from products table
    op.drop_column('products', 'image_url')
