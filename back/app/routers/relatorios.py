from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.schemas import EmprestimoAtrasoResponse

router = APIRouter(prefix="/relatorios", tags=["Relatórios"])


@router.get("/atrasos", response_model=list[EmprestimoAtrasoResponse])
def listar_atrasos(db: Session = Depends(get_db)):
    return crud.listar_atrasos(db)
