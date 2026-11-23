// Beijing — Imperial Ming/Qing Heritage & Modern Panorama (92 x 62 grid)
// Pure ES module, zero external imports, zero DOM or script-injection sinks.
// Five hand-crafted iconic Beijing landmarks (80%+ imperial historic monuments) flush on row 42:
// 1. The Great Wall of China (cols 1..19, rows 24..42) — stepped crenelated rampart & beacon watchtower
// 2. Summer Palace — Tower of Buddhist Incense (cols 21..31, rows 19..42) — 3-story octagonal golden pagoda atop stone terrace
// 3. Temple of Heaven — Hall of Prayer for Good Harvests (cols 35..57, rows 20..42) + glowing red palace lanterns (cols 33..34 & 58..59)
// 4. Forbidden City — Hall of Supreme Harmony (cols 61..78, rows 25..42) — double-tiered golden flying roofs & vermilion palace
// 5. National Stadium — Bird's Nest (cols 80..91, rows 32..42) — compact woven steel saddle bowl (sole modern accent)
// Plus subtle imperial gold auspicious cloud scroll in open left sky (cols 4..17, rows 14..16).
// Upper-center sky (rows 0..18, cols 24..76) stays 100% open for the floating Google Cloud logo.

export const BEIJING_CITY = (() => {
  const COLS = 92;
  const MAX_ROW = 42;

  const PAL = {
    // Great Wall of China & Longevity Hill Stone Terrace (moonlit weathered limestone + warm beacon glow)
    S: { color: "#DED2BC", glow: true }, // moonlit limestone crenelations & stone highlight
    s: { color: "#A89B86", glow: false }, // weathered grey-buff fortress stone
    d: { color: "#786D5D", glow: false }, // shadowed stone ashlar mortar seams
    b: { color: "#5C5247", glow: false }, // deep shadowed mountain masonry

    // Imperial Golden Glazed Tiles (황금 유리와) & Royal Finials (Summer Palace, Forbidden City, Temple of Heaven)
    K: { color: "#FFF2B2", glow: true, twinkle: true }, // blazing gilded finial, beacon fire & sanctuary heart
    F: { color: "#FFD166", glow: true }, // luminous imperial golden glazed flying eaves & plaques
    f: { color: "#F4B942", glow: false }, // warm golden glazed roof tile slope shading
    t: { color: "#D49836", glow: false }, // antique gilded bronze cornice shadow

    // Imperial Vermilion-Crimson Lacquer Palaces & Red Silk Lanterns (홍등)
    E: { color: "#FF424E", glow: true }, // vivid imperial vermilion-crimson palace columns
    V: { color: "#E63946", glow: true }, // rich imperial vermilion-crimson hall facade
    v: { color: "#B02A34", glow: false }, // deep crimson lacquer shadow
    H: { color: "#FF3B47", glow: true }, // vivid glowing crimson red silk palace lantern globe
    h: { color: "#FF5E62", glow: true }, // luminous scarlet pleated silk lantern belly
    J: { color: "#FFD166", glow: true }, // imperial gold lantern cap & bottom rim
    j: { color: "#FFE69A", glow: true, twinkle: true }, // shimmering gold silk tassel tip

    // Temple of Heaven — Imperial Cobalt-Blue Triple Roof & 3-Tier White Marble Altar
    A: { color: "#93C5FD", glow: true }, // moonlit azure upturned eaves & crest highlight
    C: { color: "#60A5FA", glow: true }, // luminous sapphire-cobalt roof ribs
    c: { color: "#2563EB", glow: false }, // deep imperial cobalt-blue glazed tiles
    W: { color: "#EAEFF7", glow: true }, // luminous pearl white-marble balustrade & imperial steps
    w: { color: "#C4CEDD", glow: false }, // cool white-marble altar terrace drum
    m: { color: "#8E9BB0", glow: false }, // carved white-marble shadow relief

    // Bird's Nest — Compact Metallic Steel Saddle Bowl + Warm Crimson-Amber Interior
    N: { color: "#CFD9E6", glow: true }, // bright sweeping steel saddle rim & ribs
    n: { color: "#9AA8BC", glow: false }, // brushed diagonal steel lattice weave
    R: { color: "#FF6B4A", glow: true }, // glowing warm crimson-vermilion inner bowl
    r: { color: "#D9483B", glow: false }, // deeper glowing crimson stadium interior
    O: { color: "#F5B041", glow: true }, // glowing warm amber-gold concourse
    o: { color: "#FFE08A", glow: true, twinkle: true }, // sparkling stadium floodlight

    // Subtle Imperial Gold Auspicious Cloud Scrolls (상운 / 祥雲) — low-key painterly silk mist
    X: { color: "#D69848", glow: false }, // antique imperial gold cloud scroll
    x: { color: "#A85446", glow: false }, // soft vermilion-ochre cloud scroll shadow
  };

  function pushArt(list, startRow, startCol, rows) {
    for (let r = 0; r < rows.length; r += 1) {
      const [chars, codes] = rows[r];
      const row = startRow + r;
      if (chars.length !== codes.length) {
        throw new Error(
          `Beijing row ${row} mismatch: chars=${chars.length} ("${chars}") vs codes=${codes.length} ("${codes}")`
        );
      }
      if (row < 0 || row > MAX_ROW) {
        throw new Error(`Beijing row out of bounds: ${row}`);
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
            `Beijing col out of bounds at row ${row}: col=${col}, len=${text.length}, text="${text}"`
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
  // PHASE 1: "temple-of-heaven" — Temple of Heaven (天壇 祈年殿, cols 35..57, rows 20..42)
  // + Flanking Glowing Imperial Red Silk Palace Lanterns (홍등, cols 33..34 & 58..59, rows 35..42)
  // =========================================================================
  const templeOfHeaven = [];
  pushArt(templeOfHeaven, 20, 35, [
    ["           *           ", "           K           "], // r20: blazing gilded gold finial (col 46)
    ["          /#\\          ", "          AFA          "], // r21: gilded orb collar & roof apex
    ["        _//|\\\\_        ", "        ACcFcCA        "], // r22: TIER 1 steep cobalt-blue conical roof
    ["       ///===\\\\\\       ", "       ACccFccCA       "], // r23: deep imperial cobalt conical sweep
    ["      ~/===|===\\~      ", "      AACccFccCAA      "], // r24: TIER 1 upturned azure-cobalt eaves
    ["        |=:=:=|        ", "        FVEVEVF        "], // r25: upper circular imperial frieze
    ["     _///==|==\\\\\\_     ", "     ACccCcFcCccCA     "], // r26: TIER 2 sweeping cobalt-blue roof
    ["    ~/====---====\\~    ", "    AACcccCCCcccCAA    "], // r27: TIER 2 luminous upturned azure eaves
    ["      |:=:=#:=:=|      ", "      FVEVFKFVEVF      "], // r28: middle clerestory & golden plaque
    ["   _////===|===\\\\\\\\_   ", "   ACcccCccFccCcccCA   "], // r29: TIER 3 grand cobalt-blue roof sweep
    ["  ~/======---======\\~  ", "  AACcccccCCCcccccCAA  "], // r30: TIER 3 broad upturned imperial eaves
    ["    |=====[#]=====|    ", "    FFFFFFtKtFFFFFF    "], // r31: gilded gold eaves cornice & plaque
    ["    |: | |:=:| | :|    ", "    EF E EFFFE E FE    "], // r32: vermilion-crimson circular colonnade
    ["    |: | |#*#| | :|    ", "    EF E EFKFE E FE    "], // r33: glowing golden sanctuary doors
    ["    |: | |:=:| | :|    ", "    VF V VFFFV V FV    "], // r34: stately imperial lacquer columns
    ["    |==|=|===|=|==|    ", "    VVVvVVFFFVVvVVV    "], // r35: imperial hall sill
    ["   _=+===+===+===+=_   ", "   wWWwwwWWWWWwwwWWw   "], // r36: MARBLE ALTAR TIER 1 balustrade (17 cols)
    ["   | --- |===| --- |   ", "   W mmm WWWWW mmm W   "], // r37: MARBLE ALTAR TIER 1 drum & stairs
    [" _=+===+==/=\\==+===+=_ ", " wWWwwwWWwWWWwWWwwwWWw "], // r38: MARBLE ALTAR TIER 2 balustrade (21 cols)
    [" | ----- |===| ----- | ", " W mmmmm WWWWW mmmmm W "], // r39: MARBLE ALTAR TIER 2 drum & stairs
    ["_+===+===+===+===+===+_", "wWWwwWWwwWWWWWwwWWwwWWw"], // r40: MARBLE ALTAR TIER 3 grand ring (23 cols)
    ["| ----- /=====\\ ----- |", "W mmmmm WWWWWWW mmmmm W"], // r41: MARBLE ALTAR TIER 3 drum & grand steps
    ["========#######========", "wwwwwwwwWWWWWWWwwwwwwww"], // r42: grounded white marble apron flush on r42
  ]);

  // 1B. Symmetric Glowing Imperial Red Silk Palace Lanterns (홍등 / 紅燈籠)
  // Left lantern (cols 33..34, rows 35..42) & Right lantern (cols 58..59, rows 35..42)
  pushArt(templeOfHeaven, 35, 33, [
    ["==", "JJ"], // r35: imperial gold lantern top cap
    ["()", "HH"], // r36: blazing crimson-red silk lantern upper globe
    ["{}", "hh"], // r37: glowing scarlet pleated silk lantern belly
    ["==", "JJ"], // r38: imperial gold bottom rim
    [":|", "jV"], // r39: shimmering gold silk tassel + slender lacquer post
    [" |", " v"], // r40: slender vermilion lacquer post
    [" |", " v"], // r41: lacquer post
    [" =", " w"], // r42: carved marble pedestal flush on row 42
  ]);
  pushArt(templeOfHeaven, 35, 58, [
    ["==", "JJ"], // r35: imperial gold lantern top cap
    ["()", "HH"], // r36: blazing crimson-red silk lantern upper globe
    ["{}", "hh"], // r37: glowing scarlet pleated silk lantern belly
    ["==", "JJ"], // r38: imperial gold bottom rim
    ["|:", "Vj"], // r39: slender lacquer post + shimmering gold silk tassel
    ["| ", "v "], // r40: slender vermilion lacquer post
    ["| ", "v "], // r41: lacquer post
    ["= ", "w "], // r42: carved marble pedestal flush on row 42
  ]);

  // =========================================================================
  // PHASE 2: "forbidden-city" — Forbidden City: Hall of Supreme Harmony
  // (자금성 태화전 / 紫禁城 太和殿, cols 61..78, rows 25..42)
  // Grand double-tiered sweeping golden-glazed hip roofs (황금 유리와 비첨),
  // vivid imperial vermilion palace walls & colonnade, golden royal plaque,
  // warm arched throne hall doorway, and carved white marble terrace steps.
  // =========================================================================
  const forbiddenCity = [];
  pushArt(forbiddenCity, 25, 61, [
    ["    *========*    ", "    KFFFFFFFFK    "], // r25: horizontal dragon ridge & twin chiwen finials
    ["   /==========\\   ", "   FffffffffffF   "], // r26: upper golden-glazed hip roof (황금 유리와)
    [" ~/============\\~ ", " FFffffffffffffFF "], // r27: upper sweeping upturned golden flying eaves
    ["   |===----===|   ", "   VFFFvvvvFFFV   "], // r28: recessed imperial vermilion-gold clerestory
    [" _////======\\\\\\\\_ ", " FfFFFffffffFFFfF "], // r29: lower broader golden-glazed hip roof
    ["~/==============\\~", "FFffffffffffffffFF"], // r30: FULL 18-col grand upturned golden flying eaves
    ["  |====[##]====|  ", "  VFFFFtKKtFFFFV  "], // r31: gilded eaves cornice & blazing royal plaque
    ["  |: |:/==\\:| :|  ", "  EF EFVFFVFE FE  "], // r32: vivid imperial vermilion colonnade & portal arch
    ["  |: |:|##|:| :|  ", "  EF EFVFFVFE FE  "], // r33: warm glowing imperial throne doorway
    ["  |: |:|**|:| :|  ", "  VF VFVKKVFV FV  "], // r34: twinkling sanctuary lantern glow
    ["  |==|=|==|=|==|  ", "  VVVvVVFFVVvVVV  "], // r35: vermilion palace plinth sill
    [" _+==+=/==\\=+==+_ ", " wWWwwWWWWWWwwWWw "], // r36: upper white-marble balustrade & imperial steps
    [" |----|====|----| ", " WmmmmWWWWWWmmmmW "], // r37: carved white-marble terrace wall
    ["_+==+=/====\\=+==+_", "wWWwwWWWWWWWWwwWWw"], // r38: lower wider marble terrace balustrade
    ["|----|======|----|", "WmmmmWWWWWWWWmmmmW"], // r39: monumental white-marble plinth & dragon ramp
    ["|====|==##==|====|", "wWWWWWWwWWwWWWWWWw"], // r40: imperial central staircase & marble relief
    ["|----|/====\\|----|", "WmmmmWWWWWWWWmmmmW"], // r41: sweeping ceremonial steps
    ["======######======", "wwwwwwWWWWWWwwwwww"], // r42: grounded white-marble terrace flush on row 42
  ]);

  // =========================================================================
  // PHASE 3: "summer-palace" — Summer Palace: Tower of Buddhist Incense
  // (이화원 불향각 / 頤和園 佛香閣, cols 21..31, rows 19..42, center col 26)
  // Iconic tall 3-story octagonal golden-roofed pagoda with sweeping flying eaves
  // & vivid imperial vermilion tiers perched atop Longevity Hill's high stone terrace!
  // =========================================================================
  const summerPalace = [];
  pushArt(summerPalace, 19, 21, [
    ["     *     ", "     K     "], // r19: gilded octagonal pagoda spire finial
    ["    /#\\    ", "    FKF    "], // r20: golden glazed pinnacle
    ["   //|\\\\   ", "   FfFfF   "], // r21: Story 3 octagonal golden roof slope
    [" ~/==|==\\~ ", " FFffFffFF "], // r22: Story 3 sweeping golden flying eaves
    ["   |===|   ", "   EFFFE   "], // r23: upper golden-vermilion cornice
    ["   |:#:|   ", "   EFKFE   "], // r24: Story 3 vermilion chamber & golden shrine
    ["  _//|\\\\_  ", "  FfFfFfF  "], // r25: Story 2 octagonal golden roof slope
    ["~/===|===\\~", "FFfffFfffFF"], // r26: Story 2 sweeping golden flying eaves
    ["  |==#==|  ", "  EFFKFFE  "], // r27: middle eaves cornice & imperial plaque
    ["  |:|*|:|  ", "  EFEKEFE  "], // r28: Story 2 vermilion columns & warm shrine glow
    [" _///|\\\\\\_ ", " FfFFfFFfF "], // r29: Story 1 octagonal golden roof slope
    ["~/=======\\~", "FFfffffffFF"], // r30: Story 1 grand sweeping golden flying eaves
    [" |==[#]==| ", " VFFtKtFFV "], // r31: ornate gilded dougong eaves & plaque
    [" |:|#*#|:| ", " VEVFKFVEV "], // r32: Story 1 vivid vermilion-crimson colonnade
    [" |=======| ", " vVVVVVVVv "], // r33: vermilion hall sill atop stone terrace
    ["_+===+===+_", "wWWwwWWwwWw"], // r34: carved white-marble terrace balustrade
    ["|--|===|--|", "SddSWWWSddS"], // r35: high Longevity Hill battered stone terrace
    ["|--|:#:|--|", "SssSWFWSssS"], // r36: dressed limestone terrace & central stairs
    ["|==|===|==|", "SSsSWWWSSsS"], // r37: stone terrace stringcourse cornice
    ["|--|:#:|--|", "SssSWFWSssS"], // r38: carved imperial masonry courses
    ["|--/===\\--|", "SddSFFFSddS"], // r39: arched ceremonial terrace portal canopy
    ["|--|#*#|--|", "SssSFKFSssS"], // r40: warm golden lantern light inside stone arch
    ["|==|===|==|", "SSsSFFFSsSS"], // r41: massive terraced stone plinth
    ["[====#====]", "sSSSSFSSSSs"], // r42: grounded stone terrace flush on row 42
  ]);

  // =========================================================================
  // PHASE 4: "great-wall" — The Great Wall of China (만리장성 / 萬里長城)
  // Cols 1..19, rows 24..42: stepped crenelated stone rampart climbing
  // dramatically into a sturdy square watchtower (봉수대) with warm golden
  // beacon fire & arched lantern windows!
  // =========================================================================
  const greatWall = [];
  pushArt(greatWall, 24, 1, [
    ["       []= * =[]   ", "       SSs K sSS   "], // r24: watchtower crenelated merlons & golden beacon
    ["       |=======|   ", "       SSSSSSSSS   "], // r25: battered limestone watchtower parapet
    ["       |/#\\ /#\\|   ", "       SsFs sFsS   "], // r26: twin arched watchtower beacon windows
    ["       ||*| |*||   ", "       SsKs sKsS   "], // r27: warm flickering golden watchtower lanterns
    ["     []|=======|   ", "     SSsSSSSSSSs   "], // r28: climbing left rampart merlon meets watchtower
    ["    /==|---+---|[] ", "    SSSssddssddSSS "], // r29: ascending stone rampart + descending right merlon
    ["   []--/---|---\\--\\", "   SSssSdddSdddSssS"], // r30: stepped crenelated battlements climbing ridge
    ["  /==--|---#---|--|", "  SSSssSdddFdddSssS"], // r31: dressed Ming limestone courses & pass embrasure
    [" []---/|---+---|\\-|", " SSsssSSdddSdddSSsS"], // r32: lower climbing crenelated battlement merlon
    ["/==---||---|---||-|", "SSSsssSSdddSdddSSsS"], // r33: continuous stone rampart wall along ridge
    ["|---|-||=======||-|", "SsssSdSSsssssssSSsS"], // r34: heavy stone buttress & watchtower belt course
    ["|===|-||--/#\\--||=|", "SSssSdSSddSFSddSSsS"], // r35: grand Juyongguan-style arched mountain pass
    ["|---|-||--|*|--||-|", "SdddSdSSddSKsddSSdS"], // r36: warm golden lantern light inside pass archway
    ["|===|-||--|#|--||=|", "SsssSdSSddSFsddSSsS"], // r37: warm stone pass threshold
    ["|---|-||=======||-|", "SdddSbSSsssssssSSbS"], // r38: battered fortress rampart plinth
    ["|===|-/----+----\\-|", "SsssSbSbbbbSbbbbSbS"], // r39: widening mountain ridge foundation
    ["|-----|----|----|-|", "SbbbbbSbbbbSbbbbSbS"], // r40: heavy lower fortress ashlar blocks
    ["|=====|====|====|=|", "SsssssSssssSssssSsS"], // r41: monumental stone base course
    ["[=====+====+====+=]", "sSSSSSSSSSSSSSSSSSs"], // r42: grounded flush on row 42
  ]);

  // =========================================================================
  // PHASE 5: "birds-nest" — National Stadium / Bird's Nest (鳥巢)
  // Far right (cols 80..91, rows 32..42): ONE sleek modern Beijing accent —
  // compact saddle-curved woven steel lattice bowl glowing warm crimson-gold!
  // =========================================================================
  const birdsNest = [];
  pushArt(birdsNest, 32, 80, [
    [" ._=.  .=_. ", " NNNN  NNNN "], // r32: twin elevated sweeping saddle crests
    ["/=/\\=__=/\\=\\", "NnNROOORnNnN"], // r33: concave saddle dip glowing amber inside
    ["|/X\\:==:/X\\|", "NnNORRRONnNN"], // r34: interwoven diagonal steel twigs + ember core
    ["|\\X/#**#\\X/|", "NnNRRoRRNnNN"], // r35: blazing crimson-gold inner Olympic heart
    ["|/X\\:##:/X\\|", "NnNORRRONnNN"], // r36: warm crimson-amber shining through steel ribs
    ["|\\X/#**#\\X/|", "NnNRRoRRNnNN"], // r37: sparkling stadium floodlight core
    ["|/X\\:##:/X\\|", "NnNORRRONnNN"], // r38: woven diagonal steel bowl
    [" \\X/#==#\\X/ ", " NnROOOORnN "], // r39: graceful curved lower bowl hull tuck
    [" |\\X/==\\X/| ", " NnNRRRRnNN "], // r40: diagonal structural steel legs & concourse
    [" /=X====X=\\ ", " NnNOOOONnN "], // r41: illuminated Olympic stadium steps
    ["[===----===]", "NNNNrOOrNNNN"], // r42: grounded flush on row 42
  ]);

  // =========================================================================
  // PHASE 6: "auspicious-clouds" — Subtle Imperial Gold Auspicious Cloud Scroll (상운 / 祥雲)
  // Delicate low-key golden-vermilion traditional Chinese cloud curl in the open
  // left sky (cols 4..17, rows 14..16), strictly outside Google Cloud (cols 24..76).
  // =========================================================================
  const auspiciousClouds = [];
  pushArt(auspiciousClouds, 14, 4, [
    ["    .~-~.     ", "    XXXXX     "], // r14: curled ruyi auspicious cloud crest
    [" ~(~~- -~~)~- ", " xXXXx xXXXxx "], // r15: flowing imperial gold & vermilion silk scroll
    ["   '-~~~-'    ", "   xxxxxxx    "], // r16: delicate trailing mist curl
  ]);

  return {
    id: "beijing",
    label: "Beijing",
    title: "BEIJING",
    nativeTitle: "北京",
    titleColor: "#FFD166",
    handle: "@googlecloud",
    coords: "39.9042° N  116.4074° E",
    skyPalette: ["#0F0406", "#300D13"],
    ground: { type: "marble-courtyard" },
    atmosphere: "embers",
    revealOrder: "buildings-first",
    cols: 92,
    rows: 62,
    waterlineRow: 43,
    moon: null,
    cloudFloat: { row: 6, centerCol: 50, driftAmp: 10 },
    phases: [
      {
        name: "temple-of-heaven",
        startTime: 0.5,
        duration: 3.0,
        reveal: "bottom-up",
        sprites: templeOfHeaven,
      },
      {
        name: "forbidden-city",
        startTime: 2.1,
        duration: 3.0,
        reveal: "bottom-up",
        sprites: forbiddenCity,
      },
      {
        name: "summer-palace",
        startTime: 3.8,
        duration: 2.8,
        reveal: "bottom-up",
        sprites: summerPalace,
      },
      {
        name: "great-wall",
        startTime: 5.3,
        duration: 2.8,
        reveal: "bottom-up",
        sprites: greatWall,
      },
      {
        name: "birds-nest",
        startTime: 6.9,
        duration: 2.4,
        reveal: "bottom-up",
        sprites: birdsNest,
      },
      {
        name: "auspicious-clouds",
        startTime: 7.6,
        duration: 2.2,
        reveal: "fade",
        sprites: auspiciousClouds,
      },
    ],
  };
})();
