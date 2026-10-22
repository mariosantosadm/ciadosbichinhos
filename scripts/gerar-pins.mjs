#!/usr/bin/env node
// Gera public/pins/<slug>.png (1000x1500) para cada post do blog, para uso como "pin" no Pinterest.
// Roda como script "prebuild" (ver package.json) — nunca deve falhar o build: posts sem imagem
// baixável são pulados com um aviso no log.

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import satori from 'satori';
import { parse as parseYaml } from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUT_DIR = path.join(ROOT, 'public/pins');
const CACHE_DIR = path.join(ROOT, 'node_modules/.cache/pins');
const LOGO_PATH = path.join(ROOT, 'public/logo-icone-branco.svg');

const PLACEHOLDER = process.argv.includes('--placeholder');
const DOWNLOAD_TIMEOUT_MS = 8000;

const WIDTH = 1000;
const HEIGHT = 1500;
const PHOTO_HEIGHT_A = 840;
const FOOTER_HEIGHT_B = 120;
const CONTENT_PADDING_X = 56;

const CATEGORY_META = {
  cachorro: { bg: '#DCEFE3', text: '#145C3F', label: 'Cachorro' },
  gato: { bg: '#DCEAF6', text: '#1B4F78', label: 'Gato' },
  cuidados: { bg: '#F7E7C4', text: '#7A5008', label: 'Cuidados' },
  alimentacao: { bg: '#F7DCCB', text: '#8A3F1E', label: 'Alimentação' },
  comportamento: { bg: '#E9E1F5', text: '#55408A', label: 'Comportamento' },
};
const PUBLICIDADE_META = { bg: '#FFE4DC', text: '#B33D1F', label: 'Publicidade' };
const GREEN = '#1F7A54';
const LIGHT_BG = '#F7FAF8';

// ---------- frontmatter & derivação de título/subtítulo ----------

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  return parseYaml(match[1]);
}

/** Deriva título/subtítulo do pin a partir de `title`, cortando no primeiro "?" ou ":".
 *  O "?" fica com o título (faz parte da frase); o ":" não (é só separador). */
function deriveTitleSubtitle(title, pinTitle, pinSubtitle) {
  if (pinTitle) return { title: pinTitle, subtitle: pinSubtitle ?? '' };

  const q = title.indexOf('?');
  const c = title.indexOf(':');
  if (q === -1 && c === -1) return { title, subtitle: '' };

  const useQuestion = q !== -1 && (c === -1 || q < c);
  const idx = useQuestion ? q : c;
  const head = useQuestion ? title.slice(0, idx + 1) : title.slice(0, idx);
  const tail = title.slice(idx + 1).trim();
  return { title: head.trim(), subtitle: tail };
}

// ---------- ajuste de tamanho de fonte do título (heurística por largura média de caractere) ----------

function estimateLines(text, fontSize, boxWidth, avgCharWidthFactor = 0.56) {
  const charsPerLine = Math.max(1, Math.floor(boxWidth / (fontSize * avgCharWidthFactor)));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
}

function fitTitleFontSize(title, boxWidth) {
  const MAX = 76;
  const MIN = 40;
  const MAX_LINES = 3;
  let fontSize = MAX;
  while (fontSize > MIN && estimateLines(title, fontSize, boxWidth) > MAX_LINES) {
    fontSize -= 2;
  }
  return fontSize;
}

// ---------- object-position (CSS) -> crop em pixels ----------

function parseObjectPosition(pos) {
  const tokens = (pos || 'center').trim().split(/\s+/);
  const KEYWORDS = { left: 0, center: 50, right: 100, top: 0, bottom: 100 };
  function resolve(token) {
    if (!token) return 50;
    if (token.endsWith('%')) return parseFloat(token);
    if (token in KEYWORDS) return KEYWORDS[token];
    return 50;
  }
  return { xPercent: resolve(tokens[0]), yPercent: resolve(tokens[1]) };
}

/** Replica object-fit:cover + object-position em pixels, via sharp. */
async function cropToBox(buffer, boxWidth, boxHeight, position) {
  const img = sharp(buffer);
  const meta = await img.metadata();
  const srcW = meta.width;
  const srcH = meta.height;
  const scale = Math.max(boxWidth / srcW, boxHeight / srcH);
  const scaledW = Math.max(boxWidth, Math.round(srcW * scale));
  const scaledH = Math.max(boxHeight, Math.round(srcH * scale));

  const { xPercent, yPercent } = parseObjectPosition(position);
  let left = Math.round((scaledW - boxWidth) * (xPercent / 100));
  let top = Math.round((scaledH - boxHeight) * (yPercent / 100));
  left = Math.min(Math.max(left, 0), scaledW - boxWidth);
  top = Math.min(Math.max(top, 0), scaledH - boxHeight);

  return sharp(buffer)
    .resize(scaledW, scaledH, { fit: 'fill' })
    .extract({ left, top, width: boxWidth, height: boxHeight })
    .png()
    .toBuffer();
}

function placeholderBuffer(boxWidth, boxHeight) {
  return sharp({
    create: { width: boxWidth, height: boxHeight, channels: 4, background: { r: 196, g: 214, b: 204, alpha: 1 } },
  })
    .png()
    .toBuffer();
}

// ---------- download com cache e timeout ----------

async function downloadImage(url) {
  await mkdir(CACHE_DIR, { recursive: true });
  const cacheKey = createHash('sha256').update(url).digest('hex');
  const cachePath = path.join(CACHE_DIR, cacheKey);
  if (existsSync(cachePath)) {
    return readFile(cachePath);
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(cachePath, buf);
    return buf;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------- montagem da árvore satori ----------

function h(type, props, children) {
  return { type, props: { ...props, children } };
}

function badgeNode({ label, bg, text }) {
  return h('div', {
    style: {
      display: 'flex',
      padding: '10px 26px',
      borderRadius: 999,
      background: bg,
      color: text,
      fontFamily: 'Poppins',
      fontWeight: 700,
      fontSize: 28,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  }, label);
}

function footerNode({ logoDataUri }) {
  const children = [];
  if (logoDataUri) {
    children.push(h('img', { src: logoDataUri, width: 56, height: 56 }));
  }
  children.push(
    h('div', { style: { fontFamily: 'Poppins', fontWeight: 600, fontSize: 34, color: '#FFFFFF' } }, 'Cia dos Bichinhos')
  );
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: 18 } }, children);
}

function titleNode({ text, fontSize, color }) {
  return h('div', {
    style: {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 3,
      overflow: 'hidden',
      fontFamily: 'Poppins',
      fontWeight: 700,
      fontSize,
      lineHeight: 1.15,
      color,
      marginTop: 26,
    },
  }, text);
}

function subtitleNode({ text, color }) {
  if (!text) return null;
  return h('div', {
    style: {
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      overflow: 'hidden',
      fontFamily: 'Nunito',
      fontWeight: 400,
      fontSize: 38,
      lineHeight: 1.3,
      color,
      marginTop: 18,
    },
  }, text);
}

function computeTopPanelHeightB(pinTitle, pinSubtitle, fontSize) {
  const PAD_TOP = 48;
  const BADGE_H = 64;
  const GAP_AFTER_BADGE = 26;
  const boxWidth = WIDTH - CONTENT_PADDING_X * 2;
  const lines = Math.min(3, estimateLines(pinTitle, fontSize, boxWidth));
  const titleH = lines * fontSize * 1.15;
  const GAP_AFTER_TITLE = 18;
  const subtitleH = pinSubtitle ? 2 * 38 * 1.3 : 0;
  const PAD_BOTTOM = 40;
  return Math.round(
    PAD_TOP + BADGE_H + GAP_AFTER_BADGE + titleH + (pinSubtitle ? GAP_AFTER_TITLE + subtitleH : 0) + PAD_BOTTOM
  );
}

function buildTree({ layout, category, affiliate, pinTitle, pinSubtitle, photoDataUri, topPanelHeightB, logoDataUri, fontSize }) {
  const cat = CATEGORY_META[category] ?? CATEGORY_META.cuidados;
  const badges = [badgeNode(cat)];
  if (affiliate) badges.push(badgeNode(PUBLICIDADE_META));
  const badgeRow = h('div', { style: { display: 'flex', gap: 14 } }, badges);

  if (layout === 'A') {
    return h(
      'div',
      { style: { width: WIDTH, height: HEIGHT, display: 'flex', flexDirection: 'column', background: GREEN, fontFamily: 'Nunito' } },
      [
        h('img', { src: photoDataUri, width: WIDTH, height: PHOTO_HEIGHT_A }),
        h(
          'div',
          {
            style: {
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: `48px ${CONTENT_PADDING_X}px`,
            },
          },
          [
            h('div', { style: { display: 'flex', flexDirection: 'column' } }, [
              badgeRow,
              titleNode({ text: pinTitle, fontSize, color: '#FFFFFF' }),
              subtitleNode({ text: pinSubtitle, color: '#E6F4EC' }),
            ].filter(Boolean)),
            footerNode({ logoDataUri }),
          ]
        ),
      ]
    );
  }

  // Layout B
  return h(
    'div',
    { style: { width: WIDTH, height: HEIGHT, display: 'flex', flexDirection: 'column', background: LIGHT_BG, fontFamily: 'Nunito' } },
    [
      h(
        'div',
        { style: { height: topPanelHeightB, display: 'flex', flexDirection: 'column', padding: `48px ${CONTENT_PADDING_X}px 0` } },
        [
          badgeRow,
          titleNode({ text: pinTitle, fontSize, color: '#145C3F' }),
          subtitleNode({ text: pinSubtitle, color: '#1C2620' }),
        ].filter(Boolean)
      ),
      h('img', { src: photoDataUri, width: WIDTH, height: HEIGHT - topPanelHeightB - FOOTER_HEIGHT_B }),
      h(
        'div',
        { style: { height: FOOTER_HEIGHT_B, background: GREEN, display: 'flex', alignItems: 'center', padding: `0 ${CONTENT_PADDING_X}px` } },
        footerNode({ logoDataUri })
      ),
    ]
  );
}

// ---------- fontes e logo ----------

async function loadFonts() {
  const dir = path.join(ROOT, 'node_modules/@fontsource');
  const [poppinsBold, nunitoRegular] = await Promise.all([
    readFile(path.join(dir, 'poppins/files/poppins-latin-700-normal.woff')),
    readFile(path.join(dir, 'nunito/files/nunito-latin-400-normal.woff')),
  ]);
  return [
    { name: 'Poppins', data: poppinsBold, weight: 700, style: 'normal' },
    { name: 'Nunito', data: nunitoRegular, weight: 400, style: 'normal' },
  ];
}

async function loadLogoDataUri() {
  if (!existsSync(LOGO_PATH)) return null;
  const svg = await readFile(LOGO_PATH);
  const png = await sharp(svg).resize(96, 96).png().toBuffer();
  return `data:image/png;base64,${png.toString('base64')}`;
}

// ---------- processamento por post ----------

function layoutFor(slug) {
  const hash = createHash('sha256').update(slug).digest();
  return hash[0] % 2 === 0 ? 'A' : 'B';
}

async function processPost(file, { fonts, logoDataUri }) {
  const slug = path.basename(file, '.md');
  const raw = await readFile(path.join(BLOG_DIR, file), 'utf8');
  const data = parseFrontmatter(raw);

  if (!data) {
    console.warn(`[pins] ${slug}: frontmatter não encontrado, pulando.`);
    return false;
  }
  if (!data.heroImage) {
    console.warn(`[pins] ${slug}: sem heroImage no frontmatter, pulando.`);
    return false;
  }

  const layout = layoutFor(slug);
  const { title: pinTitle, subtitle: pinSubtitle } = deriveTitleSubtitle(data.title, data.pinTitle, data.pinSubtitle);
  const position = data.heroImagePosition || 'center';
  const fontSize = fitTitleFontSize(pinTitle, WIDTH - CONTENT_PADDING_X * 2);

  let topPanelHeightB;
  let photoBoxHeight;
  if (layout === 'A') {
    photoBoxHeight = PHOTO_HEIGHT_A;
  } else {
    topPanelHeightB = computeTopPanelHeightB(pinTitle, pinSubtitle, fontSize);
    photoBoxHeight = Math.max(300, HEIGHT - topPanelHeightB - FOOTER_HEIGHT_B);
  }

  let photoDataUri;
  try {
    let croppedBuffer;
    if (PLACEHOLDER) {
      croppedBuffer = await placeholderBuffer(WIDTH, photoBoxHeight);
    } else {
      const rawImage = await downloadImage(data.heroImage);
      croppedBuffer = await cropToBox(rawImage, WIDTH, photoBoxHeight, position);
    }
    photoDataUri = `data:image/png;base64,${croppedBuffer.toString('base64')}`;
  } catch (err) {
    console.warn(`[pins] ${slug}: falha ao obter/processar heroImage (${err.message}), pulando.`);
    return false;
  }

  const tree = buildTree({
    layout,
    category: data.category,
    affiliate: !!data.affiliate,
    pinTitle,
    pinSubtitle,
    photoDataUri,
    topPanelHeightB,
    logoDataUri,
    fontSize,
  });

  const svg = await satori(tree, { width: WIDTH, height: HEIGHT, fonts });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(path.join(OUT_DIR, `${slug}.png`), png);
  return true;
}

// ---------- main ----------

async function main() {
  if (!existsSync(BLOG_DIR)) {
    console.warn('[pins] src/content/blog/ não encontrado, nada a gerar.');
    return;
  }

  const fonts = await loadFonts();
  const logoDataUri = await loadLogoDataUri();
  const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith('.md'));

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    try {
      const ok = await processPost(file, { fonts, logoDataUri });
      if (ok) generated++;
      else skipped++;
    } catch (err) {
      console.warn(`[pins] ${file}: erro inesperado (${err.message}), pulando.`);
      skipped++;
    }
  }

  console.log(`[pins] Concluído: ${generated} gerado(s), ${skipped} pulado(s) de ${files.length} post(s).`);
}

main()
  .catch((err) => {
    console.error('[pins] Erro fatal no gerador de pins (ignorado, build continua):', err);
  })
  .finally(() => {
    process.exit(0);
  });
