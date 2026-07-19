/**
 * Fleet-standard memory-leak regression suite.
 * SinusoidalMovementStrategy + Electron are the pure model units under test.
 */

import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import Electron from "../src/radio-waves/model/Electron.js";
import { SinusoidalMovementStrategy } from "../src/radio-waves/model/MovementStrategy.js";

async function forceGC(earlyExitRef?: WeakRef<object>): Promise<void> {
  for (let i = 0; i < 15; i++) {
    globalThis.gc?.();
    await new Promise<void>((r) => setTimeout(r, 50));
    if (earlyExitRef !== undefined && earlyExitRef.deref() === undefined) {
      return;
    }
    if (earlyExitRef !== undefined) {
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }
}

function createAndDropStrategy(): WeakRef<object> {
  const electron = new Electron(new Vector2(0, 0));
  electron.recordingHistory = false;
  const strategy = new SinusoidalMovementStrategy(electron, 1, 50);
  strategy.update(0.25);
  strategy.reset(1, 50);
  return new WeakRef<object>(strategy);
}

describe("Memory leak regression", () => {
  it("global.gc is available (--expose-gc)", () => {
    expect(globalThis.gc).toBeDefined();
  });

  it("sanity: plain object is collected", async () => {
    const ref = (() => new WeakRef({ hello: "world" }))();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("SinusoidalMovementStrategy is collected after drop", async () => {
    const ref = createAndDropStrategy();
    await forceGC(ref);
    expect(ref.deref()).toBeUndefined();
  });

  it("repeated create/drop cycles leave no survivors", async () => {
    const refs: WeakRef<object>[] = [];
    for (let i = 0; i < 10; i++) {
      refs.push(createAndDropStrategy());
    }
    await forceGC();
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
  });
});
