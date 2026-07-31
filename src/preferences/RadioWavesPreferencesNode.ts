/**
 * RadioWavesPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound to
 * RadioWavesPreferencesModel Properties (initial values from query parameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { StringManager } from "../i18n/StringManager.js";
import RadioWavesColors from "../RadioWavesColors.js";
import RadioWavesNamespace from "../RadioWavesNamespace.js";
import type { RadioWavesPreferencesModel } from "./RadioWavesPreferencesModel.js";

export class RadioWavesPreferencesNode extends VBox {
  public constructor(preferencesModel: RadioWavesPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    // Preferences dialog is always white — use control-surface colors, not textColorProperty.
    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
      fill: RadioWavesColors.controlSurfaceTextColorProperty,
    });

    const showPositionPlotsCheckbox = new Checkbox(
      preferencesModel.showPositionPlotsProperty,
      new Text(prefStrings.showPositionPlotsStringProperty, {
        font: new PhetFont(14),
        fill: RadioWavesColors.controlSurfaceTextColorProperty,
      }),
      {
        spacing: 8,
        checkboxColor: RadioWavesColors.controlSurfaceTextColorProperty,
        checkboxColorBackground: RadioWavesColors.controlSurfaceColorProperty,
        ...(tandem && { tandem: tandem.createTandem("showPositionPlotsCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, showPositionPlotsCheckbox],
    });
  }
}

RadioWavesNamespace.register("RadioWavesPreferencesNode", RadioWavesPreferencesNode);
