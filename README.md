# DECISOES.md — Sistema de Empréstimo de Equipamentos

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

Ao gerar o índice único parcial (`ix_emprestimo_equipamento_aberto`) e a regra de "um empréstimo aberto por equipamento", a IA decidiu, sem que isso tivesse sido pedido explicitamente, aplicar a garantia em **duas camadas** — validação em `crud.py` e constraint no banco — em vez de confiar só na validação da aplicação.

- **Por que é plausível:** é uma prática defensiva padrão contra condições de corrida (dois técnicos registrando o mesmo empréstimo ao mesmo tempo), algo que uma validação só em Python não impede de forma confiável.
- **Por que pode ser inadequada para este cliente:** um índice único no banco falha com um erro de integridade (IntegrityError) que precisa ser capturado e traduzido manualmente para a mensagem em português esperada pelo técnico (§ Regras de negócio do README). Se essa captura não estiver implementada em todos os pontos que escrevem em `emprestimo`, o usuário final pode ver um erro técnico do banco em vez da mensagem amigável — um comportamento que a IA não sinalizou como pendência de tratamento.

*(Revisar o código de `crud.py` e confirmar se há pelo menos um `try/except` cobrindo `IntegrityError` na criação de empréstimo antes de considerar este item verificado.)*

---

## Registro de tempo

Horas escrevendo ou gerando código: ___

Horas decidindo o que o sistema deveria fazer: ___

---

## Declaração de uso de IA

Ferramenta utilizada: ___

Para quê foi usada (ex.: geração de boilerplate do FastAPI, modelagem inicial das tabelas, escrita do README): ___

O que foi verificado manualmente (ex.: regras de negócio testadas contra os critérios de aceite do §3, revisão linha a linha de `crud.py`, execução das migrações em máquina limpa): ___

# Backend — Sistema de Empréstimo de Equipamentos

API REST para controle de empréstimo de equipamentos de laboratório.

**Stack:** Python 3.11+ · FastAPI · SQLAlchemy 2.x · Alembic · PostgreSQL (Neon) · Pydantic v2

---