# CLAUDE.md — Radio Waves

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenPhysics/.github/CLAUDE.md](https://github.com/OpenPhysics/.github/blob/main/CLAUDE.md).

## Project

SceneryStack port of the PhET *Radio Waves & Electromagnetic Fields* simulation (rebuilt from legacy PIXI.js + Backbone). Single screen: a transmitting antenna whose electron you wiggle (by hand or sinusoidally), a receiving antenna whose electron responds, several field-visualization modes, and oscilloscope-style electron position plots.

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| Area | Location |
|---|---|
| Screen | `src/radio-waves/RadioWavesScreen.ts` |
| Model | `model/RadioWavesModel.ts` (state + step), `Antenna.ts`, `Electron.ts` (retarded-field source), `EmfSensingElectron.ts` (receiver), `MovementStrategy.ts`, `RadioWavesConstants.ts` |
| View | `view/RadioWavesScreenView.ts`, `FieldLatticeNode.ts` (arrow/curve field), `AntennaNode.ts`, `ElectronNode.ts`, `ElectronPositionPlotNode.ts`, `BackgroundSceneNode.ts`, `FieldControlPanel.ts`, `TransmitterMovementPanel.ts`, `LegendNode.ts`, `RadioWavesScreenSummaryContent.ts` |
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

## Accessibility

Follows the shared [OpenPhysics accessibility convention](https://github.com/OpenPhysics/Baton/blob/main/ACCESSIBILITY.md).
`RadioWavesScreenView` registers `RadioWavesScreenSummaryContent` (live current-details:
transmitter frequency + amplitude) via the `screenSummaryContent` super-option, and orders the
PDOM through a wrapper `Node`. A11y strings live under the top-level `a11y` key in each locale
JSON, via `StringManager.getA11yStrings()`.

## Compliance carve-outs

- **Nested constants:** screen-scoped constants under `src/RadioWavesConstants.ts`.
- **Hardcoded colors:** canvas gradient stops in `BackgroundSceneNode.ts` (sun/sky art) — procedural scene painting via Canvas 2D `createRadialGradient`, not `ProfileColorProperty` UI chrome.

## Testing

Fleet-standard Vitest layout:

| Path | Purpose |
|---|---|
| `vitest.config.ts` | `happy-dom` environment, `setupFiles`, `execArgv: ["--expose-gc"]` |
| `tests/setup.ts` | Canvas / AudioContext mocks + `init({ name: "…" })` before SceneryStack imports |
| `tests/**/*.test.ts` | Model/physics unit tests — mirror `src/` under `tests/` |
| `tests/memory-leak.test.ts` | WeakRef + `forceGC` dispose regression (fleet pattern) |

Actual specs:

- `tests/radio-waves/model/SinusoidalMovementStrategy.test.ts`
- `tests/memory-leak.test.ts`

Run `npm test`. CI runs the suite when a `test` script is present.

## Commands

```bash
npm run lint && npm run check && npm run build
npm test
```

## Development notes

- Field display modes (curve with vectors / curve / full field grid / none), radiated-vs-static, and force-on-electron-vs-E-field are the core visualization toggles.
