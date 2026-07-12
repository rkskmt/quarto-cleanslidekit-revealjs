# tools — author-side utilities

These are **author/maintainer tools**, not part of the Quarto extension. They are
**not** installed by `quarto add` (which only copies `_extensions/`), so users of
the theme never download them. Run them from a clone of this repo.

## record-gifs.js

Re-records the README demo GIFs from the [`sample/`](../sample/) course with
playwright-core (see the usage comment at the top of the script). Run it after
UI changes so the GIFs stay honest.

## qmd2pdf

Turn a CleanSlideKit (or any reveal.js) Quarto deck into a real, vector,
selectable-text PDF — no screenshots.

```bash
tools/qmd2pdf deck.qmd                 # handout (default)
tools/qmd2pdf deck.qmd --mode slides   # classic one-slide-per-page
tools/qmd2pdf deck.html --no-render    # print an already-built .html
```

- **handout** (default) un-reveals the deck: each slide becomes a natural-height
  block, stacked as a flowing document and paginated by real rendered height
  (`break-inside: avoid`). Slides that overflow 16:9 are kept in full, not clipped.
- **slides** is reveal's own `?print-pdf` (fixed 16:9, one page per slide).

Handles, in handout mode: full code listings (no scroll clipping), lazy-loaded
images, tabsets (all panes expanded under their tab headings), `.fig-cite` photo
slides, `.break-slide` section dividers, WebGL content (plotly maps / 3D via
software rendering), and hides interactive UI / speaker notes.

### Requirements

- `quarto` (only when rendering from `.qmd`; `--no-render` needs just a built `.html`)
- a Chrome/Chromium binary — auto-detected, or set `CSK_CHROME=/path/to/chrome`

> Chromium is **not** bundled; the script calls whatever is on the system. This is
> an author-side step for producing handouts — keep it out of the student build
> (don't wire it into a project `post-render`, or the build gains a chromium dep).
