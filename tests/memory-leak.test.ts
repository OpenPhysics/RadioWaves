/**
 * Fleet-standard memory-leak regression suite.
 * SinusoidalMovementStrategy + Electron are the pure model units under test.
 */

import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import Electron from "../src/radio-waves/model/Electron.js";
import { SinusoidalMovementStrategy } from "../src/radio-waves/model/MovementStrategy.js";

/**
 * Force garbage collection with multiple passes. When `earlyExitRefs` is supplied
 * the loop bails as soon as every referenced object is confirmed collected. The
 * setTimeout(0) yield after a live deref() avoids the WeakRef macrotask-liveness pin.
 * Without early-exit refs the loop always runs all passes, which on a slow `gc()`
 * can exceed the Vitest testTimeout — always pass refs when you have them.
 */
async function forceGC(earlyExitRefs?: WeakRef<object> | readonly WeakRef<object>[]): Promise<void> {
  const refs = earlyExitRefs === undefined ? [] : Array.isArray(earlyExitRefs) ? earlyExitRefs : [earlyExitRefs];
  for (let i = 0; i < 15; i++) {
    globalThis.gc?.();
    await new Promise<void>((r) => setTimeout(r, 50));
    if (refs.length > 0 && refs.every((ref) => ref.deref() === undefined)) {
      return;
    }
    if (refs.length > 0) {
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
    await forceGC(refs);
    expect(refs.filter((r) => r.deref() !== undefined).length).toBe(0);
  });
});
