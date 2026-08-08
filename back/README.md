# Backend — Sistema de Empréstimo de Equipamentos

API REST em **Python + FastAPI** com banco **PostgreSQL** hospedado no [Neon](https://neon.tech), para controle de empréstimo de equipamentos de laboratório.

## Pré-requisitos

- Python 3.11 ou superior
- Conta no [Neon](https://console.neon.tech) (plano gratuito disponível)

## 1. Criar o banco no Neon

1. Acesse [console.neon.tech](https://console.neon.tech) e faça login.
2. Clique em **New Project** e escolha um nome (ex.: `emprestimo-lab`).
3. Após a criação, vá em **Connection Details** e copie a **connection string** no formato:

   ```
   postgresql://usuario:senha@ep-xxxx.neon.tech/nomedobanco?sslmode=require
   ```

   O Neon exige SSL — a string já deve incluir `sslmode=require`.

## 2. Configurar o ambiente local

```bash
cd back

# Criar e ativar ambiente virtual (Windows)
python -m venv venv
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Copiar variáveis de ambiente
copy .env.example .env
```

Edite o arquivo `.env` e cole sua connection string do Neon:

```
DATABASE_URL=postgresql://usuario:senha@ep-xxxx.neon.tech/nomedobanco?sslmode=require
```

> **Importante:** o arquivo `.env` não é commitado (está no `.gitignore`). Nunca compartilhe credenciais.

## 3. Rodar as migrações do Alembic

Com o `.env` configurado, aplique as migrações para criar as tabelas no banco:

```bash
alembic upgrade head
```

Isso cria as tabelas `aluno`, `tecnico`, `equipamento` e `emprestimo`, incluindo o índice único parcial que impede dois empréstimos abertos para o mesmo equipamento.

## 4. Subir o servidor

```bash
uvicorn app.main:app --reload
```

A API ficará disponível em [http://127.0.0.1:8000](http://127.0.0.1:8000).

Documentação interativa (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

## Endpoints

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
| `GET` | `/emprestimos/ativos` | Listar empréstimos em aberto |
| `GET` | `/relatorios/atrasos` | Listar empréstimos vencidos |

## Regras de negócio

- Aluno com empréstimo em atraso **não pode** retirar outro equipamento (HTTP 403).
- Equipamento só pode ser emprestado se `status = disponivel` (HTTP 409 caso contrário).
- Ao devolver, o status do equipamento volta para `disponivel`.
- Um equipamento não pode ter dois empréstimos abertos simultaneamente (validação na aplicação + índice único parcial no banco).

## Estrutura do projeto

```
back/
  app/
    main.py              # FastAPI app e CORS
    database.py          # Engine, sessão e get_db()
    models.py            # Modelos SQLAlchemy
    schemas.py           # Schemas Pydantic v2
    crud.py              # Regras de negócio e acesso ao banco
    routers/
      alunos.py
      tecnicos.py
      equipamentos.py
      emprestimos.py
      relatorios.py
  alembic/
    versions/
      001_initial.py
  alembic.ini
  requirements.txt
  .env.example
  README.md
```

## CORS

CORS está liberado (`allow_origins=["*"]`) para desenvolvimento local com frontend separado.
