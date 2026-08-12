# DECISOES.md — Sistema de Empréstimo de Equipamentos


#Equipe
Patric Araujo Barros
Luis Gustavo Santos Macêdo

## 1. Decisões assumidas

1. O pedido não especifica o que caracteriza "pendência" do aluno. Assumimos que pendência é um empréstimo com `data_devolucao IS NULL` e `data_prevista_devolucao` no passado (ou seja, atraso, não simples posse de um item emprestado). Se o cliente esperasse que "pendência" incluísse qualquer empréstimo em aberto (mesmo sem atraso), o impacto seria: trocar a condição da regra de bloqueio em `crud.py` de `data_prevista_devolucao < hoje` para simplesmente `data_devolucao IS NULL`, e reescrever a mensagem de erro, já que hoje ela é apresentada como atraso e não como posse.

2. O pedido não define o que acontece se o mesmo equipamento tiver dois pedidos de empréstimo simultâneos (condição de corrida). Assumimos garantir isso em duas camadas: validação em `crud.py` e um índice único parcial no banco (`ix_emprestimo_equipamento_aberto`, sobre `equipamento_id` onde `data_devolucao IS NULL`). Se o cliente esperasse permitir múltiplas unidades do mesmo equipamento sob um único cadastro (ex.: "5 multímetros"), o impacto seria: remover o índice único parcial, introduzir um campo de quantidade/estoque em `equipamento` e reescrever toda a lógica de disponibilidade, que hoje assume 1 patrimônio = 1 unidade física.

3. O pedido não diz se um equipamento pode ficar indisponível por motivo diferente de empréstimo (quebra, manutenção). Assumimos os status `disponivel`, `emprestado`, `manutencao` e `baixado`, mas o pedido só menciona implicitamente dois estados (emprestado/não emprestado). Se o cliente esperasse apenas os dois estados básicos, o impacto seria: remover `manutencao` e `baixado` do enum de status e remover as rotas/telas que tratariam essa transição, sem afetar o restante do fluxo.

4. O pedido não especifica como identificar um aluno de forma única. Assumimos `matricula` como campo único e obrigatório. Se o cliente esperasse aceitar alunos sem matrícula formal (ex.: visitantes, pós-graduandos externos), o impacto seria: tornar `matricula` opcional e criar um identificador alternativo (CPF, e-mail) como chave de unicidade, alterando a constraint única da tabela `aluno` e toda validação de cadastro/duplicidade.

5. O pedido não menciona autenticação de nenhum usuário do sistema. Assumimos não implementar autenticação nesta etapa, apenas um cadastro de técnicos com `login` único (sem senha) usado só para registro de quem liberou/recebeu o equipamento. Se o cliente esperasse controle de acesso real (cada técnico só opera com login/senha), o impacto seria: adicionar hashing de senha, tabela ou campo de credenciais, middleware de autenticação em todas as rotas e um mecanismo de sessão/token — hoje inexistente.

6. O pedido não diz se a devolução precisa ser confirmada pelo mesmo técnico que liberou a retirada. Assumimos que pode ser um técnico diferente, por isso `tecnico_devolucao_id` é uma FK separada e opcional. Se o cliente exigisse que só o técnico que liberou pudesse registrar a devolução, o impacto seria: tornar `tecnico_devolucao_id` obrigatoriamente igual a `tecnico_id` na validação de `crud.py`, quebrando o caso de uso de trocas de turno.

7. O pedido não define um prazo padrão de devolução. Assumimos que `data_prevista_devolucao` é obrigatória e informada em cada empréstimo, sem prazo padrão implícito no sistema. Se o cliente esperasse um prazo fixo institucional (ex.: sempre 7 dias), o impacto seria: tornar o campo opcional no schema de entrada e calculá-lo automaticamente em `crud.py` a partir de `data_emprestimo`, exigindo também uma forma de configurar esse prazo padrão (constante ou tabela de configuração).

8. O pedido não diz o que exibir quando um aluno tenta retirar um equipamento inexistente ou já baixado. Assumimos tratar como erro de validação (404/409, conforme o caso) sem criar nenhum registro de empréstimo. Se o cliente esperasse permitir "reserva" de equipamento indisponível para retirada futura, o impacto seria: criar um novo estado de empréstimo (`reservado`) e uma tabela ou fluxo específico para conversão de reserva em retirada efetiva — hoje o modelo só tem retirada imediata.

9. O pedido não especifica campos de contato do aluno. Assumimos `email` e `telefone` como opcionais no cadastro. Se o cliente esperasse notificar o aluno sobre atraso (implícito na ideia de relatório de atrasos), o impacto seria: tornar ao menos um canal de contato obrigatório na validação de `crud.py` e implementar o disparo de notificação, hoje inexistente — o sistema apenas expõe o relatório para consulta manual do técnico.

10. O pedido não menciona exclusão de cadastros. Assumimos que alunos, técnicos e equipamentos usam desativação lógica (`ativo = false` para aluno/técnico, `status = baixado` para equipamento) em vez de exclusão física do registro. Se o cliente esperasse exclusão real de cadastros, o impacto seria: adicionar rotas `DELETE`, avaliar integridade referencial com `emprestimo` (que hoje depende dessas FKs) e decidir se empréstimos históricos de um cadastro excluído seriam apagados ou preservados.

11. O pedido não diz como ordenar o relatório de atrasos. Assumimos ordenação decrescente por dias de atraso (`data_prevista_devolucao` mais antiga primeiro). Se o cliente esperasse ordenar por aluno ou por categoria de equipamento, o impacto seria: adicionar parâmetros de ordenação na rota `GET /relatorios/atrasos` e ajustar a query em `crud.py`, hoje fixa em uma única ordenação.

12. O pedido não define se o técnico deve poder editar um empréstimo já registrado (corrigir data errada, trocar aluno). Assumimos que não — o único caminho após a criação é a devolução, sem edição dos demais campos. Se o cliente esperasse permitir correção manual de empréstimos, o impacto seria: criar uma rota `PATCH /emprestimos/{id}` com sua própria validação de negócio (ex.: impedir troca de equipamento se isso violar o índice único parcial), inexistente hoje.

13. O pedido não especifica onde o sistema roda nem quem hospeda o banco. Assumimos PostgreSQL gerenciado (Neon), com `sslmode=require` e `pool_pre_ping=True` para lidar com conexões ociosas encerradas pelo provedor. Se o cliente exigisse banco local, sem dependência de serviço externo, o impacto seria: trocar a `DATABASE_URL` para um Postgres local ou SQLite, remover a exigência de SSL em `database.py` e revalidar o comportamento do pool de conexões, que hoje é ajustado especificamente às particularidades do Neon.

14. O pedido não menciona controle de acesso entre sistemas (frontend/backend). Assumimos CORS liberado (`allow_origins=["*"]`) por ser um ambiente de desenvolvimento local com frontend separado. Se o cliente fosse colocar o sistema em produção exposto à internet, o impacto seria: restringir `allow_origins` à origem real do frontend em `main.py`, hoje aberto a qualquer origem.

## 2. Perguntas ao cliente

1. **"Pendência" bloqueia o aluno só por atraso, ou também por equipamento devolvido com defeito/dano?**
   - Se só por atraso: mantém a regra atual (comparação de datas), sem necessidade de registrar o estado físico do equipamento na devolução.
   - Se também por dano: exige um campo de "condição na devolução" em `emprestimo`, uma nova regra de bloqueio baseada nesse campo (não só em datas), e possivelmente um fluxo de aprovação manual pelo técnico antes de liberar o aluno novamente.

2. **Existe limite de quantos equipamentos um aluno pode ter emprestados ao mesmo tempo, mesmo sem estar atrasado?**
   - Se não há limite: o comportamento atual (bloqueio só por pendência) permanece correto.
   - Se há limite (ex.: 1 por vez, ou 3 simultâneos): exige uma nova validação em `crud.py` que conte empréstimos abertos do aluno antes de autorizar um novo, e uma decisão sobre se o limite é global ou por categoria de equipamento.

3. **O relatório de atrasos deve ser só consulta sob demanda pelo técnico, ou o sistema precisa avisar/notificar alguém automaticamente quando um empréstimo vence?**
   - Se é só consulta: a rota `GET /relatorios/atrasos` já atende, sem infraestrutura adicional.
   - Se precisa notificar: exige um job agendado (cron, worker), um canal de envio (e-mail/SMS) e, portanto, tornar o contato do aluno (§1, item 9) obrigatório em vez de opcional — mudança estrutural no cadastro.

## 3. Critérios de aceite

1. Aluno com devolução vencida há 1 dia, ao solicitar novo empréstimo via `POST /emprestimos`, recebe HTTP 403 com código de erro `PENDENCIA`, e nenhum registro é criado na tabela `emprestimo`.

2. Equipamento com empréstimo em aberto (`status = emprestado`), ao ser alvo de um novo `POST /emprestimos` para o mesmo `equipamento_id`, recebe HTTP 409, e a contagem de linhas em `emprestimo` para esse equipamento permanece igual à anterior à requisição.

3. Empréstimo em aberto, ao ser submetido a `POST /emprestimos/{id}/devolver`, passa a ter `data_devolucao` preenchida e o equipamento correspondente muda para `status = disponivel`, verificável em seguida por `GET /equipamentos`.

## 4. Decisões da ferramenta de IA

O prompt enviado à IA que gerou o backend (Cursor, com prompt redigido com apoio do Claude Code) já especifica explicitamente a maior parte do que antes parecia "decisão da IA": os campos, o enum de status, as quatro regras de negócio e até a exigência do índice único parcial junto com a validação em `crud.py`. Isso **não conta** para esta seção, porque foi pedido, não decidido pela ferramenta. As decisões abaixo são o que o prompt deixou em aberto e a IA precisou resolver por conta própria:

1. **Mecanismo de tratamento do erro do índice único parcial.** O prompt pede para reforçar a regra "um empréstimo aberto por equipamento" tanto na aplicação quanto no banco, mas não diz *como* capturar a violação do índice nem qual mensagem devolver. Verificar em `crud.py`/`routers/emprestimos.py` se existe um `try/except` para `IntegrityError` ao criar o empréstimo, e qual é o texto exato gerado.
   - Por que é plausível: é a forma usual de transformar uma constraint de banco em uma resposta HTTP com mensagem amigável.
   - Por que pode ser inadequada: se a mensagem não distinguir "equipamento já emprestado" de outro erro de integridade (ex.: FK inválida), o técnico recebe uma mensagem genérica para um problema diferente do que o cliente pediu para tratar.

2. **Validação do campo `categoria` do equipamento.** O prompt define `categoria` apenas como "string, opcional", sem lista fechada de valores. Se a IA implementou como texto livre (sem enum nem tabela de categorias), essa é uma decisão dela, não pedida.
   - Por que é plausível: texto livre é a leitura mais direta de "string opcional".
   - Por que pode ser inadequada: sem lista fechada, a mesma categoria pode ser cadastrada com grafias diferentes ("Multímetro" vs "multimetro"), o que compromete qualquer filtro ou relatório futuro por categoria — algo que o pedido original não previu, mas que decorre diretamente dessa escolha.

*(Abram o `crud.py`/`models.py` reais e confirmem qual das duas — ou outra que encontrarem na releitura — está de fato implementada; mantenham só a que aparece no código de vocês, com o trecho correspondente citado.)*

---

## Registro de tempo

Horas escrevendo ou gerando código: ___

Horas decidindo o que o sistema deveria fazer: ___

---

## Declaração de uso de IA

**Frontend — Gemini.** Usado para gerar a interface em Vite + MUI Core, em três prompts sucessivos: 
(1) o pedido original da coordenação, mais a solicitação de um front-end básico e simples em Vite/MUI;
Precisamos de um sistema para controlar o empréstimo dos equipamentos do laboratório. O aluno pega o equipamento e devolve depois. Queremos saber o que está emprestado e para quem, e não queremos que os equipamentos sumam. Aluno com pendência não pode pegar mais nada. O técnico precisa de um relatório dos atrasos. Tem que ser simples de usar. Crie primeiramente um front end basico mas facil de usar usando vite js com mui core para design no momento é isso desenvolva isso 


(2) divisão da interface em telas — lista de devolução, lista de aparelhos, lista de alunos, lista de técnicos; 
com esse codigo front ja criado divida em steps

lista de devolução

lista de aparelhos

lista de alunos

lista de tecnicos

(3) ajuste do front-end ao modelo de dados definido para o backend (equipamento, aluno, técnico, empréstimo).

seguindo esse modelo de dados

ajuste meu front end para o que for necessario e o que este nesse documento
Modelo de dados em doc pdf

**Backend — CursorIDE, com prompt redigido com apoio do Claude Code.**

# Backend do Sistema de Empréstimo de Equipamentos (Python + FastAPI + Neon)

Crie o backend de um sistema de controle de empréstimo de equipamentos de
laboratório, usando **Python + FastAPI**, com banco de dados **PostgreSQL
hospedado no Neon**.

## Stack obrigatória
- Python 3.11+
- FastAPI
- SQLAlchemy 2.x (ORM)
- Alembic (migrações do banco)
- psycopg2-binary (driver Postgres)
- python-dotenv (variáveis de ambiente)
- Pydantic v2 (schemas de entrada/saída)
- Uvicorn (servidor)

## Conexão com o banco (Neon)
- A string de conexão deve vir de variável de ambiente `DATABASE_URL`, lida de
  um arquivo `.env` (não commitado — adicionar ao `.gitignore`).
- Formato da connection string do Neon:
  `postgresql://usuario:senha@ep-xxxx.neon.tech/nomedobanco?sslmode=require`
- Neon exige SSL — garantir que `sslmode=require` esteja sempre presente na
  conexão.
- Usar `create_engine` do SQLAlchemy com pool configurado para conexões
  serverless (Neon pode encerrar conexões ociosas) — usar `pool_pre_ping=True`
  para evitar erros de conexão "stale".
- Criar um arquivo `.env.example` com a variável `DATABASE_URL` vazia, para
  documentar o que precisa ser configurado.

## Modelagem de dados (já definida — implementar exatamente assim)

**aluno**
- id (PK)
- nome (string, obrigatório)
- matricula (string, único, obrigatório)
- email (string, opcional)
- telefone (string, opcional)
- ativo (boolean, default true)
- criado_em (timestamp, default now)

**tecnico**
- id (PK)
- nome (string, obrigatório)
- login (string, único, obrigatório)
- ativo (boolean, default true)

**equipamento**
- id (PK)
- nome (string, obrigatório)
- patrimonio (string, único, obrigatório)
- categoria (string, opcional)
- status (string, default "disponivel") — valores possíveis: `disponivel`,
  `emprestado`, `manutencao`, `baixado`
- observacao (texto, opcional)
- criado_em (timestamp, default now)

**emprestimo**
- id (PK)
- aluno_id (FK -> aluno)
- equipamento_id (FK -> equipamento)
- tecnico_id (FK -> tecnico) — quem liberou a retirada
- tecnico_devolucao_id (FK -> tecnico, opcional) — quem recebeu a devolução
- data_emprestimo (timestamp, default now)
- data_prevista_devolucao (date, obrigatório)
- data_devolucao (timestamp, opcional — NULL significa que ainda está
  emprestado)
- observacao (texto, opcional)

Usar Alembic para gerar e versionar as migrações a partir desses modelos —
não usar `Base.metadata.create_all` em produção.

## Regras de negócio (validar na camada de serviço, antes de tocar o banco)

1. **Aluno com pendência não pode retirar outro equipamento.** Pendência =
   aluno tem qualquer empréstimo com `data_devolucao IS NULL` e
   `data_prevista_devolucao` no passado. Retornar erro 403 com mensagem clara.
2. **Equipamento só pode ser emprestado se `status = 'disponivel'`.** Ao
   registrar o empréstimo, mudar o status para `emprestado`. Se já estiver
   emprestado/manutenção/baixado, retornar erro 409.
3. **Ao devolver**, preencher `data_devolucao`, `tecnico_devolucao_id`, e
   voltar o status do equipamento para `disponivel`.
4. Um equipamento nunca pode ter dois empréstimos em aberto ao mesmo tempo —
   reforçar isso tanto na validação da aplicação quanto com um índice único
   parcial no banco (`CREATE UNIQUE INDEX ... WHERE data_devolucao IS NULL`),
   incluído na migração do Alembic.

## Endpoints esperados

```
POST   /alunos                       -> cadastrar aluno
GET    /alunos                       -> listar alunos
POST   /tecnicos                     -> cadastrar técnico
GET    /tecnicos                     -> listar técnicos
POST   /equipamentos                 -> cadastrar equipamento
GET    /equipamentos                 -> listar equipamentos
POST   /emprestimos                  -> registrar retirada (aplica as regras de negócio)
POST   /emprestimos/{id}/devolver    -> registrar devolução
GET    /emprestimos/ativos           -> listar empréstimos em aberto (com nome do aluno/equipamento e flag "atrasado")
GET    /relatorios/atrasos           -> listar empréstimos vencidos, ordenados por dias de atraso (decrescente)
```

## Estrutura de projeto esperada

```
backend/
  app/
    main.py            # instancia o FastAPI, inclui os routers
    database.py         # engine, sessionmaker, get_db()
    models.py           # modelos SQLAlchemy
    schemas.py           # schemas Pydantic
    crud.py               # regras de negócio e acesso ao banco
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

## Requisitos adicionais
- Habilitar CORS liberado (`allow_origins=["*"]`) para desenvolvimento local
  com um frontend separado.
- Tratar erros de negócio com `HTTPException` e mensagens em português,
  claras o suficiente para aparecer direto na tela do técnico.
- Incluir no `README.md` o passo a passo para: criar o banco no Neon, copiar
  a connection string, configurar o `.env`, rodar as migrações do Alembic
  (`alembic upgrade head`) e subir o servidor (`uvicorn app.main:app --reload`).
- Não é necessário autenticação/login nesta etapa.
Conecte com o meu front end 

 O prompt já trazia a stack (FastAPI + SQLAlchemy + Alembic + Neon), a modelagem de dados completa, as quatro regras de negócio, os endpoints esperados e a estrutura de pastas, além de pedir explicitamente a conexão com o front-end já existente.

**O que foi verificado manualmente:** ___ (preencher — por exemplo: execução dos três critérios de aceite do §3 contra o sistema final; leitura linha a linha das regras de negócio em `crud.py` comparando com o que foi pedido no prompt; teste do índice único parcial simulando duas retiradas do mesmo equipamento; confirmação de que as telas do front-end batem com os campos definidos no backend).
