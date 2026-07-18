# Radio Waves & Electromagnetic Fields

A [SceneryStack](https://scenerystack.org/) port of the PhET *Radio Waves & Electromagnetic Fields*
simulation. Wiggle the electron in the transmitting antenna and watch the radiated electric field propagate
outward and drive the electron in the distant receiving antenna.

## Features

- Manual drag or sinusoidal oscillation of the transmitting electron
- Field display modes: curve with vectors, curve, full field grid, or none
- Toggle between force-on-electron and electric-field sense
- Radiated (dynamic) or static field visualization
- Oscilloscope plots of transmitter and receiver electron motion
- Play / pause / step, projector mode, English and French UI, and PWA support

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run clean` | Remove `dist/` |

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^1 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenPhysics org license](https://github.com/OpenPhysics/.github/blob/main/LICENSE). The original simulation is Copyright © Rice University, distributed under the GNU AGPL; this is an
independent reimplementation.

## Contributing

See [OpenPhysics contributing guidelines](https://github.com/OpenPhysics/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
