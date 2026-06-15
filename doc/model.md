# Model - Radio Waves

This document describes the model (the underlying physics, math, and behavior) for the simulation, in
terms appropriate for an educator. It is the companion to
[implementation-notes.md](./implementation-notes.md), which targets developers.

## Overview

The simulation shows how **accelerating electric charges radiate electromagnetic waves**. An electron in
a transmitting antenna is driven up and down; the changing electric field propagates outward at the
speed of light and, on reaching a receiving antenna, drives the electron there. Students see the field
between the antennas, the motion of both electrons, and an oscilloscope-style trace, connecting charge
acceleration, radiated fields, and reception.

## Quantities and units

The model uses scaled simulation units (a 1000×700 world) chosen for clear visualization.

| Quantity | Symbol | Notes |
|---|---|---|
| Transmitter electron position | y_T(t) | Driven up/down (manual, sinusoidal, or pulse) |
| Field strength | E | Sampled on a lattice between the antennas |
| Wave speed | c | Speed of field propagation (constant) |
| Receiver electron position | y_R(t) | Responds to the field arriving from the transmitter |
| Frequency / amplitude | f, A | Of the driving oscillation, when in sinusoidal mode |

## Governing equations

The field radiated by the transmitting electron depends on its **acceleration**, not merely its position
or velocity — this is the key idea of radiation. The disturbance produced at time `t` travels outward at
speed `c` and reaches a point a distance `d` away after a **retarded time** delay:

```
t_arrival = t + d / c
```

so the receiver electron at any instant responds to what the transmitter did a propagation time earlier.
The field is sampled across a lattice to display wavefronts, and the receiver electron is pushed by the
arriving field, reproducing the transmitted oscillation with a delay and reduced amplitude.

## Simplifications and assumptions

- A pedagogical near-/radiation-field model: the visualization emphasizes that acceleration produces the
  radiated field and that effects propagate at finite speed, rather than solving Maxwell's equations
  exactly.
- Scaled units; magnitudes are not calibrated SI values.
- Two-dimensional scene with idealized point electrons and straight wire antennas.
- No energy loss in the medium beyond the geometric weakening shown.

## References

- Radiation from accelerating charges, intermediate E&M texts (e.g. Griffiths, *Introduction to
  Electrodynamics*, Ch. 11).
- Based on the PhET *Radio Waves & Electromagnetic Fields* simulation.
</content>
