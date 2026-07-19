/**
 * Electron.ts
 *
 * The transmitting electron. It is dragged or oscillated (via its MovementStrategy), records a
 * rolling history of its position and acceleration, and answers field queries used by the field
 * visualization and the receiving electron. Optionally constrained to an antenna segment.
 *
 * Ported from `models/electron.js` (+ `position-constrained.js`, folded in as an optional
 * constraint). The retarded-field math, the "Hollywood" off-axis falloff, and all fudge factors
 * are carried over verbatim — comments mark the load-bearing quirks.
 */

import { Vector2, Vector2Property } from "scenerystack/dot";
import Constants from "../../RadioWavesConstants.js";
import type Antenna from "./Antenna.js";
import {
  ManualMovementStrategy,
  type MovementMode,
  type MovementStrategy,
  type SinusoidalMovementStrategy,
} from "./MovementStrategy.js";

// History indices shifted per recorded frame (≈ propagation speed).
const STEP_SIZE = Math.floor(Constants.SPEED_OF_LIGHT);

export default class Electron {
  public readonly positionProperty: Vector2Property;
  public readonly startPosition: Vector2;

  private readonly previousPosition = new Vector2(0, 0);
  private velocity = new Vector2(0, 0);

  private readonly positionConstraint: Antenna | null;
  public recordingHistory = true;

  private movementStrategy: MovementStrategy;

  // History buffers (index ≈ distance from the source, in model units).
  public readonly positionHistory: Vector2[] = [];
  public readonly accelerationHistory: Vector2[] = [];
  public readonly maxAccelerationHistory: Vector2[] = [];
  public readonly movementStrategyHistory: (MovementMode | undefined)[] = [];

  // Pending frequency/amplitude changes, applied at a phase-appropriate moment.
  private changeFreq = false;
  private newFreq = 0;
  private changeAmplitude = false;
  private newAmplitude = 0;

  public constructor(position: Vector2, positionConstraint: Antenna | null = null) {
    this.positionConstraint = positionConstraint;
    this.startPosition = position.copy();
    this.positionProperty = new Vector2Property(position.copy());
    this.movementStrategy = new ManualMovementStrategy(this);

    for (let i = 0; i < Constants.RETARDED_FIELD_LENGTH; i++) {
      this.positionHistory[i] = this.startPosition.copy();
      this.accelerationHistory[i] = new Vector2(0, 0);
      this.maxAccelerationHistory[i] = new Vector2(0, 0);
    }
  }

  public get position(): Vector2 {
    return this.positionProperty.value;
  }

  /** Sets the position, first snapping it onto the antenna if this electron is constrained. */
  public setPosition(value: Vector2): void {
    const constrained = value.copy();
    if (this.positionConstraint) {
      this.positionConstraint.constrainPosition(constrained);
    }
    this.positionProperty.value = constrained;
  }

  public update(dt: number): void {
    this.previousPosition.set(this.position);

    this.movementStrategy.update(dt);
    this.velocity = this.movementStrategy.getVelocity().copy();

    if (this.recordingHistory) {
      this.recordPosition(this.position);
    }

    // Apply pending frequency/amplitude changes only while oscillating.
    if (this.movementStrategy.mode === "oscillate") {
      const ms = this.movementStrategy as SinusoidalMovementStrategy;

      if (this.changeFreq) {
        // Keep the wave in phase across a frequency change.
        if (this.newFreq !== 0) {
          const phi = ms.getRunningTime() * (ms.getFrequency() / this.newFreq - 1);
          ms.setRunningTime(ms.getRunningTime() + phi);
        }
        ms.setFrequency(this.newFreq);
        this.changeFreq = false;
      }

      // Apply an amplitude change only as the electron crosses its rest position.
      if (this.changeAmplitude) {
        const crossedRest =
          (this.previousPosition.y - this.startPosition.y) * (this.position.y - this.startPosition.y) <= 0;
        if (crossedRest) {
          ms.setAmplitude(this.newAmplitude);
          this.changeAmplitude = false;
        }
      }
    }
  }

  private recordPosition(position: Vector2): void {
    for (let i = Constants.RETARDED_FIELD_LENGTH - 1; i > STEP_SIZE - 1; i--) {
      this.positionHistory[i]?.set(this.positionHistory[i - STEP_SIZE] ?? this.startPosition);
      this.accelerationHistory[i]?.set(this.accelerationHistory[i - STEP_SIZE] ?? Vector2.ZERO);
      this.maxAccelerationHistory[i]?.set(this.maxAccelerationHistory[i - STEP_SIZE] ?? Vector2.ZERO);
      this.movementStrategyHistory[i] = this.movementStrategyHistory[i - STEP_SIZE];
    }

    const accel = this.movementStrategy.getAcceleration();
    const maxAccel = this.movementStrategy.getMaxAcceleration();
    const previousFront = this.accelerationHistory[0]?.y ?? 0;
    const df = (previousFront - accel * Constants.FIELD_SCALE_B) / STEP_SIZE;
    for (let i = 0; i < STEP_SIZE; i++) {
      this.positionHistory[i]?.set(position);
      const a = this.accelerationHistory[i];
      if (a) {
        a.y = accel * Constants.FIELD_SCALE_B + i * df;
      }
      const maxA = this.maxAccelerationHistory[i];
      if (maxA) {
        maxA.y = maxAccel * Constants.FIELD_SCALE_B;
      }
      this.movementStrategyHistory[i] = this.movementStrategy.mode;
    }
  }

  /** True if the field is zero everywhere between the source and the given x coordinate. */
  public isFieldOff(x: number): boolean {
    const limit = Math.min(this.accelerationHistory.length, Math.ceil(x));
    for (let i = 0; i < limit; i++) {
      const field = this.accelerationHistory[i];
      if (field && (field.x !== 0 || field.y !== 0)) {
        return false;
      }
    }
    return true;
  }

  public getAccelerationAt(x: number): number {
    const i = Math.min(Math.floor(x), this.accelerationHistory.length - 1);
    return this.accelerationHistory[i]?.y ?? 0;
  }

  /** y position from history, indexed either by integer distance or by a 2-D sample point. */
  public getPositionAt(x: number | Vector2): number {
    if (typeof x !== "number") {
      return this.getPositionAt(Math.floor(x.distance(this.position)));
    }
    const i = Math.min(Math.floor(x), this.positionHistory.length - 1);
    return this.positionHistory[i]?.y ?? this.startPosition.y;
  }

  public getMovementTypeAt(location: Vector2): MovementMode | undefined {
    const x = Math.min(Math.floor(location.distance(this.position)), this.movementStrategyHistory.length - 1);
    return this.movementStrategyHistory[x];
  }

  /** Static (1/r²) electric field at a point. A fresh vector is returned each call. */
  public getStaticFieldAt(location: Vector2): Vector2 {
    const dx = location.x - this.position.x;
    const dy = location.y - this.position.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) {
      return new Vector2(0, 0);
    }
    const distanceSquared = mag * mag;
    const scale = (Constants.FIELD_SCALE_B * Constants.STATIC_FIELD_SCALE) / distanceSquared;
    return new Vector2((dx / mag) * scale, (dy / mag) * scale);
  }

  /**
   * Radiated (dynamic) field at a point, derived from the source's retarded acceleration.
   * "Hollywood here!" — the original computes from the electron's motion origin (startPosition),
   * not its current position, with an off-axis falloff factor (`dubsonFactor`). Carried verbatim.
   */
  public getDynamicFieldAt(location: Vector2): Vector2 {
    const distanceFromSource = location.distance(this.startPosition);
    if (distanceFromSource === 0) {
      throw new Error("Asked for r=0 field.");
    }

    const idx = Math.min(Math.floor(distanceFromSource), this.positionHistory.length - 1);
    const generatingPos = this.positionHistory[idx] ?? this.startPosition;

    // Field direction (perpendicular to the line of sight, flipped across the source).
    let fx = -(location.y - generatingPos.y);
    if (location.x - generatingPos.x < 0) {
      fx = -fx;
    }
    let fy = Math.abs(location.x - generatingPos.x);
    const mag = Math.sqrt(fx * fx + fy * fy);
    if (mag === 0) {
      return new Vector2(0, 0);
    }
    fx /= mag;
    fy /= mag;

    // Magnitude: retarded acceleration, reduced by sqrt of distance.
    const acceleration = this.getAccelerationAt(Math.floor(distanceFromSource));
    const distanceScaleFactor = Math.sqrt(distanceFromSource);
    let scale = acceleration / distanceScaleFactor;

    // Off-axis falloff.
    const dubsonFactor = Math.abs(location.x - this.startPosition.x) / distanceFromSource;
    scale *= dubsonFactor;

    return new Vector2(fx * scale, fy * scale);
  }

  public setFrequency(frequency: number): void {
    if (this.movementStrategy.mode === "oscillate") {
      this.changeFreq = true;
      this.newFreq = frequency;
    }
  }

  public setAmplitude(amplitude: number): void {
    if (this.movementStrategy.mode === "oscillate") {
      this.changeAmplitude = true;
      this.newAmplitude = amplitude;
    }
  }

  /** Drag handler: only honored while in manual mode. */
  public moveToNewPosition(newPosition: Vector2): void {
    if (this.movementStrategy.mode === "manual") {
      (this.movementStrategy as ManualMovementStrategy).setPosition(newPosition);
    }
  }

  public setMovementStrategy(movementStrategy: MovementStrategy): void {
    this.movementStrategy = movementStrategy;
  }

  public reset(): void {
    this.changeFreq = false;
    this.changeAmplitude = false;
    this.recordingHistory = true;
    this.velocity.setXY(0, 0);
    this.previousPosition.set(this.startPosition);
    this.positionProperty.value = this.startPosition.copy();
    for (let i = 0; i < Constants.RETARDED_FIELD_LENGTH; i++) {
      this.positionHistory[i]?.set(this.startPosition);
      this.accelerationHistory[i]?.setXY(0, 0);
      this.maxAccelerationHistory[i]?.setXY(0, 0);
      this.movementStrategyHistory[i] = undefined;
    }
  }
}
