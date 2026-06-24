// Standard Mandarin pinyin — tap-to-read teaching
// Initials/finals: isolated pinyin clips (zxq432/py d/py/)
// Tones: syllable clips (mp3-chinese-pinyin-sound)
const PINYIN_INITIAL_LABIAL_GROUPS = {
  bilabial: {
    label: '双唇音 · Bilabial',
    labelVi: 'Âm hai môi (b, p, m)'
  },
  labiodental: {
    label: '唇齿音 · Labiodental',
    labelVi: 'Âm môi-răng (f)'
  },
  non_labial: {
    label: '非唇音 · Non-labial',
    labelVi: 'Các âm còn lại'
  }
};

const PINYIN_FINAL_LIP_GROUPS = {
  rounded: {
    label: '圆唇韵母 · Rounded lips',
    labelVi: 'Vần tròn môi'
  },
  unrounded: {
    label: '不圆唇韵母 · Unrounded lips',
    labelVi: 'Vần không tròn môi'
  },
  mixed_special: {
    label: '特殊口型 · Mixed / special',
    labelVi: 'Vần có khẩu hình đặc biệt'
  }
};

// Isolated consonant audio: d/py/b.mp3 — reads "b" directly, not bo
const PINYIN_INITIALS = [
  { id: 'b', display: 'b', audio: 'initial-b.mp3', audioKey: 'b', audioSource: 'isolated', labialType: 'bilabial', tip: 'Âm b thuần' },
  { id: 'p', display: 'p', audio: 'initial-p.mp3', audioKey: 'p', audioSource: 'isolated', labialType: 'bilabial', tip: 'Âm p thuần' },
  { id: 'm', display: 'm', audio: 'initial-m.mp3', audioKey: 'm', audioSource: 'isolated', labialType: 'bilabial', tip: 'Âm m thuần' },
  { id: 'f', display: 'f', audio: 'initial-f.mp3', audioKey: 'f', audioSource: 'isolated', labialType: 'labiodental', tip: 'Âm f thuần' },
  { id: 'd', display: 'd', audio: 'initial-d.mp3', audioKey: 'd', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm d thuần' },
  { id: 't', display: 't', audio: 'initial-t.mp3', audioKey: 't', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm t thuần' },
  { id: 'n', display: 'n', audio: 'initial-n.mp3', audioKey: 'n', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm n thuần' },
  { id: 'l', display: 'l', audio: 'initial-l.mp3', audioKey: 'l', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm l thuần' },
  { id: 'g', display: 'g', audio: 'initial-g.mp3', audioKey: 'g', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm g thuần' },
  { id: 'k', display: 'k', audio: 'initial-k.mp3', audioKey: 'k', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm k thuần' },
  { id: 'h', display: 'h', audio: 'initial-h.mp3', audioKey: 'h', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm h thuần' },
  { id: 'j', display: 'j', audio: 'initial-j.mp3', audioKey: 'j', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm j thuần' },
  { id: 'q', display: 'q', audio: 'initial-q.mp3', audioKey: 'q', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm q thuần' },
  { id: 'x', display: 'x', audio: 'initial-x.mp3', audioKey: 'x', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm x thuần' },
  { id: 'zh', display: 'zh', audio: 'initial-zh.mp3', audioKey: 'zh', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm zh thuần' },
  { id: 'ch', display: 'ch', audio: 'initial-ch.mp3', audioKey: 'ch', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm ch thuần' },
  { id: 'sh', display: 'sh', audio: 'initial-sh.mp3', audioKey: 'sh', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm sh thuần' },
  { id: 'r', display: 'r', audio: 'initial-r.mp3', audioKey: 'r', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm r thuần' },
  { id: 'z', display: 'z', audio: 'initial-z.mp3', audioKey: 'z', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm z thuần' },
  { id: 'c', display: 'c', audio: 'initial-c.mp3', audioKey: 'c', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm c thuần' },
  { id: 's', display: 's', audio: 'initial-s.mp3', audioKey: 's', audioSource: 'isolated', labialType: 'non_labial', tip: 'Âm s thuần' }
];

// Isolated final audio: d/py/a1.mp3 — pure final with tone 1
const PINYIN_FINALS = [
  { id: 'a', display: 'a', example: 'ā', audio: 'final-a1.mp3', audioKey: 'a1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'Âm a thuần' },
  { id: 'o', display: 'o', example: 'ō', audio: 'final-o1.mp3', audioKey: 'o1', audioSource: 'isolated', lipShapeType: 'rounded', tip: 'Âm o thuần' },
  { id: 'e', display: 'e', example: 'ē', audio: 'final-e1.mp3', audioKey: 'e1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'Âm e thuần' },
  { id: 'i', display: 'i', example: 'ī', audio: 'final-i1.mp3', audioKey: 'i1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'Âm i thuần' },
  { id: 'u', display: 'u', example: 'ū', audio: 'final-u1.mp3', audioKey: 'u1', audioSource: 'isolated', lipShapeType: 'rounded', tip: 'Âm u thuần' },
  { id: 'v', display: 'ü', example: 'ǖ', audio: 'final-v1.mp3', audioKey: 'v1', audioSource: 'isolated', lipShapeType: 'rounded', tip: 'Âm ü thuần' },

  { id: 'ai', display: 'ai', example: 'āi', audio: 'final-ai1.mp3', audioKey: 'ai1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'a + i' },
  { id: 'ei', display: 'ei', example: 'ēi', audio: 'final-ei1.mp3', audioKey: 'ei1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'e + i' },
  { id: 'ao', display: 'ao', example: 'āo', audio: 'final-ao1.mp3', audioKey: 'ao1', audioSource: 'isolated', lipShapeType: 'rounded', tip: 'a + o' },
  { id: 'ou', display: 'ou', example: 'ōu', audio: 'final-ou1.mp3', audioKey: 'ou1', audioSource: 'isolated', lipShapeType: 'rounded', tip: 'o + u' },

  { id: 'an', display: 'an', example: 'ān', audio: 'final-an1.mp3', audioKey: 'an1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'a + n' },
  { id: 'en', display: 'en', example: 'ēn', audio: 'final-en1.mp3', audioKey: 'en1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'e + n' },
  { id: 'ang', display: 'ang', example: 'āng', audio: 'final-ang1.mp3', audioKey: 'ang1', audioSource: 'isolated', lipShapeType: 'unrounded', tip: 'a + ng' }
];

const PINYIN_TONES = [
  { id: 1, display: 'mā', example: 'mā', mark: 'Thanh 1 · 第一声', audio: 'tone-ma1.mp3', audioKey: 'ma1', audioSource: 'syllable', tip: 'Cao, phẳng' },
  { id: 2, display: 'má', example: 'má', mark: 'Thanh 2 · 第二声', audio: 'tone-ma2.mp3', audioKey: 'ma2', audioSource: 'syllable', tip: 'Cao, lên' },
  { id: 3, display: 'mǎ', example: 'mǎ', mark: 'Thanh 3 · 第三声', audio: 'tone-ma3.mp3', audioKey: 'ma3', audioSource: 'syllable', tip: 'Thấp rồi lên' },
  { id: 4, display: 'mà', example: 'mà', mark: 'Thanh 4 · 第四声', audio: 'tone-ma4.mp3', audioKey: 'ma4', audioSource: 'syllable', tip: 'Cao, xuống' }
];

function getPinyinAudioManifest() {
  const entries = new Map();

  function add(item, category) {
    if (!item.audio || entries.has(item.audio)) return;
    entries.set(item.audio, {
      filename: item.audio,
      audioKey: item.audioKey,
      audioSource: item.audioSource,
      category
    });
  }

  PINYIN_INITIALS.forEach(item => add(item, 'initial'));
  PINYIN_FINALS.forEach(item => add(item, 'final'));
  PINYIN_TONES.forEach(item => add(item, 'tone'));

  return [...entries.values()];
}
