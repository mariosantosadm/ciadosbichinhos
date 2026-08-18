---
name: site-cia-dos-bichinhos
description: "Skill de conteúdo, monetização e marca para o blog ciadosbichinhos.com.br (Astro, repo 'ciadosbichinhos'). Use SEMPRE que Mário mencionar o site Cia dos Bichinhos, pedir pauta, artigo ou post pet, calendário editorial, categorias do blog, AffiliateBox, disclosure, monetização com AdSense ou afiliados no nicho pet, ou pedir para escrever ou revisar conteúdo para o site. Também use ao planejar estratégia de tráfego, SEO ou marca do site, mesmo que o pedido seja informal, como 'escreve um artigo pro site', 'que pauta a gente usa essa semana', ou 'esse produto dá pra afiliar em qual artigo'."
---

# Cia dos Bichinhos — Conteúdo, Monetização e Marca

Skill de contexto completo para o blog **ciadosbichinhos.com.br**, site pet do Mário construído em Astro (repo `ciadosbichinhos`, hospedado no Cloudflare Pages, domínio comprado no Registro.br), monetizado via Google AdSense + links de afiliados de produtos pet.

Este arquivo é o ponto de entrada. Ele resume o essencial e aponta para os arquivos de referência quando o assunto pede mais profundidade — não carregue as referências à toa, só quando a tarefa realmente precisar.

## Contexto técnico do site

Stack: Astro, com esta estrutura relevante para geração de conteúdo:

```
src/
├── content/blog/            ← Posts em Markdown com frontmatter tipado
├── layouts/
│   ├── BaseLayout.astro     ← SEO, OG tags, schema.org
│   └── PostLayout.astro     ← breadcrumb + sidebar
├── components/
│   ├── PostCard.astro
│   ├── AffiliateBox.astro   ← caixa de produto afiliado
│   └── Sidebar.astro
├── pages/
│   ├── categoria/[slug].astro   ← página por categoria (automática)
│   ├── disclosure.astro         ← disclosure de afiliados (obrigatório)
│   └── rss.xml.ts
```

Toda escrita de artigo final (o arquivo `.md`, commits, build, deploy) acontece no **Claude Code**, que tem acesso direto ao repositório. Este chat (claude.ai) não tem acesso ao repo — aqui o trabalho é gerar o texto/estratégia pronta para ser colada ou aplicada lá.

**Assets da marca:** a pasta `assets/` desta skill traz os arquivos finais da logo (`logo-icone.svg`, `logo-icone-branco.svg`, `logo-horizontal.svg`, `logo-horizontal-branco.svg`) — copiar pra `public/` do projeto Astro. Detalhes de uso em `references/marca-guidelines.md`.

**Deploy:** site publicado no Cloudflare Pages (plano gratuito — permite uso comercial/anúncios, diferente do Vercel Hobby, que proíbe). Domínio `ciadosbichinhos.com.br` registrado no Registro.br, DNS gerenciado pela Cloudflare (nameservers apontados pra lá). Ver `references/checklist-paginas.md` pra lição aprendida sobre branch/PR não mesclado travando o deploy.

## Categorias — decisão final (consolidado após benchmarking de Petz, Cobasi, It Pet Blog e Pet Anjo)

**Menu público: 5 categorias, molde Pet Anjo.** Com o volume de conteúdo do lançamento, 8 categorias (modelo It Pet Blog) deixariam várias vazias — má impressão pro leitor e pro Google.

| Categoria (pública, no menu) | Escopo |
|---|---|
| **Cachorro** | conteúdo específico de cães |
| **Gato** | conteúdo específico de gatos |
| **Cuidados** | saúde, sintomas, doenças, prevenção — pode ser cachorro, gato ou ambos |
| **Alimentação** | ração, dieta, petiscos — pode ser cachorro, gato ou ambos |
| **Comportamento** | comportamento, adestramento, curiosidades, bem-estar mental — pode ser cachorro, gato ou ambos |

Um post pode ter mais de uma categoria quando fizer sentido (ex: "Diabetes em cães" = Alimentação + Cachorro).

**Pilar — tag interna, não aparece no menu.** Vem do benchmarking do It Pet Blog (Comer, Brincar, Passear, Dormir, Vestir, Educar, Cuidar) — mantido só como campo de frontmatter (`pilar`) pra mapear rapidinho qual tipo de produto de afiliado combina com o post. Promover pra navegação visível só quando o site tiver uns 30-40 artigos publicados (nenhuma categoria vazia nesse ponto).

**Prioridade de afiliado por pilar (tag interna):**

| Pilar | Afiliado |
|---|---|
| Comer, Brincar, Dormir, Vestir | Alto — categoria de produto direta |
| Passear | Médio |
| Cuidar | Médio — cuidado redobrado com alegação de saúde |
| Educar | Baixo/nenhum |

## Arquitetura da home

Clone da estrutura do Pet Anjo (petanjo.com/blog), com nossas cores/categorias:

1. **Header**: logo + menu das 5 categorias (Cachorro, Gato, Cuidados, Alimentação, Comportamento)
2. **Destaque principal**: 1 post grande em card (imagem, categoria, título, resumo, tempo de leitura)
3. **Destaques secundários**: 2 cards menores lado a lado (categoria + título, sem resumo) — **esconder essa seção se não houver posts suficientes pra preencher**, em vez de mostrar espaço vazio
4. **Espaço de anúncio (AdSense)**: banner logo abaixo dos destaques
5. **Corpo em duas colunas** (decisão final, testamos com sidebar à esquerda mas revertemos pro padrão Pet Anjo — feed precisa aparecer primeiro pra dar destaque ao conteúdo):
   - **Coluna principal à esquerda**: feed de posts (imagem, categoria, título — cards com `AffiliateBox`/selo de Publicidade quando `affiliate: true`) + botão "Carregar mais posts" no final (esconder se não houver próxima página)
   - **Sidebar à direita** (fixa em todas as páginas do blog): bloco "Mais lidos" (lista de títulos, global — não recalcula por categoria/post; nunca referenciar post apagado) + bloco "Tags" (pills)
6. **Banner de newsletter**: faixa full-width, fundo verde claro, campo de email + botão de assinar
7. **Rodapé**: 3 colunas — (1) nome/descrição da marca, (2) links das 5 categorias, (3) Sobre / Contato / Política de Privacidade / **Disclosure de afiliados** (link obrigatório pra `disclosure.astro`) — barra de copyright embaixo

Essa estrutura vale pra home; as páginas de categoria seguem o mesmo corpo (feed à esquerda + sidebar à direita), só sem os blocos de destaque do topo.

## Página de categoria — decisões (benchmarking direto em Petz e Pet Anjo)

1. **H1 + descritor de uma linha (não um parágrafo).** Petz e Pet Anjo pulam a introdução por completo (têm anos de autoridade de domínio) — o Cia dos Bichinhos começa do zero, por isso H1 + **uma frase curta** de contexto abaixo. Reavaliar remover quando o site já tiver mais autoridade.
2. **Sem filtro de espécie.** Nem Petz nem Pet Anjo filtram Cuidados/Alimentação/Comportamento por cachorro/gato dentro da própria categoria — `species` fica só como tag interna.
3. **"Mais lidos" da sidebar é global, não por categoria** (padrão Pet Anjo).
4. **Espaço AdSense**: mesma posição da home — logo abaixo do H1/descritor, antes do feed.
5. **Título e meta description por categoria (SEO)**: `"[Categoria]: dicas e cuidados | Cia dos Bichinhos"` + description única.
6. **Paginação:** "Carregar mais posts" (padrão Pet Anjo), escondendo o botão quando não houver segunda página.

## Workflow para criar um artigo

**O ciclo em 6 passos (confirmado na prática, ago/2026):**
1. **Escolher o tema** — Mário traz o gancho (sazonal, produto, categoria em falta) ou eu sugiro a partir de `calendario-editorial.md`.
2. **Benchmarking competitivo rápido, antes de escrever** — buscar quem já cobre esse tema (Petz, Cobasi, sites especializados, blogs de veterinário) pra calibrar a profundidade necessária: quantos concorrentes já existem, que pontos específicos eles cobrem que a gente não pode deixar de fora, e se o tema é disputado por gigante de e-commerce ou mais pulverizado.
3. **Eu escrevo o post completo** — texto + frontmatter, seguindo tom de voz, categoria/species/pilar corretos, e a profundidade calibrada pelo benchmarking do passo 2.
4. **Eu busco e sugiro imagem** — sempre via ferramenta de busca visual (nunca texto/legenda sozinha), apresentando as opções renderizadas.
5. **Mário escolhe a imagem (confirmação visual obrigatória) e revisa o texto** — só então a imagem e o post ficam definitivos. Se o Mário já trouxer uma imagem achada por conta própria, só preciso confirmar a fonte/licença antes de aprovar.
6. **Eu monto o prompt final pro Claude Code**, com texto, frontmatter e URL da imagem já resolvidos — Mário sobe no GitHub / roda no Claude Code, sempre pedindo commit e push **direto na branch main, sem Pull Request** (projeto solo — PR sem merge já causou o site inteiro ficar fora do ar por 2 semanas).

**Onde cada parte acontece:** pauta, escrita do texto e escolha da imagem acontecem aqui no chat (claude.ai). O Claude Code só materializa — nunca escreve pauta do zero nem decide conteúdo, nunca busca/valida imagem por conta própria, nunca cria posts novos por iniciativa própria mesmo que estejam listados como pauta planejada no calendário (isso já causou 3 posts não-revisados irem ao ar sem passar pelo processo).

1. **Escolher a pauta** — ver `references/calendario-editorial.md`.
2. **Definir categoria e se leva afiliado.**
3. **Escrever seguindo o tom de voz** — ver `references/marca-guidelines.md`.
4. **Buscar a `heroImage`** — foto real de banco gratuito (Unsplash/Pexels/Pixabay) como padrão; ver processo completo em `references/marca-guidelines.md`.
5. **Frontmatter padrão:**
   ```yaml
   title: ""
   description: ""       # meta description, 150-160 caracteres
   pubDate: 2026-01-01
   updatedDate:           # opcional
   category: cachorro | gato | cuidados | alimentacao | comportamento
   species: cachorro | gato | ambos
   pilar: comer | brincar | passear | dormir | vestir | educar | cuidar   # tag interna, não aparece no site — só orienta afiliado
   tags: []
   heroImage: ""
   heroImageAlt: ""       # nunca deixar vazio — string vazia diz a leitor de tela pra ignorar a imagem
   affiliate: true | false   # true = post leva AffiliateBox com selo de Publicidade
   ```
6. **Se `affiliate: true`:** inserir `AffiliateBox` com selo de identificação publicitária visível e imediato (obrigatório desde jun/2026 — ver `references/monetizacao-compliance.md`).
7. **Nunca dar conselho veterinário específico** (dosagem de medicamento, diagnóstico) — ver `references/marca-guidelines.md`. Recomendar sempre consulta a um veterinário para questões de saúde.
8. **Checar SEO on-page:** title tag (~50-60 caracteres), meta description, um H1, headings H2 hierárquicos, alt text nas imagens, link interno pra outro artigo do blog quando fizer sentido.
9. **Evitar canibalização:** checar se já existe artigo cobrindo a mesma palavra-chave principal no `src/content/blog/`.
10. Entregar o `.md` pronto (com a imagem escolhida/linkada) para o Mário colar/pedir ao Claude Code para commitar.

## Quando consultar cada referência

- **Pauta, calendário editorial, sazonalidade, ideias de tema, tendências do mercado pet** → `references/calendario-editorial.md`
- **Monetização (AdSense x afiliado), programas de afiliados pet no Brasil, compliance CONAR/disclosure/AdSense** → `references/monetizacao-compliance.md`
- **Tom de voz, guidelines de marca, política de imagem, o que evitar dizer** → `references/marca-guidelines.md`
- **Conferir se uma página/template saiu certo antes de aprovar, lição de deploy** → `references/checklist-paginas.md`

## Regras rápidas (resumo)

- 1-2 produtos afiliados foco por artigo com `affiliate: true` — nunca mais que isso.
- Todo link/box de afiliado precisa de identificação publicitária clara, ostensiva e imediata (selo "Publicidade") — regra CONAR vigente desde 01/06/2026.
- Coral (`#FF7A59`) só aparece em botão de compra/afiliado e no selo "Publicidade" — nunca em outro lugar do site.
- Tom: tutor-amigo que entende do assunto, não veterinário formal nem vendedor.
- Sem conselho médico/dosagem específica — sempre direcionar a um veterinário.
- Sempre checar duplicidade de pauta/keyword antes de escrever.
- Escolha de imagem só acontece no chat, com confirmação visual do Mário — Claude Code nunca busca/valida imagem por conta própria.
- Claude Code sempre commita direto na `main`, nunca abre PR sem avisar que precisa de merge manual.
