"""criacao inicial das tabelas

Revision ID: 001
Revises:
Create Date: 2026-08-08

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "aluno",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("matricula", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("telefone", sa.String(), nullable=True),
        sa.Column("ativo", sa.Boolean(), server_default="true", nullable=False),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("matricula"),
    )

    op.create_table(
        "tecnico",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("login", sa.String(), nullable=False),
        sa.Column("ativo", sa.Boolean(), server_default="true", nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("login"),
    )

    op.create_table(
        "equipamento",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("nome", sa.String(), nullable=False),
        sa.Column("patrimonio", sa.String(), nullable=False),
        sa.Column("categoria", sa.String(), nullable=True),
        sa.Column(
            "status", sa.String(), server_default="disponivel", nullable=False
        ),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.Column(
            "criado_em",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("patrimonio"),
    )

    op.create_table(
        "emprestimo",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("aluno_id", sa.Integer(), nullable=False),
        sa.Column("equipamento_id", sa.Integer(), nullable=False),
        sa.Column("tecnico_id", sa.Integer(), nullable=False),
        sa.Column("tecnico_devolucao_id", sa.Integer(), nullable=True),
        sa.Column(
            "data_emprestimo",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("data_prevista_devolucao", sa.Date(), nullable=False),
        sa.Column("data_devolucao", sa.DateTime(timezone=True), nullable=True),
        sa.Column("observacao", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["aluno_id"], ["aluno.id"]),
        sa.ForeignKeyConstraint(["equipamento_id"], ["equipamento.id"]),
        sa.ForeignKeyConstraint(["tecnico_id"], ["tecnico.id"]),
        sa.ForeignKeyConstraint(["tecnico_devolucao_id"], ["tecnico.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_emprestimo_equipamento_aberto",
        "emprestimo",
        ["equipamento_id"],
        unique=True,
        postgresql_where=sa.text("data_devolucao IS NULL"),
    )


def downgrade() -> None:
    op.drop_index("ix_emprestimo_equipamento_aberto", table_name="emprestimo")
    op.drop_table("emprestimo")
    op.drop_table("equipamento")
    op.drop_table("tecnico")
    op.drop_table("aluno")
