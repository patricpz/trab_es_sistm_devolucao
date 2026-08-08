from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Aluno(Base):
    __tablename__ = "aluno"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    matricula: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String, nullable=True)
    telefone: Mapped[str | None] = mapped_column(String, nullable=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    emprestimos: Mapped[list["Emprestimo"]] = relationship(back_populates="aluno")


class Tecnico(Base):
    __tablename__ = "tecnico"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    login: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")

    emprestimos_liberados: Mapped[list["Emprestimo"]] = relationship(
        back_populates="tecnico",
        foreign_keys="Emprestimo.tecnico_id",
    )
    emprestimos_devolvidos: Mapped[list["Emprestimo"]] = relationship(
        back_populates="tecnico_devolucao",
        foreign_keys="Emprestimo.tecnico_devolucao_id",
    )


class Equipamento(Base):
    __tablename__ = "equipamento"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String, nullable=False)
    patrimonio: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    categoria: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(
        String, default="disponivel", server_default="disponivel"
    )
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    emprestimos: Mapped[list["Emprestimo"]] = relationship(back_populates="equipamento")


class Emprestimo(Base):
    __tablename__ = "emprestimo"

    id: Mapped[int] = mapped_column(primary_key=True)
    aluno_id: Mapped[int] = mapped_column(ForeignKey("aluno.id"), nullable=False)
    equipamento_id: Mapped[int] = mapped_column(
        ForeignKey("equipamento.id"), nullable=False
    )
    tecnico_id: Mapped[int] = mapped_column(ForeignKey("tecnico.id"), nullable=False)
    tecnico_devolucao_id: Mapped[int | None] = mapped_column(
        ForeignKey("tecnico.id"), nullable=True
    )
    data_emprestimo: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    data_prevista_devolucao: Mapped[date] = mapped_column(Date, nullable=False)
    data_devolucao: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)

    aluno: Mapped["Aluno"] = relationship(back_populates="emprestimos")
    equipamento: Mapped["Equipamento"] = relationship(back_populates="emprestimos")
    tecnico: Mapped["Tecnico"] = relationship(
        back_populates="emprestimos_liberados",
        foreign_keys=[tecnico_id],
    )
    tecnico_devolucao: Mapped["Tecnico | None"] = relationship(
        back_populates="emprestimos_devolvidos",
        foreign_keys=[tecnico_devolucao_id],
    )
