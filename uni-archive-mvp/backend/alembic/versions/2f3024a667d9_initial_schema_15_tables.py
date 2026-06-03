"""initial schema — 15 tables

Revision ID: 2f3024a667d9
Revises: (initial)
Create Date: 2026-06-03

Creates the complete UniArchive database schema:
- roles, users (authentication & RBAC)
- universities, faculties, departments, courses (academic hierarchy)
- academic_years, semesters (temporal organization)
- document_types (document classification)
- documents (core entity with FTS tsvector)
- embeddings (SBERT vector storage)
- search_logs, feedback, duplicate_pairs, audit_logs (tracking)
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "2f3024a667d9"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # === INDEPENDENT TABLES (no foreign keys) ===

    op.create_table(
        "roles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_roles_name", "roles", ["name"])

    op.create_table(
        "universities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("code"),
    )
    op.create_index("ix_universities_name", "universities", ["name"])
    op.create_index("ix_universities_code", "universities", ["code"])

    op.create_table(
        "academic_years",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("label", sa.String(20), nullable=False),
        sa.Column("start_year", sa.Integer(), nullable=False),
        sa.Column("end_year", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("label"),
    )
    op.create_index("ix_academic_years_label", "academic_years", ["label"])

    op.create_table(
        "document_types",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_document_types_name", "document_types", ["name"])

    # === LEVEL 1 DEPENDENCIES ===

    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="RESTRICT"),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role_id", "users", ["role_id"])
    op.create_index("ix_users_is_active", "users", ["is_active"])

    op.create_table(
        "faculties",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("university_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["university_id"], ["universities.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_faculties_name", "faculties", ["name"])
    op.create_index("ix_faculties_university_id", "faculties", ["university_id"])

    op.create_table(
        "semesters",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("label", sa.String(50), nullable=False),
        sa.Column("academic_year_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["academic_year_id"], ["academic_years.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_semesters_label", "semesters", ["label"])
    op.create_index("ix_semesters_academic_year_id", "semesters", ["academic_year_id"])

    # === LEVEL 2 DEPENDENCIES ===

    op.create_table(
        "departments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("faculty_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.ForeignKeyConstraint(["faculty_id"], ["faculties.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_departments_name", "departments", ["name"])
    op.create_index("ix_departments_code", "departments", ["code"])
    op.create_index("ix_departments_faculty_id", "departments", ["faculty_id"])

    # === LEVEL 3 DEPENDENCIES ===

    op.create_table(
        "courses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("department_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.ForeignKeyConstraint(["department_id"], ["departments.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_courses_code", "courses", ["code"])
    op.create_index("ix_courses_name", "courses", ["name"])
    op.create_index("ix_courses_department_id", "courses", ["department_id"])

    # === CORE ENTITY ===

    op.create_table(
        "documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("course_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("semester_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("document_type_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("uploaded_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("original_filename", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("file_size", sa.BigInteger(), nullable=True),
        sa.Column("ocr_text", sa.Text(), nullable=True),
        sa.Column("ocr_confidence", sa.Float(), nullable=True),
        sa.Column("phash", sa.String(64), nullable=True),
        sa.Column("status", sa.String(50), nullable=False, server_default=sa.text("'pending'")),
        sa.Column("is_approved", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "search_vector",
            postgresql.TSVECTOR(),
            sa.Computed(
                "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(ocr_text, ''))",
                persisted=True,
            ),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["course_id"], ["courses.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["semester_id"], ["semesters.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["document_type_id"], ["document_types.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["uploaded_by"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_documents_title", "documents", ["title"])
    op.create_index("ix_documents_course_id", "documents", ["course_id"])
    op.create_index("ix_documents_semester_id", "documents", ["semester_id"])
    op.create_index("ix_documents_document_type_id", "documents", ["document_type_id"])
    op.create_index("ix_documents_uploaded_by", "documents", ["uploaded_by"])
    op.create_index("ix_documents_phash", "documents", ["phash"])
    op.create_index("ix_documents_status", "documents", ["status"])
    op.create_index("ix_documents_is_approved", "documents", ["is_approved"])
    # GIN index for Full-Text Search
    op.create_index(
        "ix_documents_search_vector",
        "documents",
        ["search_vector"],
        postgresql_using="gin",
    )

    # === DEPENDENT TABLES ===

    op.create_table(
        "embeddings",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("chunk_text", sa.Text(), nullable=True),
        sa.Column("vector", sa.LargeBinary(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_embeddings_document_id", "embeddings", ["document_id"])

    op.create_table(
        "feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["document_id"], ["documents.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_feedback_user_id", "feedback", ["user_id"])
    op.create_index("ix_feedback_document_id", "feedback", ["document_id"])

    op.create_table(
        "duplicate_pairs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_a_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_b_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("similarity_score", sa.Float(), nullable=False),
        sa.Column("detection_method", sa.String(50), nullable=False, server_default=sa.text("'phash'")),
        sa.Column("detected_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["document_a_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["document_b_id"], ["documents.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_duplicate_pairs_document_a_id", "duplicate_pairs", ["document_a_id"])
    op.create_index("ix_duplicate_pairs_document_b_id", "duplicate_pairs", ["document_b_id"])

    op.create_table(
        "search_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("query_text", sa.Text(), nullable=False),
        sa.Column("search_type", sa.String(20), nullable=False),
        sa.Column("result_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("response_time_ms", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_search_logs_user_id", "search_logs", ["user_id"])
    op.create_index("ix_search_logs_search_type", "search_logs", ["search_type"])

    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("details", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("ix_audit_logs_action", "audit_logs", ["action"])
    op.create_index("ix_audit_logs_entity_type", "audit_logs", ["entity_type"])


def downgrade() -> None:
    # Drop in reverse dependency order
    op.drop_table("audit_logs")
    op.drop_table("search_logs")
    op.drop_table("duplicate_pairs")
    op.drop_table("feedback")
    op.drop_table("embeddings")
    op.drop_table("documents")
    op.drop_table("courses")
    op.drop_table("departments")
    op.drop_table("semesters")
    op.drop_table("faculties")
    op.drop_table("users")
    op.drop_table("document_types")
    op.drop_table("academic_years")
    op.drop_table("universities")
    op.drop_table("roles")
