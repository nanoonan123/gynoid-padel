(() => {
  const config = window.GYNOID_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Header + progress
  const topbar = document.querySelector('.topbar');
  const progress = document.getElementById('scrollProgress');
  const heroImage = document.querySelector('.hero-image');

  const onScroll = () => {
    const y = window.scrollY;
    topbar?.classList.toggle('scrolled', y > 24);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    if (heroImage && !reduceMotion && y < window.innerHeight * 1.1) {
      heroImage.style.transform = `scale(1.035) translateY(${y * 0.035}px)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const reveals = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  // Side menu
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');
  const sideMenu = document.getElementById('sideMenu');
  const menuBackdrop = document.getElementById('menuBackdrop');

  const setMenu = open => {
    sideMenu?.classList.toggle('open', open);
    sideMenu?.setAttribute('aria-hidden', String(!open));
    menuToggle?.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (menuBackdrop) menuBackdrop.hidden = !open;
  };

  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  menuClose?.addEventListener('click', () => setMenu(false));
  menuBackdrop?.addEventListener('click', () => setMenu(false));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  sideMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  // Solutions slider
  const track = document.getElementById('sliderTrack');
  const slides = [...document.querySelectorAll('.solution-slide')];
  const prev = document.getElementById('sliderPrev');
  const next = document.getElementById('sliderNext');
  const dots = document.getElementById('sliderDots');
  const viewport = document.querySelector('.slider-viewport');
  let activeSlide = 0;
  let pointerStart = null;

  if (dots && slides.length) {
    dots.innerHTML = slides.map((_, i) => `<button type="button" aria-label="Ir a solución ${i + 1}" data-slide-dot="${i}"></button>`).join('');
  }
  const dotButtons = [...document.querySelectorAll('[data-slide-dot]')];

  const goToSlide = index => {
    if (!slides.length || !track) return;
    activeSlide = (index + slides.length) % slides.length;
    track.style.transform = `translate3d(-${activeSlide * 100}%,0,0)`;
    dotButtons.forEach((dot, i) => dot.classList.toggle('is-active', i === activeSlide));
    slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== activeSlide)));
  };

  prev?.addEventListener('click', () => goToSlide(activeSlide - 1));
  next?.addEventListener('click', () => goToSlide(activeSlide + 1));
  dotButtons.forEach(dot => dot.addEventListener('click', () => goToSlide(Number(dot.dataset.slideDot))));

  viewport?.addEventListener('pointerdown', e => {
    pointerStart = { x: e.clientX, y: e.clientY };
  });
  viewport?.addEventListener('pointerup', e => {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.x;
    const dy = e.clientY - pointerStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) goToSlide(activeSlide + (dx < 0 ? 1 : -1));
    pointerStart = null;
  });
  viewport?.addEventListener('pointercancel', () => { pointerStart = null; });
  goToSlide(0);

  // Side menu links can target a slide
  document.querySelectorAll('[data-slide-target]').forEach(link => {
    link.addEventListener('click', () => {
      const target = Number(link.dataset.slideTarget);
      window.setTimeout(() => goToSlide(target), 300);
    });
  });

  // Configurator
  const scene = document.getElementById('scene');
  const court3d = document.querySelector('.court3d');
  const contextButtons = [...document.querySelectorAll('[data-context]')];
  const themeButtons = [...document.querySelectorAll('[data-theme]')];
  const featureInputs = [...document.querySelectorAll('[data-feature]')];
  const configTitle = document.getElementById('configTitle');
  const configText = document.getElementById('configText');
  const configChips = document.getElementById('configChips');

  let currentContext = 'club';
  let currentTheme = 'night';
  let rotX = 60;
  let rotZ = -42;
  let dragState = null;

  const labels = {
    roof: 'Roof',
    ai: 'AI',
    media: 'Media',
    access: 'Access',
    energy: 'Solar',
    lounge: 'Comfort'
  };

  const contextCopy = {
    club: {
      title: 'Club Connected',
      base: 'Una pista premium conectada para elevar experiencia y operación del club.'
    },
    resort: {
      title: 'Resort Signature',
      base: 'Una configuración enfocada en hospitality, impacto visual y confort premium.'
    },
    urban: {
      title: 'Urban Flagship',
      base: 'Una pista icónica para proyectos urbanos donde tecnología y marca deben destacar.'
    }
  };

  const activeFeatures = () => featureInputs.filter(input => input.checked).map(input => input.dataset.feature);

  const updateConfigCopy = () => {
    const active = activeFeatures();
    const copy = contextCopy[currentContext];
    if (configTitle) configTitle.textContent = copy.title;

    let extra = '';
    if (active.includes('media')) extra += ' Media LED añade activaciones, publicidad y eventos.';
    if (active.includes('ai')) extra += ' Gynoid AI convierte el juego en datos y contenido.';
    if (active.includes('energy')) extra += ' Solar Glass refuerza la capa energética y sostenible.';
    if (active.includes('lounge')) extra += ' Premium Comfort eleva la experiencia fuera de pista.';
    if (active.includes('roof')) extra += ' El techo retráctil amplía la flexibilidad de uso.';
    if (configText) configText.textContent = copy.base + extra;
    if (configChips) {
      configChips.innerHTML = ['Premium Court', ...active.map(key => labels[key])].map(item => `<span>${item}</span>`).join('');
    }
  };

  const updateScene = () => {
    if (!scene) return;
    scene.dataset.context = currentContext;
    scene.dataset.theme = currentTheme;
    featureInputs.forEach(input => {
      scene.dataset[`feature${input.dataset.feature.charAt(0).toUpperCase()}${input.dataset.feature.slice(1)}`] = input.checked ? 'on' : 'off';
    });
    updateConfigCopy();
  };

  contextButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentContext = button.dataset.context;
      contextButtons.forEach(b => b.classList.toggle('is-active', b === button));
      updateScene();
    });
  });

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentTheme = button.dataset.theme;
      themeButtons.forEach(b => b.classList.toggle('is-active', b === button));
      updateScene();
    });
  });

  featureInputs.forEach(input => input.addEventListener('change', updateScene));

  // Drag 3D court
  const applyRotation = () => {
    if (court3d) court3d.style.transform = `rotateX(${rotX}deg) rotateZ(${rotZ}deg)`;
  };

  scene?.addEventListener('pointerdown', e => {
    if (e.target.closest('button, label, input, a')) return;
    dragState = { x: e.clientX, y: e.clientY, rotX, rotZ };
    scene.classList.add('dragging');
    scene.setPointerCapture?.(e.pointerId);
  });
  scene?.addEventListener('pointermove', e => {
    if (!dragState) return;
    const dx = e.clientX - dragState.x;
    const dy = e.clientY - dragState.y;
    rotZ = Math.max(-75, Math.min(-10, dragState.rotZ + dx * 0.12));
    rotX = Math.max(48, Math.min(72, dragState.rotX - dy * 0.08));
    applyRotation();
  });
  const stopDrag = () => {
    dragState = null;
    scene?.classList.remove('dragging');
  };
  scene?.addEventListener('pointerup', stopDrag);
  scene?.addEventListener('pointercancel', stopDrag);
  applyRotation();
  updateScene();

  // Contact configuration
  const contactLink = document.querySelector('[data-contact-email]');
  if (contactLink) {
    if (config.contactEmail) {
      contactLink.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent('Proyecto Gynoid')}`;
      document.querySelector('.contact-note')?.remove();
    } else {
      contactLink.addEventListener('click', e => {
        e.preventDefault();
        alert('Añade el email real de Gynoid en js/config.js para activar el contacto.');
      });
    }
  }
})();
