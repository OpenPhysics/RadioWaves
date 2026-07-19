/**
 * RadioWavesConstants.ts
 *
 * Tunable model constants, ported from the original sim's `constants.js` so the physics and
 * geometry behave identically. Lengths are in the original's arbitrary model units; the
 * model-view transform scales them to view pixels. (Electron-internal field tuning — the
 * B / static-field / history-length fudge factors — lives in Electron.ts, mirroring the source.)
 */

import { Bounds2, Range, Vector2 } from "scenerystack/dot";

const RadioWavesConstants = {
  // ── Wave propagation ──────────────────────────────────────────────────────
  // Field disturbances travel one history index per model unit; "c" sets how many history
  // indices shift per recorded frame (STEP_SIZE = floor(SPEED_OF_LIGHT)).
  SPEED_OF_LIGHT: 6,

  // ── Fixed-timestep loop ───────────────────────────────────────────────────
  // The original advanced the model in fixed 0.375 s slices, one slice every 0.030 s of
  // wall-clock time (a higher-framerate re-tuning of PhET's original 40 ms / 0.5 s).
  FRAME_DURATION: 0.03, // wall-clock seconds per fixed slice
  DT_PER_FRAME: 0.375, // model seconds advanced per slice
  MAX_CATCHUP_STEPS: 5, // cap slices per frame so a stutter can't spiral

  // ── World geometry ────────────────────────────────────────────────────────
  SIMULATION_BOUNDS: new Bounds2(0, 0, 1000, 700),
  SIMULATION_ORIGIN: new Vector2(108, 345),
  RECEIVING_X_OFFSET: 625, // receiving antenna sits this far to the right of the origin

  // ── Oscillator controls ───────────────────────────────────────────────────
  FREQUENCY_RANGE: new Range(0, 200),
  FREQUENCY_DEFAULT: 100,
  FREQUENCY_SCALE: 1 / 5000, // slider value → strategy frequency
  AMPLITUDE_RANGE: new Range(0, 100),
  AMPLITUDE_DEFAULT: 50,

  // ── Antenna geometry (offsets from the origin, model units) ─────────────────
  TRANSMITTING_ANTENNA_TOP_OFFSET: 100, // how far the rod rises above the origin
  TRANSMITTING_ANTENNA_BOTTOM_OFFSET: 250, // how far it drops below the origin
  RECEIVING_ANTENNA_TOP_OFFSET: 50, // rod extent above the electron rest height
  RECEIVING_ANTENNA_BOTTOM_OFFSET: 75, // rod extent below the electron rest height
  RECEIVING_ELECTRON_X_OFFSET: 680, // receiving electron's initial x, right of the origin

  // ── Field model tuning (from electron.js) ──────────────────────────────────
  RETARDED_FIELD_LENGTH: 2000, // length of the position/acceleration history buffers
  FIELD_SCALE_B: 1000, // fudge factor scaling field strength from acceleration
  STATIC_FIELD_SCALE: 50, // additional scaling for the static (1/r²) field

  // ── Movement-strategy tuning ────────────────────────────────────────────────
  MANUAL_HISTORY_LENGTH: 10, // samples kept to estimate dragged velocity/acceleration
  MANUAL_MEDIAN_WINDOW: 3, // median-filter window for the velocity history
  MANUAL_MAX_ACCELERATION: 0.1, // assumed peak acceleration while dragging

  // ── EMF-sensing receiver fudge factors (from emf-sensing.js) ────────────────
  EMF_SINUSOIDAL_SCALE: 0.4, // receiver displacement ÷ source's retarded displacement
} as const;

export default RadioWavesConstants;

/** Corner radius shared by themed panels (px). */
export const PANEL_CORNER_RADIUS = 5;
