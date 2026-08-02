# Checklist de Validação de Páginas — Cia dos Bichinhos

Usar sempre que uma página/template novo (ou alterado) sair do Claude Code, antes de aprovar. Cobre só o que já foi decidido nas outras referências — se algo aqui não bater, é bug, não é "opinião".

## Global (header/rodapé — aparece em toda página)

- [ ] Header tem o ícone + wordmark da logo (`logo-horizontal.svg`) do lado esquerdo do menu
- [ ] Menu com as 5 categorias, nesta ordem: Cachorro, Gato, Cuidados, Alimentação, Comportamento
- [ ] Rodapé tem a logo branca (`logo-horizontal-branco.svg`), fundo `#145C3F`
- [ ] Rodapé com 3 colunas: marca/descrição, categorias, institucional (Sobre, Contato, Privacidade, **Disclosure de afiliados**)
- [ ] Link de disclosure realmente aponta pra `disclosure.astro`, não é um link morto

## Camada visual (cards)

- [ ] Blocos de conteúdo (sidebar, artigo, cards de post) têm fundo branco `#FFFFFF`, borda sutil `#E3EDE7`, cantos arredondados
- [ ] Fundo geral da página é `#F7FAF8` (visivelmente diferente do branco dos cards — se tudo parecer uma cor só, é bug)

## Sidebar (direita, em toda página do blog)

- [ ] "Mais lidos" aparece — e é a mesma lista em qualquer página (não recalcula por categoria/post)
- [ ] "Tags" aparece como pills

## Cores por categoria (badges)

- [ ] Cachorro = verde, Gato = azul, Cuidados = dourado, Alimentação = terracota, Comportamento = roxo
- [ ] Coral (`#FF7A59`) só aparece em botão de compra/afiliado e no selo "Publicidade" — se aparecer em qualquer outro lugar (menu, título, badge de categoria), é bug

## Monetização

- [ ] Todo post com `affiliate: true` tem o `AffiliateBox` com selo "Publicidade" visível e imediato (perto do produto, não escondido)
- [ ] Espaço de AdSense presente na home e na página de categoria, logo abaixo dos destaques/H1, antes do corpo de conteúdo

## Home

- [ ] Destaque grande (1 post) + destaques secundários (2 posts menores) no topo
- [ ] Corpo em duas colunas: feed à esquerda (destaque pro conteúdo) + sidebar direita
- [ ] Banner de newsletter antes do rodapé

## Página de categoria

- [ ] H1 com o nome da categoria + **uma frase curta** de descrição (não um parágrafo)
- [ ] **Sem filtro de espécie** (cachorro/gato) na categoria — decisão consciente, não esquecimento
- [ ] Botão "Carregar mais posts" só aparece se existir uma próxima página de resultados — escondido quando não tiver

## Página de post

- [ ] Breadcrumb (Início / Categoria / Título)
- [ ] Badge da categoria acima do título
- [ ] Data de publicação + tempo de leitura
