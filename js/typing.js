// Vietnamese typing practice (with optional built-in Telex input)
(function () {
  "use strict";

  const SETTINGS_KEY = "hsk1-typing-settings";
  const ROUND_SIZE = 10;

  // ---------- Telex ----------
  const TONE_MARKS = { s: "́", f: "̀", r: "̉", x: "̃", j: "̣" };
  const MOD_MARKS = { "^": "̂", "(": "̆", "+": "̛" };
  const VOWELS = "aeiouy";

  function parseWord(word) {
    return [...word].map(ch => {
      const upper = ch !== ch.toLowerCase();
      const lower = ch.toLowerCase();
      if (lower === "đ") return { b: "đ", mod: "", tone: "", upper };
      const nfd = lower.normalize("NFD");
      const b = nfd[0];
      let mod = "";
      let tone = "";
      for (const m of nfd.slice(1)) {
        if (m === "̂") mod = "^";
        else if (m === "̆") mod = "(";
        else if (m === "̛") mod = "+";
        else tone = m;
      }
      return { b, mod, tone, upper };
    });
  }

  function composeWord(chars) {
    return chars
      .map(c => {
        let s = c.b === "đ" ? "đ" : (c.b + (MOD_MARKS[c.mod] || "") + c.tone).normalize("NFC");
        return c.upper ? s.toUpperCase() : s;
      })
      .join("");
  }

  const isVowel = c => VOWELS.includes(c.b);

  function toneTarget(chars) {
    let start = 0;
    const lw = chars.map(c => c.b).join("");
    if (lw.startsWith("qu") && chars.length > 2) start = 2;
    else if (lw.startsWith("gi") && chars.length > 2 && chars.slice(2).some(isVowel)) start = 2;
    const idx = [];
    for (let i = start; i < chars.length; i++) if (isVowel(chars[i])) idx.push(i);
    if (!idx.length) return -1;
    // keep only the contiguous last group
    let group = [idx[idx.length - 1]];
    for (let k = idx.length - 2; k >= 0; k--) {
      if (idx[k] === group[0] - 1) group.unshift(idx[k]);
      else break;
    }
    const modded = group.filter(i => chars[i].mod);
    if (modded.length) {
      // ươ -> tone on ơ (last modified)
      return modded[modded.length - 1];
    }
    if (group.length === 1) return group[0];
    if (group.length >= 3) return group[1];
    // modern placement: hòa, khỏe, thủy (open) / toán, tiến (closed)
    const hasFinal = group[1] < chars.length - 1;
    return hasFinal ? group[1] : group[0];
  }

  function normalizeTone(chars) {
    let tone = "";
    chars.forEach(c => {
      if (c.tone) {
        tone = c.tone;
        c.tone = "";
      }
    });
    if (!tone) return;
    const t = toneTarget(chars);
    if (t >= 0) chars[t].tone = tone;
  }

  function lastVowelIndex(chars) {
    for (let i = chars.length - 1; i >= 0; i--) if (isVowel(chars[i])) return i;
    return -1;
  }

  // Returns the new word after typing `key` at the end of `word`, or null if no transform.
  function telexApply(word, key) {
    const k = key.toLowerCase();
    const upper = key !== k;
    const chars = parseWord(word);
    const literal = () => {
      chars.push({ b: k, mod: "", tone: "", upper });
      normalizeTone(chars);
      return composeWord(chars);
    };

    if (k === "d" && chars.length && chars[chars.length - 1].b === "d" && !chars[chars.length - 1].mod) {
      chars[chars.length - 1].b = "đ";
      return composeWord(chars);
    }
    if (k === "d" && chars.length && chars[chars.length - 1].b === "đ") {
      chars[chars.length - 1].b = "d";
      return composeWord(chars) + (upper ? "D" : "d");
    }

    if (k in TONE_MARKS || k === "z") {
      const t = toneTarget(chars);
      if (t < 0) return null;
      const mark = TONE_MARKS[k] || "";
      const had = chars.some(c => c.tone);
      if (k === "z") {
        if (!had) return null;
        chars.forEach(c => (c.tone = ""));
        return composeWord(chars);
      }
      if (chars.some(c => c.tone === mark)) {
        chars.forEach(c => (c.tone = ""));
        return composeWord(chars) + (upper ? key : k);
      }
      chars.forEach(c => (c.tone = ""));
      chars[t].tone = mark;
      return composeWord(chars);
    }

    if (k === "a" || k === "e" || k === "o") {
      const i = lastVowelIndex(chars);
      if (i >= 0 && chars[i].b === k) {
        if (!chars[i].mod) {
          chars[i].mod = "^";
          normalizeTone(chars);
          return composeWord(chars);
        }
        if (chars[i].mod === "^") {
          chars[i].mod = "";
          const out = literal();
          return out;
        }
      }
      return null;
    }

    if (k === "w") {
      const i = lastVowelIndex(chars);
      if (i < 0) {
        if (chars.length === 0 || !chars.some(isVowel)) {
          chars.push({ b: "u", mod: "+", tone: "", upper });
          return composeWord(chars);
        }
        return null;
      }
      const c = chars[i];
      if (c.b === "a" && (c.mod === "" || c.mod === "(") ) {
        if (c.mod === "(") {
          c.mod = "";
          return literal();
        }
        c.mod = "(";
        normalizeTone(chars);
        return composeWord(chars);
      }
      if (c.b === "o" || c.b === "u") {
        if (c.mod === "+") {
          c.mod = "";
          return literal();
        }
        if (c.mod === "" || c.mod === "^") {
          c.mod = "+";
          const prev = chars[i - 1];
          if (c.b === "o" && prev && prev.b === "u" && !prev.mod && !(i === 2 && chars[0].b === "q")) {
            prev.mod = "+";
          }
          normalizeTone(chars);
          return composeWord(chars);
        }
      }
      return null;
    }
    return null;
  }

  function attachTelex(input) {
    input.addEventListener("beforeinput", e => {
      if (!settings.telex || e.isComposing || e.inputType !== "insertText") return;
      const data = e.data;
      if (!data || data.length !== 1) return;
      if (input.selectionStart !== input.selectionEnd || input.selectionStart !== input.value.length) return;
      const m = input.value.match(/[\p{L}]+$/u);
      const word = m ? m[0] : "";
      const result = telexApply(word, data);
      if (result === null) return;
      e.preventDefault();
      input.value = input.value.slice(0, input.value.length - word.length) + result;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  // ---------- Answer checking ----------
  function norm(s, stripAccents) {
    let t = s.normalize("NFC").toLowerCase();
    if (stripAccents) {
      t = t.replace(/đ/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC");
    }
    return t.replace(/[.,!?;:"“”'’…—\-]/g, " ").replace(/\s+/g, " ").trim();
  }

  function acceptedAnswers(item) {
    const full = item.vietnamese;
    const list = [full, full.replace(/\([^)]*\)/g, "")];
    full
      .replace(/\([^)]*\)/g, "")
      .split(/[,;/]/)
      .forEach(p => list.push(p));
    return list.map(s => s.trim()).filter(Boolean);
  }

  function isCorrect(input, item, mode) {
    const lenient = settings.noAccent && mode === "translate";
    const target = norm(input, lenient);
    if (!target) return false;
    if (mode === "copy") return norm(item.vietnamese, false) === norm(input, false);
    return acceptedAnswers(item).some(a => norm(a, lenient) === target);
  }

  // ---------- State ----------
  let settings = loadSettings();
  let state = null;
  let el = {};

  function loadSettings() {
    const d = { source: "words", mode: "translate", telex: false, noAccent: false, best: 0 };
    try {
      return { ...d, ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}) };
    } catch (e) {
      return d;
    }
  }
  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
  }

  function shuffle(arr) {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  }

  function getPool() {
    if (settings.source === "sentences") {
      return HSK1_SENTENCE_COURSES.flatMap(c =>
        c.sentences.map(s => ({ hanzi: s.hanzi, pinyin: s.pinyin, vietnamese: s.translation }))
      );
    }
    return HSK1_VOCABULARY;
  }

  function start() {
    state = {
      items: shuffle(getPool()).slice(0, ROUND_SIZE),
      current: 0,
      score: 0,
      streak: 0,
      answered: false,
      hinted: false,
      chars: 0,
      startedAt: null,
      elapsed: 0
    };
    el.area.classList.remove("hidden");
    el.result.classList.add("hidden");
    showQuestion();
  }

  function showQuestion() {
    const item = state.items[state.current];
    state.answered = false;
    state.hinted = false;
    el.num.textContent = state.current + 1;
    el.total.textContent = state.items.length;
    el.score.textContent = state.score;
    el.streak.textContent = state.streak;
    el.pinyin.textContent = item.pinyin;
    if (settings.mode === "copy") {
      el.prompt.textContent = "Gõ lại câu tiếng Việt sau:";
      el.hanzi.textContent = item.vietnamese;
      el.hanzi.classList.add("typing-copy-text");
      el.pinyin.textContent = `${item.hanzi}  ·  ${item.pinyin}`;
    } else {
      el.prompt.textContent = "Gõ nghĩa tiếng Việt của:";
      el.hanzi.textContent = item.hanzi;
      el.hanzi.classList.remove("typing-copy-text");
    }
    el.input.value = "";
    el.input.disabled = false;
    el.input.classList.remove("correct", "wrong");
    el.live.innerHTML = "";
    el.feedback.classList.add("hidden");
    el.feedback.className = "quiz-feedback hidden";
    el.check.classList.remove("hidden");
    el.hint.classList.toggle("hidden", settings.mode === "copy");
    el.next.classList.add("hidden");
    el.input.focus();
    updateLive();
  }

  function updateLive() {
    if (!state || settings.mode !== "copy" || state.answered) {
      if (settings.mode !== "copy") el.live.innerHTML = "";
      return;
    }
    const target = [...state.items[state.current].vietnamese.normalize("NFC")];
    const typed = [...el.input.value.normalize("NFC")];
    el.live.innerHTML = target
      .map((ch, i) => {
        const cls = i >= typed.length ? "pending" : typed[i] === ch ? "ok" : "bad";
        const shown = ch === " " ? "&nbsp;" : escapeHtml(ch);
        return `<span class="typing-ch ${cls}">${shown}</span>`;
      })
      .join("");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function submit() {
    if (!state || state.answered) return;
    const value = el.input.value;
    if (!value.trim()) return;
    const item = state.items[state.current];
    const ok = isCorrect(value, item, settings.mode);
    state.answered = true;
    state.chars += value.length;
    el.input.disabled = true;
    el.check.classList.add("hidden");
    el.hint.classList.add("hidden");
    el.input.classList.add(ok ? "correct" : "wrong");
    el.feedback.classList.remove("hidden");
    if (ok) {
      state.score++;
      state.streak++;
      el.feedback.className = "quiz-feedback correct";
      el.feedback.textContent = "✅ Chính xác!";
    } else {
      state.streak = 0;
      el.feedback.className = "quiz-feedback wrong";
      el.feedback.textContent = `❌ Chưa đúng. Đáp án: ${item.vietnamese}`;
    }
    el.score.textContent = state.score;
    el.streak.textContent = state.streak;
    const last = state.current === state.items.length - 1;
    el.next.textContent = last ? "Xem kết quả →" : "Câu tiếp theo →";
    el.next.classList.remove("hidden");
    el.next.focus();
  }

  function showHint() {
    if (!state || state.answered) return;
    const item = state.items[state.current];
    const first = acceptedAnswers(item)[0];
    const words = first.split(/\s+/).map(w => [...w][0] + "…");
    el.feedback.className = "quiz-feedback";
    el.feedback.textContent = `💡 Gợi ý: ${words.join(" ")}  (${[...first].length} ký tự)`;
    el.feedback.classList.remove("hidden");
    state.hinted = true;
    el.input.focus();
  }

  function next() {
    if (!state) return;
    state.current++;
    if (state.current >= state.items.length) return showResult();
    showQuestion();
  }

  function showResult() {
    el.area.classList.add("hidden");
    el.result.classList.remove("hidden");
    el.finalScore.textContent = state.score;
    el.finalTotal.textContent = state.items.length;
    if (state.score > (settings.best || 0)) {
      settings.best = state.score;
      saveSettings();
    }
    el.best.textContent = settings.best;
    const r = state.score / state.items.length;
    el.message.textContent =
      r === 1 ? "Tuyệt vời! Gõ chuẩn từng dấu! 🏆" : r >= 0.7 ? "Rất tốt! Cố thêm chút nữa nhé 💪" : "Luyện thêm một chút, bạn sẽ gõ nhanh hơn! 🌱";
  }

  function syncControls() {
    document.querySelectorAll("[data-typing-source]").forEach(b => {
      const on = b.dataset.typingSource === settings.source;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    document.querySelectorAll("[data-typing-mode]").forEach(b => {
      const on = b.dataset.typingMode === settings.mode;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on);
    });
    el.telex.checked = settings.telex;
    el.noAccent.checked = settings.noAccent;
    el.noAccent.disabled = settings.mode === "copy";
    el.best.textContent = settings.best || 0;
  }

  function init() {
    if (!document.getElementById("typing")) return;
    const g = id => document.getElementById(id);
    el = {
      area: g("typing-area"),
      result: g("typing-result"),
      prompt: g("typing-prompt"),
      hanzi: g("typing-hanzi"),
      pinyin: g("typing-pinyin"),
      input: g("typing-input"),
      live: g("typing-live"),
      feedback: g("typing-feedback"),
      check: g("btn-typing-check"),
      hint: g("btn-typing-hint"),
      next: g("btn-typing-next"),
      num: g("typing-num"),
      total: g("typing-total"),
      score: g("typing-score"),
      streak: g("typing-streak"),
      finalScore: g("typing-final-score"),
      finalTotal: g("typing-final-total"),
      best: g("typing-best"),
      message: g("typing-result-message"),
      telex: g("typing-telex"),
      noAccent: g("typing-no-accent")
    };

    attachTelex(el.input);
    el.input.addEventListener("input", updateLive);
    el.input.addEventListener("keydown", e => {
      if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        submit();
      }
    });
    el.check.addEventListener("click", submit);
    el.hint.addEventListener("click", showHint);
    el.next.addEventListener("click", next);
    g("btn-typing-restart").addEventListener("click", start);
    g("btn-typing-skip").addEventListener("click", () => {
      if (!state || state.answered) return;
      state.streak = 0;
      el.input.value = "";
      next();
    });

    document.querySelectorAll("[data-typing-source]").forEach(b =>
      b.addEventListener("click", () => {
        settings.source = b.dataset.typingSource;
        saveSettings();
        syncControls();
        start();
      })
    );
    document.querySelectorAll("[data-typing-mode]").forEach(b =>
      b.addEventListener("click", () => {
        settings.mode = b.dataset.typingMode;
        saveSettings();
        syncControls();
        start();
      })
    );
    el.telex.addEventListener("change", () => {
      settings.telex = el.telex.checked;
      saveSettings();
      el.input.focus();
    });
    el.noAccent.addEventListener("change", () => {
      settings.noAccent = el.noAccent.checked;
      saveSettings();
    });

    syncControls();
    start();
    // avoid stealing focus on page load
    if (document.activeElement === el.input) el.input.blur();
  }

  window.HSK1Typing = { init, telexApply };
})();
