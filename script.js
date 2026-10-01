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
