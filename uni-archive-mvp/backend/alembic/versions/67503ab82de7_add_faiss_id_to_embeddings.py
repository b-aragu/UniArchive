"""add faiss_id to embeddings

Revision ID: 67503ab82de7
Revises: f1010bb4b221
Create Date: 2026-06-03 12:03:33.878378

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67503ab82de7'
down_revision: Union[str, None] = 'f1010bb4b221'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Use Identity to auto-increment. In PostgreSQL, we can use GENERATED ALWAYS AS IDENTITY
    op.add_column('embeddings', sa.Column('faiss_id', sa.Integer(), sa.Identity(always=True), nullable=False))
    op.create_index(op.f('ix_embeddings_faiss_id'), 'embeddings', ['faiss_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_embeddings_faiss_id'), table_name='embeddings')
    op.drop_column('embeddings', 'faiss_id')
