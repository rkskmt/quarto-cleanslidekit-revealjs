# CleanSlideKit RevealJS

A self-contained Quarto **revealjs** format for lecture-style decks: a clean
theme plus a small UI kit (slide peek, in-deck search, body layout helpers) and
a handful of Lua filters. Distilled from a real, in-production AI / data-science
lecture series.

The theme is derived from [`clean`](https://github.com/grantmcdermott/quarto-revealjs-clean)
by Grant McDermott; everything else (UI JS, Lua filters, JP typography) is added
on top.

## Install

```bash
quarto add rkskmt/quarto-cleanslidekit-revealjs
```

## Use

In your document front matter:

```yaml
---
title: "My lecture"
format: cleanslidekit-revealjs
---
```

That's it — no extra paths to wire up. The CSS/JS are shipped via the extension
and copied next to your rendered deck automatically.

## What's included

**Theme & layout**
- `theme.scss` — clean-derived reveal theme (1280×720, github code highlighting).
- `custom.css` — typography and slide layout, including a `.en` span style for
  English co-notation of Japanese terms (`過学習（[overfitting]{.en}）`; for an
  abbreviation spell-out, bold it: `DNN（[**Deep Neural Network**]{.en}）`),
  plus a **lecture-index card grid** for index / TOC pages (see [Lecture index](#lecture-index)).

**UI kit (plain ES modules, no build step)**
- `slide-ui.js` — slide chrome: footer nav counter, code copy/zoom buttons, home button.
- `search-ui.js` — in-deck text search.
- `peek-ui.js` — slide peek / overview navigation.
- `badge-ui.js` — rosette title-corner badges via slide classes
  (`{.badge-important}` / `{.badge-practice}` / `{.badge-fyi}`, plus `-ja` variants).

**Lua filters**
- `slide-body.lua` — slide body / column layout classes.
- `hl.lua` — inline highlight syntax.
- `fw-colon.lua` — full-width colon (`：`) alignment for Japanese.
- `cite-image.lua` — clean `image + citation` syntax.
- `plotly-iframe.lua` — embed a Plotly HTML export as a sized iframe via a
  `.plotly-iframe` div (`src`, `width`, `height` attributes).

## Lecture index

`custom.css` ships a card-grid component for an **index / table-of-contents page**.
Each lecture is a numbered card, grouped into colour-coded categories, with an
optional companion **handouts page** for PDF downloads. No inline CSS — just classes:

````markdown
## My course

[PDF](handouts.qmd){.pdf-gate}          <!-- top-right gate → handouts page -->

:::: {.lectures}

### Getting started {.sec .cat1}
::: {.grid .cat1}
- [Lecture one](lecture-one.qmd)
- [Lecture two](lecture-two.qmd)
:::

### Going deeper {.sec .cat2}
::: {.grid .cat2}
- [Lecture three](lecture-three.qmd)
:::

### Appendix {.sec}
::: {.grid .app}
- [Extra material](extra.qmd)
:::

::::
````

- **Auto-numbered** — `01, 02, …` via a CSS counter (continuous across categories,
  survives reordering — don't put numbers in the link text).
- **Per-category colour** — `.cat1`–`.cat5` (blue / green / amber / purple / pink);
  put the same `.catN` on both the `### {.sec}` header and its `::: {.grid}`.
- **`.app`** — an un-numbered (`◦`) group for appendix / reference items.
- **Handouts page** — a sibling `handouts.qmd` with the same grid but
  `::: {.grid .catN .dl}` linking PDFs; `.dl` adds a PDF doc icon, and the
  `.pdf-gate` link on the index points to it. (Generate the PDFs with
  [`tools/qmd2pdf`](tools/).)
- Add a `<div id="lecture-search">…</div>` for the in-deck search box on the index.

## Defaults you may want to override

- **`lang: ja`** is set by default (these decks are Japanese). Override per
  document with `lang: en` in your front matter.
- Geometry is `1280×720`, `margin: 0.06`, `scrollable: true`, `menu: false`.

## Optional add-ons (not bundled)

These are *separate* Quarto extensions, deliberately left out so the format
renders out of the box. Add them yourself if you want their features, then list
them under `filters:` in your own `_quarto.yml` / front matter.

```bash
quarto add quarto-ext/lightbox        # image lightbox; then: lightbox: auto
quarto add data-intuitive/d2          # d2 diagrams (also needs the `d2` binary)
```

## MathJax (math rendering)

Math works out of the box: Quarto's revealjs supplies **MathJax v2.7.9** from a
CDN, so nothing is bundled here. If you need a fully **offline** deck, vendor
MathJax yourself and point at it in your document:

```yaml
format:
  cleanslidekit-revealjs:
    html-math-method:
      method: mathjax
      url: "./libs/mathjax/MathJax.js"
```

(Note: Quarto's reveal math plugin hardcodes the `TeX-AMS_HTML-full` config and
ignores `?config=` query overrides — vendor the matching v2.7.9 build.)

## License

MIT — see [LICENSE](LICENSE).
