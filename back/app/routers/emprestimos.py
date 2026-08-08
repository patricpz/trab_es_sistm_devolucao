from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import (
    EmprestimoAtivoResponse,
    EmprestimoCreate,
    EmprestimoDevolucao,
    EmprestimoResponse,
)

router = APIRouter(prefix="/emprestimos", tags=["Empréstimos"])


@router.post("", response_model=EmprestimoResponse, status_code=201)
def registrar_emprestimo(dados: EmprestimoCreate, db: Session = Depends(get_db)):
    return crud.registrar_emprestimo(db, dados)


@router.post("/{emprestimo_id}/devolver", response_model=EmprestimoResponse)
def devolver_emprestimo(
    emprestimo_id: int,
    dados: EmprestimoDevolucao,
    db: Session = Depends(get_db),
):
    return crud.registrar_devolucao(db, emprestimo_id, dados)


@router.get("/ativos", response_model=list[EmprestimoAtivoResponse])
def listar_emprestimos_ativos(db: Session = Depends(get_db)):
    return crud.listar_emprestimos_ativos(db)
