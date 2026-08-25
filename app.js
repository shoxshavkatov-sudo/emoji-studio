/* Emoji Studio app: manifest-driven, one live player at a time.
 * Thumbs are lazy <img>; the doc (.tgs) is fetched only when a card is selected. */
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
  const doc = rec.slot ? ES.replaceSlots(rec.base, opts).doc : ES.overlayWord(rec.base, opts);
  return state.tint ? ES.tintDoc(doc, state.tintColor) : doc;
}

async function loadDoc(rec) {
  const buf = await (await fetch('tpl/' + rec.i + '.tgs')).arrayBuffer();
  rec.base = JSON.parse(pako.ungzip(new Uint8Array(buf), { to: 'string' }));
}

/* cards */
const cards = [];
const packBox = document.getElementById('pack');
document.getElementById('tplcount').textContent = window.MANIFEST.length;
for (const m of window.MANIFEST) {
  const card = document.createElement('div');
  card.className = 'card';
  const thumb = document.createElement('img');
  thumb.className = 'thumb';
  thumb.loading = 'lazy';
  thumb.src = 'thumbs/' + m.i + '.png';
  thumb.alt = '';
  thumb.addEventListener('error', () => { thumb.classList.add('nolist'); });
  const stage = document.createElement('div');
  stage.className = 'stage';
  stage.appendChild(thumb);
  const nm = document.createElement('div');
  nm.className = 'nm'; nm.textContent = (m.slot ? '' : '◆ ') + m.n;
  const btn = document.createElement('button');
  btn.textContent = 'Скачать .tgs';
  const warn = document.createElement('div'); warn.className = 'warn';
  card.append(stage, nm, btn, warn);
  packBox.appendChild(card);
  const rec = { i: m.i, name: m.n.replace(/[^\w-]+/g, '_').slice(0, 24) || 'emoji', slot: !!m.s, el: card, stage, warn, base: null, player: null, loadedOnce: false };
  btn.addEventListener('click', async e => { e.stopPropagation(); await select(rec, true); download([rec]); });
  card.addEventListener('click', () => select(rec));
  cards.push(rec);
}

/* single selection: exactly one live player */
let selected = null;
const selbar = document.getElementById('selbar');
const selname = document.getElementById('selname');

function mountPlayer(rec) {
  if (!rec.player) {
    rec.player = document.createElement('lottie-player');
    rec.player.setAttribute('loop', '');
    rec.player.setAttribute('autoplay', '');
    rec.stage.appendChild(rec.player);
  }
  rec.player.style.display = 'block';
}
function unmountPlayers(except) {
  for (const c of cards) {
    if (c !== except && c.player) c.player.style.display = 'none';
  }
}

async function select(rec, silent) {
  try {
    if (!rec.base) await loadDoc(rec);
  } catch (e) {
    flash('Не удалось загрузить шаблон: ' + e.message, true);
    return;
  }
  if (selected && selected !== rec) selected.el.classList.remove('sel');
  selected = rec;
  rec.el.classList.add('sel');
  selname.textContent = state.word + ' · ' + rec.name;
  selbar.classList.add('on');
  mountPlayer(rec);
  unmountPlayers(rec);
  rebuildOne(rec);
  if (!silent) rec.el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function deselect() {
  if (selected) selected.el.classList.remove('sel');
  selected = null;
  selbar.classList.remove('on');
  unmountPlayers(null);
}
document.getElementById('selclear').addEventListener('click', deselect);
document.getElementById('dlOne').addEventListener('click', () => { if (selected) download([selected]); });

function rebuildOne(rec) {
  try {
    rec.player.load(JSON.stringify(buildDoc(rec)));
    rec.loadedOnce = true;
  } catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
}

function download(list) {
  let i = 0;
  const next = () => {
    if (i >= list.length) { flash('Скачано файлов: ' + list.length); return; }
    const rec = list[i++];
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
    } catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
    setTimeout(next, 250);
  };
  next();
}

let deb;
['word', 'color', 'strokeOn', 'strokeColor', 'tintOn', 'tintColor', 'size', 'font'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    readState();
    if (selected) selname.textContent = state.word + ' · ' + selected.name;
    clearTimeout(deb);
    deb = setTimeout(() => {
      if (selected && selected.base) rebuildOne(selected);
      else flash('Сначала выбери эмодзи — кликни по карточке');
    }, 400);
  });
});
})();
