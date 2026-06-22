// Study time tracking, hidden surprise & celebration
(function () {
  'use strict';

  const STORAGE_MS = 'hsk1-study-ms';
  const STORAGE_REVEALED = 'hsk1-surprise-revealed';
  const STUDY_SECTIONS = new Set(['learn', 'pinyin', 'pronounce', 'quiz']);
  const NORMAL_GOAL_MS = 30 * 60 * 1000;
  const TEST_GOAL_MS = 30 * 1000;

  const params = new URLSearchParams(window.location.search);
  const isTestMode = params.get('test') === '1';
  const isInstantTest = params.get('test') === 'fireworks';
  const isResetTest = params.get('test') === 'reset';

  let studyMs = 0;
  let surpriseRevealed = false;
  let celebrationShown = false;
  let ticking = false;
  let lastTick = Date.now();
  let fireworksRunning = false;
  let fireworksFrame = null;
  let activeSection = 'home';
  let goalMs = isTestMode ? TEST_GOAL_MS : NORMAL_GOAL_MS;

  function loadState() {
    try {
      studyMs = parseInt(localStorage.getItem(STORAGE_MS) || '0', 10) || 0;
      surpriseRevealed = localStorage.getItem(STORAGE_REVEALED) === 'true';
    } catch {
      studyMs = 0;
      surpriseRevealed = false;
    }
  }

  function saveStudyMs() {
    try {
      localStorage.setItem(STORAGE_MS, String(studyMs));
    } catch {
      /* ignore */
    }
  }

  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  function isStudyingNow() {
    return document.visibilityState === 'visible' && STUDY_SECTIONS.has(activeSection);
  }

  function revealSurprise() {
    if (surpriseRevealed) return;
    surpriseRevealed = true;
    try {
      localStorage.setItem(STORAGE_REVEALED, 'true');
    } catch {
      /* ignore */
    }

    ['footer-surprise', 'celebration-surprise'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('surprise-hidden');
        el.classList.add('surprise-revealed');
      }
    });

    const footerDefault = document.getElementById('footer-default');
    const footerSurprise = document.getElementById('footer-surprise');
    if (footerDefault) footerDefault.classList.add('hidden');
    if (footerSurprise) {
      footerSurprise.classList.remove('surprise-hidden');
      footerSurprise.classList.add('surprise-revealed');
    }
  }

  function startFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas || fireworksRunning) return;

    fireworksRunning = true;
    canvas.classList.remove('hidden');
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#e74c3c', '#f1c40f', '#ff6b6b', '#ffd93d', '#ff8fab', '#ffffff'];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    function burst(x, y) {
      const count = 36 + Math.floor(Math.random() * 20);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 2
        });
      }
    }

    let burstTimer = 0;
    const duration = isTestMode ? 4000 : 8000;
    const startTime = Date.now();

    burst(canvas.width * 0.3, canvas.height * 0.35);
    burst(canvas.width * 0.7, canvas.height * 0.4);

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      burstTimer++;
      if (burstTimer % 25 === 0) {
        burst(
          canvas.width * (0.2 + Math.random() * 0.6),
          canvas.height * (0.2 + Math.random() * 0.45)
        );
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (Date.now() - startTime < duration || particles.length > 0) {
        fireworksFrame = requestAnimationFrame(animate);
      } else {
        stopFireworks();
      }
    }

    fireworksFrame = requestAnimationFrame(animate);
  }

  function stopFireworks() {
    fireworksRunning = false;
    if (fireworksFrame) cancelAnimationFrame(fireworksFrame);
    const canvas = document.getElementById('fireworks-canvas');
    if (canvas) {
      canvas.classList.add('hidden');
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function showCelebration() {
    if (celebrationShown) return;
    celebrationShown = true;
    revealSurprise();

    const modal = document.getElementById('celebration-modal');
    if (modal) modal.classList.remove('hidden');

    startFireworks();
  }

  function hideCelebration() {
    const modal = document.getElementById('celebration-modal');
    if (modal) modal.classList.add('hidden');
    stopFireworks();
  }

  function checkGoal() {
    if (celebrationShown || surpriseRevealed) return;
    if (studyMs >= goalMs) showCelebration();
  }

  function tick() {
    if (!ticking) return;

    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;

    if (isStudyingNow() && delta > 0 && delta < 60000) {
      studyMs += delta;
      saveStudyMs();
      updateTestPanel();
      checkGoal();
    }
  }

  function startTimer() {
    if (ticking) return;
    ticking = true;
    lastTick = Date.now();
    setInterval(tick, 1000);
    setInterval(saveStudyMs, 10000);
  }

  function updateTestPanel() {
    if (!isTestMode) return;
    const timeEl = document.getElementById('test-study-time');
    const goalEl = document.getElementById('test-goal-time');
    if (timeEl) timeEl.textContent = formatTime(studyMs);
    if (goalEl) goalEl.textContent = formatTime(goalMs);
  }

  function resetAll() {
    studyMs = 0;
    surpriseRevealed = false;
    celebrationShown = false;
    saveStudyMs();
    try {
      localStorage.removeItem(STORAGE_REVEALED);
    } catch {
      /* ignore */
    }

    ['footer-surprise', 'celebration-surprise'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('surprise-revealed');
        el.classList.add('surprise-hidden');
      }
    });

    const footerDefault = document.getElementById('footer-default');
    const footerSurprise = document.getElementById('footer-surprise');
    if (footerDefault) footerDefault.classList.remove('hidden');
    if (footerSurprise) footerSurprise.classList.add('surprise-hidden');

    hideCelebration();
    updateTestPanel();
  }

  function setupTestPanel() {
    if (!isTestMode) return;

    const panel = document.getElementById('test-panel');
    if (panel) panel.classList.remove('hidden');

    document.getElementById('test-trigger')?.addEventListener('click', () => {
      celebrationShown = false;
      showCelebration();
    });

    document.getElementById('test-add-time')?.addEventListener('click', () => {
      studyMs += isTestMode ? 10 * 1000 : 5 * 60 * 1000;
      saveStudyMs();
      updateTestPanel();
      checkGoal();
    });

    document.getElementById('test-reset')?.addEventListener('click', resetAll);
    updateTestPanel();
  }

  function setupCelebrationModal() {
    document.getElementById('btn-celebration-close')?.addEventListener('click', hideCelebration);
  }

  function initSurprise() {
    if (isResetTest) {
      resetAll();
      window.history.replaceState({}, '', window.location.pathname);
    }

    loadState();

    if (surpriseRevealed) {
      ['footer-surprise', 'celebration-surprise'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.classList.remove('surprise-hidden');
          el.classList.add('surprise-revealed');
        }
      });
      const footerDefault = document.getElementById('footer-default');
      const footerSurprise = document.getElementById('footer-surprise');
      if (footerDefault) footerDefault.classList.add('hidden');
      if (footerSurprise) {
        footerSurprise.classList.remove('surprise-hidden');
        footerSurprise.classList.add('surprise-revealed');
      }
      celebrationShown = true;
    }

    setupCelebrationModal();
    setupTestPanel();
    startTimer();

    if (isInstantTest) {
      window.history.replaceState({}, '', window.location.pathname);
      setTimeout(showCelebration, 500);
    }
  }

  window.HSK1Surprise = {
    setActiveSection(section) {
      activeSection = section;
    },
    init: initSurprise,
    resetAll
  };
})();
