from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import EquipamentoCreate, EquipamentoResponse

router = APIRouter(prefix="/equipamentos", tags=["Equipamentos"])


@router.post("", response_model=EquipamentoResponse, status_code=201)
def cadastrar_equipamento(dados: EquipamentoCreate, db: Session = Depends(get_db)):
    return crud.criar_equipamento(db, dados)


@router.get("", response_model=list[EquipamentoResponse])
def listar_equipamentos(db: Session = Depends(get_db)):
    return crud.listar_equipamentos(db)
