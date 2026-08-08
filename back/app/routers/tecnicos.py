from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import TecnicoCreate, TecnicoResponse

router = APIRouter(prefix="/tecnicos", tags=["Técnicos"])


@router.post("", response_model=TecnicoResponse, status_code=201)
def cadastrar_tecnico(dados: TecnicoCreate, db: Session = Depends(get_db)):
    return crud.criar_tecnico(db, dados)


@router.get("", response_model=list[TecnicoResponse])
def listar_tecnicos(db: Session = Depends(get_db)):
    return crud.listar_tecnicos(db)
