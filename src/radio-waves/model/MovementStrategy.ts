/**
 * MovementStrategy.ts
 *
 * The two ways the transmitting electron can move: dragged by hand (Manual) or driven by a
 * sine wave (Sinusoidal). Each exposes the acceleration the field visualization needs.
 * Ported from `models/movement-strategy/{manual,sinusoidal}.js`. The `mode` discriminator
 * replaces the original's `instanceof` checks.
 */

import { Vector2 } from "scenerystack/dot";
import Constants from "../../RadioWavesConstants.js";
import type Electron from "./Electron.js";

export type MovementMode = "manual" | "oscillate";

export interface MovementStrategy {
  readonly mode: MovementMode;
  update(dt: number): void;
  getVelocity(): Vector2;
  getAcceleration(): number;
  getMaxAcceleration(): number;
}

/**
 * Sliding-window median filter (window 3), matching `filters-shimmed`'s `median`. Returns a
 * new array; out-of-range neighbors are clamped to the array ends.
 */
function median(values: readonly number[], window: number): number[] {
  const half = Math.floor(window / 2);
  return values.map((_value, i) => {
    const slice: number[] = [];
    for (let k = i - half; k <= i + half; k++) {
      const clamped = Math.max(0, Math.min(values.length - 1, k));
      slice.push(values[clamped] ?? 0);
    }
    slice.sort((a, b) => a - b);
    return slice[Math.floor(slice.length / 2)] ?? 0;
  });
}

/**
 * Does nothing automatically; the electron is moved with the mouse. Estimates velocity and
 * acceleration by differencing a short median-filtered position history.
 */
export class ManualMovementStrategy implements MovementStrategy {
  public readonly mode = "manual";

  private readonly electron: Electron;
  private readonly position: Vector2;
  private readonly velocity: Vector2;

  private numHistoryEntries = 0;
  private yPosHistory: number[];
  private yVelHistory: number[];
  private yAccHistory: number[];
  private accelerationAvg = 0;

  public constructor(electron: Electron) {
    this.electron = electron;
    this.position = electron.position.copy();
    this.velocity = new Vector2(0, 0);
    this.yPosHistory = new Array(Constants.MANUAL_HISTORY_LENGTH).fill(0);
    this.yVelHistory = new Array(Constants.MANUAL_HISTORY_LENGTH).fill(0);
    this.yAccHistory = new Array(Constants.MANUAL_HISTORY_LENGTH).fill(0);
  }

  public update(_dt: number): void {
    this.numHistoryEntries = Math.min(this.numHistoryEntries + 1, Constants.MANUAL_HISTORY_LENGTH);
    this.electron.setPosition(this.position);
    for (let i = this.yPosHistory.length - 1; i > 0; i--) {
      this.yPosHistory[i] = this.yPosHistory[i - 1] ?? 0;
    }
    this.yPosHistory[0] = this.electron.position.y;
    this.computeKinetics();
  }

  private computeKinetics(): void {
    let vSum = 0;
    let aSum = 0;

    for (let i = 0; i < this.numHistoryEntries - 1; i++) {
      const v = (this.yPosHistory[i + 1] ?? 0) - (this.yPosHistory[i] ?? 0);
      this.yVelHistory[i] = v;
      vSum += v;
    }
    const velocityAvg = vSum / this.yVelHistory.length;
    // Carried over verbatim: the original stores the average velocity in the x component.
    this.velocity.x = velocityAvg;

    this.yVelHistory = median(this.yVelHistory, Constants.MANUAL_MEDIAN_WINDOW);
    for (let i = 0; i < this.numHistoryEntries - 2; i++) {
      const a = (this.yVelHistory[i + 1] ?? 0) - (this.yVelHistory[i] ?? 0);
      this.yAccHistory[i] = a;
      aSum += a;
    }
    this.accelerationAvg = aSum / this.yAccHistory.length;
  }

  public getVelocity(): Vector2 {
    return this.velocity;
  }

  public getAcceleration(): number {
    return this.accelerationAvg;
  }

  public getMaxAcceleration(): number {
    return Constants.MANUAL_MAX_ACCELERATION;
  }

  public setPosition(position: Vector2): void {
    this.position.set(position);
  }

  public reset(start: Vector2): void {
    this.position.set(start);
    this.velocity.setXY(0, 0);
    this.numHistoryEntries = 0;
    this.yPosHistory = new Array(Constants.MANUAL_HISTORY_LENGTH).fill(0);
    this.yVelHistory = new Array(Constants.MANUAL_HISTORY_LENGTH).fill(0);
    this.yAccHistory = new Array(Constants.MANUAL_HISTORY_LENGTH).fill(0);
    this.accelerationAvg = 0;
  }
}

/** Drives the electron with y(t) = startY + amplitude·sin(2π·f·t). */
export class SinusoidalMovementStrategy implements MovementStrategy {
  public readonly mode = "oscillate";

  private readonly electron: Electron;
  private frequency: number;
  private amplitude: number;
  private omega: number;
  private runningTime = 0;
  private readonly velocity = new Vector2(0, 0);
  private readonly nextPosition = new Vector2(0, 0);

  public constructor(electron: Electron, frequency: number, amplitude: number) {
    this.electron = electron;
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.omega = this.computeOmega();
  }

  public update(dt: number): void {
    this.runningTime += dt;
    this.electron.setPosition(this.getNextPosition(this.electron.startPosition, this.runningTime));
  }

  private computeOmega(): number {
    return this.frequency * Math.PI * 2;
  }

  public getVelocity(): Vector2 {
    this.velocity.y = this.omega * Math.cos(this.omega * this.runningTime);
    return this.velocity;
  }

  public getAcceleration(): number {
    return -this.amplitude * this.omega * this.omega * Math.sin(this.omega * this.runningTime);
  }

  public getMaxAcceleration(): number {
    return -this.amplitude * this.omega * this.omega;
  }

  private getNextPosition(position: Vector2, t: number): Vector2 {
    const newY = this.valueAtTime(this.frequency, this.amplitude, t);
    this.nextPosition.setXY(position.x, position.y + newY);
    return this.nextPosition;
  }

  private valueAtTime(frequency: number, maxAmplitude: number, time: number): number {
    return frequency === 0 ? 0 : Math.sin(frequency * time * Math.PI * 2) * maxAmplitude;
  }

  public getRunningTime(): number {
    return this.runningTime;
  }

  public setRunningTime(runningTime: number): void {
    this.runningTime = runningTime;
  }

  public getFrequency(): number {
    return this.frequency;
  }

  public setFrequency(frequency: number): void {
    this.frequency = frequency;
    this.omega = this.computeOmega();
  }

  public setAmplitude(amplitude: number): void {
    this.amplitude = amplitude;
  }

  public reset(frequency: number, amplitude: number): void {
    this.frequency = frequency;
    this.amplitude = amplitude;
    this.omega = this.computeOmega();
    this.runningTime = 0;
    this.velocity.setXY(0, 0);
  }
}
