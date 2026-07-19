# Model - Radio Waves

This document describes the model (the underlying physics, math, and behavior) for the simulation,
in terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation shows how **accelerating electric charges produce propagating electromagnetic
disturbances**. A student wiggles the electron in a **transmitting antenna** (by hand or with a
sinusoidal drive). The changing motion creates a **radiated field** that travels outward at a
finite speed and, after a delay, drives the electron in a distant **receiving antenna**. Optional
field displays, oscilloscope traces, and static-vs-radiated toggles connect charge motion, field
propagation, and reception.

The pedagogical emphasis is qualitative: **radiation comes from acceleration**, not from constant
velocity or mere presence of charge, and effects arrive at distant points only after a **retarded
time** — not instantaneously.

Key ideas a student should take away:

- Shaking the transmitter electron sends a disturbance that propagates outward; the receiver
  responds only after the wave has had time to travel the separation distance.
- The **radiated** field depends on the source's **transverse acceleration** at the retarded
  time; the **static** (near) field follows a Coulomb-like 1/r² falloff from the charge's
  instantaneous position.
- Constant-speed motion of the charge produces little radiated field compared with oscillation
  or abrupt acceleration.

## Quantities and units

The model uses **scaled simulation units** (world roughly 1000 × 700) chosen for clear
visualization, not calibrated SI magnitudes.

| Quantity | Symbol | Notes |
|---|---|---|
| Transmitter electron position | y_T(t) | Vertical motion along the transmitting antenna |
| Receiver electron position | y_R(t) | Driven by the arriving field at the receiving antenna |
| Field sample | **E** | Vector field on a lattice between the antennas |
| Propagation speed | c | Constant; maps distance to retarded-time index in the history buffers |
| Drive frequency | f | Sinusoidal mode: slider 0–200 (scaled internally) |
| Drive amplitude | A | Sinusoidal mode: slider 0–100 |

## Governing equations

**Retarded response.** A disturbance created at the source at time t arrives at a point a
distance d away after delay d/c. The receiver electron at time t therefore responds to the
source's state at the **retarded** time t − d/c, not the present state.

**Radiated field (pedagogical model).** The dynamic field at a field point is built from the
source electron's **acceleration history**, indexed by distance from the emission point, with
direction perpendicular to the line of sight (matching the "wiggle in the antenna" picture). This
is a tuned visualization of radiation, not a full Maxwell/Liénard–Wiechert solution.

**Static field.** Separately, a 1/r² Coulomb-like field from the charge's current position can be
shown (near-field / "frozen" picture).

**Receiver motion.** Each step the receiving electron is reset to its rest position on the
antenna, then displaced to mirror the source's retarded vertical position (scaled for visibility).
If the field has not yet reached the receiver, it stays at rest.

## Field display modes

Students can visualize:

- **Curve with vectors** or **curve only** — field along a horizontal slice
- **Full field** — arrow grid (most computationally expensive)
- **None**
- **Radiated** vs **static** field contribution
- **Force on electron** vs **electric field** arrow convention

Oscilloscope-style plots show transmitter and receiver electron position versus time.

## Simplifications and assumptions

- **"Hollywood physics"** — off-axis falloff, scaling constants, and history indexing are
  calibrated to match the look and feel of the PhET/HTML5 original, not derived from full
  electrodynamics.
- **2-D schematic** — straight wire antennas, point electrons, no magnetic field display.
- **No medium absorption** beyond geometric weakening in the tuned formulas.
- **Manual drag** uses a separate short history and median filtering for estimated velocity/
  acceleration while dragging; sinusoidal mode applies frequency/amplitude changes at
  phase-appropriate moments to avoid glitches.

## References

- Radiation from accelerating charges, intermediate E&M texts (e.g. Griffiths, *Introduction to
  Electrodynamics*, Ch. 11).
- PhET / Open Source Physics lineage: *Radio Waves & Electromagnetic Fields* (Rice University,
  GNU AGPL) — HTML5/PIXI original rebuilt here in SceneryStack.
