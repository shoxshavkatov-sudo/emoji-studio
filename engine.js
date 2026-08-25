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

const WHITE = [1, 1, 1, 1], BLACK = [0, 0, 0, 1];

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || ''));
  if (!m) return [1, 1, 1, 1];
  const n = parseInt(m[1], 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
}

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

root.ES = { FONT, layoutWord, glyphOf, replaceSlots, tintDoc, hexToRgb };

})(typeof window !== 'undefined' ? window : globalThis);
