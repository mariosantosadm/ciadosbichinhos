## Equipe editorial

O blog conta com 5 subagentes em `.claude/agents/`: `pesquisador-seo`, `redator`, `revisor-tecnico`, `social-media` e `analista`.

- **Posts são escritos pelo agente `redator` e revisados pelo `revisor-tecnico`.** Nada é criado como arquivo, commitado ou publicado antes do Mário dizer "aprovado". Pauta e imagem continuam sendo dele.
- **Quem decide a pauta e a imagem é o Mário.** Nenhum agente cria post, faz commit ou push sem aprovação explícita dele.
- **Fluxo**: `pesquisador-seo` propõe (lote semanal via `/semana`, considerando também tendências de busca atuais) → Mário escolhe → `redator` escreve → `revisor-tecnico` revisa → Mário aprova → `redator` cria o arquivo → commit direto na `main`, sem PR → o site gera o pin sozinho no deploy → `social-media` escreve os textos do pin e do carrossel → `analista` faz o relatório semanal a partir dos dados coletados automaticamente (`scripts/dados-semana.mjs`) e dos dados que o Mário colar (Pinterest, Amazon).
- **Planejamento editorial é semanal, não mensal.** A publicação continua diária, mas a pauta de cada dia vem do lote de 5 a 7 sugestões gerado pelo `/semana` daquela semana, ajustado conforme o relatório de desempenho de sexta — não se monta mais um calendário fechado do mês inteiro de uma vez.
- **Nunca citar fonte não consultada.** Nunca dizer que há revisão veterinária. Sem dose, sem diagnóstico.
- **Posts de afiliado**: selo "Publicidade" e a frase obrigatória da Amazon ("Como associados Amazon, ganhamos com compras qualificadas."); sem preço; sem "o melhor"; links só os fornecidos pelo Mário.
- **Antes de commitar um post**: conferir slugs reais dos links internos, rodar `astro check` e o build, e testar no preview.

## Regras de publicação

- **Depois de todo commit que cria ou altera um post**, entregue ao Mário o link do pin desse post, no formato `https://ciadosbichinhos.com.br/pins/<slug>.png`.
- Antes de entregar, aguarde o deploy da Cloudflare terminar (leva cerca de 1 a 2 minutos): tente abrir o endereço do pin e o do post a cada ~20 segundos, por até 3 minutos, e só então responda.
- Se o ambiente não conseguir acessar o site (rede bloqueada), não fique esperando: entregue o link do pin e o link do post já montados, diga claramente que não conseguiu confirmar, e avise que é preciso abrir manualmente para conferir.
- **Nunca diga que o pin foi gerado sem ter conseguido abri-lo.**
