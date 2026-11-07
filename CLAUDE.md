## Equipe editorial

O blog conta com 5 subagentes em `.claude/agents/`: `pesquisador-seo`, `redator`, `revisor-tecnico`, `social-media` e `analista`.

- **Posts são escritos pelo agente `redator` e revisados pelo `revisor-tecnico`.** Nada é criado em `src/content/blog/`, commitado como post ou publicado antes do Mário dizer "aprovado". A única exceção são os rascunhos do `/preparar`, salvos em `rascunhos/`, que nunca são publicados. Pauta e imagem continuam sendo dele.
- **Quem decide a pauta e a imagem é o Mário.** Nenhum agente cria post, faz commit ou push sem aprovação explícita dele.
- **Fluxo**: `pesquisador-seo` propõe (lote semanal via `/semana`, considerando também tendências de busca atuais) → Mário escolhe → `redator` escreve → `revisor-tecnico` revisa → Mário aprova → `redator` cria o arquivo → commit direto na `main`, sem PR → o site gera o pin sozinho no deploy → `social-media` escreve os textos do pin e do carrossel → `analista` faz o relatório semanal a partir dos dados coletados automaticamente (`scripts/dados-semana.mjs`) e dos dados que o Mário colar (Pinterest, Amazon).
- **Planejamento editorial é semanal, não mensal.** A pauta vem do backlog `pautas/pendentes.md`, alimentado pelo `/semana` de sexta conforme o relatório de desempenho — não se monta calendário fechado do mês.
- **Ritmo: 3 posts por semana, 15 minutos por dia.** Domingo, terça e quinta são dias de preparação (`/preparar`: verificação local ou rascunho pronto). Segunda, quarta e sexta são dias de post (`/post`: aprovar e publicar). Sábado é livre. O check-in automático do `/semana` continua na sexta de manhã. Foco: Brasília/DF e cão idoso; nada de "pode comer X" novo. Teste de 8 semanas a partir de 09/11/2026 (primeiro post na segunda).
- **Nunca citar fonte não consultada.** Nunca dizer que há revisão veterinária. Sem dose, sem diagnóstico.
- **Posts de afiliado**: selo "Publicidade" e a frase obrigatória da Amazon ("Como associados Amazon, ganhamos com compras qualificadas."); sem preço; sem "o melhor"; links só os fornecidos pelo Mário.
- **Antes de commitar um post**: conferir slugs reais dos links internos, rodar `astro check` e o build, e testar no preview.
- **Conteúdo local (Brasília/DF)**: nenhum lugar, regra, horário, ONG, feira ou serviço vai ao ar sem o Mário ter confirmado (por telefone ou em fonte oficial). Os agentes podem levantar candidatos, nunca confirmar. Todo post local informa a data da última verificação. Nada de pet shop, banho e tosa ou clínica.

## Regras de publicação

- **Depois de todo commit que cria ou altera um post**, entregue ao Mário o link do pin desse post, no formato `https://ciadosbichinhos.com.br/pins/<slug>.png`.
- Antes de entregar, aguarde o deploy da Cloudflare terminar (leva cerca de 1 a 2 minutos): tente abrir o endereço do pin e o do post a cada ~20 segundos, por até 3 minutos, e só então responda.
- Se o ambiente não conseguir acessar o site (rede bloqueada), não fique esperando: entregue o link do pin e o link do post já montados, diga claramente que não conseguiu confirmar, e avise que é preciso abrir manualmente para conferir.
- **Nunca diga que o pin foi gerado sem ter conseguido abri-lo.**
