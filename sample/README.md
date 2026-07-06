# sample — demo course

A tiny English "Machine Learning 101" course used to demo the kit (the GIFs
in the main README are recorded from it). `_extensions` is a symlink to the
repo's own extension, so the sample always exercises the current code.

```bash
cd sample
quarto render        # -> _site/
python3 -m http.server 8000 --directory _site
```

Open <http://localhost:8000/>. Rendering as a **website project** matters:
it generates the `search.json` that powers the site-wide search.
