/* Umair Asif portfolio: dashboards bento, project index, tools, certificates, dialogs */
(() => {
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const $ = id => document.getElementById(id);
const toast = t => { const e = $('toast'); e.textContent = t; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 2400); };
const thumb = p => /^img\//.test(p || '') && !/^img\/t\//.test(p) ? p.replace('img/', 'img/t/') : p;
const ICON = window.ICONS || {};
const icon = n => ICON[n] ? `<svg class="i" viewBox="0 0 256 256" aria-hidden="true">${ICON[n]}</svg>` : '';

let live = [];
const items = () => [...live, ...window.SEED.map((s, i) => ({ ...s, id: 's' + i }))];
const byTitle = t => items().find(i => i.title === t);
window.UA = { items, openDetail };

/* ---------- six dashboards, six cells ---------- */
const FEATURED = [
  ['Dubai Real Estate Market Analyzer', 'c1', 'video'],
  ['Gulf Market Tracker: Stock Risk & Return', 'c2'],
  ['Customer Shopping Behaviour', 'c3'],
  ['Decathlon Sales & Customer Analytics', 'c4'],
  ['Mega-Pik: Data-Driven Movie Strategy', 'c5'],
  ['AI Movie Recommendation Engine', 'c6'],
];
function renderBento() {
  $('bento').innerHTML = FEATURED.map(([t, cls, kind], n) => {
    const it = byTitle(t); if (!it) return '';
    const media = kind === 'video'
      ? `<video muted loop playsinline preload="none" poster="img/dubai-dashboard-poster.webp" width="960" height="600" aria-label="The Dubai dashboard being clicked through its four pages"><source src="img/dubai-dashboard.mp4" type="video/mp4"><source src="img/dubai-dashboard.webm" type="video/webm"></video>`
      : `<img src="${esc(cls === 'c1' || cls === 'c2' ? it.img : thumb(it.img))}" alt="${esc(it.title)}" loading="lazy" decoding="async">`;
    return `<button class="cell ${cls}" data-open="${it.id}" data-rv style="--i:${n}"><div class="media">${media}</div><div class="meta"><h3>${esc(it.title.split(':')[0])}</h3><span>${esc((it.m || [])[0] || '')}</span></div><p>${esc(it.tag || '')}</p></button>`;
  }).join('');
  const v = $('bento').querySelector('video');
  if (v && !matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: .25 }).observe(v);
  }
}

/* ---------- every project, filterable ---------- */
const GROUPS = { all: 'All', bi: 'BI and dashboards', eda: 'Analysis', ml: 'Machine learning', nlp: 'Language models', sql: 'SQL' };
const groupOf = it => it.kind === 'dashboard' ? 'bi' : (it.g || 'eda');
let filter = 'all';
function renderIndex() {
  $('tabs').innerHTML = Object.entries(GROUPS).map(([k, v]) => `<button type="button" data-f="${k}" aria-pressed="${k === filter}">${v}</button>`).join('');
  const all = items().filter(i => i.kind !== 'cert');
  const sets = [['Dashboards and reports', all.filter(i => i.kind === 'dashboard')], ['Case studies', all.filter(i => i.kind === 'project')]];
  $('groups').innerHTML = sets.map(([g, list]) => {
    const shown = list.filter(i => filter === 'all' || groupOf(i) === filter);
    return `<div class="group"${shown.length ? '' : ' hidden'}><h3>${g}</h3><ul class="rows">${shown.map((it, n) => `<li data-rv style="--i:${Math.min(n, 6)}"><button class="row" data-open="${it.id}"><b>${esc(it.title)}</b><span>${esc(it.tag || '')}${it.loc ? ', ' + esc(it.loc[2].split(' (')[0]) : ''}</span></button></li>`).join('')}</ul></div>`;
  }).join('');
  reveal();
}
document.addEventListener('click', e => { const f = e.target.closest('[data-f]'); if (f) { filter = f.dataset.f; renderIndex(); } });

/* ---------- tools: one featured, three supporting ---------- */
const TOOLS = [
  { big: 1, name: 'SQL and MySQL', n: '51,150', what: 'messy delivery orders cleaned, loaded and ranked with window functions and CTEs.', proj: 'Lahore Food Delivery Demand & Delay' },
  { name: 'Power BI and DAX', n: '9', what: 'dashboards and reports, from Dubai property to PhonePe payments.', proj: 'Dubai Real Estate Market Analyzer' },
  { name: 'Statistics', n: 'R² 0.94', what: "fare regression, with a Welch's t-test on card and cash trips.", proj: 'NYC Taxi Fare Prediction' },
  { wide: 1, name: 'Machine learning and NLP', n: '90.8%', what: 'accuracy on a Random Forest churn model for 14,606 energy customers, plus Sentence-BERT search over 1M+ movies.', proj: 'PowerCo SME Customer Churn & Retention' },
];
function renderTools() {
  $('toolgrid').innerHTML = TOOLS.map((t, n) => {
    const it = byTitle(t.proj);
    return `<article class="tile${t.big ? ' big' : ''}${t.wide ? ' wide' : ''}" data-rv style="--i:${n}"><h3>${esc(t.name)}</h3><div><p class="n">${esc(t.n)}</p><p>${esc(t.what)}</p>${it ? `<p><a class="link" href="#projects" data-open="${it.id}">See it in ${esc(t.proj.split(':')[0])}</a></p>` : ''}</div></article>`;
  }).join('');
}

/* ---------- certificates ---------- */
function renderCerts() {
  const certs = items().filter(i => i.kind === 'cert');
  const imgs = certs.filter(c => c.img);
  const strip = imgs.map(c => `<button data-open="${c.id}" aria-label="View certificate: ${esc(c.title)}"><img src="${esc(thumb(c.img))}" alt="${esc(c.title)} certificate" loading="lazy" width="640" height="480"></button>`).join('');
  $('mq').innerHTML = strip + strip.replace(/<button /g, '<button tabindex="-1" aria-hidden="true" ');
  const kinds = [['Google, on Coursera', c => /Google/.test(c.tag)], ['Job simulations, on Forage', c => /Forage/.test(c.tag)], ['HP LIFE', c => /HP/.test(c.tag)]];
  $('certlist').innerHTML = kinds.map(([k, f], n) => `<div data-rv style="--i:${n}"><h3>${k}</h3><ul>${certs.filter(f).map(c => {
    const who = c.tag.split(',')[0];
    const label = /Forage/.test(c.tag) ? `${who}: ${c.title}` : c.title;
    return `<li>${c.url ? `<a class="link" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(label)}</a>` : `<a class="link" href="#certificates" data-open="${c.id}">${esc(label)}</a>`}<small>${esc((c.m || [])[0] || '')}</small></li>`;
  }).join('')}</ul></div>`).join('');
}

/* ---------- detail dialog ---------- */
function docBtns(it) {
  const d = (it.docs || []).map(([l, k]) => `<button data-doc="${k}" data-t="${esc(l)}" data-from="${it.id}">${esc(l)}</button>`);
  const c = (it.code || []).map(k => `<button data-code="${k}" data-from="${it.id}">Read the notebook code</button>`);
  return d.length || c.length ? `<div class="docs">${d.join('')}${c.join('')}</div>` : '';
}
function openDetail(id) {
  const it = items().find(i => i.id === id); if (!it) return;
  const pts = it.pts ? `<ul>${it.pts.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : '';
  const fig = it.img ? `<figure><img src="${esc(it.img)}" alt="${esc(it.title)}"></figure>` : '';
  const links = (it.url || it.gh) ? `<div class="dl">${it.url ? `<a class="btn" href="${esc(it.url)}" target="_blank" rel="noopener">${icon('arrow-up-right')}${it.kind === 'cert' ? 'Verify credential' : 'Open dashboard'}</a>` : ''}${it.gh ? `<a class="btn ghost" href="${esc(it.gh)}" target="_blank" rel="noopener">${icon('github-logo')}View code</a>` : ''}</div>` : '';
  $('detailBody').innerHTML = `${fig}<p class="tag">${esc(it.tag || '')}</p><h3>${esc(it.title)}</h3><p>${esc(it.desc || '')}</p>${pts}<p class="met">${(it.m || []).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('')}</p>${docBtns(it)}${links}`;
  const d = $('detail'); if (!d.open) d.showModal(); d.querySelector('.in').scrollTop = 0;
}
document.addEventListener('click', e => {
  const o = e.target.closest('[data-open]');
  if (o) { e.preventDefault(); openDetail(o.dataset.open); return; }
  if (e.target.closest('[data-close]')) { e.target.closest('dialog').close(); return; }
  if (e.target.tagName === 'DIALOG') { e.target.close(); return; }
  const d = e.target.closest('[data-doc]'), c = e.target.closest('[data-code]'), bk = e.target.closest('[data-back]');
  if (bk) { openDetail(bk.dataset.back); return; }
  if (!d && !c) return;
  const back = `<button class="back" data-back="${(d || c).dataset.from}">Back to the project</button>`;
  $('detailBody').innerHTML = d
    ? `${back}<h3>${esc(d.dataset.t)}</h3><div class="pages">${(window.A[d.dataset.doc] || []).map((s, i) => `<img src="${s}" alt="Page ${i + 1}" loading="lazy">`).join('')}</div>`
    : `${back}<h3>Notebook code</h3><pre>${esc(window.CODE[c.dataset.code] || '')}</pre>`;
  $('detail').querySelector('.in').scrollTop = 0;
});

/* ---------- entrances, once ---------- */
const rio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); rio.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 }) : null;
function reveal() { document.querySelectorAll('[data-rv]:not(.in)').forEach(e => rio ? rio.observe(e) : e.classList.add('in')); }

/* ---------- owner tools: only with #owner in the address ---------- */
const PINH = '8c454536b6e2b8b29a1d839aa3c5ccf0ab57a590d619739b23a32d11585220c9';
const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
function ownerUI() {
  if (!/owner/.test(location.hash + location.search) || $('ownerBtn')) return;
  const b = document.createElement('button'); b.id = 'ownerBtn'; b.className = 'btn ghost'; b.textContent = 'Add an item'; b.style.marginTop = '24px';
  $('tabs').after(b);
  b.onclick = () => {
    $('ownerBody').innerHTML = `<h3>Owner tools</h3><form id="pinF"><label for="pin">PIN</label><input id="pin" type="password" inputmode="numeric" autocomplete="off" required><p class="err" id="pinE"></p><button class="btn">Open owner tools</button></form>`;
    $('owner').showModal();
    $('pinF').onsubmit = async ev => {
      ev.preventDefault();
      if (await sha($('pin').value.trim()) !== PINH) { $('pinE').textContent = 'That PIN is not right.'; return; }
      $('ownerBody').innerHTML = `<h3>Add to the portfolio</h3><form id="upF"><label for="uk">Section</label><select id="uk"><option value="project">Case study</option><option value="dashboard">Dashboard</option><option value="cert">Certificate</option></select><label for="ut">Title</label><input id="ut" required maxlength="120"><label for="ug">Tools or issuer</label><input id="ug" maxlength="60"><label for="ud">Description</label><textarea id="ud" rows="3" maxlength="600"></textarea><label for="uu">Link</label><input id="uu" type="url" placeholder="https://"><p class="err">Added items show for this visit only. To keep one, add it to data.js on GitHub.</p><button class="btn">Add</button></form>`;
      $('upF').onsubmit = ev2 => {
        ev2.preventDefault();
        live.unshift({ id: 'l' + Date.now(), kind: $('uk').value, title: $('ut').value.trim(), tag: $('ug').value.trim(), desc: $('ud').value.trim(), url: $('uu').value.trim(), m: [] });
        renderIndex(); renderCerts(); $('owner').close(); toast('Added for this visit.');
      };
    };
  };
}
addEventListener('hashchange', ownerUI);

renderBento(); renderIndex(); renderTools(); renderCerts(); reveal(); ownerUI();
window.dispatchEvent(new Event('ua-ready'));
})();
