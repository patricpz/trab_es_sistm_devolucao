## Visão geral da arquitetura

O backend segue uma arquitetura em **camadas**, separando responsabilidades entre roteamento HTTP, validação de entrada/saída, regras de negócio e persistência.

```mermaid
flowchart TB
    subgraph cliente [Cliente]
        FE[Frontend React]
    end

    subgraph api [Camada HTTP — FastAPI]
        MAIN[main.py]
        R[routers/]
    end

    subgraph validacao [Camada de validação]
        SCH[schemas.py — Pydantic v2]
    end

    subgraph negocio [Camada de serviço]
        CRUD[crud.py — regras de negócio]
    end

    subgraph persistencia [Camada de persistência]
        MOD[models.py — SQLAlchemy]
        DB[database.py — engine e sessão]
    end

    subgraph banco [Banco de dados]
        NEON[(PostgreSQL — Neon)]
        ALE[Alembic — migrações]
    end

    FE -->|HTTP/JSON| MAIN
    MAIN --> R
    R --> SCH
    R --> CRUD
    CRUD --> MOD
    CRUD --> DB
    MOD --> DB
    DB --> NEON
    ALE --> NEON
```

### Fluxo de uma requisição

1. O **router** recebe a requisição HTTP e valida o corpo com um schema Pydantic.
2. O router chama a função correspondente em **`crud.py`**, injetando a sessão do banco via `get_db()`.
3. **`crud.py`** aplica as regras de negócio **antes** de alterar o banco. Em caso de violação, lança `HTTPException` com mensagem em português.
4. Se tudo estiver válido, persiste via modelos SQLAlchemy e retorna o resultado serializado pelo schema de resposta.

---

## Stack e dependências

| Tecnologia | Função |
|------------|--------|
| **FastAPI** | Framework web e roteamento REST |
| **Uvicorn** | Servidor ASGI |
| **SQLAlchemy 2.x** | ORM e mapeamento objeto-relacional |
| **Alembic** | Versionamento e aplicação de migrações |
| **psycopg2-binary** | Driver PostgreSQL |
| **python-dotenv** | Leitura de variáveis do `.env` |
| **Pydantic v2** | Schemas de entrada/saída da API |

---

## Estrutura do projeto

```
back/
├── app/
│   ├── main.py              # Instancia o FastAPI, CORS e registra os routers
│   ├── database.py          # Engine, SessionLocal e get_db()
│   ├── models.py            # Modelos SQLAlchemy (tabelas)
│   ├── schemas.py           # Schemas Pydantic (DTOs da API)
│   ├── crud.py              # Regras de negócio e acesso ao banco
│   └── routers/
│       ├── alunos.py        # POST/GET /alunos
│       ├── tecnicos.py      # POST/GET /tecnicos
│       ├── equipamentos.py  # POST/GET /equipamentos
│       ├── emprestimos.py   # POST/GET empréstimos e devolução
│       └── relatorios.py    # GET /relatorios/atrasos
├── alembic/
│   ├── env.py               # Configuração do Alembic (lê DATABASE_URL)
│   └── versions/
│       └── 001_initial.py   # Migração inicial + índice único parcial
├── alembic.ini
├── requirements.txt
├── .env.example             # Modelo de variáveis de ambiente
├── .gitignore               # Ignora .env e __pycache__
└── README.md
```

### Responsabilidade de cada camada

| Arquivo | Responsabilidade |
|---------|------------------|
| `main.py` | Ponto de entrada da aplicação; configura CORS e monta os routers |
| `routers/*.py` | Define rotas HTTP, status codes e tipos de request/response |
| `schemas.py` | Contratos de dados da API (validação e serialização) |
| `crud.py` | **Toda a lógica de negócio** e consultas ao banco |
| `models.py` | Definição das tabelas e relacionamentos (SQLAlchemy) |
| `database.py` | Conexão com o Neon, pool de conexões e injeção de sessão |
| `alembic/` | Migrações versionadas — **não usa** `Base.metadata.create_all` em produção |

---

## Modelagem de dados

```mermaid
erDiagram
    aluno {
        int id PK
        string nome
        string matricula UK
        string email
        string telefone
        boolean ativo
        timestamp criado_em
    }

    tecnico {
        int id PK
        string nome
        string login UK
        boolean ativo
    }

    equipamento {
        int id PK
        string nome
        string patrimonio UK
        string categoria
        string status
        text observacao
        timestamp criado_em
    }

    emprestimo {
        int id PK
        int aluno_id FK
        int equipamento_id FK
        int tecnico_id FK
        int tecnico_devolucao_id FK
        timestamp data_emprestimo
        date data_prevista_devolucao
        timestamp data_devolucao
        text observacao
    }

    aluno ||--o{ emprestimo : "retira"
    equipamento ||--o{ emprestimo : "emprestado"
    tecnico ||--o{ emprestimo : "libera retirada"
    tecnico ||--o{ emprestimo : "recebe devolução"
```

### Tabelas

#### `aluno`
| Coluna | Tipo | Observação |
|--------|------|------------|
| `id` | PK | Identificador |
| `nome` | string | Obrigatório |
| `matricula` | string | Único, obrigatório |
| `email` | string | Opcional |
| `telefone` | string | Opcional |
| `ativo` | boolean | Default `true` |
| `criado_em` | timestamp | Default `now()` |

#### `tecnico`
| Coluna | Tipo | Observação |
|--------|------|------------|
| `id` | PK | Identificador |
| `nome` | string | Obrigatório |
| `login` | string | Único, obrigatório |
| `ativo` | boolean | Default `true` |

#### `equipamento`
| Coluna | Tipo | Observação |
|--------|------|------------|
| `id` | PK | Identificador |
| `nome` | string | Obrigatório |
| `patrimonio` | string | Único, obrigatório |
| `categoria` | string | Opcional |
| `status` | string | Default `disponivel` — valores: `disponivel`, `emprestado`, `manutencao`, `baixado` |
| `observacao` | text | Opcional |
| `criado_em` | timestamp | Default `now()` |

#### `emprestimo`
| Coluna | Tipo | Observação |
|--------|------|------------|
| `id` | PK | Identificador |
| `aluno_id` | FK → aluno | Quem retirou |
| `equipamento_id` | FK → equipamento | O que foi emprestado |
| `tecnico_id` | FK → tecnico | Quem liberou a retirada |
| `tecnico_devolucao_id` | FK → tecnico | Quem recebeu a devolução (opcional) |
| `data_emprestimo` | timestamp | Default `now()` |
| `data_prevista_devolucao` | date | Obrigatório |
| `data_devolucao` | timestamp | `NULL` = ainda emprestado |
| `observacao` | text | Opcional |

### Índice único parcial (integridade no banco)

Garante que um equipamento **nunca tenha dois empréstimos abertos** ao mesmo tempo:

```sql
CREATE UNIQUE INDEX ix_emprestimo_equipamento_aberto
ON emprestimo (equipamento_id)
WHERE data_devolucao IS NULL;
```

Incluído na migração `alembic/versions/001_initial.py`.

---

## Regras de negócio

Validadas em **`crud.py`**, antes de qualquer escrita no banco.

| # | Regra | Comportamento | HTTP |
|---|-------|---------------|------|
| 1 | Aluno com pendência não retira outro equipamento | Pendência = empréstimo com `data_devolucao IS NULL` e `data_prevista_devolucao` no passado | **403** |
| 2 | Equipamento só empresta se `status = disponivel` | Ao registrar empréstimo, status muda para `emprestado` | **409** |
| 3 | Devolução | Preenche `data_devolucao`, `tecnico_devolucao_id` e volta status para `disponivel` | — |
| 4 | Um empréstimo aberto por equipamento | Validação na aplicação + índice único parcial no banco | **409** |

Mensagens de erro retornadas em **português**, prontas para exibição na tela do técnico.

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/alunos` | Cadastrar aluno |
| `GET` | `/alunos` | Listar alunos |
| `POST` | `/tecnicos` | Cadastrar técnico |
| `GET` | `/tecnicos` | Listar técnicos |
| `POST` | `/equipamentos` | Cadastrar equipamento |
| `GET` | `/equipamentos` | Listar equipamentos |
| `POST` | `/emprestimos` | Registrar retirada (aplica regras de negócio) |
| `POST` | `/emprestimos/{id}/devolver` | Registrar devolução |
| `GET` | `/emprestimos/ativos` | Empréstimos em aberto (com flag `atrasado`) |
| `GET` | `/relatorios/atrasos` | Empréstimos vencidos, ordenados por dias de atraso ↓ |

Documentação interativa: `http://127.0.0.1:8000/docs`

> **Autenticação:** não implementada nesta etapa.

---

## Conexão com o banco (Neon)

O PostgreSQL é hospedado no [Neon](https://neon.tech) (serverless). A conexão é configurada via variável de ambiente:

```
DATABASE_URL=postgresql://usuario:senha@ep-xxxx.neon.tech/nomedobanco?sslmode=require
```

| Configuração | Detalhe |
|--------------|---------|
| Variável | `DATABASE_URL` no arquivo `.env` (não commitado) |
| SSL | `sslmode=require` garantido automaticamente em `database.py` |
| Pool | `pool_pre_ping=True` — evita erros de conexão ociosa encerrada pelo Neon |
| Migrações | Alembic (`alembic upgrade head`) — sem `create_all` em produção |

---

## CORS

Liberado para desenvolvimento local com frontend separado:

```python
allow_origins=["*"]
```

Configurado em `app/main.py`.

---

## Como rodar o projeto

### Pré-requisitos

- Python 3.11+
- Conta no [Neon](https://console.neon.tech)

### 1. Criar o banco no Neon

1. Acesse [console.neon.tech](https://console.neon.tech) e crie um projeto.
2. Em **Connection Details**, copie a connection string (formato acima).

### 2. Configurar ambiente local

```bash
cd back

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate       # Linux/macOS

pip install -r requirements.txt
copy .env.example .env           # Windows
# cp .env.example .env           # Linux/macOS
```

Edite `.env` e cole sua `DATABASE_URL`.

### 3. Aplicar migrações

```bash
alembic upgrade head
```

### 4. Subir o servidor

```bash
uvicorn app.main:app --reload
```

API disponível em [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## Relação com o frontend

```
projeto_es/
├── back/          ← este backend (FastAPI)
└── front/
    └── sistema_devolucao/   ← frontend React (consome a API via HTTP)
```

O frontend se comunica com esta API via requisições HTTP/JSON. O CORS liberado permite chamadas a partir de `localhost` durante o desenvolvimento.
