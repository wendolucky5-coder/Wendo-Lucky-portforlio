/* Wendo Lucky — portfolio scripts
   Needs Three.js (loaded from CDN in index.html). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- SOUND (synthesized — no audio files needed) ---------- */
  let soundOn = false, actx;
  const soundBtn = $('#soundToggle');
  function beep(freq = 520, dur = 0.07, type = 'square', vol = 0.04) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, actx.currentTime);
      o.frequency.exponentialRampToValueAtTime(freq * 1.6, actx.currentTime + dur);
      g.gain.setValueAtTime(vol, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
      o.connect(g).connect(actx.destination);
      o.start(); o.stop(actx.currentTime + dur);
    } catch (e) { /* audio not available */ }
  }
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.setAttribute('aria-pressed', soundOn);
    soundBtn.textContent = soundOn ? '🔊 Sound on' : '🔇 Sound off';
    beep(660, 0.12, 'triangle', 0.06);
  });
  document.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-sfx]');
    if (t && !t.contains(e.relatedTarget)) beep(440 + Math.random() * 160, 0.05, 'square', 0.025);
  });
  document.addEventListener('click', e => {
    if (e.target.closest('[data-sfx]')) beep(880, 0.1, 'sawtooth', 0.04);
  });

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = $('#cursor');
  window.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.addEventListener('mouseover', e => {
    cursor.classList.toggle('big', !!e.target.closest('a,button,.card,.skill-card'));
  });

  /* ---------- SCROLL REVEAL ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => io.observe(el));

  /* ---------- PROJECT FILTERS ---------- */
  $('#filters').addEventListener('click', e => {
    const btn = e.target.closest('.chip'); if (!btn) return;
    $$('#filters .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('#projectGrid .card').forEach(card => {
      card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f);
    });
  });

  /* ---------- CARD 3D TILT ---------- */
  $$('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  $('#year').textContent = new Date().getFullYear();

  /* ---------- THREE.JS ---------- */
  if (typeof THREE === 'undefined') {
    console.warn('Three.js did not load (check your internet connection). 3D parts are skipped.');
    return;
  }

  function makeRenderer(canvas) {
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    return r;
  }
  function fit(renderer, camera, el) {
    const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  /* --- Hero scene: wireframe torus-knot + floating particles --- */
  (function hero() {
    const canvas = $('#heroCanvas'), host = canvas.parentElement;
    const renderer = makeRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.z = 7;

    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.6, 0.5, 160, 20),
      new THREE.MeshBasicMaterial({ color: 0x7cff6b, wireframe: true, transparent: true, opacity: 0.55 })
    );
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 0),
      new THREE.MeshBasicMaterial({ color: 0x8b5cff, wireframe: true })
    );
    const group = new THREE.Group(); group.add(knot, inner);
    scene.add(group);

    const N = 400, pos = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.05 }));
    scene.add(pts);

    let mx = 0, my = 0, spinBoost = 0;
    window.addEventListener('mousemove', e => {
      mx = (e.clientX / innerWidth - 0.5) * 2;
      my = (e.clientY / innerHeight - 0.5) * 2;
    });
    // hover on any button/link spins the 3D object faster
    document.addEventListener('mouseover', e => { if (e.target.closest('[data-sfx]')) spinBoost = 0.08; });

    function resize() {
      fit(renderer, camera, host);
      group.position.x = innerWidth > 900 ? 2.6 : 0;
      group.scale.setScalar(innerWidth > 900 ? 1 : 0.7);
    }
    new ResizeObserver(resize).observe(host); resize();

    (function loop() {
      requestAnimationFrame(loop);
      spinBoost *= 0.95;
      knot.rotation.x += 0.004 + spinBoost;
      knot.rotation.y += 0.006 + spinBoost;
      inner.rotation.y -= 0.01;
      group.rotation.y += (mx * 0.5 - group.rotation.y) * 0.05;
      group.rotation.x += (my * 0.4 - group.rotation.x) * 0.05;
      pts.rotation.y += 0.0007;
      renderer.render(scene, camera);
    })();
  })();

  /* --- Viewer: demo low-poly creature with drag-rotate + zoom --- */
  (function viewer() {
    const canvas = $('#viewerCanvas'), host = canvas.parentElement;
    const renderer = makeRenderer(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const DEFAULT_Z = 6; camera.position.set(0, 0.5, DEFAULT_Z);

    scene.add(new THREE.AmbientLight(0x8888aa, 0.8));
    const l1 = new THREE.PointLight(0x7cff6b, 1.6, 30); l1.position.set(4, 4, 5);
    const l2 = new THREE.PointLight(0x8b5cff, 1.6, 30); l2.position.set(-5, -2, 4);
    scene.add(l1, l2);

    // ===== Replace this block with your own model — see README =====
    const model = new THREE.Group();
    const mats = [];
    const mat = (color, extra = {}) => {
      const m = new THREE.MeshStandardMaterial(Object.assign({ color, flatShading: true, roughness: 0.5, metalness: 0.2 }, extra));
      mats.push(m); return m;
    };
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 0), mat(0x5b3fd6));
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), mat(0xffffff, { emissive: 0x7cff6b, emissiveIntensity: 1 }));
    const eyeR = eyeL.clone(); eyeL.position.set(-0.4, 0.3, 1.05); eyeR.position.set(0.4, 0.3, 1.05);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.8, 5), mat(0x7cff6b));
    const hornR = hornL.clone(); hornL.position.set(-0.6, 1.2, 0); hornR.position.set(0.6, 1.2, 0);
    hornL.rotation.z = 0.35; hornR.rotation.z = -0.35;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.05, 8, 48), mat(0x00d4ff, { emissive: 0x00d4ff, emissiveIntensity: 0.6 }));
    ring.rotation.x = Math.PI / 2.4;
    model.add(body, eyeL, eyeR, hornL, hornR, ring);
    scene.add(model);
    // ===============================================================

    let auto = true, wire = false, rotY = 0.4, rotX = 0.1, dragging = false, lx = 0, ly = 0;
    canvas.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointerup', () => dragging = false);
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      rotY += (e.clientX - lx) * 0.01; rotX += (e.clientY - ly) * 0.01;
      rotX = Math.max(-1.2, Math.min(1.2, rotX)); lx = e.clientX; ly = e.clientY;
    });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      camera.position.z = Math.max(3, Math.min(11, camera.position.z + e.deltaY * 0.005));
    }, { passive: false });

    $('#vSpin').addEventListener('click', e => { auto = !auto; e.target.textContent = '⟳ Auto-rotate: ' + (auto ? 'on' : 'off'); });
    $('#vWire').addEventListener('click', e => {
      wire = !wire; mats.forEach(m => m.wireframe = wire);
      e.target.textContent = '▦ Wireframe: ' + (wire ? 'on' : 'off');
    });
    $('#vReset').addEventListener('click', () => { rotY = 0.4; rotX = 0.1; camera.position.z = DEFAULT_Z; });

    new ResizeObserver(() => fit(renderer, camera, host)).observe(host);
    fit(renderer, camera, host);

    const clock = new THREE.Clock();
    (function loop() {
      requestAnimationFrame(loop);
      const t = clock.getElapsedTime();
      if (auto && !dragging) rotY += 0.008;
      model.rotation.y = rotY; model.rotation.x = rotX;
      model.position.y = Math.sin(t * 1.5) * 0.12;   // idle bob
      ring.rotation.z = t * 0.8;
      renderer.render(scene, camera);
    })();
  })();
})();
