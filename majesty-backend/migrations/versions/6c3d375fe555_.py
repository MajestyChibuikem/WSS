"""empty message

Revision ID: 6c3d375fe555
Revises: 6ba23b1ccf69
Create Date: 2025-03-16 11:49:55.866885

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6c3d375fe555'
down_revision = '6ba23b1ccf69'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('log_entries', schema=None) as batch_op:
        batch_op.add_column(sa.Column('acting_username', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('affected_name', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('log_entries', schema=None) as batch_op:
        batch_op.drop_column('affected_name')
        batch_op.drop_column('acting_username')

    # ### end Alembic commands ###
