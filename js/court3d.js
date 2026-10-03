const wrap = document.getElementById('threeWrap');
const canvas = document.getElementById('court3d');
const loader = document.getElementById('threeLoader');

if (!wrap || !canvas) {
  // Configurator not present on this page.
} else {
  init();
}

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

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111b);
  scene.fog = new THREE.Fog(0x07111b, 28, 65);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
  const target = new THREE.Vector3(0, 1.3, 0);
  let azimuth = -0.72;
  let polar = 1.04;
  let distance = 27;
  const defaultView = { azimuth, polar, distance };

  const world = new THREE.Group();
  scene.add(world);

  const hemi = new THREE.HemisphereLight(0x9fd5ff, 0x101722, 1.8);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-8, 14, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1536, 1536);
  key.shadow.camera.left = -20;
  key.shadow.camera.right = 20;
  key.shadow.camera.top = 24;
  key.shadow.camera.bottom = -12;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x3bdcff, 1.4);
  rim.position.set(10, 8, -14);
  scene.add(rim);

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

  const materials = createMaterials(THREE);
  const textures = createTextures(THREE);

  // ---------- BASE COURT ----------
  const court = new THREE.Group();
  world.add(court);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    materials.ground
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.11;
  ground.receiveShadow = true;
  world.add(ground);

  const floor = meshBox(THREE, 10, 0.16, 20, materials.floor, 0, 0, 0);
  floor.receiveShadow = true;
  court.add(floor);
  addCourtLines(THREE, court, materials.line);
  addNet(THREE, court, materials, textures.net);
  addCourtWalls(THREE, court, materials, textures.mesh);
  addBaseLighting(THREE, court, materials);

  // ---------- OPTIONAL LAYERS ----------
  const roofGroup = createRoof(THREE, materials);
  const aiGroup = createAI(THREE, materials, textures);
  const mediaGroup = createMedia(THREE, materials, textures.media);
  const accessGroup = createAccess(THREE, materials);
  const energyGroup = createEnergy(THREE, materials, textures.solar);
  const loungeGroup = createLounge(THREE, materials);

  court.add(roofGroup, aiGroup, mediaGroup, accessGroup, energyGroup, loungeGroup);

  // ---------- CONTEXTS ----------
  const contexts = {
    club: createClubContext(THREE, materials, textures),
    resort: createResortContext(THREE, materials),
    urban: createUrbanContext(THREE, materials)
  };
  Object.values(contexts).forEach(group => world.add(group));

  // ---------- UI ----------
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
    if (state.media && state.lounge) return 'Showcase';
    if (state.energy && state.roof) return 'Sustainable';
    if (state.ai && state.access) return 'Connected';
    if (state.roof) return 'Performance';
    return 'Signature';
  }

  function description() {
    const active = Object.keys(labels).filter(key => state[key]).map(key => labels[key]);
    const top = active.slice(0, 3);
    const features = top.length === 0 ? 'base premium' : top.join(', ');
    const ctx = {
      club: 'Pensada para clubes que quieren diferenciar experiencia y operación.',
      resort: 'Enfocada a hospitality, lujo y una experiencia visual memorable.',
      urban: 'Diseñada para ubicaciones urbanas, rooftops y proyectos icónicos.'
    }[state.context];
    return `${features} activos. ${ctx}`;
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
    Object.entries(contexts).forEach(([name, group]) => {
      group.visible = name === state.context;
    });
    contextButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.context === state.context));
  }

  function setTheme() {
    const night = state.theme === 'night';
    scene.background.setHex(night ? 0x07111b : 0xcbe9ff);
    scene.fog.color.setHex(night ? 0x07111b : 0xd8efff);
    materials.ground.color.setHex(night ? 0x17212a : 0xdfe6e8);
    hemi.color.setHex(night ? 0x8ecbff : 0xffffff);
    hemi.groundColor.setHex(night ? 0x111823 : 0x8699a7);
    hemi.intensity = night ? 1.8 : 2.25;
    key.intensity = night ? 2.4 : 3.1;
    rim.intensity = night ? 1.4 : 0.55;
    renderer.toneMappingExposure = night ? 1.08 : 1.18;
    themeButtons.forEach(btn => btn.classList.toggle('is-active', btn.dataset.theme === state.theme));

    // Court lights read stronger at night.
    court.traverse(obj => {
      if (obj.userData.isLamp) obj.material.emissiveIntensity = night ? 6.5 : 1.6;
      if (obj.isPointLight && obj.userData.isCourtLight) obj.intensity = night ? 26 : 4;
    });
  }

  function applyState() {
    setFeatureVisibility();
    setContext();
    setTheme();
    updateSummary();
  }

  contextButtons.forEach(btn => btn.addEventListener('click', () => {
    state.context = btn.dataset.context;
    applyState();
  }));
  themeButtons.forEach(btn => btn.addEventListener('click', () => {
    state.theme = btn.dataset.theme;
    applyState();
  }));
  featureInputs.forEach(input => input.addEventListener('change', () => {
    state[input.dataset.feature] = input.checked;
    applyState();
  }));

  resetBtn?.addEventListener('click', () => {
    azimuth = defaultView.azimuth;
    polar = defaultView.polar;
    distance = defaultView.distance;
  });

  // ---------- CAMERA CONTROLS ----------
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
      if (now > 0) distance = THREE.MathUtils.clamp(pinchStart.zoom * (pinchStart.distance / now), 16, 38);
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
    distance = THREE.MathUtils.clamp(distance + event.deltaY * 0.015, 16, 38);
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

  // ---------- RESPONSIVE ----------
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

  // ---------- ANIMATION ----------
  const clock = new THREE.Clock();
  function render() {
    const t = clock.getElapsedTime();
    updateCamera();

    // Give the LED surfaces and AI layer a subtle living quality.
    if (mediaGroup.visible) {
      mediaGroup.children.forEach((mesh, index) => {
        if (mesh.material && 'emissiveIntensity' in mesh.material) {
          mesh.material.emissiveIntensity = 2.4 + Math.sin(t * 1.25 + index) * 0.55;
        }
      });
    }
    if (aiGroup.visible) {
      aiGroup.children.forEach(obj => {
        if (obj.userData.isCone && obj.material) obj.material.opacity = 0.075 + Math.sin(t * 2 + obj.position.x) * 0.018;
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
    ground: new THREE.MeshStandardMaterial({ color: 0x17212a, roughness: 0.86, metalness: 0.03 }),
    floor: new THREE.MeshStandardMaterial({ color: 0x0f62d5, roughness: 0.72, metalness: 0.02 }),
    line: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.35, metalness: 0.86 }),
    steelSoft: new THREE.MeshStandardMaterial({ color: 0x263341, roughness: 0.42, metalness: 0.72 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x9cdcff, transparent: true, opacity: 0.2, roughness: 0.06, metalness: 0, transmission: 0.45, thickness: 0.12, side: THREE.DoubleSide }),
    lamp: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcff7ff, emissiveIntensity: 6.5, roughness: 0.2 }),
    white: new THREE.MeshStandardMaterial({ color: 0xf0f3f7, roughness: 0.55 }),
    lounge: new THREE.MeshStandardMaterial({ color: 0x222832, roughness: 0.68 }),
    solar: new THREE.MeshStandardMaterial({ color: 0x123a75, emissive: 0x062350, emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.3 }),
  };
}

function createTextures(THREE) {
  return {
    net: gridTexture(THREE, '#e9f7ff', 'rgba(0,0,0,0)', 28, 16, 1),
    mesh: gridTexture(THREE, '#151b22', 'rgba(0,0,0,0)', 18, 10, 2),
    solar: solarTexture(THREE),
    media: mediaTexture(THREE),
    aiHud: textTexture(THREE, ['GYNOID AI', 'TRACKING · HIGHLIGHTS', 'LIVE ANALYTICS']),
    clubSign: textTexture(THREE, ['GYNOID', 'PADEL CLUB']),
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
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function mediaTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, '#00dcff'); grad.addColorStop(.33, '#145eff'); grad.addColorStop(.67, '#7b2cff'); grad.addColorStop(1, '#ff31d2');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 1024, 512);
  ctx.globalAlpha = .5;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7;
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(-100, 70 + i * 28);
    ctx.bezierCurveTo(250, -60 + i * 20, 720, 660 - i * 24, 1130, 220 + i * 10);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.font = '700 78px Arial'; ctx.fillText('GYNOID MEDIA', 78, 130);
  ctx.font = '600 38px Arial'; ctx.fillText('BRAND · EVENTS · CONTENT', 82, 190);
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
  const g = ctx.createLinearGradient(0,0,512,512); g.addColorStop(0,'rgba(255,255,255,.24)'); g.addColorStop(.4,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(110,180,255,.12)');
  ctx.fillStyle = g; ctx.fillRect(0,0,512,512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function textTexture(THREE, lines) {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 320;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(7,14,24,.88)'; ctx.fillRect(0,0,768,320);
  ctx.strokeStyle = 'rgba(72,226,255,.55)'; ctx.lineWidth = 6; ctx.strokeRect(8,8,752,304);
  ctx.fillStyle = '#eafaff'; ctx.font = '700 64px Arial';
  lines.forEach((line, i) => ctx.fillText(line, 52, 98 + i * 74));
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

function meshBox(THREE, w, h, d, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

function addCourtLines(THREE, group, material) {
  const y = 0.095;
  const add = (w, d, x, z) => group.add(meshBox(THREE, w, 0.025, d, material, x, y, z));
  add(0.055, 20, -5, 0); add(0.055, 20, 5, 0); add(10, 0.055, 0, -10); add(10, 0.055, 0, 10);
  add(0.055, 20, 0, 0);
  add(10, 0.055, 0, -3.5); add(10, 0.055, 0, 3.5);
}

function addNet(THREE, group, materials, texture) {
  const posts = new THREE.Group();
  posts.add(meshBox(THREE, .16, 1.05, .16, materials.steel, -5.08, .52, 0));
  posts.add(meshBox(THREE, .16, 1.05, .16, materials.steel, 5.08, .52, 0));
  const netMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: .92, side: THREE.DoubleSide });
  const net = new THREE.Mesh(new THREE.PlaneGeometry(10.1, .95), netMat);
  net.position.set(0, .5, 0); net.rotation.y = 0;
  posts.add(net);
  group.add(posts);
}

function addCourtWalls(THREE, group, materials, meshTexture) {
  const glassH = 3.0;
  const meshH = 1.0;
  const postH = 4.1;
  const frame = new THREE.Group();
  const glassMat = materials.glass;
  const meshMat = new THREE.MeshBasicMaterial({ map: meshTexture, transparent: true, opacity: .95, side: THREE.DoubleSide, color: 0x101820 });

  const post = (x, z) => frame.add(meshBox(THREE, .13, postH, .13, materials.steel, x, postH/2, z));
  const backPanel = (z, x, w) => {
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w - .08, glassH), glassMat);
    glass.position.set(x, glassH/2, z); glass.rotation.y = 0; frame.add(glass);
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

  group.add(frame);
}

function addBaseLighting(THREE, group, materials) {
  const poles = [[-6.2,-6],[-6.2,6],[6.2,-6],[6.2,6]];
  poles.forEach(([x,z], idx) => {
    const g = new THREE.Group();
    g.add(meshBox(THREE,.12,5.2,.12,materials.steel,x,2.6,z));
    const lamp = meshBox(THREE,.7,.12,.34,materials.lamp,x,5.25,z);
    lamp.userData.isLamp = true;
    g.add(lamp);
    const light = new THREE.PointLight(0xbfefff, 26, 15, 2);
    light.position.set(x,5.05,z);
    light.userData.isCourtLight = true;
    g.add(light);
    group.add(g);
  });
}

function createRoof(THREE, materials) {
  const g = new THREE.Group();
  const y = 5.75;
  // Structural posts / perimeter beams.
  [[-5.8,-10.6],[-5.8,10.6],[5.8,-10.6],[5.8,10.6]].forEach(([x,z]) => g.add(meshBox(THREE,.2,5.9,.2,materials.steel,x,2.95,z)));
  g.add(meshBox(THREE,11.8,.22,.22,materials.steel,0,y,-10.6));
  g.add(meshBox(THREE,11.8,.22,.22,materials.steel,0,y,10.6));
  g.add(meshBox(THREE,.22,.22,21.4,materials.steel,-5.8,y,0));
  g.add(meshBox(THREE,.22,.22,21.4,materials.steel,5.8,y,0));

  const roofMat = new THREE.MeshStandardMaterial({ color:0xdfe7ef, transparent:true, opacity:.82, roughness:.38, metalness:.2, side:THREE.DoubleSide });
  const strips = [-8,-4,0,4,8];
  strips.forEach((z,i) => {
    const panel = meshBox(THREE,11.1,.08,3.55,roofMat,0,y+0.08,z);
    panel.rotation.z = i % 2 ? 0.015 : -0.015;
    g.add(panel);
  });
  return g;
}

function createAI(THREE, materials, textures) {
  const g = new THREE.Group();
  const positions = [[-4.7,4.35,-7],[0,4.6,9],[4.7,4.35,-7]];
  positions.forEach(([x,y,z], i) => {
    const body = meshBox(THREE,.46,.26,.34,materials.steelSoft,x,y,z);
    g.add(body);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.105,.105,.12,20), new THREE.MeshStandardMaterial({color:0x0b0d10, roughness:.18, metalness:.5}));
    lens.rotation.z = Math.PI/2; lens.position.set(x, y-.02, z + (z<0 ? .23 : -.23));
    g.add(lens);

    const coneMat = new THREE.MeshBasicMaterial({ color:0x29dfff, transparent:true, opacity:.08, side:THREE.DoubleSide, depthWrite:false });
    const cone = new THREE.Mesh(new THREE.ConeGeometry(2.35,4.5,32,1,true), coneMat);
    cone.position.set(x,2.35,z); cone.rotation.x = Math.PI; cone.userData.isCone = true;
    g.add(cone);
  });
  const hudMat = new THREE.MeshBasicMaterial({ map:textures.aiHud, transparent:true, opacity:.96, side:THREE.DoubleSide });
  const hud = new THREE.Mesh(new THREE.PlaneGeometry(4.2,1.75), hudMat);
  hud.position.set(7.2,2.25,1.2); hud.rotation.y = -Math.PI/2.7;
  g.add(hud);
  return g;
}

function createMedia(THREE, materials, texture) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map:texture, emissive:0x2244ff, emissiveMap:texture, emissiveIntensity:2.6, transparent:true, opacity:.9, side:THREE.DoubleSide, roughness:.35 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(9.5,2.65),mat.clone()); back.position.set(0,1.55,-9.86); g.add(back);
  const left = new THREE.Mesh(new THREE.PlaneGeometry(12,2.65),mat.clone()); left.rotation.y=Math.PI/2; left.position.set(-4.86,1.55,1.4); g.add(left);
  const right = new THREE.Mesh(new THREE.PlaneGeometry(12,2.65),mat.clone()); right.rotation.y=-Math.PI/2; right.position.set(4.86,1.55,-1.4); g.add(right);
  return g;
}

function createAccess(THREE, materials) {
  const g = new THREE.Group();
  const pillar = meshBox(THREE,.65,1.9,.6,materials.steel,6.0,.95,7.2); g.add(pillar);
  const screenMat = new THREE.MeshStandardMaterial({color:0x0b2943, emissive:0x26ddff, emissiveIntensity:3.5, roughness:.2});
  const screen = meshBox(THREE,.48,.74,.04,screenMat,5.68,1.18,7.2); g.add(screen);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.16,.025,12,32), new THREE.MeshStandardMaterial({color:0x7cf7ff, emissive:0x2fe6ff, emissiveIntensity:5}));
  ring.position.set(5.64,.83,7.2); ring.rotation.y=Math.PI/2; g.add(ring);
  const gate = meshBox(THREE,1.8,.08,.12,materials.steelSoft,5.35,.95,8.3); gate.rotation.y=.22; g.add(gate);
  return g;
}

function createEnergy(THREE, materials, texture) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ map:texture, color:0xffffff, emissive:0x09204a, emissiveIntensity:.55, roughness:.28, metalness:.32 });
  const y=5.98;
  [-8,-4,0,4,8].forEach((z,i)=>{
    const p = meshBox(THREE,10.8,.07,3.3,mat,0,y,z); g.add(p);
  });
  // Independent perimeter beam makes the solar layer visually coherent even without the roof layer.
  g.add(meshBox(THREE,11.4,.14,.14,materials.steel,-0,y-.08,-10.3));
  g.add(meshBox(THREE,11.4,.14,.14,materials.steel,0,y-.08,10.3));
  return g;
}

function createLounge(THREE, materials) {
  const g = new THREE.Group();
  const seatMat = new THREE.MeshStandardMaterial({color:0x222831,roughness:.72});
  const cushionMat = new THREE.MeshStandardMaterial({color:0xbfc7d0,roughness:.82});
  const fridgeMat = new THREE.MeshStandardMaterial({color:0x101820,roughness:.3,metalness:.55});
  const glassMat = new THREE.MeshPhysicalMaterial({color:0x80c9ff,transparent:true,opacity:.35,transmission:.25,roughness:.12});

  [[-7,5.6],[7,-5.6]].forEach(([x,z])=>{
    const base=meshBox(THREE,2.3,.45,.82,seatMat,x,.25,z); g.add(base);
    const back=meshBox(THREE,2.3,.85,.22,seatMat,x,.82,z+(z>0?.32:-.32)); g.add(back);
    const cushion=meshBox(THREE,2.05,.18,.7,cushionMat,x,.54,z); g.add(cushion);
  });
  const fridge=meshBox(THREE,.8,1.15,.65,fridgeMat,6.7,.58,5.9); g.add(fridge);
  const door=meshBox(THREE,.64,.9,.025,glassMat,6.38,.6,5.9); g.add(door);
  const table=meshBox(THREE,1.25,.1,1.0,materials.steelSoft,-6.8,.5,-5.6); g.add(table);
  return g;
}

function createClubContext(THREE, materials, textures) {
  const g = new THREE.Group();
  const building = meshBox(THREE,24,6,3,new THREE.MeshStandardMaterial({color:0x111923,roughness:.7}),0,3,17); g.add(building);
  const windowsMat = new THREE.MeshStandardMaterial({color:0x25465f,emissive:0x102638,emissiveIntensity:1.2,roughness:.25});
  for(let x=-9;x<=9;x+=3){ g.add(meshBox(THREE,2.2,2.3,.06,windowsMat,x,3.2,15.46)); }
  const signMat = new THREE.MeshBasicMaterial({map:textures.clubSign,transparent:true});
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(5.8,2.2),signMat); sign.position.set(0,5.15,15.42); g.add(sign);
  return g;
}

function createResortContext(THREE, materials) {
  const g = new THREE.Group();
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(80,80),new THREE.MeshStandardMaterial({color:0xbda981,roughness:.95})); sand.rotation.x=-Math.PI/2; sand.position.y=-.105; g.add(sand);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(70,28),new THREE.MeshStandardMaterial({color:0x167cb5,roughness:.28,metalness:.05,transparent:true,opacity:.9})); water.rotation.x=-Math.PI/2; water.position.set(0,-.02,27); g.add(water);
  [[-13,13],[-17,7],[14,15],[18,8]].forEach(([x,z])=>g.add(createPalm(THREE,x,z)));
  return g;
}

function createPalm(THREE,x,z){
  const g=new THREE.Group();
  const trunkMat=new THREE.MeshStandardMaterial({color:0x704f33,roughness:.9});
  const leafMat=new THREE.MeshStandardMaterial({color:0x2a673f,roughness:.8,side:THREE.DoubleSide});
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,5.2,10),trunkMat); trunk.position.y=2.6; g.add(trunk);
  for(let i=0;i<8;i++){
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(.38,3.2,6),leafMat); leaf.position.y=5.2; leaf.rotation.z=Math.PI/2.2; leaf.rotation.y=i*Math.PI/4; g.add(leaf);
  }
  g.position.set(x,0,z); return g;
}

function createUrbanContext(THREE, materials) {
  const g=new THREE.Group();
  const roadMat=new THREE.MeshStandardMaterial({color:0x3d4650,roughness:.92});
  const road=new THREE.Mesh(new THREE.PlaneGeometry(80,80),roadMat); road.rotation.x=-Math.PI/2; road.position.y=-.105; g.add(road);
  const buildingMats=[0x2b3541,0x414d59,0x1f2934].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:.82}));
  const specs=[[-17,14,7,15],[-9,18,6,22],[0,20,8,18],[10,18,7,25],[18,14,8,17],[-18,-15,8,13],[18,-15,7,16]];
  specs.forEach(([x,z,w,h],i)=>{ const b=meshBox(THREE,w,h,6,buildingMats[i%buildingMats.length],x,h/2,z); g.add(b); });
  return g;
}
