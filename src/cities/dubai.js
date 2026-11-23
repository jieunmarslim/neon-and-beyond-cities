export const DUBAI_CITY = (() => {
  const COLS = 92;
  const MAX_ROW = 42;

  function pushSprite(list, row, col, text, color, opts) {
    if (!text) return;
    if (row < 0 || row > MAX_ROW) {
      throw new Error(`Dubai sprite row out of bounds: ${row}`);
    }
    if (col < 0 || col + text.length > COLS) {
      throw new Error(
        `Dubai sprite col out of bounds at row ${row}: col=${col}, len=${text.length}, text="${text}"`
      );
    }
    const sprite = { row, col, text, color };
    if (opts && opts.glow) sprite.glow = true;
    if (opts && opts.twinkle) sprite.twinkle = true;
    if (opts && opts.flicker) sprite.flicker = true;
    list.push(sprite);
  }

  // Paint one aligned ASCII row using parallel glyph & palette-code strings.
  // Spaces in glyphs are transparent; contiguous runs with identical style merge cleanly.
  function paintRow(list, row, startCol, glyphs, codes, palette) {
    if (glyphs.length !== codes.length) {
      throw new Error(
        `Row ${row} template length mismatch: glyphs=${glyphs.length} ("${glyphs}"), codes=${codes.length} ("${codes}")`
      );
    }
    let runStart = -1;
    let runText = "";
    let runCode = "";

    const flush = () => {
      if (runStart < 0 || !runText) return;
      const spec = palette[runCode];
      if (!spec) {
        throw new Error(`Unknown palette code "${runCode}" at row ${row}`);
      }
      pushSprite(list, row, startCol + runStart, runText, spec.color, spec);
      runStart = -1;
      runText = "";
      runCode = "";
    };

    for (let i = 0; i < glyphs.length; i++) {
      const ch = glyphs[i];
      const cd = codes[i];
      if (ch === " " || cd === " ") {
        flush();
        continue;
      }
      if (cd === runCode && runStart >= 0) {
        runText += ch;
      } else {
        flush();
        runStart = i;
        runText = ch;
        runCode = cd;
      }
    }
    flush();
  }

  function paintBlock(list, startRow, startCol, rows, palette) {
    for (let i = 0; i < rows.length; i++) {
      const [glyphs, codes] = rows[i];
      paintRow(list, startRow + i, startCol, glyphs, codes, palette);
    }
  }

  // =========================================================================
  // STAGE 1: "skyline" — Dense Gleaming Marina & Sheikh Zayed Road Skyscrapers
  // Razor-flat horizon at row 42, zero mountains, zero vertical word signs.
  // Leaves pure dark sky framing around Museum of the Future (cols 10..29,
  // rows 0..32) and upper-left Google Cloud sky corridor (rows 0..19, cols 8..40)!
  // =========================================================================
  const skyline = [];
  const SKY_PAL = {
    w: { color: "#6A7699" }, // crisp twilight silver-indigo structural wall
    v: { color: "#4E5778" }, // mid slate-violet curtain wall edge
    d: { color: "#3D4463" }, // subtle dark glass texture
    m: { color: "#58668C" }, // horizontal structural spandrel
    s: { color: "#DCE6F5", glow: true }, // gleaming brushed-silver rooftop crown
    g: { color: "#FFD578", glow: true }, // warm Arabian gold lit office window
    a: { color: "#E8A44E" }, // warm amber-bronze facade & lit offices
    c: { color: "#80E4FF", glow: true }, // crisp ice-cyan lit office window
    b: { color: "#5A9ED4" }, // cool blue glass reflection
    h: { color: "#A87442" }, // flat warm copper-gold horizon base
    r: { color: "#FF5E5E", glow: true, twinkle: true }, // rooftop aviation beacon
  };

  // Left Marina Tower 1: Warm champagne-gold stepped tower (cols 0..4, rows 22..42)
  paintBlock(
    skyline,
    22,
    0,
    [
      [" === ", " sss "],
      ["|===|", "asssa"],
      ["| # |", "a g a"],
      ["| - |", "a m a"],
      ["|  #|", "a  ga"],
      ["|===|", "ababa"],
      ["| : |", "a d a"],
      ["| - |", "a g a"],
      ["|  .|", "a  da"],
      ["|=#=|", "agaga"],
      ["| : |", "a d a"],
      ["| = |", "a c a"],
      ["| # |", "a g a"],
      ["|  .|", "a  da"],
      ["|=# |", "aag a"],
      ["| - |", "a m a"],
      ["|  #|", "a  ga"],
      ["|===|", "ababa"],
      ["| # |", "a g a"],
      ["|   |", "a   a"],
      ["=====", "hhhhh"],
    ],
    SKY_PAL
  );

  // Left Marina Tower 2: Sleek cool glass high-rise (cols 5..9, rows 21..42)
  // Cleanly ends at col 9, leaving pure dark margin col 10 before Museum of the Future!
  paintBlock(
    skyline,
    21,
    5,
    [
      ["  *  ", "  r  "],
      [" /|\\ ", " sss "],
      ["|===|", "wsssw"],
      ["| # |", "w c w"],
      ["|== |", "wbm w"],
      ["|  :|", "w  dw"],
      ["|=# |", "wbg w"],
      ["|  .|", "w  dw"],
      ["|== |", "wac w"],
      ["|#  |", "wg  w"],
      ["|===|", "wmmmw"],
      ["|  .|", "w  dw"],
      ["|=# |", "wcg w"],
      ["|== |", "wbm w"],
      ["|  #|", "w  gw"],
      ["|===|", "wbbbw"],
      ["|#  |", "wc  w"],
      ["|== |", "wam w"],
      ["|  #|", "w  gw"],
      ["|== |", "wmg w"],
      ["| . |", "w d w"],
      ["=====", "hhhhh"],
    ],
    SKY_PAL
  );

  // Downtown Tower 3: Sleek diamond-crowned blue-silver spire (cols 30..33, rows 21..42)
  // Starts cleanly at col 30, leaving pure dark margin col 29 right of Museum of the Future!
  paintBlock(
    skyline,
    21,
    30,
    [
      [" /\\ ", " ss "],
      ["/::\\", "sccs"],
      ["|==|", "wssw"],
      ["| #|", "w cw"],
      ["|==|", "wbbw"],
      ["| .|", "w dw"],
      ["|# |", "wg w"],
      ["|  |", "w  w"],
      ["|==|", "wccw"],
      ["| #|", "w gw"],
      ["|--|", "wmmw"],
      ["| .|", "w dw"],
      ["| #|", "w gw"],
      ["|==|", "wbbw"],
      ["| #|", "w cw"],
      ["|  |", "w  w"],
      ["|=#|", "wgmw"],
      ["|--|", "wmmw"],
      ["| #|", "w gw"],
      ["|==|", "wbbw"],
      ["| .|", "w dw"],
      ["====", "hhhh"],
    ],
    SKY_PAL
  );

  // Downtown Tower 4: Warm honey-gold Address-style skyscraper (cols 34..36, rows 24..42)
  paintBlock(
    skyline,
    24,
    34,
    [
      [" = ", " s "],
      ["|=|", "asa"],
      ["|#|", "aga"],
      ["|=|", "aaa"],
      ["|.|", "ada"],
      ["|#|", "aga"],
      ["|-|", "ama"],
      ["|#|", "aga"],
      ["|=|", "aaa"],
      ["|.|", "ada"],
      ["|#|", "aga"],
      ["| |", "a a"],
      ["|=|", "aaa"],
      ["|#|", "aga"],
      ["|-|", "ama"],
      ["|#|", "aga"],
      ["|.|", "ada"],
      ["|=|", "aaa"],
      ["===", "hhh"],
    ],
    SKY_PAL
  );

  // Downtown Tower 5: Slender dark-indigo glass pencil tower flanking Burj Khalifa left (cols 37..39, rows 26..42)
  paintBlock(
    skyline,
    26,
    37,
    [
      [" /|", " sw"],
      ["|=|", "wbw"],
      ["|#|", "wcw"],
      ["| |", "v v"],
      ["|=|", "wgw"],
      ["| |", "v v"],
      ["|=|", "wbw"],
      ["|#|", "wcw"],
      ["| |", "v v"],
      ["|=|", "wmw"],
      ["|#|", "wgw"],
      ["| |", "v v"],
      ["|=|", "wbw"],
      ["| |", "v v"],
      ["|#|", "wcw"],
      ["|=|", "vmv"],
      ["===", "hhh"],
    ],
    SKY_PAL
  );

  // Slender Business Bay Glass Spire bridging Burj Khalifa right to Emirates Towers (cols 53..54, rows 27..42)
  paintBlock(
    skyline,
    27,
    53,
    [
      ["/|", "sw"],
      ["||", "vw"],
      ["|#", "vg"],
      ["| ", "v "],
      ["|=", "vb"],
      ["| ", "v "],
      ["|#", "vc"],
      ["|=", "vm"],
      ["| ", "v "],
      ["|#", "vg"],
      ["|=", "vb"],
      ["| ", "v "],
      ["|#", "vc"],
      ["|=", "vm"],
      ["| ", "v "],
      ["==", "hh"],
    ],
    SKY_PAL
  );

  // Far-Right Marina Crown / Princess Tower framing right edge (cols 88..91, rows 21..42)
  paintBlock(
    skyline,
    21,
    88,
    [
      [" /\\ ", " ss "],
      ["/::\\", "sccs"],
      ["|==|", "wssw"],
      ["| #|", "w gw"],
      ["|==|", "wbbw"],
      ["| .|", "w dw"],
      ["|# |", "wc w"],
      ["|  |", "w  w"],
      ["|==|", "wbbw"],
      ["| #|", "w gw"],
      ["|--|", "wmmw"],
      ["| .|", "w dw"],
      ["| #|", "w gw"],
      ["|==|", "wbbw"],
      ["| #|", "w gw"],
      ["|  |", "w  w"],
      ["|=#|", "wgmw"],
      ["|--|", "wmmw"],
      ["| #|", "w cw"],
      ["|==|", "wbbw"],
      ["| .|", "w dw"],
      ["====", "hhhh"],
    ],
    SKY_PAL
  );

  // Seamless flat horizon connectors on row 42 in the 1-col canyons between monuments
  pushSprite(skyline, 42, 10, "-", "#A87442");
  pushSprite(skyline, 42, 29, "-", "#A87442");
  pushSprite(skyline, 42, 59, "-", "#A87442");
  pushSprite(skyline, 42, 64, "-", "#A87442");
  pushSprite(skyline, 42, 72, "-", "#A87442");

  // =========================================================================
  // STAGE 2: "museum-of-future" — Plump Sculptural Brushed-Silver Egg Jewel (LEFT)
  // Spanning cols 11..28, rows 32..42 matching real-photo wiki_museum_future.jpg:
  // organic curved egg contour (no boxy edges), thick ~75% solid calligraphy body,
  // and a compact sleek 5x2 almond oval opening offset slightly left-of-center!
  // =========================================================================
  const museumOfFuture = [];
  const MOTF_PAL = {
    W: { color: "#FFFFFF", glow: true }, // blazing pure brushed-silver outer egg contour
    S: { color: "#DCEEFF", glow: true }, // luminous brushed stainless-steel body
    C: { color: "#67E8F9", glow: true }, // glowing Arabic calligraphy cyan ribbon
    G: { color: "#FFE29A", glow: true }, // warm champagne-gold calligraphic highlights
    T: { color: "#4EE0A5", glow: true }, // curved lush emerald terraced podium
    E: { color: "#328C6B" }, // shaded emerald hill skirt
    P: { color: "#D4A066", glow: true }, // flat desert-horizon limestone base
  };

  paintBlock(
    museumOfFuture,
    32,
    11,
    [
      ["    ._==~~~==_.   ", "    WWWSCGCSWWW   "], // row 32: smooth curved egg crown
      ["  ./~/=#~==~#\\~\\. ", "  WCSWCGWSSWGCWSW "], // row 33: plump calligraphy upper dome
      [" /~/=~.-----.~/#~\\", " WCGWCSWWWWWSCWCGW"], // row 34: sculpted upper arch & almond top rim
      ["(~:/ /     \\ ~:#~)", "WCGW S     S CGCSW"], // row 35: sleek 5-col almond void + thick curved right!
      ["(~|\\ \\     / ~=#~)", "WCGW S     S CGSGW"], // row 36: plump curved right cheek `)` + almond void!
      [" \\~:\\ `---' /~:#~/", " WGCW SWWWS WCGCSW"], // row 37: lower almond curve + thick calligraphy body
      ["  `\\~:\\~===~~/#~/'", "  WWGCWCSSSGSCGWSW"], // row 38: smooth curving lower egg belly
      ["    `~\\=/#~#=/~'  ", "    WWCGWCSCWGCW  "], // row 39: rounded stainless egg underside
      ["     `~======~'   ", "     WWSSSSSSWW   "], // row 40: brushed-steel egg base gleam
      [" _/============\\_ ", " ETTTTTTTTTTTTTTE "], // row 41: curved lush emerald terraced mound
      ["==================", "PPPPPPPPPPPPPPPPPP"], // row 42: flat desert-horizon plaza base
    ],
    MOTF_PAL
  );

  // =========================================================================
  // STAGE 3: "emirates-frame" — Mirrored Twin Emirates Towers + Golden Dubai Frame
  // 1) Twin slanted-crown Emirates Towers facing each other (cols 55..63, rows 19..42)
  // 2) Luminous Arabian Gold Dubai Frame portal (cols 65..71, rows 24..42)
  // =========================================================================
  const emiratesFrame = [];
  const EF_PAL = {
    r: { color: "#FF5E5E", glow: true, twinkle: true }, // spire aviation beacon
    s: { color: "#E6F0FC", glow: true }, // luminous brushed-silver crowns & spires
    w: { color: "#8EA4C8" }, // crisp metallic Emirates Tower walls
    m: { color: "#687EA3" }, // horizontal window mullions
    d: { color: "#465678" }, // dark slate glass
    c: { color: "#80E4FF", glow: true }, // bright ice-cyan window accent
    g: { color: "#FFD873", glow: true }, // warm gold window accent
    F: { color: "#FFE285", glow: true }, // blazing Dubai Frame top skybridge gold
    G: { color: "#FFB84D", glow: true }, // rich gilded Dubai Frame portal piers
    K: { color: "#C98532" }, // patterned gold filigree depth
    h: { color: "#B88046" }, // flat horizon plinth
  };

  // Left Emirates Tower (cols 55..58, rows 19..42 — spire at col 58, slanted / crown!)
  paintBlock(
    emiratesFrame,
    19,
    55,
    [
      ["   *", "   r"],
      ["   |", "   s"],
      ["   |", "   s"],
      ["  /|", "  sw"],
      [" /:=", " smw"],
      ["/==|", "sssw"],
      ["|==|", "wmmw"],
      ["| #|", "w gw"],
      ["|  |", "w  w"],
      ["| .|", "w dw"],
      ["| #|", "w cw"],
      ["|==|", "wmmw"],
      ["|  |", "w  w"],
      ["|# |", "wg w"],
      ["|==|", "wmmw"],
      ["| .|", "w dw"],
      ["| #|", "w cw"],
      ["|  |", "w  w"],
      ["| #|", "w gw"],
      ["|--|", "wmmw"],
      ["|  |", "w  w"],
      ["| .|", "w dw"],
      ["|==|", "wmmw"],
      ["====", "hhhh"],
    ],
    EF_PAL
  );

  // Right Emirates Tower (cols 60..63, rows 19..42 — spire at col 60, mirrored \ crown!)
  paintBlock(
    emiratesFrame,
    19,
    60,
    [
      ["*   ", "r   "],
      ["|   ", "s   "],
      ["|   ", "s   "],
      ["|\\  ", "ws  "],
      ["=:\\ ", "wms "],
      ["|==\\", "wsss"],
      ["|==|", "wmmw"],
      ["|# |", "wg w"],
      ["|  |", "w  w"],
      ["|. |", "wd w"],
      ["|# |", "wc w"],
      ["|==|", "wmmw"],
      ["|  |", "w  w"],
      ["| #|", "w gw"],
      ["|==|", "wmmw"],
      ["|. |", "wd w"],
      ["|# |", "wc w"],
      ["|  |", "w  w"],
      ["|# |", "wg w"],
      ["|--|", "wmmw"],
      ["|  |", "w  w"],
      ["|. |", "wd w"],
      ["|==|", "wmmw"],
      ["====", "hhhh"],
    ],
    EF_PAL
  );

  // Golden Dubai Frame (cols 65..71, rows 24..42 — unmistakable glowing hollow gold portal!)
  paintBlock(
    emiratesFrame,
    24,
    65,
    [
      [".=====.", "FFFFFFF"], // row 24: glowing Sky Deck top beam
      ["|#####|", "GFFFFFG"], // row 25: gilded filigree lintel
      ["|:   :|", "GK   KG"], // rows 26..40: open hollow rectangular gold portal!
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|#   #|", "GF   FG"],
      ["|:   :|", "GK   KG"],
      ["|=====|", "GFFFFFG"], // row 41: golden gallery base
      ["=======", "GGGGGGG"], // row 42: flat horizon foundation
    ],
    EF_PAL
  );

  // =========================================================================
  // STAGE 4: "burj-khalifa" — Ultra-Slender Real-Photo Dead-Center Monolith
  // Centered on exact col 46 (cols 40..52, rows 4..42): soaring far above
  // the dense surrounding skyline in champagne-silver, ice-blue & Arabian gold!
  // =========================================================================
  const burjKhalifa = [];
  const BK_PAL = {
    W: { color: "#FFFFFF", glow: true, twinkle: true }, // diamond camera-flash LED strobe
    S: { color: "#F5FAFF", glow: true }, // blazing pearl-silver spire & spine
    I: { color: "#9CE8FF", glow: true }, // luminous pale ice-blue glass bands
    i: { color: "#80D2F2" }, // crisp ice-blue vertical mullions
    B: { color: "#5CAEE8", glow: true }, // cool sapphire-silver outer ribs
    b: { color: "#569ED6" }, // slender outer setback wings
    G: { color: "#FFD98A", glow: true }, // warm Arabian champagne-gold mechanical rings & plaza
    T: { color: "#FFF0C2", glow: true, twinkle: true }, // warm gold twinkling facade strobe
  };

  paintBlock(
    burjKhalifa,
    4,
    40,
    [
      ["      *      ", "      W      "], // row  4: pinnacle beacon tip (col 46!)
      ["      |      ", "      S      "], // row  5
      ["      +      ", "      S      "], // row  6
      ["      |      ", "      I      "], // row  7
      ["      +      ", "      W      "], // row  8
      ["      |      ", "      I      "], // row  9
      ["      |      ", "      S      "], // row 10: long razor-slender needle
      ["     /|\\     ", "     ISI     "], // row 11: spire collar (width 3)
      ["     |:|     ", "     iSi     "], // row 12
      ["     |#|     ", "     GSG     "], // row 13: champagne-gold lantern
      ["     |:|     ", "     iSi     "], // row 14
      ["     |:|     ", "     iSi     "], // row 15
      ["     |=|     ", "     ISI     "], // row 16: upper setback collar
      ["    /|:|\\    ", "    BiSiB    "], // row 17: slender upper tier (width 5)
      ["    ||:||    ", "    biSib    "], // row 18
      ["    ||#||    ", "    biSib    "], // row 19
      ["    ||:||    ", "    biSib    "], // row 20
      ["    |:*:|    ", "    biWib    "], // row 21: twinkling facade strobe
      ["    |===|    ", "    GSSSG    "], // row 22: At The Top SKY gold-silver ring
      ["   /||:||    ", "   BiiSib    "], // row 23: staggered spiral setback left (width 6->7)
      ["   |||:||\\   ", "   biiSiiB   "], // row 24: staggered setback right (width 7)
      ["   |:|:|:|   ", "   biSiSib   "], // row 25
      ["   |*|#|.|   ", "   bWISiib   "], // row 26: twinkling strobe
      ["   |[###]|   ", "   ISSSSSI   "], // row 27: observation deck band
      ["   |:|:|:|   ", "   biSiSib   "], // row 28
      ["  /||:|:||\\  ", "  BiiSiSiiB  "], // row 29: graceful mid setback (width 9)
      ["  |:||:||:|  ", "  biibSbiib  "], // row 30
      ["  |:||#||*|  ", "  biibSbiWb  "], // row 31: twinkling strobe
      ["  |==[#]==|  ", "  BIIGGGIIB  "], // row 32: warm champagne-gold band
      ["  |:||:||:|  ", "  biibSbiib  "], // row 33
      [" /|::|:|::|  ", " BiIibSbiIb  "], // row 34: staggered spiral setback left (width 10->11)
      [" ||::|:|::|\\ ", " biIibSbiIiB "], // row 35: staggered setback right (width 11)
      [" ||*||#||:|| ", " biTbiSibiib "], // row 36: gold twinkling strobe
      [" |===[#]===| ", " BIIISSSIIIB "], // row 37: luminous mechanical terrace
      [" |:||:|:||:| ", " biibSiSbiib "], // row 38
      ["/||:|:|:|:||\\", "BiiibSiSbiiiB"], // row 39: sleek Y-podium shoulder (width 13)
      ["||:|:|#|::|||", "biiibISibiiib"], // row 40: grand glass atrium flutes
      ["||#|:=#=:||#|", "biGiIGSGIIiGb"], // row 41: warm champagne-gold lobby glow
      ["/====###====\\", "GGGGGSSSGGGGG"], // row 42: flat golden desert-plaza base
    ],
    BK_PAL
  );

  // =========================================================================
  // STAGE 5: "burj-al-arab" — Curved Billowing Sail & Helipad (RIGHT)
  // Spanning cols 73..87, rows 19..42 (exact real-photo proportions: thin mast,
  // Skyview Bar cantilever, circular helipad, diagonal X-bracing, glowing sail).
  // =========================================================================
  const burjAlArab = [];
  const BAA_PAL = {
    W: { color: "#FFF6DE", glow: true, twinkle: true }, // mast tip beacon
    H: { color: "#FFF6E3", glow: true }, // luminous pearl-white helipad, sail rim & Skyview Bar
    G: { color: "#FFD080", glow: true }, // warm champagne-gold structural arc & mast
    g: { color: "#E8B568" }, // warm gold steel spine
    O: { color: "#FF945E", glow: true }, // warm sunset-coral diagonal X-brace accents
    o: { color: "#D97E52" }, // diagonal rear structural brace
    C: { color: "#80E8FF", glow: true }, // luminous turquoise-cyan backlit sail glass
    c: { color: "#5EC5E3" }, // calm cyan backlit Teflon panels
    M: { color: "#FFE6A8", glow: true }, // warm gold atrium core lights
    P: { color: "#C9965E" }, // flat sculpted island base meeting desert horizon
  };

  paintBlock(
    burjAlArab,
    19,
    73,
    [
      ["           *   ", "           W   "], // row 19: mast spire tip (col 84)
      ["           |   ", "           H   "], // row 20: tall thin mast spire
      ["           |   ", "           G   "], // row 21: mast spire
      ["        _/=|=] ", "        GGMHHH "], // row 22: mast crown + Skyview Bar cantilever
      ["(==)-/::\\||:|/ ", "HHHHGGccOgGGgH "], // row 23: ICONIC HELIPAD + Skyview underside
      [" \\__/:/\\:||:|  ", " gOGGcOOcGGgG  "], // row 24: helipad strut + upper curved sail
      ["   /:/:\\:||:|\\ ", "   GcOcOcGGgGo "], // row 25: billowing sail curving left
      ["  /:/::\\:||#|  ", "  GcOccOcGGMG  "], // row 26
      [" (=/::::X||:|  ", " HGOccccOGGgG  "], // row 27: upper sail tension rib
      [" |/:::::/||:|  ", " HOcccccOGGgG  "], // row 28: backlit turquoise glass sail
      ["(|\\::::/:||#|  ", "HGOccccOcGGMG  "], // row 29: fullest spinnaker curve
      ["|::\\::/::||:|  ", "HccOccOccGGgG  "], // row 30
      ["|===XX===||:|  ", "HOOOMMOOOGGgG  "], // row 31: mid-sail diagonal X-brace
      ["|::/::\\::||:|  ", "HccOccOccGGgG  "], // row 32
      ["|:/::::\\:||#|  ", "HcOccccOcGGMG  "], // row 33
      [" |\\:::::\\||:|\\ ", " GOcccccOGGgGo "], // row 34: lower taper + rear brace
      [" |=\\::::X||:|\\ ", " GGOccccOGGgGo "], // row 35
      ["  \\:\\::/:||#|\\ ", "  GcOccOcGGMGo "], // row 36
      ["  \\==XX==||:|\\ ", "  GOOMMOOGGgGo "], // row 37: lower diagonal X-brace
      ["   \\/::\\:||:|| ", "   GOccOcGGgGo "], // row 38
      ["    \\::/:||#|| ", "    GccOcGGMGo "], // row 39
      ["    \\::/:||:|| ", "    GccOcGGgGo "], // row 40
      ["  __/====||=||_", "  GGGGGGGGGMGgP"], // row 41: low coastal island terrace
      ["_/============\\", "PGGGGGGHHHGGGGP"], // row 42: flat horizon island base
    ],
    BAA_PAL
  );

  return {
    id: "dubai",
    label: "Dubai",
    title: "DUBAI",
    titleColor: "#FFD470",
    coords: "25.2048° N  55.2708° E",
    skyPalette: ["#09060C", "#1E1322"],
    ground: { type: "dunes" },
    atmosphere: "breeze",
    revealOrder: "ground-first",
    handle: "@googlecloud",
    cols: 92,
    rows: 62,
    waterlineRow: 43,
    moon: null,
    cloudFloat: { row: 7, centerCol: 24, driftAmp: 8 },
    phases: [
      {
        name: "skyline",
        startTime: 0.4,
        duration: 3.2,
        reveal: "bottom-up",
        sprites: skyline,
      },
      {
        name: "museum-of-future",
        startTime: 1.0,
        duration: 2.6,
        reveal: "left-right",
        sprites: museumOfFuture,
      },
      {
        name: "emirates-frame",
        startTime: 3.2,
        duration: 2.6,
        reveal: "bottom-up",
        sprites: emiratesFrame,
      },
      {
        name: "burj-khalifa",
        startTime: 5.0,
        duration: 3.2,
        reveal: "bottom-up",
        sprites: burjKhalifa,
      },
      {
        name: "burj-al-arab",
        startTime: 7.2,
        duration: 2.6,
        reveal: "bottom-up",
        sprites: burjAlArab,
      },
    ],
  };
})();
