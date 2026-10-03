(() => {
  const config = window.GYNOID_CONFIG || {};
  const header = document.querySelector('.site-header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  const progress = document.getElementById('scrollProgress');
  const heroMedia = document.querySelector('.hero-media');
  const year = document.getElementById('year');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (year) year.textContent = new Date().getFullYear();

  const closeMenu = () => {
    nav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  navToggle?.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!open));
    nav?.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });

  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 980) closeMenu(); });

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, (y / max) * 100)) : 0;
    if (progress) progress.style.width = `${pct}%`;

    if (heroMedia && !reduceMotion && y < window.innerHeight * 1.15) {
      heroMedia.style.transform = `scale(1.025) translateY(${y * 0.08}px)`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const reveals = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');

  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      const src = button.getAttribute('data-lightbox');
      const image = button.querySelector('img');
      lightboxImage.src = src;
      lightboxImage.alt = image?.alt || 'Imagen Gynoid ampliada';
      if (typeof lightbox.showModal === 'function') lightbox.showModal();
    });
  });

  lightboxClose?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', event => {
    const rect = lightbox.getBoundingClientRect();
    const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
    if (outside) lightbox.close();
  });

  const contactLink = document.querySelector('[data-contact-email]');
  if (contactLink) {
    if (config.contactEmail) {
      contactLink.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent('Proyecto Gynoid')}`;
      document.querySelector('.contact-note')?.remove();
    } else {
      contactLink.addEventListener('click', event => {
        event.preventDefault();
        alert('Añade el email de contacto en js/config.js para activar este botón.');
      });
    }
  }

  const socials = {
    instagram: config.instagram,
    linkedin: config.linkedin,
    whatsapp: config.whatsapp
  };
  Object.entries(socials).forEach(([name, href]) => {
    if (!href) return;
    const el = document.querySelector(`[data-social="${name}"]`);
    if (!el) return;
    el.href = href;
    el.hidden = false;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  });
})();
