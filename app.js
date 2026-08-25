/* Emoji Studio — 3-step wizard: 1 choose → 2 style → 3 download.
 * Cards animate via a background load queue (scroll gives priority). */
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
    logo: state.logo || null,
  };
  const doc = ES.replaceSlots(rec.base, opts).doc;
  return state.tint ? ES.tintDoc(doc, state.tintColor) : doc;
}

/* logo upload: decode image, downsample to a color grid (quantized) */
function imageToGrid(file, cb) {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const gh = 26; // grid height; width follows aspect
    const gw = Math.max(1, Math.min(64, Math.round(img.width / img.height * gh)));
    const cv = document.createElement('canvas');
    cv.width = gw; cv.height = gh;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0, gw, gh);
    const data = ctx.getImageData(0, 0, gw, gh).data;
    const grid = [];
    for (let y = 0; y < gh; y++) {
      const row = [];
      for (let x = 0; x < gw; x++) {
        const i = (y * gw + x) * 4;
        const a = data[i + 3];
        if (a < 120) { row.push(null); continue; }
        // quantize channels to 8 steps to merge similar colors into runs
        row.push([
          (data[i] >> 5) << 5,
          (data[i + 1] >> 5) << 5,
          (data[i + 2] >> 5) << 5,
        ]);
      }
      grid.push(row);
    }
    URL.revokeObjectURL(url);
    cb(grid);
  };
  img.onerror = () => { URL.revokeObjectURL(url); flash('Не удалось прочитать картинку', true); };
  img.src = url;
}
document.getElementById('logoFile').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  imageToGrid(f, grid => {
    state.logo = grid;
    document.getElementById('logoClear').style.display = '';
    flash('Логотип применён — он заменит текст');
    clearTimeout(deb);
    deb = setTimeout(() => {
      if (selected && selected.base) {
        rebuildOne(selected);
        if (step >= 2) bigLoad();
      }
    }, 200);
  });
});
document.getElementById('logoClear').addEventListener('click', () => {
  state.logo = null;
  document.getElementById('logoFile').value = '';
  document.getElementById('logoClear').style.display = 'none';
  flash('Логотип убран — снова текст');
  if (selected && selected.base) {
    rebuildOne(selected);
    if (step >= 2) bigLoad();
  }
});

async function loadDoc(rec) {
  const buf = await (await fetch('tpl/' + rec.i + '.tgs')).arrayBuffer();
  rec.base = JSON.parse(pako.ungzip(new Uint8Array(buf), { to: 'string' }));
}

/* ---------- step 1: cards ---------- */
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
  card.append(stage, nm);
  packBox.appendChild(card);
  const rec = { i: m.i, name: m.n.replace(/[^\w-]+/g, '_').slice(0, 24) || 'emoji', el: card, stage, base: null, player: null };
  card.addEventListener('click', () => { select(rec); goStep(2); });
  cards.push(rec);
}

let selected = null;
function select(rec) {
  if (selected && selected !== rec) selected.el.classList.remove('sel');
  selected = rec;
  rec.el.classList.add('sel');
  document.getElementById('selname').textContent = state.word + ' · ' + rec.name;
}

/* background queue: animate every card; scroll moves visible ones to front */
async function ensurePlaying(rec) {
  if (!rec.base) await loadDoc(rec);
  if (!rec.player) {
    rec.player = document.createElement('lottie-player');
    rec.player.setAttribute('loop', '');
    rec.player.setAttribute('autoplay', '');
    rec.stage.appendChild(rec.player);
    // Lit mounts the shadow DOM asynchronously; an immediate load() is dropped
    await new Promise(r => setTimeout(r, 150));
  }
  rebuildOne(rec);
}
function rebuildOne(rec) {
  if (!rec.player || !rec.base) return;
  try { rec.player.load(JSON.stringify(buildDoc(rec))); }
  catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
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

function pauseCards() { for (const c of cards) if (c.player && c.player.pause) try { c.player.pause(); } catch (e) {} }
function resumeCards() { for (const c of cards) if (c.player && c.player.play) try { c.player.play(); } catch (e) {} }

/* ---------- wizard steps ---------- */
let step = 1;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dots = [...document.querySelectorAll('.dot')];

async function goStep(n) {
  n = Math.max(1, Math.min(3, n));
  if (n >= 2 && !selected) { flash('Сначала выбери эмодзи — шаг 1', true); return; }
  if (n >= 2 && selected && !selected.base) {
    try { await loadDoc(selected); } catch (e) { flash('Не удалось загрузить шаблон: ' + e.message, true); return; }
  }
  step = n;
  for (let i = 1; i <= 3; i++) document.getElementById('step' + i).classList.toggle('active', i === step);
  dots.forEach(d => d.classList.toggle('on', Number(d.dataset.step) === step));
  prevBtn.disabled = step === 1;
  nextBtn.textContent = step === 3 ? 'Скачать .tgs ⬇' : 'Далее →';
  if (step === 1) { resumeCards(); }
  else {
    pauseCards();
    bigLoad();
    if (step === 3) fileInfo();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
prevBtn.addEventListener('click', () => goStep(step - 1));
nextBtn.addEventListener('click', () => { if (step === 3) downloadSelected(); else goStep(step + 1); });
dots.forEach(d => d.addEventListener('click', () => goStep(Number(d.dataset.step))));
document.getElementById('againBtn').addEventListener('click', () => goStep(1));
document.getElementById('dlBig').addEventListener('click', downloadSelected);

/* big previews for steps 2/3 (Lit mount race: load after a beat) */
let bigReady = false;
setTimeout(() => { bigReady = true; }, 400);
function loadBigPlayer(el, docStr) {
  try { el.load(docStr); } catch (e) { setTimeout(() => { try { el.load(docStr); } catch (e2) {} }, 250); }
}
function bigLoad() {
  if (!selected || !selected.base) return;
  const docStr = JSON.stringify(buildDoc(selected));
  document.getElementById('selname').textContent = state.word + ' · ' + selected.name;
  loadBigPlayer(document.getElementById('big'), docStr);
  loadBigPlayer(document.getElementById('big3'), docStr);
}
function fileInfo() {
  if (!selected) return;
  try {
    const gz = pako.gzip(new TextEncoder().encode(JSON.stringify(buildDoc(selected))));
    const kb = Math.round(gz.length / 1024);
    document.getElementById('fileinfo').innerHTML =
      `<b>${state.word}_${selected.name}.tgs</b><br>${kb} КБ ${kb > 64 ? '⚠ больше лимита Telegram 64 КБ' : '· в лимите Telegram (64 КБ)'}`;
  } catch (e) {
    document.getElementById('fileinfo').textContent = 'ошибка: ' + e.message;
  }
}

/* ---------- download ---------- */
function downloadSelected() {
  if (!selected) { flash('Сначала выбери эмодзи — шаг 1', true); return; }
  const rec = selected;
  try {
    const raw = new TextEncoder().encode(JSON.stringify(buildDoc(rec)));
    const gz = pako.gzip(raw);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([gz], { type: 'application/gzip' }));
    a.download = `${state.word}_${rec.name}.tgs`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    flash(`Скачано: ${a.download} (${Math.round(gz.length / 1024)} КБ)`);
  } catch (e) { flash('ERR ' + rec.name + ': ' + e.message, true); }
}

/* inputs: rebuild selected card + big previews (debounced) */
let deb;
['word', 'color', 'strokeOn', 'strokeColor', 'tintOn', 'tintColor', 'size', 'font'].forEach(id => {
  document.getElementById(id).addEventListener('input', () => {
    readState();
    if (selected) document.getElementById('selname').textContent = state.word + ' · ' + selected.name;
    clearTimeout(deb);
    deb = setTimeout(() => {
      if (selected && selected.base) {
        rebuildOne(selected);
        if (step >= 2) bigLoad();
      }
    }, 400);
  });
});
})();
