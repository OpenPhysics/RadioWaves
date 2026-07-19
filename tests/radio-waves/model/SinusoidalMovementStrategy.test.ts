import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import Electron from "../../../src/radio-waves/model/Electron.js";
import { SinusoidalMovementStrategy } from "../../../src/radio-waves/model/MovementStrategy.js";

describe("SinusoidalMovementStrategy", () => {
  const frequency = 1;
  const amplitude = 50;
  const start = new Vector2(100, 200);

  it("offsets position by amplitude after one quarter period", () => {
    const electron = new Electron(start.copy());
    electron.recordingHistory = false;
    const strategy = new SinusoidalMovementStrategy(electron, frequency, amplitude);

    strategy.update(0);
    expect(electron.position.y).toBeCloseTo(start.y, 6);

    const quarterPeriod = 1 / (4 * frequency);
    strategy.update(quarterPeriod);
    expect(electron.position.y).toBeCloseTo(start.y + amplitude, 4);
  });

  it("reset clears running time and oscillation offset", () => {
    const electron = new Electron(start.copy());
    electron.recordingHistory = false;
    const strategy = new SinusoidalMovementStrategy(electron, frequency, amplitude);

    strategy.update(1);
    expect(strategy.getRunningTime()).toBeGreaterThan(0);

    strategy.reset(frequency, amplitude);
    expect(strategy.getRunningTime()).toBeCloseTo(0, 6);

    strategy.update(0);
    expect(electron.position.y).toBeCloseTo(start.y, 6);
  });

  it("returns to the start y after one full period", () => {
    const electron = new Electron(start.copy());
    electron.recordingHistory = false;
    const strategy = new SinusoidalMovementStrategy(electron, frequency, amplitude);

    strategy.update(0);
    strategy.update(1 / frequency);
    expect(electron.position.y).toBeCloseTo(start.y, 4);
  });
});
