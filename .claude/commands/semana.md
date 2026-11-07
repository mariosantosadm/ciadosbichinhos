---
description: Coleta dados semanais, gera o relatório via analista e propõe pautas via pesquisador-seo
---

Siga esta sequência, sem pular etapas:

## (a) Coleta de dados

Primeiro rode `git pull origin main`. Toda sexta às 07:07 (Brasília) o workflow `.github/workflows/dados-semana.yml` coleta os dados no GitHub Actions, com as credenciais guardadas nos Secrets do repositório, e commita o resumo na `main`. Se `relatorios/dados/<AAAA-MM-DD>-resumo.md` de hoje já existir com as fontes `ok`, use esse e pule para o passo (b).

Só se o resumo de hoje não existir ou tiver fontes "não configurado"/"erro", rode localmente `npm run dados-semana` (chama `node --use-env-proxy scripts/dados-semana.mjs` — a flag é necessária para o Node alcançar a API da Cloudflare neste ambiente). Sem `.env` e chave neste ambiente, não insista: diga ao Mário que a coleta automática falhou e peça para ele conferir a aba Actions do GitHub. A coleta gera `relatorios/dados/<AAAA-MM-DD>.json` (completo) e `relatorios/dados/<AAAA-MM-DD>-resumo.md` (compacto) com a indexação de cada URL do sitemap (comparada à coleta anterior) e os últimos 7 dias de Search Console, GA4 e Cloudflare Web Analytics, comparados aos 7 dias anteriores. Fontes não configuradas ou com erro ficam marcadas como tal no resumo; o script nunca inventa número.

Se o Mário colou dados do Pinterest Analytics ou do relatório de Associados Amazon nesta conversa, guarde-os para passar ao `analista` no próximo passo (o script não coleta essas duas fontes).

## (b) Agente `analista`

Invoque o agente `analista`, apontando para o resumo de hoje (`relatorios/dados/<AAAA-MM-DD>-resumo.md`) e repassando os dados que o Mário colou (se houver). Ele salva `relatorios/<AAAA-MM-DD>-semana.md`. Mostre a resposta dele ao Mário sob o título `[analista]`.

## (c) Agente `pesquisador-seo`

Invoque o agente `pesquisador-seo`, passando o relatório que o `analista` acabou de salvar como contexto. Peça pautas para manter no backlog 3 posts por semana (segunda, quarta e sexta), priorizando Brasília/DF e cão idoso, sem duplicar posts já publicados nem o que já está pendente (confira `src/content/blog/`). Ele salva `pautas/<AAAA-MM-DD>.md` e atualiza `pautas/pendentes.md` (o backlog vivo de pautas ainda não publicadas). Mostre a resposta dele ao Mário sob o título `[pesquisador-seo]`.

## (d) Commit

Rode `astro check` e `npm run build` para garantir que nada quebrou. Commit e push direto na `main`, sem Pull Request, dos arquivos gerados (`relatorios/dados/<data>.json`, `relatorios/dados/<data>-resumo.md`, `relatorios/<data>-semana.md`, `pautas/<data>.md`, `pautas/pendentes.md`) — **nunca** do `.env` nem de qualquer arquivo de credencial.

## Regra inegociável

**Este comando nunca escreve posts nem comita posts.** Ele só coleta dados, analisa e propõe pautas. Escolher uma pauta e criar o arquivo do post é sempre via `/post`, depois da aprovação explícita do Mário.
