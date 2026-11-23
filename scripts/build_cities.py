#!/usr/bin/env python3
"""Build standalone 6-city hand-crafted 92x62 ASCII cities.html.

Bundles src/cities/{seoul,dubai,singapore,taiwan,beijing,bangalore,engine}.js
(each isolated in its own IIFE to prevent top-level identifier collisions) and
embeds assets/cloud-logo.png as a base64 data URI into a self-contained
cities.html that works offline over file://.
"""

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOGO_PATH = ROOT / "assets" / "cloud-logo.png"
CITIES_DIR = ROOT / "src" / "cities"
ENGINE_PATH = CITIES_DIR / "engine.js"
OUT_HTML = ROOT / "index.html"

CITY_MODULES = [
    ("seoul", "SEOUL_CITY", CITIES_DIR / "seoul.js"),
    ("dubai", "DUBAI_CITY", CITIES_DIR / "dubai.js"),
    ("singapore", "SINGAPORE_CITY", CITIES_DIR / "singapore.js"),
    ("taipei", "TAIPEI_CITY", CITIES_DIR / "taiwan.js"),
    ("beijing", "BEIJING_CITY", CITIES_DIR / "beijing.js"),
    ("bangalore", "BANGALORE_CITY", CITIES_DIR / "bangalore.js"),
]

FORBIDDEN_SINK_RE = re.compile(
    r"\b(?:innerHTML|outerHTML|document\.write|eval\s*\(|alert\s*\(|confirm\s*\(|prompt\s*\()"
)


def strip_es_module_syntax(source: str) -> str:
    """Convert ES module imports/exports into IIFE-scoped declarations."""
    cleaned = re.sub(r"^\s*import\s+[^;]+;\s*$", "", source, flags=re.MULTILINE)
    cleaned = re.sub(
        r"^(\s*)export\s+(?=(?:const|let|var|async\s+function|function|class)\b)",
        r"\1",
        cleaned,
        flags=re.MULTILINE,
    )
    cleaned = re.sub(r"^\s*export\s*\{[^}]*\}\s*;?\s*$", "", cleaned, flags=re.MULTILINE)
    return cleaned.strip()


def wrap_iife(const_name: str, source: str) -> str:
    body = strip_es_module_syntax(source)
    return f"const {const_name} = (() => {{\n{body}\nreturn {const_name};\n}})();"


HTML_TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Neon &amp; Beyond — Nocturnal ASCII Skylines</title>
  <meta name="description" content="Hand-crafted nocturnal architectural ASCII skyline installation of Seoul, Dubai, Singapore, Taipei, Beijing, and Bangalore with floating Google Cloud finale. Gemini 4 Neon." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600;700;800&family=Noto+Sans+KR:wght@400;500;700&family=Noto+Sans+SC:wght@400;500&family=Noto+Sans+TC:wght@400;500&display=swap"
  />
  <style>
    :root {
      --bg-night: #05070D;
      --dock-bg: rgba(9, 13, 24, 0.72);
      --pill-hover: rgba(255, 255, 255, 0.08);
      --pill-active: rgba(255, 255, 255, 0.15);
      --ink-primary: #F2F5FA;
      --ink-secondary: #8A9BB3;
      --focus-blue: #4285F4;
      --font-sans: 'Inter', 'Noto Sans KR', 'Noto Sans TC', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      scrollbar-width: none;
      -ms-overflow-style: none;
    }

    *::-webkit-scrollbar {
      display: none;
    }

    html, body {
      width: 100%;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: var(--bg-night);
      color: var(--ink-primary);
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
    }

    #stage {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      display: block;
      cursor: pointer;
      touch-action: none;
      user-select: none;
    }

    .masthead {
      position: fixed;
      top: max(22px, env(safe-area-inset-top, 22px));
      left: 0;
      right: 0;
      padding: 0 clamp(22px, 3.2vw, 44px);
      z-index: 8;
      pointer-events: none;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      user-select: none;
    }

    .masthead-place {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .masthead-title-row {
      display: inline-flex;
      align-items: baseline;
      gap: 8px;
    }

    .masthead-city {
      font-family: var(--font-sans);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.24em;
      line-height: 1.2;
      color: rgba(242, 246, 252, 0.88);
    }

    .masthead-native {
      font-family: 'Noto Sans KR', 'Noto Sans TC', 'Noto Sans SC', var(--font-sans);
      font-size: 12.5px;
      font-weight: 400;
      letter-spacing: 0.14em;
      line-height: 1.2;
      color: rgba(206, 222, 246, 0.58);
    }

    .masthead-coords {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: 0.08em;
      line-height: 1.2;
      font-variant-numeric: tabular-nums;
      color: rgba(170, 192, 222, 0.46);
    }

    .masthead-folio {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: 0.16em;
      line-height: 1.2;
      color: rgba(186, 206, 232, 0.38);
      padding-top: 2px;
      white-space: nowrap;
    }

    .footer-dock {
      position: fixed;
      left: 50%;
      bottom: max(16px, env(safe-area-inset-bottom, 16px));
      transform: translateX(-50%);
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      max-width: calc(100vw - 24px);
      pointer-events: none;
    }

    .switcher {
      pointer-events: auto;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      padding: 4px;
      border-radius: 9999px;
      background: var(--dock-bg);
      backdrop-filter: saturate(160%) blur(22px);
      -webkit-backdrop-filter: saturate(160%) blur(22px);
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.52);
      max-width: 100%;
      overflow-x: auto;
    }

    .dock-sep {
      width: 1px;
      height: 16px;
      margin: 0 4px;
      background: rgba(255, 255, 255, 0.12);
      flex-shrink: 0;
    }

    .city-btn {
      appearance: none;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ink-secondary);
      font-family: var(--font-sans);
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: -0.01em;
      line-height: 1;
      height: 32px;
      padding: 0 13px;
      border-radius: 9999px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background-color 160ms ease, color 160ms ease;
    }

    .city-btn:hover {
      background: var(--pill-hover);
      color: var(--ink-primary);
    }

    .city-btn[aria-pressed="true"] {
      background: var(--pill-active);
      color: var(--ink-primary);
    }

    .city-btn:focus-visible {
      outline: none;
      border-color: var(--focus-blue);
    }

    .replay-btn {
      color: rgba(206, 220, 240, 0.78);
    }

    .credit {
      font-family: var(--font-mono);
      font-size: 10.5px;
      font-weight: 500;
      letter-spacing: 0.03em;
      color: rgba(206, 220, 240, 0.68);
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(5, 8, 16, 0.64);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      user-select: none;
      white-space: nowrap;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    @media (max-width: 720px) {
      .masthead-city {
        font-size: 12.5px;
      }
      .masthead-coords,
      .masthead-folio {
        font-size: 9.5px;
      }
      .city-btn {
        font-size: 11.5px;
        height: 30px;
        padding: 0 10px;
      }
    }
  </style>
</head>
<body>
  <h1 class="sr-only">Neon and Beyond — Nocturnal Hand-Crafted ASCII Skylines of Seoul, Dubai, Singapore, Taipei, Beijing, and Bangalore</h1>
  <canvas id="stage" aria-label="Hand-crafted nocturnal ASCII city skyline installation"></canvas>

  <header class="masthead" aria-live="polite">
    <div class="masthead-place">
      <div class="masthead-title-row">
        <span id="mastheadCity" class="masthead-city">SEOUL</span>
        <span id="mastheadNative" class="masthead-native" hidden></span>
      </div>
      <div id="mastheadCoords" class="masthead-coords">37.5665° N  126.9780° E</div>
    </div>
    <div class="masthead-folio">NEON &amp; BEYOND · JAPAC</div>
  </header>

  <footer class="footer-dock">
    <nav class="switcher" role="group" aria-label="Select city skyline">
      <button id="btnSeoul" class="city-btn" type="button" data-city="seoul" aria-pressed="true">Seoul</button>
      <button id="btnDubai" class="city-btn" type="button" data-city="dubai" aria-pressed="false">Dubai</button>
      <button id="btnSingapore" class="city-btn" type="button" data-city="singapore" aria-pressed="false">Singapore</button>
      <button id="btnTaipei" class="city-btn" type="button" data-city="taipei" aria-pressed="false">Taipei</button>
      <button id="btnBeijing" class="city-btn" type="button" data-city="beijing" aria-pressed="false">Beijing</button>
      <button id="btnBangalore" class="city-btn" type="button" data-city="bangalore" aria-pressed="false">Bangalore</button>
      <span class="dock-sep" aria-hidden="true"></span>
      <button id="btnReplay" class="city-btn replay-btn" type="button">Replay</button>
    </nav>
    <p class="credit">Gemini 4 Neon</p>
  </footer>

  <script>
    (() => {
      "use strict";

      const CLOUD_LOGO_URI = "data:image/png;base64,__LOGO_B64__";

__CITY_BUNDLES__

__ENGINE_BUNDLE__

      const ALLOWED_CITIES = new Set(["seoul", "dubai", "singapore", "taipei", "beijing", "bangalore"]);
      const params = new URLSearchParams(window.location.search);
      const rawCityParam = (params.get("city") || "").toLowerCase();
      const mappedCityParam = rawCityParam === "taiwan" ? "taipei" : rawCityParam;
      const initialCityId = ALLOWED_CITIES.has(mappedCityParam) ? mappedCityParam : "seoul";

      const tParam = params.get("t");
      const parsedT = tParam !== null ? Number(tParam) : 0;
      const initialTime = Number.isFinite(parsedT) && parsedT >= 0 ? Math.min(120, parsedT) : 0;
      const pinInitialTime = tParam !== null && Number.isFinite(parsedT);

      mountCitySkyline({
        canvas: document.getElementById("stage"),
        mastheadCityEl: document.getElementById("mastheadCity"),
        mastheadNativeEl: document.getElementById("mastheadNative"),
        mastheadCoordsEl: document.getElementById("mastheadCoords"),
        cities: [SEOUL_CITY, DUBAI_CITY, SINGAPORE_CITY, TAIPEI_CITY, BEIJING_CITY, BANGALORE_CITY],
        initialCityId,
        initialTime,
        pinInitialTime,
        cloudLogoUri: CLOUD_LOGO_URI,
        cityButtons: Array.from(document.querySelectorAll(".city-btn[data-city]")),
        replayButton: document.getElementById("btnReplay"),
      });
    })();
  </script>
</body>
</html>
"""


def main() -> None:
    if not LOGO_PATH.exists():
        raise SystemExit(f"Missing Google Cloud logo asset: {LOGO_PATH}")
    if not ENGINE_PATH.exists():
        raise SystemExit(f"Missing engine source: {ENGINE_PATH}")

    city_bundles = []
    for city_id, const_name, path in CITY_MODULES:
        if not path.exists():
            raise SystemExit(f"Missing city module ({city_id}): {path}")
        raw = path.read_text(encoding="utf-8")
        if FORBIDDEN_SINK_RE.search(raw):
            raise SystemExit(f"Security check failed: forbidden DOM/eval sink in {path}")
        city_bundles.append(wrap_iife(const_name, raw))

    engine_raw = ENGINE_PATH.read_text(encoding="utf-8")
    if FORBIDDEN_SINK_RE.search(engine_raw):
        raise SystemExit(f"Security check failed: forbidden DOM/eval sink in {ENGINE_PATH}")

    engine_bundle = wrap_iife("mountCitySkyline", engine_raw)
    logo_b64 = base64.b64encode(LOGO_PATH.read_bytes()).decode("ascii")

    html = (
        HTML_TEMPLATE.replace("__LOGO_B64__", logo_b64)
        .replace("__CITY_BUNDLES__", "\n\n".join(city_bundles))
        .replace("__ENGINE_BUNDLE__", engine_bundle)
    )

    if FORBIDDEN_SINK_RE.search(html):
        raise SystemExit("Security check failed: forbidden DOM/eval sink in generated HTML")

    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"Wrote {OUT_HTML} ({len(html):,} bytes)")


if __name__ == "__main__":
    main()
