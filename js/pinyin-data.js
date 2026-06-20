// Pinyin & tone teaching data
const PINYIN_TONES = [
  {
    tone: 1,
    label: 'Thanh 1',
    mark: '¯',
    pinyin: 'mā',
    hanzi: '妈',
    meaning: 'mẹ',
    pitch: '—',
    vietnamese: 'Cao, bằng, giữ nguyên (như hát một nốt)',
    tip: 'Ví dụ: mā (妈), bā (八), tā (他)'
  },
  {
    tone: 2,
    label: 'Thanh 2',
    mark: '´',
    pinyin: 'má',
    hanzi: '麻',
    meaning: 'gai',
    pitch: '／',
    vietnamese: 'Từ thấp lên cao (như hỏi "hả?")',
    tip: 'Ví dụ: má (麻), bá (白), nǐ (你)'
  },
  {
    tone: 3,
    label: 'Thanh 3',
    mark: 'ˇ',
    pinyin: 'mǎ',
    hanzi: '马',
    meaning: 'ngựa',
    pitch: '∨',
    vietnamese: 'Xuống rồi lên (như suy nghĩ "ừm...")',
    tip: 'Ví dụ: mǎ (马), hǎo (好), wǒ (我)'
  },
  {
    tone: 4,
    label: 'Thanh 4',
    mark: '`',
    pinyin: 'mà',
    hanzi: '骂',
    meaning: 'mắng',
    pitch: '＼',
    vietnamese: 'Từ cao xuống thấp, mạnh (như ra lệnh)',
    tip: 'Ví dụ: mà (骂), bù (不), shì (是)'
  },
  {
    tone: 5,
    label: 'Thanh nhẹ',
    mark: '',
    pinyin: 'ma',
    hanzi: '吗',
    meaning: 'không? (câu hỏi)',
    pitch: '·',
    vietnamese: 'Nhẹ, ngắn, không nhấn (thường ở cuối câu hỏi)',
    tip: 'Ví dụ: ma (吗), ne (呢), ba (吧)'
  }
];

const PINYIN_INITIALS = [
  { symbol: 'b', example: 'bō', hanzi: '波', vietnamese: 'như "b" trong bố' },
  { symbol: 'p', example: 'pá', hanzi: '爬', vietnamese: 'như "p" trong pa, có hơi' },
  { symbol: 'm', example: 'mā', hanzi: '妈', vietnamese: 'như "m" trong mẹ' },
  { symbol: 'f', example: 'fā', hanzi: '发', vietnamese: 'như "ph" trong phát' },
  { symbol: 'd', example: 'dà', hanzi: '大', vietnamese: 'như "d" trong da' },
  { symbol: 't', example: 'tā', hanzi: '他', vietnamese: 'như "t" trong ta' },
  { symbol: 'n', example: 'nǐ', hanzi: '你', vietnamese: 'như "n" trong ni' },
  { symbol: 'l', example: 'lái', hanzi: '来', vietnamese: 'như "l" trong lai' },
  { symbol: 'g', example: 'gē', hanzi: '哥', vietnamese: 'như "g" trong ga' },
  { symbol: 'k', example: 'kàn', hanzi: '看', vietnamese: 'như "k" trong ka, có hơi' },
  { symbol: 'h', example: 'hǎo', hanzi: '好', vietnamese: 'như "h" trong ha' },
  { symbol: 'j', example: 'jiā', hanzi: '家', vietnamese: 'như "gi" trong gia' },
  { symbol: 'q', example: 'qù', hanzi: '去', vietnamese: 'như "ch" trong chi, có hơi' },
  { symbol: 'x', example: 'xiè', hanzi: '谢', vietnamese: 'như "s" trong si' },
  { symbol: 'zh', example: 'zhōng', hanzi: '中', vietnamese: 'như "tr" trong trung' },
  { symbol: 'ch', example: 'chī', hanzi: '吃', vietnamese: 'như "tr" + hơi mạnh' },
  { symbol: 'sh', example: 'shì', hanzi: '是', vietnamese: 'như "s" trong shì' },
  { symbol: 'r', example: 'rén', hanzi: '人', vietnamese: 'như "r" trong rung' },
  { symbol: 'z', example: 'zài', hanzi: '在', vietnamese: 'như "dz" nhẹ' },
  { symbol: 'c', example: 'cài', hanzi: '菜', vietnamese: 'như "ts" + hơi' },
  { symbol: 's', example: 'sān', hanzi: '三', vietnamese: 'như "s" trong san' }
];

const PINYIN_FINALS = [
  { symbol: 'a', example: 'mā', hanzi: '妈', vietnamese: 'như "a" trong ba' },
  { symbol: 'o', example: 'wǒ', hanzi: '我', vietnamese: 'như "o" trong co' },
  { symbol: 'e', example: 'hē', hanzi: '喝', vietnamese: 'như "ơ" mở miệng' },
  { symbol: 'i', example: 'nǐ', hanzi: '你', vietnamese: 'như "i" trong ni' },
  { symbol: 'u', example: 'bù', hanzi: '不', vietnamese: 'như "u" trong bu' },
  { symbol: 'ü', example: 'nǚ', hanzi: '女', vietnamese: 'như "u" nhưng môi tròn' },
  { symbol: 'ai', example: 'lái', hanzi: '来', vietnamese: 'như "ai" trong lai' },
  { symbol: 'ei', example: 'mèi', hanzi: '妹', vietnamese: 'như "ây" ngắn' },
  { symbol: 'ao', example: 'hǎo', hanzi: '好', vietnamese: 'như "ao" trong cao' },
  { symbol: 'ou', example: 'kǒu', hanzi: '口', vietnamese: 'như "âu" ngắn' },
  { symbol: 'an', example: 'tā', hanzi: '他', vietnamese: 'như "an" trong tan' },
  { symbol: 'en', example: 'men', hanzi: '们', vietnamese: 'như "ân" ngắn' },
  { symbol: 'ang', example: 'bàng', hanzi: '帮', vietnamese: 'như "ang" trong bang' },
  { symbol: 'eng', example: 'shēng', hanzi: '生', vietnamese: 'như "âng" ngắn' },
  { symbol: 'ong', example: 'zhōng', hanzi: '中', vietnamese: 'như "ung" trong trung' }
];

const PINYIN_RULES = [
  {
    title: 'Pinyin là gì? 什么是拼音?',
    text: 'Pinyin là cách phiên âm tiếng Trung bằng chữ Latin. Giúp bạn đọc và phát âm đúng trước khi học chữ Hán.'
  },
  {
    title: 'Dấu thanh quan trọng!',
    text: 'Cùng một âm nhưng khác thanh = nghĩa khác hoàn toàn. Ví dụ: mā (mẹ) ≠ mǎ (ngựa) ≠ mà (mắng).'
  },
  {
    title: 'Cách đọc pinyin',
    text: 'Âm tiết = Phụ âm (声母) + Vần (韵母) + Thanh điệu. Ví dụ: n + ǐ + 3 = nǐ (你).'
  }
];
