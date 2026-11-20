const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d ;} catch (e) { return d ;} }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) ;} catch (e) { } } };
const G = ['#8a5a3c,#c98b5a', '#2e6f57,#6fb58f', '#b5532f,#f0a35e', '#5b4a8a,#a38fd6', '#1f6f8b,#6cc3d5', '#8a3c5a,#e08aa8'];
const CITY = { 'Manila': '🏙️', 'Cebu City': '🌊', 'Baguio': '🌲', 'Davao City': '🍈', 'Iloilo City': '🏛️', 'Tagaytay': '🌋', 'Cagayan de Oro': '⛰️', 'Siargao': '🏄' };
let cafes = [
  { n: 'Pandan & Pour', city: 'Manila', a: 'Poblacion, Makati', lat: 14.5647, lng: 121.0306, r: 4.8, v: 412, o: 7, c: 22, t: ['Pour over', 'Pandan latte', 'Quiet'], d: 'Slow bar with pandan-infused lattes and a wall of plants.' },
  { n: 'Ube Roast Lab', city: 'Manila', a: 'Maginhawa, Quezon City', lat: 14.6446, lng: 121.0562, r: 4.6, v: 287, o: 9, c: 23, t: ['Ube latte', 'Study spot'], d: 'Student favorite known for ube cold brew and long tables.' },
  { n: 'Ridge Line Coffee', city: 'Baguio', a: 'Session Road', lat: 16.4115, lng: 120.5960, r: 4.9, v: 530, o: 6, c: 20, t: ['Benguet beans', 'Fireplace', 'Pine views'], d: 'Single-origin Benguet coffee roasted in-house, with a real fireplace.' },
  { n: 'Pine Mist Café', city: 'Baguio', a: 'Camp John Hay', lat: 16.3984, lng: 120.6105, r: 4.5, v: 198, o: 8, c: 21, t: ['Brunch', 'Garden'], d: 'Foggy-morning garden seats and warm pastries.' },
  { n: 'Sugbo Beans', city: 'Cebu City', a: 'IT Park', lat: 10.3290, lng: 123.9062, r: 4.7, v: 344, o: 7, c: 24, t: ['Espresso', 'Wi-Fi', 'Late night'], d: 'Open until midnight with strong espresso and fast Wi-Fi.' },
  { n: 'Tuslob Brew House', city: 'Cebu City', a: 'Colon', lat: 10.2955, lng: 123.9019, r: 4.3, v: 121, o: 8, c: 20, t: ['Heritage', 'Budget'], d: 'Old-town stop for sweet barako and ensaymada.' },
  { n: 'Kapeng Davao', city: 'Davao City', a: 'Matina', lat: 7.0536, lng: 125.5849, r: 4.6, v: 215, o: 7, c: 22, t: ['Local beans', 'Durian cake'], d: 'Mindanao-grown beans and a daring durian cake.' },
  { n: 'Sunrise Mindanao Roasters', city: 'Davao City', a: 'Lanang', lat: 7.1011, lng: 125.6372, r: 4.4, v: 96, o: 6, c: 18, t: ['Roastery', 'Beans to go'], d: 'Early-bird roastery selling fresh bags by the kilo.' },
  { n: 'Taal View Coffee', city: 'Tagaytay', a: 'Aguinaldo Highway', lat: 14.1136, lng: 120.9620, r: 4.8, v: 620, o: 7, c: 21, t: ['Taal view', 'Sunset', 'Bulalo bowls'], d: 'Balcony seats facing Taal Lake and a legendary sunset.' },
  { n: 'Molo Morning', city: 'Iloilo City', a: 'Molo', lat: 10.6958, lng: 122.5430, r: 4.5, v: 143, o: 7, c: 21, t: ['Heritage house', 'Panaderia'], d: 'Ancestral house café with batchoy-inspired brunch.' },
  { n: 'Cogon Cold Brew', city: 'Cagayan de Oro', a: 'Divisoria', lat: 8.4772, lng: 124.6460, r: 4.2, v: 77, o: 8, c: 22, t: ['Cold brew', 'Rooftop'], d: 'Rooftop cold brew bar in the heart of the city.' },
  { n: 'Cloud 9 Beanery', city: 'Siargao', a: 'General Luna', lat: 9.7869, lng: 126.1620, r: 4.7, v: 389, o: 6, c: 19, t: ['Surf crowd', 'Smoothie bowls', 'Beach'], d: 'Post-surf flat whites and bowls, 3 minutes from the waves.' }
].concat(store.get('bw_cafes', []));
let me = store.get('bw_session', null), pos = null;

/* helpers */
const h24 = () => +new Intl.DateTimeFormat('en-GB', { hour: '2-digit', hour12: false, timeZone: 'Asia/Manila' }).format(new Date()) % 24;
const isOpen = c => { const h = h24(); return c.o < c.c ? h >= c.o && h < c.c : h >= c.o || h < c.c ;};
const f12 = h => { h %= 24; return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM') ;};
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
const gmap = c => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.lat ? c.lat + ',' + c.lng : `${c.n} ${c.a} ${c.city} Philippines`);
const km = (a, b, c, d) => { const R = 6371, p = Math.PI / 180, x = (c - a) * p, y = (d - b) * p, q = Math.sin(x / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(y / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(q)) ;};
const dist = c => pos && c.lat ? km(pos.lat, pos.lng, c.lat, c.lng) : null;
const stars = r => `<span class="rate"><span class="st" style="--p:${r / 5 * 100}%" aria-hidden="true">★★★★★</span><b>${r.toFixed(1)}</b></span>`;
const grad = i => `linear-gradient(135deg,${G[i % G.length].split(',').join(',')})`;
const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600) ;};

let editing = null;
const own = c => !!(me && c.owner && c.owner === me.em);
const ownBtns = (c, i) => own(c)
  ? `<div class="acts own"><button class="btn ghost" data-edit="${i}">Edit café</button><button class="btn danger" data-del="${i}">Delete</button></div>`
  : '';
function card(c) {
  const i = cafes.indexOf(c), o = isOpen(c), d = dist(c);
  return `<article class="card tilt"><div class="cov" style="background:${grad(i)}">☕<span class="badge ${o ? '' : 'x'}">${o ? 'Open' : 'Closed'}</span>${d != null ? `<span class="dist">${d.toFixed(1)} km</span>` : ''}</div>
 <div class="cb"><h3>${esc(c.n)}</h3><div class="meta">${esc(c.a)}, ${esc(c.city)}</div>
 <div class="rate">${stars(c.r)}<span class="meta">(${c.v} reviews)</span></div>
 <div class="meta">${f12(c.o)} – ${f12(c.c)}</div>
 <div class="tags">${c.t.slice(0, 3).map(t => `<span>${esc(t)}</span>`).join('')}</div>
 <div class="acts"><button class="btn ghost" data-p="${i}">View profile</button><a class="btn" target="_blank" rel="noopener" href="${gmap(c)}">Google Maps</a></div>${ownBtns(c, i)}</div></article>`;
}
/* render */
function renderFeat() { $('#featList').innerHTML = [...cafes].sort((a, b) => b.r - a.r || b.v - a.v).slice(0, 6).map(card).join('') ;}
function renderCities() {
  const by = {}; cafes.forEach(c => by[c.city] = (by[c.city] || 0) + 1);
  $('#cityList').innerHTML = Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n], i) => `<button class="city" style="background:${grad(i)}" data-c="${esc(k)}"><em>${CITY[k] || '☕'}</em><b>${esc(k)}</b><span>${n} café${n > 1 ? 's' : ''}</span></button>`).join('');
  const cs = [...new Set(cafes.map(c => c.city))].sort();
  $('#fc').innerHTML = '<option value="">All cities</option>' + cs.map(c => `<option>${esc(c)}</option>`).join('');
  const fcs = $('#fcs');
  if (fcs) fcs.innerHTML = cs.map(c => `<option>${esc(c)}</option>`).join('') + '<option value="__o">Other…</option>';
}
function renderList() {
  const q = $('#q2').value.trim().toLowerCase(), fc = $('#fc').value, fo = $('#fo').value, s = $('#fs').value;
  let l = cafes.filter(c => (!fc || c.city === fc) && (!fo || isOpen(c)) && (!q || (c.n + c.a + c.city + c.t.join(' ')).toLowerCase().includes(q)));
  l.sort((a, b) => s === 'n' ? a.n.localeCompare(b.n) : s === 'd' && pos ? (dist(a) ?? 1e9) - (dist(b) ?? 1e9) : b.r - a.r);
  $('#count').textContent = l.length + ' café' + (l.length === 1 ? '' : 's') + ' found';
  $('#list').innerHTML = l.length ? l.map(card).join('') : '<div class="empty" style="grid-column:1/-1">No cafés match. Try another city or clear the search.</div>';
  tilt();
}
function renderSubmit() {
  $('#subBox').innerHTML = me ? `<form class="form" id="subF"><label>Café name<input name="n" required maxlength="60"></label>
 <label>City<select name="city" id="fcs"></select></label>
 <label id="oc" hidden>Other city<input name="oc"></label>
 <label>Area or street<input name="a" required></label>
 <label>Opens<select name="o">${[...Array(24).keys()].map(h => `<option value="${h}" ${h == 8 ? 'selected' : ''}>${f12(h)}</option>`).join('')}</select></label>
 <label>Closes<select name="c">${[...Array(24).keys()].map(h => `<option value="${h}" ${h == 21 ? 'selected' : ''}>${f12(h)}</option>`).join('')}</select></label>
 <label>Your rating<select name="r">${[5, 4.5, 4, 3.5, 3].map(x => `<option>${x}</option>`).join('')}</select></label>
 <label class="full">Tags, separated by commas<input name="t" placeholder="Pour over, Quiet, Wi-Fi"></label>
 <label class="full">What makes it good?<textarea name="d" rows="3" maxlength="200" required></textarea></label>
 <div class="full acts" style="padding:0"><button class="btn">${editing ? 'Save changes' : 'Submit café'}</button>${editing ? '<button type="button" class="btn ghost" data-cancel>Cancel</button>' : ''}</div></form>`
    : `<div class="lock"><h3>Sign in to submit a café</h3><p class="meta" style="margin:8px 0 18px">It takes 20 seconds. Create an account or sign in.</p><button class="btn" data-auth>Sign in or create account</button></div>`;
  renderCities();
  if (me && editing) fillForm(editing);
}
function fillForm(c) {
  const f = $('#subF'); if (!f) return;
  const el = f.elements;
  el.n.value = c.n; el.a.value = c.a; el.o.value = c.o; el.c.value = c.c; el.r.value = c.r;
  el.t.value = c.t.join(', '); el.d.value = c.d;
  const known = [...el.city.options].some(o => o.value === c.city);
  el.city.value = known ? c.city : '__o';
  $('#oc').hidden = known;
  if (!known) el.oc.value = c.city;
}
function startEdit(c) {
  if (!own(c)) return;
  editing = c;
  if ($('#profD').open) $('#profD').close();
  renderSubmit();
  $('#submit').scrollIntoView();
  toast('Editing ' + c.n);
}
function delCafe(c) {
  if (!own(c)) return;
  if (!confirm('Delete "' + c.n + '"? This cannot be undone.')) return;
  cafes.splice(cafes.indexOf(c), 1);
  store.set('bw_cafes', store.get('bw_cafes', []).filter(x => x.id !== c.id));
  if (editing === c) editing = null;
  if ($('#profD').open) $('#profD').close();
  refreshAll(); renderSubmit();
  toast('Café deleted');
}
function refreshAll() { renderFeat(); renderCities(); renderList(); tilt() ;}
/* auth */
let mode = 'in';
function setMode(m) { mode = m; $$('.tabs button').forEach(b => b.classList.toggle('on', b.dataset.t === m)); $('#an').hidden = m === 'in'; $('#an').required = m === 'up'; $('#asb').textContent = m === 'in' ? 'Sign in' : 'Create account'; $('#ae2').textContent = '' ;}
function authUI() { $('#authBtn').textContent = me ? 'Hi, ' + me.name.split(' ')[0] : 'Sign in' ;}
$('#authBtn').onclick = () => { if (me) { me = null; store.set('bw_session', null); editing = null; authUI(); renderSubmit(); refreshAll(); toast('Signed out') ;} else { setMode('in'); $('#authD').showModal() ;} };
$$('.tabs button').forEach(b => b.onclick = () => setMode(b.dataset.t));
$('#authF').onsubmit = e => {  
e.preventDefault();
  const users = store.get('bw_users', []), em = $('#ae').value.trim().toLowerCase(), pw = $('#ap').value;
  if (mode === 'up') {    
if (users.some(u => u.em === em)) return $('#ae2').textContent = 'That email already has an account. Sign in instead.';
    const u = { em, name: $('#an').value.trim() || 'Friend', pw: btoa(unescape(encodeURIComponent(pw))) }; users.push(u); store.set('bw_users', users); me = u  
;}
  else { const u = users.find(u => u.em === em && u.pw === btoa(unescape(encodeURIComponent(pw)))); if (!u) return $('#ae2').textContent = 'Email or password is wrong. Check both, or create an account.'; me = u ;}
  store.set('bw_session', { em: me.em, name: me.name }); me = { em: me.em, name: me.name }; $('#authD').close(); $('#authF').reset(); authUI(); renderSubmit(); refreshAll(); toast('Welcome, ' + me.name.split(' ')[0] + '!');
};
/* events */
document.addEventListener('click', e => {
  const ed = e.target.closest('[data-edit]'); if (ed) return startEdit(cafes[+ed.dataset.edit]);
  const dl = e.target.closest('[data-del]'); if (dl) return delCafe(cafes[+dl.dataset.del]);
  if (e.target.closest('[data-cancel]')) { editing = null; renderSubmit(); return; }
  const p = e.target.closest('[data-p]'); if (p) return openProf(+p.dataset.p);
  const c = e.target.closest('[data-c]'); if (c) { $('#fc').value = c.dataset.c; renderList(); $('#browse').scrollIntoView(); return ;}
  if (e.target.closest('[data-auth]')) { setMode('in'); $('#authD').showModal() ;}
  if (e.target.closest('[data-close]')) e.target.closest('dialog').close();
  if (e.target.tagName === 'DIALOG') e.target.close();
});
$('#heroSearch').onsubmit = e => { e.preventDefault(); $('#q2').value = $('#q').value; renderList(); $('#browse').scrollIntoView() ;};
['q2', 'fc', 'fs', 'fo'].forEach(id => $('#' + id).addEventListener('input', renderList));
$('#near').onclick = () => {  
if (!navigator.geolocation) return toast('Location is not available in this browser');
  navigator.geolocation.getCurrentPosition(p => { pos = { lat: p.coords.latitude, lng: p.coords.longitude }; $('#fs').value = 'd'; refreshAll(); toast('Sorted by distance from you'); $('#browse').scrollIntoView() ;}, () => toast('Allow location access to find cafés near you'))
;};
document.addEventListener('change', e => { if (e.target.id === 'fcs') $('#oc').hidden = e.target.value !== '__o'; });
document.addEventListener('submit', e => {  
if (e.target.id !== 'subF') return; e.preventDefault();
  const f = Object.fromEntries(new FormData(e.target)), city = f.city === '__o' ? (f.oc || '').trim() : f.city;
  if (!city) return toast('Enter a city for your café');
  const data = { n: f.n.trim(), city, a: f.a.trim(), r: +f.r, o: +f.o, c: +f.c, t: (f.t || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 4), d: f.d.trim() };
  if (!data.t.length) data.t = ['New'];
  const mine = store.get('bw_cafes', []);
  if (editing) {
    Object.assign(editing, data);
    store.set('bw_cafes', mine.map(x => x.id === editing.id ? editing : x));
    editing = null;
    toast('Café updated');
  } else {
    const c = { ...data, v: 1, by: me.name, owner: me.em, id: Date.now() };
    cafes.push(c); mine.push(c); store.set('bw_cafes', mine);
    toast('Café submitted. Thanks, ' + me.name.split(' ')[0] + '!');
  }
  refreshAll(); renderSubmit(); $('#browse').scrollIntoView()
;});
function openProf(i) {  
const c = cafes[i], o = isOpen(c);
  $('#profC').innerHTML = `<div class="prof" style="background:${grad(i)}">☕</div><div class="dc"><button class="ico x" data-close aria-label="Close">✕</button>
 <h2>${esc(c.n)}</h2><div class="meta">${esc(c.a)}, ${esc(c.city)}</div>
 <div class="rate">${stars(c.r)}<span class="meta">${c.v} reviews</span><span class="badge ${o ? '' : 'x'}" style="position:static;border:1px solid var(--line)">${o ? 'Open now' : 'Closed now'}</span></div>
 <p>${esc(c.d)}</p>${c.by ? `<p class="meta">Submitted by ${esc(c.by)}</p>` : ''}
 <div class="hrs"><b>Hours</b><span>Daily, ${f12(c.o)} – ${f12(c.c)}</span><b>Tags</b><span>${c.t.map(esc).join(', ')}</span></div>
 <a class="btn" style="justify-content:center" target="_blank" rel="noopener" href="${gmap(c)}">View in Google Maps</a>${ownBtns(c, i)}</div>`; $('#profD').showModal()
;}
/* theme */
function setTheme(t) { document.documentElement.dataset.theme = t; $('#theme').textContent = t === 'dark' ? '☀️' : '🌙'; store.set('bw_theme', t); if (window.__tint) window.__tint(t) ;}
$('#theme').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
setTheme(store.get('bw_theme', matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
/* 3D tilt + reveal */
function tilt() {  
if (matchMedia('(pointer:coarse)').matches) return; $$('.tilt').forEach(c => {    
if (c._t) return; c._t = 1;
    c.addEventListener('pointermove', e => { const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)` ;});
    c.addEventListener('pointerleave', () => c.style.transform = '')  
;})
;}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) ;} }), { threshold: .15 });
$$('.rev').forEach(el => io.observe(el));
/* THREE: coffee cup + floating beans */
(function () {
  const box = $('#stage');
  if (!window.THREE || matchMedia('(prefers-reduced-motion:reduce)').matches) { box.querySelector('.fallback').style.display = 'block'; return ;}
  try {
    const T = THREE, sc = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, .1, 100); cam.position.set(0, 2.6, 8); cam.lookAt(0, .4, 0);
    const rd = new T.WebGLRenderer({ antialias: true, alpha: true }); rd.setPixelRatio(Math.min(devicePixelRatio, 2)); box.appendChild(rd.domElement);
    sc.add(new T.AmbientLight(0xffffff, .7)); const dl = new T.DirectionalLight(0xffe2b8, 1); dl.position.set(4, 6, 5); sc.add(dl);
    const grp = new T.Group(); sc.add(grp);
    const cupM = new T.MeshStandardMaterial({ color: 0xf6efe4, roughness: .35 }), coffeeM = new T.MeshStandardMaterial({ color: 0x3b2013, roughness: .25 });
    const pts = [[0, 0], [.9, 0], [1.2, .2], [1.5, 1.6], [1.4, 1.65], [1.1, .4], [0, .35]].map(p => new T.Vector2(p[0], p[1]));
    const cup = new T.Mesh(new T.LatheGeometry(pts, 64), cupM); cup.material.side = T.DoubleSide; grp.add(cup);
    const cof = new T.Mesh(new T.CircleGeometry(1.42, 48), coffeeM); cof.rotation.x = -Math.PI / 2; cof.position.y = 1.35; grp.add(cof);
    const handle = new T.Mesh(new T.TorusGeometry(.5, .12, 16, 32, Math.PI * 1.3), cupM); handle.position.set(1.45, 1, 0); handle.rotation.z = -Math.PI / 2 - .65; grp.add(handle);
    const sau = new T.Mesh(new T.CylinderGeometry(2.2, 1.8, .14, 64), cupM); sau.position.y = -.08; grp.add(sau);
    const beanM = new T.MeshStandardMaterial({ color: 0x5a3520, roughness: .5 }), beans = [];
    for (let i = 0; i < 34; i++) {      
const b = new T.Mesh(new T.SphereGeometry(.2, 16, 12), beanM); b.scale.set(1, 1.4, .75);
      const a = Math.random() * 6.28, r = 2.6 + Math.random() * 2.2; b.position.set(Math.cos(a) * r, -.5 + Math.random() * 4.5, Math.sin(a) * r - 1); b.userData = { s: .3 + Math.random() * .7, o: Math.random() * 6.28, y: b.position.y }; sc.add(b); beans.push(b)    
;}
    window.__tint = t => { cupM.color.set(t === 'dark' ? 0xe9d9c2 : 0xf6efe4) ;}; window.__tint(document.documentElement.dataset.theme);
    let mx = 0, my = 0; addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 ;});
    function fit() { const w = box.clientWidth, h = box.clientHeight; rd.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix() ;}
    fit(); addEventListener('resize', fit);
    let vis = true; new IntersectionObserver(e => vis = e[0].isIntersecting).observe(box);
    const clk = new T.Clock();
    (function loop() {      
requestAnimationFrame(loop); if (!vis) return; const t = clk.getElapsedTime();
      grp.rotation.y = t * .35 + mx * 1.2; grp.rotation.x = my * .35; grp.position.y = Math.sin(t) * .12;
      beans.forEach(b => { const u = b.userData; b.rotation.x = t * u.s; b.rotation.z = t * u.s * .7; b.position.y = u.y + Math.sin(t * u.s + u.o) * .4 ;});
      rd.render(sc, cam)    
;})();
  } catch (e) { box.querySelector('.fallback').style.display = 'block' ;}
})();
/* init */
authUI(); renderSubmit(); refreshAll();
