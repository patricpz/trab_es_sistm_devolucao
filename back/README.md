# Backend — Sistema de Empréstimo de Equipamentos

API REST em **Python + FastAPI** com banco **PostgreSQL** no [Neon](https://neon.tech), para controle de empréstimo de equipamentos de laboratório.

## Decisões de arquitetura

### Stack

- Python 3.11+
- FastAPI
- SQLAlchemy 2.x (ORM)
- Alembic (migrações)
- psycopg2-binary (driver Postgres)
- python-dotenv (variáveis de ambiente)
- Pydantic v2 (schemas de entrada/saída)
- Uvicorn (servidor)

### Estrutura em camadas

```
back/
  app/
    main.py            # instancia o FastAPI, inclui os routers
    database.py        # engine, sessionmaker, get_db()
    models.py          # modelos SQLAlchemy
    schemas.py         # schemas Pydantic
    crud.py            # regras de negócio e acesso ao banco
    routers/
      alunos.py
      tecnicos.py
      equipamentos.py
      emprestimos.py
      relatorios.py
  alembic/
    versions/
  alembic.ini
  requirements.txt
  .env.example
  README.md
```

- **Routers** — rotas HTTP e validação de entrada/saída via Pydantic.
- **`crud.py`** — regras de negócio validadas **antes** de tocar o banco.
- **`models.py`** — mapeamento das tabelas no SQLAlchemy.
- **`database.py`** — conexão com o Neon e injeção de sessão (`get_db()`).

### Banco de dados (Neon)

- Connection string via variável `DATABASE_URL` no `.env` (não commitado; ver `.gitignore`).
- Formato: `postgresql://usuario:senha@ep-xxxx.neon.tech/nomedobanco?sslmode=require`
- SSL obrigatório — `sslmode=require` garantido em `database.py`.
- `pool_pre_ping=True` no `create_engine` (conexões serverless do Neon).
- Migrações versionadas com **Alembic** — não usar `Base.metadata.create_all` em produção.
- Índice único parcial na migração: impede dois empréstimos abertos para o mesmo equipamento (`WHERE data_devolucao IS NULL`).

### Modelagem

Tabelas: `aluno`, `tecnico`, `equipamento`, `emprestimo` — conforme especificação do projeto (campos, FKs e defaults definidos nos modelos e na migração `001_initial.py`).

### Regras de negócio (`crud.py`)

1. Aluno com pendência não retira outro equipamento → HTTP **403** (pendência = empréstimo aberto com `data_prevista_devolucao` no passado).
2. Equipamento só empresta se `status = disponivel` → HTTP **409**; ao emprestar, status vira `emprestado`.
3. Devolução preenche `data_devolucao`, `tecnico_devolucao_id` e volta status para `disponivel`.
4. Um equipamento não pode ter dois empréstimos abertos — validação na aplicação + índice único parcial no banco.

Erros de negócio via `HTTPException`, mensagens em português.

### API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/alunos` | Cadastrar aluno |
| `GET` | `/alunos` | Listar alunos |
| `POST` | `/tecnicos` | Cadastrar técnico |
| `GET` | `/tecnicos` | Listar técnicos |
| `POST` | `/equipamentos` | Cadastrar equipamento |
| `GET` | `/equipamentos` | Listar equipamentos |
| `POST` | `/emprestimos` | Registrar retirada |
| `POST` | `/emprestimos/{id}/devolver` | Registrar devolução |
| `GET` | `/emprestimos/ativos` | Empréstimos em aberto (com flag `atrasado`) |
| `GET` | `/relatorios/atrasos` | Empréstimos vencidos, ordenados por dias de atraso ↓ |

### Outras decisões

- **CORS** liberado (`allow_origins=["*"]`) para desenvolvimento local com frontend separado.
- **Autenticação** não implementada nesta etapa.

---

## Como rodar

### 1. Criar o banco no Neon

1. Acesse [console.neon.tech](https://console.neon.tech) e crie um projeto.
2. Em **Connection Details**, copie a connection string:

   ```
   postgresql://usuario:senha@ep-xxxx.neon.tech/nomedobanco?sslmode=require
   ```

### 2. Configurar o `.env`

```bash
cd back
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edite `.env` e cole a `DATABASE_URL` copiada do Neon.

### 3. Rodar as migrações do Alembic

```bash
alembic upgrade head
```

### 4. Subir o servidor

```bash
uvicorn app.main:app --reload
```

API em [http://127.0.0.1:8000](http://127.0.0.1:8000) · Docs em [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
