// Record the README demo videos (webm) from the sample/ course with
// playwright-core. One browser context per demo, recordVideo 1280x720; a fake
// cursor dot and a pressed-key toast are injected so interactions are visible
// in the GIFs.
//
// Usage (author-side, not part of the extension):
//   cd sample && quarto render && python3 -m http.server 8017 --directory _site &
//   npm i playwright-core        # in any scratch dir; browsers must be in the
//                                # playwright cache (npx playwright install chromium)
//   node record-gifs.js [demo…]  # no args = all demos -> ./videos/*.webm
//   for v in videos/*.webm; do n=$(basename $v .webm); \
//     ffmpeg -i $v -vf "fps=10,scale=880:-1:flags=lanczos,palettegen=stats_mode=diff" $n-pal.png && \
//     ffmpeg -i $v -i $n-pal.png -lavfi "fps=10,scale=880:-1:flags=lanczos [x]; \
//       [x][1:v] paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" doc/gif/$n.gif; done
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:8017/';
const OUT = path.join(__dirname, 'videos');

// Injected into every page: cursor dot follows mousemove, toast shows keys.
const overlay = () => {
  const mk = () => {
    if (document.getElementById('__cursor')) return;
    const c = document.createElement('div');
    c.id = '__cursor';
    c.style.cssText = 'position:fixed;left:0;top:0;width:24px;height:24px;border-radius:50%;' +
      'background:rgba(247,109,94,0.55);border:2.5px solid rgba(255,255,255,0.95);' +
      'box-shadow:0 1px 6px rgba(0,0,0,0.45);pointer-events:none;z-index:2147483647;' +
      'transform:translate(-50%,-50%);display:none;transition:transform 0.08s;';
    document.body.appendChild(c);
    const t = document.createElement('div');
    t.id = '__keytoast';
    t.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);' +
      'padding:8px 18px;border-radius:9px;background:rgba(20,22,26,0.85);color:#fff;' +
      'font:600 18px/1.2 system-ui,sans-serif;z-index:2147483647;display:none;' +
      'pointer-events:none;letter-spacing:0.05em;';
    document.body.appendChild(t);
    let tmr;
    const show = (txt) => {
      t.textContent = txt; t.style.display = 'block';
      clearTimeout(tmr); tmr = setTimeout(() => { t.style.display = 'none'; }, 1000);
    };
    window.addEventListener('mousemove', e => {
      c.style.display = 'block';
      c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px';
    }, true);
    window.addEventListener('mousedown', () => {
      c.style.transform = 'translate(-50%,-50%) scale(0.55)';
    }, true);
    window.addEventListener('mouseup', () => {
      c.style.transform = 'translate(-50%,-50%) scale(1)';
    }, true);
    window.addEventListener('keydown', e => {
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;
      // typing into a field is visible in the field itself — no toast
      const el = e.target;
      if (el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable)) return;
      const names = { ArrowDown: '↓', ArrowUp: '↑', ArrowLeft: '←',
                      ArrowRight: '→', Escape: 'Esc', ' ': 'Space' };
      show((e.ctrlKey ? 'Ctrl + ' : '') + (names[e.key] || e.key));
    }, true);
    window.addEventListener('wheel', e => { if (e.ctrlKey) show('Ctrl + scroll'); }, true);
  };
  if (document.body) mk(); else document.addEventListener('DOMContentLoaded', mk);
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function glide(page, locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('no bounding box for locator');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
}

async function waitDeck(page) {
  await page.waitForSelector('.reveal .slides section.present', { timeout: 15000 });
}

const demos = {
  // Index card grid -> deck -> Home -> "resume where you left"
  'index-nav': async (page) => {
    await page.goto(BASE); await waitDeck(page); await sleep(1200);
    const card = page.locator('.lectures a', { hasText: 'Gradient descent' });
    await glide(page, card); await sleep(900);
    await card.click(); await waitDeck(page); await sleep(1800);
    await page.keyboard.press('ArrowRight'); await sleep(1800);
    const home = page.locator('#home-btn');
    await glide(page, home); await sleep(600);
    await home.click();
    await waitDeck(page); await sleep(1600);
    await page.keyboard.press('ArrowRight');
    await waitDeck(page); await sleep(2400);
  },

  // t -> drawer -> arrow down -> Enter jumps
  'toc-drawer': async (page) => {
    await page.goto(BASE + 'gradient-descent.html'); await waitDeck(page); await sleep(1400);
    await page.keyboard.press('t'); await sleep(1300);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowDown'); await sleep(650); }
    await page.keyboard.press('Enter'); await sleep(2400);
  },

  // search button -> type -> click a hit in another deck
  'search': async (page) => {
    await page.goto(BASE + 'getting-started.html#/overfitting');
    await waitDeck(page); await sleep(1200);
    const btn = page.locator('#search-btn');
    await glide(page, btn); await sleep(500);
    await btn.click(); await sleep(900);
    await page.keyboard.type('gradient', { delay: 150 }); await sleep(1500);
    const hit = page.locator('#search-modal-results a.search-hit', { hasText: 'Gradient descent' }).first();
    await glide(page, hit); await sleep(700);
    await hit.click();
    await waitDeck(page); await sleep(2600);
  },

  // .peek link -> single-slide modal -> Esc
  'peek': async (page) => {
    await page.goto(BASE + 'gradient-descent.html#/recap');
    await waitDeck(page); await sleep(1400);
    const link = page.locator('section.present a.peek').first();
    await glide(page, link); await sleep(800);
    await link.click();
    await page.waitForSelector('#peek-modal.peek-open', { timeout: 10000 });
    await sleep(4200);  // let the inner deck boot + MathJax typeset
    await page.keyboard.press('Escape'); await sleep(1800);
  },

  // expand button -> zoom modal -> Ctrl+scroll -> copy -> Esc
  'code-zoom': async (page) => {
    await page.goto(BASE + 'gradient-descent.html#/a-minimal-implementation');
    await waitDeck(page); await sleep(1400);
    const btn = page.locator('section.present .code-expand-button').first();
    await glide(page, btn); await sleep(600);
    await btn.click();
    await page.waitForSelector('#code-zoom-modal.code-zoom-open', { timeout: 5000 });
    await sleep(1200);
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        document.getElementById('code-zoom-content').dispatchEvent(
          new WheelEvent('wheel', { deltaY: -120, ctrlKey: true, bubbles: true, cancelable: true }));
      });
      await sleep(650);
    }
    const copy = page.locator('#code-zoom-copy');
    await glide(page, copy); await sleep(500);
    await copy.click(); await sleep(1400);
    await page.keyboard.press('Escape'); await sleep(1500);
  },
};

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const browser = await chromium.launch({ headless: true, chromiumSandbox: false });
  for (const [name, fn] of Object.entries(demos)) {
    if (only.length && !only.includes(name)) continue;
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      deviceScaleFactor: 1,
      recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
    });
    await ctx.addInitScript(overlay);
    const page = await ctx.newPage();
    try {
      await fn(page);
      const video = page.video();
      await ctx.close();
      const p = await video.path();
      fs.renameSync(p, path.join(OUT, name + '.webm'));
      console.log('recorded', name);
    } catch (e) {
      console.error('FAILED', name, e.message);
      await ctx.close().catch(() => {});
    }
  }
  await browser.close();
})();
