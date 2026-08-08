from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class AlunoCreate(BaseModel):
    nome: str
    matricula: str
    email: str | None = None
    telefone: str | None = None
    ativo: bool = True


class AlunoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    matricula: str
    email: str | None
    telefone: str | None
    ativo: bool
    criado_em: datetime


class TecnicoCreate(BaseModel):
    nome: str
    login: str
    ativo: bool = True


class TecnicoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    login: str
    ativo: bool


class EquipamentoCreate(BaseModel):
    nome: str
    patrimonio: str
    categoria: str | None = None
    status: str = "disponivel"
    observacao: str | None = None


class EquipamentoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    patrimonio: str
    categoria: str | None
    status: str
    observacao: str | None
    criado_em: datetime


class EmprestimoCreate(BaseModel):
    aluno_id: int
    equipamento_id: int
    tecnico_id: int
    data_prevista_devolucao: date
    observacao: str | None = None


class EmprestimoDevolucao(BaseModel):
    tecnico_devolucao_id: int
    observacao: str | None = None


class EmprestimoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    aluno_id: int
    equipamento_id: int
    tecnico_id: int
    tecnico_devolucao_id: int | None
    data_emprestimo: datetime
    data_prevista_devolucao: date
    data_devolucao: datetime | None
    observacao: str | None


class EmprestimoAtivoResponse(BaseModel):
    id: int
    aluno_nome: str
    equipamento_nome: str
    patrimonio: str
    data_emprestimo: datetime
    data_prevista_devolucao: date
    atrasado: bool
    dias_atraso: int = 0


class EmprestimoAtrasoResponse(BaseModel):
    id: int
    aluno_nome: str
    aluno_matricula: str
    equipamento_nome: str
    patrimonio: str
    data_emprestimo: datetime
    data_prevista_devolucao: date
    dias_atraso: int
