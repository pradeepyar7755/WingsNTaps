// Wings N Taps - Main JavaScript
// Handles: navbar scroll, mobile toggle, scroll animations, menu category nav, form submission

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileToggle();
  initScrollAnimations();
  initMenuCategoryNav();
  initForms();
});

// ===== NAVBAR SCROLL EFFECT =====
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

// ===== MOBILE TOGGLE =====
function initMobileToggle() {
  const toggle = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  const animateElements = document.querySelectorAll(
    '.about-grid > *, .specials-grid > *, .showcase-card, .drinks-grid > *, .location-grid > *, .cta-content, .special-card, .highlight-item, .contact-info-card, .contact-form-card'
  );

  if (animateElements.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('animate-in');
        }, index * 80);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
    observer.observe(el);
  });

  // Add animate-in class style
  const style = document.createElement('style');
  style.textContent = `.animate-in { opacity: 1 !important; transform: translateY(0) !important; }`;
  document.head.appendChild(style);
}

// ===== MENU CATEGORY NAV (Sticky category bar on menu page) =====
function initMenuCategoryNav() {
  const catBar = document.getElementById('menu-cats-bar');
  if (!catBar) return;

  const catLinks = catBar.querySelectorAll('.menu-cat-link');
  const sections = [];

  catLinks.forEach(link => {
    const targetId = link.getAttribute('href').replace('#', '');
    const section = document.getElementById(targetId);
    if (section) {
      sections.push({ link, section });
    }
  });

  // Click handling
  catLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        const offset = catBar.offsetHeight + document.getElementById('navbar').offsetHeight + 32 + 10;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }

      catLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Scroll spy
  window.addEventListener('scroll', () => {
    const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
    const barHeight = catBar.offsetHeight || 0;
    const scrollPos = window.scrollY + navHeight + barHeight + 60;
    let activeFound = false;

    for (let i = sections.length - 1; i >= 0; i--) {
      const { link, section } = sections[i];
      if (section.offsetTop <= scrollPos) {
        catLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        activeFound = true;
        break;
      }
    }

    if (!activeFound && catLinks.length > 0) {
      catLinks.forEach(l => l.classList.remove('active'));
      catLinks[0].classList.add('active');
    }
  }, { passive: true });
}

// ===== WEB3FORMS CONFIG =====
const WEB3FORMS_KEY = 'd16d7750-50b8-4825-8179-158964fa65ee';

// ===== FORMS =====
function initForms() {
  // Notify form
  const notifyForm = document.getElementById('notify-form');
  if (notifyForm) {
    notifyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('notify-email');
      const submitBtn = notifyForm.querySelector('button[type="submit"]');
      if (!email || !email.value) return;

      setButtonLoading(submitBtn, true);

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: '🔔 New Email Subscriber — Wings N Taps',
            from_name: 'Wings N Taps Website',
            email: email.value,
            message: `New subscriber wants to be notified when Wings N Taps opens!\n\nEmail: ${email.value}`,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error('Request failed');

        showFormMessage(notifyForm, "You're on the list! 🔥 We'll keep you posted.", 'success');
        email.value = '';
      } catch (err) {
        showFormMessage(notifyForm, "Something went wrong. Please try again.", 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      const subjectLabels = {
        general: 'General Question',
        events: 'Private Events / Catering',
        feedback: 'Feedback',
        careers: 'Careers',
        other: 'Other',
      };

      const name = document.getElementById('contact-name')?.value;
      const email = document.getElementById('contact-email')?.value;
      const phone = document.getElementById('contact-phone-input')?.value || '';
      const subjectVal = document.getElementById('contact-subject')?.value;
      const message = document.getElementById('contact-message')?.value;
      const subjectLabel = subjectLabels[subjectVal] || subjectVal;

      if (!name || !email || !subjectVal || !message) return;

      setButtonLoading(submitBtn, true);

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: `📩 Contact Form: ${subjectLabel} — from ${name}`,
            from_name: name,
            email: email,
            phone: phone,
            topic: subjectLabel,
            message: message,
          }),
        });

        const data = await res.json();
        if (!data.success) throw new Error('Request failed');

        showFormMessage(contactForm, "Message sent! We'll get back to you soon. 🍗", 'success');
        contactForm.reset();
      } catch (err) {
        showFormMessage(contactForm, "Something went wrong. Please try again.", 'error');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }
}

function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
    btn.style.opacity = '1';
  }
}

function showFormMessage(form, message, type) {
  // Remove any existing message
  const existing = form.querySelector('.form-success, .form-error');
  if (existing) existing.remove();

  const isError = type === 'error';
  const msgEl = document.createElement('div');
  msgEl.className = isError ? 'form-error' : 'form-success';
  msgEl.innerHTML = `<i class="fas fa-${isError ? 'exclamation-circle' : 'check-circle'}"></i> ${message}`;
  msgEl.style.cssText = `
    background: ${isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)'};
    border: 1px solid ${isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'};
    color: ${isError ? '#ef4444' : '#22c55e'};
    padding: 1rem 1.5rem;
    border-radius: 12px;
    font-size: 0.9rem;
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: fadeInUp 0.4s ease-out;
  `;
  form.appendChild(msgEl);

  setTimeout(() => {
    msgEl.style.opacity = '0';
    msgEl.style.transition = 'opacity 0.3s ease';
    setTimeout(() => msgEl.remove(), 300);
  }, 5000);
}

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 70;
      const tickerHeight = 32;
      const offset = navHeight + tickerHeight + 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
