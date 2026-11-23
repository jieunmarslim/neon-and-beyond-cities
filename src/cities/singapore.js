// Singapore — Hand-Crafted 5-Icon Marina Bay Panorama (92 x 62 grid)
// Pure ES module, zero external imports, zero DOM or script-injection sinks.

export const SINGAPORE_CITY = (() => {
  const COLS = 92;
  const MAX_ROW = 42;

  // Color palette — crisp nocturnal Marina Bay architectural line-art
  const PAL = {
    // Marina Bay CBD glass cluster & Esplanade twin champagne-gold durian domes
    b: { color: "#3A5F7D", glow: false }, // cool glass tower vertical frame
    B: { color: "#5FA9D6", glow: true }, // luminous cyan skyscraper crown rim
    u: { color: "#68C8FF", glow: false }, // crisp cool cyan office window
    y: { color: "#F5C976", glow: false }, // warm gold office window
    d: { color: "#27475E", glow: false }, // deep teal glass shadow
    D: { color: "#FFE29A", glow: true }, // Esplanade bright champagne-gold durian rim
    o: { color: "#D9A95B", glow: false }, // Esplanade warm honey-gold geodesic lattice
    O: { color: "#FFF3CC", glow: true, twinkle: true }, // Esplanade sunlit golden dome glint

    // Marina Bay Sands (champagne-gold / pearl-white / ice-cyan glass)
    G: { color: "#FFE29A", glow: true }, // glowing champagne-gold structural rib
    g: { color: "#C9A55C", glow: false }, // warm sandstone-gold shadow
    W: { color: "#EEF7FF", glow: true }, // luminous pearl-white SkyPark & curved leg
    w: { color: "#A9C8E0", glow: false }, // cool silver-white glass mullion
    I: { color: "#8CE8FF", glow: true }, // glowing ice-cyan infinity pool & terrace
    i: { color: "#4D89B0", glow: false }, // nocturnal curtain-wall glass
    L: { color: "#FFF6D6", glow: true, twinkle: true }, // twinkling warm hotel suite light

    // ArtScience Museum (blooming pearl-white & ice-aqua lotus)
    A: { color: "#F4FBFF", glow: true }, // pure pearl-white petal
    a: { color: "#9CE6FF", glow: true }, // glacial-cyan inner petal shadow
    m: { color: "#5CE6C8", glow: true }, // luminous aqua reflecting-pond plinth

    // Gardens by the Bay Supertrees + Cloud Forest / Flower Dome glass conservatories
    P: { color: "#FF72C6", glow: true }, // orchid-magenta canopy
    p: { color: "#C95A9F", glow: false }, // slender magenta trellis trunk
    V: { color: "#C586FF", glow: true }, // tropical violet core
    E: { color: "#6CE8B0", glow: true }, // emerald-mint canopy & rooftop palms
    e: { color: "#3FA67E", glow: false }, // slender emerald trellis trunk
    C: { color: "#62C8FF", glow: true }, // tropical cyan canopy
    c: { color: "#4296C8", glow: false }, // slender cyan trunk
    T: { color: "#5CE6C8", glow: true }, // luminous turquoise accent
    S: { color: "#FFD875", glow: true }, // delicate golden OCBC Skyway
    k: { color: "#FFF0B8", glow: true, twinkle: true }, // twinkling canopy star
    R: { color: "#D6F4FF", glow: true }, // conservatory bright curved glass rib
    r: { color: "#5AAED1", glow: false }, // conservatory translucent glass bay

    // Singapore Flyer (luminous far-right circular Ferris wheel)
    F: { color: "#EBF8FF", glow: true }, // bright pearl-white wheel rim
    f: { color: "#4D7CA8", glow: false }, // fine steel tension spokes
    H: { color: "#7EE8FF", glow: true, twinkle: true }, // glowing cyan viewing capsule
    h: { color: "#FFE69C", glow: true, twinkle: true }, // glowing champagne capsule
  };

  // Emit contiguous runs sharing identical palette token, skipping spaces.
  const pushArt = (list, startRow, startCol, rows) => {
    for (let r = 0; r < rows.length; r += 1) {
      const [chars, colors] = rows[r];
      const row = startRow + r;
      if (row < 0 || row > MAX_ROW) continue;
      let i = 0;
      while (i < chars.length) {
        const ch = chars[i];
        const code = colors[i];
        if (ch === " " || code === " " || !PAL[code]) {
          i += 1;
          continue;
        }
        const runStart = i;
        while (
          i < chars.length &&
          chars[i] !== " " &&
          colors[i] === code
        ) {
          i += 1;
        }
        const col = startCol + runStart;
        const text = chars.slice(runStart, i);
        if (col >= 0 && col + text.length <= COLS) {
          const spec = PAL[code];
          const sprite = { row, col, text, color: spec.color };
          if (spec.glow) sprite.glow = true;
          if (spec.twinkle) sprite.twinkle = true;
          list.push(sprite);
        }
      }
    }
  };

  // =========================================================================
  // PHASE 1: "esplanade-cbd" — Marina Bay CBD Glass Cluster + Esplanade Durian Domes
  // Cols 0..15, rows 24..42 — cool cyan-slate towers behind glowing gold twin domes!
  // =========================================================================
  const esplanadeCbd = [];

  // 1A. Stepped Marina Bay CBD glass towers rising cleanly behind Esplanade (rows 24..35)
  pushArt(esplanadeCbd, 24, 0, [
    ["       __       ", "       BB       "],
    ["      |==|      ", "      bBBb      "],
    ["      |::|      ", "      buub      "],
    [" __   |--|      ", " BB   bbyb      "],
    ["|==|  |::|  ___ ", "bBBb  buub  BBB "],
    ["|::|_ |--|_|===|", "buubBbbyybBbBBBb"],
    ["|--|:||::|::|--|", "bbybubuubuuubyyb"],
    ["|::|:||--|::|::|", "buubybbyybuubuub"],
    ["|--|:||::|--|--|", "bbybubuubyybbyyb"],
    ["|::| ||::|::|::|", "buub bduudbbbuub"],
    ["|--| ||--|::|--|", "bbyb bdyydbbbyyb"],
    ["|::| ||::|::|::|", "buub bduudbbbuub"],
  ]);

  // Far-left slender tower base extending cleanly to row 42 beside Esplanade left dome
  pushArt(esplanadeCbd, 36, 0, [
    ["|:", "bu"],
    ["|-", "by"],
    ["|:", "bu"],
    ["|-", "by"],
    ["|:", "bu"],
    ["|-", "bd"],
    ["|=", "bB"],
  ]);

  // 1B. Esplanade — Theatres on the Bay (twin spiky champagne-gold durian domes, cols 2..15, rows 36..42)
  pushArt(esplanadeCbd, 36, 2, [
    ["  .=O==.  .=. ", "  DDODDD  DDD "],
    [" /^v^v^v\\/^v^\\", " DoDoDoDoDoDoD"],
    ["/v^v^v^v^v^v^\\", "DoOoDoDoDoOoDo"],
    ["|^v^v^v^v^v^v|", "DoDoDoOoDoDoDo"],
    ["|============|", "DDDDDDDDDDDDDD"],
    ["|/\\/\\/\\/\\/\\/\\|", "DoDoDoDoDoDoDD"],
    ["[==--==--==--]", "oDDooDDooDDooD"],
  ]);

  // =========================================================================
  // PHASE 2: "mbs" — Marina Bay Sands (cols 16..48, rows 20..42)
  // Real-photo proportions: thin overhanging SkyPark boat deck + rooftop palms,
  // 3 sleek glass towers with luminous silver-white sweeping back-legs + warm windows!
  // =========================================================================
  const mbs = [];

  // 2A. Delicate Rooftop Palms, Penthouse Hints, Infinity Pool & SkyPark Hull (rows 20..23, cols 16..48)
  // Left cantilever overhangs 5 cols (cols 16..20) past Tower 1; sleek stern at col 47..48
  pushArt(mbs, 20, 16, [
    ["   [_]  Y  ~~~~~~~~~~~~  Y  [_]  ", "   wWw  E  IIIIIIIIIIII  E  wWw  "],
    [" /=============================\\ ", " GWWWWWWWWWWWWWWWWWWWWWWWWWWWWWG "],
    ["<=====[==--==--==--==--==--==]==>", "IIIIIIGWWwwWWwwWWwwWWwwWWwwWWGIII"],
    [" \\_____________________________/ ", " wWWWWWWWWWWWWWWWWWWWWWWWWWWWWWw "],
  ]);

  // 2B. Three Sleek Slightly-Angled Glass Towers (rows 24..42)
  // True-to-photo proportions: T1(21..26), T2(31..36), T3(41..46) with luminous curved left legs
  // and warm golden hotel windows glowing inside cool midnight-teal glass!
  const towers = [
    { x: 21, lits: [25, 29, 34, 38] },
    { x: 31, lits: [26, 30, 33, 37] },
    { x: 41, lits: [25, 28, 35, 39] },
  ];

  for (let t = 0; t < towers.length; t += 1) {
    const { x, lits } = towers[t];
    const lit = (r) => lits.includes(r);

    // Upper vertical curtain-wall shafts (rows 24..30, width 6 at x..x+5)
    pushArt(mbs, 24, x, [
      ["|====|", "GWWWWG"],
      [lit(25) ? "|:* :|" : "|:: :|", lit(25) ? "GiL iG" : "Gii iG"],
      [lit(26) ? "|-= *|" : "|-= -|", lit(26) ? "Ggy LG" : "Ggy yG"],
      ["|:= =|", "Giy yG"],
      [lit(28) ? "|*- :|" : "|-- :|", lit(28) ? "GLy iG" : "Gyy iG"],
      [lit(29) ? "| :* |" : "|:: .|", lit(29) ? "G iL G" : "Gii iG"],
      [lit(30) ? "|-* -|" : "|-: -|", lit(30) ? "GyL yG" : "Gyi yG"],
    ]);

    // Mid-lower luminous silver-white sweeping back-leg + terrace band (rows 31..36, width 7 at x-1..x+5)
    pushArt(mbs, 31, x - 1, [
      ["/|:: :|", "WGii iG"],
      ["/|====|", "WGIIIIW"],
      [lit(33) ? "/|:* -|" : "/|:: -|", lit(33) ? "WGiL yG" : "WGii yG"],
      [lit(34) ? "/|-= *|" : "/|-= :|", lit(34) ? "WGgy LG" : "WGgy iG"],
      [lit(35) ? "/| :* |" : "/|.: :|", lit(35) ? "WG iL G" : "WGii iG"],
      ["/|-- -|", "WGyy yG"],
    ]);

    // Lower grand curved A-leg flaring cleanly to bay edge (rows 37..42, width 8 at x-2..x+5)
    pushArt(mbs, 37, x - 2, [
      [lit(37) ? "/ |:* :|" : "/ |:: :|", lit(37) ? "W GiL iG" : "W Gii iG"],
      [lit(38) ? "/ |- *:|" : "/ |-- :|", lit(38) ? "W Gy LiG" : "W Gyy iG"],
      [lit(39) ? "/ |:* -|" : "/ |:: -|", lit(39) ? "W GiL yG" : "W Gii yG"],
      ["/ |====|", "W GWWIIW"],
      ["/:|:: :|", "WdGii iG"],
      ["[=|==-=]", "WGGWWGGG"],
    ]);
  }

  // Subtle low glass atrium pavilions linking the 3 tower bases right on rows 40..42
  pushArt(mbs, 40, 27, [
    ["__", "ww"],
    ["--", "ii"],
    ["==", "gg"],
  ]);
  pushArt(mbs, 40, 37, [
    ["__", "ww"],
    ["--", "ii"],
    ["==", "gg"],
  ]);

  // =========================================================================
  // PHASE 3: "lotus" — ArtScience Museum (cols 50..60, rows 34..42)
  // Crisp pearl-white & glacial-cyan blooming lotus right at the water's edge!
  // =========================================================================
  const lotus = [];

  pushArt(lotus, 34, 50, [
    ["   /\\ /\\   ", "   AA AA   "],
    [" \\/ |:| \\/ ", " AA AaA AA "],
    ["\\|:/|:|\\:|/", "AAaAAaAAaAA"],
    [" \\|:|:|:|/ ", " AaaAaAaaA "],
    ["  \\==|==/  ", "  AAAAAAA  "],
    ["   \\###/   ", "   aAAAa   "],
    ["    [=]    ", "    mAm    "],
    ["   /___\\   ", "   aAAAa   "],
    [" _/=====\\_ ", " mAAAAAAAm "],
  ]);

  // =========================================================================
  // PHASE 4: "supertrees" — Gardens by the Bay (cols 62..78, rows 21..42)
  // 3 staggered glowing Supertrees (emerald, orchid-magenta hero, cyan) +
  // golden OCBC Skyway + ribbed glass Cloud Forest & Flower Dome arches at base!
  // =========================================================================
  const supertrees = [];

  // 4A. Center Tall Orchid-Magenta/Violet Hero Supertree (center col 70, rows 21..42)
  pushArt(supertrees, 21, 65, [
    ["  . * + * .", "  C k V k C"],
    ["\\==#####==/", "PPPVVVVVPPP"],
    [" \\=#####=/ ", " PPVVVVVPP "],
    ["  \\:-#-:/  ", "  PPPVPPP  "],
    ["   \\|#|/   ", "   PPVPP   "],
    ["    |X|    ", "    pCp    "],
    ["    |:|    ", "    pVp    "],
    ["    |#|    ", "    pPp    "],
    ["    |X|    ", "    pVp    "],
    ["    |:|    ", "    pCp    "],
    ["    |#|    ", "    pVp    "],
    ["    |X|    ", "    pPp    "],
    ["    |:|    ", "    pVp    "],
    ["    |#|    ", "    pCp    "],
    ["    |X|    ", "    pVp    "],
    ["    |:|    ", "    pPp    "],
    ["    |#|    ", "    pVp    "],
    ["    |X|    ", "    pCp    "],
    ["    |:|    ", "    pVp    "],
    ["    |#|    ", "    pPp    "],
    ["    |X|    ", "    pVp    "],
    ["    |#|    ", "    pVp    "],
  ]);

  // 4B. Left Emerald Supertree rising cleanly behind Cloud Forest Dome (center col 65, rows 25..34)
  pushArt(supertrees, 25, 62, [
    [" . * . ", " C k E "],
    ["\\=#=#=/", "EETETEE"],
    [" \\=#=/ ", " EETEE "],
    ["  \\|/  ", "  ETE  "],
    ["   |   ", "   e   "],
    ["   |   ", "   e   "],
    ["   |   ", "   e   "],
    ["   |   ", "   e   "],
    ["   |   ", "   e   "],
    ["   |   ", "   e   "],
  ]);

  // 4C. Right Luminous Cyan Supertree rising cleanly behind Flower Dome (center col 75, rows 26..36)
  pushArt(supertrees, 26, 72, [
    [" . + . ", " E k C "],
    ["\\=#=#=/", "CCTCTCC"],
    [" \\=#=/ ", " CCTCC "],
    ["  \\|/  ", "  CTC  "],
    ["   |   ", "   c   "],
    ["   |   ", "   c   "],
    ["   |   ", "   c   "],
    ["   |   ", "   c   "],
    ["   |   ", "   c   "],
    ["   |   ", "   c   "],
    ["   |   ", "   c   "],
  ]);

  // 4D. Delicate Golden OCBC Skyway linking all 3 Supertrees cleanly at row 31
  pushArt(supertrees, 31, 66, [["===", "SSS"]]);
  pushArt(supertrees, 31, 72, [["===", "SSS"]]);

  // 4E. Curved Ribbed Glass Cloud Forest Dome (cols 62..68, rows 35..42)
  pushArt(supertrees, 35, 62, [
    ["  .==. ", "  RRRR "],
    [" /|::|\\", " RrRRrR"],
    ["/:|::|\\", "RrRrRrR"],
    ["|:|::||", "RrRrRrR"],
    ["|:|::||", "RrRrRrR"],
    ["|:|::||", "RrRrRrR"],
    ["|=====|", "RRRRRRR"],
    ["[==--=]", "rRRrrRR"],
  ]);

  // 4F. Sweeping Curved Ribbed Glass Flower Dome (cols 72..78, rows 37..42)
  pushArt(supertrees, 37, 72, [
    [" .===. ", " RRRRR "],
    ["/|:::|\\", "RrRRRrR"],
    ["||:::||", "RrRrRrR"],
    ["||:::||", "RrRrRrR"],
    ["|=====|", "RRRRRRR"],
    ["[=--==]", "rRrrRRR"],
  ]);

  // =========================================================================
  // PHASE 5: "flyer" — Far-Right Singapore Flyer (cols 79..91, rows 27..42)
  // Crisp luminous circular Ferris wheel with radial spokes & stepped base on row 42!
  // =========================================================================
  const flyer = [];

  pushArt(flyer, 27, 79, [
    ["    o-*-o    ", "    HFhFH    "],
    ["  o/  |  \\o  ", "  hF  f  Fh  "],
    [" o/ \\ | / \\o ", " HF f f f FH "],
    [" |   \\|/   | ", " F   fff   F "],
    [" *---(O)---* ", " HfffWGWfffH "],
    [" |   /|\\   | ", " F   fff   F "],
    [" o\\ / | \\ /o ", " HF f f f FH "],
    ["  o\\  |  /o  ", "  hF  f  Fh  "],
    ["    o-*-o    ", "    HFhFH    "],
    // Sleek diagonal A-frame support legs & stepped bayfront terminal flush on row 42!
    ["     /|\\     ", "     WfW     "],
    ["    / | \\    ", "    W f W    "],
    ["   /  |  \\   ", "   W  f  W   "],
    ["   _______   ", "   wWWWWWw   "],
    ["  /=======\\  ", "  wGGGGGGGw  "],
    [" /==-----==\\ ", " wGGwwwwwGGw "],
    ["[===========]", "wGGGGGGGGGGGw"],
  ]);

  return {
    id: "singapore",
    label: "Singapore",
    title: "SINGAPORE",
    coords: "1.3521° N  103.8198° E",
    skyPalette: ["#040C12", "#09222C"],
    ground: { type: "water" },
    atmosphere: "fireflies",
    revealOrder: "buildings-first",
    handle: "@googlecloud",
    cols: 92,
    rows: 62,
    waterlineRow: 43,
    moon: null,
    cloudFloat: { row: 5, centerCol: 46, driftAmp: 12 },
    phases: [
      {
        name: "esplanade-cbd",
        startTime: 0.5,
        duration: 2.5,
        reveal: "bottom-up",
        sprites: esplanadeCbd,
      },
      {
        name: "mbs",
        startTime: 2.2,
        duration: 3.2,
        reveal: "bottom-up",
        sprites: mbs,
      },
      {
        name: "lotus",
        startTime: 4.8,
        duration: 2.0,
        reveal: "bottom-up",
        sprites: lotus,
      },
      {
        name: "supertrees",
        startTime: 6.2,
        duration: 2.4,
        reveal: "bottom-up",
        sprites: supertrees,
      },
      {
        name: "flyer",
        startTime: 7.6,
        duration: 2.2,
        reveal: "bottom-up",
        sprites: flyer,
      },
    ],
  };
})();
