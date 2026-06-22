#!/usr/bin/env node
/** Check which hanzi have HSK audio in audio-cmn */
const HSK_BASE =
  'https://raw.githubusercontent.com/hugolpz/audio-cmn/master/64k/hsk/cmn-{hanzi}.mp3';

const items = [
  ['b', '波'], ['p', '坡'], ['m', '摸'], ['f', '发'], ['d', '德'], ['t', '特'],
  ['n', '那'], ['l', '拉'], ['g', '哥'], ['k', '科'], ['h', '喝'], ['j', '鸡'],
  ['q', '七'], ['x', '西'], ['zh', '知'], ['ch', '车'], ['sh', '诗'], ['r', '热'],
  ['z', '字'], ['c', '次'], ['s', '四'],
  ['a', '啊'], ['o', '哦'], ['e', '饿'], ['i', '一'], ['u', '乌'], ['v', '鱼'],
  ['ai', '爱'], ['ei', '诶'], ['ao', '熬'], ['ou', '欧'], ['an', '安'], ['en', '恩'], ['ang', '昂'],
  ['ma1', '妈'], ['ma2', '麻'], ['ma3', '马'], ['ma4', '骂'], ['ma5', '吗']
];

async function exists(hanzi) {
  const url = HSK_BASE.replace('{hanzi}', encodeURIComponent(hanzi));
  const res = await fetch(url, { method: 'HEAD' });
  return res.ok;
}

const missing = [];
for (const [id, hanzi] of items) {
  const ok = await exists(hanzi);
  console.log(`${ok ? 'OK' : 'MISS'} ${id} ${hanzi}`);
  if (!ok) missing.push({ id, hanzi });
}
console.log('\nMissing:', missing);
