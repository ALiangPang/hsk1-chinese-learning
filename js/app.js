// HSK1 Chinese Learning App
(function () {
  "use strict";

  const STORAGE_KEY = "hsk1-learned-words";
  const SENTENCE_SETTINGS_KEY = "hsk1-sentence-settings";
  const SENTENCE_MASTERED_KEY = "hsk1-sentence-mastered";
  const SENTENCE_PROGRESS_KEY = "hsk1-sentence-progress";
  const SENTENCE_LAST_SCORE_KEY = "hsk1-sentence-last-score";
  const DEFAULT_SPEECH_RATE = 0.65;
  const SLOW_SPEECH_RATE = 0.45;

  const sentencePool = HSK1_SENTENCE_COURSES.flatMap(course =>
    course.sentences.map((sentence, index) => ({
      ...sentence,
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      sentenceId: `${course.courseId}:${index}`
    }))
  );

  let learnedWords = loadLearned();
  let sentenceMastered = loadSentenceMastered();
  let sentenceProgress = loadSentenceProgress();
  let sentenceSettings = loadSentenceSettings();
  let sentenceShowMeaning = false;
  let pronounceIndex = 0;
  let quizState = null;
  let sentenceQuizState = null;
  let chineseVoice = null;
  let currentPinyinAudio = null;
  let playingPinyinCard = null;
  let activePinyinTab = "initials";

  function speak(text, rate = DEFAULT_SPEECH_RATE) {
    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = rate;
    const voice = getChineseVoice();
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }

  function initSpeech() {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      chineseVoice = voices.find(v => v.lang === "zh-CN") || voices.find(v => v.lang.startsWith("zh")) || null;
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }

  function getChineseVoice() {
    const voices = speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === "zh-CN") ||
      voices.find(v => v.lang.startsWith("zh") && !/tw|hk|mo/i.test(v.lang)) ||
      chineseVoice
    );
  }

  function flashAudioBtn(btn) {
    if (!btn) return;
    btn.classList.add("playing");
    setTimeout(() => btn.classList.remove("playing"), 800);
  }

  function showPinyinAudioError(show) {
    const el = document.getElementById("pinyin-audio-error");
    if (el) el.classList.toggle("hidden", !show);
  }

  function clearPlayingPinyinCard() {
    if (playingPinyinCard) {
      playingPinyinCard.classList.remove("playing");
      playingPinyinCard = null;
    }
  }

  function playPinyinAudio(filename, cardEl) {
    if (currentPinyinAudio) {
      currentPinyinAudio.pause();
      currentPinyinAudio = null;
    }
    clearPlayingPinyinCard();
    showPinyinAudioError(false);

    const audio = new Audio(`audio/pinyin/${filename}`);
    currentPinyinAudio = audio;

    if (cardEl) {
      playingPinyinCard = cardEl;
      cardEl.classList.add("playing");
    }

    const cleanup = () => {
      if (currentPinyinAudio === audio) currentPinyinAudio = null;
      clearPlayingPinyinCard();
    };

    audio.addEventListener("ended", cleanup);
    audio.addEventListener("pause", () => {
      if (audio.ended) return;
      cleanup();
    });

    audio.play().catch(() => {
      cleanup();
      showPinyinAudioError(true);
    });

    return audio;
  }

  function renderPinyinCard(item, options = {}) {
    const toneMark = options.toneMark ? `<div class="pinyin-tone-mark">${item.mark}</div>` : "";
    const example = item.example ? `<div class="pinyin-example">${item.example}</div>` : "";
    const tip = item.tip ? `<div class="pinyin-tip">${item.tip}</div>` : "";

    return `
      <button type="button" class="pinyin-card" data-audio="${item.audio}" aria-label="Nghe ${item.display}">
        <div class="pinyin-display">${item.display}</div>
        ${toneMark}
        ${example}
        ${tip}
      </button>
    `;
  }

  function bindPinyinCards(container) {
    if (!container) return;
    container.querySelectorAll(".pinyin-card").forEach(card => {
      card.addEventListener("click", () => {
        playPinyinAudio(card.dataset.audio, card);
      });
    });
  }

  function renderGroupedPinyin(items, groupDefs, groupOrder, groupField) {
    const seenAudio = new Set();
    let html = "";

    groupOrder.forEach(groupKey => {
      const groupItems = items.filter(item => {
        if (item[groupField] !== groupKey) return false;
        if (seenAudio.has(item.audio)) return false;
        seenAudio.add(item.audio);
        return true;
      });
      if (!groupItems.length) return;

      const group = groupDefs[groupKey];
      html += `
        <div class="pinyin-group-block">
          <p class="pinyin-group-title">${group.label}</p>
          <p class="pinyin-group-subtitle">${group.labelVi}</p>
          <div class="pinyin-grid">${groupItems.map(item => renderPinyinCard(item)).join("")}</div>
        </div>
      `;
    });

    return html;
  }

  function renderPinyinInitials() {
    const panel = document.getElementById("pinyin-panel-initials");
    if (!panel) return;

    const groupOrder = ["bilabial", "labiodental", "non_labial"];
    panel.innerHTML = renderGroupedPinyin(
      PINYIN_INITIALS,
      PINYIN_INITIAL_LABIAL_GROUPS,
      groupOrder,
      "labialType"
    );
    bindPinyinCards(panel);
  }

  function renderPinyinFinals() {
    const panel = document.getElementById("pinyin-panel-finals");
    if (!panel) return;

    const groupOrder = ["rounded", "unrounded", "mixed_special"];
    panel.innerHTML = renderGroupedPinyin(
      PINYIN_FINALS,
      PINYIN_FINAL_LIP_GROUPS,
      groupOrder,
      "lipShapeType"
    );
    bindPinyinCards(panel);
  }

  function renderPinyinTones() {
    const panel = document.getElementById("pinyin-panel-tones");
    if (!panel) return;

    panel.innerHTML = `
      <p class="pinyin-group-title">4 thanh điệu · 声调 (ví dụ: ma)</p>
      <div class="pinyin-grid">
        ${PINYIN_TONES.map(item => renderPinyinCard(item, { toneMark: true })).join("")}
      </div>
    `;
    bindPinyinCards(panel);
  }

  function switchPinyinTab(tab) {
    activePinyinTab = tab;

    document.querySelectorAll(".pinyin-tab").forEach(btn => {
      const isActive = btn.dataset.pinyinTab === tab;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    document.querySelectorAll(".pinyin-panel").forEach(panel => {
      panel.classList.toggle("active", panel.id === `pinyin-panel-${tab}`);
    });
  }

  function setupPinyin() {
    renderPinyinInitials();
    renderPinyinFinals();
    renderPinyinTones();

    document.querySelectorAll(".pinyin-tab").forEach(btn => {
      btn.addEventListener("click", () => switchPinyinTab(btn.dataset.pinyinTab));
    });
  }

  // --- Storage ---
  function loadLearned() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function saveLearned() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...learnedWords]));
    updateProgressBadge();
  }

  function loadSentenceMastered() {
    try {
      return new Set(JSON.parse(localStorage.getItem(SENTENCE_MASTERED_KEY) || "[]"));
    } catch {
      return new Set();
    }
  }

  function saveSentenceMastered() {
    localStorage.setItem(SENTENCE_MASTERED_KEY, JSON.stringify([...sentenceMastered]));
  }

  function loadSentenceProgress() {
    try {
      return JSON.parse(localStorage.getItem(SENTENCE_PROGRESS_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveSentenceProgress() {
    localStorage.setItem(SENTENCE_PROGRESS_KEY, JSON.stringify(sentenceProgress));
  }

  function loadSentenceSettings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SENTENCE_SETTINGS_KEY) || "{}");
      return {
        mode: parsed.mode === "random" ? "random" : "course",
        courseId: parsed.courseId || HSK1_SENTENCE_COURSES[0]?.courseId || ""
      };
    } catch {
      return {
        mode: "course",
        courseId: HSK1_SENTENCE_COURSES[0]?.courseId || ""
      };
    }
  }

  function saveSentenceSettings() {
    localStorage.setItem(SENTENCE_SETTINGS_KEY, JSON.stringify(sentenceSettings));
  }

  function updateProgressBadge() {
    const el = document.getElementById("learned-count");
    if (el) el.textContent = learnedWords.size;
  }

  // --- Navigation ---
  function showSection(name) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));

    const section = document.getElementById(name);
    const btn = document.querySelector(`.nav-btn[data-section="${name}"]`);
    if (section) section.classList.add("active");
    if (btn) btn.classList.add("active");

    if (window.HSK1Surprise) {
      window.HSK1Surprise.setActiveSection(name);
    }
  }

  function setupNavigation() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
      btn.addEventListener("click", () => showSection(btn.dataset.section));
    });

    document.querySelectorAll("[data-goto]").forEach(btn => {
      btn.addEventListener("click", () => showSection(btn.dataset.goto));
    });
  }

  // --- Vocabulary grid ---
  function renderVocabGrid(filter = "") {
    const grid = document.getElementById("vocab-grid");
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
        word => `
      <div class="vocab-card ${learnedWords.has(word.hanzi) ? "learned" : ""}" data-index="${HSK1_VOCABULARY.indexOf(word)}">
        <button class="learn-btn ${learnedWords.has(word.hanzi) ? "learned" : ""}" data-hanzi="${word.hanzi}" title="Đánh dấu đã nhớ">✓</button>
        <div class="hanzi">${word.hanzi}</div>
        <div class="pinyin">${word.pinyin}</div>
        <div class="vietnamese">${word.vietnamese}</div>
      </div>
    `
      )
      .join("");

    grid.querySelectorAll(".vocab-card").forEach(card => {
      card.addEventListener("click", e => {
        if (e.target.classList.contains("learn-btn")) return;
        const idx = parseInt(card.dataset.index, 10);
        speak(HSK1_VOCABULARY[idx].hanzi);
      });
    });

    grid.querySelectorAll(".learn-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        const hanzi = btn.dataset.hanzi;
        if (learnedWords.has(hanzi)) learnedWords.delete(hanzi);
        else learnedWords.add(hanzi);

        saveLearned();
        renderVocabGrid(document.getElementById("search-input")?.value || "");
      });
    });
  }

  function setupSearch() {
    const input = document.getElementById("search-input");
    if (input) {
      input.addEventListener("input", () => renderVocabGrid(input.value));
    }
  }

  // --- Sentence learning ---
  function getActiveCourse() {
    const current = HSK1_SENTENCE_COURSES.find(course => course.courseId === sentenceSettings.courseId);
    if (current) return current;
    return HSK1_SENTENCE_COURSES[0];
  }

  function getCurrentSentenceIndex() {
    const activeCourse = getActiveCourse();
    const max = Math.max(activeCourse.sentences.length - 1, 0);
    const stored = Number(sentenceProgress[sentenceSettings.courseId] || 0);
    return Math.min(Math.max(stored, 0), max);
  }

  function setCurrentSentenceIndex(index) {
    const activeCourse = getActiveCourse();
    const max = Math.max(activeCourse.sentences.length - 1, 0);
    const safe = Math.min(Math.max(index, 0), max);
    sentenceProgress[sentenceSettings.courseId] = safe;
    saveSentenceProgress();
  }

  function getCurrentSentence() {
    const activeCourse = getActiveCourse();
    const idx = getCurrentSentenceIndex();
    return {
      ...activeCourse.sentences[idx],
      sentenceId: `${activeCourse.courseId}:${idx}`
    };
  }

  function renderSentenceCourseView() {
    const activeCourse = getActiveCourse();
    const sentence = getCurrentSentence();
    const index = getCurrentSentenceIndex();
    const isMastered = sentenceMastered.has(sentence.sentenceId);

    const select = document.getElementById("sentence-course-select");
    if (select) select.value = activeCourse.courseId;

    const indexEl = document.getElementById("sentence-index");
    const totalEl = document.getElementById("sentence-total");
    const hanziEl = document.getElementById("sentence-hanzi");
    const pinyinEl = document.getElementById("sentence-pinyin");
    const translationEl = document.getElementById("sentence-translation");
    const masteredBtn = document.getElementById("btn-sentence-mastered");
    const toggleMeaningBtn = document.getElementById("btn-sentence-toggle-meaning");

    if (indexEl) indexEl.textContent = index + 1;
    if (totalEl) totalEl.textContent = activeCourse.sentences.length;
    if (hanziEl) hanziEl.textContent = sentence.hanzi;
    if (pinyinEl) pinyinEl.textContent = sentence.pinyin;
    if (translationEl) {
      translationEl.textContent = sentence.translation;
      translationEl.classList.toggle("hidden", !sentenceShowMeaning);
    }
    if (toggleMeaningBtn) {
      toggleMeaningBtn.textContent = sentenceShowMeaning ? "Ẩn nghĩa" : "Hiện nghĩa";
    }
    if (masteredBtn) {
      masteredBtn.classList.toggle("learned", isMastered);
      masteredBtn.textContent = isMastered ? "✓ Đã nhớ câu này" : "✓ Đánh dấu đã nhớ";
    }
  }

  function setSentenceMode(mode) {
    sentenceSettings.mode = mode === "random" ? "random" : "course";
    saveSentenceSettings();

    const isCourse = sentenceSettings.mode === "course";
    document.querySelectorAll(".sentence-mode-btn").forEach(btn => {
      const active = btn.dataset.sentenceMode === sentenceSettings.mode;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    document.getElementById("sentence-course-view")?.classList.toggle("active", isCourse);
    document.getElementById("sentence-random-view")?.classList.toggle("active", !isCourse);
  }

  function getRandomSentences(count, excludeId) {
    const pool = sentencePool.filter(item => item.sentenceId !== excludeId);
    return shuffle(pool).slice(0, count);
  }

  function startSentenceQuiz() {
    const total = Math.min(10, sentencePool.length);
    sentenceQuizState = {
      score: 0,
      current: 0,
      total,
      questions: shuffle(sentencePool).slice(0, total)
    };

    document.getElementById("sentence-quiz-area")?.classList.remove("hidden");
    document.getElementById("sentence-quiz-result")?.classList.add("hidden");
    showSentenceQuizQuestion();
  }

  function showSentenceQuizQuestion() {
    const question = sentenceQuizState.questions[sentenceQuizState.current];
    const wrongOptions = getRandomSentences(3, question.sentenceId);
    const options = shuffle([question, ...wrongOptions]);

    document.getElementById("sentence-quiz-score").textContent = sentenceQuizState.score;
    document.getElementById("sentence-quiz-num").textContent = sentenceQuizState.current + 1;
    document.getElementById("sentence-quiz-hanzi").textContent = question.hanzi;
    document.getElementById("sentence-quiz-pinyin").textContent = question.pinyin;

    const feedback = document.getElementById("sentence-quiz-feedback");
    const nextBtn = document.getElementById("btn-sentence-quiz-next");
    feedback.classList.add("hidden");
    nextBtn.classList.add("hidden");

    const optionsEl = document.getElementById("sentence-quiz-options");
    optionsEl.innerHTML = options
      .map(
        opt => `
      <button class="quiz-option" data-sentence-id="${opt.sentenceId}" data-correct="${opt.sentenceId === question.sentenceId}">
        ${opt.translation}
      </button>
    `
      )
      .join("");

    optionsEl.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => handleSentenceQuizAnswer(btn, question));
    });
  }

  function handleSentenceQuizAnswer(btn, question) {
    const isCorrect = btn.dataset.correct === "true";
    const feedback = document.getElementById("sentence-quiz-feedback");
    const nextBtn = document.getElementById("btn-sentence-quiz-next");

    document.querySelectorAll("#sentence-quiz-options .quiz-option").forEach(optionBtn => {
      optionBtn.disabled = true;
      if (optionBtn.dataset.correct === "true") optionBtn.classList.add("correct");
      else if (optionBtn === btn && !isCorrect) optionBtn.classList.add("wrong");
    });

    if (isCorrect) {
      sentenceQuizState.score++;
      document.getElementById("sentence-quiz-score").textContent = sentenceQuizState.score;
      feedback.textContent = "✅ Chính xác! Câu này bạn nhớ tốt rồi.";
      feedback.className = "quiz-feedback correct";
    } else {
      feedback.textContent = `❌ Chưa đúng. Đáp án: ${question.translation}`;
      feedback.className = "quiz-feedback wrong";
    }

    feedback.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
  }

  function showSentenceQuizResult() {
    document.getElementById("sentence-quiz-area")?.classList.add("hidden");
    document.getElementById("sentence-quiz-result")?.classList.remove("hidden");
    document.getElementById("sentence-final-score").textContent = sentenceQuizState.score;
    localStorage.setItem(SENTENCE_LAST_SCORE_KEY, String(sentenceQuizState.score));

    const message = document.getElementById("sentence-result-message");
    if (sentenceQuizState.score >= 9) message.textContent = "Xuất sắc! Bạn đã làm chủ phần lớn câu HSK1.";
    else if (sentenceQuizState.score >= 7) message.textContent = "Rất tốt! Tiếp tục luyện để đạt điểm tối đa.";
    else if (sentenceQuizState.score >= 5) message.textContent = "Khá ổn! Ôn thêm theo từng bài sẽ tiến bộ nhanh.";
    else message.textContent = "Không sao, luyện thêm vài lượt nữa là nhớ tốt hơn.";
  }

  function setupSentenceLearning() {
    const select = document.getElementById("sentence-course-select");
    if (!select) return;

    select.innerHTML = HSK1_SENTENCE_COURSES.map(
      course => `<option value="${course.courseId}">${course.courseTitle}</option>`
    ).join("");

    document.querySelectorAll(".sentence-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => setSentenceMode(btn.dataset.sentenceMode));
    });

    select.addEventListener("change", () => {
      sentenceSettings.courseId = select.value;
      if (typeof sentenceProgress[sentenceSettings.courseId] !== "number") {
        sentenceProgress[sentenceSettings.courseId] = 0;
      }
      sentenceShowMeaning = false;
      saveSentenceSettings();
      saveSentenceProgress();
      renderSentenceCourseView();
    });

    document.getElementById("btn-sentence-prev")?.addEventListener("click", () => {
      const course = getActiveCourse();
      const current = getCurrentSentenceIndex();
      const next = (current - 1 + course.sentences.length) % course.sentences.length;
      sentenceShowMeaning = false;
      setCurrentSentenceIndex(next);
      renderSentenceCourseView();
    });

    document.getElementById("btn-sentence-next")?.addEventListener("click", () => {
      const course = getActiveCourse();
      const current = getCurrentSentenceIndex();
      const next = (current + 1) % course.sentences.length;
      sentenceShowMeaning = false;
      setCurrentSentenceIndex(next);
      renderSentenceCourseView();
    });

    document.getElementById("btn-sentence-listen")?.addEventListener("click", e => {
      const current = getCurrentSentence();
      speak(current.hanzi, DEFAULT_SPEECH_RATE);
      flashAudioBtn(e.currentTarget);
    });

    document.getElementById("btn-sentence-toggle-meaning")?.addEventListener("click", () => {
      sentenceShowMeaning = !sentenceShowMeaning;
      renderSentenceCourseView();
    });

    document.getElementById("btn-sentence-mastered")?.addEventListener("click", () => {
      const current = getCurrentSentence();
      if (sentenceMastered.has(current.sentenceId)) sentenceMastered.delete(current.sentenceId);
      else sentenceMastered.add(current.sentenceId);
      saveSentenceMastered();
      renderSentenceCourseView();
    });

    document.getElementById("btn-sentence-quiz-listen")?.addEventListener("click", e => {
      if (!sentenceQuizState || !sentenceQuizState.questions[sentenceQuizState.current]) return;
      speak(sentenceQuizState.questions[sentenceQuizState.current].hanzi, DEFAULT_SPEECH_RATE);
      flashAudioBtn(e.currentTarget);
    });

    document.getElementById("btn-sentence-quiz-next")?.addEventListener("click", () => {
      sentenceQuizState.current++;
      if (sentenceQuizState.current >= sentenceQuizState.total) showSentenceQuizResult();
      else showSentenceQuizQuestion();
    });

    document.getElementById("btn-sentence-restart")?.addEventListener("click", startSentenceQuiz);

    if (!HSK1_SENTENCE_COURSES.some(course => course.courseId === sentenceSettings.courseId)) {
      sentenceSettings.courseId = HSK1_SENTENCE_COURSES[0]?.courseId || "";
      saveSentenceSettings();
    }
    if (typeof sentenceProgress[sentenceSettings.courseId] !== "number") {
      sentenceProgress[sentenceSettings.courseId] = 0;
      saveSentenceProgress();
    }

    setSentenceMode(sentenceSettings.mode);
    renderSentenceCourseView();
    startSentenceQuiz();
  }

  // --- Pronunciation ---
  function updatePronounceCard() {
    const word = HSK1_VOCABULARY[pronounceIndex];
    document.getElementById("pronounce-index").textContent = pronounceIndex + 1;
    document.getElementById("pronounce-hanzi").textContent = word.hanzi;
    document.getElementById("pronounce-pinyin").textContent = word.pinyin;
    document.getElementById("pronounce-vietnamese").textContent = word.vietnamese;
  }

  function setupPronounce() {
    updatePronounceCard();

    document.getElementById("btn-listen")?.addEventListener("click", e => {
      speak(HSK1_VOCABULARY[pronounceIndex].hanzi, DEFAULT_SPEECH_RATE);
      flashAudioBtn(e.currentTarget);
    });

    document.getElementById("btn-slow")?.addEventListener("click", e => {
      speak(HSK1_VOCABULARY[pronounceIndex].hanzi, SLOW_SPEECH_RATE);
      flashAudioBtn(e.currentTarget);
    });

    document.getElementById("btn-prev")?.addEventListener("click", () => {
      pronounceIndex = (pronounceIndex - 1 + HSK1_VOCABULARY.length) % HSK1_VOCABULARY.length;
      updatePronounceCard();
    });

    document.getElementById("btn-next")?.addEventListener("click", () => {
      pronounceIndex = (pronounceIndex + 1) % HSK1_VOCABULARY.length;
      updatePronounceCard();
    });
  }

  // --- Quiz ---
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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

    document.getElementById("quiz-area").classList.remove("hidden");
    document.getElementById("quiz-result").classList.add("hidden");
    showQuizQuestion();
  }

  function showQuizQuestion() {
    const q = quizState.questions[quizState.current];
    const wrongOptions = getRandomWords(3, q.hanzi);
    const options = shuffle([q, ...wrongOptions]);

    document.getElementById("quiz-score").textContent = quizState.score;
    document.getElementById("quiz-question-num").textContent = quizState.current + 1;
    document.getElementById("quiz-hanzi").textContent = q.hanzi;
    document.getElementById("quiz-pinyin").textContent = q.pinyin;

    const feedback = document.getElementById("quiz-feedback");
    const nextBtn = document.getElementById("btn-quiz-next");
    feedback.classList.add("hidden");
    nextBtn.classList.add("hidden");

    const optionsEl = document.getElementById("quiz-options");
    optionsEl.innerHTML = options
      .map(
        opt => `
      <button class="quiz-option" data-hanzi="${opt.hanzi}" data-correct="${opt.hanzi === q.hanzi}">
        ${opt.vietnamese}
      </button>
    `
      )
      .join("");

    optionsEl.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => handleQuizAnswer(btn, q));
    });
  }

  function handleQuizAnswer(btn, correctWord) {
    const isCorrect = btn.dataset.correct === "true";
    const feedback = document.getElementById("quiz-feedback");
    const nextBtn = document.getElementById("btn-quiz-next");

    document.querySelectorAll(".quiz-option").forEach(b => {
      b.disabled = true;
      if (b.dataset.correct === "true") b.classList.add("correct");
      else if (b === btn && !isCorrect) b.classList.add("wrong");
    });

    if (isCorrect) {
      quizState.score++;
      document.getElementById("quiz-score").textContent = quizState.score;
      feedback.textContent = "✅ Đúng rồi! 太棒了!";
      feedback.className = "quiz-feedback correct";
    } else {
      feedback.textContent = `❌ Sai rồi. Đáp án: ${correctWord.vietnamese}`;
      feedback.className = "quiz-feedback wrong";
    }

    feedback.classList.remove("hidden");
    nextBtn.classList.remove("hidden");
  }

  function setupQuiz() {
    document.getElementById("btn-quiz-listen")?.addEventListener("click", () => {
      if (quizState && quizState.questions[quizState.current]) {
        speak(quizState.questions[quizState.current].hanzi);
      }
    });

    document.getElementById("btn-quiz-next")?.addEventListener("click", () => {
      quizState.current++;
      if (quizState.current >= quizState.total) showQuizResult();
      else showQuizQuestion();
    });

    document.getElementById("btn-restart-quiz")?.addEventListener("click", startQuiz);
    startQuiz();
  }

  function showQuizResult() {
    document.getElementById("quiz-area").classList.add("hidden");
    document.getElementById("quiz-result").classList.remove("hidden");
    document.getElementById("final-score").textContent = quizState.score;

    const msg = document.getElementById("result-message");
    if (quizState.score >= 9) msg.textContent = "Xuất sắc! Bạn học rất giỏi! 🌟";
    else if (quizState.score >= 7) msg.textContent = "Tốt lắm! Tiếp tục luyện tập nhé! 💪";
    else if (quizState.score >= 5) msg.textContent = "Khá ổn! Hãy ôn thêm một chút nhé 📚";
    else msg.textContent = "Đừng nản! Học từng chút một là được 🌱";
  }

  // --- Init ---
  function updateVocabTotal() {
    const total = HSK1_VOCABULARY.length;
    const vocabTotal = document.getElementById("vocab-total");
    const pronounceTotal = document.getElementById("pronounce-total");
    if (vocabTotal) vocabTotal.textContent = total;
    if (pronounceTotal) pronounceTotal.textContent = total;
  }

  function init() {
    initSpeech();
    setupNavigation();
    renderVocabGrid();
    setupSearch();
    setupPinyin();
    setupSentenceLearning();
    setupPronounce();
    setupQuiz();
    updateProgressBadge();
    updateVocabTotal();
    if (window.HSK1Surprise) window.HSK1Surprise.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
