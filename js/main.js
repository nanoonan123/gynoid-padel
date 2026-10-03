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
    document.body.style.overflow = 'hidden';
  };
  const closeMenu = () => {
    sideMenu.classList.remove('is-open');
    sideMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuOverlay.hidden = true;
    document.body.style.overflow = '';
  };
  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  $$('.side-nav a').forEach(link => link.addEventListener('click', closeMenu));

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
  $$('[data-slide-target]').forEach(el => el.addEventListener('click', (e) => {
    const target = Number(el.dataset.slideTarget);
    if (!Number.isNaN(target)) goToSlide(target);
  }));

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

  // CONFIGURATOR
  const scene = $('#scene');
  const featureInputs = $$('[data-feature]');
  const contextButtons = $$('[data-context]', $('#contextSelector'));
  const themeButtons = $$('[data-theme]', $('#themeSelector'));
  const configTitle = $('#configTitle');
  const configText = $('#configText');
  const configTags = $('#configTags');
  const sceneBadge = $('#sceneBadge');
  const sceneTitle = $('#sceneTitle');
  const sceneDescription = $('#sceneDescription');
  const courtModel = $('#courtModel');

  const state = {
    context: 'club',
    theme: 'night',
    roof: true,
    ai: true,
    media: false,
    access: true,
    energy: false,
    lounge: false,
  };

  const labels = {
    roof: 'Techo retráctil',
    ai: 'Gynoid AI',
    media: 'Media LED',
    access: 'Smart Access',
    energy: 'Solar Glass',
    lounge: 'Premium Comfort',
  };

  const contextNames = {
    club: 'Club',
    resort: 'Resort',
    urban: 'Urban',
  };

  const descriptorFromState = () => {
    if (state.media && state.lounge) return 'Showcase';
    if (state.energy) return 'Sustainable';
    if (state.ai && state.access) return 'Connected';
    if (state.roof) return 'Performance';
    return 'Signature';
  };

  const buildDescription = () => {
    const active = Object.keys(labels).filter(key => state[key]);
    if (!active.length) return 'Una pista premium minimalista lista para personalizar con nuevas capas.';
    const top = active.slice(0, 3).map(key => labels[key]);
    const joined = top.length === 1 ? top[0] : `${top.slice(0, -1).join(', ')} y ${top[top.length - 1]}`;

    const contextLine = {
      club: 'Pensada para clubes que quieren elevar la experiencia de juego y operación.',
      resort: 'Ideal para hospitality y proyectos que necesitan impacto visual.',
      urban: 'Perfecta para ubicaciones urbanas, rooftops y espacios singulares.',
    }[state.context];

    return `${joined} activos. ${contextLine}`;
  };

  const updateTagList = () => {
    configTags.innerHTML = '';
    const tags = [contextNames[state.context], state.theme === 'night' ? 'Night' : 'Day'];
    Object.entries(labels).forEach(([key, label]) => {
      if (state[key]) tags.push(label);
    });
    tags.forEach(text => {
      const span = document.createElement('span');
      span.textContent = text;
      configTags.appendChild(span);
    });
  };

  const updateSegments = () => {
    contextButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.context === state.context));
    themeButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.theme === state.theme));
    featureInputs.forEach(input => {
      input.checked = !!state[input.dataset.feature];
      input.closest('.toggle-card')?.classList.toggle('is-on', input.checked);
    });
  };

  const applyState = () => {
    scene.dataset.context = state.context;
    scene.dataset.theme = state.theme;
    scene.dataset.roof = state.roof ? 'on' : 'off';
    scene.dataset.ai = state.ai ? 'on' : 'off';
    scene.dataset.media = state.media ? 'on' : 'off';
    scene.dataset.access = state.access ? 'on' : 'off';
    scene.dataset.energy = state.energy ? 'on' : 'off';
    scene.dataset.lounge = state.lounge ? 'on' : 'off';

    const descriptor = descriptorFromState();
    configTitle.textContent = `${contextNames[state.context]} ${descriptor}`;
    configText.textContent = buildDescription();
    sceneBadge.textContent = `${contextNames[state.context]} · ${state.theme === 'night' ? 'Night' : 'Day'}`;
    sceneTitle.textContent = {
      club: `${contextNames[state.context]} ${descriptor.toLowerCase()} setup`,
      resort: 'Resort signature court',
      urban: 'Urban landmark court',
    }[state.context];
    sceneDescription.textContent = buildDescription();

    updateSegments();
    updateTagList();
  };

  contextButtons.forEach(btn => btn.addEventListener('click', () => {
    state.context = btn.dataset.context;
    if (state.context === 'resort' && state.theme === 'night' && !state.media) {
      // Resort often benefits from a slightly more showy setup, keep default state unchanged otherwise.
    }
    applyState();
  }));

  themeButtons.forEach(btn => btn.addEventListener('click', () => {
    state.theme = btn.dataset.theme;
    applyState();
  }));

  featureInputs.forEach(input => {
    input.addEventListener('change', () => {
      state[input.dataset.feature] = input.checked;
      applyState();
    });
  });

  applyState();

  // DRAG TO ROTATE MODEL
  let dragging = false;
  let pointerStart = 0;
  let startSpin = -28;
  let currentSpin = -28;

  const setSpin = (value) => {
    const clamped = Math.max(-46, Math.min(6, value));
    courtModel.style.setProperty('--spin', `${clamped}deg`);
    currentSpin = clamped;
  };
  setSpin(currentSpin);

  const pointerDown = (clientX) => {
    dragging = true;
    pointerStart = clientX;
    startSpin = currentSpin;
  };
  const pointerMove = (clientX) => {
    if (!dragging) return;
    const delta = clientX - pointerStart;
    setSpin(startSpin + delta * 0.12);
  };
  const pointerUp = () => { dragging = false; };

  const stage = $('#courtShell');
  stage?.addEventListener('mousedown', (e) => pointerDown(e.clientX));
  window.addEventListener('mousemove', (e) => pointerMove(e.clientX));
  window.addEventListener('mouseup', pointerUp);
  stage?.addEventListener('touchstart', (e) => {
    pointerDown(e.touches[0].clientX);
  }, { passive: true });
  stage?.addEventListener('touchmove', (e) => {
    if (!dragging) return;
    pointerMove(e.touches[0].clientX);
  }, { passive: true });
  stage?.addEventListener('touchend', pointerUp);
})();
