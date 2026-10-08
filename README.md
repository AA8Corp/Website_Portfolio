# Website Portfolio

Three brand websites, each in a different layout style, plus a portfolio hub that shows them side by side.

| Site | Style | Folder |
| --- | --- | --- |
| Clearline Commercial Cleaning | Clean corporate | `clearline/` |
| BoxBolt Logistics | Rugged industrial | `boxbolt/` |
| Concrete Culture | Dark brutalist | `concrete-culture/` |

`index.html` is the portfolio hub. Logos live in `assets/logos/`.

Everything is plain HTML, CSS, and JavaScript, with no build step or dependencies. Fonts load from Google Fonts.

## Premium builds

`premium/` holds dynamic versions of the same three brands, built with React 19, TypeScript, Three.js (React Three Fiber and Drei), Framer Motion, Zustand, and Vite.

| Site | 3D centerpiece | Pages |
| --- | --- | --- |
| Clearline | Floor plan cleaned room by room, synced to a live checklist | Home, services, quote builder, client portal |
| BoxBolt | Truck on a moving road with a scroll-driven camera; 3D load planner | Home, load planner, tracking |
| Concrete Culture | CC monogram poured from concrete blocks you can break; garments as live cloth | Home, shop, product pages, drop countdown, lookbook |

```sh
cd premium
npm install
npm run dev      # http://localhost:5173/clearline/ (and /boxbolt/, /concrete-culture/)
npm run build    # static output in premium/dist
```

## Run locally

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. Opening `index.html` directly also works, but the hub's live previews need a server in some browsers.

## Publish for free

`.github/workflows/pages.yml` builds the premium sites and publishes everything to GitHub Pages on each push to `main`. To turn it on, go to **Settings → Pages** and set **Source** to **GitHub Actions**. GitHub Pages and Actions are free for public repositories.

## What each site includes

- **Clearline:** a hero you wipe clean by dragging, tabs for each type of space, a monthly cost estimator, and a walkthrough form with validation.
- **BoxBolt:** a truck that drives into the hero on load, a service rate table, a dimensioned truck drawing, an instant rate ticket, a load-tracking demo, and coverage rings.
- **Concrete Culture:** a drop countdown, a product grid with sizes and sold-out stamps, a working bag drawer, a sideways-scrolling lookbook, an events list, and a text-list signup.

All brands are fictional. Forms and checkout are demos and send nothing.
