#!/usr/bin/env node
/**
 * Download pinyin teaching audio:
 * - isolated initials/finals: zxq432/py d/py/ (b.mp3, a1.mp3, …)
 * - tone examples: mp3-chinese-pinyin-sound (ma1.mp3, …)
 *
 * Usage: node scripts/build-pinyin-audio.mjs [--force]
 */

import { readdirSync, unlinkSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const AUDIO_DIR = join(ROOT, 'audio', 'pinyin');
const PINYIN_JS = join(ROOT, 'js', 'pinyin.js');
const MANIFEST_OUT = join(AUDIO_DIR, 'manifest.json');

const ISOLATED_BASE =
  'https://raw.githubusercontent.com/zxq432/py/main/d/py/{key}.mp3';
const SYLLABLE_BASE =
  'https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3/{key}.mp3';
const SYLLABLE_FALLBACK =
  'https://raw.githubusercontent.com/hugolpz/audio-cmn/master/64k/syllabs/cmn-{key}.mp3';

const force = process.argv.includes('--force');

function parseManifest() {
  const text = readFileSync(PINYIN_JS, 'utf8');
  const entries = new Map();
  const re =
    /\{[^{}]*audio:\s*'([^']+\.mp3)'[^{}]*audioKey:\s*'([^']+)'[^{}]*audioSource:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const [, filename, audioKey, audioSource] = m;
    if (!entries.has(filename)) {
      entries.set(filename, { filename, audioKey, audioSource });
    }
  }
  return [...entries.values()];
}

async function tryDownload(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.length > 300 ? buf : null;
}

async function downloadItem(item, dest) {
  if (item.audioSource === 'isolated') {
    const data = await tryDownload(ISOLATED_BASE.replace('{key}', item.audioKey));
    if (data) {
      writeFileSync(dest, data);
      return 'zxq432-py-isolated';
    }
    return null;
  }

  for (const [url, source] of [
    [SYLLABLE_BASE.replace('{key}', item.audioKey), 'mp3-chinese-pinyin-sound'],
    [SYLLABLE_FALLBACK.replace('{key}', item.audioKey), 'audio-cmn-syllabs']
  ]) {
    const data = await tryDownload(url);
    if (data) {
      writeFileSync(dest, data);
      return source;
    }
  }
  return null;
}

function cleanOldAudio(keep) {
  if (!existsSync(AUDIO_DIR)) return;
  for (const file of readdirSync(AUDIO_DIR)) {
    if (!file.endsWith('.mp3')) continue;
    if (!keep.has(file)) unlinkSync(join(AUDIO_DIR, file));
  }
}

async function main() {
  mkdirSync(AUDIO_DIR, { recursive: true });
  const items = parseManifest();
  const keep = new Set(items.map(i => i.filename));
  if (force) cleanOldAudio(keep);

  console.log(`Building ${items.length} pinyin audio files -> ${AUDIO_DIR}`);

  const manifest = [];
  const failed = [];

  for (const item of items) {
    const dest = join(AUDIO_DIR, item.filename);
    let source = 'existing';

    if (!force && existsSync(dest) && statSync(dest).size > 300) {
      source = 'existing';
    } else {
      source = (await downloadItem(item, dest)) || 'missing';
      if (source === 'missing') failed.push(`${item.filename} (${item.audioKey})`);
    }

    manifest.push({ ...item, source });
  }

  const ok = manifest.filter(
    e => existsSync(join(AUDIO_DIR, e.filename)) && statSync(join(AUDIO_DIR, e.filename)).size > 300
  ).length;

  writeFileSync(
    MANIFEST_OUT,
    JSON.stringify(
      {
        total: manifest.length,
        ok,
        failed,
        note: 'Initials/finals: isolated clips; tones: ma syllable clips',
        files: manifest,
        attribution: {
          isolated: 'zxq432/py d/py/ — decomposed pinyin phonetics',
          syllable: 'davinfifield/mp3-chinese-pinyin-sound (Unlicense)'
        }
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`Done: ${ok}/${manifest.length} files ready`);
  if (failed.length) {
    console.error('Missing:', failed.join(', '));
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
