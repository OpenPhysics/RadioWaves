/**
 * RadioWavesPanel.ts
 *
 * A pre-themed Panel that automatically uses RadioWavesColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { RadioWavesPanel } from "../../common/RadioWavesPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new RadioWavesPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new RadioWavesPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new RadioWavesPanel(content, { fill: "transparent" });
 */

import type { Node } from "scenerystack/scenery";
import type { PanelOptions } from "scenerystack/sun";
import { Panel } from "scenerystack/sun";
import RadioWavesColors from "../RadioWavesColors.js";
import { PANEL_CORNER_RADIUS } from "../RadioWavesConstants.js";

export class RadioWavesPanel extends Panel {
  public constructor(content: Node, providedOptions?: PanelOptions) {
    super(content, {
      fill: RadioWavesColors.panelBackgroundColorProperty,
      stroke: RadioWavesColors.panelBorderColorProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
      xMargin: 12,
      yMargin: 10,
      ...providedOptions,
    });
  }
}
