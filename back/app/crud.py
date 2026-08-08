from datetime import date, datetime, timezone

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models import Aluno, Emprestimo, Equipamento, Tecnico
from app.schemas import (
    AlunoCreate,
    EmprestimoCreate,
    EmprestimoDevolucao,
    EquipamentoCreate,
    TecnicoCreate,
)

STATUS_DISPONIVEL = "disponivel"
STATUS_EMPRESTADO = "emprestado"


def _hoje() -> date:
    return date.today()


def _calcular_dias_atraso(data_prevista: date) -> int:
    dias = (_hoje() - data_prevista).days
    return max(dias, 0)


def _aluno_tem_pendencia(db: Session, aluno_id: int) -> bool:
    hoje = _hoje()
    stmt = select(Emprestimo).where(
        Emprestimo.aluno_id == aluno_id,
        Emprestimo.data_devolucao.is_(None),
        Emprestimo.data_prevista_devolucao < hoje,
    )
    return db.scalars(stmt).first() is not None


def _equipamento_tem_emprestimo_aberto(db: Session, equipamento_id: int) -> bool:
    stmt = select(Emprestimo).where(
        Emprestimo.equipamento_id == equipamento_id,
        Emprestimo.data_devolucao.is_(None),
    )
    return db.scalars(stmt).first() is not None


# --- Aluno ---


def criar_aluno(db: Session, dados: AlunoCreate) -> Aluno:
    existente = db.scalars(
        select(Aluno).where(Aluno.matricula == dados.matricula)
    ).first()
    if existente:
        raise HTTPException(
            status_code=409,
            detail=f"Já existe um aluno com a matrícula '{dados.matricula}'.",
        )

    aluno = Aluno(**dados.model_dump())
    db.add(aluno)
    db.commit()
    db.refresh(aluno)
    return aluno


def listar_alunos(db: Session) -> list[Aluno]:
    return list(db.scalars(select(Aluno).order_by(Aluno.nome)).all())


# --- Técnico ---


def criar_tecnico(db: Session, dados: TecnicoCreate) -> Tecnico:
    existente = db.scalars(
        select(Tecnico).where(Tecnico.login == dados.login)
    ).first()
    if existente:
        raise HTTPException(
            status_code=409,
            detail=f"Já existe um técnico com o login '{dados.login}'.",
        )

    tecnico = Tecnico(**dados.model_dump())
    db.add(tecnico)
    db.commit()
    db.refresh(tecnico)
    return tecnico


def listar_tecnicos(db: Session) -> list[Tecnico]:
    return list(db.scalars(select(Tecnico).order_by(Tecnico.nome)).all())


# --- Equipamento ---


def criar_equipamento(db: Session, dados: EquipamentoCreate) -> Equipamento:
    existente = db.scalars(
        select(Equipamento).where(Equipamento.patrimonio == dados.patrimonio)
    ).first()
    if existente:
        raise HTTPException(
            status_code=409,
            detail=f"Já existe um equipamento com o patrimônio '{dados.patrimonio}'.",
        )

    equipamento = Equipamento(**dados.model_dump())
    db.add(equipamento)
    db.commit()
    db.refresh(equipamento)
    return equipamento


def listar_equipamentos(db: Session) -> list[Equipamento]:
    return list(db.scalars(select(Equipamento).order_by(Equipamento.nome)).all())


# --- Empréstimo ---


def registrar_emprestimo(db: Session, dados: EmprestimoCreate) -> Emprestimo:
    aluno = db.get(Aluno, dados.aluno_id)
    if not aluno:
        raise HTTPException(status_code=404, detail="Aluno não encontrado.")
    if not aluno.ativo:
        raise HTTPException(
            status_code=403,
            detail="Aluno inativo não pode retirar equipamentos.",
        )

    if _aluno_tem_pendencia(db, dados.aluno_id):
        raise HTTPException(
            status_code=403,
            detail=(
                "Aluno possui empréstimo em atraso. "
                "Regularize a pendência antes de retirar outro equipamento."
            ),
        )

    equipamento = db.get(Equipamento, dados.equipamento_id)
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    if equipamento.status != STATUS_DISPONIVEL:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Equipamento indisponível para empréstimo "
                f"(status atual: '{equipamento.status}')."
            ),
        )

    if _equipamento_tem_emprestimo_aberto(db, dados.equipamento_id):
        raise HTTPException(
            status_code=409,
            detail="Este equipamento já possui um empréstimo em aberto.",
        )

    tecnico = db.get(Tecnico, dados.tecnico_id)
    if not tecnico:
        raise HTTPException(status_code=404, detail="Técnico não encontrado.")
    if not tecnico.ativo:
        raise HTTPException(
            status_code=403,
            detail="Técnico inativo não pode registrar empréstimos.",
        )

    emprestimo = Emprestimo(**dados.model_dump())
    equipamento.status = STATUS_EMPRESTADO

    db.add(emprestimo)
    db.commit()
    db.refresh(emprestimo)
    return emprestimo


def registrar_devolucao(
    db: Session, emprestimo_id: int, dados: EmprestimoDevolucao
) -> Emprestimo:
    emprestimo = db.get(Emprestimo, emprestimo_id)
    if not emprestimo:
        raise HTTPException(status_code=404, detail="Empréstimo não encontrado.")

    if emprestimo.data_devolucao is not None:
        raise HTTPException(
            status_code=409,
            detail="Este empréstimo já foi devolvido.",
        )

    tecnico = db.get(Tecnico, dados.tecnico_devolucao_id)
    if not tecnico:
        raise HTTPException(
            status_code=404, detail="Técnico de devolução não encontrado."
        )
    if not tecnico.ativo:
        raise HTTPException(
            status_code=403,
            detail="Técnico inativo não pode registrar devoluções.",
        )

    equipamento = db.get(Equipamento, emprestimo.equipamento_id)
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    emprestimo.data_devolucao = datetime.now(timezone.utc)
    emprestimo.tecnico_devolucao_id = dados.tecnico_devolucao_id
    if dados.observacao is not None:
        emprestimo.observacao = dados.observacao

    equipamento.status = STATUS_DISPONIVEL

    db.commit()
    db.refresh(emprestimo)
    return emprestimo


def listar_emprestimos_ativos(db: Session) -> list[dict]:
    hoje = _hoje()
    stmt = (
        select(Emprestimo)
        .options(joinedload(Emprestimo.aluno), joinedload(Emprestimo.equipamento))
        .where(Emprestimo.data_devolucao.is_(None))
        .order_by(Emprestimo.data_prevista_devolucao)
    )
    emprestimos = db.scalars(stmt).unique().all()

    resultado = []
    for emp in emprestimos:
        atrasado = emp.data_prevista_devolucao < hoje
        dias_atraso = _calcular_dias_atraso(emp.data_prevista_devolucao) if atrasado else 0
        resultado.append(
            {
                "id": emp.id,
                "aluno_nome": emp.aluno.nome,
                "equipamento_nome": emp.equipamento.nome,
                "patrimonio": emp.equipamento.patrimonio,
                "data_emprestimo": emp.data_emprestimo,
                "data_prevista_devolucao": emp.data_prevista_devolucao,
                "atrasado": atrasado,
                "dias_atraso": dias_atraso,
            }
        )
    return resultado


def listar_atrasos(db: Session) -> list[dict]:
    hoje = _hoje()
    stmt = (
        select(Emprestimo)
        .options(joinedload(Emprestimo.aluno), joinedload(Emprestimo.equipamento))
        .where(
            Emprestimo.data_devolucao.is_(None),
            Emprestimo.data_prevista_devolucao < hoje,
        )
    )
    emprestimos = db.scalars(stmt).unique().all()

    resultado = []
    for emp in emprestimos:
        dias_atraso = _calcular_dias_atraso(emp.data_prevista_devolucao)
        resultado.append(
            {
                "id": emp.id,
                "aluno_nome": emp.aluno.nome,
                "aluno_matricula": emp.aluno.matricula,
                "equipamento_nome": emp.equipamento.nome,
                "patrimonio": emp.equipamento.patrimonio,
                "data_emprestimo": emp.data_emprestimo,
                "data_prevista_devolucao": emp.data_prevista_devolucao,
                "dias_atraso": dias_atraso,
            }
        )

    resultado.sort(key=lambda x: x["dias_atraso"], reverse=True)
    return resultado
