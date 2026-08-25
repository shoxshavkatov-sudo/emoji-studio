/* Emoji Studio app: all cards animate as they enter the viewport;
 * bottom bar = 1 select → 2 style → 3 download. Settings apply to the selected card only. */
(function () {
'use strict';

const state = {
  word: 'GRID', color: '#ffffff', stroke: false, strokeColor: '#000000',
  tint: false, tintColor: '#ffffff', size: 1.0, font: 'block',
};

function flash(msg, bad) {
  const s = document.getElementById('status');
  s.textContent = msg; s.style.opacity = 1;
  s.style.background = bad ? '#7a2f3a' : 'rgba(22,24,28,.95)';
  clearTimeout(s._t); s._t = setTimeout(() => s.style.opacity = 0, 2400);
}
window.addEventListener('error', e => flash('ERR: ' + (e.message || e.type), true));

function readState() {
  state.word = document.getElementById('word').value.trim() || 'GRID';
  state.color = document.getElementById('color').value;
  state.stroke = document.getElementById('strokeOn').checked;
  state.strokeColor = document.getElementById('strokeColor').value;
  state.tint = document.getElementById('tintOn').checked;
  state.tintColor = document.getElementById('tintColor').value;
  state.size = Number(document.getElementById('size').value) / 100;
  state.font = document.getElementById('font').value;
  document.getElementById('sizeVal').textContent = document.getElementById('size').value + '%';
}

function buildDoc(rec) {
  const opts = {
    word: state.word, color: state.color, size: state.size,
    stroke: state.stroke, strokeColor: state.strokeColor, font: state.font,
  };
  const doc = ES.replaceSlots(rec.base, opts).doc;
  return state.tint ? ES.tintDoc(doc, state.tintColor) : doc;
}

async function loadDoc(rec) {
  const buf = await (await fetch('tpl/' + rec.i + '.tgs')).arrayBuffer();
  rec.base = JSON.parse(pako.ungzip(new Uint8Array(buf), { to: 'string' }));
}

/* cards: static thumb behind, live player on top once visible */
const cards = [];
const packBox = document.getElementById('pack');
document.getElementById('tplcount').textContent = window.MANIFEST.length;
for (const m of window.MANIFEST) {
  const card = document.createElement('div');
  card.className = 'card';
  const stage = document.createElement('div');
  stage.className = 'stage';
  const thumb = document.createElement('img');
  thumb.className = 'thumb';
  thumb.loading = 'lazy';
  thumb.src = 'thumbs/' + m.i + '.png';
  thumb.alt = '';
  thumb.addEventListener('error', () => thumb.classList.add('nolist'));
  stage.appendChild(thumb);
  const nm = document.createElement('div');
  nm.className = 'nm'; nm.textContent = m.n;
  const warn = document.createElement('div'); warn.className = 'warn';
  card.append(stage, nm, warn);
  packBox.appendChild(card);
  const rec = { i: m.i, name: m.n.replace(/[^\w-]+/g, '_').slice(0, 24) || 'emoji', el: card, stage, warn, base: null, player: null };
  card.addEventListener('click', () => select(rec));
  cards.push(rec);
}

/* selection */
let selected = null;
const selname = document.getElementById('selname');

async function select(rec) {
  try {
    if (!rec.base) await ensurePlaying(rec);
  } catch (e) {
    flash('Не удалось загрузить шаблон: ' + e.message, true);
    return;
  }
  if (selected && selected !== rec) selected.el.classList.remove('sel');
  selected = rec;
  rec.el.classList.add('sel');
  selname.textContent = state.word + ' · ' + rec.name;
  rebuildOne(rec);
  rec.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function deselect() {
  if (selected) selected.el.classList.remove('sel');
  selected = null;
  selname.textContent = 'выбери карточку';
}
document.getElementById('selclear').addEventListener('click', deselect);
document.getElementById('dlOne').addEventListener('click', () => {
  if (selected) downloadSelected();
  else flash('Сначала выбери эмодзи — шаг 1', true);
});

function rebuildOne(rec) {
  if (!rec.player || !rec.base) return;
  try { rec.player.load(JSON.stringify(buildDoc(rec))); }
  catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
}

/* animate every card: background queue loads templates one by one
 * (IntersectionObserver callbacks proved unreliable in some webviews,
 * so we don't depend on them); scrolling moves visible cards to the front */
async function ensurePlaying(rec) {
  if (!rec.base) await loadDoc(rec);
  if (!rec.player) {
    rec.player = document.createElement('lottie-player');
    rec.player.setAttribute('loop', '');
    rec.player.setAttribute('autoplay', '');
    rec.stage.appendChild(rec.player);
    // lottie-player (Lit) mounts its shadow DOM asynchronously: a load() in
    // the same tick is silently dropped — give it a beat first
    await new Promise(r => setTimeout(r, 150));
  }
  rebuildOne(rec);
}
const queue = cards.slice();
let pumping = false;
async function pump() {
  if (pumping) return;
  pumping = true;
  while (queue.length) {
    const rec = queue.shift();
    try { await ensurePlaying(rec); } catch (e) { /* keep going */ }
    await new Promise(r => setTimeout(r, 60));
  }
  pumping = false;
}
setTimeout(pump, 400);
window.addEventListener('scroll', () => {
  const vh = window.innerHeight;
  for (let i = queue.length - 1; i >= 0; i--) {
    const r = queue[i].el.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) queue.unshift(queue.splice(i, 1)[0]);
  }
}, { passive: true });

/* download */
function downloadSelected() {
  const rec = selected;
  try {
    const raw = new TextEncoder().encode(JSON.stringify(buildDoc(rec)));
    const gz = pako.gzip(raw);
    if (gz.length > 64 * 1024) rec.warn.textContent = `⚠ ${Math.round(gz.length / 1024)} КБ > лимита`;
    else rec.warn.textContent = `${Math.round(gz.length / 1024)} КБ`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([gz], { type: 'application/gzip' }));
    a.download = `${state.word}_${rec.name}.tgs`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    flash('Скачано: ' + a.download);
  } catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
}

let deb;
['word', 'color', 'strokeOn', 'strokeColor', 'tintOn', 'tintColor', 'size', 'font'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    readState();
    if (selected) selname.textContent = state.word + ' · ' + selected.name;
    clearTimeout(deb);
    deb = setTimeout(() => {
      if (selected) rebuildOne(selected);
      else flash('Сначала выбери эмодзи — шаг 1');
    }, 400);
  });
});
})();
