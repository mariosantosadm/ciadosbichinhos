#!/usr/bin/env node
// Coleta dados semanais do blog (Search Console, GA4, Cloudflare Web Analytics) para o /semana.
// Nunca inventa números: fonte não configurada ou que falhe é registrada como tal, e o
// script segue coletando as outras. Não usa nenhuma chamada a modelo de IA — só HTTP puro.

import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSign } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // sem .env — segue só com variáveis já exportadas no ambiente, se houver
}

const OUT_DIR = path.join(ROOT, 'relatorios/dados');
const SITE_DOMAIN = 'ciadosbichinhos.com.br';

// ---------- datas ----------

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

const TODAY = isoDate(new Date());

// Search Console tem atraso de dados de ~2-3 dias; usamos 3 como fim da janela "atual".
const GSC_DELAY_DAYS = 3;
const gscCurrentEnd = isoDate(daysAgo(GSC_DELAY_DAYS));
const gscCurrentStart = isoDate(daysAgo(GSC_DELAY_DAYS + 6));
const gscPrevEnd = isoDate(daysAgo(GSC_DELAY_DAYS + 7));
const gscPrevStart = isoDate(daysAgo(GSC_DELAY_DAYS + 13));

// GA4 e Cloudflare: últimos 7 dias corridos (até ontem) e os 7 anteriores.
const recentEnd = isoDate(daysAgo(1));
const recentStart = isoDate(daysAgo(7));
const prevEnd = isoDate(daysAgo(8));
const prevStart = isoDate(daysAgo(14));

// ---------- auth Google (service account, JWT assinado na mão — sem dependências) ----------

function base64url(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGoogleAccessToken(scope) {
  const keyFilePath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
  const key = JSON.parse(readFileSync(keyFilePath, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: key.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = base64url(signer.sign(key.private_key));
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!res.ok) throw new Error(`token OAuth falhou: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.access_token;
}

// ---------- Search Console ----------

async function fetchSearchConsole() {
  const siteUrl = process.env.GSC_SITE_URL || `sc-domain:${SITE_DOMAIN}`;
  const token = await getGoogleAccessToken('https://www.googleapis.com/auth/webmasters.readonly');

  async function query(startDate, endDate, dimensions, rowLimit = 10) {
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, dimensions, rowLimit }),
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return res.json();
  }

  function totalsFrom(resp) {
    const row = resp.rows?.[0];
    return row
      ? { clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position }
      : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  }

  const [totalsCurrent, totalsPrev, pages, queries] = await Promise.all([
    query(gscCurrentStart, gscCurrentEnd, []),
    query(gscPrevStart, gscPrevEnd, []),
    query(gscCurrentStart, gscCurrentEnd, ['page'], 10),
    query(gscCurrentStart, gscCurrentEnd, ['query'], 10),
  ]);

  return {
    janela: { atual: [gscCurrentStart, gscCurrentEnd], anterior: [gscPrevStart, gscPrevEnd] },
    atraso_dados_dias: GSC_DELAY_DAYS,
    totais: { atual: totalsFrom(totalsCurrent), anterior: totalsFrom(totalsPrev) },
    top_paginas: (pages.rows || []).map((r) => ({
      pagina: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
    top_consultas: (queries.rows || []).map((r) => ({
      consulta: r.keys[0],
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      position: r.position,
    })),
  };
}

// ---------- GA4 ----------

async function fetchGA4() {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const token = await getGoogleAccessToken('https://www.googleapis.com/auth/analytics.readonly');

  async function runReport(startDate, endDate, dimensions, metrics, dimensionFilter) {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: dimensions.map((name) => ({ name })),
        metrics: metrics.map((name) => ({ name })),
        ...(dimensionFilter ? { dimensionFilter } : {}),
        limit: 50,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return res.json();
  }

  function totalsFrom(resp) {
    const row = resp.rows?.[0];
    return row
      ? { usuarios: Number(row.metricValues[0].value), sessoes: Number(row.metricValues[1].value) }
      : { usuarios: 0, sessoes: 0 };
  }

  const [totalsCurrent, totalsPrev, affiliateClicks] = await Promise.all([
    runReport(recentStart, recentEnd, [], ['activeUsers', 'sessions']),
    runReport(prevStart, prevEnd, [], ['activeUsers', 'sessions']),
    runReport(recentStart, recentEnd, ['pagePath'], ['eventCount'], {
      filter: { fieldName: 'eventName', stringFilter: { value: 'affiliate_click' } },
    }),
  ]);

  return {
    janela: { atual: [recentStart, recentEnd], anterior: [prevStart, prevEnd] },
    totais: { atual: totalsFrom(totalsCurrent), anterior: totalsFrom(totalsPrev) },
    cliques_afiliado_por_pagina: (affiliateClicks.rows || []).map((r) => ({
      pagina: r.dimensionValues[0].value,
      cliques: Number(r.metricValues[0].value),
    })),
  };
}

// ---------- Cloudflare Web Analytics ----------
// Os dados de RUM/Web Analytics só existem no schema GraphQL sob `viewer.accounts(...)`
// (não sob `viewer.zones(...)`), filtrados por requestHost — confirmado via introspecção
// contra a API real. O accountTag é obtido a partir do zoneTag via REST, então o Mário só
// precisa configurar CLOUDFLARE_API_TOKEN e CLOUDFLARE_ZONE_ID (sem credencial extra).

async function fetchCloudflare() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneTag = process.env.CLOUDFLARE_ZONE_ID;

  async function cfFetch(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(opts.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text()}`);
    return res.json();
  }

  const zoneInfo = await cfFetch(`https://api.cloudflare.com/client/v4/zones/${zoneTag}`);
  const accountTag = zoneInfo.result?.account?.id;
  if (!accountTag) throw new Error('não foi possível obter o accountTag a partir da zona');

  async function query(since, until) {
    const gql = `
      query ($accountTag: String!, $requestHost: String!, $since: Time!, $until: Time!) {
        viewer {
          accounts(filter: { accountTag: $accountTag }) {
            total: rumPageloadEventsAdaptiveGroups(
              limit: 100
              filter: { requestHost: $requestHost, datetime_geq: $since, datetime_leq: $until }
            ) {
              sum { visits }
            }
            topPaths: rumPageloadEventsAdaptiveGroups(
              limit: 10
              orderBy: [sum_visits_DESC]
              filter: { requestHost: $requestHost, datetime_geq: $since, datetime_leq: $until }
            ) {
              sum { visits }
              dimensions { requestPath }
            }
          }
        }
      }`;
    const data = await cfFetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      body: JSON.stringify({ query: gql, variables: { accountTag, requestHost: SITE_DOMAIN, since, until } }),
    });
    if (data.errors && data.errors.length) throw new Error(JSON.stringify(data.errors));
    return data.data.viewer.accounts[0];
  }

  function sumVisits(account) {
    return (account.total || []).reduce((acc, g) => acc + (g.sum?.visits || 0), 0);
  }

  const [current, prev] = await Promise.all([
    query(`${recentStart}T00:00:00Z`, `${recentEnd}T23:59:59Z`),
    query(`${prevStart}T00:00:00Z`, `${prevEnd}T23:59:59Z`),
  ]);

  return {
    janela: { atual: [recentStart, recentEnd], anterior: [prevStart, prevEnd] },
    visitas: { atual: sumVisits(current), anterior: sumVisits(prev) },
    top_paginas: (current.topPaths || []).map((g) => ({
      pagina: g.dimensions?.requestPath,
      visitas: g.sum?.visits,
    })),
  };
}

// ---------- orquestração ----------

async function collectSource(requiredVars, fetchFn, extraCheck) {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    return { status: 'nao_configurado', faltando: missing };
  }
  if (extraCheck) {
    const extraProblem = extraCheck();
    if (extraProblem) return { status: 'nao_configurado', faltando: [extraProblem] };
  }
  try {
    const dados = await fetchFn();
    return { status: 'ok', dados };
  } catch (err) {
    return { status: 'erro', mensagem: err.message };
  }
}

function pct(atual, anterior) {
  if (!anterior) return atual ? '+∞%' : '0%';
  const v = ((atual - anterior) / anterior) * 100;
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`;
}

function tableRows(rows, cols) {
  if (!rows || rows.length === 0) return '_sem dados_';
  const header = `| ${cols.map((c) => c.label).join(' | ')} |`;
  const sep = `| ${cols.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${cols.map((c) => r[c.key] ?? '').join(' | ')} |`).join('\n');
  return [header, sep, body].join('\n');
}

function buildResumoMarkdown(date, full) {
  const lines = [`# Resumo semanal — ${date}`, ''];

  // Search Console
  lines.push('## Search Console');
  const gsc = full.search_console;
  if (gsc.status !== 'ok') {
    lines.push(`- Status: ${gsc.status === 'nao_configurado' ? `não configurado (faltando: ${gsc.faltando.join(', ')})` : `erro — ${gsc.mensagem}`}`);
  } else {
    const d = gsc.dados;
    lines.push(`- Janela atual: ${d.janela.atual[0]} a ${d.janela.atual[1]} (dados com atraso de ${d.atraso_dados_dias} dias)`);
    lines.push(`- Janela anterior: ${d.janela.anterior[0]} a ${d.janela.anterior[1]}`);
    lines.push(`- Cliques: ${d.totais.atual.clicks} (anterior: ${d.totais.anterior.clicks}, ${pct(d.totais.atual.clicks, d.totais.anterior.clicks)})`);
    lines.push(`- Impressões: ${d.totais.atual.impressions} (anterior: ${d.totais.anterior.impressions}, ${pct(d.totais.atual.impressions, d.totais.anterior.impressions)})`);
    lines.push(`- CTR: ${(d.totais.atual.ctr * 100).toFixed(2)}% (anterior: ${(d.totais.anterior.ctr * 100).toFixed(2)}%)`);
    lines.push(`- Posição média: ${d.totais.atual.position.toFixed(1)} (anterior: ${d.totais.anterior.position.toFixed(1)})`);
    lines.push('', '### Top 10 páginas', tableRows(d.top_paginas, [
      { key: 'pagina', label: 'Página' },
      { key: 'clicks', label: 'Cliques' },
      { key: 'impressions', label: 'Impressões' },
      { key: 'position', label: 'Posição' },
    ]));
    lines.push('', '### Top 10 consultas', tableRows(d.top_consultas, [
      { key: 'consulta', label: 'Consulta' },
      { key: 'clicks', label: 'Cliques' },
      { key: 'impressions', label: 'Impressões' },
      { key: 'position', label: 'Posição' },
    ]));
  }

  // GA4
  lines.push('', '## GA4');
  const ga4 = full.ga4;
  if (ga4.status !== 'ok') {
    lines.push(`- Status: ${ga4.status === 'nao_configurado' ? `não configurado (faltando: ${ga4.faltando.join(', ')})` : `erro — ${ga4.mensagem}`}`);
  } else {
    const d = ga4.dados;
    lines.push(`- Janela atual: ${d.janela.atual[0]} a ${d.janela.atual[1]}`);
    lines.push(`- Usuários: ${d.totais.atual.usuarios} (anterior: ${d.totais.anterior.usuarios}, ${pct(d.totais.atual.usuarios, d.totais.anterior.usuarios)})`);
    lines.push(`- Sessões: ${d.totais.atual.sessoes} (anterior: ${d.totais.anterior.sessoes}, ${pct(d.totais.atual.sessoes, d.totais.anterior.sessoes)})`);
    lines.push('', '### Cliques em afiliado por página', tableRows(d.cliques_afiliado_por_pagina, [
      { key: 'pagina', label: 'Página' },
      { key: 'cliques', label: 'Cliques' },
    ]));
  }

  // Cloudflare
  lines.push('', '## Cloudflare Web Analytics');
  const cf = full.cloudflare;
  if (cf.status !== 'ok') {
    lines.push(`- Status: ${cf.status === 'nao_configurado' ? `não configurado (faltando: ${cf.faltando.join(', ')})` : `erro — ${cf.mensagem}`}`);
  } else {
    const d = cf.dados;
    lines.push(`- Janela atual: ${d.janela.atual[0]} a ${d.janela.atual[1]}`);
    lines.push(`- Visitas: ${d.visitas.atual} (anterior: ${d.visitas.anterior}, ${pct(d.visitas.atual, d.visitas.anterior)})`);
    lines.push('', '### Páginas mais vistas', tableRows(d.top_paginas, [
      { key: 'pagina', label: 'Página' },
      { key: 'visitas', label: 'Visitas' },
    ]));
  }

  lines.push('', '---', `_Gerado em ${full.gerado_em}_`);
  return lines.join('\n') + '\n';
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`[dados-semana] Coletando dados para ${TODAY}...`);

  const gsc = await collectSource(['GOOGLE_SERVICE_ACCOUNT_KEY_FILE'], fetchSearchConsole, () =>
    existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || '') ? null : 'GOOGLE_SERVICE_ACCOUNT_KEY_FILE (arquivo não existe)'
  );
  const ga4 = await collectSource(['GOOGLE_SERVICE_ACCOUNT_KEY_FILE', 'GA4_PROPERTY_ID'], fetchGA4, () =>
    existsSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || '') ? null : 'GOOGLE_SERVICE_ACCOUNT_KEY_FILE (arquivo não existe)'
  );
  const cloudflare = await collectSource(['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ZONE_ID'], fetchCloudflare);

  const full = {
    gerado_em: new Date().toISOString(),
    search_console: gsc,
    ga4,
    cloudflare,
  };

  const jsonPath = path.join(OUT_DIR, `${TODAY}.json`);
  const resumoPath = path.join(OUT_DIR, `${TODAY}-resumo.md`);
  await writeFile(jsonPath, JSON.stringify(full, null, 2));
  await writeFile(resumoPath, buildResumoMarkdown(TODAY, full));

  const statusLabel = (s) => (s.status === 'ok' ? 'ok' : s.status);
  console.log(
    `[dados-semana] Search Console: ${statusLabel(gsc)} | GA4: ${statusLabel(ga4)} | Cloudflare: ${statusLabel(cloudflare)}`
  );
  console.log(`[dados-semana] Salvo em ${path.relative(ROOT, jsonPath)} e ${path.relative(ROOT, resumoPath)}`);
}

main().catch((err) => {
  console.error('[dados-semana] Erro fatal:', err);
  process.exitCode = 1;
});
