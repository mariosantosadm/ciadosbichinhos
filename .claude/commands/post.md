---
description: Escreve, revisa e publica o post do dia (redator → revisor-tecnico → aprovação → publicação → social-media)
argument-hint: <pauta completa (data, categoria, species, título, affiliate)> + <link da foto>
---

Você vai conduzir o fluxo completo de publicação de um post do blog Cia dos Bichinhos, a partir desta pauta e foto que o Mário forneceu:

$ARGUMENTS

Siga **exatamente** esta sequência, sem pular etapas:

## (a) Confira a foto antes de qualquer outra coisa

Confira a orientação e o tamanho da imagem informada (dimensões, se horizontal ou vertical). **Se a foto for vertical, avise o Mário antes de seguir** e pergunte se quer continuar mesmo assim (o site já lida bem com fotos verticais no hero, mas vale confirmar que é a foto certa). Não busque nem troque a imagem por conta própria — use exatamente a que foi fornecida.

## (b) Agente `redator`

Invoque o agente `redator` com a pauta completa, pedindo o frontmatter e o corpo do post em Markdown, **sem criar o arquivo**. Mostre a resposta dele ao Mário sob o título `[redator]`.

## (c) Agente `revisor-tecnico`

Invoque o agente `revisor-tecnico` passando o rascunho completo (frontmatter + corpo) que o `redator` entregou. Mostre a resposta dele ao Mário sob o título `[revisor-tecnico]`, com a lista de problemas (se houver) e as correções sugeridas.

## (d) Resultado final e aprovação

Monte o texto final (aplicando as correções do `revisor-tecnico` que forem inequívocas — ex.: barra final em link, contagem de caracteres; para ajustes que envolvem escolha editorial, pergunte ao Mário). Mostre o frontmatter e o corpo final completos. **Pare aqui e espere o Mário responder "aprovado"** — não crie nenhum arquivo antes disso.

## (e) Depois do "aprovado"

1. Crie `src/content/blog/<slug>.md` com o conteúdo aprovado.
2. Rode `astro check` e `npm run build`.
3. Commit e push **direto na `main`, sem Pull Request**.
4. Aguarde o deploy da Cloudflare: tente abrir o endereço do post e o do pin a cada ~20 segundos, por até 3 minutos. Se o ambiente não conseguir acessar o site (rede bloqueada), não fique esperando — siga para o próximo passo mesmo sem confirmar.

## (f) Entregue ao Mário

- O hash do commit.
- O link do post: `https://ciadosbichinhos.com.br/blog/<slug>/`.
- O link do pin: `https://ciadosbichinhos.com.br/pins/<slug>.png`.
- Diga claramente se conseguiu abrir os dois ou não. **Nunca diga que o pin foi gerado sem ter conseguido abri-lo.**

## (g) Agente `social-media`

Invoque o agente `social-media` para esse post, para ele salvar `social/<slug>.md` (títulos/descrições do pin, board sugerida do Pinterest, endereços do post e do pin, roteiro de carrossel, divulgação de publicidade se for afiliado). Mostre a resposta dele ao Mário sob o título `[social-media]`.
