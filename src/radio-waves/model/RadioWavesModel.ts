/**
 * RadioWavesModel.ts
 *
 * The simulation model. Fuses the original `RadioWavesSimulation` (two antennas, two electrons,
 * two movement strategies) with the control state that used to live in `sim.js` (movement mode,
 * frequency/amplitude, and the three field-display options) into one class backed by axon
 * Properties.
 *
 * The original advanced on a fixed-interval clock; that is reproduced here with a time
 * accumulator that runs whole DT_PER_FRAME slices, matching the recorded-history cadence the
 * field math depends on.
 */

import { BooleanProperty, Emitter, NumberProperty, Property } from "scenerystack/axon";
import { type Bounds2, Vector2 } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { TimeModel } from "../../common/TimeModel.js";
import type { RadioWavesPreferencesModel } from "../../preferences/RadioWavesPreferencesModel.js";
import radioWavesQueryParameters from "../../preferences/radioWavesQueryParameters.js";
import Constants from "../../RadioWavesConstants.js";
import Antenna from "./Antenna.js";
import Electron from "./Electron.js";
import EmfSensingElectron from "./EmfSensingElectron.js";
import { ManualMovementStrategy, type MovementMode, SinusoidalMovementStrategy } from "./MovementStrategy.js";

export type FieldDisplayType = "curveWithVectors" | "curve" | "fullField" | "none";
export type FieldSense = "forceOnElectron" | "electricField";
export type FieldDisplayed = "radiated" | "static";

export class RadioWavesModel implements TModel {
  public readonly transmittingAntenna: Antenna;
  public readonly receivingAntenna: Antenna;
  public readonly transmittingElectron: Electron;
  public readonly receivingElectron: EmfSensingElectron;

  private readonly manualStrategy: ManualMovementStrategy;
  private readonly sinusoidalStrategy: SinusoidalMovementStrategy;

  // ── Control state ─────────────────────────────────────────────────────────
  public readonly movementModeProperty = new Property<MovementMode>("manual");
  public readonly frequencyProperty = new NumberProperty(Constants.FREQUENCY_DEFAULT);
  public readonly amplitudeProperty = new NumberProperty(Constants.AMPLITUDE_DEFAULT);
  public readonly fieldDisplayTypeProperty = new Property<FieldDisplayType>("curveWithVectors");
  public readonly fieldSenseProperty = new Property<FieldSense>("forceOnElectron");
  public readonly fieldDisplayedProperty = new Property<FieldDisplayed>("radiated");
  public readonly showPositionPlotsProperty = new BooleanProperty(radioWavesQueryParameters.showPositionPlots);
  /** Play/pause clock — starts playing (continuous animation). */
  public readonly timer = new TimeModel(true);

  // Fires once per fixed physics slice, so views can sample at the constant model cadence.
  public readonly steppedEmitter = new Emitter();

  // ── World geometry ────────────────────────────────────────────────────────
  public readonly origin = Constants.SIMULATION_ORIGIN;
  public readonly bounds: Bounds2 = Constants.SIMULATION_BOUNDS;

  private timeAccumulator = 0;

  private readonly preferences: RadioWavesPreferencesModel;

  public constructor(preferences: RadioWavesPreferencesModel) {
    this.preferences = preferences;
    this.showPositionPlotsProperty.value = preferences.showPositionPlotsProperty.value;
    const origin = Constants.SIMULATION_ORIGIN;

    this.transmittingAntenna = new Antenna(
      new Vector2(origin.x, origin.y - Constants.TRANSMITTING_ANTENNA_TOP_OFFSET),
      new Vector2(origin.x, origin.y + Constants.TRANSMITTING_ANTENNA_BOTTOM_OFFSET),
    );
    this.transmittingElectron = new Electron(new Vector2(origin.x, origin.y), this.transmittingAntenna);

    const startY = this.transmittingElectron.startPosition.y;
    const receivingX = origin.x + Constants.RECEIVING_X_OFFSET;
    this.receivingAntenna = new Antenna(
      new Vector2(receivingX, startY - Constants.RECEIVING_ANTENNA_TOP_OFFSET),
      new Vector2(receivingX, startY + Constants.RECEIVING_ANTENNA_BOTTOM_OFFSET),
    );
    this.receivingElectron = new EmfSensingElectron(
      new Vector2(origin.x + Constants.RECEIVING_ELECTRON_X_OFFSET, startY),
      this.receivingAntenna,
      this.transmittingElectron,
    );

    this.manualStrategy = new ManualMovementStrategy(this.transmittingElectron);
    this.sinusoidalStrategy = new SinusoidalMovementStrategy(
      this.transmittingElectron,
      Constants.FREQUENCY_DEFAULT * Constants.FREQUENCY_SCALE,
      Constants.AMPLITUDE_DEFAULT,
    );

    this.movementModeProperty.link((mode) => {
      this.transmittingElectron.setMovementStrategy(
        mode === "oscillate" ? this.sinusoidalStrategy : this.manualStrategy,
      );
    });
    this.frequencyProperty.link((frequency) => {
      this.transmittingElectron.setFrequency(frequency * Constants.FREQUENCY_SCALE);
    });
    this.amplitudeProperty.link((amplitude) => {
      this.transmittingElectron.setAmplitude(amplitude);
    });
  }

  public step(dt: number): void {
    this.timer.step(dt);
    if (!this.timer.isPlayingProperty.value) {
      return;
    }
    const frame = Constants.FRAME_DURATION;
    this.timeAccumulator = Math.min(this.timeAccumulator + dt, frame * Constants.MAX_CATCHUP_STEPS);
    while (this.timeAccumulator >= frame) {
      this.timeAccumulator -= frame;
      this.advanceOneFrame();
    }
  }

  /** Advance exactly one fixed physics slice (used by the Step button), regardless of play state. */
  public stepOnce(): void {
    this.advanceOneFrame();
  }

  private advanceOneFrame(): void {
    this.transmittingElectron.update(Constants.DT_PER_FRAME);
    this.receivingElectron.update(Constants.DT_PER_FRAME);
    this.steppedEmitter.emit();
  }

  // ── Field sampling (delegated to the transmitting electron) ─────────────────
  public getStaticFieldAt(location: Vector2): Vector2 {
    return this.transmittingElectron.getStaticFieldAt(location);
  }

  public getDynamicFieldAt(location: Vector2): Vector2 {
    return this.transmittingElectron.getDynamicFieldAt(location);
  }

  public reset(): void {
    this.timer.reset();
    this.movementModeProperty.reset();
    this.frequencyProperty.reset();
    this.amplitudeProperty.reset();
    this.fieldDisplayTypeProperty.reset();
    this.fieldSenseProperty.reset();
    this.fieldDisplayedProperty.reset();
    this.showPositionPlotsProperty.reset();
    this.showPositionPlotsProperty.value = this.preferences.showPositionPlotsProperty.value;

    this.manualStrategy.reset(this.transmittingElectron.startPosition);
    this.sinusoidalStrategy.reset(Constants.FREQUENCY_DEFAULT * Constants.FREQUENCY_SCALE, Constants.AMPLITUDE_DEFAULT);
    this.transmittingElectron.reset();
    this.receivingElectron.reset();
    this.timeAccumulator = 0;
  }
}
