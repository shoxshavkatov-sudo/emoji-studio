/* Emoji Studio engine: blocky font (LAT+CYR), parametric GRID-set builders,
 * and slot replacement for intervfxpack templates. Pure JS, no DOM. */
(function (root) {
'use strict';

const FR = 30, DUR = 60;

/* ---------------- 4x5 blocky font: char -> [width, [col,row,w,h]...] ------- */
const FONT = {
  'A': [4, [0,1,1,4],[1,0,2,1],[3,1,1,4],[1,2,2,1]],
  'B': [4, [0,0,1,5],[1,0,2,1],[3,1,1,1],[1,2,2,1],[3,3,1,1],[1,4,2,1]],
  'C': [4, [1,0,3,1],[0,1,1,3],[1,4,3,1]],
  'D': [4, [0,0,1,5],[1,0,2,1],[3,1,1,3],[1,4,2,1]],
  'E': [4, [0,0,1,5],[1,0,3,1],[1,2,2,1],[1,4,3,1]],
  'F': [4, [0,0,1,5],[1,0,3,1],[1,2,2,1]],
  'G': [4, [0,0,4,1],[0,1,1,4],[2,2,2,1],[3,3,1,1],[0,4,4,1]],
  'H': [4, [0,0,1,5],[3,0,1,5],[1,2,2,1]],
  'I': [4, [0,0,4,1],[1,1,2,3],[0,4,4,1]],
  'J': [4, [1,0,3,1],[2,0,1,4],[0,4,2,1]],
  'K': [4, [0,0,1,5],[3,0,1,1],[2,1,1,1],[1,2,1,1],[2,3,1,1],[3,4,1,1]],
  'L': [4, [0,0,1,5],[1,4,3,1]],
  'M': [4, [0,0,1,5],[3,0,1,5],[1,1,1,1],[2,2,1,1]],
  'N': [4, [0,0,1,5],[3,0,1,5],[2,1,1,1],[1,2,1,1]],
  'O': [4, [1,0,2,1],[0,1,1,3],[3,1,1,3],[1,4,2,1]],
  'P': [4, [0,0,1,5],[1,0,2,1],[3,1,1,1],[1,2,2,1]],
  'Q': [4, [1,0,2,1],[0,1,1,3],[3,1,1,3],[1,4,2,1],[2,3,1,1],[3,4,1,1]],
  'R': [4, [0,0,3,1],[3,0,1,2],[0,0,1,5],[0,2,3,1],[2,3,1,1],[3,4,1,1]],
  'S': [4, [1,0,2,1],[0,1,1,1],[1,2,2,1],[3,3,1,1],[1,4,2,1]],
  'T': [4, [0,0,4,1],[1,1,2,4]],
  'U': [4, [0,0,1,4],[3,0,1,4],[1,4,2,1]],
  'V': [4, [0,0,1,3],[3,0,1,3],[1,3,2,1]],
  'W': [4, [0,0,1,5],[3,0,1,5],[2,1,1,1],[1,2,1,1]],
  'X': [4, [0,0,1,2],[3,0,1,2],[1,2,2,1],[0,3,1,2],[3,3,1,2]],
  'Y': [4, [0,0,1,2],[3,0,1,2],[1,2,2,3]],
  'Z': [4, [0,0,4,1],[2,1,1,1],[1,2,1,1],[0,3,1,1],[0,4,4,1]],
  '0': [4, [1,0,2,1],[0,1,1,3],[3,1,1,3],[1,4,2,1],[1,1,1,1],[2,2,1,1]],
  '1': [4, [0,0,2,1],[1,1,2,4],[0,4,4,1]],
  '2': [4, [1,0,2,1],[3,1,1,1],[2,2,1,1],[1,3,1,1],[0,4,4,1]],
  '3': [4, [0,0,3,1],[3,1,1,1],[1,2,2,1],[3,3,1,1],[0,4,3,1]],
  '4': [4, [0,0,1,3],[3,0,1,5],[1,2,2,1]],
  '5': [4, [0,0,3,1],[0,1,1,2],[1,2,2,1],[3,3,1,1],[1,4,2,1]],
  '6': [4, [1,0,2,1],[0,1,1,4],[1,2,2,1],[3,3,1,1],[1,4,2,1]],
  '7': [4, [0,0,4,1],[3,1,1,1],[2,2,1,3]],
  '8': [4, [1,0,2,1],[0,1,1,1],[3,1,1,1],[1,2,2,1],[0,3,1,1],[3,3,1,1],[1,4,2,1]],
  '9': [4, [1,0,2,1],[0,1,1,1],[3,1,1,4],[1,2,2,1]],
  /* cyrillic */
  'А': [4, [0,1,1,4],[1,0,2,1],[3,1,1,4],[1,2,2,1]],
  'Б': [4, [0,0,3,1],[0,1,1,4],[1,2,2,1],[3,3,1,1],[1,4,3,1]],
  'В': [4, [0,0,1,5],[1,0,2,1],[3,1,1,1],[1,2,2,1],[3,3,1,1],[1,4,2,1]],
  'Г': [4, [0,0,4,1],[0,1,1,4]],
  'Д': [4, [1,0,2,1],[0,1,1,3],[3,1,1,3],[0,3,4,1],[0,4,1,1],[3,4,1,1]],
  'Е': [4, [0,0,1,5],[1,0,3,1],[1,2,2,1],[1,4,3,1]],
  'Ж': [5, [0,0,1,5],[2,0,1,5],[4,0,1,5],[1,2,3,1]],
  'З': [4, [1,0,3,1],[3,1,1,1],[1,2,2,1],[3,3,1,1],[1,4,3,1]],
  'И': [4, [0,0,1,5],[3,0,1,5],[2,1,1,1],[1,2,1,1]],
  'Й': [4, [1,0,2,1],[0,1,1,4],[3,1,1,4],[2,2,1,1],[1,3,1,1]],
  'К': [4, [0,0,1,5],[3,0,1,1],[2,1,1,1],[1,2,1,1],[2,3,1,1],[3,4,1,1]],
  'Л': [4, [1,0,2,1],[0,1,1,4],[3,1,1,4]],
  'М': [4, [0,0,1,5],[3,0,1,5],[1,1,1,1],[2,2,1,1]],
  'Н': [4, [0,0,1,5],[3,0,1,5],[1,2,2,1]],
  'О': [4, [1,0,2,1],[0,1,1,3],[3,1,1,3],[1,4,2,1]],
  'П': [4, [0,0,4,1],[0,1,1,4],[3,1,1,4]],
  'Р': [4, [0,0,1,5],[1,0,2,1],[3,1,1,1],[1,2,2,1]],
  'С': [4, [1,0,3,1],[0,1,1,3],[1,4,3,1]],
  'Т': [4, [0,0,4,1],[1,1,2,4]],
  'У': [4, [0,0,1,2],[3,0,1,4],[1,2,2,1],[0,3,1,2]],
  'Ф': [4, [1,0,2,5],[0,1,1,3],[3,1,1,3]],
  'Х': [4, [0,0,1,2],[3,0,1,2],[1,2,2,1],[0,3,1,2],[3,3,1,2]],
  'Ц': [5, [0,0,1,4],[3,0,1,4],[1,2,2,1],[0,4,4,1],[4,3,1,2]],
  'Ч': [4, [0,0,1,3],[3,0,1,5],[1,2,2,1]],
  'Ш': [5, [0,0,1,4],[2,0,1,4],[4,0,1,4],[0,4,5,1]],
  'Щ': [6, [0,0,1,4],[2,0,1,4],[4,0,1,4],[0,4,5,1],[5,3,1,2]],
  'Ъ': [4, [0,0,2,1],[0,1,1,4],[2,2,2,1],[2,3,1,1],[3,3,1,1],[2,4,2,1]],
  'Ы': [5, [0,0,1,5],[4,1,1,4],[2,1,1,1],[2,2,3,1],[2,3,1,1],[2,4,3,1]],
  'Ь': [4, [0,0,1,5],[1,2,2,1],[3,2,1,2],[1,4,2,1]],
  'Э': [4, [0,0,3,1],[3,1,1,3],[0,4,3,1],[1,2,2,1]],
  'Ю': [6, [0,0,1,5],[2,2,4,1],[3,0,2,1],[2,1,1,3],[5,1,1,3],[3,4,2,1]],
  'Я': [4, [1,0,3,1],[0,0,1,2],[3,0,1,5],[1,2,3,1],[1,3,1,1],[0,4,1,1]],
  'Ё': [4, [0,0,1,5],[1,0,3,1],[1,2,2,1],[1,4,3,1]],
  '□': [4, [0,0,1,1],[3,0,1,1],[0,4,1,1],[3,4,1,1]],
};

function glyphOf(ch) {
  return FONT[ch] || FONT['□'];
}

/* word layout in cell units */
function layoutWord(word) {
  const letters = [];
  let x = 0;
  for (const ch of String(word).toUpperCase()) {
    if (ch === ' ') { x += 2; continue; }
    if (!FONT[ch]) continue;
    letters.push({ ch, x });
    x += FONT[ch][0] + 1;
  }
  const wCells = Math.max(1, x - 1);
  return { letters, wCells };
}

/* ------------------------- lottie primitives ----------------------------- */
const st = v => ({ a: 0, k: v });
function anim(samples) {
  return {
    a: 1,
    k: samples.map(([t, v], i) => {
      const kf = { t, s: Array.isArray(v) ? v : [v] };
      if (i < samples.length - 1) {
        kf.i = { x: [0.5], y: [0.5] };
        kf.o = { x: [0.5], y: [0.5] };
      }
      return kf;
    }),
  };
}
const trspec = (o = {}) => ({
  ty: 'tr',
  p: o.p || st([0, 0]), a: o.a || st([0, 0]), s: o.s || st([100, 100]),
  r: o.r || st(0), o: o.o || st(100), sk: st(0), sa: st(0),
});
const fill = (c, o = 100) => ({ ty: 'fl', c: st(Array.from(c)), o: st(o), r: 1 });
const stroke = (c, w) => ({ ty: 'st', c: st(Array.from(c)), o: st(100), w: st(w), lc: 2, lj: 2 });
const group = (nm, items, tr) => ({ ty: 'gr', nm, it: items.concat([tr || trspec()]) });
const rc = (cx, cy, w, h, r = 0) => ({ ty: 'rc', p: st([cx, cy]), s: st([w, h]), r: st(r) });
const el = (cx, cy, d) => ({ ty: 'el', p: st([cx, cy]), s: st([d, d]) });
const poly = pts => ({
  ty: 'sh', ks: st({ i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), v: pts.map(p => [p[0], p[1]]), c: true }),
});
function shapeLayer(nm, shapes, o = {}) {
  return {
    ddd: 0, ind: 1, ty: 4, nm, sr: 1,
    ks: {
      o: st(100), r: o.r || st(0),
      p: o.p || st([256, 256, 0]), a: st([0, 0, 0]),
      s: o.s || st([100, 100, 100]),
    },
    ao: 0, shapes, ip: 0, op: DUR, st: 0,
  };
}
const doc = (nm, layer) => ({ v: '5.7.4', fr: FR, ip: 0, op: DUR, w: 512, h: 512, nm, ddd: 0, assets: [], layers: [layer] });

/* rect items for a word, centered at origin. Returns {items, w, h} in px. */
function wordRects(word, cell, roundness = 0) {
  const { letters, wCells } = layoutWord(word);
  const items = [];
  const W = wCells * cell, H = 5 * cell;
  for (const { ch, x } of letters) {
    const g = glyphOf(ch);
    for (let r = 1; r < g.length; r++) {
      const [c, row, wc, hr] = g[r];
      const px = x * cell + c * cell - W / 2;
      const py = row * cell - H / 2;
      items.push(rc(px + wc * cell / 2, py + hr * cell / 2, wc * cell, hr * cell, roundness));
    }
  }
  return { items, w: W, h: H };
}

/* per-letter groups; each letter centered at its own origin, letter(cx) callback gives group tr */
function letterGroups(word, cell, mk, color, roundness = 0) {
  const { letters, wCells } = layoutWord(word);
  const out = [];
  const W = wCells * cell;
  for (const { ch, x } of letters) {
    const g = glyphOf(ch);
    const items = [];
    for (let r = 1; r < g.length; r++) {
      const [c, row, wc, hr] = g[r];
      const px = c * cell - g[0] * cell / 2;
      const py = row * cell - 2.5 * cell;
      items.push(rc(px + wc * cell / 2, py + hr * cell / 2, wc * cell, hr * cell, roundness));
    }
    items.push(fill(color));
    const cx = x * cell + g[0] * cell / 2 - W / 2;
    out.push(group('l_' + ch, items, mk ? mk(cx, ch) : trspec({ p: st([cx, 0]) })));
  }
  return out;
}

function pickCell(word, maxW, maxH, base) {
  const { wCells } = layoutWord(word);
  return Math.max(5, Math.min(base, Math.floor(maxW / wCells), Math.floor(maxH / 5)));
}

/* --------------------------- our 11 builders ------------------------------ */
const WHITE = [1, 1, 1, 1], BLACK = [0, 0, 0, 1];

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return [1, 1, 1, 1];
  const n = parseInt(m[1], 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
}

function sine(t0) { return f => 2 * Math.PI * f / DUR + t0; }

function buildFlag(word, color) {
  const XL = -230, Wv = 460, AMP = 28, LAM = 320, CYC = 2, K = 2 * Math.PI / LAM, AFM = 0.25;
  const wav = (x, f) => {
    const af = AFM + (1 - AFM) * Math.pow((x - XL) / Wv, 1.25);
    const th = 2 * Math.PI * CYC * f / DUR - K * (x - XL);
    return [AMP * af * Math.sin(th), th, af];
  };
  const cols = Array.from({ length: 9 }, (_, i) => XL + i * Wv / 8);
  const kfs = [];
  for (let f = 0; f <= DUR; f += 2) {
    const v = cols.map(x => [x, -105 + wav(x, f)[0]]).concat(cols.slice().reverse().map(x => [x, 105 + wav(x, f)[0]]));
    const kf = { t: f, s: [{ i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: true }] };
    if (f !== DUR) { kf.i = { x: 0.5, y: 0.5 }; kf.o = { x: 0.5, y: 0.5 }; }
    kfs.push(kf);
  }
  const flagG = group('flag', [
    { ty: 'sh', ks: { a: 1, k: kfs } },
    fill(BLACK), stroke(WHITE, 5),
  ]);
  const cell = pickCell(word, 340, 90, 16);
  const Wc = layoutWord(word).wCells * cell;
  const letters = letterGroups(word, cell, (cx0, ch) => {
    const cx = cx0; // already centered
    const pk = [], rk = [];
    for (let f = 0; f <= DUR; f += 2) {
      const [y, th, af] = wav(cx + 0, f);
      pk.push([f, [cx, y]]);
      rk.push([f, 8 * af * Math.cos(th)]);
    }
    return trspec({ p: anim(pk), r: anim(rk) });
  }, color, 1);
  return doc('flag', shapeLayer('flag', letters.concat([flagG])));
}

function buildTiles(word, color) {
  const cell = pickCell(word, 460, 150, 22);
  const tile = Math.round(cell * 0.84);
  const { letters, wCells } = layoutWord(word);
  const W = wCells * cell, kw = 2 * Math.PI / 300, amp = 10;
  const gs = [];
  for (const { ch, x } of letters) {
    const g = glyphOf(ch);
    const cells = new Set();
    for (let r = 1; r < g.length; r++) {
      const [c, row, wc, hr] = g[r];
      for (let dc = 0; dc < wc; dc++) for (let dr = 0; dr < hr; dr++) cells.add((c + dc) + ',' + (row + dr));
    }
    const x0 = x * cell - W / 2;
    for (const key of cells) {
      const [c, row] = key.split(',').map(Number);
      const tx = x0 + c * cell, ty = row * cell - 2.5 * cell;
      const th0 = -kw * tx;
      const pk = [], sk = [];
      for (let f = 0; f <= DUR; f += 3) {
        const th = 2 * Math.PI * 2 * f / DUR + th0;
        pk.push([f, [tx, ty + amp * Math.sin(th)]]);
        const sc = 100 + 14 * Math.sin(th + 0.9);
        sk.push([f, [sc, sc]]);
      }
      gs.push(group('t', [rc(0, 0, tile, tile, 1), fill(color), stroke(BLACK, 2), trspec({ p: anim(pk), s: anim(sk) })]));
    }
  }
  return doc('tiles', shapeLayer('tiles', gs));
}

function buildGlitch(word, color) {
  const cell = pickCell(word, 460, 150, 22);
  const letters = letterGroups(word, cell, (cx, ch, i) => {
    const spikes = [[4, 12, 5], [6, -9, -4], [8, 0, 0], [40, 10, -6], [42, 0, 0]];
    const samples = [[0, 0, 0]];
    const jitter = [[20, -14, 6], [22, 7, -3], [24, 0, 0], [46 + 8, 11, 4], [48 + 8, 0, 0]];
    (word.length < 3 ? spikes : jitter).forEach(a => samples.push(a));
    samples.push([DUR, 0, 0]);
    const pk = samples.map(([f, ox, oy]) => [f, [cx + ox, oy]]);
    return trspec({ p: anim(pk) });
  }, color, 1);
  const bars = [-32, 24].map(yb => group('bar', [
    rc(0, yb, 210, 10, 2), fill(WHITE), stroke(BLACK, 2),
    trspec({ o: anim([[0, 0], [4, 100], [8, 0], [44, 100], [48, 0], [DUR, 0]]) }),
  ]));
  return doc('glitch', shapeLayer('glitch', bars.concat(letters)));
}

function buildSpinner(word, color) {
  const gs = [];
  for (let i = 0; i < 8; i++) {
    const ang = 2 * Math.PI * i / 8;
    const px = 150 * Math.cos(ang), py = 150 * Math.sin(ang);
    const sk = [];
    for (let f = 0; f <= DUR; f += 2) {
      const sc = 26 + 7 * Math.sin(2 * Math.PI * 2 * f / DUR - i * Math.PI / 4);
      sk.push([f, [sc, sc]]);
    }
    gs.push(group('sq', [rc(0, 0, 26, 26, 4), fill(color), stroke(BLACK, 2), trspec({ p: st([px, py]), s: anim(sk) })]));
  }
  const ring = group('ring', gs, trspec({ r: anim([[0, 0], [DUR, 360]]) }));
  const cell = pickCell(word, 220, 110, 14);
  const letters = letterGroups(word, cell, null, color, 1);
  return doc('spinner', shapeLayer('spinner', letters.concat([ring])));
}

function buildShield(word, color) {
  const shield = group('shield', [{
    ty: 'sh', ks: st({
      i: [[0, 0], [0, 0], [0, 110], [60, -20], [-60, -20], [0, 110]],
      o: [[0, 0], [0, 0], [0, 110], [-60, -20], [60, -20], [0, 110]],
      v: [[-150, -140], [150, -140], [150, -20], [0, 170], [-150, -20], [-150, -140]], c: true,
    }),
  }, fill(BLACK), stroke(WHITE, 6)]);
  const cell = pickCell(word, 260, 120, 13);
  const letters = letterGroups(word, cell, null, color, 1);
  const rot = [], pos = [];
  for (let f = 0; f <= DUR; f += 2) {
    rot.push([f, 5 * Math.sin(2 * Math.PI * f / DUR)]);
    pos.push([f, [256, 256 + 5 * Math.sin(2 * Math.PI * 2 * f / DUR)]]);
  }
  return doc('shield', shapeLayer('shield', letters.concat([shield]), { r: anim(rot), p: anim(pos) }));
}

function buildPennant(word, color) {
  const XL = -230, Wv = 460, AMP = 34, LAM = 380, K = 2 * Math.PI / 380;
  const wav = (x, f) => {
    const af = 0.15 + 0.85 * Math.pow((x - XL) / Wv, 1.25);
    const th = 2 * Math.PI * 2 * f / DUR - K * (x - XL);
    return [AMP * af * Math.sin(th), th, af];
  };
  const hh = x => 105 * (1 - 0.9 * (x - XL) / Wv);
  const cols = Array.from({ length: 9 }, (_, i) => XL + i * Wv / 8);
  const kfs = [];
  for (let f = 0; f <= DUR; f += 2) {
    const v = cols.map(x => [x, -hh(x) + wav(x, f)[0]]).concat(cols.slice().reverse().map(x => [x, hh(x) + wav(x, f)[0]]));
    const kf = { t: f, s: [{ i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: true }] };
    if (f !== DUR) { kf.i = { x: 0.5, y: 0.5 }; kf.o = { x: 0.5, y: 0.5 }; }
    kfs.push(kf);
  }
  const pen = group('pen', [{ ty: 'sh', ks: { a: 1, k: kfs } }, fill(BLACK), stroke(WHITE, 5)]);
  const cell = pickCell(word, 200, 90, 13);
  const letters = letterGroups(word, cell, cx => {
    const pk = [], rk = [];
    for (let f = 0; f <= DUR; f += 2) {
      const [y, th, af] = wav(cx, f);
      pk.push([f, [cx, y]]);
      rk.push([f, 8 * af * Math.cos(th)]);
    }
    return trspec({ p: anim(pk), r: anim(rk) });
  }, color, 1);
  return doc('pennant', shapeLayer('pennant', letters.concat([pen])));
}

function buildCube(word, color) {
  const front = group('front', [poly([[-110, -110], [110, -110], [110, 110], [-110, 110]]), fill(BLACK), stroke(WHITE, 5)]);
  const top = group('top', [poly([[-110, -110], [110, -110], [170, -160], [-50, -160]]), fill([0.78, 0.78, 0.78, 1]), stroke(WHITE, 3)]);
  const right = group('right', [poly([[110, -110], [170, -160], [170, 60], [110, 110]]), fill([0.43, 0.43, 0.43, 1]), stroke(WHITE, 3)]);
  const cell = pickCell(word, 200, 100, 12);
  const letters = letterGroups(word, cell, null, color, 1);
  const rot = [], pos = [];
  for (let f = 0; f <= DUR; f += 2) {
    rot.push([f, 8 * Math.sin(2 * Math.PI * f / DUR)]);
    pos.push([f, [256, 250 + 6 * Math.sin(2 * Math.PI * 2 * f / DUR)]]);
  }
  return doc('cube', shapeLayer('cube', letters.concat([front, top, right]), { r: anim(rot), p: anim(pos) }));
}

function buildPlate(word, color) {
  const panel = group('panel', [rc(0, 0, 420, 230, 26), fill(BLACK), stroke(WHITE, 5)]);
  const screws = [];
  for (const sx of [-180, 180]) for (const sy of [-88, 88]) {
    screws.push(group('screw', [el(sx, sy, 18), fill(WHITE), el(sx, sy, 7), fill(BLACK)]));
  }
  const scanP = [];
  for (let f = 0; f <= DUR; f += 2) scanP.push([f, [0, 88 * Math.sin(2 * Math.PI * f / DUR)]]);
  const scan = group('scan', [rc(0, 0, 370, 3), fill(WHITE, 35), trspec({ p: anim(scanP) })]);
  const cell = pickCell(word, 340, 110, 15);
  const letters = letterGroups(word, cell, null, color, 1);
  return doc('plate', shapeLayer('plate', letters.concat([panel], screws, [scan])));
}

function buildHeart(word, color) {
  const heart = group('heart', [{
    ty: 'sh', ks: st({
      i: [[0, -48], [48, 0], [0, -67], [-120, -336], [0, 43], [72, 0]],
      o: [[0, -48], [-72, 0], [0, 43], [120, -336], [0, -67], [-48, 0]],
      v: [[0, -96], [-96, -192], [-216, -67], [0, 192], [216, -67], [96, -192]], c: true,
    }),
  }, fill(BLACK), stroke(WHITE, 7)]);
  const cell = pickCell(word, 250, 90, 11);
  const letters = letterGroups(word, cell, cx => trspec({ p: st([cx, 35]) }), color, 1);
  const beat = anim([[0, [100, 100, 100]], [6, [120, 120, 100]], [12, [96, 96, 100]], [18, [110, 110, 100]], [30, [100, 100, 100]]]);
  return doc('heart', shapeLayer('heart', letters.concat([heart]), { s: beat }));
}

function buildGamepad(word, color) {
  const body = group('body', [rc(0, 0, 440, 190, 95), fill(BLACK), stroke(WHITE, 5)]);
  const dpad = group('dpad', [rc(-140, 0, 56, 18, 4), rc(-140, 0, 18, 56, 4), fill(WHITE)]);
  const btnA = group('btn_a', [el(130, -30, 32), fill(WHITE)], trspec({ o: anim([[0, 100], [15, 20], [30, 100], [DUR, 100]]) }));
  const btnB = group('btn_b', [el(178, 15, 32), fill(WHITE)], trspec({ o: anim([[0, 20], [15, 100], [30, 20], [DUR, 20]]) }));
  const cell = pickCell(word, 170, 90, 10);
  const letters = letterGroups(word, cell, null, color, 1);
  const rot = [];
  for (let f = 0; f <= DUR; f += 2) rot.push([f, 2 * Math.sin(2 * Math.PI * f / DUR)]);
  return doc('gamepad', shapeLayer('gamepad', letters.concat([dpad, btnA, btnB, body]), { r: anim(rot) }));
}

function buildBolt(word, color) {
  const up = [[-230, -25], [-115, -75], [0, -25], [115, -75], [230, -25]];
  const low = up.map(([x, y]) => [x, y + 80]);
  const bolt = group('bolt', [poly(up.concat([low[4], low[3], low[2], low[1], low[0]])), fill(BLACK), stroke(WHITE, 5)]);
  const n = Math.max(1, layoutWord(word).letters.length);
  const cell = pickCell(word, 380, 70, 9);
  const { letters, wCells } = layoutWord(word);
  const W = wCells * cell;
  const groups = letters.map((L, i) => {
    const cx = L.x * cell + glyphOf(L.ch)[0] * cell / 2 - W / 2;
    const darkAt = Math.round(DUR * i / n);
    const colAnim = {
      a: 1,
      k: [
        { t: 0, s: [color[0], color[1], color[2], 1] },
        { t: darkAt, s: [0.45, 0.45, 0.45, 1], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: Math.min(DUR, darkAt + 6), s: [color[0], color[1], color[2], 1], i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
        { t: DUR, s: [color[0], color[1], color[2], 1] },
      ],
    };
    const pk = [];
    for (let f = 0; f <= DUR; f += 2) pk.push([f, [cx, -10 + 4 * Math.sin(2 * Math.PI * f / DUR + i)]]);
    const g = glyphOf(L.ch);
    const items = [];
    for (let r = 1; r < g.length; r++) {
      const [c, row, wc, hr] = g[r];
      items.push(rc(c * cell - g[0] * cell / 2 + wc * cell / 2, row * cell - 2.5 * cell + hr * cell / 2, wc * cell, hr * cell, 1));
    }
    items.push({ ty: 'fl', c: colAnim, o: st(100), r: 1 });
    return group('l_' + L.ch, items, trspec({ p: anim(pk) }));
  });
  const rot = [];
  for (let f = 0; f <= DUR; f += 2) rot.push([f, 2 * Math.sin(2 * Math.PI * f / DUR)]);
  return doc('bolt', shapeLayer('bolt', groups.concat([bolt]), { r: anim(rot) }));
}

const OURS = {
  flag: buildFlag, tiles: buildTiles, glitch: buildGlitch, spinner: buildSpinner,
  shield: buildShield, pennant: buildPennant, cube: buildCube, plate: buildPlate,
  heart: buildHeart, gamepad: buildGamepad, bolt: buildBolt,
};

/* -------------------- slot replacement for pack templates ----------------- */
const NAME_RE = /замена|лого|logo|intervfx/i;
const EXCLUDE_RE = /глаз/i;

/* slot = named replacement layer, or a watermark spelled as single-letter
 * outline groups ("i","n","t","e","r","v","f","x" => intervfx) */
function isSlotLayer(l) {
  const nm = String(l.nm || '');
  if (EXCLUDE_RE.test(nm)) return false;
  if (NAME_RE.test(nm)) return true;
  if (Array.isArray(l.shapes)) {
    const grs = l.shapes.filter(s => s.ty === 'gr');
    if (grs.length >= 3 && grs.every(g => String(g.nm || '').trim().length === 1)) {
      if (/intervfx/i.test(grs.map(g => String(g.nm || '').trim()).join(''))) return true;
    }
  }
  return false;
}

function val(prop) {
  if (typeof prop !== 'object' || prop === null) return prop;
  const k = prop.k;
  if (Array.isArray(k) && k.length && typeof k[0] === 'object' && k[0] !== null) {
    const s = k[0].s;
    return (Array.isArray(s) && s.length && typeof s[0] !== 'object') ? s : null;
  }
  return k;
}
function vec2(prop, dflt) {
  const v = val(prop);
  if (typeof v === 'number') return [v, v];
  if (Array.isArray(v) && v.length && typeof v[0] !== 'number' && typeof v[0] !== 'undefined') return dflt;
  if (Array.isArray(v) && v.length) return [Number(v[0]) || 0, Number(v[1]) || 0];
  return dflt;
}
class Mtx {
  constructor(m00 = 1, m01 = 0, m10 = 0, m11 = 1, tx = 0, ty = 0) {
    Object.assign(this, { m00, m01, m10, m11, tx, ty });
  }
  static fromTr(it) {
    const [px, py] = vec2(it.p, [0, 0]);
    const [ax, ay] = vec2(it.a, [0, 0]);
    let [sx, sy] = vec2(it.s, [100, 100]);
    sx /= 100; sy /= 100;
    const r = (Number(val(it.r)) || 0) * Math.PI / 180;
    const cos = Math.cos(r), sin = Math.sin(r);
    const m00 = cos * sx, m01 = -sin * sy, m10 = sin * sx, m11 = cos * sy;
    return new Mtx(m00, m01, m10, m11, px - (m00 * ax + m01 * ay), py - (m10 * ax + m11 * ay));
  }
  apply(x, y) { return [this.m00 * x + this.m01 * y + this.tx, this.m10 * x + this.m11 * y + this.ty]; }
  mul(o) {
    return new Mtx(
      this.m00 * o.m00 + this.m01 * o.m10, this.m00 * o.m01 + this.m01 * o.m11,
      this.m10 * o.m00 + this.m11 * o.m10, this.m10 * o.m01 + this.m11 * o.m11,
      this.m00 * o.tx + this.m01 * o.ty + this.tx, this.m10 * o.tx + this.m11 * o.ty + this.ty);
  }
}
const IDENTITY = new Mtx();

function collectPoints(items, matrix = IDENTITY, pts = []) {
  for (const it of items || []) {
    if (it.ty === 'sh') {
      const k = (it.ks || {}).k;
      const vals = (typeof k === 'object' && !Array.isArray(k)) ? [k] : [];
      if (Array.isArray(k)) {
        for (const kf of k) if (kf && typeof kf === 'object' && kf.s) for (const s of kf.s) vals.push(s);
      }
      for (const v of vals) for (const p of (v.v || [])) pts.push(matrix.apply(p[0], p[1]));
    } else if (it.ty === 'gr') {
      const tr = (it.it || []).find(x => x.ty === 'tr');
      collectPoints(it.it, matrix.mul(tr ? Mtx.fromTr(tr) : IDENTITY), pts);
    } else if (it.ty === 'rc' || it.ty === 'el') {
      const [pcx, pcy] = vec2(it.p, [0, 0]);
      const [sw, sh] = vec2(it.s, [0, 0]);
      for (const [dx, dy] of [[-sw / 2, -sh / 2], [sw / 2, -sh / 2], [sw / 2, sh / 2], [-sw / 2, sh / 2]]) {
        pts.push(matrix.apply(pcx + dx, pcy + dy));
      }
    }
  }
  return pts;
}

function findStyle(layer) {
  let fc = null, sc = null, sw = null;
  (function walk(items) {
    for (const it of items || []) {
      if (it.ty === 'fl' && !fc) {
        const c = val(it.c);
        if (Array.isArray(c) && c.length >= 3) fc = c;
      } else if (it.ty === 'st' && !sc) {
        const c = val(it.c);
        if (Array.isArray(c) && c.length >= 3) sc = c;
        const w = val(it.w);
        if (typeof w === 'number') sw = w;
      } else if (it.ty === 'gr') walk(it.it);
    }
  })(layer.shapes || []);
  return { fc, sc, sw };
}

/* rounded-rect path (8 vertices with bezier handles) */
function roundedRectShape(x0, y0, x1, y1, rr) {
  const k = 0.5523 * rr;
  const d = [
    [x0 + rr, y0, -k, 0, k, 0],
    [x1 - rr, y0, -k, 0, k, 0],
    [x1, y0 + rr, 0, -k, 0, k],
    [x1, y1 - rr, 0, -k, 0, k],
    [x1 - rr, y1, k, 0, -k, 0],
    [x0 + rr, y1, k, 0, -k, 0],
    [x0, y1 - rr, 0, k, 0, -k],
    [x0, y0 + rr, 0, k, 0, -k],
  ];
  return { v: d.map(a => [a[0], a[1]]), i: d.map(a => [a[2], a[3]]), o: d.map(a => [a[4], a[5]]), c: true };
}

/* build word group fitted into bbox, layer-space. style: block|rounded|outline.
 * rlottie-safe: letters are plain sh paths with scale/rotation baked into
 * coordinates (no rc rects, no group scaling) — mirrors the geometry style of
 * the original logo that renders fine in Telegram. */
function wordGroupForBBox(word, bbox, color, sizeMult, useStroke, strokeColor, style) {
  const [x0, y0, x1, y1] = bbox;
  const bw = x1 - x0, bh = y1 - y0;
  const { letters, wCells } = layoutWord(word);
  const vertical = bh > bw * 1.3;
  const effW = vertical ? 5 : wCells, effH = vertical ? wCells : 5;
  const s = Math.min(bw / effW, bh / effH) * sizeMult;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const rot = vertical ? Math.PI / 2 : 0;
  const cos = Math.cos(rot), sin = Math.sin(rot);
  const R = 100;
  const tp = (px, py) => [Math.round((cx + (px * cos - py * sin) * s) * R) / R,
                          Math.round((cy + (px * sin + py * cos) * s) * R) / R];
  const rotOff = (ox, oy) => [Math.round((ox * cos - oy * sin) * s * R) / R,
                              Math.round((ox * sin + oy * cos) * s * R) / R];
  const items = [];
  const outline = style === 'outline';
  for (const { ch, x } of letters) {
    const g = glyphOf(ch);
    for (let r = 1; r < g.length; r++) {
      const [c, row, wc, hr] = g[r];
      const rx = x + c - wCells / 2, ry = row - 2.5;
      let shape;
      if (style === 'rounded') {
        let rr = Math.min(wc, hr) * 0.35; // corner radius, cell units
        const edgeW = wc - 2 * rr, edgeH = hr - 2 * rr;
        if (edgeW <= 0.08 || edgeH <= 0.08) {
          // too small to round: clamp radius to keep straight edges positive
          rr = Math.min(wc, hr) / 2 * 0.46;
        }
        // bezier handle must never exceed half of the straight edge,
        // otherwise the curve folds over itself and the shape collapses
        const k = Math.max(0, Math.min(0.5523 * rr, (wc - 2 * rr) / 2, (hr - 2 * rr) / 2));
        const raw = roundedRectShape(rx, ry, rx + wc, ry + hr, rr);
        shape = { v: raw.v.map(p => tp(p[0], p[1])), c: true };
        const defs = [
          [-k, 0, k, 0], [-k, 0, k, 0], [0, -k, 0, k], [0, -k, 0, k],
          [k, 0, -k, 0], [k, 0, -k, 0], [0, k, 0, -k], [0, k, 0, -k],
        ];
        shape.i = defs.map(dd => rotOff(dd[0], dd[1]));
        shape.o = defs.map(dd => rotOff(dd[2], dd[3]));
      } else {
        const corners = [[rx, ry], [rx + wc, ry], [rx + wc, ry + hr], [rx, ry + hr]];
        shape = {
          v: corners.map(p => tp(p[0], p[1])),
          i: [[0, 0], [0, 0], [0, 0], [0, 0]],
          o: [[0, 0], [0, 0], [0, 0], [0, 0]],
          c: true,
        };
      }
      items.push({ ty: 'sh', nm: 'gl', ks: st(shape) });
    }
  }
  if (outline) {
    items.push(stroke(color, Math.max(1.2, 0.22 * s)));
  } else {
    items.push(fill(color));
    if (useStroke) items.push(stroke(strokeColor || BLACK, 3));
  }
  return group('NAME', items, trspec());
}

function replaceSlots(baseDoc, opts) {
  const data = JSON.parse(JSON.stringify(baseDoc));
  const color = hexToRgb(opts.color);
  const sizeMult = opts.size != null ? Number(opts.size) : 1.0;
  const useStroke = !!opts.stroke;
  const strokeColor = opts.strokeColor ? hexToRgb(opts.strokeColor) : BLACK;
  const style = opts.font || 'block';
  let replaced = 0;
  const lists = [data.layers || []];
  for (const a of data.assets || []) if (a && a.layers) lists.push(a.layers);
  for (const layers of lists) {
    for (const l of layers) {
      if (l.ty !== 4) continue;
      if (!isSlotLayer(l)) continue;
      const pts = collectPoints(l.shapes || []);
      if (pts.length < 3) continue;
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      l.shapes = [wordGroupForBBox(opts.word || 'GRID', [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], color, sizeMult, useStroke, strokeColor, style)];
      replaced++;
    }
  }
  return { doc: data, replaced };
}

/* recolor every fill/stroke of a doc to one color, keeping opacities;
 * name/text groups are left alone */
function tintDoc(docData, hex) {
  const c = hexToRgb(hex);
  const recolor = k => {
    if (Array.isArray(k) && k.length >= 3 && typeof k[0] === 'number') {
      return [c[0], c[1], c[2], k.length > 3 ? k[3] : 1];
    }
    if (k && typeof k === 'object' && Array.isArray(k.k)) {
      for (const kf of k.k) {
        if (kf && Array.isArray(kf.s) && kf.s.length >= 3 && typeof kf.s[0] === 'number') {
          kf.s = [c[0], c[1], c[2], kf.s.length > 3 ? kf.s[3] : 1];
        }
      }
      return k;
    }
    return k;
  };
  const walkItems = items => {
    for (const it of items || []) {
      if (!it) continue;
      if (it.ty === 'fl' || it.ty === 'st') {
        if (it.c) it.c.k = recolor(it.c.k);
      } else if (it.ty === 'gr') {
        const nm = String(it.nm || '');
        if (nm === 'NAME' || nm.startsWith('l_') || nm === 't') continue;
        walkItems(it.it);
      }
    }
  };
  const walkLayers = layers => {
    for (const l of layers || []) walkItems(l.shapes);
  };
  walkLayers(docData.layers);
  for (const a of docData.assets || []) if (a && a.layers) walkLayers(a.layers);
  return docData;
}

/* overlay mode for slotless templates: word on a rounded pill, bottom-center,
 * added as a new top layer */
function overlayWord(baseDoc, opts) {
  const data = JSON.parse(JSON.stringify(baseDoc));
  const W = data.w || 512, H = data.h || 512;
  const color = hexToRgb(opts.color);
  const bw = Math.min(420, W * 0.82);
  const bh = Math.min(120, H * 0.22);
  // layer has p=[0,0] so shape coords are comp coords: center around (W/2, H/2)
  const cx = W / 2, cy = H / 2 + bh / 2 - 14;
  const bbox = [cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2];
  const word = wordGroupForBBox(opts.word || 'GRID', bbox, color,
    opts.size != null ? Number(opts.size) : 1.0, !!opts.stroke,
    opts.strokeColor ? hexToRgb(opts.strokeColor) : BLACK, opts.font || 'block');
  // backing pill around the same bbox
  const pad = 14;
  const pill = roundedRectShape(bbox[0] - pad, bbox[1] - pad / 2, bbox[2] + pad, bbox[3] + pad / 2, 18);
  const layer = {
    ddd: 0, ind: 1, ty: 4, nm: 'NAME_OVERLAY', sr: 1,
    ks: { o: st(100), r: st(0), p: st([0, 0, 0]), a: st([0, 0, 0]), s: st([100, 100, 100]) },
    ao: 0,
    shapes: [
      word,
      { ty: 'gr', nm: 'pill', it: [
        { ty: 'sh', ks: st(pill) },
        fill(BLACK, 78), stroke(WHITE, 4), trspec(),
      ] },
    ],
    ip: 0, op: data.op || 60, st: 0,
  };
  data.layers.unshift(layer);
  return data;
}

root.ES = {
  FONT, layoutWord, wordRects, letterGroups, pickCell,
  OURS, replaceSlots, tintDoc, overlayWord, hexToRgb, doc,
};

})(typeof window !== 'undefined' ? window : globalThis);
