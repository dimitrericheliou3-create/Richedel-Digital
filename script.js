const hasSiteIntro = document.documentElement.classList.contains('site-intro-pending');
const afterSiteIntro = (callback) => {
  if (hasSiteIntro) window.setTimeout(callback, 2660);
  else callback();
};

if (hasSiteIntro) {
  window.setTimeout(() => document.documentElement.classList.remove('site-intro-pending'), 1900);
  window.setTimeout(() => document.documentElement.classList.remove('site-intro-sequencing'), 2660);
}

const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const navigableSections = sectionLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const sectionObserver = new IntersectionObserver((entries) => {
  const visibleSections = entries
    .filter((entry) => entry.isIntersecting)
    .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top);

  if (visibleSections.length === 0) {
    return;
  }

  const activeId = visibleSections[0].target.id;
  sectionLinks.forEach((link) => {
    if (link.getAttribute('href') === `#${activeId}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}, {
  rootMargin: '-22% 0px -68% 0px',
  threshold: 0,
});

navigableSections.forEach((section) => sectionObserver.observe(section));

const scrollProgress = document.getElementById('scroll-progress');
let progressFrame = false;
function renderScrollProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  scrollProgress.style.setProperty('--scroll-progress', String(Math.min(1, Math.max(0, progress))));
  progressFrame = false;
}
window.addEventListener('scroll', () => {
  if (!progressFrame) {
    progressFrame = true;
    window.requestAnimationFrame(renderScrollProgress);
  }
}, { passive: true });
window.addEventListener('resize', renderScrollProgress, { passive: true });
renderScrollProgress();

const metricCounters = document.querySelectorAll('[data-count-value]');
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    const goal = Number(element.dataset.countValue);
    const decimals = Number(element.dataset.countDecimals || 0);
    const suffix = element.dataset.countSuffix || '';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      element.textContent = `${goal.toFixed(decimals)}${suffix}`;
      observer.unobserve(element);
      return;
    }

    const startedAt = performance.now();
    const duration = 1450;
    const tick = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${(goal * eased).toFixed(decimals)}${suffix}`;
      if (progress < 1) window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
    observer.unobserve(element);
  });
}, { threshold: 0.75 });
afterSiteIntro(() => metricCounters.forEach((counter) => counterObserver.observe(counter)));

const revealItems = document.querySelectorAll('.section-header, .card, .project-card, .step, .questionnaire-result, .contact-box');
revealItems.forEach((item) => item.classList.add('reveal-on-scroll'));
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
afterSiteIntro(() => revealItems.forEach((item) => revealObserver.observe(item)));

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty('--tilt-x', `${-y * 4}deg`);
    card.style.setProperty('--tilt-y', `${x * 4}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.removeProperty('--tilt-x');
    card.style.removeProperty('--tilt-y');
  });
});

document.querySelectorAll('.btn').forEach((button) => {
  button.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const bounds = button.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    button.style.setProperty('--magnet-x', `${x * 7}px`);
    button.style.setProperty('--magnet-y', `${y * 5}px`);
  });
  button.addEventListener('pointerleave', () => {
    button.style.removeProperty('--magnet-x');
    button.style.removeProperty('--magnet-y');
  });
});

const questionnaire = document.getElementById('website-check');
const resultPanel = document.getElementById('questionnaire-result');
const resultScore = document.getElementById('result-score');
const resultTitle = document.getElementById('result-title');
const resultMessage = document.getElementById('result-message');
const questions = ['speed', 'booking', 'design', 'maintenance', 'leads'];

questionnaire.addEventListener('change', () => {
  const answers = new FormData(questionnaire);
  const answeredCount = questions.filter((question) => answers.has(question)).length;

  if (answeredCount < questions.length) {
    return;
  }

  const score = questions.reduce((total, question) => total + Number(answers.get(question)), 0);
  let title = 'Prime candidate for an upgrade';
  let message = 'A modern, lightweight website can improve loading speed, strengthen trust, and make it easier for visitors to become customers.';

  if (score >= 13) {
    title = 'High-performing engine';
    message = 'Your online platform is in great shape. Focused optimization or a bespoke design refresh can help you stay ahead of local competitors.';
  } else if (score >= 9) {
    title = 'Solid foundation, room to grow';
    message = 'Your website is working, but speed issues or visual friction may be losing visitors before they get in touch.';
  }

  resultScore.textContent = score;
  resultTitle.textContent = title;
  resultMessage.textContent = message;
  resultPanel.classList.add('is-complete');
});

const musicControl = document.getElementById('music-control');
const musicControlLabel = document.getElementById('music-control-label');
const backgroundMusic = new Audio('Flint%20-%20Hymn%20of%20the%20Bed.mp3');
backgroundMusic.loop = true;
backgroundMusic.preload = 'none';
backgroundMusic.volume = 0.24;
let musicIsPlaying = false;

function updateMusicControl(isPlaying, label = isPlaying ? 'Pause music' : 'Play music') {
  musicIsPlaying = isPlaying;
  musicControl.setAttribute('aria-pressed', String(isPlaying));
  musicControl.setAttribute('aria-label', label === 'Play music' ? 'Play background music' : label);
  musicControlLabel.textContent = label;
}

async function startMusic() {
  if (musicIsPlaying) {
    return;
  }

  try {
    await backgroundMusic.play();
    updateMusicControl(true);
  } catch {
    updateMusicControl(false, 'Tap to enable music');
  }
}

function stopMusic() {
  backgroundMusic.pause();
  updateMusicControl(false);
}

musicControl.addEventListener('click', () => {
  if (musicIsPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
});

const privacyPolicyLink = document.querySelector('a[href="privacy.html"]');
if (privacyPolicyLink) {
  privacyPolicyLink.addEventListener('click', (event) => {
    const isPlainClick = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isPlainClick || prefersReducedMotion || event.defaultPrevented) return;

    event.preventDefault();
    const transition = document.createElement('div');
    transition.className = 'privacy-transition';
    transition.setAttribute('aria-hidden', 'true');
    transition.innerHTML = `
      <div class="law-book">
        <div class="law-book-pages">
          <div class="law-book-page">
            <strong>CHAPTER I</strong>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae justo sed neque porta consequat.</p>
            <p>Curabitur at lacus ac velit ornare lobortis. Donec pede justo, fringilla vel, aliquet nec, vulputate eget.</p>
            <p>In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo.</p>
          </div>
          <div class="law-book-page">
            <strong>YOUR PRIVACY</strong>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis.</p>
            <p>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Nullam quis risus eget urna.</p>
            <p>Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh.</p>
            <small class="book-note">get a life bum</small>
          </div>
        </div>
        <div class="book-cover-panel book-cover-left"></div>
        <div class="book-cover-panel book-cover-right"></div>
        <div class="law-book-cover-title">
          <span class="law-book-seal">§</span>
          <strong>PRIVACY<br>POLICY</strong>
          <small>RICHEDEL DIGITAL · OFFICIAL EDITION</small>
        </div>
      </div>`;
    document.body.append(transition);
    requestAnimationFrame(() => transition.classList.add('is-active'));

    window.setTimeout(() => {
      const destination = new URL(privacyPolicyLink.href);
      destination.searchParams.set('transition', 'lawbook');
      window.location.assign(destination.href);
    }, 2840);
  });
}


