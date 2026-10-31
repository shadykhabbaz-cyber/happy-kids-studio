(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#primary-nav');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
      menu.classList.toggle('open', open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Otwórz menu');
    }));
  }

  const dialog = document.querySelector('.lightbox');
  if (dialog && typeof dialog.showModal === 'function') {
    const image = dialog.querySelector('img');
    const caption = dialog.querySelector('p');
    document.querySelectorAll('[data-lightbox]').forEach(link => {
      link.addEventListener('click', event => {
        event.preventDefault();
        const thumb = link.querySelector('img');
        image.src = link.href;
        image.alt = thumb?.alt || 'Zdjęcie Happy Kids Studio';
        caption.textContent = link.dataset.caption || '';
        dialog.showModal();
      });
    });
    dialog.querySelector('.lightbox-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      image.removeAttribute('src');
    });
  }

  // Owner-provided original song. Try audible autoplay on load, then retry
  // from the first genuine interaction when a browser blocks autoplay.
  const soundtrack = document.createElement('audio');
  soundtrack.src = '/assets/Happyyy-1.mp3';
  soundtrack.autoplay = true;
  soundtrack.loop = true;
  soundtrack.preload = 'auto';
  soundtrack.volume = 0.24;
  soundtrack.setAttribute('aria-hidden', 'true');
  soundtrack.style.display = 'none';
  document.body.appendChild(soundtrack);

  const positionKey = 'happy-kids-soundtrack-position';
  try {
    const previousPosition = Number(sessionStorage.getItem(positionKey));
    if (Number.isFinite(previousPosition) && previousPosition > 0) {
      soundtrack.addEventListener('loadedmetadata', () => {
        if (previousPosition < soundtrack.duration) soundtrack.currentTime = previousPosition;
      }, { once: true });
    }
  } catch (_) {}

  const resumeEvents = ['pointerdown', 'touchend', 'keydown'];
  const removeResumeListeners = () => {
    resumeEvents.forEach(event => document.removeEventListener(event, attemptPlay, true));
  };
  function attemptPlay() {
    if (!soundtrack.paused) {
      removeResumeListeners();
      return;
    }
    const attempt = soundtrack.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(removeResumeListeners).catch(() => {
        // Expected when this browser requires the visitor's first interaction.
      });
    }
  }
  resumeEvents.forEach(event => document.addEventListener(event, attemptPlay, {
    capture: true, passive: true
  }));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) attemptPlay();
  });
  window.addEventListener('pageshow', attemptPlay);
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(positionKey, String(soundtrack.currentTime)); } catch (_) {}
  });
  attemptPlay();
})();
