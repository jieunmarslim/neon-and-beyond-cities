// Taipei — Luminous Plum-Indigo Nocturnal Panorama (92 x 62 grid)
// Pure ES module, zero external imports, zero DOM or script-injection sinks.
// Six hand-crafted iconic Taipei landmarks aligned to real-life proportions:
// 1. Miramar Ferris Wheel (cols 1..10, rows 33..42)
// 2. Taipei Performing Arts Center — TPAC (cols 12..21, rows 35..42)
// 3. Chiang Kai-shek Memorial Hall (cols 24..42, rows 27..42)
// 4. Taipei Nanshan Plaza & Xinyi Towers (cols 45..53 & cols 69..76, rows 21..42)
// 5. Taipei 101 — 8-tier flared jade-emerald & champagne-gold pagoda tower (cols 55..67, rows 6..42)
// 6. Grand Hotel Taipei + Elephant Mountain curve (cols 78..90, rows 31..42)

export const TAIPEI_CITY = (() => {
  const COLS = 92;
  const MAX_ROW = 42;

  const PAL = {
    // Boulevard horizon datum (row 42 quiet gaps)
    h: { color: "#4E4570", glow: false },
    H: { color: "#8B7AA8", glow: false },

    // Miramar Ferris Wheel (warm champagne-gold & pearl)
    M: { color: "#FFF4D2", glow: true },
    m: { color: "#FFF6DC", glow: true, twinkle: true },
    F: { color: "#F5D07A", glow: true },
    f: { color: "#B88C4A", glow: false },
    A: { color: "#9EB0C9", glow: false },
    a: { color: "#D6AE60", glow: false },

    // Taipei Performing Arts Center (slate-blue cube + glowing brushed-silver sphere)
    Q: { color: "#FFFFFF", glow: true },
    S: { color: "#E6F0FA", glow: true },
    s: { color: "#A4B8D4", glow: false },
    u: { color: "#687E9E", glow: false },
    T: { color: "#7898BF", glow: true },
    t: { color: "#48658A", glow: false },
    d: { color: "#324966", glow: false },

    // Chiang Kai-shek Memorial Hall (deep royal cobalt-blue octagonal roof + white marble)
    B: { color: "#60A5FA", glow: true },
    b: { color: "#3B82F6", glow: true },
    z: { color: "#2563EB", glow: false },
    W: { color: "#F2F6FC", glow: true },
    w: { color: "#C7D2E2", glow: false },
    v: { color: "#8A9BB5", glow: false },
    K: { color: "#704C38", glow: false },
    k: { color: "#4A3226", glow: false },
    P: { color: "#E8BC6B", glow: true },

    // Taipei Nanshan Plaza (sleek slanted modern silver-blue glass prism)
    N: { color: "#E2EEFA", glow: true },
    n: { color: "#8FB8E0", glow: true },
    c: { color: "#5278A3", glow: false },
    L: { color: "#FFF2C6", glow: true, twinkle: true },

    // Taipei 101 (8-tier jade-emerald & champagne-gold bamboo-pagoda skyscraper)
    I: { color: "#FFF8DF", glow: true, twinkle: true },
    G: { color: "#F5D07A", glow: true },
    g: { color: "#D4A350", glow: false },
    J: { color: "#34D399", glow: true },
    j: { color: "#2BB58A", glow: false },
    e: { color: "#1E7D63", glow: false },
    E: { color: "#A7F3D0", glow: true },

    // Xinyi Towers (shimmering warm-amber & companion jade-silver towers)
    X: { color: "#F5C478", glow: true },
    x: { color: "#C48A4B", glow: false },
    y: { color: "#7A5438", glow: false },
    C: { color: "#6EE7B7", glow: true },
    q: { color: "#2D8A70", glow: false },

    // Grand Hotel Taipei (imperial gold double roof + dignified crimson colonnade)
    Y: { color: "#F5C563", glow: true },
    o: { color: "#CC9034", glow: false },
    R: { color: "#E35248", glow: true },
    r: { color: "#B0322A", glow: false },
    U: { color: "#FFCE78", glow: true },

    // Elephant Mountain (clean gentle dark-emerald curve)
    V: { color: "#276B57", glow: false },
    p: { color: "#184539", glow: false },
  };

  function pushArt(list, startRow, startCol, rows) {
    for (let r = 0; r < rows.length; r += 1) {
      const [chars, codes] = rows[r];
      const row = startRow + r;
      if (chars.length !== codes.length) {
        throw new Error(
          `Taipei row ${row} mismatch: chars=${chars.length} ("${chars}") vs codes=${codes.length} ("${codes}")`
        );
      }
      if (row < 0 || row > MAX_ROW) {
        throw new Error(`Taipei row out of bounds: ${row}`);
      }
      let i = 0;
      while (i < chars.length) {
        const ch = chars[i];
        const code = codes[i];
        if (ch === " " || code === " ") {
          i += 1;
          continue;
        }
        const spec = PAL[code];
        if (!spec) {
          throw new Error(`Unknown palette code "${code}" at row ${row}, col ${startCol + i}`);
        }
        const runStart = i;
        while (i < chars.length && chars[i] !== " " && codes[i] === code) {
          i += 1;
        }
        const col = startCol + runStart;
        const text = chars.slice(runStart, i);
        if (col < 0 || col + text.length > COLS) {
          throw new Error(
            `Taipei col out of bounds at row ${row}: col=${col}, len=${text.length}, text="${text}"`
          );
        }
        const sprite = { row, col, text, color: spec.color };
        if (spec.glow) sprite.glow = true;
        if (spec.twinkle) sprite.twinkle = true;
        list.push(sprite);
      }
    }
  }

  // =========================================================================
  // PHASE 1: "boulevard" — Subtle Taipei Evening Boulevard Datum (row 42 gaps)
  // =========================================================================
  const boulevard = [];
  pushArt(boulevard, 42, 11, [["-", "h"]]);
  pushArt(boulevard, 42, 22, [["--", "hH"]]);
  pushArt(boulevard, 42, 43, [["--", "Hh"]]);
  pushArt(boulevard, 42, 54, [["-", "h"]]);
  pushArt(boulevard, 42, 68, [["-", "h"]]);
  pushArt(boulevard, 42, 77, [["-", "h"]]);

  // =========================================================================
  // PHASE 2: "cks-memorial" — Chiang Kai-shek Memorial Hall (cols 24..42, rows 27..42)
  // Iconic white marble monument & symmetric grand staircase crowned by its
  // unmistakable deep royal cobalt-blue octagonal double-tier roof.
  // =========================================================================
  const cksMemorial = [];
  pushArt(cksMemorial, 27, 24, [
    ["         *         ", "         P         "], // r27: warm gold octagonal finial
    ["        /^\\        ", "        BBB        "], // r28: royal cobalt roof peak
    ["      _//|\\\\_      ", "      BbBBBbB      "], // r29: upper octagonal cobalt slope
    ["    _///===\\\\\\_    ", "    BbBbbbbbBbB    "], // r30: upper sweeping cobalt eaves
    ["      |=---=|      ", "      WwvvvwW      "], // r31: recessed white marble clerestory
    ["   _////===\\\\\\\\_   ", "   BbbBbbbbbBbbB   "], // r32: lower wider octagonal cobalt roof
    ["  ~/====---====\\~  ", "  BBbbbbzzzbbbbBB  "], // r33: broad upturned royal-blue eaves
    ["    |===[#]===|    ", "    WWWWwPwWWWW    "], // r34: white marble cornice + gold plaque
    ["    |::/===\\::|    ", "    WwwWWWWWwwW    "], // r35: marble hall + semicircular arch crown
    ["   /|::|:::|::|\\   ", "   WWwwWKkKWwwWW   "], // r36: tapered marble facade + dark portal
    ["   ||::|:::|::||   ", "   WWwwWKkKWwwWW   "], // r37: white marble walls + central arch
    ["   ||==|:::|==||   ", "   WWWWWKkKWWWWW   "], // r38: marble threshold & doorway base
    [" _====-+===+-====_ ", " wWWWWvvWWWvvWWWWw "], // r39: broad white marble terrace balustrade
    ["|=====/=====\\=====|", "wWWWWWvWWWWWvWWWWWw"], // r40: terraced marble plinth + central stairs
    ["|----/=======\\----|", "wvvvvvWWWWWWWvvvvvw"], // r41: stone balusters + widening marble steps
    ["=====#########=====", "wwwwwWWWWWWWWWwwwww"], // r42: grounded white marble apron
  ]);

  // =========================================================================
  // PHASE 3: "taipei-101" — Taipei 101 Hero Skyscraper (cols 55..67, rows 6..42)
  // Unmistakable 8-tier flared jade-emerald & champagne-gold bamboo-pagoda
  // skyscraper with golden circular ruyi coin medallion (O) and needle spire.
  // =========================================================================
  const taipei101 = [];
  pushArt(taipei101, 6, 55, [
    ["      *      ", "      I      "], // r06: twinkling needle spire beacon (col 61)
    ["      |      ", "      G      "], // r07: tall champagne-gold spire
    ["      |      ", "      G      "], // r08: spire shaft
    ["     /|\\     ", "     JGJ     "], // r09: spire collar
    ["    [=#=]    ", "    GGEGG    "], // r10: glowing golden observation lantern
    ["    |===|    ", "    JGGGJ    "], // r11: lantern crown base
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r12: TIER 8 — flared jade-gold bamboo rim
    ["   \\|:*:|/   ", "   JejIjeJ   "], // r13: angled emerald glass + center uplight
    ["   |:===:|   ", "   jejjjej   "], // r14: tucked bamboo waist
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r15: TIER 7
    ["   \\|:#:|/   ", "   JejEjeJ   "], // r16
    ["   |:===:|   ", "   jejjjej   "], // r17
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r18: TIER 6
    ["   \\|:*:|/   ", "   JejEjeJ   "], // r19
    ["   |:===:|   ", "   jejjjej   "], // r20
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r21: TIER 5
    ["   \\|:#:|/   ", "   JejEjeJ   "], // r22
    ["   |:===:|   ", "   jejjjej   "], // r23
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r24: TIER 4
    ["   \\|:*:|/   ", "   JejIjeJ   "], // r25
    ["   |:===:|   ", "   jejjjej   "], // r26
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r27: TIER 3
    ["   \\|:#:|/   ", "   JejEjeJ   "], // r28
    ["   |:===:|   ", "   jejjjej   "], // r29
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r30: TIER 2
    ["   \\|:*:|/   ", "   JejEjeJ   "], // r31
    ["   |:===:|   ", "   jejjjej   "], // r32
    ["  \\===#===/  ", "  GJJJEJJJG  "], // r33: TIER 1 (lowest bamboo tier)
    ["   \\|:#:|/   ", "   JejEjeJ   "], // r34
    ["   |=====|   ", "   JjjJjjJ   "], // r35: upper podium collar
    ["   |=(O)=|   ", "   JjGMGjJ   "], // r36: ICONIC GOLDEN RUYI COIN MEDALLION (O)
    ["  /|==#==|\\  ", "  JjeGEGejJ  "], // r37: flared pagoda podium shoulder
    ["  ||:|:|:||  ", "  JjejejjeJ  "], // r38: faceted emerald podium glass
    [" /||:|#|:||\\ ", " JjeJeEeJejJ "], // r39: wider pagoda podium skirt
    [" ||:|:|:|:|| ", " JjejejjejeJ "], // r40: lower emerald curtain wall
    ["/||==:#:==||\\", "JjeGGeGeGGejJ"], // r41: warm champagne-gold grand entrance
    ["|====###====|", "GGGGGGIGGGGGG"], // r42: grounded Taipei 101 base plaza
  ]);

  // =========================================================================
  // PHASE 4: "xinyi-towers" — Taipei Nanshan Plaza (cols 45..53) &
  // Xinyi Towers (cols 69..76), rows 21..42
  // =========================================================================
  const xinyiTowers = [];

  // 4A. Taipei Nanshan Plaza (cols 45..53, rows 21..42) — slanted silver-blue prism
  pushArt(xinyiTowers, 21, 45, [
    ["   /| |\\ ", "   NN NN "], // r21: signature split slanted glass crown
    ["   ||=|| ", "   NnnnN "], // r22
    ["  /||:|| ", "  NncncN "], // r23: sleek inward-sloping left facet
    ["  |:|:|| ", "  NcncnN "], // r24
    ["  |:|*|| ", "  NcnLnN "], // r25: twinkling office window
    ["  |:|:|| ", "  NcncnN "], // r26
    ["  |===|| ", "  NnnnnN "], // r27: cool silver spandrel band
    ["  |:|:|| ", "  NcncnN "], // r28
    [" /|:|:||\\", " NncncnnN"], // r29: mid-tower outward prism facet
    [" ||:|:|:|", " NncncncN"], // r30
    [" ||*|:|:|", " NnLncncN"], // r31
    [" ||:|:|:|", " NncncncN"], // r32
    [" ||===|:|", " NnnnnncN"], // r33
    [" ||:|:|:|", " NncncncN"], // r34
    [" ||:|:|*|", " NncncnLN"], // r35
    [" ||:|:|:|", " NncncncN"], // r36
    [" ||:|:|:|", " NncncncN"], // r37
    ["/||:|:|:|", "NnncncncN"], // r38: faceted lower-left glass atrium wing
    ["|:|===|:|", "NcnnnnncN"], // r39
    ["|:|:|:|:|", "NcncncncN"], // r40
    ["|:|:|*|:|", "NcncnLncN"], // r41
    ["|===#===|", "NnnnNnnnN"], // r42: grounded silver-blue lobby plaza
  ]);

  // 4B. Tall Warm-Amber Xinyi Tower (cols 69..72, rows 21..42)
  pushArt(xinyiTowers, 21, 69, [
    ["|==|", "xXXx"], // r21: recessed warm-bronze parapet crown
    ["+==+", "XXXX"], // r22: luminous amber crown cornice
    ["|::|", "yXXy"], // r23
    ["|:*|", "yxLy"], // r24: twinkling suite light
    ["|::|", "yXXy"], // r25
    ["|--|", "yXXy"], // r26: horizontal floor divider
    ["|::|", "yXXy"], // r27
    ["|*:|", "yLxy"], // r28
    ["|::|", "yXXy"], // r29
    ["|--|", "yxxy"], // r30
    ["|::|", "yXXy"], // r31
    ["|::|", "yxxy"], // r32
    ["|:*|", "yxLy"], // r33
    ["|--|", "yXXy"], // r34
    ["|::|", "yXXy"], // r35
    ["|::|", "yxxy"], // r36
    ["|*:|", "yLxy"], // r37
    ["|--|", "yXXy"], // r38
    ["|::|", "yXXy"], // r39
    ["|::|", "yXXy"], // r40
    ["|==|", "xXXx"], // r41: warm glowing lobby arcade
    ["+==+", "XXXX"], // r42: grounded on row 42
  ]);

  // 4C. Low Connecting Xinyi Pavilion (col 73, rows 39..42)
  pushArt(xinyiTowers, 39, 73, [
    ["=", "x"],
    [":", "X"],
    ["=", "x"],
    ["=", "X"],
  ]);

  // 4D. Companion Emerald-Jade Xinyi Glass Tower (cols 74..76, rows 26..42)
  pushArt(xinyiTowers, 26, 74, [
    ["+=+", "CCC"], // r26: crisp mint-jade glass roof
    ["|=|", "qCq"], // r27
    ["|:|", "qCq"], // r28
    ["|=|", "qCq"], // r29
    ["|*|", "qLq"], // r30: twinkling office light
    ["|=|", "qCq"], // r31
    ["|:|", "qCq"], // r32
    ["|=|", "qCq"], // r33
    ["|:|", "qCq"], // r34
    ["|=|", "qCq"], // r35
    ["|*|", "qLq"], // r36
    ["|=|", "qCq"], // r37
    ["|:|", "qCq"], // r38
    ["|=|", "qCq"], // r39
    ["|:|", "qCq"], // r40
    ["|=|", "qCq"], // r41
    ["+=+", "CCC"], // r42: grounded on row 42
  ]);

  // =========================================================================
  // PHASE 5: "miramar-tpac" — Miramar Ferris Wheel (cols 1..10, rows 33..42)
  // & Taipei Performing Arts Center (cols 12..21, rows 35..42)
  // =========================================================================
  const miramarTpac = [];

  // 5A. Miramar Ferris Wheel — luminous warm-gold & pearl ring + A-frame base
  pushArt(miramarTpac, 33, 1, [
    ["  o*==*o  ", "  mMFFMm  "], // r33: glowing top gondolas & golden arc
    [" o/ || \\o ", " mF ff Fm "], // r34: airy upper radial spokes
    ["*/ \\||/ \\*", "MF ffff FM"], // r35: luminous outer ring + diagonal spokes
    ["*|--()--|*", "MFffMMffFM"], // r36: bright pearl-gold center hub ()
    ["*\\ /||\\ /*", "MF ffff FM"], // r37: lower radial spokes
    [" o\\ || /o ", " mF ff Fm "], // r38: lower golden rim
    ["  o*==*o  ", "  mMFFMm  "], // r39: bottom rim gondolas
    ["  / == \\  ", "  A aa A  "], // r40: open A-frame steel yoke
    [" /  ||  \\ ", " A  AA  A "], // r41: diagonal support legs
    ["/===--===\\", "AaaaFFaaaA"], // r42: grounded plaza base on row 42
  ]);

  // 5B. Taipei Performing Arts Center — slate-blue glass cube + brushed-silver sphere
  pushArt(miramarTpac, 35, 12, [
    ["+========+", "TTTTTTTTTT"], // r35: crisp slate-blue cube roof parapet
    ["| .===. -|", "t QSSSs dt"], // r36: top curve of glowing brushed-silver sphere
    ["|(*####)-|", "tSQQSSssdt"], // r37: specular white-silver highlight + orb belly
    ["|(###::)-|", "tsSSssuudt"], // r38: rounded brushed-silver lower shading
    ["| '===' -|", "t suuus dt"], // r39: underside reflection of cantilevered sphere
    ["|::: \\ --|", "tddd t ddt"], // r40: sleek cantilevered sphere strut + dark glass
    ["|:::: \\--|", "tdddd tddt"], // r41: shadowed atrium beneath the sphere
    ["+====+===+", "TttttTtttT"], // r42: grounded glass cube plinth
  ]);

  // =========================================================================
  // PHASE 6: "grand-hotel" — Grand Hotel Taipei (cols 78..88, rows 34..42)
  // Dignified imperial golden-amber double palace roof + vermilion-crimson colonnade
  // =========================================================================
  const grandHotel = [];
  pushArt(grandHotel, 34, 78, [
    ["  /=====\\  ", "  YoooooY  "], // r34: upper tier imperial golden palace roof
    ["~/=======\\~", "YYoooooooYY"], // r35: broad upturned golden double eaves
    [" |:|:|:|:| ", " RURURURUR "], // r36: crimson palace pillars + warm galleries
    [" |=======| ", " rRRRRRRRr "], // r37: ornate vermilion-gold gallery cornice
    [" |:|:|:|:| ", " RURURURUR "], // r38: crimson colonnade + lantern-lit bays
    [" |=======| ", " rRRRRRRRr "], // r39: horizontal crimson cornice
    [" |:_/=\\_:| ", " RUYYYYYUR "], // r40: golden ceremonial entrance portico roof
    [" |::|#|::| ", " rUrRURrUr "], // r41: palace columns + warm glowing entry hall
    ["_===/#\\===_", "aYYYRUUYYYa"], // r42: grounded palace terrace & grand steps
  ]);

  // =========================================================================
  // PHASE 7: "elephant-mountain" — Gentle Dark-Emerald Elephant Mountain (상산)
  // Clean, unbroken nocturnal emerald ridge cradling Grand Hotel and sloping
  // softly down to the far-right horizon (cols 78..90, rows 31..42, 0 overlaps).
  // =========================================================================
  const elephantMountain = [];
  pushArt(elephantMountain, 31, 78, [
    ["   ._--.     ", "   VVVVV     "], // r31: calm rounded Elephant Mountain crest
    [" _/  ~~ \\_   ", " VV  pp VV   "], // r32: smooth forested dark-emerald ridge
    ["/  ~    ~ \\  ", "V  p    p V  "], // r33: gentle mountain contour behind palace
    ["           \\ ", "           V "], // r34: continuous right slope behind roof
    ["            \\", "            V"], // r35: smooth hillside curving toward edge
    ["           ~ ", "           p "], // r36: subtle dark-emerald forest slope
    ["            ~", "            p"], // r37
    ["             ", "             "], // r38
    ["           ~ ", "           p "], // r39
    ["            ~", "            p"], // r40
    ["           ~ ", "           p "], // r41
    ["           --", "           VV"], // r42: gentle mountain foot on far-right horizon
  ]);

  return {
    id: "taipei",
    label: "Taipei",
    title: "TAIPEI",
    nativeTitle: "台北",
    titleColor: "#34D399",
    coords: "25.0330° N  121.5654° E",
    skyPalette: ["#090714", "#1B1530"],
    ground: { type: "avenue" },
    atmosphere: "lanterns",
    revealOrder: "buildings-first",
    handle: "@googlecloud",
    cols: 92,
    rows: 62,
    waterlineRow: 43,
    moon: null,
    cloudFloat: { row: 6, centerCol: 29, driftAmp: 8 },
    phases: [
      {
        name: "boulevard",
        startTime: 0.4,
        duration: 1.2,
        reveal: "left-right",
        sprites: boulevard,
      },
      {
        name: "cks-memorial",
        startTime: 0.8,
        duration: 2.8,
        reveal: "bottom-up",
        sprites: cksMemorial,
      },
      {
        name: "taipei-101",
        startTime: 2.4,
        duration: 3.8,
        reveal: "bottom-up",
        sprites: taipei101,
      },
      {
        name: "xinyi-towers",
        startTime: 4.6,
        duration: 2.6,
        reveal: "bottom-up",
        sprites: xinyiTowers,
      },
      {
        name: "miramar-tpac",
        startTime: 5.8,
        duration: 2.4,
        reveal: "bottom-up",
        sprites: miramarTpac,
      },
      {
        name: "grand-hotel",
        startTime: 6.8,
        duration: 2.4,
        reveal: "bottom-up",
        sprites: grandHotel,
      },
      {
        name: "elephant-mountain",
        startTime: 7.8,
        duration: 2.0,
        reveal: "fade",
        sprites: elephantMountain,
      },
    ],
  };
})();

export const TAIWAN_CITY = TAIPEI_CITY;
