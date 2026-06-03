"""Add OCR metadata fields

Revision ID: f1010bb4b221
Revises: 2f3024a667d9
Create Date: 2026-06-03 11:24:55.396545

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1010bb4b221'
down_revision: Union[str, None] = '2f3024a667d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('documents', sa.Column('extraction_method', sa.String(length=50), nullable=True))
    op.add_column('documents', sa.Column('page_count', sa.Integer(), nullable=True))
    op.add_column('documents', sa.Column('processing_time_ms', sa.Float(), nullable=True))


def downgrade() -> None:
    op.drop_column('documents', 'processing_time_ms')
    op.drop_column('documents', 'page_count')
    op.drop_column('documents', 'extraction_method')
