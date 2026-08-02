---
name: site-cia-dos-bichinhos
description: "Skill de conteúdo, monetização e marca para o blog ciadosbichinhos.com.br (Astro, repo 'ciadosbichinhos'). Use SEMPRE que Mário mencionar o site Cia dos Bichinhos, pedir pauta, artigo ou post pet, calendário editorial, categorias do blog, AffiliateBox, disclosure, monetização com AdSense ou afiliados no nicho pet, ou pedir para escrever ou revisar conteúdo para o site. Também use ao planejar estratégia de tráfego, SEO ou marca do site, mesmo que o pedido seja informal, como 'escreve um artigo pro site', 'que pauta a gente usa essa semana', ou 'esse produto dá pra afiliar em qual artigo'."
---

# Cia dos Bichinhos — Conteúdo, Monetização e Marca

Skill de contexto completo para o blog **ciadosbichinhos.com.br**, site pet do Mário construído em Astro (repo `ciadosbichinhos`), monetizado via Google AdSense + links de afiliados de produtos pet.

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

**Assets da marca:** a pasta `assets/` desta skill traz os arquivos finais da logo (`logo-icone.svg`, `logo-icone-branco.svg`, `logo-horizontal.svg`, `logo-horizontal-branco.svg`) — copiar pra `public/` ou `src/assets/` do projeto Astro quando for montar o `BaseLayout.astro` e o header/rodapé. Detalhes de uso em `references/marca-guidelines.md`.

**Primeira tarefa ao abrir o projeto no Claude Code:** os rascunhos que já existem em `src/content/blog/` (como-cuidar-de-um-cachorro-filhote, melhor-racao-para-gatos-castrados, sinais-de-que-seu-pet-esta-doente) foram escritos antes do frontmatter final ser fechado — conferir/atualizar `category`, `species`, `pilar` e `affiliate` neles antes de publicar, seguindo o schema abaixo.

## Categorias — decisão final (consolidado após benchmarking de Petz, Cobasi, It Pet Blog e Pet Anjo)

**Menu público: 5 categorias, molde Pet Anjo.** Com o volume de conteúdo do lançamento (rascunhos + pautas do calendário), 8 categorias (modelo It Pet Blog) deixariam 2-3 vazias — má impressão pro leitor e pro Google. 5 categorias garantem ~3 posts cada desde o dia 1.

| Categoria (pública, no menu) | Escopo |
|---|---|
| **Cachorro** | conteúdo específico de cães |
| **Gato** | conteúdo específico de gatos |
| **Cuidados** | saúde, sintomas, doenças, prevenção — pode ser cachorro, gato ou ambos |
| **Alimentação** | ração, dieta, petiscos — pode ser cachorro, gato ou ambos |
| **Comportamento** | comportamento, adestramento, curiosidades — pode ser cachorro, gato ou ambos |

Como Petz faz na prática: um post pode ter mais de uma categoria (ex: "Diabetes em cães" = Alimentação + Cachorro). Use o bom senso — a categoria primária é a mais específica pro assunto do post.

**Pilar — tag interna, não aparece no menu.** Vem do benchmarking do It Pet Blog (Comer, Brincar, Passear, Dormir, Vestir, Educar, Cuidar) — mantido só como campo de frontmatter (`pilar`) pra mapear rapidinho qual tipo de produto de afiliado combina com o post. Não vira navegação pública agora.

**Evolução planejada:** quando o site tiver uns 30-40 artigos publicados, os pilares podem ser "promovidos" para navegação/filtro visível — nesse ponto nenhuma categoria vai estar vazia e o site ganha a diferenciação que os pilares trazem. Até lá, ficam invisíveis pro leitor, só orientando o Mário/Claude Code na hora de decidir afiliado.

**Prioridade de afiliado por pilar (tag interna):**

| Pilar | Afiliado |
|---|---|
| Comer, Brincar, Dormir, Vestir | Alto — categoria de produto direta |
| Passear | Médio |
| Cuidar | Médio — cuidado redobrado com alegação de saúde |
| Educar | Baixo/nenhum |

**Arquitetura da home — clone da estrutura do Pet Anjo, com nossas cores/categorias.** Decisão final: replicar a estrutura da home do Pet Anjo (petanjo.com/blog), só trocando categorias e paleta. De cima pra baixo:

1. **Header**: logo + menu das 5 categorias (Cachorro, Gato, Cuidados, Alimentação, Comportamento)
2. **Destaque principal**: 1 post grande em card (imagem maior, categoria, título, resumo, tempo de leitura)
3. **Destaques secundários**: 2 cards menores lado a lado (categoria + título, sem resumo)
4. **Espaço de anúncio (AdSense)**: banner logo abaixo dos destaques
5. **Corpo em duas colunas** (decisão final revertida pro padrão original do Pet Anjo — testamos com a sidebar à esquerda, mas o feed de posts precisa aparecer primeiro pra ganhar destaque): 
   - **Coluna principal à esquerda**: feed de posts (imagem, categoria, título — cards com `AffiliateBox`/selo de Publicidade quando `affiliate: true`) + botão "Carregar mais posts" no final
   - **Sidebar à direita** (fixa em todas as páginas do blog): bloco "Mais lidos" (lista de títulos) + bloco "Tags" (as tags mais relevantes/usadas, em formato de pill)
6. **Banner de newsletter**: faixa full-width, fundo verde claro, campo de email + botão de assinar
7. **Rodapé**: 3 colunas — (1) nome/descrição da marca, (2) links das 5 categorias, (3) Sobre / Contato / Política de Privacidade / **Disclosure de afiliados** (link obrigatório pra `disclosure.astro`) — barra de copyright embaixo

Essa estrutura vale pra home; as páginas de categoria seguem o mesmo corpo (feed à esquerda + sidebar à direita), só sem os blocos de destaque do topo.

## Página de categoria — decisões (benchmarking direto em Petz e Pet Anjo)

Fui conferir a página real de "Cuidados" da Petz e a de "Cachorros" do Pet Anjo pra decidir com dado, não achismo. Resultado: **nenhum dos dois usa parágrafo de introdução nem filtro por espécie** — só um H1 curto e direto pro feed de posts.

1. **H1 + descritor de uma linha (não um parágrafo).** Petz e Pet Anjo pulam a introdução por completo — mas eles têm anos de autoridade de domínio, o Cia dos Bichinhos começa do zero. Solução intermediária: H1 ("Cachorro") + **uma frase curta** abaixo (ex: "Dicas, cuidados e curiosidades pra quem tem um cão em casa"), não um parágrafo de 150+ palavras. Dá o mínimo de contexto pro Google sem fugir do visual limpo que você gostou. Reavaliar remover essa frase quando o site já tiver mais autoridade.

2. **Sem filtro de espécie — decisão revertida.** Nem Petz nem Pet Anjo filtram Cuidados/Alimentação/Comportamento por cachorro/gato dentro da própria categoria — cada post carrega o `species` só como tag interna (útil pra SEO da URL/keyword), mas não vira um controle de UI. Menos JS pra manter agora, e os dois maiores players validam que não faz falta.

3. **"Mais lidos" da sidebar é global, não por categoria.** No Pet Anjo, o widget "As mais lidas do blog" é idêntico na home e em toda página de categoria — não recalcula por seção. Mais simples de implementar (uma lista só, reaproveitada em todo lugar) e é o padrão do próprio site que estamos clonando.

4. **Espaço AdSense**: mesma posição da home — logo abaixo do H1/descritor, antes do feed.

5. **Título e meta description por categoria (SEO)**: `"[Categoria]: dicas e cuidados | Cia dos Bichinhos"` + description única por categoria — aqui sim vale o padrão, mesmo Petz/Pet Anjo fazendo isso nos bastidores (title tag da aba do navegador confirma).

6. **Paginação:** Petz usa números (1 2 3 … próximo), Pet Anjo usa "Carregar mais posts" — como já decidimos clonar o Pet Anjo, mantém "Carregar mais posts", mas **esconder o botão quando não houver segunda página** (com poucos posts por categoria no lançamento, isso vai acontecer com frequência).

## Workflow para criar um artigo

**Onde cada parte acontece:** pauta, escrita do texto e escolha da imagem acontecem aqui no chat (claude.ai) — é aqui que dá pra pesquisar, discutir e revisar antes de qualquer coisa virar arquivo de verdade. O Claude Code entra depois, só pra pegar o texto/imagem já prontos, criar o `.md` no repositório, aplicar o frontmatter, baixar/otimizar a imagem escolhida e commitar. Ele não escreve a pauta do zero nem decide o conteúdo sozinho — só materializa o que já foi definido aqui.

1. **Escolher a pauta** — ver `references/calendario-editorial.md` para a lista viva de temas e a lógica de escolha (sazonalidade, categoria em falta, oportunidade de afiliado).
2. **Definir categoria e se leva afiliado.**
3. **Escrever seguindo o tom de voz** — ver `references/marca-guidelines.md`.
4. **Buscar a `heroImage`** — foto real de banco gratuito (Unsplash/Pexels) como padrão, ou ilustração própria quando não houver foto boa pro tema; ver a política completa e a especificação técnica (proporção, alt text) em `references/marca-guidelines.md`.
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
   affiliate: true | false   # true = post leva AffiliateBox com selo de Publicidade
   ```
6. **Se `affiliate: true`:** inserir `AffiliateBox` com selo de identificação publicitária visível e imediato (obrigatório desde jun/2026 — ver `references/monetizacao-compliance.md` antes de publicar qualquer conteúdo com link comissionado).
7. **Nunca dar conselho veterinário específico** (dosagem de medicamento, diagnóstico) — ver seção de limites em `references/marca-guidelines.md`. Recomendar sempre consulta a um veterinário para questões de saúde.
8. **Checar SEO on-page:** title tag, meta description, um H1, headings hierárquicos, alt text nas imagens, link interno para outro artigo do blog quando fizer sentido.
9. **Evitar canibalização:** antes de criar um artigo novo, checar se já existe um artigo cobrindo a mesma palavra-chave principal no `src/content/blog/`.
10. Entregar o `.md` pronto (com a imagem escolhida/linkada) para o Mário colar/pedir ao Claude Code para commitar.


## Quando consultar cada referência

- **Pauta, calendário editorial, sazonalidade, ideias de tema, tendências do mercado pet** → `references/calendario-editorial.md`
- **Monetização (AdSense x afiliado), programas de afiliados pet no Brasil, compliance CONAR/disclosure** → `references/monetizacao-compliance.md`
- **Tom de voz, guidelines de marca, o que evitar dizer** → `references/marca-guidelines.md`
- **Conferir se uma página/template saiu certo antes de aprovar** → `references/checklist-paginas.md`

## Regras rápidas (resumo)

- 1-2 produtos afiliados foco por artigo com `affiliate: true` — nunca mais que isso.
- Todo link/box de afiliado precisa de identificação publicitária clara, ostensiva e imediata (não basta a página `disclosure.astro` genérica) — regra CONAR vigente desde 01/06/2026, detalhada na referência de monetização.
- Tom: tutor-amigo que entende do assunto, não veterinário formal nem vendedor.
- Sem conselho médico/dosagem específica — sempre direcionar a um veterinário.
- Sempre checar duplicidade de pauta/keyword antes de escrever.
