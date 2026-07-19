# CLAUDE.md — Radio Waves

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the PhET *Radio Waves & Electromagnetic Fields* simulation (rebuilt from legacy PIXI.js + Backbone). Single screen: a transmitting antenna whose electron you wiggle (by hand or sinusoidally), a receiving antenna whose electron responds, several field-visualization modes, and oscilloscope-style electron position plots.

## Key files

| Area | Location |
|---|---|
| Screen | `src/radio-waves/RadioWavesScreen.ts` |
| Model | `model/RadioWavesModel.ts` (state + step), `Antenna.ts`, `Electron.ts` (retarded-field source), `EmfSensingElectron.ts` (receiver), `MovementStrategy.ts`, `RadioWavesConstants.ts` |
| View | `view/RadioWavesScreenView.ts`, `FieldLatticeNode.ts` (arrow/curve field), `AntennaNode.ts`, `ElectronNode.ts`, `ElectronPositionPlotNode.ts`, `BackgroundSceneNode.ts`, `FieldControlPanel.ts`, `TransmitterMovementPanel.ts`, `LegendNode.ts` |
| Colors / strings | `RadioWavesColors.ts`, `RadioWavesNamespace.ts`, `src/i18n/StringManager.ts` |

## Model

`RadioWavesModel` holds a transmitting electron (driven) and a receiving electron (sensing). Behavior is selected by four small string-union enums.

| Property | Type | Values / meaning |
|---|---|---|
| `movementModeProperty` | `Property<MovementMode>` | `manual` \| `oscillate` — how the transmitter electron is driven |
| `frequencyProperty` / `amplitudeProperty` | `NumberProperty` | sinusoidal drive parameters |
| `fieldDisplayTypeProperty` | `Property<FieldDisplayType>` | `curveWithVectors` \| `curve` \| `fullField` \| `none` |
| `fieldSenseProperty` | `Property<FieldSense>` | `forceOnElectron` \| `electricField` (arrow direction convention) |
| `fieldDisplayedProperty` | `Property<FieldDisplayed>` | `radiated` \| `static` |
| `showPositionPlotsProperty` | `BooleanProperty` | oscilloscope electron plots |
| `isPlayingProperty` | `BooleanProperty` | play/pause |

### Stepping & field model

- **Fixed timestep accumulator.** `step(dt)` runs whole `FRAME_DURATION` slices (each `DT_PER_FRAME`, capped by `MAX_CATCHUP_STEPS`); `advanceOneFrame()` updates the transmitting + receiving electrons and emits `steppedEmitter`. The Step button is `stepOnce()`.
- **Retarded field.** `Electron` keeps a rolling history of its position and acceleration. `getStaticFieldAt` returns a Coulomb-like near field; `getDynamicFieldAt` returns the **radiated** field at a point from the source's *retarded* transverse acceleration — indexed by distance (propagation at `Constants.SPEED_OF_LIGHT`) and reduced with distance.
- **This is "Hollywood physics," ported faithfully.** Off-axis falloff and assorted fudge factors are pedagogical, not a literal Liénard–Wiechert solution. When touching `Electron.ts`, preserve the tuned constants — they are calibrated for the look of the original, not derived.

## Conventions & deliberate carve-outs

- **Decorative canvas colors are a carve-out.** `BackgroundSceneNode` paints the sky/sun directly via Canvas 2D `createRadialGradient`, which needs CSS color **strings**, so it uses raw hex/`rgba()` literals rather than `RadioWavesColors` `ProfileColorProperty`s. This decorative backdrop is intentionally not part of the themeable color profile (consistent with the screen-icon palette carve-out).
- **Constants are nested, not at `src/` root (CONVENTIONS.md §2).** All named constants live in `src/radio-waves/model/RadioWavesConstants.ts`, next to the model that consumes them; there is deliberately no root `RadioWavesConstants.ts`.

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`RadioWavesScreenView` registers `RadioWavesScreenSummaryContent` (live current-details:
transmitter frequency + amplitude) via the `screenSummaryContent` super-option, and orders the
PDOM through a wrapper `Node`. A11y strings live under the top-level `a11y` key in each locale
JSON, via `StringManager.getA11yStrings()`.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | Test environment + `setupFiles` when present; `execArgv: ["--expose-gc"]` with memory-leak suite |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports (when required) |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

- Put unit tests only under root `tests/` (never co-locate or use `__tests__/`).
- Run `npm test`. CI runs the suite when a `test` script is present.
- Expand `memory-leak.test.ts` for components that add/remove nodes or link Properties at runtime (see OpticsLab).

## Commands

```bash
npm run lint && npm run check && npm run build
```

No unit-test suite — the build/lint/check gate plus manual run substitute for tests here.

## Development notes

- English, Spanish, and French UI via `StringManager`.
- Field display modes (curve with vectors / curve / full field grid / none), radiated-vs-static, and force-on-electron-vs-E-field are the core visualization toggles.
