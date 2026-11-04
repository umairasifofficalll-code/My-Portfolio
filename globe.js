/* The fixed half: a dotted globe with a pin for every market Umair has analysed. */
const wrap = document.getElementById('globe'), pop = document.getElementById('gpop');
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 860px)').matches;
const waitUA = () => window.UA ? Promise.resolve() : new Promise(r => addEventListener('ua-ready', r, { once: true }));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

try {
  const [THREE, topo, geo] = await Promise.all([import('./lib/three.module.min.js'), import('./lib/topojson.mjs'), import('./lib/d3-geo.min.mjs')]);
  const landTopo = await (await fetch('lib/land-110m.json')).json();
  await waitUA();
  const land = topo.feature(landTopo, landTopo.objects.land);
  const R = 1, D2R = Math.PI / 180;
  const v3 = (lat, lon, r = R) => new THREE.Vector3(r * Math.cos(lat * D2R) * Math.sin(lon * D2R), r * Math.sin(lat * D2R), r * Math.cos(lat * D2R) * Math.cos(lon * D2R));

  const P = new Map();
  window.UA.items().filter(i => i.loc).forEach(i => { const k = i.loc[2]; if (!P.has(k)) P.set(k, { lat: i.loc[0], lon: i.loc[1], name: k, list: [] }); P.get(k).list.push(i); });
  const home = P.get('Lahore');

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  wrap.prepend(renderer.domElement);
  const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(34, 1, .1, 50); cam.position.set(0, 0, 3.7);
  const world = new THREE.Group(); scene.add(world);
  const ink = new THREE.Color(css('--ink') || '#7d0c14'), ground = new THREE.Color(css('--surface') || '#d6d6d6');

  world.add(new THREE.Mesh(new THREE.SphereGeometry(R * .985, 64, 64), new THREE.MeshBasicMaterial({ color: ground.clone().offsetHSL(0, 0, -0.04) })));
  const N = small ? 7000 : 12000, pts = [], gold = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + .5) / N, lat = Math.asin(y) / D2R, lon = ((i * gold / D2R) % 360 + 540) % 360 - 180; if (geo.geoContains(land, [lon, lat])) pts.push(v3(lat, lon, R)); }
  world.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ color: ink, size: small ? .022 : .017, sizeAttenuation: true, transparent: true, opacity: .7 })));

  const hits = [], pulses = [], arcs = [];
  [...P.values()].forEach((p, i) => {
    const n = v3(p.lat, p.lon, R).normalize(), h = p === home ? .2 : .09 + .03 * Math.min(p.list.length, 3);
    const mat = new THREE.MeshBasicMaterial({ color: ink });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, h, 8), mat);
    stem.position.copy(n.clone().multiplyScalar(R + h / 2)); stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); world.add(stem);
    const head = new THREE.Mesh(new THREE.SphereGeometry(p === home ? .04 : .028, 16, 16), mat); head.position.copy(n.clone().multiplyScalar(R + h)); world.add(head);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 8), new THREE.MeshBasicMaterial({ visible: false })); hit.position.copy(head.position); hit.userData = p; world.add(hit); hits.push(hit);
    const ring = new THREE.Mesh(new THREE.RingGeometry(.032, .044, 32), new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: .8, side: THREE.DoubleSide }));
    ring.position.copy(n.clone().multiplyScalar(R + .003)); ring.lookAt(n.clone().multiplyScalar(2)); ring.userData.t = i * .7; world.add(ring); pulses.push(ring);
    p.head = head;
    if (home && p !== home) {
      const a = v3(home.lat, home.lon, R), b = v3(p.lat, p.lon, R), mid = a.clone().add(b).multiplyScalar(.5);
      mid.normalize().multiplyScalar(R + .15 + a.distanceTo(b) * .35);
      const g = new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(80));
      const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: .55 }));
      g.setDrawRange(0, still ? 81 : 0); line.userData = { t: -i * .25 }; world.add(line); arcs.push(line);
    }
  });

  function size() { const w = wrap.clientWidth, h = wrap.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < .8 ? 4.6 : 3.7; cam.updateProjectionMatrix(); }
  size(); new ResizeObserver(size).observe(wrap);

  let rx = (home ? home.lat : 25) * D2R * .6, ry = -(small ? 63 : (home ? home.lon : 60)) * D2R, tx = rx, ty = ry, auto = !still, drag = null, active = null;
  const face = p => { tx = p.lat * D2R * .8; let t = -p.lon * D2R, d = t - ry; d = ((d + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; ty = ry + d; };
  const ray = new THREE.Raycaster(), m = new THREE.Vector2();
  const pick = e => { const r = wrap.getBoundingClientRect(); m.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(m, cam);
    const h = ray.intersectObjects(hits)[0]; if (!h) return null; return h.object.getWorldPosition(new THREE.Vector3()).z > 0 ? h.object.userData : null; };
  function show(p) { active = p; pop.innerHTML = `<b>${esc(p.name)}</b>` + p.list.map(it => `<button data-pid="${it.id}">${esc(it.title)}</button>`).join(''); pop.classList.add('on'); }
  function hide() { active = null; pop.classList.remove('on'); }
  let resume;
  window.GLOBE = { focus(name) { const p = P.get(name); if (!p) return; auto = false; face(p); show(p); clearTimeout(resume); resume = setTimeout(() => { if (!still) auto = true; }, 6000); } };

  wrap.addEventListener('pointerdown', e => { if (e.target.closest('.gpop')) return; drag = { x: e.clientX, y: e.clientY, rx: tx, ry: ty, moved: false }; auto = false; });
  addEventListener('pointermove', e => {
    if (drag) { const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true; ty = drag.ry + dx * .006; tx = Math.max(-1.2, Math.min(1.2, drag.rx + dy * .006)); return; }
    if (e.pointerType === 'mouse' && wrap.contains(e.target)) { const p = pick(e); wrap.style.cursor = p ? 'pointer' : ''; if (p && p !== active) show(p); }
  });
  addEventListener('pointerup', e => { const d = drag; drag = null; if (!d) return; if (!d.moved) { const p = pick(e); if (p) { face(p); show(p); } else if (!e.target.closest('.gpop')) hide(); } clearTimeout(resume); resume = setTimeout(() => { if (!still) auto = true; }, 4000); });
  pop.addEventListener('click', e => { const b = e.target.closest('[data-pid]'); if (b) window.UA.openDetail(b.dataset.pid); });

  let vis = true; new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis) requestAnimationFrame(loop); }).observe(wrap);
  const tmp = new THREE.Vector3(), t0 = performance.now();
  function loop(now) {
    if (!vis || document.hidden) { if (!document.hidden) return; setTimeout(() => requestAnimationFrame(loop), 500); return; }
    const t = (now - t0) / 1000;
    if (auto && !drag) ty += .0016;
    rx += (tx - rx) * .07; ry += (ty - ry) * .07; world.rotation.set(rx, ry, 0);
    if (!still) {
      pulses.forEach(r => { const k = ((t * .8 + r.userData.t) % 1.6) / 1.6; r.scale.setScalar(1 + k * 2.2); r.material.opacity = .8 * (1 - k); });
      arcs.forEach(l => { const k = Math.max(0, Math.min(1, (t * .35 + l.userData.t) % 2.2)); l.geometry.setDrawRange(0, Math.floor(Math.min(k, 1) * 81)); });
    }
    if (active && active.head) { active.head.getWorldPosition(tmp); const back = tmp.z < 0; tmp.project(cam);
      pop.style.left = ((tmp.x + 1) / 2 * wrap.clientWidth) + 'px'; pop.style.top = ((1 - tmp.y) / 2 * wrap.clientHeight) + 'px'; pop.style.visibility = back ? 'hidden' : 'visible'; }
    renderer.render(scene, cam); requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  if (home && !small) setTimeout(() => { if (!active && !drag) show(home); }, 2400);
} catch (err) {
  console.warn('globe fallback', err);
  wrap.classList.add('fail');
  wrap.insertAdjacentHTML('beforeend', '<p>Markets in this portfolio: Lahore, Dubai, the Gulf, India, Gurugram, Europe, New York and Los Angeles.</p>');
}
