(() => {
  const config = window.GYNOID_CONFIG || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('siteNav');
  const progress = document.getElementById('scrollProgress');
  const heroBg = document.querySelector('.hero-bg');
  const aura = document.querySelector('.pointer-aura');
  const year = document.getElementById('year');
  const parallaxElements = [...document.querySelectorAll('[data-parallax]')];

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

  const updateParallax = () => {
    if (reduceMotion) return;
    parallaxElements.forEach(el => {
      const speed = Number(el.dataset.parallax || '0');
      const rect = el.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const offset = (rect.top + rect.height / 2 - viewportCenter) * speed;
      el.style.transform = `translate3d(0, ${offset * -1}px, 0)`;
    });
  };

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 24);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? Math.min(100, Math.max(0, y / max * 100)) : 0;
    if (progress) progress.style.width = `${pct}%`;

    if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
      heroBg.style.transform = `scale(1.06) translateY(${y * 0.075}px)`;
    }
    updateParallax();
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });
  onScroll();

  if (aura && !reduceMotion) {
    window.addEventListener('pointermove', e => {
      aura.style.left = `${e.clientX}px`;
      aura.style.top = `${e.clientY}px`;
    }, { passive: true });
  }

  const revealElements = [...document.querySelectorAll('.reveal')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealElements.forEach(el => observer.observe(el));
  }

  const modules = {
    court: {
      badge: 'CORE / COURT',
      eyebrow: 'THE FOUNDATION',
      title: 'La base premium sobre la que se apoya todo.',
      text: 'Una pista pensada como producto: estructura, cristal, suelo e iluminación resueltos con una lectura visual premium.',
      chips: ['Estructura premium', 'Cristal panorámico', 'Suelo técnico', 'Iluminación'],
      useCases: ['Clubs premium', 'Hospitality', 'Real estate'],
      features: [
        { title: 'Diseño', text: 'Arquitectura y acabados que elevan la percepción del espacio.' },
        { title: 'Juego', text: 'Base física preparada para rendimiento y confort.' },
        { title: 'Imagen', text: 'Una pista que ya parece distinta desde el primer vistazo.' },
        { title: 'Integración', text: 'Lista para conectarse con el resto del ecosistema Gynoid.' }
      ],
      image: 'assets/images/v4/hero-court.png',
      alt: 'Pista Gynoid premium'
    },
    ai: {
      badge: 'TECH / GYNOID AI',
      eyebrow: 'CAPTURE · ANALYZE · SHARE',
      title: 'Cada partido puede convertirse en contenido y datos útiles.',
      text: 'Las cámaras y el software amplían la experiencia antes, durante y después del juego.',
      chips: ['Multicámara', 'Highlights', 'Estadísticas', 'Streaming'],
      useCases: ['Club operations', 'Entrenamiento', 'Eventos'],
      features: [
        { title: 'Grabación', text: 'Captura del partido de forma automática.' },
        { title: 'Análisis', text: 'Lectura visual de rendimiento, patrones y juego.' },
        { title: 'Contenido', text: 'Highlights y activos compartibles para jugador o club.' },
        { title: 'Valor', text: 'La experiencia continúa también fuera de la pista.' }
      ],
      image: 'assets/images/v4/ai-cameras.png',
      alt: 'Sistema Gynoid AI con cámaras y analítica'
    },
    access: {
      badge: 'ACCESS / SMART',
      eyebrow: 'APP · NFC · QR',
      title: 'La reserva se convierte en acceso de forma natural.',
      text: 'Una experiencia más fluida para jugadores, invitados, entrenadores y staff.',
      chips: ['App', 'NFC', 'Bluetooth', 'QR temporal'],
      useCases: ['Players', 'Invitados', 'Staff'],
      features: [
        { title: 'Fricción cero', text: 'Abrir la pista desde móvil o credencial digital.' },
        { title: 'Permisos', text: 'Usuarios y ventanas de uso controladas.' },
        { title: 'Control', text: 'Trazabilidad y orden operativo.' },
        { title: 'Experiencia', text: 'Un acceso que ya transmite tecnología premium.' }
      ],
      image: 'assets/images/v4/smart-access.png',
      alt: 'Acceso inteligente Gynoid'
    },
    media: {
      badge: 'MEDIA / LED',
      eyebrow: 'BRAND IMPACT',
      title: 'La pista también puede funcionar como soporte visual.',
      text: 'Contenido, publicidad y activaciones que transforman la pista en una plataforma de marca.',
      chips: ['LED glass', 'Publicidad', 'Contenido', 'Eventos'],
      useCases: ['Brands', 'Hospitality', 'Launch events'],
      features: [
        { title: 'Pantalla viva', text: 'Los cerramientos se convierten en superficie digital.' },
        { title: 'Patrocinios', text: 'Nuevas oportunidades para marcas y activaciones.' },
        { title: 'Eventos', text: 'Un escenario más potente para experiencias especiales.' },
        { title: 'Gestión remota', text: 'Cambiar contenidos según uso o momento.' }
      ],
      image: 'assets/images/v4/led-media.png',
      alt: 'Media LED integrado en una pista Gynoid'
    },
    climate: {
      badge: 'CLIMATE / ROOF',
      eyebrow: 'ALL WEATHER PLAY',
      title: 'Más control sobre el clima. Más flexibilidad operativa.',
      text: 'El techo retráctil y la automatización permiten adaptar la experiencia de juego al contexto.',
      chips: ['Techo retráctil', 'Sensores', 'Automatización', 'Control remoto'],
      useCases: ['Outdoor clubs', 'Resorts', 'All-year play'],
      features: [
        { title: 'Cobertura', text: 'Jugar protegido cuando el entorno lo requiere.' },
        { title: 'Automatización', text: 'Apertura y cierre integrados en el sistema.' },
        { title: 'Continuidad', text: 'Más días útiles y menos dependencia del clima.' },
        { title: 'Confort', text: 'Una experiencia más consistente para el usuario.' }
      ],
      image: 'assets/images/v4/retractable-roof.png',
      alt: 'Techo retráctil Gynoid'
    },
    energy: {
      badge: 'ENERGY / BIPV',
      eyebrow: 'SOLAR · EFFICIENCY',
      title: 'Innovación con una lectura de sostenibilidad visible.',
      text: 'Los vidrios solares aportan eficiencia y refuerzan el posicionamiento tecnológico del proyecto.',
      chips: ['Vidrio solar', 'Monitorización', 'Eficiencia', 'Sostenibilidad'],
      useCases: ['Sustainable projects', 'Real estate', 'Premium concept'],
      features: [
        { title: 'Integración', text: 'Tecnología energética dentro de la arquitectura.' },
        { title: 'Imagen', text: 'Un mensaje innovador y diferencial desde la propia pista.' },
        { title: 'Datos', text: 'Posibilidad de monitorizar la capa energética.' },
        { title: 'Marca', text: 'Refuerza la narrativa premium y sostenible del proyecto.' }
      ],
      image: 'assets/images/v4/solar-glass.png',
      alt: 'Vidrio solar integrado en pista Gynoid'
    }
  };

  const journey = {
    reserve: {
      eyebrow: 'BEFORE THE MATCH',
      title: 'La experiencia empieza en la reserva.',
      text: 'El usuario reserva y la operación se ordena desde una capa digital que deja todo preparado para el acceso y el uso.',
      points: ['Asignación de pista y horario.', 'Preparación del acceso asociado a la reserva.', 'Base para una experiencia más fluida y conectada.'],
      image: 'assets/images/v4/smart-access.png',
      alt: 'Reserva y acceso Gynoid'
    },
    access: {
      eyebrow: 'SMART ENTRY',
      title: 'Entrar es rápido, claro y sin fricción.',
      text: 'App, NFC, Bluetooth o QR temporal para abrir la pista con una interacción simple y moderna.',
      points: ['Acceso desde el móvil.', 'Gestión de invitados y staff.', 'Trazabilidad y control del uso.'],
      image: 'assets/images/v4/smart-access.png',
      alt: 'Acceso inteligente Gynoid'
    },
    play: {
      eyebrow: 'ON COURT',
      title: 'La pista transmite inmediatamente nivel y calidad.',
      text: 'Diseño, materiales, iluminación y ambiente premium construyen una experiencia superior durante el juego.',
      points: ['Pista premium.', 'Confort y ambientación.', 'Una experiencia de juego memorable.'],
      image: 'assets/images/v4/hero-court.png',
      alt: 'Juego en una pista Gynoid premium'
    },
    analyze: {
      eyebrow: 'AFTER THE POINT',
      title: 'El partido puede convertirse en análisis y contenido.',
      text: 'Cámaras y software para grabar, analizar y compartir el juego con una lectura más rica.',
      points: ['Grabación automática.', 'Highlights compartibles.', 'Datos y aprendizaje para el jugador o el club.'],
      image: 'assets/images/v4/ai-cameras.png',
      alt: 'Análisis de partido Gynoid'
    },
    activate: {
      eyebrow: 'BEYOND THE MATCH',
      title: 'La pista también puede generar impacto de marca.',
      text: 'Media LED, eventos, activaciones y usos hospitality que extienden el valor del espacio más allá del partido.',
      points: ['Contenido visual y publicidad.', 'Activaciones de marca y eventos.', 'Más valor de negocio alrededor de la pista.'],
      image: 'assets/images/v4/led-media.png',
      alt: 'Media LED y activaciones Gynoid'
    }
  };

  const moduleButtons = [...document.querySelectorAll('.solution-pill')];
  const infoCards = [...document.querySelectorAll('[data-open-module]')];
  const moduleImage = document.getElementById('moduleImage');
  const moduleVisualButton = document.getElementById('moduleVisualButton');
  const moduleBadge = document.getElementById('moduleBadge');
  const moduleEyebrow = document.getElementById('moduleEyebrow');
  const moduleTitle = document.getElementById('moduleTitle');
  const moduleText = document.getElementById('moduleText');
  const moduleChips = document.getElementById('moduleChips');
  const moduleUseCases = document.getElementById('moduleUseCases');
  const moduleFeatures = document.getElementById('moduleFeatures');

  const setModule = key => {
    const data = modules[key];
    if (!data) return;
    moduleButtons.forEach(button => {
      const active = button.dataset.module === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    infoCards.forEach(card => card.classList.toggle('is-active', card.dataset.openModule === key));
    if (moduleImage) {
      moduleImage.src = data.image;
      moduleImage.alt = data.alt;
    }
    moduleVisualButton?.setAttribute('data-lightbox', data.image);
    if (moduleBadge) moduleBadge.textContent = data.badge;
    if (moduleEyebrow) moduleEyebrow.textContent = data.eyebrow;
    if (moduleTitle) moduleTitle.textContent = data.title;
    if (moduleText) moduleText.textContent = data.text;
    if (moduleChips) moduleChips.innerHTML = data.chips.map(item => `<span>${item}</span>`).join('');
    if (moduleUseCases) moduleUseCases.innerHTML = data.useCases.map(item => `<span>${item}</span>`).join('');
    if (moduleFeatures) moduleFeatures.innerHTML = data.features.map(item => `
      <article class="mini-feature-card">
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </article>`).join('');
  };

  moduleButtons.forEach(button => button.addEventListener('click', () => setModule(button.dataset.module)));
  infoCards.forEach(card => card.addEventListener('click', () => {
    setModule(card.dataset.openModule);
    document.getElementById('solutions')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }));
  setModule('court');

  const journeyButtons = [...document.querySelectorAll('.journey-step')];
  const journeyImage = document.getElementById('journeyImage');
  const journeyVisualButton = document.getElementById('journeyVisualButton');
  const journeyEyebrow = document.getElementById('journeyEyebrow');
  const journeyTitle = document.getElementById('journeyTitle');
  const journeyText = document.getElementById('journeyText');
  const journeyPoints = document.getElementById('journeyPoints');

  const setJourney = key => {
    const data = journey[key];
    if (!data) return;
    journeyButtons.forEach(button => {
      const active = button.dataset.journey === key;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (journeyImage) {
      journeyImage.src = data.image;
      journeyImage.alt = data.alt;
    }
    journeyVisualButton?.setAttribute('data-lightbox', data.image);
    if (journeyEyebrow) journeyEyebrow.textContent = data.eyebrow;
    if (journeyTitle) journeyTitle.textContent = data.title;
    if (journeyText) journeyText.textContent = data.text;
    if (journeyPoints) journeyPoints.innerHTML = data.points.map(point => `<li>${point}</li>`).join('');
  };

  journeyButtons.forEach(button => button.addEventListener('click', () => setJourney(button.dataset.journey)));
  setJourney('reserve');

  const stage = document.getElementById('configuratorStage');
  const contextButtons = [...document.querySelectorAll('#contextSelector .segment')];
  const themeButtons = [...document.querySelectorAll('#themeSelector .segment')];
  const toggleInputs = [...document.querySelectorAll('.toggle-card input[data-toggle]')];
  const configProjectType = document.getElementById('configProjectType');
  const configHeadline = document.getElementById('configHeadline');
  const configDescription = document.getElementById('configDescription');
  const configSummaryChips = document.getElementById('configSummaryChips');
  const configSummaryText = document.getElementById('configSummaryText');

  let currentContext = 'club';
  let currentTheme = 'night';

  const contextLabels = {
    club: 'Club premium',
    resort: 'Resort & hospitality',
    city: 'Urban flagship'
  };

  const optionLabels = {
    roof: 'Roof',
    ai: 'AI',
    media: 'Media',
    access: 'Access',
    energy: 'Energy'
  };

  const describeConfiguration = (context, enabled) => {
    const activeLabels = enabled.map(key => optionLabels[key]);
    const headlineBase = activeLabels.length ? `Pista premium + ${activeLabels.join(' + ')}` : 'Pista premium esencial';

    let description = 'Una configuración equilibrada para proyectos que buscan una experiencia premium y clara.';
    if (context === 'resort') description = 'Pensada para hospitality y resort: más imagen, más confort y mayor efecto wow.';
    if (context === 'city') description = 'Ideal para un proyecto urbano icónico: tecnología visible, identidad de marca y alto impacto visual.';

    if (enabled.includes('media') && enabled.includes('ai')) {
      description = 'Una configuración muy potente para contenido, comunidad, eventos y valor de marca alrededor de la pista.';
    } else if (enabled.includes('energy') && enabled.includes('roof')) {
      description = 'Una configuración avanzada que combina confort operativo, eficiencia y narrativa innovadora.';
    } else if (enabled.length <= 2) {
      description = 'Una configuración simple y premium para empezar con una base sólida y capacidad de evolucionar.';
    }

    let summary = 'Ideal para un club premium que quiere una experiencia conectada y lista para crecer.';
    if (context === 'resort') summary = 'Enfocada a resorts y hospitality: experiencia memorable, lujo y diferenciación.';
    if (context === 'city') summary = 'Enfocada a un flagship urbano: impacto visual, operación tecnológica y posicionamiento.';
    if (enabled.includes('media')) summary += ' La capa Media añade potencial para activaciones y branding.';
    if (enabled.includes('energy')) summary += ' Energy refuerza una narrativa sostenible y tecnológica.';

    return { headline: headlineBase, description, summary };
  };

  const updateConfigurator = () => {
    if (!stage) return;
    const enabled = toggleInputs.filter(input => input.checked).map(input => input.dataset.toggle);

    stage.dataset.context = currentContext;
    stage.dataset.theme = currentTheme;
    ['roof', 'ai', 'media', 'access', 'energy'].forEach(key => {
      stage.dataset[key] = enabled.includes(key) ? 'on' : 'off';
    });

    const copy = describeConfiguration(currentContext, enabled);
    if (configProjectType) configProjectType.textContent = contextLabels[currentContext];
    if (configHeadline) configHeadline.textContent = copy.headline;
    if (configDescription) configDescription.textContent = copy.description;
    if (configSummaryText) configSummaryText.textContent = copy.summary;

    if (configSummaryChips) {
      const chips = ['Premium Court', ...enabled.map(key => optionLabels[key])];
      configSummaryChips.innerHTML = chips.map(item => `<span>${item}</span>`).join('');
    }
  };

  contextButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentContext = button.dataset.context;
      contextButtons.forEach(el => el.classList.toggle('is-active', el === button));
      updateConfigurator();
    });
  });

  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentTheme = button.dataset.theme;
      themeButtons.forEach(el => el.classList.toggle('is-active', el === button));
      updateConfigurator();
    });
  });

  toggleInputs.forEach(input => input.addEventListener('change', updateConfigurator));
  updateConfigurator();

  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxClose = document.getElementById('lightboxClose');

  const openLightbox = button => {
    const src = button.getAttribute('data-lightbox');
    if (!src || !lightbox || !lightboxImage) return;
    const img = button.querySelector('img');
    lightboxImage.src = src;
    lightboxImage.alt = img?.alt || 'Imagen Gynoid ampliada';
    if (typeof lightbox.showModal === 'function') lightbox.showModal();
  };

  document.querySelectorAll('[data-lightbox]').forEach(button => {
    button.addEventListener('click', () => openLightbox(button));
  });
  lightboxClose?.addEventListener('click', () => lightbox?.close());
  lightbox?.addEventListener('click', e => {
    const rect = lightbox.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) lightbox.close();
  });

  const contactLink = document.querySelector('[data-contact-email]');
  if (contactLink) {
    if (config.contactEmail) {
      contactLink.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent('Proyecto Gynoid')}`;
      document.querySelector('.contact-note')?.remove();
    } else {
      contactLink.addEventListener('click', e => {
        e.preventDefault();
        alert('Añade el email de contacto en js/config.js para activar este botón.');
      });
    }
  }

  Object.entries({ instagram: config.instagram, linkedin: config.linkedin, whatsapp: config.whatsapp }).forEach(([name, href]) => {
    if (!href) return;
    const el = document.querySelector(`[data-social="${name}"]`);
    if (!el) return;
    el.href = href;
    el.hidden = false;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  });
})();
