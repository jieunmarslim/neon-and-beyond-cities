/**
 * Hand-Crafted 92x62 Nocturnal ASCII Skyline Engine
 *
 * Crisp, vivid multi-city architectural ASCII line-art renderer supporting:
 * - Per-city 3-act choreography ("buildings-first" and Dubai "ground-first")
 * - 6 distinct worlds:
 *   Seoul (granite plaza + snow), Dubai (flat desert dunes + breeze, ground-first),
 *   Singapore (Marina Bay live water reflections + fireflies),
 *   Taipei (rain-slicked stone boulevard + drifting Pingxi sky lanterns),
 *   Beijing (imperial white-marble courtyard + drifting gold-crimson embers),
 *   Bangalore (Cubbon/Lalbagh nocturnal terraced garden + glowing petals/fireflies)
 * - Single translucent official Google Cloud 2025 ASCII logo floating in dedicated sky corridor
 * - Dual-pass cross-browser optical bloom without ctx.filter dependency
 * - Full-bleed widescreen presentation over file:// with zero external JS CDNs
 */

const CLOUD_WORD = "GOOGLECLOUD";
const CLOUD_GRID_COLS = 42;
const CLOUD_GRID_ROWS = 20;
const CLOUD_SUB_W = 0.50; // 42 * 0.50 = 21.0 city cols wide (exact same sky footprint)
const CLOUD_SUB_H = 0.55; // 20 * 0.55 = 11.0 city rows tall (exact same sky footprint)

// Full Hunminjeongeum Eonhae Preface (훈민정음 서문 전문) for Seoul's starlight click blooms
const HUNMIN_PHRASES = [
  "나랏말싸미 듕귁에 달아",
  "문자와로 서르 사맛디 아니할쎄",
  "이런 젼차로 어린 백성이",
  "니르고져 홀 배 이셔도",
  "마참내 제 뜻을 능히 펴지 못할 노미 하니라",
  "내 이를 위하야 어엿비 너겨",
  "새로 스물여덟 자를 맹가노니",
  "사람마다 해여 수비 니겨",
  "날로 쑤메 편안케 하고져 할 따름이니라",
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0 || 1e-6), 0, 1);
  return t * t * (3 - 2 * t);
}

function modPos(a, n) {
  return ((a % n) + n) % n;
}

function isCjkOrHangul(ch) {
  if (!ch) return false;
  const cp = ch.charCodeAt(0);
  return (
    (cp >= 0xac00 && cp <= 0xd7a3) ||
    (cp >= 0x3130 && cp <= 0x318f) ||
    (cp >= 0x4e00 && cp <= 0x9fff)
  );
}

function parseColorToRgb(colorStr) {
  if (!colorStr || typeof colorStr !== "string") return [184, 208, 240];
  const s = colorStr.trim();
  if (s.charCodeAt(0) === 35) {
    if (s.length === 4) {
      return [
        parseInt(s[1] + s[1], 16) || 0,
        parseInt(s[2] + s[2], 16) || 0,
        parseInt(s[3] + s[3], 16) || 0,
      ];
    }
    if (s.length >= 7) {
      return [
        parseInt(s.slice(1, 3), 16) || 0,
        parseInt(s.slice(3, 5), 16) || 0,
        parseInt(s.slice(5, 7), 16) || 0,
      ];
    }
  }
  const m = s.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
  if (m) {
    return [
      clamp(Math.round(Number(m[1])), 0, 255),
      clamp(Math.round(Number(m[2])), 0, 255),
      clamp(Math.round(Number(m[3])), 0, 255),
    ];
  }
  return [184, 208, 240];
}

/**
 * Samples the official Google Cloud 2025 PNG into a razor-crisp ~2x finer
 * 42x20 ASCII sub-grid using a hard alpha cutoff (a >= 165 / cov >= 0.65)
 * so ZERO dim/blurry fringe letters poke into the hollow interior or outer curve.
 */
function buildCloudAsciiCells(img, gridCols = CLOUD_GRID_COLS, gridRows = CLOUD_GRID_ROWS) {
  const tmpC = document.createElement("canvas");
  tmpC.width = img.width;
  tmpC.height = img.height;
  const tctx = tmpC.getContext("2d");
  tctx.drawImage(img, 0, 0);
  const raw = tctx.getImageData(0, 0, img.width, img.height).data;

  // Crop strictly to solid opaque pixels (alpha >= 165) — zero blurry halo padding
  let minX = img.width;
  let maxX = 0;
  let minY = img.height;
  let maxY = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (raw[(y * img.width + x) * 4 + 3] >= 165) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  const cw = Math.max(1, maxX - minX + 1);
  const ch = Math.max(1, maxY - minY + 1);

  const sampleW = gridCols * 4;
  const sampleH = gridRows * 4;
  const resC = document.createElement("canvas");
  resC.width = sampleW;
  resC.height = sampleH;
  const rctx = resC.getContext("2d");
  rctx.imageSmoothingEnabled = true;
  rctx.imageSmoothingQuality = "high";
  rctx.drawImage(img, minX, minY, cw, ch, 0, 0, sampleW, sampleH);
  const data = rctx.getImageData(0, 0, sampleW, sampleH).data;

  const cells = [];
  const cellGrid = new Array(gridCols * gridRows).fill(null);

  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      let aSum = 0;
      let rSum = 0;
      let gSum = 0;
      let bSum = 0;
      let wSum = 0;

      for (let sy = 0; sy < 4; sy++) {
        const py = row * 4 + sy;
        for (let sx = 0; sx < 4; sx++) {
          const px = col * 4 + sx;
          const idx = (py * sampleW + px) * 4;
          const a = data[idx + 3] / 255;
          aSum += a;
          if (a >= 0.35) {
            rSum += data[idx] * a;
            gSum += data[idx + 1] * a;
            bSum += data[idx + 2] * a;
            wSum += a;
          }
        }
      }

      // Hard crisp alpha cutoff (>= 0.65 / alpha >= 165) — zero dim fringe letters!
      const cov = aSum / 16;
      if (cov < 0.65 || wSum <= 0.01) continue;

      const br = rSum / wSum;
      const bg = gSum / wSum;
      const bb = bSum / wSum;
      const gray = 0.299 * br + 0.587 * bg + 0.114 * bb;
      const r = clamp(Math.round((gray + (br - gray) * 1.16) * 1.09 + 14), 0, 255);
      const g = clamp(Math.round((gray + (bg - gray) * 1.16) * 1.09 + 14), 0, 255);
      const b = clamp(Math.round((gray + (bb - gray) * 1.16) * 1.10 + 16), 0, 255);

      const chGlyph = CLOUD_WORD[modPos(col + row * 3, CLOUD_WORD.length)];
      const entry = {
        col,
        row,
        ch: chGlyph,
        r,
        g,
        b,
      };
      cells.push(entry);
      cellGrid[row * gridCols + col] = entry;
    }
  }

  return {
    cols: gridCols,
    rows: gridRows,
    spanCols: gridCols * CLOUD_SUB_W,
    spanRows: gridRows * CLOUD_SUB_H,
    cells,
    cellGrid,
  };
}

function defaultAtmosphereForGround(groundType, cityId) {
  if (groundType === "plaza" || groundType === "han-river" || cityId === "seoul") return "snow";
  if (groundType === "dunes" || cityId === "dubai") return "breeze";
  if (groundType === "water" || cityId === "singapore") return "fireflies";
  if (groundType === "avenue" || cityId === "taipei" || cityId === "taiwan") return "lanterns";
  if (groundType === "marble-courtyard" || cityId === "beijing") return "embers";
  if (groundType === "garden" || cityId === "bangalore") return "petals";
  return "snow";
}

function getWorldPalette(groundType, skyPalette) {
  const topHex = (Array.isArray(skyPalette) && skyPalette[0]) || "#050A18";
  const botHex = (Array.isArray(skyPalette) && skyPalette[1]) || "#102042";
  if (groundType === "dunes") {
    return {
      skyTop: topHex,
      skyBot: botHex,
      horizonGlow: [154, 98, 52],
      groundTop: "#2A1A0E",
      groundBot: "#120A05",
      starTint: [242, 228, 208],
    };
  }
  if (groundType === "water") {
    return {
      skyTop: topHex,
      skyBot: botHex,
      horizonGlow: [24, 96, 114],
      groundTop: "#061722",
      groundBot: "#02080E",
      starTint: [204, 236, 246],
    };
  }
  if (groundType === "avenue") {
    return {
      skyTop: topHex,
      skyBot: botHex,
      horizonGlow: [86, 66, 128],
      groundTop: "#100D1F",
      groundBot: "#06050D",
      starTint: [228, 222, 248],
    };
  }
  if (groundType === "marble-courtyard") {
    return {
      skyTop: topHex,
      skyBot: botHex,
      horizonGlow: [164, 40, 48],
      groundTop: "#1B090D",
      groundBot: "#090305",
      starTint: [248, 224, 214],
    };
  }
  if (groundType === "garden") {
    return {
      skyTop: topHex,
      skyBot: botHex,
      horizonGlow: [176, 98, 48],
      groundTop: "#19100C",
      groundBot: "#080608",
      starTint: [252, 234, 206],
    };
  }
  if (groundType === "han-river") {
    return {
      skyTop: topHex,
      skyBot: botHex,
      horizonGlow: [38, 68, 138],
      groundTop: "#061026",
      groundBot: "#030714",
      starTint: [216, 228, 250],
    };
  }
  return {
    skyTop: topHex,
    skyBot: botHex,
    horizonGlow: [42, 72, 142],
    groundTop: "#091124",
    groundBot: "#040814",
    starTint: [216, 228, 250],
  };
}

/**
 * Normalizes a city definition supporting both `phases` and `stages`,
 * precomputes per-sprite RGB colors, reveal bounds, stars, ambient particles,
 * and Seoul Namdaemun arch spill coordinates.
 */
function prepareCityData(rawCity) {
  const rawId = String(rawCity.id || "city").toLowerCase();
  const id = rawId === "taiwan" ? "taipei" : rawId;
  const cols = Number.isFinite(rawCity.cols) ? rawCity.cols : 92;
  const rows = Number.isFinite(rawCity.rows) ? rawCity.rows : 62;
  const waterlineRow = Number.isFinite(rawCity.waterlineRow) ? rawCity.waterlineRow : 43;
  const groundType =
    typeof rawCity.ground === "string"
      ? rawCity.ground
      : (rawCity.ground && rawCity.ground.type) ||
        (id === "dubai"
          ? "dunes"
          : id === "singapore"
            ? "water"
            : id === "taipei"
              ? "avenue"
              : id === "beijing"
                ? "marble-courtyard"
                : id === "bangalore"
                  ? "garden"
                  : "plaza");
  const atmosphere = rawCity.atmosphere || defaultAtmosphereForGround(groundType, id);
  const revealOrder =
    rawCity.revealOrder || (id === "dubai" ? "ground-first" : "buildings-first");

  const rng = mulberry32(hashString(`neon-beyond-92x62-${id}`));
  const rawPhases =
    Array.isArray(rawCity.phases) && rawCity.phases.length > 0
      ? rawCity.phases
      : Array.isArray(rawCity.stages)
        ? rawCity.stages
        : [];

  const nonAsciiGlyphs = new Set();
  if (rawCity.nativeTitle) {
    for (const ch of rawCity.nativeTitle) {
      if (isCjkOrHangul(ch)) nonAsciiGlyphs.add(ch);
    }
  }

  let warmArchColSum = 0;
  let warmArchWeight = 0;
  let warmArchMinCol = cols;
  let warmArchMaxCol = -1;

  const normalizedPhases = [];
  for (let pIdx = 0; pIdx < rawPhases.length; pIdx++) {
    const ph = rawPhases[pIdx];
    const startTime = Number.isFinite(ph.startTime)
      ? ph.startTime
      : Number.isFinite(ph.start)
        ? ph.start
        : pIdx * 1.4;
    const duration = Number.isFinite(ph.duration)
      ? Math.max(0.25, ph.duration)
      : Number.isFinite(ph.end)
        ? Math.max(0.25, ph.end - startTime)
        : 2.0;
    const reveal = ph.reveal || "bottom-up";
    const name = ph.name || ph.id || ph.label || `stage-${pIdx + 1}`;

    let minRow = waterlineRow - 1;
    let maxRow = 0;
    let minCol = cols - 1;
    let maxCol = 0;
    const sprites = [];

    const rawSprites = Array.isArray(ph.sprites) ? ph.sprites : [];
    for (let sIdx = 0; sIdx < rawSprites.length; sIdx++) {
      const sp = rawSprites[sIdx];
      if (!sp || typeof sp.text !== "string" || sp.text.length === 0) continue;
      const row = Math.round(sp.row);
      const col = Math.round(sp.col);
      if (row < 0 || row >= waterlineRow) continue;

      const rgb = parseColorToRgb(sp.color);
      const chars = Array.from(sp.text);
      let hasInk = false;
      for (let ci = 0; ci < chars.length; ci++) {
        const ch = chars[ci];
        if (ch === " ") continue;
        const cPos = col + ci;
        if (cPos < 0 || cPos >= cols) continue;
        hasInk = true;
        if (cPos < minCol) minCol = cPos;
        if (cPos > maxCol) maxCol = cPos;
        if (isCjkOrHangul(ch)) nonAsciiGlyphs.add(ch);

        // Auto-detect Namdaemun's central warm amber arch in Seoul for aligned spill/reflection
        if (
          (groundType === "plaza" || groundType === "han-river") &&
          row >= waterlineRow - 6 &&
          row < waterlineRow &&
          cPos >= 34 &&
          cPos <= 56 &&
          rgb[0] >= 180 &&
          rgb[1] >= 125 &&
          rgb[2] <= 145 &&
          rgb[0] - rgb[2] >= 48
        ) {
          const w = sp.glow ? 2.2 : 1.0;
          warmArchColSum += cPos * w;
          warmArchWeight += w;
          if (cPos < warmArchMinCol) warmArchMinCol = cPos;
          if (cPos > warmArchMaxCol) warmArchMaxCol = cPos;
        }
      }
      if (!hasInk) continue;

      if (row < minRow) minRow = row;
      if (row > maxRow) maxRow = row;

      sprites.push({
        row,
        col,
        chars,
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
        glow: Boolean(sp.glow),
        twinkle: Boolean(sp.twinkle),
        flicker: Boolean(sp.flicker),
        alpha: Number.isFinite(sp.alpha) ? clamp(sp.alpha, 0.1, 1) : 1,
        seed: rng(),
        phaseOff: rng() * Math.PI * 2,
      });
    }

    if (sprites.length === 0) continue;
    normalizedPhases.push({
      name,
      startTime,
      duration,
      reveal,
      minRow,
      maxRow,
      minCol,
      maxCol,
      sprites,
    });
  }

  let rawArchEnd = 9.8;
  if (normalizedPhases.length > 0) {
    rawArchEnd = 0;
    for (let i = 0; i < normalizedPhases.length; i++) {
      const endT = normalizedPhases[i].startTime + normalizedPhases[i].duration;
      if (endT > rawArchEnd) rawArchEnd = endT;
    }
    if (rawArchEnd > 10.6) {
      const scale = 9.8 / rawArchEnd;
      for (let i = 0; i < normalizedPhases.length; i++) {
        normalizedPhases[i].startTime *= scale;
        normalizedPhases[i].duration *= scale;
      }
      rawArchEnd = 9.8;
    } else if (rawArchEnd < 4.0) {
      rawArchEnd = Math.max(rawArchEnd, 4.0);
    }
  }

  // Namdaemun central arch anchor (Seoul plaza candlelight reflection)
  let archCenterCol = 45;
  let archHalfSpan = 4.5;
  if (warmArchWeight > 4 && warmArchMaxCol >= warmArchMinCol) {
    archCenterCol = clamp(warmArchColSum / warmArchWeight, 35, 55);
    archHalfSpan = clamp((warmArchMaxCol - warmArchMinCol) * 0.52 + 1.2, 3.2, 6.2);
  }

  // Deterministic full-width starfield (spans cols -40 .. cols + 40 for widescreen)
  const stars = [];
  const starCount = groundType === "dunes" ? 86 : 74;
  for (let i = 0; i < starCount; i++) {
    const col = -38 + rng() * (cols + 76);
    const row = 0.7 + Math.pow(rng(), 1.18) * (waterlineRow - 5.5);
    const roll = rng();
    const ch = roll < 0.48 ? "." : roll < 0.72 ? "·" : roll < 0.88 ? "+" : "*";
    stars.push({
      col,
      row,
      ch,
      baseAlpha: 0.24 + rng() * 0.58,
      speed: 0.65 + rng() * 1.45,
      phase: rng() * Math.PI * 2,
      warmth: rng(),
      glow: ch === "*" || (ch === "+" && rng() > 0.65),
    });
  }

  // Deterministic ambient atmospheric particles per city
  const particles = [];
  if (atmosphere === "snow") {
    for (let i = 0; i < 36; i++) {
      particles.push({
        col: -34 + rng() * (cols + 68),
        row: rng() * (waterlineRow - 1),
        fallSpeed: 0.48 + rng() * 0.62,
        swayAmp: 0.75 + rng() * 1.25,
        swayFreq: 0.42 + rng() * 0.55,
        phase: rng() * Math.PI * 2,
        ch: rng() < 0.68 ? "." : rng() < 0.92 ? "·" : "*",
        alpha: 0.28 + rng() * 0.44,
      });
    }
  } else if (atmosphere === "breeze") {
    for (let i = 0; i < 34; i++) {
      particles.push({
        col: -36 + rng() * (cols + 72),
        row: 16 + rng() * (rows - 20),
        speedX: 2.2 + rng() * 3.4,
        waveAmp: 0.22 + rng() * 0.36,
        waveFreq: 0.65 + rng() * 0.7,
        phase: rng() * Math.PI * 2,
        ch: rng() < 0.56 ? "·" : rng() < 0.84 ? "." : "-",
        alpha: 0.22 + rng() * 0.38,
      });
    }
  } else if (atmosphere === "fireflies") {
    for (let i = 0; i < 26; i++) {
      particles.push({
        col: -18 + rng() * (cols + 36),
        row: 18 + rng() * (waterlineRow - 20),
        driftX: 0.55 + rng() * 1.1,
        driftY: 0.35 + rng() * 0.75,
        freqX: 0.28 + rng() * 0.38,
        freqY: 0.32 + rng() * 0.44,
        pulseFreq: 0.75 + rng() * 1.25,
        phase: rng() * Math.PI * 2,
        mint: rng() > 0.45,
        alpha: 0.34 + rng() * 0.44,
      });
    }
  } else if (atmosphere === "lanterns") {
    // Sparse, delicate glowing Pingxi sky lanterns drifting gently upward
    const lanternCount = 11;
    for (let i = 0; i < lanternCount; i++) {
      // Spread across left, center-left, and far-right open Taipei sky
      const colSpan = -20 + ((i + 0.35 + rng() * 0.3) / lanternCount) * (cols + 40);
      particles.push({
        baseCol: colSpan,
        baseRow: 2.5 + rng() * (waterlineRow - 12),
        riseSpeed: 0.36 + rng() * 0.34,
        swayAmp: 0.85 + rng() * 1.15,
        swayFreq: 0.28 + rng() * 0.26,
        flickerFreq: 1.8 + rng() * 1.6,
        phase: rng() * Math.PI * 2,
        scale: 0.75 + rng() * 0.4,
      });
    }
  } else if (atmosphere === "embers") {
    // Subtle drifting warm gold-crimson imperial light motes for Beijing
    for (let i = 0; i < 28; i++) {
      particles.push({
        baseCol: -26 + rng() * (cols + 52),
        baseRow: 2 + rng() * (waterlineRow - 5),
        riseSpeed: 0.42 + rng() * 0.48,
        driftX: 0.25 + rng() * 0.35,
        swayAmp: 0.7 + rng() * 1.1,
        swayFreq: 0.42 + rng() * 0.48,
        pulseFreq: 1.1 + rng() * 1.3,
        phase: rng() * Math.PI * 2,
        crimson: rng() > 0.56,
        ch: rng() < 0.55 ? "·" : rng() < 0.85 ? "." : "*",
        alpha: 0.34 + rng() * 0.42,
      });
    }
  } else if (atmosphere === "petals") {
    // Warm Diwali marigold-gold, saffron & magenta-rose light motes/blossoms for Bangalore
    for (let i = 0; i < 34; i++) {
      const huePick = rng();
      particles.push({
        baseCol: -24 + rng() * (cols + 48),
        baseRow: 3.5 + rng() * (waterlineRow - 6),
        driftSpeedY: -(0.16 + rng() * 0.28),
        swayAmp: 0.9 + rng() * 1.3,
        swayFreq: 0.34 + rng() * 0.42,
        pulseFreq: 1.0 + rng() * 1.25,
        phase: rng() * Math.PI * 2,
        tone: huePick < 0.44 ? 0 : huePick < 0.76 ? 1 : 2, // 0=marigold, 1=saffron, 2=magenta-rose
        ch: rng() < 0.50 ? "·" : rng() < 0.80 ? "." : "*",
        alpha: 0.38 + rng() * 0.46,
      });
    }
  }

  const cloudFloat = rawCity.cloudFloat || { row: 6, centerCol: 46, driftAmp: 10 };
  const baekjaMoon =
    rawCity.baekjaMoon &&
    Number.isFinite(rawCity.baekjaMoon.col) &&
    Number.isFinite(rawCity.baekjaMoon.row)
      ? { col: rawCity.baekjaMoon.col, row: rawCity.baekjaMoon.row }
      : null;

  const merlion =
    rawCity.merlion &&
    Number.isFinite(rawCity.merlion.startRow) &&
    Number.isFinite(rawCity.merlion.startCol)
      ? {
          startRow: rawCity.merlion.startRow,
          startCol: rawCity.merlion.startCol,
          mouthCol: Number.isFinite(rawCity.merlion.mouthCol) ? rawCity.merlion.mouthCol : 12.4,
          mouthRow: Number.isFinite(rawCity.merlion.mouthRow) ? rawCity.merlion.mouthRow : 46.15,
          splashCol: Number.isFinite(rawCity.merlion.splashCol) ? rawCity.merlion.splashCol : 24.5,
          splashRow: Number.isFinite(rawCity.merlion.splashRow) ? rawCity.merlion.splashRow : 53.35,
        }
      : null;

  let burjReadyTime = 10.4;
  if (id === "dubai") {
    const groundLead = revealOrder === "ground-first" ? 2.2 : 0;
    const burjPhase = normalizedPhases.find((p) => /burj[-_ ]?khalifa/i.test(p.name));
    if (burjPhase) {
      burjReadyTime = groundLead + burjPhase.startTime + burjPhase.duration;
    }
  }

  return {
    id,
    label: rawCity.label || rawCity.title || id.toUpperCase(),
    title: rawCity.title || rawCity.label || id.toUpperCase(),
    nativeTitle: rawCity.nativeTitle || "",
    coords: rawCity.coords || "",
    cols,
    rows,
    waterlineRow,
    groundType,
    atmosphere,
    revealOrder,
    worldPalette: getWorldPalette(groundType, rawCity.skyPalette),
    baekjaMoon,
    merlion,
    burjReadyTime,
    cloudFloat: {
      row: Number.isFinite(cloudFloat.row) ? cloudFloat.row : 6,
      centerCol: Number.isFinite(cloudFloat.centerCol) ? cloudFloat.centerCol : 46,
      driftAmp: Number.isFinite(cloudFloat.driftAmp) ? cloudFloat.driftAmp : 10,
    },
    phases: normalizedPhases,
    archEnd: rawArchEnd,
    archCenterCol,
    archHalfSpan,
    stars,
    particles,
    nonAsciiGlyphs: Array.from(nonAsciiGlyphs).join(""),
  };
}

export function mountCitySkyline(options) {
  const {
    canvas,
    mastheadCityEl,
    mastheadNativeEl,
    mastheadCoordsEl,
    cities,
    initialCityId = "seoul",
    initialTime = 0,
    pinInitialTime = false,
    cloudLogoUri = "",
    cityButtons = [],
    replayButton = null,
  } = options;

  const ctx = canvas.getContext("2d", { alpha: false });
  const preparedList = cities.map(prepareCityData);
  const preparedMap = new Map(preparedList.map((c) => [c.id, c]));

  let activeCity = preparedMap.get(initialCityId) || preparedList[0];
  let cloudAscii = null;

  // Offscreen canvases for crisp base draw + dual-pass cross-browser optical bloom
  const baseCanvas = document.createElement("canvas");
  const bctx = baseCanvas.getContext("2d", { alpha: false });
  const glowCanvas = document.createElement("canvas");
  const gctx = glowCanvas.getContext("2d", { alpha: true });
  const bloomTight = document.createElement("canvas");
  const btctx = bloomTight.getContext("2d", { alpha: true });
  const bloomSoft = document.createElement("canvas");
  const bsctx = bloomSoft.getContext("2d", { alpha: true });

  // Per-frame 92 x waterlineRow architectural grid buffers (for reflections + cloud occlusion)
  const MAX_CELLS = 128 * 64;
  const cellChar = new Array(MAX_CELLS).fill("");
  const cellR = new Uint8Array(MAX_CELLS);
  const cellG = new Uint8Array(MAX_CELLS);
  const cellB = new Uint8Array(MAX_CELLS);
  const cellA = new Float32Array(MAX_CELLS);
  const cellGlow = new Uint8Array(MAX_CELLS);

  // Viewport layout metrics
  let viewW = 1440;
  let viewH = 900;
  let dpr = 1;
  let cellW = 9.4;
  let cellH = 14.4;
  let fontPx = 15.0;
  let originX = 280;
  let originY = 6;
  let extraColsLeft = 30;
  let extraColsRight = 30;

  let simTime = Math.max(0, Number(initialTime) || 0);
  let pinned = Boolean(pinInitialTime);
  let ready = false;
  let lastNow = 0;
  let rafId = 0;

  function ensureRunning() {
    pinned = false;
    if (ready && !rafId) {
      lastNow = 0;
      rafId = window.requestAnimationFrame(tick);
    }
  }

  // Interactive & occasional ambient shooting stars (Seoul/Dubai/Singapore/Bangalore)
  // + interactive user-released Pingxi sky lanterns (Taipei)
  // + interactive & periodic crimson-gold ASCII fireworks (Beijing)
  const meteors = [];
  const userLanterns = [];
  const fireworks = [];
  const seoulFireworks = [];
  const MAX_USER_LANTERNS = 28;
  const MAX_FIREWORKS = 8;
  const MAX_SEOUL_FIREWORKS = 6;
  let hunminIndex = 0;
  let nextAutoMeteorT = Math.max(simTime + 4.5, 13.5);
  let nextAutoFireworkT = Math.max(simTime + 3.0, 14.2);
  let dubaiSurgeAge = -1; // -1 = inactive; >= 0 triggers Burj Khalifa LED Finale Surge (0 -> 1.45s)

  function buildFireworkSpec(targetCol, targetRow, seedVal) {
    const rand = Number.isFinite(seedVal) ? mulberry32(seedVal) : Math.random;
    const sparks = [];
    // Dual-ring radial chrysanthemum: 16 outer vivid crimson/vermilion + 8 inner imperial gold
    const outerCount = 16;
    const innerCount = 8;
    const outerOffset = rand() * Math.PI * 2;
    for (let i = 0; i < outerCount; i++) {
      const ang = outerOffset + (i / outerCount) * Math.PI * 2 + (rand() - 0.5) * 0.14;
      const spd = 12.2 + rand() * 3.8;
      const isCrimson = i % 3 !== 2;
      sparks.push({
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: isCrimson ? 255 : 255,
        g: isCrimson ? 59 : 107,
        b: isCrimson ? 71 : 90,
        drag: 2.7 + rand() * 0.6,
        twinklePhase: rand() * Math.PI * 2,
      });
    }
    const innerOffset = outerOffset + Math.PI / innerCount;
    for (let i = 0; i < innerCount; i++) {
      const ang = innerOffset + (i / innerCount) * Math.PI * 2 + (rand() - 0.5) * 0.16;
      const spd = 6.8 + rand() * 2.6;
      const isCoreGold = i % 2 === 0;
      sparks.push({
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: 255,
        g: isCoreGold ? 240 : 209,
        b: isCoreGold ? 184 : 102,
        drag: 3.1 + rand() * 0.5,
        twinklePhase: rand() * Math.PI * 2,
      });
    }
    return {
      startCol: targetCol + (rand() - 0.5) * 2.2,
      startRow: 38,
      targetCol,
      targetRow,
      ascentDur: 0.42,
      burstDur: 1.68,
      totalDur: 2.10,
      age: 0,
      sparks,
    };
  }

  // Deterministic showcase fireworks for Beijing so ?city=beijing&t=18 captures
  // radiant crimson-and-gold chrysanthemum bursts cleanly in wide open left & right sky
  // (clear of center Google Cloud cols 29..71 and auspicious clouds rows 14..16)
  const BEIJING_SHOWCASE_FIREWORKS = [
    { launchT: 17.06, spec: buildFireworkSpec(12.5, 8.2, 20250808) },
    { launchT: 17.44, spec: buildFireworkSpec(81.0, 11.2, 20250919) },
  ];

  function spawnFirework(rawCol, rawRow) {
    const minC = -extraColsLeft + 4;
    const maxC = activeCity.cols + extraColsRight - 4;
    const c = clamp(Number.isFinite(rawCol) ? rawCol : 13, minC, maxC);
    const r = clamp(Number.isFinite(rawRow) ? rawRow : 10, 4, 22);
    fireworks.push(buildFireworkSpec(c, r));
    while (fireworks.length > MAX_FIREWORKS) {
      fireworks.shift();
    }
  }

  function spawnAutoBeijingFirework() {
    // Open left/right sky pockets strictly clear of center Google Cloud (cols 29..71)
    const useLeft = Math.random() < 0.52;
    const c = useLeft ? 7 + Math.random() * 13 : 74 + Math.random() * 13;
    const r = useLeft ? 6 + Math.random() * 6.5 : 6.5 + Math.random() * 8.5;
    spawnFirework(c, r);
  }

  function spawnSeoulFirework(rawCol, rawRow) {
    const phrase = HUNMIN_PHRASES[hunminIndex % HUNMIN_PHRASES.length];
    hunminIndex += 1;

    const glyphs = Array.from(phrase);
    const offsets = [];
    let cursor = 0;
    for (let i = 0; i < glyphs.length; i++) {
      const ch = glyphs[i];
      const adv = ch === " " ? 0.82 : 1.55;
      offsets.push({ ch, xOff: cursor + adv * 0.5, seed: Math.random() });
      cursor += adv;
    }
    const spanCols = cursor;
    for (let i = 0; i < offsets.length; i++) {
      offsets[i].xOff -= spanCols * 0.5;
    }

    const halfSpan = spanCols * 0.5;
    const minC = -extraColsLeft + 3 + halfSpan;
    const maxC = activeCity.cols + extraColsRight - 3 - halfSpan;
    const targetCol =
      minC <= maxC
        ? clamp(Number.isFinite(rawCol) ? rawCol : activeCity.cols * 0.5, minC, maxC)
        : activeCity.cols * 0.5;
    const targetRow = clamp(Number.isFinite(rawRow) ? rawRow : 13, 5, 21);

    // 20 restrained pearl-silver, pale champagne-gold & celadon-white starlight sparks
    const sparks = [];
    const baseOff = Math.random() * Math.PI * 2;
    const palette = [
      [239, 244, 252], // pearl-silver (#EFF4FC)
      [244, 216, 146], // pale champagne-gold (#F4D892)
      [184, 224, 212], // subtle celadon-white (#B8E0D4)
    ];
    for (let i = 0; i < 20; i++) {
      const ang = baseOff + (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.16;
      const spd = 8.4 + Math.random() * 3.8;
      const rgb = palette[i % palette.length];
      sparks.push({
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: rgb[0],
        g: rgb[1],
        b: rgb[2],
        drag: 2.9 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    seoulFireworks.push({
      startCol: targetCol + (Math.random() - 0.5) * 2.0,
      startRow: 41,
      targetCol,
      targetRow,
      ascentDur: 0.44,
      sparkDur: 1.90,
      phraseDur: 3.20,
      totalDur: 3.64,
      age: 0,
      sparks,
      glyphs: offsets,
    });
    while (seoulFireworks.length > MAX_SEOUL_FIREWORKS) {
      seoulFireworks.shift();
    }
  }

  function isDubaiTowerReady(city, t) {
    return Boolean(city && city.id === "dubai" && t >= city.burjReadyTime);
  }

  function spawnMeteor(startCol, startRow, userTriggered = false) {
    const cols = activeCity.cols;
    const c = Number.isFinite(startCol) ? startCol : -6 + Math.random() * (cols - 18);
    const r = Number.isFinite(startRow) ? startRow : 2.5 + Math.random() * 11;
    // Uniform unidirectional parallel meteor shower trajectory (upper-left -> lower-right ↘)
    const dir = 1;
    meteors.push({
      col: c,
      row: r,
      vx: dir * (28 + Math.random() * 14),
      vy: 9 + Math.random() * 5,
      age: 0,
      life: 0.68 + Math.random() * 0.34,
      userTriggered: Boolean(userTriggered),
    });
  }

  function spawnClickedMeteor(rawCol, rawRow) {
    const minC = -extraColsLeft + 4;
    const maxC = activeCity.cols + extraColsRight - 4;
    const c = clamp(rawCol, minC, maxC);
    if (rawRow >= 0 && rawRow < activeCity.waterlineRow - 4) {
      spawnMeteor(c, clamp(rawRow, 2, 22), true);
    } else {
      spawnMeteor(c, undefined, true);
    }
  }

  function spawnUserLantern(rawCol, rawRow) {
    const minC = -extraColsLeft + 2;
    const maxC = activeCity.cols + extraColsRight - 2;
    const c = clamp(Number.isFinite(rawCol) ? rawCol : activeCity.cols * 0.5, minC, maxC);
    const r = clamp(
      Number.isFinite(rawRow) ? rawRow : activeCity.waterlineRow - 8,
      3,
      activeCity.waterlineRow - 2
    );
    userLanterns.push({
      baseCol: c,
      row: r,
      riseSpeed: 0.95 + Math.random() * 0.4,
      swayAmp: 0.65 + Math.random() * 0.85,
      swayFreq: 0.55 + Math.random() * 0.45,
      flickerFreq: 2.0 + Math.random() * 1.4,
      phase: Math.random() * Math.PI * 2,
      scale: 0.92 + Math.random() * 0.28,
      age: 0,
    });
    while (userLanterns.length > MAX_USER_LANTERNS) {
      userLanterns.shift();
    }
  }

  function updateMasthead() {
    if (mastheadCityEl) {
      mastheadCityEl.textContent = activeCity.title;
    }
    if (mastheadNativeEl) {
      if (activeCity.nativeTitle) {
        mastheadNativeEl.textContent = `· ${activeCity.nativeTitle}`;
        mastheadNativeEl.hidden = false;
      } else {
        mastheadNativeEl.textContent = "";
        mastheadNativeEl.hidden = true;
      }
    }
    if (mastheadCoordsEl) {
      mastheadCoordsEl.textContent = activeCity.coords;
    }
  }

  function updateMetrics() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = Math.max(320, window.innerWidth || 1440);
    viewH = Math.max(320, window.innerHeight || 900);

    const physW = Math.round(viewW * dpr);
    const physH = Math.round(viewH * dpr);

    if (canvas.width !== physW || canvas.height !== physH) {
      canvas.width = physW;
      canvas.height = physH;
      baseCanvas.width = physW;
      baseCanvas.height = physH;
      glowCanvas.width = physW;
      glowCanvas.height = physH;
      bloomTight.width = Math.max(64, Math.round(viewW * 0.36));
      bloomTight.height = Math.max(64, Math.round(viewH * 0.36));
      bloomSoft.width = Math.max(48, Math.round(viewW * 0.16));
      bloomSoft.height = Math.max(48, Math.round(viewH * 0.16));
    }

    const cols = activeCity.cols;
    const rows = activeCity.rows;

    const topPad = 8;
    const bottomPad = 8;
    const sidePad = 14;
    const availW = Math.max(280, viewW - sidePad * 2);
    const availH = Math.max(300, viewH - topPad - bottomPad);

    // Bold, crisp v6 (#47) JetBrains Mono proportions: cellW / cellH = 0.72
    // fills the widescreen canvas with commanding, luminous architectural line-art
    const idealAspect = 0.72;
    const hFromH = availH / rows;
    const hFromW = availW / (cols * idealAspect);
    cellH = Math.max(6.8, Math.min(hFromH, hFromW));
    cellW = cellH * idealAspect;
    fontPx = cellH * 1.00;

    const gridW = cols * cellW;
    const gridH = rows * cellH;
    originX = Math.round((viewW - gridW) * 0.5);
    originY = Math.round(topPad + Math.max(0, (availH - gridH) * 0.45));

    extraColsLeft = Math.ceil(originX / cellW) + 2;
    extraColsRight = Math.ceil((viewW - (originX + gridW)) / cellW) + 2;
  }

  function selectCity(cityId, resetTime = true) {
    const next = preparedMap.get(cityId);
    if (!next) return;
    activeCity = next;
    if (resetTime) {
      simTime = 0;
      meteors.length = 0;
      userLanterns.length = 0;
      fireworks.length = 0;
      seoulFireworks.length = 0;
      hunminIndex = 0;
      dubaiSurgeAge = -1;
      nextAutoMeteorT = 13.5;
      nextAutoFireworkT = 14.2;
    }
    for (const btn of cityButtons) {
      btn.setAttribute("aria-pressed", String(btn.dataset.city === activeCity.id));
    }
    updateMasthead();
    updateMetrics();
    ensureRunning();
  }

  function replay() {
    simTime = 0;
    meteors.length = 0;
    userLanterns.length = 0;
    fireworks.length = 0;
    seoulFireworks.length = 0;
    hunminIndex = 0;
    dubaiSurgeAge = -1;
    nextAutoMeteorT = 13.5;
    nextAutoFireworkT = 14.2;
    ensureRunning();
  }

  // Wire dock buttons & keyboard shortcuts
  for (const btn of cityButtons) {
    btn.setAttribute("aria-pressed", String(btn.dataset.city === activeCity.id));
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      selectCity(btn.dataset.city, true);
    });
  }

  if (replayButton) {
    replayButton.addEventListener("click", (e) => {
      e.stopPropagation();
      replay();
    });
  }

  canvas.addEventListener("pointerdown", (e) => {
    const c = (e.clientX - originX) / cellW;
    const r = (e.clientY - originY) / cellH;
    if (activeCity.atmosphere === "lanterns") {
      // Taipei: release a glowing Pingxi sky lantern right where clicked instead of a shooting star
      spawnUserLantern(c, r);
    } else if (activeCity.id === "beijing") {
      // Beijing: launch a crimson-red & imperial-gold ASCII firework toward the clicked sky point
      spawnFirework(c, r);
    } else if (activeCity.id === "dubai") {
      // Dubai: always drop a desert shooting star; only trigger Burj Khalifa LED Finale Surge
      // once Burj Khalifa has completely risen (never in empty sky before t >= burjReadyTime!)
      spawnClickedMeteor(c, r);
      if (isDubaiTowerReady(activeCity, simTime)) {
        dubaiSurgeAge = 0;
      }
    } else if (activeCity.id === "seoul") {
      // Seoul: restrained silver-gold Han River firework + sequential Hunminjeongeum preface starlight
      spawnSeoulFirework(c, r);
    } else {
      // Singapore & Bangalore: full-widescreen shooting star right where clicked
      spawnClickedMeteor(c, r);
    }
    ensureRunning();
  });

  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "1") selectCity("seoul", true);
    else if (e.key === "2") selectCity("dubai", true);
    else if (e.key === "3") selectCity("singapore", true);
    else if (e.key === "4") selectCity("taipei", true);
    else if (e.key === "5") selectCity("beijing", true);
    else if (e.key === "6") selectCity("bangalore", true);
    else if (e.key === "r" || e.key === "R") replay();
  });

  const handleResize = () => {
    updateMetrics();
    if (ready && pinned) renderFrame(simTime);
  };
  window.addEventListener("resize", handleResize);

  // Fonts helper
  let monoFontReg = "";
  let monoFontBold = "";
  let cloudFont = "";
  let cjkFont = "";
  let hunminFont = "";

  function applyFontStyles() {
    const px = fontPx.toFixed(2);
    const cloudPx = (fontPx * 0.57).toFixed(2);
    const cjkPx = (fontPx * 0.86).toFixed(2);
    const hunminPx = (fontPx * 0.96).toFixed(2);
    monoFontReg = `600 ${px}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
    monoFontBold = `700 ${px}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
    cloudFont = `600 ${cloudPx}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`;
    cjkFont = `500 ${cjkPx}px "Noto Sans KR", "Noto Sans TC", "Noto Sans SC", "Apple SD Gothic Neo", sans-serif`;
    hunminFont = `500 ${hunminPx}px "Noto Sans KR", "Apple SD Gothic Neo", sans-serif`;
  }

  function drawGlyph(ch, x, y, r, g, b, alpha, glow, glowScale = 0.9, bold = false) {
    if (alpha <= 0.014 || !ch || ch === " ") return;
    const useCjk = isCjkOrHangul(ch);
    const fontStr = useCjk ? cjkFont : bold ? monoFontBold : monoFontReg;
    if (bctx.font !== fontStr) bctx.font = fontStr;
    const cx = x + cellW * 0.5;
    const cy = y + cellH * 0.54;
    bctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
    bctx.fillText(ch, cx, cy);

    if (glow) {
      if (gctx.font !== fontStr) gctx.font = fontStr;
      const ga = clamp(alpha * glowScale, 0, 1);
      gctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${ga.toFixed(3)})`;
      gctx.fillText(ch, cx, cy);
    }
  }

  /**
   * Computes narrative act progress for both "buildings-first" and Dubai "ground-first".
   */
  function computeTimeline(city, t) {
    if (city.revealOrder === "ground-first") {
      // Dubai: Act 1 (0 -> 2.4s) empty desert awakens first;
      // Act 2 (2.2 -> 2.2 + archEnd) skyline rises straight out of desert sand;
      // Act 3 (2.2 + archEnd - 0.6 -> +2.4s) Google Cloud glides across open upper-left sky.
      const groundLead = 2.2;
      const bgReveal = smoothstep(0.0, 2.4, t);
      const archT = Math.max(0, t - groundLead);
      const cloudStart = groundLead + city.archEnd - 0.6;
      const cloudReveal = smoothstep(cloudStart, cloudStart + 2.4, t);
      return { bgReveal, archT, cloudReveal, allowArch: t >= groundLead };
    }

    // Seoul, Singapore, Taiwan: Act 1 (0 -> archEnd) crisp architecture on pure #05070D stillness;
    // Act 2 (archEnd -> archEnd + 2.6s) sky, stars, ground & atmosphere bloom;
    // Act 3 (archEnd + 2.0 -> archEnd + 4.4s) Google Cloud glides across starry night sky.
    const bgReveal = smoothstep(city.archEnd, city.archEnd + 2.6, t);
    const cloudReveal = smoothstep(city.archEnd + 2.0, city.archEnd + 4.4, t);
    return { bgReveal, archT: t, cloudReveal, allowArch: true };
  }

  function renderSkyAndHorizon(city, bgReveal, wlY) {
    // Pure quiet #05070D architectural stillness when bgReveal == 0
    bctx.fillStyle = "#05070D";
    bctx.fillRect(0, 0, viewW, viewH);

    if (bgReveal <= 0.004) return;

    const pal = city.worldPalette;
    bctx.save();
    bctx.globalAlpha = bgReveal;

    // Sky twilight gradient
    const skyGrad = bctx.createLinearGradient(0, 0, 0, wlY);
    skyGrad.addColorStop(0, pal.skyTop);
    skyGrad.addColorStop(1, pal.skyBot);
    bctx.fillStyle = skyGrad;
    bctx.fillRect(0, 0, viewW, wlY + 1);

    // Subtle atmospheric horizon glow right behind row 42 (smooth full-sky falloff, zero cutoff seam)
    const [hr, hg, hb] = pal.horizonGlow;
    const glowRad = Math.min(wlY * 0.96, viewW * 0.56);
    const hGlow = bctx.createRadialGradient(
      viewW * 0.5,
      wlY,
      viewW * 0.03,
      viewW * 0.5,
      wlY,
      glowRad
    );
    hGlow.addColorStop(0, `rgba(${hr}, ${hg}, ${hb}, 0.22)`);
    hGlow.addColorStop(0.42, `rgba(${hr}, ${hg}, ${hb}, 0.09)`);
    hGlow.addColorStop(0.76, `rgba(${hr}, ${hg}, ${hb}, 0.025)`);
    hGlow.addColorStop(1, `rgba(${hr}, ${hg}, ${hb}, 0)`);
    bctx.fillStyle = hGlow;
    bctx.fillRect(0, 0, viewW, wlY + 1);

    // Ground base gradient below waterlineRow
    const gGrad = bctx.createLinearGradient(0, wlY, 0, viewH);
    gGrad.addColorStop(0, pal.groundTop);
    gGrad.addColorStop(1, pal.groundBot);
    bctx.fillStyle = gGrad;
    bctx.fillRect(0, wlY, viewW, viewH - wlY);

    bctx.restore();
  }

  function renderStars(city, t, bgReveal, cloudState) {
    if (bgReveal <= 0.01) return;
    const [tr, tg, tb] = city.worldPalette.starTint;
    const wl = city.waterlineRow;
    const cols = city.cols;

    for (let i = 0; i < city.stars.length; i++) {
      const st = city.stars[i];
      const cInt = Math.round(st.col);
      const rInt = Math.round(st.row);
      if (rInt < 0 || rInt >= wl) continue;
      // Do not paint stars over occupied architectural cells
      if (cInt >= 0 && cInt < cols && cellChar[rInt * cols + cInt]) continue;

      // Keep stars clear of the floating Google Cloud silhouette & Seoul's Baekja Moon
      let cloudClear = 1.0;
      if (cloudState) {
        const cx = cloudState.centerCol;
        const cy = (cloudState.topRow + cloudState.bottomRow) * 0.5;
        const rx = (cloudState.rightCol - cloudState.leftCol) * 0.56 + 1.2;
        const ry = (cloudState.bottomRow - cloudState.topRow) * 0.56 + 1.0;
        const nd = Math.hypot((st.col - cx) / rx, (st.row - cy) / ry);
        if (nd < 1.0) {
          cloudClear = 1 - smoothstep(1.0, 0.72, nd) * cloudState.reveal;
        }
      }
      if (city.baekjaMoon) {
        const md = Math.hypot((st.col - city.baekjaMoon.col) / 5.2, (st.row - city.baekjaMoon.row) / 3.4);
        if (md < 1.0) {
          cloudClear *= 1 - smoothstep(1.0, 0.65, md) * bgReveal;
        }
      }
      if (cloudClear <= 0.04) continue;

      const x = originX + st.col * cellW;
      const y = originY + st.row * cellH;
      if (x < -cellW || x > viewW + cellW) continue;

      const tw = 0.62 + 0.38 * Math.sin(t * st.speed + st.phase);
      const alpha = st.baseAlpha * tw * bgReveal * cloudClear;
      const r = clamp(Math.round(tr + (st.warmth - 0.5) * 26), 140, 255);
      const g = clamp(Math.round(tg + (st.warmth - 0.5) * 14), 150, 255);
      const b = clamp(Math.round(tb - (st.warmth - 0.5) * 24), 150, 255);
      drawGlyph(st.ch, x, y, r, g, b, alpha, st.glow && cloudClear > 0.7, 0.55);
    }
  }

  /**
   * Renders Seoul's serene Joseon white-porcelain full moon (백자 달항아리 보름달, #82):
   * soft pearl-ivory (#F4F2EA / #D6DCE8 / #A8B4CC) round 7x4 shaded ASCII full disc
   * with a whisper-soft cool moonlit halo — never bright yellow, never crescent.
   */
  function renderBaekjaMoon(city, t, bgReveal) {
    if (!city.baekjaMoon || bgReveal <= 0.01) return;
    const mc = city.baekjaMoon.col;
    const mr = city.baekjaMoon.row;
    const breath = 0.94 + 0.06 * Math.sin(t * 0.55);

    const cx = originX + mc * cellW + cellW * 0.5;
    const cy = originY + mr * cellH + cellH * 0.5;

    // 1. Whisper-soft porcelain moonlight atmospheric halo
    const haloRad = cellH * 5.4;
    const halo = gctx.createRadialGradient(cx, cy, cellH * 0.6, cx, cy, haloRad);
    halo.addColorStop(0, `rgba(244, 242, 234, ${(0.28 * bgReveal * breath).toFixed(3)})`);
    halo.addColorStop(0.32, `rgba(214, 224, 242, ${(0.14 * bgReveal * breath).toFixed(3)})`);
    halo.addColorStop(0.68, `rgba(148, 174, 218, ${(0.05 * bgReveal * breath).toFixed(3)})`);
    halo.addColorStop(1, "rgba(148, 174, 218, 0)");
    gctx.fillStyle = halo;
    gctx.fillRect(cx - haloRad, cy - haloRad, haloRad * 2, haloRad * 2);

    // Subtle soft glowing porcelain body mist right behind the ASCII moon glyph disc
    const discRad = cellH * 2.35;
    const disc = bctx.createRadialGradient(cx - cellW * 0.3, cy - cellH * 0.25, 1, cx, cy, discRad);
    disc.addColorStop(0, `rgba(244, 242, 234, ${(0.22 * bgReveal).toFixed(3)})`);
    disc.addColorStop(0.65, `rgba(214, 220, 232, ${(0.10 * bgReveal).toFixed(3)})`);
    disc.addColorStop(1, "rgba(168, 180, 204, 0)");
    bctx.fillStyle = disc;
    bctx.fillRect(cx - discRad, cy - discRad, discRad * 2, discRad * 2);

    // 2. Crisp serene 7x4 shaded Joseon Baekja porcelain full moon disc
    // Color codes: p=#F4F2EA (pearl-ivory core), s=#D6DCE8 (misty silver), d=#A8B4CC (soft lunar rim/shade)
    const moonRows = [
      { dy: -1.5, text: " .---. ", codes: " dsssd " },
      { dy: -0.5, text: "(:oOOo:)", codes: "dsppppsd" },
      { dy: 0.5, text: "(:oOo.:)", codes: "dspppssd" },
      { dy: 1.5, text: " '---' ", codes: " dsssd " },
    ];
    const palette = {
      p: [244, 242, 234, 0.94, true],
      s: [214, 220, 232, 0.80, true],
      d: [168, 180, 204, 0.64, false],
    };

    for (let rIdx = 0; rIdx < moonRows.length; rIdx++) {
      const mrSpec = moonRows[rIdx];
      const rowF = mr + mrSpec.dy;
      const startCol = mc - (mrSpec.text.length - 1) * 0.5;
      for (let i = 0; i < mrSpec.text.length; i++) {
        const ch = mrSpec.text[i];
        const code = mrSpec.codes[i];
        if (ch === " " || !palette[code]) continue;
        const [r, g, b, baseA, gl] = palette[code];
        const colF = startCol + i;
        drawGlyph(
          ch,
          originX + colF * cellW,
          originY + rowF * cellH,
          r,
          g,
          b,
          baseA * bgReveal * breath,
          gl,
          0.52,
          code === "p"
        );
      }
    }
  }

  /**
   * Renders Seoul's graceful pair of pale-ivory white Korean cranes (백학 한 쌍 · 십장생, #82)
   * gliding calmly in diagonal tandem formation across the moonlit sky toward the Baekja Moon.
   */
  function renderSeoulCranes(city, t, bgReveal, cloudState) {
    if (city.id !== "seoul" || bgReveal <= 0.04) return;
    const cols = city.cols;
    const wl = city.waterlineRow;

    // 4-phase majestic slow wingbeat frames (5 chars wide: outer wingtip ink-slate + ivory body/wings)
    const frames = [
      { text: "\\~o~/", codes: "tiiit" },
      { text: "~-o-~", codes: "siiis" },
      { text: "/~o~\\", codes: "tiiit" },
      { text: "_-o-_", codes: "siiis" },
    ];
    const craneColors = {
      i: [245, 243, 236, 0.92, true], // pale ivory-white crane plumage (#F5F3EC)
      s: [194, 206, 226, 0.78, false], // soft silver-ivory wing feather
      t: [106, 124, 154, 0.78, false], // delicate Korean ink-tip accent (#5A6B88 lifted for legibility)
    };

    // Tandem pair of white cranes timed so at t=18 they glide cleanly in the open moonlit
    // sky corridor between Namdaemun's roof and the Baekja Full Moon (cols ~57..66, rows 17..21)
    const span = cols + 24;
    const speed = 1.45;
    const cranes = [
      { colOffset: 37.5, baseRow: 18.2, ampRow: 0.75, flapRate: 1.55, phase: 0.0 },
      { colOffset: 31.8, baseRow: 20.6, ampRow: 0.65, flapRate: 1.55, phase: 1.9 },
    ];

    for (let k = 0; k < cranes.length; k++) {
      const cr = cranes[k];
      const centerCol = -12 + modPos(cr.colOffset + t * speed, span);
      const rowF = cr.baseRow + Math.sin(t * 0.42 + cr.phase) * cr.ampRow;

      // Smoothly avoid Google Cloud & Baekja Moon
      let vis = 1.0;
      if (cloudState) {
        const padC = 2.6;
        const padR = 1.6;
        if (
          centerCol >= cloudState.leftCol - padC &&
          centerCol <= cloudState.rightCol + padC &&
          rowF >= cloudState.topRow - padR &&
          rowF <= cloudState.bottomRow + padR
        ) {
          vis *= 1 - 0.88 * cloudState.reveal;
        }
      }
      if (city.baekjaMoon) {
        const md = Math.hypot((centerCol - city.baekjaMoon.col) / 5.5, (rowF - city.baekjaMoon.row) / 3.4);
        if (md < 1.0) vis *= 1 - smoothstep(1.0, 0.65, md);
      }
      if (vis <= 0.05) continue;

      const frameIdx = Math.floor(modPos(t * cr.flapRate + cr.phase, frames.length));
      const frame = frames[frameIdx];
      const startCol = centerCol - 2;
      const occR = Math.round(rowF);

      for (let i = 0; i < frame.text.length; i++) {
        const ch = frame.text[i];
        const colF = startCol + i;
        const occC = Math.round(colF);
        // Stay cleanly behind spires/buildings
        if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
          continue;
        }
        const [r, g, b, baseA, gl] = craneColors[frame.codes[i]];
        drawGlyph(
          ch,
          originX + colF * cellW,
          originY + rowF * cellH,
          r,
          g,
          b,
          baseA * vis * bgReveal,
          gl,
          0.42
        );
      }
    }
  }

  function renderMeteors(city, bgReveal) {
    if (meteors.length === 0) return;
    for (let i = 0; i < meteors.length; i++) {
      const m = meteors[i];
      const visGate = m.userTriggered ? Math.max(bgReveal, 0.92) : bgReveal;
      if (visGate <= 0.05) continue;
      const p = clamp(m.age / m.life, 0, 1);
      const env = Math.sin(p * Math.PI) * visGate;
      const trailGlyphs = ["*", "+", "-", "·", "."];
      for (let k = 0; k < trailGlyphs.length; k++) {
        const tc = m.col - m.vx * (k * 0.018);
        const tr = m.row - m.vy * (k * 0.018);
        const x = originX + tc * cellW;
        const y = originY + tr * cellH;
        const a = env * (1 - k * 0.19);
        drawGlyph(trailGlyphs[k], x, y, 240, 246, 255, a, k < 2, 0.95);
      }
    }
  }

  /**
   * Renders Beijing's crimson-red & imperial-gold ASCII fireworks (rocket ascent ->
   * radial chrysanthemum burst with air drag, gravity droop, and dual-pass bloom).
   */
  function drawSingleFirework(city, fw, age, cloudState) {
    if (age < 0 || age > fw.totalDur) return;
    const cols = city.cols;
    const wl = city.waterlineRow;
    const aspectX = cellH / Math.max(1, cellW); // keep radial chrysanthemum perfectly circular on screen

    const cloudAtten = (colF, rowF) => {
      if (!cloudState) return 1.0;
      const padC = 1.6;
      const padR = 1.2;
      if (
        colF >= cloudState.leftCol - padC &&
        colF <= cloudState.rightCol + padC &&
        rowF >= cloudState.topRow - padR &&
        rowF <= cloudState.bottomRow + padR
      ) {
        return 1 - 0.85 * cloudState.reveal;
      }
      return 1.0;
    };

    const isBuildingBlocked = (colF, rowF) => {
      const occC = Math.round(colF);
      const occR = Math.round(rowF);
      return occR >= 0 && occR < wl && occC >= 0 && occC < cols && Boolean(cellChar[occR * cols + occC]);
    };

    // Phase A: Rocket ascent streak (0 -> 0.42s)
    if (age < fw.ascentDur) {
      const p = clamp(age / fw.ascentDur, 0, 1);
      const ease = 1 - Math.pow(1 - p, 2.2);
      const curCol = fw.startCol + (fw.targetCol - fw.startCol) * ease;
      const curRow = fw.startRow + (fw.targetRow - fw.startRow) * ease;

      const trailGlyphs = ["*", "|", ":", "·"];
      for (let k = 0; k < trailGlyphs.length; k++) {
        const tp = Math.max(0, p - k * 0.08);
        const te = 1 - Math.pow(1 - tp, 2.2);
        const tc = fw.startCol + (fw.targetCol - fw.startCol) * te;
        const tr = fw.startRow + (fw.targetRow - fw.startRow) * te;
        if (tr < 1 || tr >= wl || isBuildingBlocked(tc, tr)) continue;
        const x = originX + tc * cellW;
        const y = originY + tr * cellH;
        const a = (1 - k * 0.22) * cloudAtten(tc, tr);
        if (k === 0) {
          drawGlyph("*", x, y, 255, 240, 184, a, true, 1.0, true);
        } else if (k === 1) {
          drawGlyph("|", x, y, 255, 209, 102, a * 0.9, true, 0.82);
        } else {
          drawGlyph(trailGlyphs[k], x, y, 255, 76, 84, a * 0.78, true, 0.65);
        }
      }
      return;
    }

    // Phase B: Radial chrysanthemum burst (0.42s -> 2.10s)
    const bt = age - fw.ascentDur;
    const bp = clamp(bt / fw.burstDur, 0, 1);
    const fadeOut = 1 - smoothstep(0.56, 1.0, bp);
    if (fadeOut <= 0.02) return;

    // Incandescent core flash & warm crimson-gold radial bloom at burst center
    const centerAtten = cloudAtten(fw.targetCol, fw.targetRow);
    if (bp < 0.36 && centerAtten > 0.1) {
      const flash = (1 - bp / 0.36) * centerAtten;
      const cx = originX + fw.targetCol * cellW + cellW * 0.5;
      const cy = originY + fw.targetRow * cellH + cellH * 0.5;
      const rad = cellH * (2.6 + bp * 4.5);
      const aura = gctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
      aura.addColorStop(0, `rgba(255, 240, 184, ${(flash * 0.62).toFixed(3)})`);
      aura.addColorStop(0.45, `rgba(255, 59, 71, ${(flash * 0.34).toFixed(3)})`);
      aura.addColorStop(1, "rgba(255, 59, 71, 0)");
      gctx.fillStyle = aura;
      gctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);

      if (bp < 0.18 && !isBuildingBlocked(fw.targetCol, fw.targetRow)) {
        drawGlyph(
          "*",
          originX + fw.targetCol * cellW,
          originY + fw.targetRow * cellH,
          255,
          244,
          202,
          flash,
          true,
          1.0,
          true
        );
      }
    }

    // Crisp ASCII chrysanthemum petals with exponential drag & gentle gravity droop
    const gravity = 3.1;
    const ch =
      bp < 0.24 ? "*" : bp < 0.50 ? "+" : bp < 0.72 ? ":" : bp < 0.88 ? "·" : ".";
    const tailCh = bp < 0.48 ? ":" : "·";

    for (let i = 0; i < fw.sparks.length; i++) {
      const sp = fw.sparks[i];
      const dragTerm = (1 - Math.exp(-sp.drag * bt)) / sp.drag;
      const sc = fw.targetCol + sp.vx * dragTerm * aspectX;
      const sr = fw.targetRow + sp.vy * dragTerm + 0.5 * gravity * bt * bt;

      // Subtle trailing ember 0.085s behind each spark
      if (bt > 0.10 && bp < 0.78) {
        const btPrev = Math.max(0, bt - 0.085);
        const dragPrev = (1 - Math.exp(-sp.drag * btPrev)) / sp.drag;
        const tc = fw.targetCol + sp.vx * dragPrev * aspectX;
        const tr = fw.targetRow + sp.vy * dragPrev + 0.5 * gravity * btPrev * btPrev;
        if (tr >= 1 && tr < wl && !isBuildingBlocked(tc, tr)) {
          const ta = fadeOut * 0.44 * cloudAtten(tc, tr);
          if (ta > 0.03) {
            drawGlyph(tailCh, originX + tc * cellW, originY + tr * cellH, sp.r, sp.g, sp.b, ta, true, 0.52);
          }
        }
      }

      if (sr < 1 || sr >= wl || isBuildingBlocked(sc, sr)) continue;
      const x = originX + sc * cellW;
      const y = originY + sr * cellH;
      if (x < -cellW * 2 || x > viewW + cellW * 2) continue;

      const twinkle = bp > 0.42 ? 0.68 + 0.32 * Math.sin(bt * 18 + sp.twinklePhase) : 1.0;
      const a = clamp(fadeOut * twinkle * cloudAtten(sc, sr), 0, 0.96);
      drawGlyph(ch, x, y, sp.r, sp.g, sp.b, a, bp < 0.82, bp < 0.5 ? 0.98 : 0.72, bp < 0.45);
    }
  }

  /**
   * Modulates occupied Burj Khalifa facade cells (cols 40..52, rows 5..41) with
   * Dubai's iconic ascending luxury LED show (champagne-gold / electric-cyan /
   * sapphire-violet + Google 4-color celebration wave + white-gold setback strobes)
   * and click-triggered golden-white LED Finale Surge (#85).
   */
  function applyDubaiLedFacadeShow(city, t) {
    if (!isDubaiTowerReady(city, t)) return;
    const ledShowReveal = smoothstep(city.burjReadyTime, city.burjReadyTime + 1.4, t);
    if (ledShowReveal <= 0.01) return;
    const hasSurge = dubaiSurgeAge >= 0 && dubaiSurgeAge <= 1.45;

    const cols = city.cols;
    const luxuryPalette = [
      [255, 214, 112], // champagne-gold (#FFD670)
      [76, 230, 255],  // electric cyan (#4CE6FF)
      [129, 140, 248], // sapphire-violet (#818CF8)
    ];
    const googlePalette = [
      [234, 67, 53],   // Google Red (#EA4335)
      [251, 188, 4],   // Google Yellow (#FBBC04)
      [52, 168, 83],   // Google Green (#34A853)
      [66, 133, 244],  // Google Blue (#4285F4)
    ];

    // Smoothly alternate between luxury palette & Google 4-color celebration wave
    const googleMix = smoothstep(0.25, 0.78, Math.sin(t * 0.36 - 0.6));
    const surgeRow = hasSurge ? 42 - (Math.min(1.3, dubaiSurgeAge) / 1.3) * 38 : -99;

    const sampleCycle = (pal, u) => {
      const n = pal.length;
      const pos = modPos(u, n);
      const i0 = Math.floor(pos);
      const i1 = (i0 + 1) % n;
      const f = pos - i0;
      return [
        pal[i0][0] + (pal[i1][0] - pal[i0][0]) * f,
        pal[i0][1] + (pal[i1][1] - pal[i0][1]) * f,
        pal[i0][2] + (pal[i1][2] - pal[i0][2]) * f,
      ];
    };

    for (let r = 5; r <= 41; r++) {
      const hNorm = (41 - r) / 36;
      const isSetbackRow = r === 13 || r === 21 || r === 29 || r === 36;
      const luxRgb = sampleCycle(luxuryPalette, hNorm * 3.4 - t * 0.92);
      const gooRgb = sampleCycle(googlePalette, hNorm * 4.2 - t * 1.15);
      const lr = luxRgb[0] * (1 - googleMix) + gooRgb[0] * googleMix;
      const lg = luxRgb[1] * (1 - googleMix) + gooRgb[1] * googleMix;
      const lb = luxRgb[2] * (1 - googleMix) + gooRgb[2] * googleMix;

      // Ascending shimmering ribbon envelope so Burj Khalifa reads as live vertical light waves
      const ribbon = 0.5 + 0.5 * Math.sin(hNorm * 10.5 - t * 2.8);
      const ribbonBoost = smoothstep(0.28, 0.92, ribbon);

      const surgeDist = hasSurge ? Math.abs(r - surgeRow) : 99;
      const surgeStrength = hasSurge && surgeDist < 4.2 ? 1 - surgeDist / 4.2 : 0;

      const rowBase = r * cols;
      for (let c = 40; c <= 52; c++) {
        const idx = rowBase + c;
        if (!cellChar[idx]) continue;

        let rr = cellR[idx];
        let gg = cellG[idx];
        let bb = cellB[idx];

        if (ledShowReveal > 0.01) {
          const blend = ledShowReveal * (0.34 + 0.44 * ribbonBoost);
          rr = rr * (1 - blend) + lr * blend;
          gg = gg * (1 - blend) + lg * blend;
          bb = bb * (1 - blend) + lb * blend;
          if (ribbonBoost > 0.64) cellGlow[idx] = 1;

          // Delicate crisp white-gold sparkle strobes along Burj Khalifa setback tiers
          if (isSetbackRow) {
            const strobe = Math.pow(0.5 + 0.5 * Math.sin(t * 4.4 + c * 1.7 + r * 0.6), 5);
            if (strobe > 0.35) {
              const sMix = strobe * ledShowReveal * 0.85;
              rr = rr * (1 - sMix) + 255 * sMix;
              gg = gg * (1 - sMix) + 248 * sMix;
              bb = bb * (1 - sMix) + 220 * sMix;
              cellGlow[idx] = 1;
            }
          }
        }

        // Click-triggered Burj Khalifa LED Finale Surge (molten golden-white wave racing up)
        if (surgeStrength > 0.02) {
          const sMix = Math.pow(surgeStrength, 0.8) * 0.92;
          rr = rr * (1 - sMix) + 255 * sMix;
          gg = gg * (1 - sMix) + 244 * sMix;
          bb = bb * (1 - sMix) + 206 * sMix;
          cellGlow[idx] = 1;
        }

        cellR[idx] = clamp(Math.round(rr), 0, 255);
        cellG[idx] = clamp(Math.round(gg), 0, 255);
        cellB[idx] = clamp(Math.round(bb), 0, 255);
      }
    }
  }

  /**
   * Renders 5 sleek translucent diagonal sky laser beams fanning symmetrically
   * from Burj Khalifa's upper spire/setbacks into the Arabian night sky (drawn
   * strictly BEFORE renderCloud so lasers never obscure Google Cloud).
   */
  function renderDubaiLaserShow(city, t) {
    if (!isDubaiTowerReady(city, t)) return;
    const ledShowReveal = smoothstep(city.burjReadyTime, city.burjReadyTime + 1.4, t);
    if (ledShowReveal <= 0.01) return;
    const hasSurge = dubaiSurgeAge >= 0 && dubaiSurgeAge <= 1.45;
    const surgeBoost = hasSurge ? Math.sin(clamp(dubaiSurgeAge / 1.45, 0, 1) * Math.PI) * 0.22 : 0;
    const master = clamp(ledShowReveal + surgeBoost * 0.6 * ledShowReveal, 0, 1);
    if (master <= 0.01) return;

    const surgeIntensity = 1 + surgeBoost * 2.2;
    const swayA = Math.sin(t * 0.54) * 0.13;
    const swayB = Math.sin(t * 0.42 + 1.25) * 0.11;
    const swayCrown = Math.sin(t * 0.48 + 0.5) * 0.18;

    // 5 sleek luxury laser beams originating from Burj Khalifa's central spire axis (col 46)
    const beams = [
      // Crown vertical searchlight
      { row: 5.5, ang: -Math.PI * 0.5 + swayCrown, len: viewH * 0.45, spread: 16, rgb: [255, 240, 194], alpha: 0.24 },
      // Upper left & right electric cyan beams (row 6.5)
      { row: 6.5, ang: -Math.PI * 0.82 + swayA, len: viewW * 0.42, spread: 24, rgb: [103, 232, 249], alpha: 0.26 },
      { row: 6.5, ang: -Math.PI * 0.18 - swayA, len: viewW * 0.42, spread: 24, rgb: [103, 232, 249], alpha: 0.26 },
      // Mid setback left & right champagne-gold beams (row 13.5)
      { row: 13.5, ang: -Math.PI * 0.89 + swayB, len: viewW * 0.46, spread: 26, rgb: [255, 209, 102], alpha: 0.24 },
      { row: 13.5, ang: -Math.PI * 0.11 - swayB, len: viewW * 0.46, spread: 26, rgb: [255, 209, 102], alpha: 0.24 },
    ];

    const spireX = originX + 46 * cellW + cellW * 0.5;

    bctx.save();
    gctx.save();
    bctx.globalCompositeOperation = "lighter";
    gctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < beams.length; i++) {
      const bm = beams[i];
      const ox = spireX;
      const oy = originY + bm.row * cellH + cellH * 0.5;
      const dx = Math.cos(bm.ang);
      const dy = Math.sin(bm.ang);
      const ex = ox + dx * bm.len;
      const ey = oy + dy * bm.len;
      const px = -dy;
      const py = dx;
      const [r, g, b] = bm.rgb;
      const a0 = clamp(bm.alpha * master * surgeIntensity, 0, 0.44);

      // Soft tapered translucent laser beam cone on base canvas
      const coneGrad = bctx.createLinearGradient(ox, oy, ex, ey);
      coneGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a0.toFixed(3)})`);
      coneGrad.addColorStop(0.32, `rgba(${r}, ${g}, ${b}, ${(a0 * 0.48).toFixed(3)})`);
      coneGrad.addColorStop(0.72, `rgba(${r}, ${g}, ${b}, ${(a0 * 0.14).toFixed(3)})`);
      coneGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      bctx.fillStyle = coneGrad;
      bctx.beginPath();
      bctx.moveTo(ox + px * 1.4, oy + py * 1.4);
      bctx.lineTo(ex + px * bm.spread, ey + py * bm.spread);
      bctx.lineTo(ex - px * bm.spread, ey - py * bm.spread);
      bctx.lineTo(ox - px * 1.4, oy - py * 1.4);
      bctx.closePath();
      bctx.fill();

      // Razor-thin luminous laser core filament on glow canvas for optical sharpness
      const lineGrad = gctx.createLinearGradient(ox, oy, ex, ey);
      lineGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${(a0 * 1.35).toFixed(3)})`);
      lineGrad.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${(a0 * 0.55).toFixed(3)})`);
      lineGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      gctx.strokeStyle = lineGrad;
      gctx.lineWidth = 1.6;
      gctx.beginPath();
      gctx.moveTo(ox, oy);
      gctx.lineTo(ex, ey);
      gctx.stroke();
    }

    // Crown starflash at (col 46, row 4) when click Finale Surge reaches the pinnacle!
    if (hasSurge && dubaiSurgeAge >= 0.95 && dubaiSurgeAge <= 1.45) {
      const sp = 1 - Math.abs((dubaiSurgeAge - 1.20) / 0.25);
      const flashA = clamp(sp, 0, 1);
      const fx = spireX;
      const fy = originY + 4 * cellH + cellH * 0.5;
      const fRad = cellH * (2.6 + flashA * 2.2);
      const fGrad = gctx.createRadialGradient(fx, fy, 1, fx, fy, fRad);
      fGrad.addColorStop(0, `rgba(255, 250, 224, ${(flashA * 0.92).toFixed(3)})`);
      fGrad.addColorStop(0.45, `rgba(255, 214, 112, ${(flashA * 0.45).toFixed(3)})`);
      fGrad.addColorStop(1, "rgba(255, 214, 112, 0)");
      gctx.fillStyle = fGrad;
      gctx.fillRect(fx - fRad, fy - fRad, fRad * 2, fRad * 2);
    }

    bctx.restore();
    gctx.restore();
  }

  function renderFireworks(city, t, cloudState) {
    if (city.id !== "beijing") return;
    // 1. Deterministic Beijing Act 3 showcase bursts (visible at ?city=beijing&t=18 and live playback)
    for (let i = 0; i < BEIJING_SHOWCASE_FIREWORKS.length; i++) {
      const entry = BEIJING_SHOWCASE_FIREWORKS[i];
      const age = t - entry.launchT;
      if (age >= 0 && age <= entry.spec.totalDur) {
        drawSingleFirework(city, entry.spec, age, cloudState);
      }
    }
    // 2. Interactive click & periodic auto-fireworks
    for (let i = 0; i < fireworks.length; i++) {
      const fw = fireworks[i];
      drawSingleFirework(city, fw, fw.age, cloudState);
    }
  }

  /**
   * Renders Seoul's restrained silver & pale champagne-gold Han River click fireworks
   * blooming sequentially into the 9 phrases of the Hunminjeongeum Eonhae Preface (#92/#93).
   */
  function renderSeoulFireworks(city, t) {
    if (city.id !== "seoul" || seoulFireworks.length === 0) return;
    const cols = city.cols;
    const wl = city.waterlineRow;
    const aspectX = cellH / Math.max(1, cellW);

    for (let fIdx = 0; fIdx < seoulFireworks.length; fIdx++) {
      const fw = seoulFireworks[fIdx];
      const age = fw.age;
      if (age < 0 || age > fw.totalDur) continue;

      // Phase A: Slender pearl-silver & pale-gold rocket ascent (0 -> 0.44s)
      if (age < fw.ascentDur) {
        const p = clamp(age / fw.ascentDur, 0, 1);
        const trailGlyphs = ["*", "|", ":", "·"];
        for (let k = 0; k < trailGlyphs.length; k++) {
          const tp = Math.max(0, p - k * 0.085);
          const te = 1 - Math.pow(1 - tp, 2.2);
          const tc = fw.startCol + (fw.targetCol - fw.startCol) * te;
          const tr = fw.startRow + (fw.targetRow - fw.startRow) * te;
          const occC = Math.round(tc);
          const occR = Math.round(tr);
          if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
            continue;
          }
          const x = originX + tc * cellW;
          const y = originY + tr * cellH;
          const a = 0.92 * (1 - k * 0.22);
          if (k === 0) {
            drawGlyph("*", x, y, 248, 245, 232, a, true, 0.95, true);
          } else {
            drawGlyph(trailGlyphs[k], x, y, 238, 212, 148, a * 0.85, true, 0.65);
          }
        }
        continue;
      }

      // Phase B: Restrained silver-gold starlight bloom + floating Hunminjeongeum preface line
      const bt = age - fw.ascentDur;

      // 1. Delicate pearl-silver, champagne-gold & celadon starlight sparks (0 -> 1.90s)
      if (bt <= fw.sparkDur) {
        const bp = clamp(bt / fw.sparkDur, 0, 1);
        const fadeOut = 1 - smoothstep(0.52, 1.0, bp);

        // Soft moonlit pearl-gold bloom aura at burst heart
        if (bp < 0.42) {
          const flash = 1 - bp / 0.42;
          const cx = originX + fw.targetCol * cellW + cellW * 0.5;
          const cy = originY + fw.targetRow * cellH + cellH * 0.5;
          const rad = cellH * (2.4 + bp * 4.0);
          const aura = gctx.createRadialGradient(cx, cy, 1, cx, cy, rad);
          aura.addColorStop(0, `rgba(246, 232, 186, ${(flash * 0.48).toFixed(3)})`);
          aura.addColorStop(0.5, `rgba(218, 234, 252, ${(flash * 0.22).toFixed(3)})`);
          aura.addColorStop(1, "rgba(218, 234, 252, 0)");
          gctx.fillStyle = aura;
          gctx.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
        }

        const gravity = 2.0;
        const ch = bp < 0.25 ? "*" : bp < 0.52 ? "+" : bp < 0.74 ? ":" : bp < 0.90 ? "·" : ".";
        for (let i = 0; i < fw.sparks.length; i++) {
          const sp = fw.sparks[i];
          const dragTerm = (1 - Math.exp(-sp.drag * bt)) / sp.drag;
          const sc = fw.targetCol + sp.vx * dragTerm * aspectX;
          const sr = fw.targetRow + sp.vy * dragTerm + 0.5 * gravity * bt * bt;
          if (sr < 1 || sr >= wl) continue;
          const occC = Math.round(sc);
          const occR = Math.round(sr);
          if (occC >= 0 && occC < cols && cellChar[occR * cols + occC]) continue;
          const x = originX + sc * cellW;
          const y = originY + sr * cellH;
          if (x < -cellW * 2 || x > viewW + cellW * 2) continue;
          const tw = bp > 0.35 ? 0.72 + 0.28 * Math.sin(bt * 14 + sp.twinklePhase) : 1.0;
          const a = clamp(fadeOut * tw * 0.88, 0, 0.92);
          drawGlyph(ch, x, y, sp.r, sp.g, sp.b, a, bp < 0.78, 0.76, bp < 0.35);
        }
      }

      // 2. Poetic floating Hunminjeongeum phrase (0 -> 3.20s, drifting gently upward & dissolving)
      if (bt <= fw.phraseDur) {
        const glyphs = fw.glyphs;
        const n = glyphs.length;
        const driftRow = fw.targetRow - bt * 0.62;
        const baseY = originY + driftRow * cellH + cellH * 0.54;

        bctx.font = hunminFont;
        gctx.font = hunminFont;

        for (let i = 0; i < n; i++) {
          const gl = glyphs[i];
          if (gl.ch === " ") continue;
          const stagger = (i / Math.max(1, n - 1)) * 0.36;
          const localIn = smoothstep(stagger, stagger + 0.34, bt);
          if (localIn <= 0.01) continue;

          const dissolveStart = 2.15 + gl.seed * 0.25;
          const localOut = 1 - smoothstep(dissolveStart, fw.phraseDur, bt);
          if (localOut <= 0.01) continue;

          const shimmer = 0.88 + 0.12 * Math.sin(t * 3.2 + i * 0.65);
          const alpha = clamp(localIn * localOut * shimmer * 0.95, 0, 0.96);

          const gx = originX + (fw.targetCol + gl.xOff) * cellW + cellW * 0.5;
          const floatOffset = Math.sin(bt * 1.6 + i * 0.45) * cellH * 0.10;
          const gy = baseY + floatOffset - (1 - localOut) * cellH * 0.45;

          // Subtle pale champagne-gold -> moonlit pearl-ivory shimmer across the calligraphic line
          const goldBlend = 0.5 + 0.5 * Math.sin(i * 0.55 - bt * 1.4);
          const rr = Math.round(240 + 10 * goldBlend);
          const rg = Math.round(242 - 14 * goldBlend);
          const rb = Math.round(252 - 72 * goldBlend);

          bctx.fillStyle = `rgba(${rr}, ${rg}, ${rb}, ${alpha.toFixed(3)})`;
          bctx.fillText(gl.ch, gx, gy);
          gctx.fillStyle = `rgba(${rr}, ${rg}, ${rb}, ${(alpha * 0.64).toFixed(3)})`;
          gctx.fillText(gl.ch, gx, gy);

          // Whisper-soft dissolving stardust mote during final fade-out
          if (localOut < 0.58 && localOut > 0.08) {
            const dustA = localOut * 0.62;
            const dustY = gy - (0.58 - localOut) * cellH * 1.4;
            drawGlyph("·", gx - cellW * 0.5, dustY - cellH * 0.5, 244, 224, 168, dustA, true, 0.5);
            bctx.font = hunminFont;
            gctx.font = hunminFont;
          }
        }
      }
    }
  }

  /**
   * Computes current floating cloud anchor box (for rendering + lantern avoidance + water shimmer).
   */
  function getCloudState(city, t, cloudReveal) {
    if (!cloudAscii || cloudReveal <= 0.008) return null;
    const cf = city.cloudFloat;
    const drift = Math.sin(t * 0.24) * cf.driftAmp;
    const bob = Math.sin(t * 0.42 + 0.8) * 0.28;
    const leftCol = cf.centerCol + drift - cloudAscii.spanCols * 0.5;
    const topRow = cf.row + bob;
    return {
      leftCol,
      topRow,
      rightCol: leftCol + cloudAscii.spanCols,
      bottomRow: topRow + cloudAscii.spanRows,
      centerCol: leftCol + cloudAscii.spanCols * 0.5,
      reveal: cloudReveal,
    };
  }

  function renderCloud(city, t, cloudState) {
    if (!cloudState || !cloudAscii) return;
    const cols = city.cols;
    const wl = city.waterlineRow;
    const { leftCol, topRow, reveal } = cloudState;

    // Crisp uniform translucent opacity (0.86 * reveal, zero blurry/dim fringe letters)
    const uniformAlpha = clamp(reveal * 0.86, 0, 0.88);
    const glowAlpha = clamp(uniformAlpha * 0.52, 0, 0.52);
    const subW = cellW * CLOUD_SUB_W;
    const subH = cellH * CLOUD_SUB_H;
    const cells = cloudAscii.cells;

    bctx.font = cloudFont;
    gctx.font = cloudFont;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      const colF = leftCol + cell.col * CLOUD_SUB_W;
      const rowF = topRow + cell.row * CLOUD_SUB_H;
      const occC = Math.round(colF);
      const occR = Math.round(rowF);

      // Foreground spires (Burj Khalifa, Taipei 101, N Seoul Tower) always rise cleanly in front
      if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
        continue;
      }

      const cx = originX + colF * cellW + subW * 0.5;
      const cy = originY + rowF * cellH + subH * 0.54;
      bctx.fillStyle = `rgba(${cell.r}, ${cell.g}, ${cell.b}, ${uniformAlpha.toFixed(3)})`;
      bctx.fillText(cell.ch, cx, cy);
      gctx.fillStyle = `rgba(${cell.r}, ${cell.g}, ${cell.b}, ${glowAlpha.toFixed(3)})`;
      gctx.fillText(cell.ch, cx, cy);
    }
  }

  function renderAtmosphere(city, t, bgReveal, cloudState) {
    const cols = city.cols;
    const wl = city.waterlineRow;
    const atm = city.atmosphere;
    if (bgReveal <= 0.02 && !(atm === "lanterns" && userLanterns.length > 0)) return;

    if (atm === "snow") {
      // Quiet, sparse winter snow drifting gently over Seoul
      for (let i = 0; i < city.particles.length; i++) {
        const p = city.particles[i];
        const rowF = modPos(p.row + t * p.fallSpeed, wl - 0.5);
        const colF = p.col + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
        const occC = Math.round(colF);
        const occR = Math.round(rowF);
        if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
          continue;
        }
        if (
          city.baekjaMoon &&
          Math.hypot((colF - city.baekjaMoon.col) / 4.8, (rowF - city.baekjaMoon.row) / 3.0) < 1.0
        ) {
          continue;
        }
        const x = originX + colF * cellW;
        const y = originY + rowF * cellH;
        if (x < -cellW || x > viewW + cellW) continue;
        const fadeEdge = smoothstep(0, 2.2, rowF) * smoothstep(wl, wl - 3.5, rowF);
        drawGlyph(p.ch, x, y, 206, 224, 248, p.alpha * fadeEdge * bgReveal, false);
      }
      return;
    }

    if (atm === "breeze") {
      // Delicate golden desert breeze motes sweeping horizontally across Dubai twilight
      const span = cols + 72;
      for (let i = 0; i < city.particles.length; i++) {
        const p = city.particles[i];
        const colF = -36 + modPos(p.col + 36 + t * p.speedX, span);
        const rowF = p.row + Math.sin(t * p.waveFreq + p.phase) * p.waveAmp;
        const occC = Math.round(colF);
        const occR = Math.round(rowF);
        if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
          continue;
        }
        if (
          city.baekjaMoon &&
          Math.hypot((colF - city.baekjaMoon.col) / 4.8, (rowF - city.baekjaMoon.row) / 3.0) < 1.0
        ) {
          continue;
        }
        const x = originX + colF * cellW;
        const y = originY + rowF * cellH;
        if (x < -cellW || x > viewW + cellW) continue;
        const pulse = 0.65 + 0.35 * Math.sin(t * 1.4 + p.phase);
        drawGlyph(p.ch, x, y, 228, 182, 118, p.alpha * pulse * bgReveal, p.ch === "·", 0.45);
      }
      return;
    }

    if (atm === "fireflies") {
      // Subtle tropical light motes hovering in Singapore's warm evening bay air
      for (let i = 0; i < city.particles.length; i++) {
        const p = city.particles[i];
        const colF = p.col + Math.sin(t * p.freqX + p.phase) * p.driftX;
        const rowF = p.row + Math.cos(t * p.freqY + p.phase * 1.3) * p.driftY;
        const occC = Math.round(colF);
        const occR = Math.round(rowF);
        if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
          continue;
        }
        if (
          city.baekjaMoon &&
          Math.hypot((colF - city.baekjaMoon.col) / 4.8, (rowF - city.baekjaMoon.row) / 3.0) < 1.0
        ) {
          continue;
        }
        const x = originX + colF * cellW;
        const y = originY + rowF * cellH;
        if (x < -cellW || x > viewW + cellW) continue;
        const pulse = Math.pow(0.5 + 0.5 * Math.sin(t * p.pulseFreq + p.phase), 1.7);
        const a = p.alpha * (0.25 + 0.75 * pulse) * bgReveal;
        if (p.mint) {
          drawGlyph("·", x, y, 124, 240, 212, a, pulse > 0.55, 0.72);
        } else {
          drawGlyph("·", x, y, 255, 226, 152, a, pulse > 0.55, 0.72);
        }
      }
      return;
    }

    if (atm === "lanterns") {
      // Sparse, delicate glowing Pingxi sky lanterns (천등) rising gently in Taiwan's plum-indigo sky
      // + interactive user-released Pingxi sky lanterns on click (even when bgReveal === 0)
      const computeCloudAvoid = (colF, rowF) => {
        if (!cloudState) return 1.0;
        const padC = 2.6;
        const padR = 2.0;
        const inC = colF >= cloudState.leftCol - padC && colF <= cloudState.rightCol + padC;
        const inR = rowF >= cloudState.topRow - padR && rowF <= cloudState.bottomRow + padR;
        if (!inC || !inR) return 1.0;
        const dx = Math.min(
          colF - (cloudState.leftCol - padC),
          cloudState.rightCol + padC - colF
        );
        const dy = Math.min(
          rowF - (cloudState.topRow - padR),
          cloudState.bottomRow + padR - rowF
        );
        const margin = Math.min(dx, dy);
        return 1 - smoothstep(0, 1.8, margin) * cloudState.reveal;
      };

      const drawLantern = (colF, rowF, scale, a) => {
        if (a <= 0.03) return;
        const x = originX + colF * cellW;
        const y = originY + rowF * cellH;
        if (x < -cellW * 2 || x > viewW + cellW * 2) return;

        // Subtle warm golden Pingxi glow halo
        const gx = x + cellW * 0.5;
        const gy = y + cellH * 0.52;
        const rad = cellH * (1.2 + 0.35 * scale);
        const aura = gctx.createRadialGradient(gx, gy, 0.5, gx, gy, rad);
        aura.addColorStop(0, `rgba(255, 206, 118, ${(a * 0.55).toFixed(3)})`);
        aura.addColorStop(0.5, `rgba(244, 152, 74, ${(a * 0.22).toFixed(3)})`);
        aura.addColorStop(1, "rgba(244, 152, 74, 0)");
        gctx.fillStyle = aura;
        gctx.fillRect(gx - rad, gy - rad, rad * 2, rad * 2);

        // Delicate lantern body + tiny warm flame ember below
        drawGlyph("o", x, y, 255, 224, 156, clamp(a, 0, 0.94), true, 0.88);
        if (rowF + 0.85 < wl - 1.5) {
          drawGlyph(".", x, y + cellH * 0.68, 240, 162, 82, a * 0.65, true, 0.55);
        }
      };

      // 1. Ambient Pingxi sky lanterns (fade in with Act 2 bgReveal)
      if (bgReveal > 0.02) {
        const skySpan = wl - 4;
        for (let i = 0; i < city.particles.length; i++) {
          const p = city.particles[i];
          const rowF = 2.0 + modPos(p.baseRow - 2.0 - t * p.riseSpeed, skySpan);
          const colF = p.baseCol + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
          const occC = Math.round(colF);
          const occR = Math.round(rowF);

          // Keep strictly clear of buildings (with 1-cell margin)
          let blocked = false;
          if (occR >= 0 && occR < wl && occC >= 0 && occC < cols) {
            for (let dr = -1; dr <= 1 && !blocked; dr++) {
              const rr = occR + dr;
              if (rr < 0 || rr >= wl) continue;
              for (let dc = -1; dc <= 1; dc++) {
                const cc = occC + dc;
                if (cc >= 0 && cc < cols && cellChar[rr * cols + cc]) {
                  blocked = true;
                  break;
                }
              }
            }
          }
          if (blocked) continue;

          const cloudAvoid = computeCloudAvoid(colF, rowF);
          if (cloudAvoid <= 0.04) continue;

          const vFade = smoothstep(1.8, 5.2, rowF) * smoothstep(wl - 1.5, wl - 6.0, rowF);
          const flicker = 0.84 + 0.16 * Math.sin(t * p.flickerFreq + p.phase);
          const a = 0.78 * p.scale * vFade * flicker * cloudAvoid * bgReveal;
          drawLantern(colF, rowF, p.scale, a);
        }
      }

      // 2. Interactive user-released Pingxi sky lanterns (work at any time, even bgReveal === 0)
      for (let i = 0; i < userLanterns.length; i++) {
        const ln = userLanterns[i];
        const colF = ln.baseCol + Math.sin(ln.age * ln.swayFreq + ln.phase) * ln.swayAmp;
        const rowF = ln.row;
        const cloudAvoid = computeCloudAvoid(colF, rowF);
        if (cloudAvoid <= 0.04) continue;

        const bloomIn = smoothstep(0, 0.35, ln.age);
        const topFade = smoothstep(1.2, 4.2, rowF);
        const flicker = 0.86 + 0.14 * Math.sin(t * ln.flickerFreq + ln.phase);
        const a = 0.88 * Math.min(1.05, ln.scale) * bloomIn * topFade * flicker * cloudAvoid;
        drawLantern(colF, rowF, ln.scale, a);
      }
      return;
    }

    if (atm === "embers") {
      // Subtle drifting warm gold-crimson imperial light motes in Beijing dusk sky
      const skySpan = wl - 3;
      const colSpan = cols + 52;
      for (let i = 0; i < city.particles.length; i++) {
        const p = city.particles[i];
        const rowF = 1.5 + modPos(p.baseRow - 1.5 - t * p.riseSpeed, skySpan);
        const colF =
          -26 +
          modPos(
            p.baseCol + 26 + t * p.driftX + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp,
            colSpan
          );
        const occC = Math.round(colF);
        const occR = Math.round(rowF);
        if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
          continue;
        }
        if (
          cloudState &&
          colF >= cloudState.leftCol - 1.2 &&
          colF <= cloudState.rightCol + 1.2 &&
          rowF >= cloudState.topRow - 1.0 &&
          rowF <= cloudState.bottomRow + 1.0
        ) {
          continue;
        }
        const x = originX + colF * cellW;
        const y = originY + rowF * cellH;
        if (x < -cellW || x > viewW + cellW) continue;
        const vFade = smoothstep(1.5, 4.5, rowF) * smoothstep(wl - 1.0, wl - 4.5, rowF);
        const pulse = 0.52 + 0.48 * Math.sin(t * p.pulseFreq + p.phase);
        const a = p.alpha * vFade * pulse * bgReveal;
        if (p.crimson) {
          drawGlyph(p.ch, x, y, 255, 128, 96, a, pulse > 0.72, 0.62);
        } else {
          drawGlyph(p.ch, x, y, 255, 210, 126, a, pulse > 0.72, 0.62);
        }
      }
      return;
    }

    if (atm === "petals") {
      // Warm marigold-gold, saffron & magenta-rose Diwali light motes/blossoms for Bangalore
      const skySpan = wl - 4;
      for (let i = 0; i < city.particles.length; i++) {
        const p = city.particles[i];
        const rowF = 2.0 + modPos(p.baseRow - 2.0 + t * p.driftSpeedY, skySpan);
        const colF = p.baseCol + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp;
        const occC = Math.round(colF);
        const occR = Math.round(rowF);
        if (occR >= 0 && occR < wl && occC >= 0 && occC < cols && cellChar[occR * cols + occC]) {
          continue;
        }
        if (
          cloudState &&
          colF >= cloudState.leftCol - 1.2 &&
          colF <= cloudState.rightCol + 1.2 &&
          rowF >= cloudState.topRow - 1.0 &&
          rowF <= cloudState.bottomRow + 1.0
        ) {
          continue;
        }
        const x = originX + colF * cellW;
        const y = originY + rowF * cellH;
        if (x < -cellW || x > viewW + cellW) continue;
        const vFade = smoothstep(2.0, 5.0, rowF) * smoothstep(wl - 1.5, wl - 4.5, rowF);
        const pulse = Math.pow(0.5 + 0.5 * Math.sin(t * p.pulseFreq + p.phase), 1.35);
        const a = p.alpha * (0.36 + 0.64 * pulse) * vFade * bgReveal;
        if (p.tone === 0) {
          // Marigold-gold (#FFB347)
          drawGlyph(p.ch, x, y, 255, 198, 96, a, pulse > 0.52, 0.72);
        } else if (p.tone === 1) {
          // Warm saffron (#FF7A3D)
          drawGlyph(p.ch, x, y, 255, 132, 68, a, pulse > 0.55, 0.70);
        } else {
          // Magenta-rose (#F472B6)
          drawGlyph(p.ch, x, y, 244, 114, 182, a, pulse > 0.55, 0.70);
        }
      }
    }
  }

  /**
   * Renders Seoul's quiet moonlit granite 박석 courtyard with a single subtle
   * warm pale-gold candlelight spill directly beneath Namdaemun's central arch.
   */
  function renderSeoulPlaza(city, t, bgReveal) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;
    const archC = city.archCenterCol;
    const archHalf = city.archHalfSpan;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const depthFade = (1 - depthNorm * 0.72) * bgReveal;
      if (depthFade <= 0.02) continue;
      const y = originY + r * cellH;

      // Subtle threshold stone seam on row 43
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const inCore = c >= 0 && c < cols;
          const distArch = Math.abs(c - archC);
          const inArch = distArch <= archHalf + 0.8;
          const x = originX + c * cellW;
          if (inArch) {
            const k = 1 - distArch / (archHalf + 1.2);
            const warmBreath = 0.88 + 0.12 * Math.sin(t * 1.15 + c * 0.25);
            const a = (0.36 + 0.34 * k) * warmBreath * bgReveal;
            drawGlyph(c % 3 === 0 ? "=" : "-", x, y, 223, 190, 122, a, k > 0.35, 0.52);
          } else {
            const a = (inCore ? 0.34 : 0.20) * bgReveal;
            drawGlyph(c % 6 === 0 ? "·" : "-", x, y, 64, 86, 124, a, false);
          }
        }
        continue;
      }

      // Staggered horizontal granite 박석 flagstone courses (NO diagonal sci-fi grid!)
      const isJointRow = depth % 3 === 0;
      const brickShift = Math.floor(depth / 3) % 2 === 0 ? 0 : 4;

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;
        const distArch = Math.abs(c - archC);
        const spillHalf = archHalf + depth * 0.26;

        // Subtle warm pale-gold candlelight spill directly beneath Namdaemun's single central arch
        if (distArch <= spillHalf && depth <= 14) {
          const horizFall = Math.pow(clamp(1 - distArch / (spillHalf + 0.01), 0, 1), 1.35);
          const vertFall = clamp(1 - depth / 15, 0, 1);
          const intensity = horizFall * vertFall;
          if (intensity > 0.07) {
            const shimmer = 0.90 + 0.10 * Math.sin(t * 1.2 + r * 0.55 + c * 0.3);
            const warmR = Math.round(174 + 49 * intensity);
            const warmG = Math.round(142 + 48 * intensity);
            const warmB = Math.round(82 + 40 * intensity);
            let ch = "";
            if (isJointRow) {
              ch = intensity > 0.42 ? "=" : "-";
            } else if (modPos(c + brickShift, 4) === 0) {
              ch = "·";
            } else if (intensity > 0.35 && modPos(c + r, 2) === 0) {
              ch = "-";
            }
            if (ch) {
              const a = clamp((0.18 + 0.54 * intensity) * shimmer * bgReveal, 0, 0.78);
              drawGlyph(ch, x, y, warmR, warmG, warmB, a, intensity > 0.42, 0.48);
              continue;
            }
          }
        }

        // Whisper-subtle architectural sheen from 63 Bldg / Hanok / Lotte on moonlit stones
        let stoneR = 62;
        let stoneG = 86;
        let stoneB = 128;
        let boostA = 0;
        if (c >= 0 && c < cols && depth <= 9) {
          const srcR = clamp(wl - 1 - Math.floor(depth * 1.15), 0, wl - 1);
          const srcIdx = srcR * cols + c;
          if (cellChar[srcIdx]) {
            const mix = (1 - depth / 10) * 0.24;
            stoneR = Math.round(stoneR * (1 - mix) + cellR[srcIdx] * mix);
            stoneG = Math.round(stoneG * (1 - mix) + cellG[srcIdx] * mix);
            stoneB = Math.round(stoneB * (1 - mix) + cellB[srcIdx] * mix);
            boostA = mix * 0.36;
          }
        }

        // Quiet flat granite flagstone pattern (staggered moonlit 박석 courses)
        const inSlabGap = modPos(c + brickShift, 8) === 0;
        if (isJointRow) {
          if (inSlabGap) {
            drawGlyph("·", x, y, stoneR + 18, stoneG + 20, stoneB + 24, (0.38 + boostA) * depthFade, false);
          } else if (modPos(c + brickShift, 2) === 0) {
            drawGlyph("-", x, y, stoneR, stoneG, stoneB, (0.31 + boostA) * depthFade, false);
          }
        } else if (depth % 3 === 1 && inSlabGap) {
          drawGlyph(":", x, y, stoneR - 4, stoneG - 4, stoneB, (0.24 + boostA) * depthFade, false);
        } else if (depth % 3 === 2 && modPos(c + brickShift + 4, 8) === 0) {
          drawGlyph(".", x, y, stoneR, stoneG, stoneB, (0.20 + boostA) * depthFade, false);
        }
      }
    }
  }

  /**
   * Renders Seoul's calm, broad winter Han River (한강):
   * - Row 43: Quiet 한강 석축 둔치 (granite riverside embankment) with widely-spaced warm lamp dots
   * - Rows 44..61: Deep 쪽빛 (#061026 -> #030714) winter river with serene left-to-right current
   *   carrying 63 Bldg's honey-gold, Namdaemun arch's pale-amber, Bukchon Hanok's hanji glow,
   *   and Lotte World Tower's ice-silver reflections — distinct from Singapore's static teal bay!
   */
  function renderHanRiver(city, t, bgReveal, cloudState) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;
    const archC = city.archCenterCol;
    const archHalf = city.archHalfSpan;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const y = originY + r * cellH;

      // Row 43: Quiet 한강 석축 둔치 (granite embankment) + subtle widely-spaced riverside lamp dots
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const x = originX + c * cellW;
          const isLamp = modPos(c + 5, 16) === 0;
          if (isLamp) {
            const flick = 0.86 + 0.14 * Math.sin(t * 1.4 + c * 0.7);
            drawGlyph("·", x, y, 234, 198, 128, 0.78 * flick * bgReveal, true, 0.65);
            continue;
          }
          const inCore = c >= 0 && c < cols;
          const distArch = Math.abs(c - archC);
          if (distArch <= archHalf + 0.5) {
            const k = 1 - distArch / (archHalf + 0.8);
            drawGlyph(modPos(c, 3) === 0 ? "=" : "-", x, y, 218, 184, 118, (0.34 + 0.28 * k) * bgReveal, false);
          } else {
            const ch = modPos(c, 6) < 3 ? "=" : "-";
            const a = (inCore ? 0.42 : 0.28) * bgReveal;
            drawGlyph(ch, x, y, 78, 100, 140, a, false);
          }
        }
        continue;
      }

      const depthAtten = Math.pow(1 - depthNorm * 0.68, 1.1) * bgReveal;
      if (depthAtten <= 0.02) continue;

      // Calm horizontal left-to-right river current speed (slower near bank, smoother mid-river)
      const flowShift = t * (0.85 + depthNorm * 0.95);
      // Slight gentle rightward current drift on reflected streaks
      const currentDrift = 0.25 + depthNorm * 1.4;
      const moonCol = city.baekjaMoon ? city.baekjaMoon.col : null;

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;
        const streamRibbon =
          Math.sin((c - flowShift) * 0.22 + depth * 1.35) * 0.6 +
          Math.sin((c - flowShift * 0.6) * 0.10 - depth * 0.85) * 0.4;

        // 0A. Subtle Banpo Moonlight Fountain (반포 달빛분수) restrained misty cascade arcs (rows 44..47)
        // Positioned in calm open bank stretches strictly clear of stone lanterns (cols 21..23 & 67..69)
        if (
          depth >= 1 &&
          depth <= 4 &&
          ((c >= 11 && c <= 19) || (c >= 55 && c <= 63)) &&
          modPos(c, 2) === 1
        ) {
          const arcWave = 0.5 + 0.5 * Math.sin(t * 1.35 - c * 0.32 - depth * 0.75);
          const jetReach = 2.6 + 1.4 * Math.sin(c * 0.45 + t * 0.7);
          if (depth <= jetReach) {
            const vFade = clamp(1 - (depth - 1) / 3.8, 0.2, 1);
            // Whisper-soft moonlit silver-aqua (#A5D8F3), periwinkle (#C8D8F8), faint lavender (#E4D2F8)
            const huePick = modPos(Math.floor((c + t * 0.8) * 0.45), 3);
            const mr = huePick === 0 ? 165 : huePick === 1 ? 200 : 228;
            const mg = huePick === 0 ? 216 : huePick === 1 ? 216 : 210;
            const mb = huePick === 0 ? 243 : huePick === 1 ? 248 : 248;
            const ch = depth <= 2 ? ":" : depth === 3 ? "·" : ".";
            const a = clamp((0.30 + 0.22 * arcWave) * vFade * bgReveal, 0, 0.54);
            drawGlyph(ch, x, y, mr, mg, mb, a, depth <= 2 && arcWave > 0.62, 0.44);
            continue;
          }
        }

        // 0B. 한강 윤슬 — shimmering pale pearl-silver moonbeam reflection ribbon directly below Baekja Moon!
        if (moonCol !== null) {
          const distMoon = Math.abs(c - (moonCol + Math.sin(t * 0.7 + depth * 0.45) * 0.45));
          const moonHalf = 3.2 + depthNorm * 3.1;
          if (distMoon <= moonHalf) {
            const hFall = Math.pow(clamp(1 - distMoon / (moonHalf + 0.01), 0, 1), 1.35);
            const glint =
              Math.sin((c - flowShift * 1.1) * 0.42 + depth * 1.75) * 0.55 +
              Math.sin(t * 2.2 + c * 0.7 + depth * 1.1) * 0.45;
            if (glint > -0.24) {
              const peak = glint > 0.58 && hFall > 0.42;
              const ch = peak ? "*" : glint > 0.22 ? "~" : glint > -0.05 ? "=" : "·";
              const mr = peak ? 244 : Math.round(196 + 44 * hFall);
              const mg = peak ? 246 : Math.round(212 + 32 * hFall);
              const mb = peak ? 252 : Math.round(238 + 14 * hFall);
              const a = clamp((0.24 + 0.62 * hFall * (0.55 + 0.45 * glint)) * depthAtten, 0, 0.84);
              drawGlyph(ch, x, y, mr, mg, mb, a, peak || hFall > 0.55, peak ? 0.74 : 0.48, peak);
              continue;
            }
          }
        }

        // 1. Namdaemun central arch warm pale-amber current shimmer directly below arch
        const distArch = Math.abs(c - (archC + currentDrift * 0.45));
        const archCone = archHalf + depth * 0.22;
        if (distArch <= archCone && depth <= 15 && streamRibbon > -0.22) {
          const hFall = Math.pow(clamp(1 - distArch / (archCone + 0.01), 0, 1), 1.3);
          const vFall = clamp(1 - depth / 16, 0, 1);
          const strength = hFall * vFall;
          if (strength > 0.08) {
            const ch =
              streamRibbon > 0.48 ? "~" : streamRibbon > 0.12 ? "=" : "-";
            const a = clamp((0.20 + 0.52 * strength) * depthAtten, 0, 0.74);
            drawGlyph(ch, x, y, 232, 194, 120, a, strength > 0.36 && depth < 11, 0.52);
            continue;
          }
        }

        // 2. Flowing Han River reflections of 63 Bldg, Hanok, Lotte, N Seoul Tower
        if (c >= -2 && c <= cols + 3) {
          // Sample slightly upstream (to the left) so the river current gently carries reflections rightward!
          const sway = Math.sin(t * 0.95 + depth * 0.65 + c * 0.14) * 0.35;
          const srcC = clamp(Math.round(c - currentDrift * 0.55 + sway), 0, cols - 1);
          const srcR = wl - 1 - Math.round(depth * 1.32);
          let hitIdx = -1;
          if (srcR >= 0 && srcR < wl && cellChar[srcR * cols + srcC]) {
            hitIdx = srcR * cols + srcC;
          } else if (srcR + 1 < wl && srcR + 1 >= 0 && cellChar[(srcR + 1) * cols + srcC]) {
            hitIdx = (srcR + 1) * cols + srcC;
          } else if (srcR - 1 >= 0 && cellChar[(srcR - 1) * cols + srcC]) {
            hitIdx = (srcR - 1) * cols + srcC;
          }

          if (hitIdx >= 0 && streamRibbon > -0.18) {
            // Soften into serene deep 쪽빛 winter river reflection tones
            const rr = clamp(Math.round(cellR[hitIdx] * 0.78 + 18), 0, 255);
            const rg = clamp(Math.round(cellG[hitIdx] * 0.80 + 26), 0, 255);
            const rb = clamp(Math.round(cellB[hitIdx] * 0.86 + 44), 0, 255);
            const crest = streamRibbon > 0.42;
            const ch = crest ? "~" : streamRibbon > 0.08 ? "-" : "·";
            const a = clamp(
              cellA[hitIdx] * (crest ? 0.60 : 0.40) * depthAtten,
              0,
              0.68
            );
            drawGlyph(ch, x, y, rr, rg, rb, a, cellGlow[hitIdx] === 1 && crest && depth < 12, 0.50);
            continue;
          }
        }

        // 3. Whisper-soft 4-color Google Cloud shimmer on mid-deep Han River current
        if (cloudState && cloudAscii && depth >= 8 && depth <= 16 && streamRibbon > 0.32) {
          const cloudCol = Math.round((c - currentDrift * 0.4 - cloudState.leftCol) / CLOUD_SUB_W);
          const cloudRow = Math.round(
            cloudAscii.rows - 1 - ((depth - 8) / 8) * (cloudAscii.rows - 1)
          );
          if (
            cloudCol >= 0 &&
            cloudCol < cloudAscii.cols &&
            cloudRow >= 0 &&
            cloudRow < cloudAscii.rows
          ) {
            const matched = cloudAscii.cellGrid[cloudRow * cloudAscii.cols + cloudCol];
            if (matched) {
              const ca = 0.20 * cloudState.reveal * depthAtten;
              drawGlyph("~", x, y, matched.r, matched.g, matched.b, ca, true, 0.38);
              continue;
            }
          }
        }

        // 4. Broad calmly flowing deep 쪽빛 Han River current ribbons across full widescreen
        if (streamRibbon > 0.46) {
          const ch = modPos(c + depth, 4) === 0 ? "~" : "-";
          drawGlyph(ch, x, y, 42, 70, 122, 0.34 * depthAtten, false);
        } else if (streamRibbon < -0.52 && modPos(c + depth * 2, 3) === 0) {
          drawGlyph("-", x, y, 28, 48, 88, 0.24 * depthAtten, false);
        } else if (modPos(c * 5 + depth * 7, 13) === 0) {
          drawGlyph("·", x, y, 54, 82, 134, 0.20 * depthAtten, false);
        }
      }
    }

    // 5. Serene Traditional Korean Wooden Sailboat (한강 황포돛배, #92) gliding slowly across the Han River
    // Timed so at t=18 it sails peacefully in calm open river around cols 20..26, rows 51..53
    const boatSpan = cols + 22;
    const boatLeftCol = -11 + modPos(22.5 + t * 0.52, boatSpan);
    const boatTopRow = 51 + Math.sin(t * 1.45) * 0.14;
    const boatAlpha = bgReveal * 0.92;
    if (boatAlpha > 0.04) {
      const boatRows = [
        { dr: 0, text: "  |=\\ ", codes: "  mSS " },
        { dr: 1, text: "  |==)", codes: "  mSSs" },
        { dr: 2, text: " \\___/·", codes: " hhhhhL" },
      ];
      const boatPal = {
        S: [223, 184, 120, 0.92, true],  // warm ochre-amber cloth sail (#DFB878)
        s: [196, 148, 82, 0.86, false],  // deeper ochre curved batten edge (#C49452)
        m: [142, 107, 77, 0.84, false],  // slim wooden cedar mast (#8E6B4D)
        h: [152, 118, 86, 0.88, false],  // weathered wooden hull (#987656)
        L: [255, 228, 158, 0.96, true],  // tiny warm candlelight bow glint (#FFE49E)
      };

      // Delicate silver-blue trailing water wake behind stern
      const wakeGlyphs = ["~", "-", "·", "-"];
      for (let w = 0; w < wakeGlyphs.length; w++) {
        const wc = boatLeftCol - 0.8 - w * 1.15;
        const wr = boatTopRow + 2.1 + (w % 2) * 0.18;
        const wa = (0.48 - w * 0.10) * boatAlpha;
        drawGlyph(wakeGlyphs[w], originX + wc * cellW, originY + wr * cellH, 126, 162, 212, wa, false);
      }

      // Soft golden sail reflection shimmer directly beneath the hull on row 54
      const reflChars = ["-", "~", "-", "~"];
      for (let k = 0; k < reflChars.length; k++) {
        const rc = boatLeftCol + 1.5 + k;
        const rr = boatTopRow + 3.05;
        const shim = 0.78 + 0.22 * Math.sin(t * 2.2 + k * 0.9);
        drawGlyph(reflChars[k], originX + rc * cellW, originY + rr * cellH, 184, 146, 92, 0.34 * shim * boatAlpha, false);
      }

      // Sailboat hull, ochre Hwangpo sail & bow candlelight glint
      for (let ri = 0; ri < boatRows.length; ri++) {
        const rowSpec = boatRows[ri];
        const y = originY + (boatTopRow + rowSpec.dr) * cellH;
        for (let ci = 0; ci < rowSpec.text.length; ci++) {
          const ch = rowSpec.text[ci];
          const code = rowSpec.codes[ci];
          if (ch === " " || !boatPal[code]) continue;
          const [r, g, b, baseA, gl] = boatPal[code];
          drawGlyph(
            ch,
            originX + (boatLeftCol + ci) * cellW,
            y,
            r,
            g,
            b,
            baseA * boatAlpha,
            gl,
            code === "L" ? 0.88 : 0.36,
            code === "L"
          );
        }
      }
    }
  }

  /**
   * Renders Dubai's rich, sculpted, unmistakably golden Arabian desert sand dunes (#81):
   * - Warm desert sand base gradient (#2A1A0E -> #120A05)
   * - 4 sweeping, continuous, back-to-front overlapping sand-dune crest curves across rows 44..60
   *   with bright moonlit golden-ochre ridges (#F0BD72 / #DEA052) traced cleanly in ~, -, _, /, \
   *   and 3D sunlit-to-shadow wind-rippled slopes (#A86E34 -> #7A4D22 -> #543418) below each crest
   * - Subtle windblown golden sand grains skimming horizontally across the dune ridges — ZERO water!
   */
  function renderDubaiDunes(city, t, bgReveal) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;

    // 4 overlapping continuous desert dune ridges (back -> front, strictly below row 43)
    const dunes = [
      { baseD: 3.0, a1: 1.15, f1: 0.048, p1: 0.3, a2: 0.45, f2: 0.115, p2: 1.7 },
      { baseD: 6.9, a1: 1.45, f1: 0.042, p1: 2.5, a2: 0.55, f2: 0.098, p2: 0.4 },
      { baseD: 11.1, a1: 1.65, f1: 0.036, p1: 4.8, a2: 0.60, f2: 0.086, p2: 2.9 },
      { baseD: 15.2, a1: 1.50, f1: 0.040, p1: 1.2, a2: 0.50, f2: 0.092, p2: 4.1 },
    ];

    const evalDune = (dn, c) => {
      const y =
        dn.baseD +
        Math.sin(c * dn.f1 + dn.p1) * dn.a1 +
        Math.sin(c * dn.f2 + dn.p2) * dn.a2;
      const slope =
        Math.cos(c * dn.f1 + dn.p1) * dn.a1 * dn.f1 +
        Math.cos(c * dn.f2 + dn.p2) * dn.a2 * dn.f2;
      return { y, slope };
    };

    const windShift = t * 0.42;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const depthFade = (1 - depthNorm * 0.24) * bgReveal;
      if (depthFade <= 0.02) continue;
      const y = originY + r * cellH;

      // Crisp flat desert horizon datum on row 43
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const x = originX + c * cellW;
          const isLit = c >= 0 && c < cols && cellChar[(wl - 1) * cols + c];
          const ch = modPos(c, 5) === 0 ? "~" : "-";
          drawGlyph(ch, x, y, 214, 156, 86, (isLit ? 0.62 : 0.42) * bgReveal, false);
        }
        continue;
      }

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;

        // Painter's-order evaluation: find the frontmost dune whose ridge is at or above `depth`
        let ownerIdx = -1;
        let ownerDy = 99;
        let ownerSlope = 0;
        for (let dIdx = dunes.length - 1; dIdx >= 0; dIdx--) {
          const { y: ry, slope } = evalDune(dunes[dIdx], c);
          const dy = depth - ry;
          if (dy >= -0.52) {
            ownerIdx = dIdx;
            ownerDy = dy;
            ownerSlope = slope;
            break;
          }
        }

        // Distant flat desert sand plain between row 43 and Dune #1
        if (ownerIdx < 0) {
          const ripple = Math.sin(c * 0.24 - windShift * 0.6 + depth * 1.3);
          const ch = ripple > 0.35 ? "~" : ripple > -0.25 ? "-" : modPos(c + depth, 2) === 0 ? "·" : ".";
          drawGlyph(ch, x, y, 146, 98, 48, (0.34 + 0.12 * Math.max(0, ripple)) * depthFade, false);
          continue;
        }

        // 1. Bright moonlit golden-ochre crest ridge (#F0BD72 / #DEA052) traced continuously!
        if (ownerDy <= 0.52) {
          const shimmer = 0.88 + 0.12 * Math.sin(c * 0.22 - windShift + ownerIdx * 1.4);
          let ch;
          if (ownerSlope > 0.075) {
            ch = "\\";
          } else if (ownerSlope < -0.075) {
            ch = "/";
          } else if (ownerDy < -0.14) {
            ch = "_";
          } else {
            ch = Math.sin(c * 0.28 - windShift) > 0.05 ? "~" : "-";
          }
          // Sunlit side of crest (left-facing slope) catches brighter moonlit gold (#F0BD72)
          const sunlit = ownerSlope < 0.02;
          const cr = sunlit ? 240 : 222;
          const cg = sunlit ? 189 : 160;
          const cb = sunlit ? 114 : 82;
          const a = clamp((sunlit ? 0.90 : 0.76) * shimmer * depthFade, 0, 0.92);
          drawGlyph(ch, x, y, cr, cg, cb, a, sunlit && ownerIdx < 3, 0.42, sunlit);
          continue;
        }

        // 2. Sculpted 3D sunlit-to-shadow wind-rippled sand slope cascading below each crest
        const ripple =
          Math.sin(c * 0.26 - windShift * 0.75 + ownerDy * 1.15 + ownerIdx) * 0.65 +
          Math.sin(c * 0.11 + ownerDy * 0.7) * 0.35;

        // Occasional windblown golden sand grain skimming just off the crest
        if (ownerDy < 1.35 && modPos(Math.round(c - t * 3.4) * 7 + r * 13, 37) === 0) {
          drawGlyph("·", x, y, 244, 204, 132, 0.76 * depthFade, true, 0.45);
          continue;
        }

        if (ownerDy < 1.55) {
          // Upper illuminated wind-rippled ochre face (#A86E34 / #C28644)
          const ch =
            Math.abs(ownerSlope) > 0.085 && modPos(c + r, 3) === 0
              ? ownerSlope > 0
                ? "\\"
                : "/"
              : ripple > 0.25
                ? "~"
                : ripple > -0.25
                  ? "-"
                  : "·";
          const a = (0.58 + 0.16 * Math.max(0, ripple)) * depthFade;
          drawGlyph(ch, x, y, 178, 118, 56, clamp(a, 0, 0.78), false);
        } else if (ownerDy < 2.75) {
          // Mid shaded terracotta-sand slope (#7A4D22)
          const ch =
            ripple > 0.35
              ? "~"
              : ripple > -0.1
                ? "-"
                : modPos(c + r * 2, 3) === 0
                  ? ":"
                  : "·";
          const a = (0.44 + 0.12 * Math.max(0, ripple)) * depthFade;
          drawGlyph(ch, x, y, 128, 82, 38, clamp(a, 0, 0.62), false);
        } else {
          // Deep velvety umber shadow trough (#543418) before the next dune rises
          const ch =
            ripple > 0.42
              ? "-"
              : modPos(c * 3 + r * 5, 4) === 0
                ? ":"
                : modPos(c + r, 2) === 0
                  ? "."
                  : "·";
          drawGlyph(ch, x, y, 92, 58, 28, 0.34 * depthFade, false);
        }
      }
    }
  }

  /**
   * Renders Singapore's iconic v6 (#47) silky midnight-teal Marina Bay water (ONLY Singapore
   * has water!) with crisp horizontal neon reflection bars directly below all 5-6 landmarks
   * plus ambient bay ripples and faint 4-color Google Cloud water shimmer.
   */
  function renderSingaporeWater(city, t, bgReveal, cloudState) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const y = originY + r * cellH;

      // Subtle dark bay waterline seam on row 43
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const x = originX + c * cellW;
          const wave = Math.sin(t * 1.3 + c * 0.32);
          const ch = wave > 0.45 ? "~" : "-";
          drawGlyph(ch, x, y, 28, 78, 94, 0.34 * bgReveal, false);
        }
        continue;
      }

      const depthAtten = Math.pow(1 - depthNorm * 0.64, 1.1) * bgReveal;
      if (depthAtten <= 0.02) continue;

      // Liquid horizontal wave-band modulation (creates crisp broken v6 reflection bars!)
      const rowWave = 0.5 + 0.5 * Math.sin(depth * 1.55 - t * 1.65);

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;
        const waveShift = Math.sin(t * 1.4 + depth * 0.85 + c * 0.18) * (0.32 + depthNorm * 1.1);
        const barNoise =
          Math.sin(c * 0.34 + depth * 1.9 - t * 1.35) * 0.55 +
          Math.sin(c * 0.14 - depth * 1.1 + t * 0.85) * 0.45;

        // 1. Crisp v6 horizontal neon reflection bars directly below Singapore's landmarks
        if (c >= -1 && c <= cols) {
          const srcC = clamp(Math.round(c + waveShift), 0, cols - 1);
          const srcR = wl - 1 - Math.round(depth * 1.22);
          let hitIdx = -1;
          if (srcR >= 0 && srcR < wl && cellChar[srcR * cols + srcC]) {
            hitIdx = srcR * cols + srcC;
          } else if (srcR + 1 < wl && srcR + 1 >= 0 && cellChar[(srcR + 1) * cols + srcC]) {
            hitIdx = (srcR + 1) * cols + srcC;
          } else if (srcR - 1 >= 0 && cellChar[(srcR - 1) * cols + srcC]) {
            hitIdx = (srcR - 1) * cols + srcC;
          }

          if (hitIdx >= 0) {
            // Crisp intermittent liquid bars (not a solid wall — lets dark teal water breathe between bars!)
            const bandGate = rowWave * 0.45 + (barNoise + 1) * 0.35;
            if (bandGate > 0.34) {
              const rr = clamp(Math.round(cellR[hitIdx] * 0.92 + 12), 0, 255);
              const rg = clamp(Math.round(cellG[hitIdx] * 0.94 + 16), 0, 255);
              const rb = clamp(Math.round(cellB[hitIdx] * 0.96 + 20), 0, 255);
              const peak = bandGate > 0.68;
              const ch =
                peak && cellGlow[hitIdx] === 1 && modPos(c + depth, 4) === 0
                  ? "*"
                  : peak
                    ? "="
                    : barNoise > 0.05
                      ? "~"
                      : "-";
              const a = clamp(
                cellA[hitIdx] * (peak ? 0.82 : 0.54) * depthAtten,
                0,
                0.84
              );
              drawGlyph(ch, x, y, rr, rg, rb, a, peak && depth < 14, 0.66, peak);
              continue;
            }
          }
        }

        // 2. Faint diffused 4-color Google Cloud water shimmer in mid-deep bay water
        if (cloudState && cloudAscii && depth >= 7 && depth <= 16 && barNoise > 0.1) {
          const cloudCol = Math.round((c + waveShift * 0.8 - cloudState.leftCol) / CLOUD_SUB_W);
          const cloudRow = Math.round(
            cloudAscii.rows - 1 - ((depth - 7) / 9) * (cloudAscii.rows - 1)
          );
          if (
            cloudCol >= 0 &&
            cloudCol < cloudAscii.cols &&
            cloudRow >= 0 &&
            cloudRow < cloudAscii.rows
          ) {
            const matched = cloudAscii.cellGrid[cloudRow * cloudAscii.cols + cloudCol];
            if (matched) {
              const ca = 0.28 * cloudState.reveal * depthAtten;
              drawGlyph(barNoise > 0.4 ? "=" : "~", x, y, matched.r, matched.g, matched.b, ca, true, 0.45);
              continue;
            }
          }
        }

        // 3. Ambient silky midnight-teal horizontal water dashes across entire viewport
        if (barNoise > 0.36 && modPos(c + depth * 2, 2) === 0) {
          drawGlyph("-", x, y, 24, 80, 96, 0.32 * depthAtten, false);
        } else if (barNoise < -0.52 && modPos(c + depth, 3) === 0) {
          drawGlyph("~", x, y, 30, 94, 112, 0.26 * depthAtten, false);
        } else if (modPos(c * 5 + depth * 7, 11) === 0) {
          drawGlyph("·", x, y, 22, 70, 86, 0.20 * depthAtten, false);
        }
      }
    }
  }

  /**
   * Renders Singapore's iconic Merlion Park statue & live parabolic fountain jet
   * on the left Marina Bay foreground pier, with animated water pulses, spray mist,
   * expanding splash ripples, and a shimmering water reflection below the pier.
   */
  const MERLION_PAL = {
    W: [244, 250, 255, true, 0.85, true], // lit pearl-white marble
    M: [207, 228, 245, true, 0.45, false], // moonlit silver-white marble
    m: [127, 168, 200, false, 0.0, false], // shaded mane / marble depth
    e: [255, 243, 204, true, 0.9, true], // warm lion eye glint
    I: [140, 232, 255, true, 0.8, true], // glacial-cyan water nozzle / wave-crest rim
    P: [168, 196, 220, false, 0.0, false], // stone pier highlight rim
    p: [90, 124, 150, false, 0.0, false], // stone pier body
    g: [255, 226, 154, true, 0.72, false], // warm promenade uplight accent
  };

  const MERLION_ART = [
    ["    .-^^-.     ", "    mWWWWm     "], // row 44: lion ears & crown
    ["   /((( o\\_    ", "   mMMM eWW    "], // row 45: flowing mane, eye & snout
    ["  (((((( =:>   ", "  mMMMMM WWI   "], // row 46: roaring mouth spouting water
    ["   \\((((__/    ", "   mMMMMWWW    "], // row 47: lower jaw & mane beard
    ["   /(((((\\     ", "   mMMMMMW     "], // row 48: proud arched chest
    ["  /((:)): )    ", "  mMMMWWW W    "], // row 49: curved scaly fish torso
    [" /((:::::/     ", " mMMMWWWMW     "], // row 50: tapered fish body
    ["<==:::::/      ", "WMMMWWWMW      "], // row 51: upward-swept tail fin
    [" \\_____/       ", " IWWWWWm       "], // row 52: wave-crest plinth
    ["___/=====\\___  ", "pppPgWWWgPppp  "], // row 53: stepped Merlion pedestal
    ["[=============\\", "PppPggPPPggPppP"], // row 54: Merlion Park stone pier
    ["|-------------|", "ppppppppppppppp"], // row 55: pier bayfront wall
  ];

  function renderSingaporeMerlion(city, t, bgReveal) {
    if (!city.merlion || bgReveal <= 0.04) return;

    const ml = city.merlion;
    const statueReveal = smoothstep(0.05, 0.62, bgReveal);
    if (statueReveal <= 0.01) return;

    const totalRows = MERLION_ART.length;
    const baseRow = ml.startRow;
    const baseCol = ml.startCol;

    // 1. Subtle theatrical night floodlight halo illuminating the marble Merlion
    const haloCx = originX + (baseCol + 6.8) * cellW;
    const haloCy = originY + (baseRow + 4.4) * cellH;
    const haloRad = cellH * 5.8;
    const flood = gctx.createRadialGradient(haloCx, haloCy, cellH * 0.4, haloCx, haloCy, haloRad);
    flood.addColorStop(0, `rgba(218, 242, 255, ${(0.22 * statueReveal).toFixed(4)})`);
    flood.addColorStop(0.55, `rgba(118, 210, 242, ${(0.09 * statueReveal).toFixed(4)})`);
    flood.addColorStop(1, "rgba(118, 210, 242, 0)");
    gctx.fillStyle = flood;
    gctx.fillRect(haloCx - haloRad, haloCy - haloRad, haloRad * 2, haloRad * 2);

    // 2. Sculpted Merlion statue + Merlion Park stone pier (bottom-up reveal)
    // Extend left promenade edge cleanly to col 0 on pier rows (rows 54..55)
    for (let rIdx = totalRows - 1; rIdx >= 0; rIdx--) {
      const fromBottom = (totalRows - 1 - rIdx) / Math.max(1, totalRows - 1);
      const rowAlpha = clamp((statueReveal * 1.32 - fromBottom * 0.72) / 0.45, 0, 1);
      if (rowAlpha <= 0.02) continue;

      const row = baseRow + rIdx;
      const y = originY + row * cellH;
      const [chars, colors] = MERLION_ART[rIdx];

      // Mask Marina Bay water reflections across the full interior span of each statue/pier row
      let firstCol = -1;
      let lastCol = -1;
      for (let i = 0; i < chars.length; i++) {
        if (chars[i] !== " " && colors[i] !== " " && MERLION_PAL[colors[i]]) {
          if (firstCol < 0) firstCol = i;
          lastCol = i;
        }
      }
      if (firstCol >= 0) {
        const mx = originX + (baseCol + firstCol - 0.15) * cellW;
        const mw = (lastCol - firstCol + 1.3) * cellW;
        bctx.fillStyle = `rgba(5, 19, 26, ${(0.92 * rowAlpha).toFixed(3)})`;
        bctx.fillRect(mx, y - cellH * 0.06, mw, cellH * 1.12);
      }

      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        const code = colors[i];
        if (ch === " " || code === " " || !MERLION_PAL[code]) continue;

        const col = baseCol + i;
        const x = originX + col * cellW;

        const [cr, cg, cb, isGlow, gStr, isBold] = MERLION_PAL[code];
        // Gentle warm pulse on promenade uplights
        const uplightPulse = code === "g" ? 0.82 + 0.18 * Math.sin(t * 2.2 + i * 0.9) : 1.0;
        drawGlyph(ch, x, y, cr, cg, cb, 0.96 * rowAlpha * uplightPulse, isGlow, gStr, isBold);
      }
    }

    // 3. Soft shimmering marble reflection just below the Merlion Park pier (rows 56..58)
    for (let d = 0; d < 3; d++) {
      const refRow = baseRow + totalRows + d;
      if (refRow >= city.rows) break;
      const y = originY + refRow * cellH;
      const atten = (1 - d * 0.28) * 0.34 * statueReveal;
      const sway = Math.sin(t * 1.5 + d * 1.1) * 0.45;
      for (let i = 2; i <= 11; i++) {
        if (modPos(i + d, 2) !== 0) continue;
        const x = originX + (baseCol + i + sway) * cellW;
        const ch = d === 0 ? "=" : "~";
        drawGlyph(ch, x, y, 178, 224, 242, atten, d === 0, 0.35);
      }
    }

    // 4. Live animated parabolic fountain water jet spouting from Merlion's mouth
    const jetReveal = smoothstep(0.45, 0.96, bgReveal);
    if (jetReveal <= 0.02) return;

    const startC = ml.mouthCol;
    const startR = ml.mouthRow;
    const endC = ml.splashCol;
    const endR = ml.splashRow;
    const SAMPLES = 18;

    for (let s = 0; s <= SAMPLES; s++) {
      const u = s / SAMPLES;
      if (u > jetReveal) break;

      const colF = startC + (endC - startC) * u;
      const rowF = startR + (endR - startR) * (u * u) - 2.6 * u * (1 - u);
      const x = originX + colF * cellW;
      const y = originY + rowF * cellH;

      // Fast-moving pressurized water pulse racing from mouth to bay
      const flow = Math.sin(u * 14.0 - t * 11.5);
      const crest = flow > 0.28;
      const ch =
        u < 0.22
          ? crest
            ? "="
            : "~"
          : u < 0.52
            ? crest
              ? "~"
              : "-"
            : u < 0.78
              ? crest
                ? "\\"
                : ":"
              : crest
                ? "\\"
                : "|";

      const isBright = crest || u < 0.16;
      const r = isBright ? 240 : 140;
      const g = isBright ? 252 : 232;
      const b = 255;
      const alpha = (isBright ? 0.94 : 0.68) * smoothstep(0.0, 0.12, jetReveal - u + 0.12);
      drawGlyph(ch, x, y, r, g, b, alpha, true, isBright ? 0.82 : 0.48, isBright);

      // Fine shimmering spray mist slightly trailing the main parabolic arc
      if (s % 3 === 1 && u > 0.12 && u < 0.94) {
        const mistDrift = Math.sin(t * 7.2 + s * 1.9) * 0.24;
        const mx = originX + (colF + mistDrift) * cellW;
        const my = originY + (rowF + 0.42 + Math.abs(mistDrift) * 0.4) * cellH;
        const mCh = s % 6 === 1 ? "." : "·";
        drawGlyph(mCh, mx, my, 128, 236, 245, 0.46 * alpha, true, 0.35);
      }
    }

    // 5. Animated splash plume, hopping droplets & expanding concentric ripples in Marina Bay
    const splashAlpha = smoothstep(0.84, 1.0, jetReveal);
    if (splashAlpha <= 0.02) return;

    const sx = originX + endC * cellW;
    const sy = originY + endR * cellH;

    // Foaming impact glow
    const spRad = cellH * 2.4;
    const spGlow = gctx.createRadialGradient(sx, sy, cellH * 0.15, sx, sy, spRad);
    spGlow.addColorStop(0, `rgba(215, 250, 255, ${(0.34 * splashAlpha).toFixed(4)})`);
    spGlow.addColorStop(0.55, `rgba(92, 230, 200, ${(0.12 * splashAlpha).toFixed(4)})`);
    spGlow.addColorStop(1, "rgba(92, 230, 200, 0)");
    gctx.fillStyle = spGlow;
    gctx.fillRect(sx - spRad, sy - spRad, spRad * 2, spRad * 2);

    // Core churning foam at impact point
    const corePulse = 0.72 + 0.28 * Math.sin(t * 10.5);
    drawGlyph(corePulse > 0.82 ? "*" : "o", sx, sy, 255, 255, 255, 0.95 * splashAlpha, true, 0.9, true);
    drawGlyph("~", sx - cellW * 0.95, sy + cellH * 0.08, 175, 245, 255, 0.78 * splashAlpha, true, 0.55);
    drawGlyph("~", sx + cellW * 0.95, sy + cellH * 0.08, 175, 245, 255, 0.78 * splashAlpha, true, 0.55);

    // Hopping splash droplets arcing upward around impact
    const DROPLETS = 6;
    for (let k = 0; k < DROPLETS; k++) {
      const cycle = (t * 2.4 + k * 0.37) % 1.0;
      const spread = (k - (DROPLETS - 1) * 0.5) * 0.62;
      const dc = endC + spread * (0.6 + cycle * 1.15);
      const dr = endR - 1.35 * Math.sin(cycle * Math.PI) - 0.15;
      const da = Math.sin(cycle * Math.PI) * 0.85 * splashAlpha;
      if (da > 0.08) {
        const dCh = cycle < 0.35 ? "*" : cycle < 0.7 ? "·" : ".";
        drawGlyph(dCh, originX + dc * cellW, originY + dr * cellH, 230, 252, 255, da, true, 0.6);
      }
    }

    // 3 phase-staggered expanding horizontal ripple rings on Marina Bay
    for (let ring = 0; ring < 3; ring++) {
      const p = (t * 0.72 + ring / 3) % 1.0;
      const radCols = 1.1 + p * 4.2;
      const ra = (1 - p) * 0.72 * splashAlpha;
      if (ra <= 0.05) continue;
      const ry = originY + (endR + 0.35 + p * 0.65) * cellH;
      drawGlyph("(", originX + (endC - radCols) * cellW, ry, 130, 234, 242, ra, true, 0.45);
      drawGlyph(")", originX + (endC + radCols) * cellW, ry, 130, 234, 242, ra, true, 0.45);
      if (p < 0.65) {
        drawGlyph("~", originX + (endC - radCols * 0.52) * cellW, ry + cellH * 0.12, 92, 230, 200, ra * 0.75, false);
        drawGlyph("~", originX + (endC + radCols * 0.52) * cellW, ry + cellH * 0.12, 92, 230, 200, ra * 0.75, false);
      }
    }
  }

  /**
   * Renders Taiwan's rain-slicked Taipei evening stone boulevard (`===`, `---`, `·`, `|`)
   * softly reflecting Taipei 101's jade-gold & CKS Memorial Hall's white-cobalt glow
   * (distinct from rippling water!).
   */
  function renderTaiwanAvenue(city, t, bgReveal) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const depthFade = (1 - depthNorm * 0.62) * bgReveal;
      if (depthFade <= 0.02) continue;
      const y = originY + r * cellH;

      // Wet-stone boulevard curb along row 43
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const x = originX + c * cellW;
          let cr = 74;
          let cg = 66;
          let cb = 104;
          let ca = 0.40;
          if (c >= 0 && c < cols && cellChar[(wl - 1) * cols + c]) {
            const idx = (wl - 1) * cols + c;
            cr = Math.round(cr * 0.4 + cellR[idx] * 0.6);
            cg = Math.round(cg * 0.4 + cellG[idx] * 0.6);
            cb = Math.round(cb * 0.4 + cellB[idx] * 0.6);
            ca = 0.56;
          }
          drawGlyph(modPos(c, 4) === 0 ? "=" : "-", x, y, cr, cg, cb, ca * bgReveal, false);
        }
        continue;
      }

      const isPaverSeam = depth % 3 === 0;
      const paverOffset = Math.floor(depth / 3) % 2 === 0 ? 0 : 3;

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;

        // Straight vertical rain-slicked architectural sheen (no wavy water ripples!)
        if (c >= 0 && c < cols) {
          const srcR = wl - 1 - Math.round(depth * 1.45);
          let hitIdx = -1;
          if (srcR >= 0 && srcR < wl && cellChar[srcR * cols + c]) {
            hitIdx = srcR * cols + c;
          } else if (srcR + 2 < wl && srcR + 2 >= 0 && cellChar[(srcR + 2) * cols + c]) {
            hitIdx = (srcR + 2) * cols + c;
          } else if (depth <= 10 && cellChar[(wl - 2) * cols + c]) {
            hitIdx = (wl - 2) * cols + c;
          }

          if (hitIdx >= 0) {
            const sheenPulse = 0.84 + 0.16 * Math.sin(t * 1.05 + c * 0.45 + depth * 0.35);
            const rr = Math.round(cellR[hitIdx] * 0.82 + 18);
            const rg = Math.round(cellG[hitIdx] * 0.82 + 16);
            const rb = Math.round(cellB[hitIdx] * 0.86 + 26);

            let ch = "";
            if (isPaverSeam) {
              ch = modPos(c + paverOffset, 3) === 0 ? "=" : "-";
            } else if (modPos(c, 2) === 0 && depth < 14) {
              ch = modPos(depth + c, 3) === 0 ? "|" : ":";
            } else if (modPos(c + depth, 3) === 0) {
              ch = "·";
            }

            if (ch) {
              const a = clamp(cellA[hitIdx] * 0.48 * sheenPulse * depthFade, 0, 0.64);
              drawGlyph(ch, x, y, rr, rg, rb, a, cellGlow[hitIdx] === 1 && depth < 12, 0.48);
              continue;
            }
          }
        }

        // Ambient wet-stone boulevard pavers across full width
        if (isPaverSeam) {
          const ch = modPos(c + paverOffset, 6) === 0 ? "=" : modPos(c + paverOffset, 2) === 0 ? "-" : "";
          if (ch) {
            drawGlyph(ch, x, y, 54, 48, 82, 0.26 * depthFade, false);
          }
        } else if (modPos(c * 3 + depth * 5, 11) === 0) {
          drawGlyph("·", x, y, 66, 58, 98, 0.20 * depthFade, false);
        }
      }
    }
  }

  /**
   * Renders Beijing's imperial white-marble terrace courtyard reflecting
   * Temple of Heaven's cobalt-gold and Bird's Nest's warm crimson-amber glow.
   */
  function renderBeijingCourtyard(city, t, bgReveal) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const depthFade = (1 - depthNorm * 0.64) * bgReveal;
      if (depthFade <= 0.02) continue;
      const y = originY + r * cellH;

      // Carved imperial white-marble balustrade datum on row 43
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const x = originX + c * cellW;
          let mr = 148;
          let mg = 104;
          let mb = 102;
          let ma = 0.44;
          if (c >= 0 && c < cols && cellChar[(wl - 1) * cols + c]) {
            const idx = (wl - 1) * cols + c;
            mr = Math.round(mr * 0.42 + cellR[idx] * 0.58);
            mg = Math.round(mg * 0.42 + cellG[idx] * 0.58);
            mb = Math.round(mb * 0.42 + cellB[idx] * 0.58);
            ma = 0.60;
          }
          const ch = modPos(c, 5) === 0 ? "=" : modPos(c, 5) === 2 ? "·" : "-";
          drawGlyph(ch, x, y, mr, mg, mb, ma * bgReveal, false);
        }
        continue;
      }

      // Ceremonial stepped white-marble terrace courses (distinct from granite & water)
      const isTerraceStep = depth === 3 || depth === 7 || depth === 12;
      const isSlabRow = depth % 2 === 0;
      const slabShift = Math.floor(depth / 2) % 2 === 0 ? 0 : 5;

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;

        // Soft luminous architectural bounce across polished imperial white marble
        // with subtle warm crimson-gold reflection hints
        if (c >= 0 && c < cols && depth <= 14) {
          const srcR = wl - 1 - Math.round(depth * 1.35);
          let hitIdx = -1;
          if (srcR >= 0 && srcR < wl && cellChar[srcR * cols + c]) {
            hitIdx = srcR * cols + c;
          } else if (srcR + 2 < wl && srcR + 2 >= 0 && cellChar[(srcR + 2) * cols + c]) {
            hitIdx = (srcR + 2) * cols + c;
          } else if (depth <= 8 && cellChar[(wl - 1) * cols + c]) {
            hitIdx = (wl - 1) * cols + c;
          }

          if (hitIdx >= 0) {
            const breath = 0.88 + 0.12 * Math.sin(t * 0.95 + c * 0.32 + depth * 0.4);
            // Blend landmark tint with warm crimson-gold kissed pearl-marble
            const rr = clamp(Math.round(cellR[hitIdx] * 0.72 + 72), 0, 255);
            const rg = clamp(Math.round(cellG[hitIdx] * 0.72 + 44), 0, 255);
            const rb = clamp(Math.round(cellB[hitIdx] * 0.70 + 42), 0, 255);

            let ch = "";
            if (isTerraceStep) {
              ch = modPos(c, 3) === 0 ? "=" : "-";
            } else if (isSlabRow && modPos(c + slabShift, 3) === 0) {
              ch = "-";
            } else if (modPos(c + slabShift, 5) === 0) {
              ch = "·";
            } else if (depth < 8 && modPos(c + depth, 4) === 0) {
              ch = ":";
            }

            if (ch) {
              const a = clamp(cellA[hitIdx] * 0.48 * breath * depthFade, 0, 0.64);
              drawGlyph(ch, x, y, rr, rg, rb, a, cellGlow[hitIdx] === 1 && depth < 10, 0.46);
              continue;
            }
          }
        }

        // Quiet warm crimson-lit imperial white-marble terrace lines
        if (isTerraceStep) {
          const ch = modPos(c, 4) === 0 ? "=" : "-";
          drawGlyph(ch, x, y, 134, 82, 78, 0.34 * depthFade, false);
        } else if (isSlabRow && modPos(c + slabShift, 10) === 0) {
          drawGlyph(":", x, y, 114, 72, 68, 0.22 * depthFade, false);
        } else if (modPos(c * 3 + depth * 7, 13) === 0) {
          drawGlyph("·", x, y, 146, 98, 76, 0.22 * depthFade, false);
        }
      }
    }
  }

  /**
   * Renders Bangalore's festive Indian nocturnal courtyard & terraced garden:
   * golden-terracotta stone reflections beneath Vidhana Soudha & the Dravidian Gopuram,
   * warm Diwali diya oil-lamp sparkles (*, +, o in marigold-gold & saffron),
   * and subtle emerald garden terrace beds — zero water ripples.
   */
  function renderBangaloreGarden(city, t, bgReveal) {
    const cols = city.cols;
    const rows = city.rows;
    const wl = city.waterlineRow;
    const cStart = -extraColsLeft;
    const cEnd = cols + extraColsRight;

    for (let r = wl; r < rows; r++) {
      const depth = r - wl;
      const depthNorm = depth / Math.max(1, rows - wl - 1);
      const depthFade = (1 - depthNorm * 0.58) * bgReveal;
      if (depthFade <= 0.02) continue;
      const y = originY + r * cellH;

      // Festive sandstone courtyard curb lined with periodic warm Diwali diya lamp glints on row 43
      if (r === wl) {
        for (let c = cStart; c < cEnd; c++) {
          const x = originX + c * cellW;
          const isDiya = modPos(c, 9) === 2 && c >= -12 && c <= cols + 12;
          if (isDiya) {
            const flick = 0.78 + 0.22 * Math.sin(t * 4.2 + c * 1.7);
            const ch = modPos(c, 18) === 2 ? "*" : "o";
            drawGlyph(ch, x, y, 255, 182, 74, 0.82 * flick * bgReveal, true, 0.85, true);
            continue;
          }
          let gr = 136;
          let gg = 92;
          let gb = 62;
          let ga = 0.42;
          if (c >= 0 && c < cols && cellChar[(wl - 1) * cols + c]) {
            const idx = (wl - 1) * cols + c;
            gr = Math.round(gr * 0.42 + cellR[idx] * 0.58);
            gg = Math.round(gg * 0.42 + cellG[idx] * 0.58);
            gb = Math.round(gb * 0.42 + cellB[idx] * 0.58);
            ga = 0.56;
          }
          drawGlyph(modPos(c, 4) === 0 ? "=" : "-", x, y, gr, gg, gb, ga * bgReveal, false);
        }
        continue;
      }

      const isStepRow = depth % 3 === 0;
      const slabShift = Math.floor(depth / 3) % 2 === 0 ? 0 : 4;

      for (let c = cStart; c < cEnd; c++) {
        const x = originX + c * cellW;

        // Scattered warm Diwali diya oil-lamp sparkles along courtyard terrace edges
        const diyaSeed = modPos(c * 13 + depth * 29, 97);
        if ((depth === 2 || depth === 5 || depth === 9 || depth === 13) && diyaSeed === 7) {
          const flick = 0.72 + 0.28 * Math.sin(t * 3.8 + c * 0.9 + depth * 2.1);
          const isSaffron = modPos(c + depth, 3) === 0;
          const ch = modPos(c + depth, 4) === 0 ? "*" : modPos(c, 2) === 0 ? "+" : "o";
          const a = clamp(0.82 * flick * depthFade, 0, 0.88);
          if (isSaffron) {
            drawGlyph(ch, x, y, 255, 126, 62, a, true, 0.82, true);
          } else {
            drawGlyph(ch, x, y, 255, 186, 76, a, true, 0.82, true);
          }
          continue;
        }

        // Golden-terracotta stone reflections beneath Vidhana Soudha (23..63) & Gopuram (2..17) & Pavilion (65..78)
        if (c >= 0 && c < cols && depth <= 14) {
          const srcR = wl - 1 - Math.round(depth * 1.25);
          let hitIdx = -1;
          if (srcR >= 0 && srcR < wl && cellChar[srcR * cols + c]) {
            hitIdx = srcR * cols + c;
          } else if (srcR + 2 < wl && srcR + 2 >= 0 && cellChar[(srcR + 2) * cols + c]) {
            hitIdx = (srcR + 2) * cols + c;
          } else if (depth <= 8 && cellChar[(wl - 1) * cols + c]) {
            hitIdx = (wl - 1) * cols + c;
          }

          if (hitIdx >= 0) {
            const warmPulse = 0.88 + 0.12 * Math.sin(t * 1.1 + c * 0.28 + depth * 0.42);
            const rr = clamp(Math.round(cellR[hitIdx] * 0.74 + 62), 0, 255);
            const rg = clamp(Math.round(cellG[hitIdx] * 0.70 + 38), 0, 255);
            const rb = clamp(Math.round(cellB[hitIdx] * 0.64 + 22), 0, 255);

            let ch = "";
            if (isStepRow) {
              ch = modPos(c + slabShift, 3) === 0 ? "=" : "-";
            } else if (modPos(c + slabShift, 4) === 0) {
              ch = "·";
            } else if (depth < 9 && modPos(c + depth, 4) === 0) {
              ch = ":";
            }

            if (ch) {
              const a = clamp(cellA[hitIdx] * 0.46 * warmPulse * depthFade, 0, 0.64);
              drawGlyph(ch, x, y, rr, rg, rb, a, cellGlow[hitIdx] === 1 && depth < 10, 0.46);
              continue;
            }
          }
        }

        // Subtle warm sandstone courtyard terrace courses + dark emerald garden flanks
        const leafHash = modPos(c * 7 + depth * 11, 15);
        if (isStepRow && modPos(c + slabShift, 3) === 0) {
          drawGlyph("-", x, y, 118, 82, 56, 0.30 * depthFade, false);
        } else if (leafHash === 0 || leafHash === 5) {
          // Subtle dark-emerald tropical garden foliage beds flanking the sandstone plaza
          const ch = modPos(c + depth, 2) === 0 ? "," : ";";
          drawGlyph(ch, x, y, 42, 108, 76, 0.28 * depthFade, false);
        } else if (leafHash === 10) {
          drawGlyph("·", x, y, 146, 102, 66, 0.24 * depthFade, false);
        }
      }
    }
  }

  function renderFrame(t) {
    const city = activeCity;
    const cols = city.cols;
    const wl = city.waterlineRow;
    const totalCells = cols * wl;
    const wlY = originY + wl * cellH;

    // 1. Clear architectural occupancy grid
    for (let i = 0; i < totalCells; i++) {
      cellChar[i] = "";
      cellA[i] = 0;
      cellGlow[i] = 0;
    }

    const { bgReveal, archT, cloudReveal, allowArch } = computeTimeline(city, t);

    // 2. Populate city architectural phases/stages into 92 x waterlineRow cell buffer
    if (allowArch) {
      for (let pIdx = 0; pIdx < city.phases.length; pIdx++) {
        const phase = city.phases[pIdx];
        const elapsed = archT - phase.startTime;
        if (elapsed <= 0) continue;

        const p = clamp(elapsed / phase.duration, 0, 1);
        const rowSpan = Math.max(1, phase.maxRow - phase.minRow);
        const colSpan = Math.max(1, phase.maxCol - phase.minCol);

        const bottomFrontier = phase.maxRow - p * (rowSpan + 1.8);
        const topFrontier = phase.minRow + p * (rowSpan + 1.8);
        const leftFrontier = phase.minCol + p * (colSpan + 2.4);

        for (let sIdx = 0; sIdx < phase.sprites.length; sIdx++) {
          const sp = phase.sprites[sIdx];
          const row = sp.row;
          if (row < 0 || row >= wl) continue;

          let spriteAlpha = sp.alpha;
          let leadingBoost = false;

          if (phase.reveal === "bottom-up") {
            const delta = row - bottomFrontier;
            if (delta < 0) continue;
            if (p < 1 && delta < 1.6) {
              spriteAlpha *= smoothstep(0, 1.6, delta);
              leadingBoost = delta < 0.85;
            }
          } else if (phase.reveal === "top-down") {
            const delta = topFrontier - row;
            if (delta < 0) continue;
            if (p < 1 && delta < 1.6) {
              spriteAlpha *= smoothstep(0, 1.6, delta);
              leadingBoost = delta < 0.85;
            }
          } else if (phase.reveal === "fade") {
            const stagger = sp.seed * 0.42;
            const lp = clamp((p - stagger) / Math.max(0.18, 1 - stagger), 0, 1);
            if (lp <= 0) continue;
            spriteAlpha *= smoothstep(0, 1, lp);
          } else if (phase.reveal === "flicker") {
            const stagger = sp.seed * 0.48;
            const lp = clamp((p - stagger) / Math.max(0.22, 1 - stagger), 0, 1);
            if (lp <= 0) continue;
            if (lp < 0.55) {
              const flick = Math.sin(lp * 34 + sp.seed * 19);
              if (flick < -0.15) continue;
              spriteAlpha *= 0.42 + 0.58 * lp;
            } else {
              spriteAlpha *= smoothstep(0.5, 1, lp);
            }
          }

          // Calm twinkle / subtle flicker animation once revealed
          if (sp.twinkle) {
            const tw = 0.68 + 0.32 * Math.sin(t * 2.25 + sp.phaseOff);
            spriteAlpha *= tw;
          } else if (sp.flicker && p >= 1) {
            const fl = 0.86 + 0.14 * Math.sin(t * 5.2 + sp.phaseOff);
            spriteAlpha *= fl;
          }

          const chars = sp.chars;
          for (let ci = 0; ci < chars.length; ci++) {
            const ch = chars[ci];
            // Spaces are transparent — never erase underlying architecture!
            if (ch === " ") continue;
            const col = sp.col + ci;
            if (col < 0 || col >= cols) continue;

            let charAlpha = spriteAlpha;
            let charLead = leadingBoost;
            if (phase.reveal === "left-right") {
              const delta = leftFrontier - col;
              if (delta < 0) continue;
              if (p < 1 && delta < 2.2) {
                charAlpha *= smoothstep(0, 2.2, delta);
                charLead = delta < 1.0;
              }
            }
            if (charAlpha <= 0.015) continue;

            const idx = row * cols + col;
            cellChar[idx] = ch;
            cellR[idx] = charLead ? clamp(sp.r + 36, 0, 255) : sp.r;
            cellG[idx] = charLead ? clamp(sp.g + 36, 0, 255) : sp.g;
            cellB[idx] = charLead ? clamp(sp.b + 36, 0, 255) : sp.b;
            cellA[idx] = charAlpha;
            cellGlow[idx] = sp.glow || charLead ? 1 : 0;
          }
        }
      }
    }

    // 3. Prepare base & glow canvas transforms
    bctx.save();
    gctx.save();
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.clearRect(0, 0, viewW, viewH);

    applyFontStyles();
    bctx.textAlign = "center";
    bctx.textBaseline = "middle";
    gctx.textAlign = "center";
    gctx.textBaseline = "middle";

    // 4. Sky twilight & ground backdrop (pure #05070D when bgReveal === 0)
    renderSkyAndHorizon(city, bgReveal, wlY);

    // 5. Starfield, Seoul Baekja Moon & Cranes, Dubai Burj Khalifa sky lasers, meteors,
    //    Beijing crimson fireworks & single crisp Google Cloud 2025 ASCII logo
    const cloudState = getCloudState(city, t, cloudReveal);
    renderStars(city, t, bgReveal, cloudState);
    renderBaekjaMoon(city, t, bgReveal);
    renderSeoulCranes(city, t, bgReveal, cloudState);
    renderDubaiLaserShow(city, t);
    renderMeteors(city, bgReveal);
    renderFireworks(city, t, cloudState);
    renderCloud(city, t, cloudState);
    renderSeoulFireworks(city, t);

    // 7. Ambient city atmosphere (Seoul snow / Dubai breeze / Singapore fireflies / Taipei Pingxi lanterns / Beijing embers / Bangalore petals)
    renderAtmosphere(city, t, bgReveal, cloudState);

    // 7B. Live Burj Khalifa LED facade light show & click Finale Surge (Dubai only)
    applyDubaiLedFacadeShow(city, t);

    // 8. Draw crisp hand-crafted 92 x waterlineRow architectural line-art
    for (let r = 0; r < wl; r++) {
      const y = originY + r * cellH;
      const rowBase = r * cols;
      for (let c = 0; c < cols; c++) {
        const idx = rowBase + c;
        const ch = cellChar[idx];
        if (!ch) continue;
        const isGlow = cellGlow[idx] === 1;
        drawGlyph(
          ch,
          originX + c * cellW,
          y,
          cellR[idx],
          cellG[idx],
          cellB[idx],
          cellA[idx],
          isGlow,
          0.95,
          isGlow
        );
      }
    }

    // 9. City-specific ground below row 42 (rows 43..61, full-bleed across viewport)
    if (bgReveal > 0.008) {
      if (city.groundType === "plaza") {
        renderSeoulPlaza(city, t, bgReveal);
      } else if (city.groundType === "han-river") {
        renderHanRiver(city, t, bgReveal, cloudState);
      } else if (city.groundType === "dunes") {
        renderDubaiDunes(city, t, bgReveal);
      } else if (city.groundType === "water") {
        renderSingaporeWater(city, t, bgReveal, cloudState);
        renderSingaporeMerlion(city, t, bgReveal);
      } else if (city.groundType === "avenue") {
        renderTaiwanAvenue(city, t, bgReveal);
      } else if (city.groundType === "marble-courtyard") {
        renderBeijingCourtyard(city, t, bgReveal);
      } else if (city.groundType === "garden") {
        renderBangaloreGarden(city, t, bgReveal);
      }
    }

    bctx.restore();
    gctx.restore();

    // 10. Composite base + cross-browser dual-pass downscale/upscale optical bloom onto visible canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.drawImage(baseCanvas, 0, 0);

    // Tight optical bloom pass
    btctx.clearRect(0, 0, bloomTight.width, bloomTight.height);
    btctx.imageSmoothingEnabled = true;
    btctx.imageSmoothingQuality = "high";
    btctx.drawImage(glowCanvas, 0, 0, bloomTight.width, bloomTight.height);

    // Wide atmospheric halo pass
    bsctx.clearRect(0, 0, bloomSoft.width, bloomSoft.height);
    bsctx.imageSmoothingEnabled = true;
    bsctx.imageSmoothingQuality = "high";
    bsctx.drawImage(bloomTight, 0, 0, bloomSoft.width, bloomSoft.height);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.58;
    ctx.drawImage(bloomTight, 0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 0.42;
    ctx.drawImage(bloomSoft, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function tick(now) {
    if (!lastNow) lastNow = now;
    const dt = clamp((now - lastNow) / 1000, 0, 0.05);
    lastNow = now;
    simTime += dt;

    // Update active shooting stars & schedule gentle periodic meteor in Act 3
    // (skip in Taipei which uses Pingxi lanterns and Beijing which uses crimson fireworks!)
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.age += dt;
      m.col += m.vx * dt;
      m.row += m.vy * dt;
      if (m.age >= m.life) meteors.splice(i, 1);
    }
    if (
      activeCity.atmosphere !== "lanterns" &&
      activeCity.id !== "beijing" &&
      simTime >= nextAutoMeteorT
    ) {
      spawnMeteor();
      nextAutoMeteorT = simTime + 9.5 + Math.random() * 6.5;
    }

    // Update interactive & periodic Beijing crimson-gold fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
      const fw = fireworks[i];
      fw.age += dt;
      if (fw.age >= fw.totalDur) fireworks.splice(i, 1);
    }
    if (activeCity.id === "beijing") {
      const { bgReveal } = computeTimeline(activeCity, simTime);
      if (bgReveal > 0.7 && simTime >= nextAutoFireworkT) {
        spawnAutoBeijingFirework();
        nextAutoFireworkT = simTime + 5.5 + Math.random() * 2.5;
      }
    }

    // Update Dubai Burj Khalifa click LED Finale Surge
    if (dubaiSurgeAge >= 0) {
      dubaiSurgeAge += dt;
      if (dubaiSurgeAge > 1.48) dubaiSurgeAge = -1;
    }

    // Update Seoul interactive silver-gold Han River + Hunminjeongeum click fireworks
    for (let i = seoulFireworks.length - 1; i >= 0; i--) {
      const sfw = seoulFireworks[i];
      sfw.age += dt;
      if (sfw.age >= sfw.totalDur) seoulFireworks.splice(i, 1);
    }

    // Update interactive user-released Pingxi sky lanterns (Taipei)
    for (let i = userLanterns.length - 1; i >= 0; i--) {
      const ln = userLanterns[i];
      ln.age += dt;
      ln.row -= ln.riseSpeed * dt;
      if (ln.row <= 1.2) userLanterns.splice(i, 1);
    }

    renderFrame(simTime);
    rafId = window.requestAnimationFrame(tick);
  }

  // Load embedded Google Cloud logo
  const logoReady = new Promise((resolve) => {
    if (!cloudLogoUri) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => {
      cloudAscii = buildCloudAsciiCells(img, CLOUD_GRID_COLS, CLOUD_GRID_ROWS);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = cloudLogoUri;
  });

  // Preload Google Fonts (JetBrains Mono + Noto Sans KR/TC/SC incl. full Hunminjeongeum preface) with offline-safe timeout
  const allNonAscii =
    preparedList.map((c) => c.nonAsciiGlyphs).join("") +
    "서울台北北京" +
    HUNMIN_PHRASES.join("");
  const fontsReady =
    document.fonts && typeof document.fonts.load === "function"
      ? Promise.race([
          Promise.all([
            document.fonts.load('600 16px "JetBrains Mono"', "GOOGLECLOUD|=/\\[]"),
            document.fonts.load('700 16px "JetBrains Mono"', "GOOGLECLOUD"),
            document.fonts.load('500 14px "Noto Sans KR"', allNonAscii),
            document.fonts.load('500 14px "Noto Sans TC"', allNonAscii),
            document.fonts.load('500 14px "Noto Sans SC"', allNonAscii),
          ]).catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 900)),
        ])
      : Promise.resolve();

  updateMasthead();
  updateMetrics();

  Promise.all([logoReady, fontsReady]).then(() => {
    ready = true;
    renderFrame(simTime);
    if (!pinned) {
      rafId = window.requestAnimationFrame(tick);
    }
  });

  return {
    selectCity,
    replay,
    destroy() {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
      window.removeEventListener("resize", handleResize);
    },
  };
}
