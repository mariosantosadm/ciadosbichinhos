---
description: Coleta dados semanais, gera o relatório via analista e propõe pautas via pesquisador-seo
---

Siga esta sequência, sem pular etapas:

## (a) Coleta de dados

Rode `node scripts/dados-semana.mjs` (ou `npm run dados-semana`). Isso gera `relatorios/dados/<AAAA-MM-DD>.json` (completo) e `relatorios/dados/<AAAA-MM-DD>-resumo.md` (compacto) com os últimos 7 dias — Search Console, GA4 e Cloudflare Web Analytics — comparados aos 7 dias anteriores. Fontes não configuradas ou com erro ficam marcadas como tal no resumo; o script nunca inventa número.

Se o Mário colou dados do Pinterest Analytics ou do relatório de Associados Amazon nesta conversa, guarde-os para passar ao `analista` no próximo passo (o script não coleta essas duas fontes).

## (b) Agente `analista`

Invoque o agente `analista`, apontando para o resumo de hoje (`relatorios/dados/<AAAA-MM-DD>-resumo.md`) e repassando os dados que o Mário colou (se houver). Ele salva `relatorios/<AAAA-MM-DD>-semana.md`. Mostre a resposta dele ao Mário sob o título `[analista]`.

## (c) Agente `pesquisador-seo`

Invoque o agente `pesquisador-seo`, passando o relatório que o `analista` acabou de salvar como contexto. Peça 5 a 7 pautas, sem duplicar posts já publicados (confira `src/content/blog/`). Ele salva `pautas/<AAAA-MM-DD>.md`. Mostre a resposta dele ao Mário sob o título `[pesquisador-seo]`.

## (d) Commit

Rode `astro check` e `npm run build` para garantir que nada quebrou. Commit e push direto na `main`, sem Pull Request, dos arquivos gerados (`relatorios/dados/<data>.json`, `relatorios/dados/<data>-resumo.md`, `relatorios/<data>-semana.md`, `pautas/<data>.md`) — **nunca** do `.env` nem de qualquer arquivo de credencial.

## Regra inegociável

**Este comando nunca escreve posts nem comita posts.** Ele só coleta dados, analisa e propõe pautas. Escolher uma pauta e criar o arquivo do post é sempre via `/post`, depois da aprovação explícita do Mário.
