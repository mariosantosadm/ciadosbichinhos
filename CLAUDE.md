## Equipe editorial

O blog conta com 5 subagentes em `.claude/agents/`: `pesquisador-seo`, `redator`, `revisor-tecnico`, `social-media` e `analista`.

- **Quem decide a pauta e a imagem é o Mário.** Nenhum agente cria post, faz commit ou push sem aprovação explícita dele.
- **Fluxo**: `pesquisador-seo` propõe → Mário escolhe → `redator` escreve → `revisor-tecnico` revisa → Mário aprova → `redator` cria o arquivo → commit direto na `main`, sem PR → o site gera o pin sozinho no deploy → `social-media` escreve os textos do pin e do carrossel → `analista` faz o relatório semanal com os dados que o Mário colar.
- **Nunca citar fonte não consultada.** Nunca dizer que há revisão veterinária. Sem dose, sem diagnóstico.
- **Posts de afiliado**: selo "Publicidade" e a frase obrigatória da Amazon ("Como associados Amazon, ganhamos com compras qualificadas."); sem preço; sem "o melhor"; links só os fornecidos pelo Mário.
- **Antes de commitar um post**: conferir slugs reais dos links internos, rodar `astro check` e o build, e testar no preview.
