from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import alunos, emprestimos, equipamentos, relatorios, tecnicos

app = FastAPI(
    title="Sistema de Empréstimo de Equipamentos",
    description="API para controle de empréstimo de equipamentos de laboratório",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alunos.router)
app.include_router(tecnicos.router)
app.include_router(equipamentos.router)
app.include_router(emprestimos.router)
app.include_router(relatorios.router)


@app.get("/")
def root():
    return {"mensagem": "API do Sistema de Empréstimo de Equipamentos"}
