(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // Contact / year
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  const config = window.GYNOID_CONFIG || {};
  const email = config.email || 'hello@gynoid.com';
  const whatsapp = config.whatsapp || '#';
  const emailCta = $('#emailCta');
  const emailText = $('#emailText');
  const whatsappCta = $('#whatsappCta');
  if (emailCta) emailCta.href = `mailto:${email}`;
  if (emailText) emailText.textContent = email;
  if (whatsappCta) {
    whatsappCta.href = whatsapp;
    whatsappCta.textContent = config.whatsappLabel || 'WhatsApp';
  }

  // Scroll progress
  const progressBar = $('#progressBar');
  const updateProgress = () => {
    if (!progressBar) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  // Reveal
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    revealItems.forEach(el => revealObserver.observe(el));
  } else {
    revealItems.forEach(el => el.classList.add('in-view'));
  }

  // Menu
  const sideMenu = $('#sideMenu');
  const menuOverlay = $('#menuOverlay');
  const menuToggle = $('#menuToggle');
  const menuClose = $('#menuClose');
  const openMenu = () => {
    sideMenu?.classList.add('is-open');
    sideMenu?.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    if (menuOverlay) menuOverlay.hidden = false;
    document.body.classList.add('menu-open');
  };
  const closeMenu = () => {
    sideMenu?.classList.remove('is-open');
    sideMenu?.setAttribute('aria-hidden', 'true');
    menuToggle?.setAttribute('aria-expanded', 'false');
    if (menuOverlay) menuOverlay.hidden = true;
    document.body.classList.remove('menu-open');
  };
  menuToggle?.addEventListener('click', openMenu);
  menuClose?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
  $$('.side-nav a, .side-cta a').forEach(link => link.addEventListener('click', closeMenu));

  const solutionsToggle = $('#solutionsToggle');
  const solutionsSubmenu = $('#solutionsSubmenu');
  solutionsToggle?.addEventListener('click', () => {
    const expanded = solutionsToggle.getAttribute('aria-expanded') === 'true';
    solutionsToggle.setAttribute('aria-expanded', String(!expanded));
    solutionsSubmenu?.classList.toggle('is-collapsed', expanded);
  });

  // Solutions slider: explicit Previous / Next navigation.
  const sliderTrack = $('#sliderTrack');
  const slides = sliderTrack ? $$('.slide-card', sliderTrack) : [];
  const dotsWrap = $('#sliderDots');
  const prevBtn = $('#sliderPrev');
  const nextBtn = $('#sliderNext');
  const slideCount = $('#slideCount');
  let currentSlide = 0;

  if (dotsWrap) {
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir a la solución ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      dotsWrap.appendChild(dot);
    });
  }
  const dots = dotsWrap ? $$('button', dotsWrap) : [];

  function updateSliderUI() {
    if (!sliderTrack || !slides.length) return;
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === currentSlide));
    dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === currentSlide));
    if (slideCount) slideCount.textContent = `${String(currentSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
  }

  function goToSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    updateSliderUI();
  }

  prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));
  $$('[data-slide-target]').forEach(el => el.addEventListener('click', () => {
    const target = Number(el.dataset.slideTarget);
    if (!Number.isNaN(target)) goToSlide(target);
  }));
  updateSliderUI();

  // Layered 2D configurator
  const layerInputs = $$('[data-feature]');
  const layerImages = $$('.visual-layer');
  const layerSwitches = $$('.layer-switch');
  const resetBtn = $('#layerReset');
  const configTags = $('#configTags');
  const configText = $('#configText');
  const visualStatusCount = $('#visualStatusCount');
  const visualStatusTitle = $('#visualStatusTitle');
  const detailImage = $('#layerDetailImage');
  const detailEyebrow = $('#layerDetailEyebrow');
  const detailTitle = $('#layerDetailTitle');
  const detailText = $('#layerDetailText');

  const defaultState = {
    media: true,
    ai: true,
    access: true,
    roof: true,
    energy: false,
    lounge: true,
  };
  const state = { ...defaultState };

  const featureInfo = {
    media: {
      label: 'Media LED',
      title: 'Vidrios LED activos',
      text: 'Publicidad, sponsors, eventos y modo juego integrados en las paredes de la pista.',
      image: 'assets/images/v10/media-led.jpg',
      alt: 'Pista Gynoid con Media LED',
    },
    ai: {
      label: 'Gynoid AI',
      title: 'Cámaras y analítica',
      text: 'Cámaras integradas detrás de los jugadores para grabación, highlights, análisis técnico y streaming.',
      image: 'assets/images/v10/camera-ai.jpg',
      alt: 'Cámara Gynoid AI integrada',
    },
    access: {
      label: 'Smart Access',
      title: 'Acceso conectado',
      text: 'App, NFC y QR temporal con un punto de acceso visible junto a la puerta de la pista.',
      image: 'assets/images/slide-access.webp',
      alt: 'Acceso inteligente Gynoid',
    },
    roof: {
      label: 'Techo retráctil',
      title: 'Climate layer',
      text: 'Cubierta retráctil para ampliar disponibilidad, confort y control del entorno de juego.',
      image: 'assets/images/v10/retractable-roof.jpg',
      alt: 'Techo retráctil Gynoid',
    },
    energy: {
      label: 'Solar Glass',
      title: 'Energía integrada',
      text: 'Paneles y vidrio solar para aportar generación energética visible y eficiencia al sistema.',
      image: 'assets/images/v10/solar-glass.jpg',
      alt: 'Paneles solares integrados en una pista Gynoid',
    },
    lounge: {
      label: 'Premium Comfort',
      title: 'Hospitality junto a la pista',
      text: 'Lounge, bancos, minibar y mini fridge para convertir la pista en una experiencia premium completa.',
      image: 'assets/images/v10/comfort-premium.jpg',
      alt: 'Equipamiento premium junto a una pista Gynoid',
    },
  };

  let lastTouched = 'media';

  function activeKeys() {
    return Object.keys(state).filter(key => state[key]);
  }

  function updateDetail(key) {
    const info = featureInfo[key];
    if (!info) return;
    lastTouched = key;
    if (detailImage) {
      detailImage.src = info.image;
      detailImage.alt = info.alt;
    }
    if (detailEyebrow) detailEyebrow.textContent = info.label.toUpperCase();
    if (detailTitle) detailTitle.textContent = info.title;
    if (detailText) detailText.textContent = info.text;
  }

  function updateConfigurator() {
    const active = activeKeys();
    layerImages.forEach(layer => {
      const key = layer.dataset.layer;
      layer.classList.toggle('is-active', !!state[key]);
    });
    layerInputs.forEach(input => {
      const key = input.dataset.feature;
      input.checked = !!state[key];
    });
    layerSwitches.forEach(switchEl => {
      const key = switchEl.dataset.layerKey;
      switchEl.classList.toggle('is-on', !!state[key]);
    });

    if (configTags) {
      configTags.innerHTML = '';
      active.forEach(key => {
        const span = document.createElement('span');
        span.textContent = featureInfo[key].label;
        configTags.appendChild(span);
      });
    }
    if (visualStatusCount) visualStatusCount.textContent = `${active.length} ${active.length === 1 ? 'solución activa' : 'soluciones activas'}`;
    if (visualStatusTitle) visualStatusTitle.textContent = active.length >= 5 ? 'Gynoid Signature' : active.length >= 3 ? 'Gynoid Connected' : 'Gynoid Essential';
    if (configText) {
      configText.textContent = active.length
        ? `Configuración con ${active.map(key => featureInfo[key].label).join(', ')}.`
        : 'Pista base sin capas adicionales activas.';
    }

    // If the latest touched feature was disabled, keep its detail card visible as an explanation.
    updateDetail(lastTouched);
  }

  layerInputs.forEach(input => {
    input.addEventListener('change', () => {
      const key = input.dataset.feature;
      state[key] = input.checked;

      // Solar panels live on the retractable roof layer.
      if (key === 'energy' && input.checked) state.roof = true;
      if (key === 'roof' && !input.checked) state.energy = false;

      updateDetail(key);
      updateConfigurator();
    });
  });
  layerSwitches.forEach(switchEl => {
    switchEl.addEventListener('mouseenter', () => updateDetail(switchEl.dataset.layerKey));
    switchEl.addEventListener('focusin', () => updateDetail(switchEl.dataset.layerKey));
  });
  resetBtn?.addEventListener('click', () => {
    Object.assign(state, defaultState);
    lastTouched = 'media';
    updateConfigurator();
  });
  updateConfigurator();
})();
