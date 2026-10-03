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
    const pct = max > 0 ? Math.min(100, Math.max(0, y / max * 100)) : 0;
    if (progress) progress.style.width = `${pct}%`;
    if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
      heroBg.style.transform = `scale(1.04) translateY(${y * 0.06}px)`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
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

  const systems = {
    court: {
      badge: 'CORE / COURT', eyebrow: 'THE FOUNDATION',
      title: 'Todo empieza por una pista que ya parece distinta.',
      text: 'Estructura premium, cerramientos panorámicos, superficie técnica, red e iluminación se diseñan como un producto coherente, no como una suma de componentes.',
      chips: ['Estructura premium','Cristal panorámico','Suelo técnico','Iluminación'],
      list: ['Arquitectura y acabados pensados para posicionamiento high-end.','Base física preparada para integrar tecnología y automatización.','Diseño con presencia suficiente para convertirse en pieza central del espacio.'],
      image: 'assets/images/v3/hero-court.webp', alt: 'Pista Gynoid premium'
    },
    ai: {
      badge: 'TECH / GYNOID AI', eyebrow: 'CAPTURE · ANALYZE · SHARE',
      title: 'Cada partido puede convertirse en contenido y datos.',
      text: 'Cámaras, software y analítica convierten la actividad de la pista en una experiencia digital: grabación, estadísticas, highlights y contenido compartible.',
      chips: ['Multicámara','Highlights','Estadísticas','Streaming'],
      list: ['Grabación automática y recuperación del partido.','Análisis visual de juego, movimiento y patrones.','Contenido que prolonga la relación con el jugador después del partido.'],
      image: 'assets/images/v3/ai-cameras.webp', alt: 'Sistema Gynoid AI con cámaras y analítica'
    },
    media: {
      badge: 'MEDIA / LED', eyebrow: 'BRAND IMPACT',
      title: 'La pista también puede funcionar como pantalla.',
      text: 'Vidrios LED y superficies digitales permiten convertir la cancha en un soporte de marca, publicidad, eventos y experiencias audiovisuales.',
      chips: ['LED glass','Branding','Eventos','Contenido 3D'],
      list: ['Publicidad y patrocinios integrados en el propio espacio.','Activaciones y contenido dinámico cuando la pista no está en juego.','Gestión remota para adaptar el contenido a cada uso.'],
      image: 'assets/images/v3/led-glass.webp', alt: 'Vidrios LED integrados en una pista Gynoid'
    },
    access: {
      badge: 'ACCESS / SMART', eyebrow: 'APP · NFC · QR',
      title: 'La reserva se convierte en la llave.',
      text: 'Acceso digital para jugadores, invitados, entrenadores y staff mediante aplicación móvil, NFC, Bluetooth o QR temporal.',
      chips: ['App','NFC','Bluetooth','QR temporal'],
      list: ['Acceso sin fricción para distintos perfiles.','Control de horarios y permisos temporales.','Trazabilidad de actividad y gestión desde una capa digital.'],
      image: 'assets/images/v3/smart-access.webp', alt: 'Acceso inteligente Gynoid mediante app y NFC'
    },
    climate: {
      badge: 'CLIMATE / ROOF', eyebrow: 'ALL WEATHER PLAY',
      title: 'Outdoor cuando quieres. Indoor cuando lo necesitas.',
      text: 'El techo retráctil y la automatización climática amplían la operatividad de la pista y permiten adaptar la experiencia a las condiciones del entorno.',
      chips: ['Techo retráctil','Sensores','Automatización','Control remoto'],
      list: ['Apertura y cierre motorizados integrados en la arquitectura.','Capacidad de respuesta frente a lluvia o condiciones adversas.','Mayor flexibilidad para proyectos de club y hospitality.'],
      image: 'assets/images/v3/retractable-roof.webp', alt: 'Techo retráctil Gynoid'
    },
    energy: {
      badge: 'ENERGY / BIPV', eyebrow: 'SOLAR · EFFICIENCY',
      title: 'La arquitectura puede formar parte del sistema energético.',
      text: 'La integración de vidrio fotovoltaico suma una dimensión de eficiencia, monitorización y sostenibilidad al concepto de pista tecnológica.',
      chips: ['Vidrio solar','Monitorización','Eficiencia','Sostenibilidad'],
      list: ['Generación integrada en elementos arquitectónicos.','Datos energéticos dentro del ecosistema de control.','Una narrativa tecnológica y sostenible especialmente potente para proyectos premium.'],
      image: 'assets/images/v3/solar-glass.webp', alt: 'Vidrio solar integrado en pista Gynoid'
    }
  };

  const tabs = [...document.querySelectorAll('.system-tab')];
  const image = document.getElementById('systemImage');
  const imageButton = document.getElementById('systemImageButton');
  const badge = document.getElementById('systemBadge');
  const eyebrow = document.getElementById('systemEyebrow');
  const title = document.getElementById('systemTitle');
  const text = document.getElementById('systemText');
  const chips = document.getElementById('systemChips');
  const list = document.getElementById('systemList');

  const setSystem = key => {
    const data = systems[key];
    if (!data) return;
    tabs.forEach(tab => {
      const active = tab.dataset.system === key;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    if (image) { image.src = data.image; image.alt = data.alt; }
    imageButton?.setAttribute('data-lightbox', data.image);
    if (badge) badge.textContent = data.badge;
    if (eyebrow) eyebrow.textContent = data.eyebrow;
    if (title) title.textContent = data.title;
    if (text) text.textContent = data.text;
    if (chips) chips.innerHTML = data.chips.map(x => `<span>${x}</span>`).join('');
    if (list) list.innerHTML = data.list.map(x => `<li>${x}</li>`).join('');
  };

  tabs.forEach(tab => tab.addEventListener('click', () => setSystem(tab.dataset.system)));
  setSystem('court');

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
  imageButton?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(imageButton); }
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
