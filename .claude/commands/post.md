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

**Se existir `rascunhos/<slug>.md` preparado pelo `/preparar`**, use esse rascunho: ele já passou pelo `redator` e pelo `revisor-tecnico`. Encaixe a foto (se veio agora), confira se o comentário do topo deixou alguma pendência, e vá direto para (d), mostrando as correções que já foram aplicadas. Se for pauta local, confira que só entraram itens marcados como confirmados em `rascunhos/<slug>-verificacao.md`. Ao criar o post em `src/content/blog/`, tire o comentário HTML do topo do rascunho (o frontmatter precisa ser a primeira linha). Depois de publicar, apague `rascunhos/<slug>.md` e `rascunhos/<slug>-verificacao.md` no mesmo commit do post.

Se não existir rascunho, invoque o agente `redator` com a pauta completa, pedindo o frontmatter e o corpo do post em Markdown, **sem criar o arquivo**. Mostre a resposta dele ao Mário sob o título `[redator]`.

## (c) Agente `revisor-tecnico`

Invoque o agente `revisor-tecnico` passando o rascunho completo (frontmatter + corpo) que o `redator` entregou. Mostre a resposta dele ao Mário sob o título `[revisor-tecnico]`, com a lista de problemas (se houver) e as correções sugeridas.

## (d) Resultado final e aprovação

Monte o texto final (aplicando as correções do `revisor-tecnico` que forem inequívocas — ex.: barra final em link, contagem de caracteres; para ajustes que envolvem escolha editorial, pergunte ao Mário). Mostre o frontmatter e o corpo final completos. **Pare aqui e espere o Mário responder "aprovado"** — não crie nenhum arquivo antes disso.

## (e) Depois do "aprovado"

1. Crie `src/content/blog/<slug>.md` com o conteúdo aprovado.
2. Se essa pauta estiver listada em `pautas/pendentes.md`, remova a linha dela de lá (o post deixou de ser pendente).
3. Rode `astro check` e `npm run build`.
4. Commit e push **direto na `main`, sem Pull Request** (incluindo a atualização do `pautas/pendentes.md`, se houve).
5. Aguarde o deploy da Cloudflare: tente abrir o endereço do post e o do pin a cada ~20 segundos, por até 3 minutos. Só conte como no ar quando o `<title>` da página do post trouxer o título do post e o pin responder `200` com `Content-Type: image/png` — código `200` sozinho não prova nada. Se o ambiente não conseguir acessar o site (rede bloqueada), não fique esperando — siga para o próximo passo mesmo sem confirmar.

## (f) Entregue ao Mário

- O hash do commit.
- O link do post: `https://ciadosbichinhos.com.br/blog/<slug>/`.
- O link do pin: `https://ciadosbichinhos.com.br/pins/<slug>.png`.
- Diga claramente se conseguiu abrir os dois ou não. **Nunca diga que o pin foi gerado sem ter conseguido abri-lo.**

## (g) Agente `social-media`

Invoque o agente `social-media` para esse post, para ele salvar `social/<slug>.md` só com o material do Pinterest (sem carrossel de Instagram, que está pausado) (títulos/descrições do pin, board sugerida do Pinterest, tags/palavras-chave do pin, endereços do post e do pin, divulgação de publicidade se for afiliado). Mostre a resposta dele ao Mário sob o título `[social-media]`. Commit e push direto na `main` esse arquivo também (é conteúdo versionado do repositório).

## (h) Pin no Pinterest (automático)

O pin é criado **sozinho** pelo Pinterest: cada pasta do Pinterest está ligada a um feed RSS do site (`/pinterest/<pasta>.xml`, gerado por `src/pages/pinterest/[pasta].xml.ts`), e o Pinterest confere o feed e cria o pin com a imagem `/pins/<slug>.png`, o título, a descrição e o link do post. Por isso:

1. Antes de criar o arquivo do post (passo e), confira que o frontmatter tem `pinBoard` com uma das 4 pastas: `alimentacao`, `comportamento`, `cuidados-e-higiene` ou `saude-e-seguranca` (use a pasta que o `social-media` costuma escolher para o tema; sem `pinBoard`, vale a padrão pela categoria em `src/lib/pinterest.ts`).
2. Depois do deploy, confira que o post aparece em `https://ciadosbichinhos.com.br/pinterest/<pinBoard>.xml` com o `<enclosure>` do pin, e diga ao Mário: "o Pinterest deve criar o pin sozinho nas próximas horas (até ~1 dia), na pasta X".
3. **Não** entregue prompt de Claude in Chrome para criar pin, nem peça para baixar ou anexar imagem. Só se o Mário avisar que o pin não apareceu depois de 1 dia, investigue o feed (Configurações > Criar Pins em massa no Pinterest mostra erros do feed).

Não pule esta etapa — ela é parte obrigatória do fluxo do `/post`, mesmo quando não for pedida explicitamente na invocação do comando.
