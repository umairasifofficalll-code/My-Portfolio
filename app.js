/* Umair Asif portfolio: ledger, tools, certificates, dialogs, stage switching */
(() => {
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $ = id => document.getElementById(id);
const toast = t => { const e = $('toast'); e.textContent = t; e.classList.add('show'); setTimeout(() => e.classList.remove('show'), 2400); };
const thumb = p => /^img\//.test(p || '') && !/^img\/t\//.test(p) ? p.replace('img/', 'img/t/') : p;

let live = [];
const items = () => [...live, ...window.SEED.map((s, i) => ({ ...s, id: 's' + i }))];
window.UA = { items, openDetail };

/* ---------- work ledger ---------- */
function renderLedger() {
  const all = items();
  const groups = [['Dashboards', all.filter(i => i.kind === 'dashboard')], ['Case studies', all.filter(i => i.kind === 'project')]];
  $('ledger').innerHTML = groups.map(([g, list]) =>
    `<li class="group" data-rv>${g}</li>` + list.map((it, n) => `<li data-rv style="--i:${Math.min(n, 6)}">
      <button class="row" data-open="${it.id}" data-loc="${esc(it.loc ? it.loc[2] : '')}" data-img="${esc(it.img || '')}">
        ${it.img && n < 3 ? `<img class="th" src="${esc(thumb(it.img))}" alt="" loading="lazy" width="640" height="400">` : ''}
        <span class="n">${esc(it.title)}</span>
        <span class="p">${esc(it.loc ? it.loc[2].split(' (')[0] : 'Global')}</span>
        <span class="k">${esc(it.tag || '')}</span>
      </button></li>`).join('')).join('');
}

/* ---------- tools ---------- */
const TOOLS = [
  ['SQL and MySQL', [['Window functions and CTEs on 51,150 orders', 'Lahore Food Delivery Demand & Delay'], ['Schema, constraints and reporting views', 'Lahore Air Quality vs Daily Life'], ['Benford and z-score anomaly checks', 'Forensic Risk & Anomaly Analysis'], ['10 business questions answered in SQL', 'Customer Shopping Behavior Analytics']]],
  ['Python and pandas', [['Cleaning a deliberately messy delivery file', 'Lahore Food Delivery Demand & Delay'], ['Yearly, monthly and discount analysis', 'Superstore Sales Analysis'], ['Multi-panel Seaborn dashboard', 'E-Commerce Sales Analysis Dashboard'], ['String valuations to numbers, Plotly maps', 'Unicorn Companies: Global Valuation EDA']]],
  ['Power BI and DAX', [['Four-page interactive market dashboard', 'Dubai Real Estate Market Analyzer'], ['Live weight sliders recalculated in DAX', 'Digital Nomad City Scorecard'], ['300K transactions, four pages', 'PhonePe Transaction Analysis'], ['Omnichannel retail view', 'Decathlon Sales & Customer Analytics']]],
  ['Statistics', [['t-tests and ANOVA on area and price', 'Dubai Real Estate Market Analyzer'], ["Welch's t-test on card and cash fares", 'NYC Taxi Fare Prediction'], ['Sharpe ratio, beta and drawdown', 'Gulf Market Tracker: Stock Risk & Return']]],
  ['Machine learning', [['Random Forest churn model, 90.8% accuracy', 'PowerCo SME Customer Churn & Retention'], ['K-Means grouping of 63 cities', 'Digital Nomad City Scorecard'], ['Fare regression, R² 0.94', 'NYC Taxi Fare Prediction']]],
  ['Language models and NLP', [['Sentence-BERT search over 1M+ movies', 'AI Movie Recommendation Engine'], ['TF-IDF chatbot with a confidence guardrail', 'Lahore Tour Guide Chatbot']]],
  ['Excel and JavaScript', [['Excel data model behind the PhonePe pages', 'PhonePe Transaction Analysis'], ['A live Chart.js dashboard of 12 Gulf stocks', 'Gulf Market Tracker: Stock Risk & Return']]],
];
function renderTools() {
  const byTitle = t => items().find(i => i.title === t);
  $('bars').innerHTML = TOOLS.map(([name, rows], k) => `<details data-rv style="--i:${k}"${k === 0 ? ' open' : ''}><summary>${esc(name)}</summary><ul>${rows.map(([what, proj]) => {
    const it = byTitle(proj);
    return `<li>${esc(what)}<span>${it ? `<a class="link" href="#work" data-open="${it.id}">${esc(proj.split(':')[0])}</a>` : esc(proj)}</span></li>`;
  }).join('')}</ul></details>`).join('');
}

/* ---------- certificates ---------- */
function renderCerts() {
  const certs = items().filter(i => i.kind === 'cert');
  const kinds = [['Google, on Coursera', c => /Google/.test(c.tag)], ['Job simulations, on Forage', c => /Forage/.test(c.tag)], ['HP LIFE', c => /HP/.test(c.tag)]];
  $('names').innerHTML = kinds.map(([k, f]) => `<div><p class="kind">${k}</p>` + certs.filter(f).map(c => {
    const who = c.tag.split(' · ')[0];
    const label = /Forage/.test(c.tag) ? `${who}: ${c.title}` : c.title;
    return `<p>${c.url ? `<a class="link" href="${esc(c.url)}" target="_blank" rel="noopener">${esc(label)}</a>` : `<a class="link" href="#certs" data-open="${c.id}">${esc(label)}</a>`}<small>${esc((c.m || [])[0] || '')}</small></p>`;
  }).join('') + '</div>').join('');
  $('certimgs').innerHTML = certs.filter(c => c.img).map((c, n) => `<button data-open="${c.id}" data-rv style="--i:${n}" aria-label="View certificate: ${esc(c.title)}"><img src="${esc(thumb(c.img))}" alt="${esc(c.title)} certificate" loading="lazy" width="640" height="480"></button>`).join('');
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
  const links = (it.url || it.gh) ? `<div class="dl">${it.url ? `<a class="btn" href="${esc(it.url)}" target="_blank" rel="noopener">${it.kind === 'cert' ? 'Verify the credential' : 'Open the live dashboard'}</a>` : ''}${it.gh ? `<a class="btn alt" href="${esc(it.gh)}" target="_blank" rel="noopener">See the code on GitHub</a>` : ''}</div>` : '';
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

/* ---------- ledger hover: globe and preview ---------- */
function wireLedger() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const pv = $('preview'), pimg = pv.querySelector('img');
  const show = row => {
    if (row.dataset.loc && window.GLOBE) window.GLOBE.focus(row.dataset.loc);
    if (!fine.matches) return;
    if (row.dataset.img) { pimg.src = thumb(row.dataset.img); pv.classList.add('on'); } else pv.classList.remove('on');
  };
  $('ledger').addEventListener('pointerover', e => { const r = e.target.closest('.row'); if (r) show(r); });
  $('ledger').addEventListener('focusin', e => { const r = e.target.closest('.row'); if (r) show(r); });
  $('ledger').addEventListener('pointerleave', () => pv.classList.remove('on'));
}

/* ---------- stage: the fixed half changes with the section ---------- */
function wireStage() {
  const layers = [...document.querySelectorAll('.stage .layer')];
  const clip = $('clip');
  const set = id => {
    layers.forEach(l => l.classList.toggle('on', l.dataset.for.split(' ').includes(id)));
    const want = id === 'tools' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (want) { clip.preload = 'auto'; clip.play().catch(() => {}); } else clip.pause();
  };
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) set(x.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
  ['top', 'work', 'tools', 'about'].forEach(id => io.observe($(id)));
  document.addEventListener('visibilitychange', () => { if (document.hidden) clip.pause(); });
}

/* ---------- entrances ---------- */
const rio = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); rio.unobserve(x.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }) : null;
function reveal() { document.querySelectorAll('[data-rv]:not(.in), footer:not(.in)').forEach(e => rio ? rio.observe(e) : e.classList.add('in')); }

/* ---------- contact: one field to a started email ---------- */
$('ask').addEventListener('submit', e => {
  e.preventDefault();
  const role = $('role').value.trim();
  const subject = role ? `Data role: ${role}` : 'A data analyst role';
  const body = `Hi Umair,\n\nI saw your portfolio and would like to talk about ${role ? 'this role: ' + role : 'a data role'}.\n\n`;
  location.href = `mailto:umairasifofficalll@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* ---------- Lahore clock in the stage bar ---------- */
const clock = $('clock');
const tick = () => { try { clock.textContent = 'Lahore · ' + new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' }).format(new Date()); } catch (e) {} };
tick(); setInterval(tick, 30000);

/* ---------- owner tools: only with #owner in the address ---------- */
const PINH = '8c454536b6e2b8b29a1d839aa3c5ccf0ab57a590d619739b23a32d11585220c9';
const sha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0') /* taste-skill-ignore: hex digest */).join('');
function ownerUI() {
  if (!/owner/.test(location.hash + location.search) || $('ownerBtn')) return;
  const b = document.createElement('button'); b.id = 'ownerBtn'; b.className = 'btn'; b.textContent = 'Add an item'; b.style.marginTop = '24px';
  $('work').querySelector('.intro').after(b);
  b.onclick = () => {
    $('ownerBody').innerHTML = `<h3>Owner access</h3><form id="pinF"><label for="pin">PIN</label><input id="pin" type="password" inputmode="numeric" autocomplete="off" required><p class="err" id="pinE"></p><button class="btn">Open owner tools</button></form>`;
    $('owner').showModal();
    $('pinF').onsubmit = async ev => {
      ev.preventDefault();
      if (await sha($('pin').value.trim()) !== PINH) { $('pinE').textContent = 'Wrong PIN.'; return; }
      $('ownerBody').innerHTML = `<h3>Add to the portfolio</h3><form id="upF"><label for="uk">Section</label><select id="uk"><option value="project">Case study</option><option value="dashboard">Dashboard</option><option value="cert">Certificate</option></select><label for="ut">Title</label><input id="ut" required maxlength="120"><label for="ug">Tools or issuer</label><input id="ug" maxlength="60"><label for="ud">Description</label><textarea id="ud" rows="3" maxlength="600"></textarea><label for="uu">Link</label><input id="uu" type="url" placeholder="https://"><p class="err">Added items show for this visit only. To keep one, add it to data.js on GitHub.</p><button class="btn">Add</button></form>`;
      $('upF').onsubmit = ev2 => {
        ev2.preventDefault();
        live.unshift({ id: 'l' + Date.now(), kind: $('uk').value, title: $('ut').value.trim(), tag: $('ug').value.trim(), desc: $('ud').value.trim(), url: $('uu').value.trim(), m: [] });
        renderAll(); $('owner').close(); toast('Added for this visit.');
      };
    };
  };
}
addEventListener('hashchange', ownerUI);

function renderAll() { renderLedger(); renderTools(); renderCerts(); reveal(); }
renderAll(); wireLedger(); wireStage(); ownerUI();
window.dispatchEvent(new Event('ua-ready'));
})();
