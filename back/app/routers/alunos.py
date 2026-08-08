from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import AlunoCreate, AlunoResponse

router = APIRouter(prefix="/alunos", tags=["Alunos"])


@router.post("", response_model=AlunoResponse, status_code=201)
def cadastrar_aluno(dados: AlunoCreate, db: Session = Depends(get_db)):
    return crud.criar_aluno(db, dados)


@router.get("", response_model=list[AlunoResponse])
def listar_alunos(db: Session = Depends(get_db)):
    return crud.listar_alunos(db)
