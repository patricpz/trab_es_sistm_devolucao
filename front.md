# Frontend — Sistema de Empréstimo de Equipamentos

Interface web em **React + TypeScript + Vite** com **Material UI**, para o controle de empréstimo de equipamentos de laboratório. Consome a API REST do backend em `../back/`.

## Decisões de arquitetura

### Stack

- React 19
- TypeScript
- Vite (build e dev server)
- Material UI (MUI) + Emotion (componentes e estilos)
- Fetch API nativo (comunicação com o backend)

### Estrutura do projeto

```
front/
  README.md
  sistema_devolucao/
    src/
      main.tsx                 # ponto de entrada React
      App.tsx                  # layout, menu e estado global
      components/
        ListaDevolucao.tsx     # empréstimos ativos, retirada e devolução
        ListaEquipamentos.tsx  # cadastro e listagem de equipamentos
        ListaAlunos.tsx        # cadastro e listagem de alunos
        ListaTecnicos.tsx      # cadastro e listagem de técnicos
    index.html
    vite.config.ts
    package.json
    .env.example
```

- **`App.tsx`** — menu lateral, navegação entre telas e estado compartilhado (`alunos`, `equipamentos`, `tecnicos`, `emprestimos`). Carrega os dados da API no `useEffect` inicial.
- **`components/`** — cada tela com sua tabela, modal de cadastro e chamadas `fetch` à API.
- **Estado** — elevado para `App.tsx` e repassado via props; após POST bem-sucedido, a lista local é atualizada sem recarregar a página.

### Comunicação com o backend

- URL base da API definida em `VITE_API_URL` no arquivo `.env` (não commitado).
- Formato: `VITE_API_URL=http://127.0.0.1:8000`
- Todas as requisições usam `fetch(`${import.meta.env.VITE_API_URL}/...`)`.
- O backend precisa estar rodando com CORS liberado (já configurado no `back/`).

### Telas e funcionalidades

| Menu | Componente | O que faz |
|------|------------|-----------|
| Empréstimos | `ListaDevolucao` | Lista empréstimos ativos, registra retirada e devolução |
| Equipamentos | `ListaEquipamentos` | Lista e cadastra equipamentos |
| Alunos | `ListaAlunos` | Lista e cadastra alunos |
| Técnicos | `ListaTecnicos` | Lista e cadastra técnicos |

### Endpoints consumidos

| Método | Rota | Usado em |
|--------|------|----------|
| `GET` | `/alunos` | Carregamento inicial (`App.tsx`) |
| `POST` | `/alunos` | `ListaAlunos` |
| `GET` | `/equipamentos` | Carregamento inicial (`App.tsx`) |
| `POST` | `/equipamentos` | `ListaEquipamentos` |
| `GET` | `/tecnicos` | Carregamento inicial (`App.tsx`) |
| `POST` | `/tecnicos` | `ListaTecnicos` |
| `GET` | `/emprestimos/ativos` | Carregamento inicial (`App.tsx`) |
| `POST` | `/emprestimos` | `ListaDevolucao` — nova retirada |
| `POST` | `/emprestimos/{id}/devolver` | `ListaDevolucao` — devolução |

### Validações no frontend

Complementam as regras do backend (mensagens exibidas na tela antes de chamar a API):

- Campos obrigatórios preenchidos no modal de empréstimo.
- Aluno com equipamento em atraso não pode retirar outro item.
- Só equipamentos com `status = disponivel` aparecem no select de retirada.
- Empréstimos vencidos são destacados em vermelho com chip **Atrasado**.

A validação definitiva continua no backend (`crud.py`).

### Outras decisões

- **Layout** — menu lateral fixo (`Drawer`) + área principal com cabeçalho; navegação por estado local (`menuAtivo`).
- **Autenticação** — não implementada; devolução usa o primeiro técnico da lista como padrão.
- **Sem biblioteca de rotas** — navegação controlada por índice do menu em `App.tsx`.

---

## Como rodar

### Pré-requisitos

- Node.js 18+ e npm
- Backend rodando em [http://127.0.0.1:8000](http://127.0.0.1:8000) (ver README em `../back/`)

### 1. Subir o backend

Em outro terminal:

```bash
cd back
venv\Scripts\activate
uvicorn app.main:app --reload
```

### 2. Configurar o `.env`

```bash
cd front/sistema_devolucao
npm install
copy .env.example .env
```

Edite `.env` e confirme a URL da API:

```
VITE_API_URL=http://127.0.0.1:8000
```

### 3. Subir o frontend

```bash
npm run dev
```

Acesse a URL exibida no terminal (geralmente [http://localhost:5173](http://localhost:5173)).

### 4. Build para produção (opcional)

```bash
npm run build
npm run preview
```

---

## Uso do sistema

1. **Cadastre os dados base** — Alunos, Técnicos e Equipamentos (menus laterais).
2. **Registre um empréstimo** — menu **Empréstimos** → **+ Novo Empréstimo** → selecione técnico, aluno, equipamento e data prevista de devolução.
3. **Devolva um equipamento** — na tabela de empréstimos ativos, clique em **Devolver**.
4. **Acompanhe atrasos** — linhas em vermelho com chip **Atrasado** indicam devolução vencida.
