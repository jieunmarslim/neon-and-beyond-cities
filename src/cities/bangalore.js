// Bangalore — Unmistakably Indian Heritage & Silicon Valley Panorama (92 x 62 grid)
// Pure ES module, zero external imports, zero DOM or script-injection sinks.
// Four iconic nocturnal Bangalore / South Indian landmarks flush on row 42:
// 1. South Indian Dravidian Temple Gopuram (cols 2..16, rows 18..42) + Tropical Coconut Palm (cols 17..21, rows 32..42)
// 2. Vidhana Soudha (cols 23..63, rows 22..42) — lotus-fluted bulbous dome, twin chhatris & scalloped Indian arches
// 3. Indo-Saracenic Onion-Domed Palace Pavilion + Banyan (cols 65..78, rows 27..42) — terracotta-rose, saffron & gold
// 4. UB City / Bengaluru Silicon Valley Spire (cols 81..90, rows 15..42) — sleek glass-and-gold tech spire

export const BANGALORE_CITY = (() => {
  const COLS = 92;
  const MAX_ROW = 42;

  const PAL = {
    // South Indian Dravidian Temple Gopuram (saffron-orange, marigold-gold, carved terracotta)
    K: { color: "#FFF0C2", glow: true, twinkle: true }, // gleaming golden kalasha finials & sanctum star
    O: { color: "#FFD166", glow: true }, // radiant marigold-gold sala shikhara crest & temple cornices
    S: { color: "#FF9F43", glow: true }, // luminous saffron-orange sculpted tiers & gateway
    s: { color: "#FF7A3D", glow: false }, // warm vermilion-saffron carved shrine niches
    c: { color: "#C4572B", glow: false }, // deep terracotta-sandstone temple relief shadow

    // Tropical Coconut Palm & Banyan Foliage (Garden City emerald accents)
    E: { color: "#34D399", glow: true }, // luminous tropical emerald palm fronds & sunlit leaves
    e: { color: "#10B981", glow: false }, // rich emerald tropical foliage
    f: { color: "#059669", glow: false }, // shaded tropical emerald depth
    T: { color: "#9E7652", glow: false }, // warm ringed palm & banyan bark trunk

    // Vidhana Soudha (Neo-Dravidian marigold-gold & warm sandstone floodlights)
    V: { color: "#FFF0C2", glow: true }, // bright warm ivory-gold dome crown, chhatri rims & stair edges
    v: { color: "#FFF7D6", glow: true, twinkle: true }, // twinkling Ashoka finial & state crest emblem
    M: { color: "#FFBE6B", glow: true }, // glowing marigold-gold floodlit columns, scalloped arches & dome
    A: { color: "#E58E3C", glow: true }, // warm saffron-amber illuminated interior galleries & portal
    D: { color: "#C76E36", glow: false }, // carved royal Indian warm sandstone masonry & flutes
    d: { color: "#8F4B26", glow: false }, // deep warm sandstone trim for sculptural relief

    // Indo-Saracenic Onion-Domed Palace Pavilion (terracotta-rose, saffron-gold, sandstone)
    R: { color: "#F48498", glow: true }, // warm terracotta-rose onion dome & scalloped Mughal arches
    r: { color: "#D45D79", glow: false }, // rich rose-terracotta dome shading & archway moldings
    P: { color: "#FFD166", glow: true }, // gleaming saffron-gold dome collar, minaret bands & cornice
    p: { color: "#E8BE82", glow: false }, // warm Deccan sandstone palace walls, minarets & plinth
    L: { color: "#FFE8A3", glow: true, twinkle: true }, // twinkling warm palace lantern & finials

    // UB City / Bengaluru Silicon Valley Spire (ice-cyan, brushed silver & champagne-gold)
    C: { color: "#7DD3FC", glow: true }, // luminous ice-cyan tech glass crown & spandrels
    u: { color: "#3B82B6", glow: false }, // cool nocturnal sapphire curtain-wall glass
    W: { color: "#E2E8F0", glow: true }, // crisp brushed-silver vertical mullions & spire
    w: { color: "#7B93B0", glow: false }, // cool architectural steel shadow
    G: { color: "#F5C77E", glow: true }, // warm champagne-gold stepped luxury terraces & crown
    g: { color: "#FFF2C6", glow: true, twinkle: true }, // twinkling luxury tech-suite light
  };

  function pushArt(list, startRow, startCol, rows) {
    for (let r = 0; r < rows.length; r += 1) {
      const [chars, codes] = rows[r];
      const row = startRow + r;
      if (chars.length !== codes.length) {
        throw new Error(
          `Bangalore row ${row} mismatch: chars=${chars.length} ("${chars}") vs codes=${codes.length} ("${codes}")`
        );
      }
      if (row < 0 || row > MAX_ROW) {
        throw new Error(`Bangalore row out of bounds: ${row}`);
      }
      let i = 0;
      while (i < chars.length) {
        const ch = chars[i];
        const code = codes[i];
        if (ch === " " && code === " ") {
          i += 1;
          continue;
        }
        if (ch === " " || code === " ") {
          throw new Error(
            `Bangalore space/code mismatch at row ${row}, col ${startCol + i}: ch="${ch}", code="${code}"`
          );
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
            `Bangalore col out of bounds at row ${row}: col=${col}, len=${text.length}, text="${text}"`
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
  // PHASE 1: "vidhana-soudha" — Grand Center Hero (cols 23..63, rows 22..42)
  // Unmistakably Indian Neo-Dravidian royal palace in warm marigold-gold &
  // warm sandstone floodlights: bulbous lotus-fluted central dome + golden
  // finial, twin flanking open-pillared Indian chhatri onion cupolas,
  // scalloped pointed Indian arches (/^\| & /\_/\), and broad grand stairs.
  // =========================================================================
  const vidhanaSoudha = [];
  pushArt(vidhanaSoudha, 22, 23, [
    ["                    *                    ", "                    v                    "], // r22: golden Ashoka / kalasha finial
    ["                    |                    ", "                    V                    "], // r23: slender gilded spire
    ["                  _/|\\_                  ", "                  DMVMD                  "], // r24: inverted lotus padma-kosha neck
    ["                _/:|:|:\\_                ", "                DMVVVVVMD                "], // r25: lotus-fluted upper dome
    ["    *         _//::|:|::\\\\_         *    ", "    v         DMMDDMVMDDMMD         v    "], // r26: bulbous dome swell + chhatri tips
    ["   /|\\       (::|:|:|:|:|::)       /|\\   ", "   MVM       VDDMVMVVVMVMDDV       MVM   "], // r27: bulbous fluted lotus dome belly
    ["  (:#:)      \\::|:|:|:|:|::/      (:#:)  ", "  MVVVM      MDDMVMVVVMVMDDM      MVVVM  "], // r28: twin onion cupolas + dome tuck
    ["  \\===/      _|==|=|=|=|==|_      \\===/  ", "  DMMMD      dMMMMVVVVVMMMMd      DMMMD  "], // r29: chhatri eaves + lotus drum collar
    ["  | | |     |::|:|:|:|:|:|::|     | | |  ", "  M M M     MDDMAMAMVMAMAMDDM     M M M  "], // r30: open chhatri pavilions + drum
    [" _|===|_^^^^|======[#]======|^^^^_|===|_ ", " dMMMMMdDDDDMMMMMMMVvVMMMMMMMDDDDdMMMMMd "], // r31: Indian kudu parapet + crest
    ["_/=====================================\\_", "dMVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMd"], // r32: sweeping carved sandstone chajja
    ["|/^\\|/^\\|/^\\|===/=======\\===|/^\\|/^\\|/^\\|", "MDMDMDMDMDMDMAMMVVVVVVVVVMMAMDMDMDMDMDMDM"], // r33: scalloped pointed Indian arches
    ["|: :|: :|: :|::| |/\\_/\\| |::|: :|: :|: :|", "MA AMA AMA AMAAM MVVVVVM MAAMA AMA AMA AM"], // r34: cusped central arch /\_/\ + galleries
    ["|:::|:::|:::|::| |==*==| |::|:::|:::|:::|", "MAAAMAAAMAAAMAAM MMAvAMM MAAMAAAMAAAMAAAM"], // r35: warm marigold floodlit alcoves
    ["|===========|=====+===+=====|===========|", "dDDDDDDDDDDDMAAAAAVAAAVAAAAAMDDDDDDDDDDDd"], // r36: carved sandstone balcony cornice
    ["|/^\\|/^\\|/^\\|::|  /^^^\\  |::|/^\\|/^\\|/^\\|", "MDMDMDMDMDMDMAAM  MVVVM  MAAMDMDMDMDMDMDM"], // r37: lower Indian arches + grand portal
    ["| : | : | : |::|  |:::|  |::| : | : | : |", "M A M A M A MAAM  MAAAM  MAAM A M A M A M"], // r38: monumental sandstone colonnade
    ["|===========|====/=====\\====|===========|", "dDDDDDDDDDDDMAAAAVMMMMMVAAAAMDDDDDDDDDDDd"], // r39: podium + top of ceremonial stairs
    ["|===---===--|---/=======\\---|--===---===|", "dDDDdDDdDDddMdddVMMMMMMMVdddMddDDdDDdDDDd"], // r40: rusticated sandstone + grand stairs
    ["|---===---==|--/=========\\--|==---===---|", "dDddDDDddDDdMddVMMMMMMMMMVddMdDDddDDDddDd"], // r41: stone balustrade + widening stairs
    ["[===========|-/===========\\-|===========]", "dDDDDDDDDDDDMdVMMMMMMMMMMMVdMDDDDDDDDDDDd"], // r42: broad ceremonial stairs on row 42
  ]);

  // =========================================================================
  // PHASE 2: "dravidian-gopuram" — South Indian Dravidian Temple Gopuram
  // (cols 2..16, rows 18..42) + Tropical Coconut Palm (cols 17..21, rows 32..42)
  // Iconic stepped sculpted pyramid crowned by golden kalasha finials (* * *)
  // and barrel-vault sala shikhara glowing warm saffron-orange & marigold-gold.
  // =========================================================================
  const dravidianGopuram = [];
  pushArt(dravidianGopuram, 18, 2, [
    ["     * * *     ", "     K K K     "], // r18: 3 golden kalasha finials on ridge
    ["    /=====\\    ", "    OOOOOOO    "], // r19: barrel-vault sala shikhara roof
    ["    (==^==)    ", "    OOSKSOO    "], // r20: vaulted gable ends + carved kudu
    ["   [===#===]   ", "   SOOOKOOOS   "], // r21: Tier 7 sculpted temple molding
    ["   |^|^#^|^|   ", "   SsSsKSsSs   "], // r22: Tier 7 carved shrine niches
    ["   |=======|   ", "   OOOOOOOOO   "], // r23: Tier 6 marigold horizontal cornice
    ["  /===^=^===\\  ", "  SOOOsOsOOOS  "], // r24: Tier 6 stepped sculpted eaves
    ["  |^|:|#|:|^|  ", "  SsSsSOSsSsS  "], // r25: Tier 6 deity shrine reliefs
    ["  |=========|  ", "  SOOOOOOOOOS  "], // r26: Tier 5 glowing saffron cornice
    ["  |^|:|#|:|^|  ", "  csSsSKSSsSc  "], // r27: Tier 5 sculpted sandstone relief
    [" /====^=^====\\ ", " SOOOOsOsOOOOS "], // r28: Tier 4 widening stepped tier
    [" |^|:|:#:|:|^| ", " SsSsScKcsSsSS "], // r29: Tier 4 central sanctum window
    [" |===========| ", " SOOOOOOOOOOOS "], // r30: Tier 4 marigold temple entablature
    [" |^|:|:^:|:|^| ", " csSsScOcsSsSc "], // r31: Tier 3 ornate Dravidian gallery
    [" |===========| ", " sOOOOOOOOOOOs "], // r32: Tier 3 warm saffron horizontal band
    ["/=====^=^=====\\", "SOOOOOsOsOOOOOS"], // r33: Tier 2 monumental flared eave
    ["|^|:|:|#|:|:|^|", "SsSsScsKscSsSsS"], // r34: Tier 2 carved shrine pilasters
    ["|=============|", "SOOOOOOOOOOOOOS"], // r35: Tier 1 grand Raya Gopuram cornice
    ["|^|:|/===\\|:|^|", "csSsSOOOOOsSsSc"], // r36: sacred arched temple gateway top
    ["|:|:||:::||:|:|", "cScScSOOOScScSc"], // r37: tall illuminated sanctum entrance
    ["|:|:||:*:||:|:|", "cScScSOKOScScSc"], // r38: glowing diya-lit temple doorway
    ["|===||:::||===|", "sOOOsSOOOSsOOOs"], // r39: carved jambs & warm golden entry
    ["|:|:||:::||:|:|", "cScScSOOOScScSc"], // r40: temple base pillars
    ["|===/=====\\===|", "sOOOOMMMMMOOOOs"], // r41: ceremonial carved stone threshold
    ["[===#######===]", "cOOOKKKKKKKOOOc"], // r42: grounded Dravidian base on row 42
  ]);

  // Graceful Tropical Coconut Palm flanking the Gopuram (cols 18..21, rows 32..42)
  pushArt(dravidianGopuram, 32, 18, [
    ["~^^~", "eEEe"], // r32: arching upper emerald palm fronds
    ["~/|\\", "eEEe"], // r33: radiating tropical coconut palm crown
    ["/o~\\", "fOTf"], // r34: drooping frond tips + golden coconut
    [" |  ", " T  "], // r35: gently curving ringed palm trunk
    [" |  ", " T  "], // r36
    [" \\  ", " T  "], // r37
    ["  | ", "  T "], // r38
    ["  | ", "  T "], // r39
    ["  / ", "  T "], // r40
    [" |  ", " T  "], // r41
    ["_|_ ", "eTe "], // r42: grounded palm garden mound on row 42
  ]);

  // =========================================================================
  // PHASE 3: "indo-saracenic-pavilion" — Onion-Domed Indian Palace Pavilion
  // + Lush Emerald Banyan (cols 65..78, rows 27..42)
  // Iconic bulbous onion dome ((###) / (:#:#:)), slender twin minarets, and
  // scalloped Mughal/Deccan arches in terracotta-rose, saffron-gold & sandstone.
  // =========================================================================
  const indoSaracenic = [];
  pushArt(indoSaracenic, 27, 65, [
    ["     *        ", "     L        "], // r27: golden onion-dome finial
    ["     |        ", "     P        "], // r28: lotus spire shaft
    ["    /^\\       ", "    PRP       "], // r29: tapered onion dome crown
    ["*  (###)  *   ", "L  RRRRR  L   "], // r30: twin minaret tips + bulbous dome
    ["| (:#:#:) |   ", "p RrRPRrR p   "], // r31: wide bulbous terracotta-rose dome
    ["|  \\===/  |   ", "p  PRRRP  p   "], // r32: inward-tucked onion dome collar
    ["|=========|   ", "pPPPPPPPPPp   "], // r33: gleaming saffron-gold palace cornice
    ["|^| /^\\ |^| ~ ", "pRp RPR pRp E "], // r34: scalloped Mughal arches + banyan tip
    ["|:| |:| |:|(*)", "prp RLR prpeEe"], // r35: terracotta-rose verandah + banyan
    ["|===/=\\===|(~)", "pPPPRPRPPPpfEe"], // r36: Deccan cusped arch + emerald leaves
    ["|^|/===\\|^|\\|/", "pRpPRRRPpRpfTf"], // r37: grand scalloped portal + boughs
    ["|:||:*:||:| | ", "prpRPLPRprp T "], // r38: warm diya-lit palace hall + trunk
    ["|:||:::||:| | ", "prpRPPPRprp T "], // r39: glowing palace sanctuary + trunk
    ["|==|:::|==| | ", "pPPpPPPpPPp T "], // r40: sandstone plinth + banyan trunk
    ["|--/===\\--| | ", "pppPPPPPppp T "], // r41: palace steps + trunk
    ["[===###===]_|_", "pPPPLLLPPPpeTe"], // r42: grounded palace & emerald garden
  ]);

  // =========================================================================
  // PHASE 4: "ub-city-spire" — UB City / Bengaluru Silicon Valley Spire
  // (cols 81..90, rows 15..42) — ONE sleek modern stepped glass-and-gold tech
  // skyscraper framing the far right to complement Indian heritage landmarks.
  // =========================================================================
  const ubCitySpire = [];
  pushArt(ubCitySpire, 15, 81, [
    ["    /\\    ", "    CC    "], // r15: gleaming ice-cyan spire peak
    ["    ||    ", "    WW    "], // r16: brushed-silver tech mast
    ["   [==]   ", "   GGGG   "], // r17: warm champagne-gold crown lantern
    ["   |:*|   ", "   WugW   "], // r18: illuminated penthouse tech crown
    ["  /====\\  ", "  GGGGGG  "], // r19: Tier 1 stepped champagne-gold terrace
    ["  | :: |  ", "  W uu W  "], // r20: luminous ice-cyan curtain wall
    ["  |-*- |  ", "  Wwgw W  "], // r21: twinkling executive tech suite
    ["  | :: |  ", "  W uu W  "], // r22
    [" /======\\ ", " GWWWWWWG "], // r23: Tier 2 brushed-silver & gold setback
    [" | |::| | ", " W WuuW W "], // r24: vertical glass mullions
    [" |-|*-|-| ", " WwWgwwWW "], // r25: warm golden lit office band
    [" | |::| | ", " W WuuW W "], // r26
    [" |======| ", " WCCCCCCW "], // r27: luminous ice-cyan spandrel band
    [" | |::| | ", " W WuuW W "], // r28
    ["/========\\", "GGGGGGGGGG"], // r29: Tier 3 full-width Silicon Valley spire
    ["| |::::| |", "W WuuuuW W"], // r30
    ["|-|*:: |-|", "WwWguu wwW"], // r31: twinkling Silicon Valley suite
    ["| |::::| |", "W WuuuuW W"], // r32
    ["|==+==+==|", "WGGWGGWGGW"], // r33: warm champagne-gold sky terrace
    ["| |:  :| |", "W Wu  uW W"], // r34
    ["|-|  * |-|", "WwW  g wwW"], // r35: warm golden office window
    ["| |:  :| |", "W Wu  uW W"], // r36
    ["|========|", "WCCCCCCCCW"], // r37: luminous ice-cyan atrium band
    ["| |::::| |", "W WuuuuW W"], // r38
    ["| |:/\\:| |", "W WuCCuW W"], // r39: sleek glass tech lobby arch
    ["| |:  :| |", "W Wu  uW W"], // r40
    ["| |::::| |", "W WGGGGW W"], // r41: illuminated champagne-gold lobby
    ["[===##===]", "wWWWggWWWw"], // r42: grounded Bengaluru tech base on row 42
  ]);

  return {
    id: "bangalore",
    label: "Bangalore",
    title: "BANGALORE",
    nativeTitle: null,
    titleColor: "#FFD166",
    coords: "12.9716° N  77.5946° E",
    skyPalette: ["#090C1C", "#2B1914"],
    ground: { type: "garden" },
    atmosphere: "petals",
    revealOrder: "buildings-first",
    handle: "@googlecloud",
    cols: 92,
    rows: 62,
    waterlineRow: 43,
    moon: null,
    cloudFloat: { row: 5, centerCol: 46, driftAmp: 12 },
    phases: [
      {
        name: "vidhana-soudha",
        startTime: 0.5,
        duration: 3.6,
        reveal: "bottom-up",
        sprites: vidhanaSoudha,
      },
      {
        name: "dravidian-gopuram",
        startTime: 2.4,
        duration: 3.4,
        reveal: "bottom-up",
        sprites: dravidianGopuram,
      },
      {
        name: "indo-saracenic-pavilion",
        startTime: 4.8,
        duration: 3.0,
        reveal: "bottom-up",
        sprites: indoSaracenic,
      },
      {
        name: "ub-city-spire",
        startTime: 6.8,
        duration: 3.0,
        reveal: "bottom-up",
        sprites: ubCitySpire,
      },
    ],
  };
})();
