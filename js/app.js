// HSK1 Chinese Learning App
(function () {
  'use strict';

  const STORAGE_KEY = 'hsk1-learned-words';
  let learnedWords = loadLearned();
  let pronounceIndex = 0;
  let quizState = null;
  let chineseVoice = null;

  // --- Speech ---
  function initSpeech() {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      chineseVoice =
        voices.find(v => v.lang === 'zh-CN') ||
        voices.find(v => v.lang.startsWith('zh')) ||
        null;
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text, rate = 0.85) {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ phát âm. Hãy thử Chrome hoặc Edge.');
      return;
    }

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = rate;
    if (chineseVoice) utterance.voice = chineseVoice;
    speechSynthesis.speak(utterance);
    return utterance;
  }

  function flashAudioBtn(btn) {
    if (!btn) return;
    btn.classList.add('playing');
    setTimeout(() => btn.classList.remove('playing'), 800);
  }

  // --- Storage ---
  function loadLearned() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  }

  function saveLearned() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...learnedWords]));
    updateProgressBadge();
  }

  function updateProgressBadge() {
    const el = document.getElementById('learned-count');
    if (el) el.textContent = learnedWords.size;
  }

  // --- Navigation ---
  function showSection(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    const section = document.getElementById(name);
    const btn = document.querySelector(`.nav-btn[data-section="${name}"]`);
    if (section) section.classList.add('active');
    if (btn) btn.classList.add('active');
  }

  function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => showSection(btn.dataset.section));
    });

    document.querySelectorAll('[data-goto]').forEach(btn => {
      btn.addEventListener('click', () => showSection(btn.dataset.goto));
    });
  }

  // --- Vocabulary grid ---
  function renderVocabGrid(filter = '') {
    const grid = document.getElementById('vocab-grid');
    if (!grid) return;

    const q = filter.toLowerCase().trim();
    const filtered = q
      ? HSK1_VOCABULARY.filter(
          w =>
            w.hanzi.includes(q) ||
            w.pinyin.toLowerCase().includes(q) ||
            w.vietnamese.toLowerCase().includes(q)
        )
      : HSK1_VOCABULARY;

    grid.innerHTML = filtered
      .map(
        (word, i) => `
      <div class="vocab-card ${learnedWords.has(word.hanzi) ? 'learned' : ''}" data-index="${HSK1_VOCABULARY.indexOf(word)}">
        <button class="learn-btn ${learnedWords.has(word.hanzi) ? 'learned' : ''}" data-hanzi="${word.hanzi}" title="Đánh dấu đã nhớ">✓</button>
        <div class="hanzi">${word.hanzi}</div>
        <div class="pinyin">${word.pinyin}</div>
        <div class="vietnamese">${word.vietnamese}</div>
      </div>
    `
      )
      .join('');

    grid.querySelectorAll('.vocab-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.classList.contains('learn-btn')) return;
        const idx = parseInt(card.dataset.index, 10);
        speak(HSK1_VOCABULARY[idx].hanzi);
      });
    });

    grid.querySelectorAll('.learn-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const hanzi = btn.dataset.hanzi;
        if (learnedWords.has(hanzi)) {
          learnedWords.delete(hanzi);
        } else {
          learnedWords.add(hanzi);
        }
        saveLearned();
        renderVocabGrid(document.getElementById('search-input')?.value || '');
      });
    });
  }

  function setupSearch() {
    const input = document.getElementById('search-input');
    if (input) {
      input.addEventListener('input', () => renderVocabGrid(input.value));
    }
  }

  // --- Pronunciation ---
  function updatePronounceCard() {
    const word = HSK1_VOCABULARY[pronounceIndex];
    document.getElementById('pronounce-index').textContent = pronounceIndex + 1;
    document.getElementById('pronounce-hanzi').textContent = word.hanzi;
    document.getElementById('pronounce-pinyin').textContent = word.pinyin;
    document.getElementById('pronounce-vietnamese').textContent = word.vietnamese;
  }

  function setupPronounce() {
    updatePronounceCard();

    document.getElementById('btn-listen')?.addEventListener('click', e => {
      speak(HSK1_VOCABULARY[pronounceIndex].hanzi, 0.85);
      flashAudioBtn(e.currentTarget);
    });

    document.getElementById('btn-slow')?.addEventListener('click', e => {
      speak(HSK1_VOCABULARY[pronounceIndex].hanzi, 0.55);
      flashAudioBtn(e.currentTarget);
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
      pronounceIndex = (pronounceIndex - 1 + HSK1_VOCABULARY.length) % HSK1_VOCABULARY.length;
      updatePronounceCard();
    });

    document.getElementById('btn-next')?.addEventListener('click', () => {
      pronounceIndex = (pronounceIndex + 1) % HSK1_VOCABULARY.length;
      updatePronounceCard();
    });
  }

  // --- Quiz ---
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getRandomWords(count, exclude) {
    const pool = HSK1_VOCABULARY.filter(w => w.hanzi !== exclude);
    return shuffle(pool).slice(0, count);
  }

  function startQuiz() {
    quizState = {
      score: 0,
      current: 0,
      total: 10,
      questions: shuffle(HSK1_VOCABULARY).slice(0, 10)
    };

    document.getElementById('quiz-area').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    showQuizQuestion();
  }

  function showQuizQuestion() {
    const q = quizState.questions[quizState.current];
    const wrongOptions = getRandomWords(3, q.hanzi);
    const options = shuffle([q, ...wrongOptions]);

    document.getElementById('quiz-score').textContent = quizState.score;
    document.getElementById('quiz-question-num').textContent = quizState.current + 1;
    document.getElementById('quiz-hanzi').textContent = q.hanzi;
    document.getElementById('quiz-pinyin').textContent = q.pinyin;

    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('btn-quiz-next');
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');

    const optionsEl = document.getElementById('quiz-options');
    optionsEl.innerHTML = options
      .map(
        opt => `
      <button class="quiz-option" data-hanzi="${opt.hanzi}" data-correct="${opt.hanzi === q.hanzi}">
        ${opt.vietnamese}
      </button>
    `
      )
      .join('');

    optionsEl.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => handleQuizAnswer(btn, q));
    });
  }

  function handleQuizAnswer(btn, correctWord) {
    const isCorrect = btn.dataset.correct === 'true';
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('btn-quiz-next');

    document.querySelectorAll('.quiz-option').forEach(b => {
      b.disabled = true;
      if (b.dataset.correct === 'true') b.classList.add('correct');
      else if (b === btn && !isCorrect) b.classList.add('wrong');
    });

    if (isCorrect) {
      quizState.score++;
      document.getElementById('quiz-score').textContent = quizState.score;
      feedback.textContent = '✅ Đúng rồi! 太棒了!';
      feedback.className = 'quiz-feedback correct';
    } else {
      feedback.textContent = `❌ Sai rồi. Đáp án: ${correctWord.vietnamese}`;
      feedback.className = 'quiz-feedback wrong';
    }

    feedback.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
  }

  function setupQuiz() {
    document.getElementById('btn-quiz-listen')?.addEventListener('click', () => {
      if (quizState && quizState.questions[quizState.current]) {
        speak(quizState.questions[quizState.current].hanzi);
      }
    });

    document.getElementById('btn-quiz-next')?.addEventListener('click', () => {
      quizState.current++;
      if (quizState.current >= quizState.total) {
        showQuizResult();
      } else {
        showQuizQuestion();
      }
    });

    document.getElementById('btn-restart-quiz')?.addEventListener('click', startQuiz);

    startQuiz();
  }

  function showQuizResult() {
    document.getElementById('quiz-area').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('final-score').textContent = quizState.score;

    const msg = document.getElementById('result-message');
    if (quizState.score >= 9) {
      msg.textContent = 'Xuất sắc! Bạn học rất giỏi! 🌟';
    } else if (quizState.score >= 7) {
      msg.textContent = 'Tốt lắm! Tiếp tục luyện tập nhé! 💪';
    } else if (quizState.score >= 5) {
      msg.textContent = 'Khá ổn! Hãy ôn thêm một chút nhé 📚';
    } else {
      msg.textContent = 'Đừng nản! Học từng chút một là được 🌱';
    }
  }

  // --- Init ---
  function init() {
    initSpeech();
    setupNavigation();
    renderVocabGrid();
    setupSearch();
    setupPronounce();
    setupQuiz();
    updateProgressBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
