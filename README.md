# Website Portfolio

Three brand websites, each in a different layout style, plus a portfolio hub that shows them side by side.

| Site | Style | Folder |
| --- | --- | --- |
| Clearline Commercial Cleaning | Clean corporate | `clearline/` |
| BoxBolt Logistics | Rugged industrial | `boxbolt/` |
| Concrete Culture | Dark brutalist | `concrete-culture/` |

`index.html` is the portfolio hub. Logos live in `assets/logos/`.

Everything is plain HTML, CSS, and JavaScript, with no build step or dependencies. Fonts load from Google Fonts.

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works, but the hub's live previews need a server in some browsers.

## Publish for free

The site can run on any static host. On GitHub Pages: go to **Settings → Pages**, choose **Deploy from a branch**, and select `main` with the `/ (root)` folder. GitHub Pages is free for public repositories.

## What each site includes

- **Clearline:** a hero you wipe clean by dragging, tabs for each type of space, a monthly cost estimator, and a walkthrough form with validation.
- **BoxBolt:** a truck that drives into the hero on load, a service rate table, a dimensioned truck drawing, an instant rate ticket, a load-tracking demo, and coverage rings.
- **Concrete Culture:** a drop countdown, a product grid with sizes and sold-out stamps, a working bag drawer, a sideways-scrolling lookbook, an events list, and a text-list signup.

All brands are fictional. Forms and checkout are demos and send nothing.
