/* Emoji Studio app: lazy previews + TGS download. Requires engine.js, templates.js, pako. */
(function () {
'use strict';

const state = { word: 'GRID', color: '#ffffff', stroke: false, strokeColor: '#000000', size: 1.0 };

function flash(msg, bad) {
  const s = document.getElementById('status');
  s.textContent = msg; s.style.opacity = 1;
  s.style.background = bad ? '#7a2f3a' : '#27435f';
  clearTimeout(s._t); s._t = setTimeout(() => s.style.opacity = 0, 2200);
}
window.addEventListener('error', e => flash('ERR: ' + (e.message || e.type), true));

function buildPack(tpl) {
  return ES.replaceSlots(tpl.doc, {
    word: state.word, color: state.color, size: state.size,
    stroke: state.stroke, strokeColor: state.strokeColor,
  }).doc;
}

function readState() {
  state.word = document.getElementById('word').value.trim() || 'GRID';
  state.color = document.getElementById('color').value;
  state.stroke = document.getElementById('strokeOn').checked;
  state.strokeColor = document.getElementById('strokeColor').value;
  state.size = Number(document.getElementById('size').value) / 100;
  document.getElementById('sizeVal').textContent = document.getElementById('size').value + '%';
}

function download(card) {
  const doc = buildPack(card.tpl);
  const raw = new TextEncoder().encode(JSON.stringify(doc));
  const gz = pako.gzip(raw);
  if (gz.length > 64 * 1024) {
    card.warn.textContent = `⚠ ${Math.round(gz.length / 1024)} КБ — больше лимита Telegram 64 КБ`;
  } else {
    card.warn.textContent = `${Math.round(gz.length / 1024)} КБ`;
  }
  const blob = new Blob([gz], { type: 'application/gzip' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${state.word}_${card.name}.tgs`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  flash('Скачано: ' + a.download);
}

const packBox = document.getElementById('pack');
const cards = [];
for (const tpl of window.TEMPLATES) {
  const card = document.createElement('div');
  card.className = 'card';
  const player = document.createElement('lottie-player');
  player.setAttribute('loop', ''); player.setAttribute('autoplay', '');
  const nm = document.createElement('div');
  nm.className = 'nm'; nm.textContent = tpl.name.slice(0, 24);
  const btn = document.createElement('button');
  btn.textContent = 'Скачать .tgs';
  const warn = document.createElement('div'); warn.className = 'warn';
  btn.addEventListener('click', () => download(rec));
  card.append(player, nm, btn, warn);
  packBox.appendChild(card);
  const rec = { tpl, player, name: tpl.name.replace(/[^\w-]+/g, '_').slice(0, 24), warn, loaded: false };
  cards.push(rec);
}

/* lazy: build + play previews only when they scroll into view */
const io = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    const rec = en.target._rec;
    io.unobserve(en.target);
    if (!rec.loaded) loadCard(rec);
  }
}, { rootMargin: '300px' });

function loadCard(rec) {
  rec.loaded = true;
  try { rec.player.load(JSON.stringify(buildPack(rec.tpl))); }
  catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
}

for (const rec of cards) {
  rec.player.parentElement._rec = rec;
  io.observe(rec.player.parentElement);
}

let pending = null;
function rebuildLoaded() {
  readState();
  for (const rec of cards) {
    if (!rec.loaded) continue;
    try { rec.player.load(JSON.stringify(buildPack(rec.tpl))); }
    catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
  }
  if (pending) { clearTimeout(pending); pending = null; }
}

let deb;
['word', 'color', 'strokeOn', 'strokeColor', 'size'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    readState();
    clearTimeout(deb);
    deb = setTimeout(rebuildLoaded, 700);
  });
});
})();
