const wrap = document.getElementById('threeWrap');
const canvas = document.getElementById('court3d');
const loader = document.getElementById('threeLoader');

if (wrap && canvas) init();

async function init() {
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js');
  } catch (error) {
    console.error('Three.js could not be loaded', error);
    loader.innerHTML = '<strong>No se pudo cargar el motor 3D.</strong><span>Comprueba tu conexión a internet o abre la web desde GitHub Pages / Live Server.</span>';
    loader.classList.add('is-error');
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111b);
  scene.fog = new THREE.Fog(0x07111b, 30, 85);

  const camera = new THREE.PerspectiveCamera(41, 1, 0.1, 180);
  const target = new THREE.Vector3(0, 2.1, 0);
  let azimuth = -0.84;
  let polar = 1.05;
  let distance = 34;
  const defaultView = { azimuth, polar, distance };

  const world = new THREE.Group();
  scene.add(world);

  const hemi = new THREE.HemisphereLight(0xa2d7ff, 0x10161f, 1.9);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-12, 18, 10);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -30;
  key.shadow.camera.right = 30;
  key.shadow.camera.top = 30;
  key.shadow.camera.bottom = -18;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x2ee7ff, 1.25);
  rim.position.set(16, 11, -16);
  scene.add(rim);
  const fill = new THREE.PointLight(0x5ebdff, 1.4, 80, 2);
  fill.position.set(0, 10, 14);
  scene.add(fill);

  const state = {
    context: 'club',
    theme: 'night',
    roof: true,
    ai: true,
    media: true,
    access: true,
    energy: false,
    lounge: true,
  };

  const materials = createMaterials(THREE);
  const textures = createTextures(THREE);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), materials.ground);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.11;
  ground.receiveShadow = true;
  world.add(ground);

  const court = new THREE.Group();
  world.add(court);

  const podium = meshBox(THREE, 12.4, 0.22, 22.4, materials.podium, 0, -0.01, 0);
  podium.receiveShadow = true;
  court.add(podium);

  const floor = meshBox(THREE, 10, 0.14, 20, materials.floor, 0, 0.08, 0);
  floor.receiveShadow = true;
  court.add(floor);
  addCourtLines(THREE, court, materials.line);
  addNet(THREE, court, materials, textures.net);

  const wallLayer = createCourtWalls(THREE, materials, textures.mesh);
  court.add(wallLayer.group);
  addBaseLighting(THREE, court, materials);
  addBrandWordmark(THREE, court, textures.wordmark);

  const roofGroup = createRoof(THREE, materials);
  const aiGroup = createAI(THREE, materials, textures);
  const mediaGroup = createMedia(THREE, materials, textures);
  const accessGroup = createAccess(THREE, materials);
  const energyGroup = createEnergy(THREE, materials, textures);
  const loungeGroup = createLounge(THREE, materials);

  court.add(roofGroup, aiGroup, mediaGroup, accessGroup, energyGroup, loungeGroup);

  const contexts = {
    club: createClubContext(THREE, materials, textures),
    resort: createResortContext(THREE, materials),
    urban: createUrbanContext(THREE, materials, textures)
  };
  Object.values(contexts).forEach(group => world.add(group));

  // UI bindings
  const featureInputs = [...document.querySelectorAll('[data-feature]')];
  const contextButtons = [...document.querySelectorAll('#contextSelector [data-context]')];
  const themeButtons = [...document.querySelectorAll('#themeSelector [data-theme]')];
  const configTitle = document.getElementById('configTitle');
  const configText = document.getElementById('configText');
  const configTags = document.getElementById('configTags');
  const sceneBadge = document.getElementById('sceneBadge');
  const sceneTitle = document.getElementById('sceneTitle');
  const sceneDescription = document.getElementById('sceneDescription');
  const resetBtn = document.getElementById('threeReset');

  const labels = {
    roof: 'Techo retráctil',
    ai: 'Gynoid AI',
    media: 'Media LED',
    access: 'Smart Access',
    energy: 'Solar Glass',
    lounge: 'Premium Comfort',
  };
  const contextNames = { club: 'Club', resort: 'Resort', urban: 'Urban' };

  function descriptor() {
    if (state.media && state.ai && state.lounge) return 'Signature';
    if (state.media && state.access) return 'Commercial';
    if (state.energy && state.roof) return 'Sustainable';
    if (state.ai) return 'Connected';
    return 'Premium';
  }

  function description() {
    const active = Object.keys(labels).filter(key => state[key]).map(key => labels[key]);
    const top = active.slice(0, 4).join(', ') || 'base premium';
    const ctx = {
      club: 'Pensada para clubes de pádel y sports clubs que quieren diferenciar experiencia, operación y contenido.',
      resort: 'Enfocada a hospitality, resorts y branded residences donde la pista también aporta valor visual.',
      urban: 'Diseñada para entornos urbanos, rooftops y proyectos icónicos con fuerte capacidad de marca.'
    }[state.context];
    return `${top}. ${ctx}`;
  }

  function updateSummary() {
    const name = contextNames[state.context];
    const desc = descriptor();
    configTitle.textContent = `${name} ${desc}`;
    configText.textContent = description();
    sceneBadge.textContent = `${name} · ${state.theme === 'night' ? 'Night' : 'Day'}`;
    sceneTitle.textContent = `${name} ${desc.toLowerCase()} court`;
    sceneDescription.textContent = description();
    configTags.innerHTML = '';
    [name, state.theme === 'night' ? 'Night' : 'Day', ...Object.keys(labels).filter(k => state[k]).map(k => labels[k])]
      .forEach(label => {
        const span = document.createElement('span');
        span.textContent = label;
        configTags.appendChild(span);
      });
  }

  function setFeatureVisibility() {
    roofGroup.visible = state.roof;
    aiGroup.visible = state.ai;
    mediaGroup.visible = state.media;
    accessGroup.visible = state.access;
    energyGroup.visible = state.energy;
    loungeGroup.visible = state.lounge;

    featureInputs.forEach(input => {
      input.checked = !!state[input.dataset.feature];
      input.closest('.toggle-card')?.classList.toggle('is-on', input.checked);
    });
  }

  function setContext() {
    Object.entries(contexts).forEach(([name, group]) => { group.visible = name === state.context; });
    contextButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.context === state.context));
  }

  function setTheme() {
    const night = state.theme === 'night';
    scene.background.setHex(night ? 0x07111b : 0xd9efff);
    scene.fog.color.setHex(night ? 0x07111b : 0xd9efff);
    materials.ground.color.setHex(night ? 0x151f29 : 0xdde3e6);
    materials.podium.color.setHex(night ? 0x5a6775 : 0xd8dee3);
    hemi.color.setHex(night ? 0x9dd4ff : 0xffffff);
    hemi.groundColor.setHex(night ? 0x121922 : 0x90a0ab);
    hemi.intensity = night ? 1.9 : 2.35;
    key.intensity = night ? 2.6 : 3.1;
    rim.intensity = night ? 1.25 : 0.45;
    fill.intensity = night ? 1.4 : 0.25;
    renderer.toneMappingExposure = night ? 1.04 : 1.14;
    themeButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.theme === state.theme));

    court.traverse(obj => {
      if (obj.userData?.isLamp && obj.material) obj.material.emissiveIntensity = night ? 6.8 : 1.6;
      if (obj.isPointLight && obj.userData?.isCourtLight) obj.intensity = night ? 28 : 5.5;
      if (obj.userData?.isLedMaterial && obj.material) obj.material.emissiveIntensity = night ? 4.0 : 2.25;
      if (obj.userData?.isAiScreen && obj.material) obj.material.opacity = night ? 0.96 : 0.76;
    });
  }

  function applyState() {
    setFeatureVisibility();
    setContext();
    setTheme();
    updateSummary();
  }

  contextButtons.forEach(btn => btn.addEventListener('click', () => { state.context = btn.dataset.context; applyState(); }));
  themeButtons.forEach(btn => btn.addEventListener('click', () => { state.theme = btn.dataset.theme; applyState(); }));
  featureInputs.forEach(input => input.addEventListener('change', () => { state[input.dataset.feature] = input.checked; applyState(); }));
  resetBtn?.addEventListener('click', () => { azimuth = defaultView.azimuth; polar = defaultView.polar; distance = defaultView.distance; });

  // Camera controls
  const pointers = new Map();
  let dragStart = null;
  let pinchStart = null;

  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', event => {
    canvas.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      dragStart = { x: event.clientX, y: event.clientY, azimuth, polar };
    } else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinchStart = { distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), zoom: distance };
    }
  });
  canvas.addEventListener('pointermove', event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1 && dragStart) {
      azimuth = dragStart.azimuth - (event.clientX - dragStart.x) * 0.007;
      polar = THREE.MathUtils.clamp(dragStart.polar + (event.clientY - dragStart.y) * 0.005, 0.52, 1.34);
    } else if (pointers.size === 2 && pinchStart) {
      const pts = [...pointers.values()];
      const now = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (now > 0) distance = THREE.MathUtils.clamp(pinchStart.zoom * (pinchStart.distance / now), 19, 48);
    }
  });
  const endPointer = event => {
    pointers.delete(event.pointerId);
    if (pointers.size === 0) {
      dragStart = null;
      pinchStart = null;
    } else if (pointers.size === 1) {
      const pt = [...pointers.values()][0];
      dragStart = { x: pt.x, y: pt.y, azimuth, polar };
      pinchStart = null;
    }
  };
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.015, 19, 48);
  }, { passive: false });
  canvas.addEventListener('dblclick', () => resetBtn?.click());

  function updateCamera() {
    const sin = Math.sin(polar);
    camera.position.set(
      target.x + distance * sin * Math.cos(azimuth),
      target.y + distance * Math.cos(polar),
      target.z + distance * sin * Math.sin(azimuth)
    );
    camera.lookAt(target);
  }

  function resize() {
    const rect = wrap.getBoundingClientRect();
    const width = Math.max(320, rect.width);
    const height = Math.max(420, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(wrap);
  resize();

  const clock = new THREE.Clock();
  function render() {
    const t = clock.getElapsedTime();
    updateCamera();

    if (mediaGroup.visible) {
      mediaGroup.children.forEach((mesh, i) => {
        if (mesh.material && 'emissiveIntensity' in mesh.material) {
          mesh.material.emissiveIntensity = (state.theme === 'night' ? 3.8 : 2.2) + Math.sin(t * 1.1 + i * .55) * 0.45;
        }
      });
    }
    if (aiGroup.visible) {
      aiGroup.traverse(obj => {
        if (obj.userData?.isCone && obj.material) obj.material.opacity = 0.09 + Math.sin(t * 2 + obj.position.x) * 0.018;
      });
    }
    if (contexts.resort.visible) {
      contexts.resort.traverse(obj => {
        if (obj.userData?.wave) obj.position.y = obj.userData.baseY + Math.sin(t * 0.8 + obj.position.x * 0.1) * 0.04;
      });
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  applyState();
  loader.classList.add('is-hidden');
  render();
}

function createMaterials(THREE) {
  return {
    ground: new THREE.MeshStandardMaterial({ color: 0x151f29, roughness: 0.9, metalness: 0.03 }),
    podium: new THREE.MeshStandardMaterial({ color: 0x5a6775, roughness: 0.88, metalness: 0.05 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x0f67da, roughness: 0.72, metalness: 0.02 }),
    line: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.34, metalness: 0.88 }),
    steelSoft: new THREE.MeshStandardMaterial({ color: 0x263341, roughness: 0.42, metalness: 0.72 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xbbe8ff, transparent: true, opacity: 0.18, roughness: 0.06, metalness: 0, transmission: 0.52, thickness: 0.12, side: THREE.DoubleSide }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcff7ff, emissiveIntensity: 6.8, roughness: 0.2 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf0f3f7, roughness: 0.55 }),
    black: new THREE.MeshStandardMaterial({ color: 0x06090d, roughness: 0.4 }),
    loungeDark: new THREE.MeshStandardMaterial({ color: 0x1f252f, roughness: 0.72 }),
    loungeLight: new THREE.MeshStandardMaterial({ color: 0xd7dde5, roughness: 0.82 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x8f6b48, roughness: 0.72 }),
    solar: new THREE.MeshStandardMaterial({ color: 0x123a75, emissive: 0x062350, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.3 }),
    plant: new THREE.MeshStandardMaterial({ color: 0x2c6940, roughness: 0.82 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xd9dde3, roughness: 0.95 }),
  };
}

function createTextures(THREE) {
  return {
    net: gridTexture(THREE, '#eef8ff', 'rgba(0,0,0,0)', 28, 16, 1),
    mesh: gridTexture(THREE, '#141b23', 'rgba(0,0,0,0)', 18, 10, 2),
    solar: solarTexture(THREE),
    mediaMain: mediaTexture(THREE, 'YOUR BRAND', 'GAME · EVENT · SPONSOR'),
    mediaAlt: mediaTexture(THREE, 'GYNOID MEDIA', 'TRANSPARENT LED WALLS'),
    mediaSide: mediaTexture(THREE, 'PLAY', 'MODE · LIVE · SHOW'),
    aiHud: textTexture(THREE, ['GYNOID AI', 'TRACKING · HIGHLIGHTS', 'LIVE ANALYTICS']),
    wordmark: textTexture(THREE, ['GYNOID']),
    qr: qrTexture(THREE),
  };
}

function gridTexture(THREE, color, bg, cols, rows, width) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = color; ctx.lineWidth = width;
  for (let i = 0; i <= cols; i++) {
    const x = i * canvas.width / cols;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let j = 0; j <= rows; j++) {
    const y = j * canvas.height / rows;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mediaTexture(THREE, title, subtitle) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#00d8ff');
  grad.addColorStop(.34, '#145fff');
  grad.addColorStop(.7, '#7b2cff');
  grad.addColorStop(1, '#ff31d2');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.globalAlpha = .36;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(-120, 60 + i * 38);
    ctx.bezierCurveTo(180, -50 + i * 18, 690, 620 - i * 20, 1160, 210 + i * 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,.95)';
  ctx.font = '700 84px Arial';
  ctx.fillText(title, 78, 150);
  ctx.font = '600 40px Arial';
  ctx.fillText(subtitle, 82, 212);
  ctx.fillStyle = 'rgba(255,255,255,.76)';
  ctx.font = '500 32px Arial';
  ctx.fillText('Transparent when off · immersive when on', 82, 276);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function solarTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a2b64'; ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(125,190,255,.6)'; ctx.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    const p = i * 64;
    ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(512, p); ctx.stroke();
  }
  const g = ctx.createLinearGradient(0,0,512,512);
  g.addColorStop(0,'rgba(255,255,255,.24)'); g.addColorStop(.4,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(110,180,255,.12)');
  ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function textTexture(THREE, lines) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(7,14,24,.86)'; ctx.fillRect(0,0,1024,256);
  ctx.strokeStyle = 'rgba(72,226,255,.55)'; ctx.lineWidth = 6; ctx.strokeRect(8,8,1008,240);
  ctx.fillStyle = '#eafaff';
  lines.forEach((line, i) => {
    ctx.font = i === 0 ? '700 84px Arial' : '600 44px Arial';
    ctx.fillText(line, 58, 92 + i * 66);
  });
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function qrTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0,0,256,256);
  ctx.fillStyle = '#111';
  const cells = [
    [1,1,1,1,1,0,1,0,0,1,1,0,1,1,1,1,1],
    [1,0,0,0,1,0,0,1,1,0,0,1,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,0,1,0,0,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,0,0,1,1,0,1,1,1,1,1],
    [0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [1,0,1,1,0,1,0,0,1,1,0,1,1,0,1,0,0],
    [0,1,0,0,1,0,1,0,0,0,1,0,0,1,0,1,1],
    [1,1,0,1,0,1,0,1,1,0,1,1,0,0,1,0,1],
    [0,0,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0],
    [1,0,1,1,0,0,1,0,1,0,1,0,1,1,0,0,1],
    [0,1,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1],
    [1,1,1,1,1,0,0,1,1,0,1,1,1,1,1,0,0],
    [1,0,0,0,1,0,1,0,0,1,1,0,1,0,0,1,1],
    [1,0,1,0,1,0,1,1,1,0,0,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
    [1,1,1,1,1,0,1,1,0,1,0,1,1,1,1,1,1]
  ];
  const size = 12;
  cells.forEach((row, y) => row.forEach((cell, x) => { if (cell) ctx.fillRect(26 + x * size, 26 + y * size, size, size); }));
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function meshBox(THREE, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addCourtLines(THREE, group, material) {
  const y = 0.093;
  const add = (w, d, x, z) => group.add(meshBox(THREE, w, 0.018, d, material, x, y, z));
  add(0.05, 20, -5, 0); add(0.05, 20, 5, 0); add(10, 0.05, 0, -10); add(10, 0.05, 0, 10);
  add(0.05, 20, 0, 0);
  add(10, 0.05, 0, -3.5); add(10, 0.05, 0, 3.5);
}

function addNet(THREE, group, materials, texture) {
  const posts = new THREE.Group();
  posts.add(meshBox(THREE, .14, 1.06, .14, materials.steel, -5.08, .52, 0));
  posts.add(meshBox(THREE, .14, 1.06, .14, materials.steel, 5.08, .52, 0));
  const netMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: .92, side: THREE.DoubleSide });
  const net = new THREE.Mesh(new THREE.PlaneGeometry(10.12, .95), netMat);
  net.position.set(0, .5, 0);
  posts.add(net);
  group.add(posts);
}

function createCourtWalls(THREE, materials, meshTexture) {
  const glassH = 3.0;
  const meshH = 1.0;
  const postH = 4.1;
  const frame = new THREE.Group();
  const glassMat = materials.glass;
  const meshMat = new THREE.MeshBasicMaterial({ map: meshTexture, transparent: true, opacity: .95, side: THREE.DoubleSide, color: 0x101820 });

  const post = (x, z) => frame.add(meshBox(THREE, .12, postH, .12, materials.steel, x, postH/2, z));
  const backPanel = (z, x, w) => {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - .08, glassH), glassMat);
    glass.position.set(x, glassH/2, z); frame.add(glass);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w - .08, meshH), meshMat);
    mesh.position.set(x, glassH + meshH/2, z + (z > 0 ? .005 : -.005)); frame.add(mesh);
  };
  const sidePanel = (x, z, d) => {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(d - .08, glassH), glassMat);
    glass.position.set(x, glassH/2, z); glass.rotation.y = Math.PI/2; frame.add(glass);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(d - .08, meshH), meshMat);
    mesh.position.set(x + (x > 0 ? .005 : -.005), glassH + meshH/2, z); mesh.rotation.y = Math.PI/2; frame.add(mesh);
  };

  [-10,10].forEach(z => {
    [-5,-2.5,0,2.5,5].forEach(x => post(x,z));
    [-3.75,-1.25,1.25,3.75].forEach(x => backPanel(z,x,2.5));
  });
  [-5,5].forEach(x => {
    [-10,-6,-2,2,6,10].forEach(z => post(x,z));
    [-8,-4,0,4,8].forEach(z => sidePanel(x,z,4));
  });

  const door = meshBox(THREE, 1.2, 0.08, 0.08, materials.steelSoft, 5.0, 1.05, 8.42);
  door.rotation.y = .3;
  frame.add(door);

  return { group: frame };
}

function addBaseLighting(THREE, group, materials) {
  const poles = [[-6.3,-6.5],[-6.3,6.5],[6.3,-6.5],[6.3,6.5]];
  poles.forEach(([x,z]) => {
    const g = new THREE.Group();
    g.add(meshBox(THREE,.12,5.5,.12,materials.steel,x,2.75,z));
    const lamp = meshBox(THREE,.75,.12,.36,materials.lamp,x,5.45,z);
    lamp.userData.isLamp = true;
    g.add(lamp);
    const light = new THREE.PointLight(0xbfefff, 28, 16, 2);
    light.position.set(x,5.15,z);
    light.userData.isCourtLight = true;
    g.add(light);
    group.add(g);
  });
}

function addBrandWordmark(THREE, group, texture) {
  const signMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.15), signMat);
  sign.position.set(-1.2, 4.55, -10.42);
  group.add(sign);
}

function createRoof(THREE, materials) {
  const g = new THREE.Group();
  const y = 5.95;
  [[-5.9,-10.8],[-5.9,10.8],[5.9,-10.8],[5.9,10.8]].forEach(([x,z]) => g.add(meshBox(THREE,.2,5.9,.2,materials.steel,x,2.95,z)));
  g.add(meshBox(THREE,11.95,.22,.22,materials.steel,0,y,-10.8));
  g.add(meshBox(THREE,11.95,.22,.22,materials.steel,0,y,10.8));
  g.add(meshBox(THREE,.22,.22,21.8,materials.steel,-5.9,y,0));
  g.add(meshBox(THREE,.22,.22,21.8,materials.steel,5.9,y,0));

  const roofMat = new THREE.MeshStandardMaterial({ color:0xe8eef4, transparent:true, opacity:.86, roughness:.38, metalness:.16, side:THREE.DoubleSide });
  [-8,-4,0,4,8].forEach((z,i) => {
    const panel = meshBox(THREE,11.3,.08,3.45,roofMat,0,y+0.08,z);
    panel.rotation.z = i % 2 ? 0.012 : -0.012;
    g.add(panel);
  });
  return g;
}

function createAI(THREE, materials, textures) {
  const g = new THREE.Group();
  const cameraMat = materials.steelSoft;
  const lensMat = new THREE.MeshStandardMaterial({ color:0x0b0d10, roughness:.18, metalness:.5 });
  const coneMat = new THREE.MeshBasicMaterial({ color:0x29dfff, transparent:true, opacity:.09, side:THREE.DoubleSide, depthWrite:false });
  const supports = [
    [-2.7, 3.65, -11.1, Math.PI],
    [ 2.7, 3.65, -11.1, Math.PI],
    [-2.7, 3.65,  11.1, 0],
    [ 2.7, 3.65,  11.1, 0],
  ];

  supports.forEach(([x, y, z, rot]) => {
    const arm = meshBox(THREE, .7, .08, .08, materials.steel, x, y, z);
    arm.rotation.y = rot;
    g.add(arm);

    const body = meshBox(THREE,.44,.24,.32,cameraMat,x,y-0.02,z + (z < 0 ? .22 : -.22));
    g.add(body);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.12,20), lensMat);
    lens.rotation.z = Math.PI / 2;
    lens.position.set(x, y-0.03, z + (z < 0 ? .36 : -.36));
    g.add(lens);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.65, 7.0, 32, 1, true), coneMat.clone());
    cone.position.set(x, 2.1, z + (z < 0 ? 2.1 : -2.1));
    cone.rotation.x = z < 0 ? Math.PI / 2 : -Math.PI / 2;
    cone.userData.isCone = true;
    g.add(cone);
  });

  const hudMat = new THREE.MeshBasicMaterial({ map:textures.aiHud, transparent:true, opacity:.96, side:THREE.DoubleSide });
  const hud = new THREE.Mesh(new THREE.PlaneGeometry(5.1,1.7), hudMat);
  hud.position.set(7.1,2.75,1.4); hud.rotation.y = -Math.PI / 2.7;
  hud.userData.isAiScreen = true;
  g.add(hud);
  return g;
}

function createMedia(THREE, materials, textures) {
  const g = new THREE.Group();
  const buildMat = (texture) => {
    const mat = new THREE.MeshStandardMaterial({ map:texture, emissive:0x2244ff, emissiveMap:texture, emissiveIntensity:4.0, transparent:true, opacity:.94, side:THREE.DoubleSide, roughness:.28 });
    mat.userData = { isLedMaterial: true };
    return mat;
  };

  const backA = new THREE.Mesh(new THREE.PlaneGeometry(9.86, 3.02), buildMat(textures.mediaMain));
  backA.position.set(0,1.52,-9.88);
  backA.userData.isLedMaterial = true;
  g.add(backA);

  const backB = new THREE.Mesh(new THREE.PlaneGeometry(9.86, 3.02), buildMat(textures.mediaAlt));
  backB.position.set(0,1.52,9.88);
  backB.rotation.y = Math.PI;
  backB.userData.isLedMaterial = true;
  g.add(backB);

  const left = new THREE.Mesh(new THREE.PlaneGeometry(19.86, 3.02), buildMat(textures.mediaSide));
  left.position.set(-4.88,1.52,0); left.rotation.y = Math.PI/2; left.userData.isLedMaterial = true; g.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(19.86, 3.02), buildMat(textures.mediaSide));
  right.position.set(4.88,1.52,0); right.rotation.y = -Math.PI/2; right.userData.isLedMaterial = true; g.add(right);

  return g;
}

function createAccess(THREE, materials) {
  const g = new THREE.Group();
  const kiosk = meshBox(THREE,.78,1.95,.68,materials.steel,6.35,.98,7.5); g.add(kiosk);
  const screenMat = new THREE.MeshStandardMaterial({color:0x0b2943, emissive:0x26ddff, emissiveIntensity:3.5, roughness:.2});
  const screen = meshBox(THREE,.52,.78,.04,screenMat,6.0,1.22,7.5); g.add(screen);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.17,.025,12,32), new THREE.MeshStandardMaterial({color:0x7cf7ff, emissive:0x2fe6ff, emissiveIntensity:5}));
  ring.position.set(5.96,.82,7.5); ring.rotation.y = Math.PI/2; g.add(ring);
  const gate = meshBox(THREE,1.85,.08,.12,materials.steelSoft,5.2,.98,8.38); gate.rotation.y = .28; g.add(gate);
  const card = meshBox(THREE,1.2,.08,1.4,materials.concrete,5.8,0.04,7.5); g.add(card);
  return g;
}

function createEnergy(THREE, materials, textures) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map:textures.solar, color:0xffffff, emissive:0x09204a, emissiveIntensity:.55, roughness:.28, metalness:.32 });
  const y = 6.03;
  [-8,-4,0,4,8].forEach(z => g.add(meshBox(THREE,10.85,.07,3.3,mat,0,y,z)));
  const wallPanelL = new THREE.Mesh(new THREE.PlaneGeometry(2.8,2.2), new THREE.MeshStandardMaterial({ map:textures.solar, color:0xffffff, emissive:0x09204a, emissiveIntensity:.58, roughness:.28, metalness:.32, side:THREE.DoubleSide }));
  wallPanelL.position.set(-6.95,2.3,-7.8); wallPanelL.rotation.y = Math.PI/4; g.add(wallPanelL);
  const wallPanelR = wallPanelL.clone(); wallPanelR.position.set(6.95,2.3,7.8); wallPanelR.rotation.y = -3*Math.PI/4; g.add(wallPanelR);
  return g;
}

function createLounge(THREE, materials) {
  const g = new THREE.Group();
  const glassMat = new THREE.MeshPhysicalMaterial({ color:0x80c9ff, transparent:true, opacity:.35, transmission:.28, roughness:.1 });

  const createSofa = (x, z, rot = 0) => {
    const sofa = new THREE.Group();
    sofa.add(meshBox(THREE,2.7,.46,.92,materials.loungeDark,0,.23,0));
    sofa.add(meshBox(THREE,2.55,.18,.76,materials.loungeLight,0,.55,0));
    sofa.add(meshBox(THREE,2.7,.86,.2,materials.loungeDark,0,.82,.34));
    sofa.rotation.y = rot;
    sofa.position.set(x,0,z);
    return sofa;
  };
  const createBench = (x, z, rot = 0) => {
    const bench = new THREE.Group();
    bench.add(meshBox(THREE,1.75,.15,.62,materials.wood,0,.47,0));
    bench.add(meshBox(THREE,.08,.4,.08,materials.black,-.72,.2,-.22));
    bench.add(meshBox(THREE,.08,.4,.08,materials.black,.72,.2,-.22));
    bench.add(meshBox(THREE,.08,.4,.08,materials.black,-.72,.2,.22));
    bench.add(meshBox(THREE,.08,.4,.08,materials.black,.72,.2,.22));
    bench.rotation.y = rot;
    bench.position.set(x,0,z);
    return bench;
  };
  const createTable = (x, z) => {
    const table = new THREE.Group();
    table.add(meshBox(THREE,.58,.06,.58,materials.concrete,0,.54,0));
    table.add(meshBox(THREE,.1,1.0,.1,materials.black,0,.26,0));
    table.position.set(x,0,z);
    return table;
  };
  const createPlanter = (x, z) => {
    const p = new THREE.Group();
    p.add(meshBox(THREE,.8,.48,.8,materials.concrete,0,.24,0));
    const bush = new THREE.Mesh(new THREE.SphereGeometry(.36, 14, 14), materials.plant);
    bush.position.y = .72; p.add(bush);
    p.position.set(x,0,z);
    return p;
  };

  g.add(createSofa(-8.0, 6.2, Math.PI / 2));
  g.add(createSofa(8.0, -6.2, -Math.PI / 2));
  g.add(createBench(-7.8, -6.1, Math.PI / 2));
  g.add(createBench(7.8, 6.1, -Math.PI / 2));
  g.add(createTable(-7.0, 7.4));
  g.add(createTable(7.0, -7.4));
  g.add(createPlanter(-7.0, 9.2));
  g.add(createPlanter(7.0, -9.2));

  const bar = new THREE.Group();
  bar.add(meshBox(THREE,2.3,1.05,.72,materials.loungeDark,7.4,.53,6.0));
  bar.add(meshBox(THREE,2.4,.08,.82,materials.wood,7.4,1.08,6.0));
  const fridge = meshBox(THREE,.86,1.12,.68,materials.black,8.55,.56,6.0); bar.add(fridge);
  const door = meshBox(THREE,.68,.92,.03,glassMat,8.21,.57,6.0); bar.add(door);
  const shelf = meshBox(THREE,.9,.04,.18,materials.wood,6.65,1.45,6.0); bar.add(shelf);
  g.add(bar);

  const towelRack = new THREE.Group();
  towelRack.add(meshBox(THREE,.8,.08,.08,materials.black,0,1.0,0));
  towelRack.add(meshBox(THREE,.08,1.4,.08,materials.black,-.34,.7,0));
  towelRack.add(meshBox(THREE,.08,1.4,.08,materials.black,.34,.7,0));
  const towel = meshBox(THREE,.55,.02,.4,new THREE.MeshStandardMaterial({color:0xeef4fa,roughness:.95}),0,.85,.06);
  towelRack.add(towel);
  towelRack.position.set(-7.7, 0, 4.1);
  g.add(towelRack);

  return g;
}

function createClubContext(THREE, materials, textures) {
  const g = new THREE.Group();
  const hallFloor = new THREE.Mesh(new THREE.PlaneGeometry(110, 110), new THREE.MeshStandardMaterial({ color:0xdfe4ea, roughness:.95 }));
  hallFloor.rotation.x = -Math.PI/2; hallFloor.position.y = -0.105; g.add(hallFloor);

  const wallMat = new THREE.MeshStandardMaterial({ color:0xddd7cf, roughness:.98 });
  const slatMat = new THREE.MeshStandardMaterial({ color:0x7d6549, roughness:.82 });
  g.add(meshBox(THREE,34,8,1.1,wallMat,0,4,18.5));
  g.add(meshBox(THREE,1.1,8,30,wallMat,-16.8,4,0));
  g.add(meshBox(THREE,1.1,8,30,wallMat,16.8,4,0));
  g.add(meshBox(THREE,34,.5,1.2,slatMat,0,8.05,18.2));
  g.add(meshBox(THREE,34,.3,1.2,slatMat,0,5.1,18.15));
  [-10,-5,0,5,10].forEach(x => {
    const col = meshBox(THREE,.5,8,.5,materials.concrete,x,4,16.7); g.add(col);
  });
  const lounge = meshBox(THREE,10,1.4,4,new THREE.MeshStandardMaterial({color:0xc7bfae,roughness:.82}),-11,0.7,14.5); g.add(lounge);
  const reception = meshBox(THREE,6,1.1,1.3,slatMat,-12,0.55,18); g.add(reception);
  const signMat = new THREE.MeshBasicMaterial({ map:textures.wordmark, transparent:true });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(6.4,1.5), signMat);
  sign.position.set(8.5,6.2,17.95); g.add(sign);
  return g;
}

function createResortContext(THREE, materials) {
  const g = new THREE.Group();
  const stone = new THREE.Mesh(new THREE.PlaneGeometry(140, 140), new THREE.MeshStandardMaterial({ color:0xd8ccb5, roughness:.96 }));
  stone.rotation.x = -Math.PI/2; stone.position.y = -0.105; g.add(stone);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(120, 40), new THREE.MeshStandardMaterial({ color:0x1d85c2, roughness:.28, metalness:.08, transparent:true, opacity:.92 }));
  water.rotation.x = -Math.PI/2; water.position.set(0,-0.02,34); water.userData.wave = true; water.userData.baseY = -0.02; g.add(water);
  [[-15,15],[-18,8],[14,14],[18,6],[-10,-14],[11,-15]].forEach(([x,z])=>g.add(createPalm(THREE,materials,x,z)));
  g.add(meshBox(THREE,20,.22,4.8,new THREE.MeshStandardMaterial({color:0xf1ecdf,roughness:.84}),-16,.02,10));
  g.add(meshBox(THREE,6,.22,2.8,new THREE.MeshStandardMaterial({color:0xf1ecdf,roughness:.84}),14,.02,-12));
  return g;
}

function createPalm(THREE, materials, x, z) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color:0x704f33, roughness:.9 });
  const leafMat = new THREE.MeshStandardMaterial({ color:0x2a673f, roughness:.8, side:THREE.DoubleSide });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,5.4,10),trunkMat); trunk.position.y=2.7; g.add(trunk);
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(.38,3.2,6),leafMat);
    leaf.position.y = 5.3; leaf.rotation.z = Math.PI/2.2; leaf.rotation.y = i * Math.PI/4; g.add(leaf);
  }
  g.position.set(x,0,z); return g;
}

function createUrbanContext(THREE, materials, textures) {
  const g = new THREE.Group();
  const road = new THREE.Mesh(new THREE.PlaneGeometry(140,140), new THREE.MeshStandardMaterial({ color:0x2d3742, roughness:.94 }));
  road.rotation.x = -Math.PI/2; road.position.y = -0.105; g.add(road);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(34,42), new THREE.MeshStandardMaterial({ color:0x536173, roughness:.88 }));
  plaza.rotation.x = -Math.PI/2; plaza.position.y = -0.09; g.add(plaza);
  const buildingMats = [0x2c3440,0x3f4b58,0x252d38].map(c => new THREE.MeshStandardMaterial({ color:c, roughness:.82 }));
  const specs = [[-20,18,8,18],[-10,24,7,25],[2,22,10,20],[15,20,8,28],[24,14,7,18],[-24,-15,9,13],[22,-16,7,18]];
  specs.forEach(([x,z,w,h],i)=>{
    const b = meshBox(THREE,w,h,7,buildingMats[i%buildingMats.length],x,h/2,z); g.add(b);
    const windowMat = new THREE.MeshStandardMaterial({ color:0x26384d, emissive:0x1a2c3d, emissiveIntensity:1.15, roughness:.18 });
    for (let yy = 1.4; yy < h-1; yy += 2.4) {
      for (let xx = -w/2 + 1.1; xx < w/2 - .8; xx += 1.6) {
        g.add(meshBox(THREE,.7,.95,.05,windowMat,x + xx, yy, z - 3.56));
      }
    }
  });
  const signMat = new THREE.MeshBasicMaterial({ map:textures.mediaAlt, transparent:true, side:THREE.DoubleSide });
  const billboard = new THREE.Mesh(new THREE.PlaneGeometry(7,2.8), signMat);
  billboard.position.set(12,7,18.2); g.add(billboard);
  return g;
}
