---
description: Dia de preparação — deixa o próximo post pronto para o /post caber em 15 minutos
argument-hint: <pauta (opcional — vazio = próxima do backlog)> + <confirmações do Mário (opcional)>
---

Dia de preparação do blog Cia dos Bichinhos. O Mário tem **15 minutos**. O objetivo é que amanhã o `/post` seja só ler, aprovar e publicar.

$ARGUMENTS

## (a) Escolha a pauta

Se o Mário não indicou uma, pegue a primeira de `pautas/pendentes.md` que ainda não tenha arquivo em `rascunhos/`. Diga qual escolheu. O slug é o mesmo que o post vai ter.

## (b) Pauta local (Brasília/DF)

1. Se ainda não existe `rascunhos/<slug>-verificacao.md`, crie com base na coluna "Verificação" de `pautas/<data>.md`. Pode usar o `pesquisador-seo` (WebSearch) para levantar **candidatos**: nomes de lugares, regras, telefones e sites oficiais a consultar. Cada item entra como `a confirmar`, nunca como fato.
2. Entregue ao Mário uma lista **curta**, que caiba em 15 minutos: de 3 a 6 perguntas objetivas, cada uma com onde confirmar (site oficial primeiro; telefone só quando não houver outro jeito, lembrando que ele trabalha em horário comercial). Ordene da mais importante para a menos.
3. Quando o Mário responder com o que confirmou (nesta ou numa próxima conversa), atualize cada item para `confirmado em DD/MM/AAAA — <fonte>`, `não confirmado` ou `descartado`. Só os itens confirmados podem ir para o texto.
4. Quando os itens essenciais estiverem confirmados, siga para (c) com essa lista como base.

## (c) Rascunho revisado

1. Rode o `redator` com a pauta (e, se for local, **só** os itens confirmados de `rascunhos/<slug>-verificacao.md`, mais a data da verificação para aparecer no post). Peça frontmatter e corpo, sem criar arquivo em `src/content/blog/`. Se o Mário já mandou a foto, confira orientação e conteúdo antes (como no passo (a) do `/post`); se não mandou, deixe `heroImage` vazio e avise.
2. Rode o `revisor-tecnico` no rascunho e aplique as correções inequívocas.
3. Salve o texto final em `rascunhos/<slug>.md`. No topo, antes do frontmatter, um comentário HTML com: as correções aplicadas, o que ficou para decisão do Mário e o que falta (foto, verificação).

## (d) Entrega

Mostre ao Mário, em poucas linhas: a pauta, o que ficou pronto e o que ele precisa fazer (confirmar itens, mandar a foto, ler o rascunho). Commit e push direto na `main` dos arquivos de `rascunhos/` — eles não são publicados no site (ficam fora de `src/`).

## Regras

- Nada vai para `src/content/blog/` neste comando. Publicar é só com `/post` e "aprovado".
- Conteúdo local segue a regra do `CLAUDE.md`: sem confirmação do Mário, não entra no texto.
- Se a verificação de uma pauta local travar, avise e sugira preparar a próxima pauta sênior no lugar.
