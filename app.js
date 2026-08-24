/* Emoji Studio app: our templates + pack slots, tint, selection, lazy previews, TGS download. */
(function () {
'use strict';

const state = {
  word: 'GRID', color: '#ffffff', stroke: false, strokeColor: '#000000',
  tint: false, tintColor: '#ffffff', size: 1.0,
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
  document.getElementById('sizeVal').textContent = document.getElementById('size').value + '%';
}

function applyTint(doc) {
  return state.tint ? ES.tintDoc(doc, state.tintColor) : doc;
}

function buildPack(tpl) {
  const doc = ES.replaceSlots(tpl.doc, {
    word: state.word, color: state.color, size: state.size,
    stroke: state.stroke, strokeColor: state.strokeColor,
  }).doc;
  return applyTint(doc);
}

const cards = []; // {kind?, tpl?, name, player, warn, loaded, el, sel}

function makeCard(box, name, label, builder) {
  const card = document.createElement('div');
  card.className = 'card';
  const player = document.createElement('lottie-player');
  player.setAttribute('loop', ''); player.setAttribute('autoplay', '');
  const nm = document.createElement('div');
  nm.className = 'nm'; nm.textContent = label;
  const btn = document.createElement('button');
  btn.textContent = 'Скачать .tgs';
  const warn = document.createElement('div'); warn.className = 'warn';
  card.append(player, nm, btn, warn);
  box.appendChild(card);
  const rec = { name, player, warn, builder, loaded: false, el: card, sel: false };
  btn.addEventListener('click', e => { e.stopPropagation(); download([rec]); });
  card.addEventListener('click', () => toggleSel(rec));
  cards.push(rec);
  return rec;
}

const packBox = document.getElementById('pack');
for (const tpl of window.TEMPLATES) {
  makeCard(packBox, tpl.name.replace(/[^\w-]+/g, '_').slice(0, 24), tpl.name.slice(0, 24), () => buildPack(tpl));
}

/* selection */
const selbar = document.getElementById('selbar');
const selcount = document.getElementById('selcount');
function toggleSel(rec) {
  rec.sel = !rec.sel;
  rec.el.classList.toggle('sel', rec.sel);
  const n = cards.filter(c => c.sel).length;
  selcount.textContent = 'Выбрано: ' + n;
  selbar.classList.toggle('on', n > 0);
}
document.getElementById('selclear').addEventListener('click', () => {
  for (const c of cards) { c.sel = false; c.el.classList.remove('sel'); }
  selbar.classList.remove('on');
});
document.getElementById('dlAll').addEventListener('click', () => {
  const sel = cards.filter(c => c.sel);
  if (!sel.length) return;
  download(sel);
});

function gzipDoc(doc) {
  const raw = new TextEncoder().encode(JSON.stringify(doc));
  return pako.gzip(raw);
}
function download(list) {
  let i = 0;
  const next = () => {
    if (i >= list.length) { flash(`Скачано файлов: ${list.length}`); return; }
    const rec = list[i++];
    try {
      const gz = gzipDoc(rec.builder());
      if (gz.length > 64 * 1024) rec.warn.textContent = `⚠ ${Math.round(gz.length / 1024)} КБ > лимита`;
      else rec.warn.textContent = `${Math.round(gz.length / 1024)} КБ`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([gz], { type: 'application/gzip' }));
      a.download = `${state.word}_${rec.name}.tgs`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
    setTimeout(next, 250);
  };
  next();
}

/* lazy previews */
const io = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (!en.isIntersecting) continue;
    const rec = en.target._rec;
    io.unobserve(en.target);
    if (!rec.loaded) loadCard(rec);
  }
}, { rootMargin: '320px' });

function loadCard(rec) {
  rec.loaded = true;
  try { rec.player.load(JSON.stringify(rec.builder())); }
  catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
}
for (const rec of cards) {
  rec.el._rec = rec;
  io.observe(rec.el);
}

let deb;
function rebuildLoaded() {
  for (const rec of cards) {
    if (!rec.loaded) continue;
    try { rec.player.load(JSON.stringify(rec.builder())); }
    catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
  }
}
['word', 'color', 'strokeOn', 'strokeColor', 'tintOn', 'tintColor', 'size'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    readState();
    clearTimeout(deb);
    deb = setTimeout(rebuildLoaded, 700);
  });
});
})();
