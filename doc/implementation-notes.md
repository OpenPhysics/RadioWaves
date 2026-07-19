# Implementation Notes - Radio Waves

Developer-facing notes on the architecture. The physics itself is documented for educators in
[model.md](./model.md).

## Architecture Overview

Radio Waves is a single-screen SceneryStack simulation, a port of PhET's *Radio Waves &
Electromagnetic Fields* (rebuilt from the legacy PIXI.js + Backbone HTML5 sim).

```
src/
  main.ts, brand.ts, splash.ts, assert.ts, init.ts
  RadioWavesColors.ts, RadioWavesNamespace.ts
  i18n/StringManager.ts, strings_*.json
  preferences/
  radio-waves/
    RadioWavesScreen.ts
    model/
      RadioWavesModel.ts              TModel: two electrons, step loop, display Properties
      Electron.ts                     transmitting source + retarded field history
      EmfSensingElectron.ts           receiver driven by retarded source state
      Antenna.ts                      segment constraint for electron motion
      MovementStrategy.ts             Manual vs Sinusoidal drive
      RadioWavesConstants.ts
    view/
      RadioWavesScreenView.ts         layout, play/step, mvt
      FieldLatticeNode.ts             curve / curve+vectors / full grid / none
      AntennaNode.ts, ElectronNode.ts
      ElectronPositionPlotNode.ts     oscilloscope traces
      FieldControlPanel.ts, TransmitterMovementPanel.ts
      BackgroundSceneNode.ts, LegendNode.ts
      RadioWavesScreenSummaryContent.ts, RadioWavesKeyboardHelpContent.ts
```

Data flows Model → View through AXON `Property` objects; `RadioWavesModel.steppedEmitter` gives
views a fixed cadence decoupled from variable frame dt.

## Key design decisions

- **Hollywood physics — preserve tuning.** `Electron.getDynamicFieldAt`, history shift rate
  (`STEP_SIZE = floor(SPEED_OF_LIGHT)`), `FIELD_SCALE_B`, static scaling, and the receiver's
  `EMF_SINUSOIDAL_SCALE` (0.4) are verbatim port constants. Changing them breaks visual parity
  with the original; they are not SI-derived.
- **Retarded history buffers.** `Electron` maintains `positionHistory`, `accelerationHistory`, and
  `movementStrategyHistory` arrays of length `RETARDED_FIELD_LENGTH` (2000). Each fixed slice
  shifts indices by `STEP_SIZE` model units ≈ one propagation step per frame.
- **Fixed timestep accumulator.** Wall-clock `FRAME_DURATION` = 0.03 s per slice; each slice
  advances `DT_PER_FRAME` = 0.375 model-seconds. `MAX_CATCHUP_STEPS` = 5. Step button calls
  `advanceOneFrame()` / `stepOnce()` regardless of play state.
- **Two electrons, two roles.** Transmitter: `Electron` + optional `Antenna` constraint +
  `MovementStrategy`. Receiver: `EmfSensingElectron` pinned to rest each step, then displaced by
  retarded source position if `isFieldOff(x)` is false.
- **Field query API.** Views and receiver call `getStaticFieldAt`, `getDynamicFieldAt`,
  `getAccelerationAt`, `getPositionAt` — all indexed by distance from the source origin
  (`startPosition`), not always the instantaneous electron position (original quirk).
- **Decorative canvas carve-out.** `BackgroundSceneNode` paints sky/sun via Canvas 2D gradients
  with raw hex/rgba strings — not `ProfileColorProperty`s (procedural backdrop).
- **Nested constants.** `src/radio-waves/model/RadioWavesConstants.ts`.

## View components

- **RadioWavesScreenView** — `ModelViewTransform2.createSinglePointScaleMapping` from
  `SIMULATION_ORIGIN`; play/pause/step; control column.
- **FieldLatticeNode** — samples `RadioWavesModel` field API per `fieldDisplayTypeProperty`,
  `fieldDisplayedProperty` (radiated/static), `fieldSenseProperty` (force vs E-field).
- **ElectronPositionPlotNode** — rolling position history for both electrons.
- **TransmitterMovementPanel** — manual vs oscillate, frequency, amplitude sliders.
- **FieldControlPanel** — display mode toggles.
- **BackgroundSceneNode**, **LegendNode** — scene art and key.

## Disposal conventions

Single-screen, screen-lifetime nodes. No dynamic particle array. Fleet memory-leak suite covers
the standard dispose regression pattern.

## Testing

`npm test` (vitest):

- `tests/radio-waves/model/SinusoidalMovementStrategy.test.ts` — quarter-period offset, reset,
  full-period return
- `tests/memory-leak.test.ts` — WeakRef/GC regression suite

CI gate: `npm run lint && npm run check && npm run build`.

## Multi-screen simulations

Single-screen. See fleet `doc/multi-screen.md` if extended.
