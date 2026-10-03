(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // YEAR + CONTACT CONFIG
  $('#year').textContent = new Date().getFullYear();
  const config = window.GYNOID_CONFIG || {};
  const email = config.email || 'hello@gynoid.com';
  const whatsapp = config.whatsapp || '#';
  $('#emailCta').href = `mailto:${email}`;
  $('#emailText').textContent = email;
  $('#whatsappCta').href = whatsapp;
  $('#whatsappCta').textContent = config.whatsappLabel || 'WhatsApp';

  // SCROLL PROGRESS
  const progressBar = $('#progressBar');
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  // REVEAL
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // MENU
  const sideMenu = $('#sideMenu');
  const menuOverlay = $('#menuOverlay');
  const menuToggle = $('#menuToggle');
  const menuClose = $('#menuClose');
  const openMenu = () => {
    sideMenu.classList.add('is-open');
    sideMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuOverlay.hidden = false;
    document.body.classList.add('menu-open');
  };
  const closeMenu = () => {
    sideMenu.classList.remove('is-open');
    sideMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuOverlay.hidden = true;
    document.body.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);

  // MOBILE CONFIG SHEET
  const mobileConfigToggle = $('#mobileConfigToggle');
  const configOverlay = $('#configOverlay');
  const configSheetClose = $('#configSheetClose');
  const configPanel = $('#configPanel');
  const openConfigSheet = () => {
    if (window.innerWidth > 640) return;
    configOverlay.hidden = false;
    document.body.classList.add('config-open');
  };
  const closeConfigSheet = () => {
    configOverlay.hidden = true;
    document.body.classList.remove('config-open');
  };
  mobileConfigToggle?.addEventListener('click', openConfigSheet);
  configSheetClose?.addEventListener('click', closeConfigSheet);
  configOverlay?.addEventListener('click', closeConfigSheet);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      closeConfigSheet();
    }
  });

  const navLinks = $$('.side-nav a, .side-cta a');
  navLinks.forEach(link => link.addEventListener('click', () => {
    closeMenu();
    closeConfigSheet();
  }));

  // SIDE ACCORDION
  const solutionsToggle = $('#solutionsToggle');
  const solutionsSubmenu = $('#solutionsSubmenu');
  solutionsToggle?.addEventListener('click', () => {
    const expanded = solutionsToggle.getAttribute('aria-expanded') === 'true';
    solutionsToggle.setAttribute('aria-expanded', String(!expanded));
    solutionsSubmenu.classList.toggle('is-collapsed', expanded);
  });

  // SOLUTIONS SLIDER
  const sliderTrack = $('#sliderTrack');
  const slides = $$('.slide-card', sliderTrack);
  const dotsWrap = $('#sliderDots');
  const prevBtn = $('#sliderPrev');
  const nextBtn = $('#sliderNext');
  const navButtons = $$('.solution-link');
  const slideCount = $('#slideCount');
  let currentSlide = 0;
  let startX = 0;
  let deltaX = 0;

  slides.forEach((slide, idx) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Ir a la solución ${idx + 1}`);
    dot.addEventListener('click', () => goToSlide(idx));
    dotsWrap.appendChild(dot);
  });
  const dots = $$('button', dotsWrap);

  const updateSliderUI = () => {
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    if (slideCount) slideCount.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === currentSlide));
    dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === currentSlide));
    navButtons.forEach((btn, idx) => btn.classList.toggle('is-active', idx === currentSlide));
  };

  const goToSlide = (index) => {
    currentSlide = (index + slides.length) % slides.length;
    updateSliderUI();
  };

  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));
  navButtons.forEach(btn => btn.addEventListener('click', () => goToSlide(Number(btn.dataset.slideTarget))));
  $$('[data-slide-target]').forEach(el => el.addEventListener('click', () => {
    const target = Number(el.dataset.slideTarget);
    if (!Number.isNaN(target)) goToSlide(target);
  }));


  // Desktop drag/swipe support.
  let pointerDragging = false;
  let pointerStartX = 0;
  let pointerDeltaX = 0;
  sliderTrack?.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    pointerDragging = true;
    pointerStartX = e.clientX;
    pointerDeltaX = 0;
    sliderTrack.setPointerCapture?.(e.pointerId);
  });
  sliderTrack?.addEventListener('pointermove', (e) => {
    if (!pointerDragging) return;
    pointerDeltaX = e.clientX - pointerStartX;
  });
  const finishPointerDrag = (e) => {
    if (!pointerDragging) return;
    pointerDragging = false;
    if (Math.abs(pointerDeltaX) > 60) {
      pointerDeltaX < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
    try { sliderTrack.releasePointerCapture?.(e.pointerId); } catch {}
  };
  sliderTrack?.addEventListener('pointerup', finishPointerDrag);
  sliderTrack?.addEventListener('pointercancel', finishPointerDrag);

  sliderTrack?.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });
  sliderTrack?.addEventListener('touchmove', (e) => {
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });
  sliderTrack?.addEventListener('touchend', () => {
    if (Math.abs(deltaX) > 50) {
      deltaX < 0 ? goToSlide(currentSlide + 1) : goToSlide(currentSlide - 1);
    }
  });
  updateSliderUI();

  // Auto-close mobile config sheet when resizing to desktop.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 640) {
      closeConfigSheet();
    }
  });
})();
