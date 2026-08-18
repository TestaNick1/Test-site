// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    navList.classList.toggle('open');
  });
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navList.classList.remove('open'));
  });
}

// Highlight active nav link
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-list a').forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Animated stat counters
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target, 10);
    const suffix = counter.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      counter.textContent = value.toLocaleString('el-GR') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

const statsStrip = document.querySelector('.stats-strip');
if (statsStrip) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });
  observer.observe(statsStrip);
}

// Animated bar charts on stats page
const bars = document.querySelectorAll('.bar-fill');
if (bars.length) {
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width;
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(bar => barObserver.observe(bar));
}

// Contact form (demo only, no backend)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    status.textContent = 'Ευχαριστούμε! Το μήνυμά σας καταχωρήθηκε (δοκιμαστική φόρμα, δεν αποστέλλεται πουθενά).';
    status.classList.add('show', 'success');
    contactForm.reset();
  });
}
