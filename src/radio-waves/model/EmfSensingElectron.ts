/**
 * EmfSensingElectron.ts
 *
 * The receiving electron. Each fixed step it is first pinned back to its (constrained) rest
 * position with zero vertical velocity — exactly what the original achieved by inheriting a
 * held manual MovementStrategy — and then nudged by the field radiated from the source electron:
 *
 *   - field hasn't arrived yet  → stays at rest
 *   - otherwise                 → mirrors the source's retarded position (scaled by 0.4)
 *
 * Ported from `models/electron/emf-sensing.js`. The 0.4 / ÷30 fudge factors are verbatim.
 */

import { Vector2, Vector2Property } from "scenerystack/dot";
import Constants from "../../RadioWavesConstants.js";
import type Antenna from "./Antenna.js";
import type Electron from "./Electron.js";

export default class EmfSensingElectron {
  public readonly positionProperty: Vector2Property;
  public readonly startPosition: Vector2;

  private readonly positionConstraint: Antenna;
  private readonly sourceElectron: Electron;

  private readonly location = new Vector2(0, 0); // reused field-sampling point

  public constructor(position: Vector2, positionConstraint: Antenna, sourceElectron: Electron) {
    this.startPosition = position.copy();
    this.positionConstraint = positionConstraint;
    this.sourceElectron = sourceElectron;
    this.location.set(position);

    const initial = position.copy();
    positionConstraint.constrainPosition(initial);
    this.positionProperty = new Vector2Property(initial);
  }

  public get position(): Vector2 {
    return this.positionProperty.value;
  }

  public setPosition(value: Vector2): void {
    const constrained = value.copy();
    this.positionConstraint.constrainPosition(constrained);
    this.positionProperty.value = constrained;
  }

  public update(_dt: number): void {
    // Pin to the constrained rest position each frame; the EMF response below displaces from here.
    this.setPosition(this.startPosition);

    const pos = this.position;
    const location = this.location;
    const source = this.sourceElectron;

    if (source.isFieldOff(pos.x)) {
      // Field hasn't reached this antenna yet: stay at rest.
      return;
    }

    // Mirror the source's retarded displacement, scaled down (works for both oscillate and manual).
    const dy = (source.getPositionAt(location) - this.startPosition.y) * Constants.EMF_SINUSOIDAL_SCALE;
    location.setXY(location.x, this.startPosition.y + dy);

    this.setPosition(location);
  }

  public reset(): void {
    this.location.set(this.startPosition);
    this.setPosition(this.startPosition);
  }
}
