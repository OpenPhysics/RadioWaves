/**
 * TransmitterMovementPanel.ts
 *
 * Chooses how the transmitting electron moves — dragged by hand (Manual) or driven by the
 * oscillator (Oscillate) — and, when oscillating, sets the frequency and amplitude. The two
 * sliders are disabled in manual mode. Replaces the "Transmitter Movement" panel from sim.html.
 */

import type { ReadOnlyProperty } from "scenerystack";
import { Text, VBox } from "scenerystack/scenery";
import { NumberControl, PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, Panel } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import RadioWavesColors from "../../RadioWavesColors.js";
import Constants from "../../RadioWavesConstants.js";
import type { MovementMode } from "../model/MovementStrategy.js";
import type { RadioWavesModel } from "../model/RadioWavesModel.js";

const TITLE_FONT = new PhetFont({ size: 15, weight: "bold" });
const LABEL_FONT = new PhetFont(14);
const CONTROL_FONT = new PhetFont(13);

const RADIO_SPACING = 6;
const CONTENT_SPACING = 10;
const PANEL_CORNER_RADIUS = 6;
const PANEL_X_MARGIN = 12;
const PANEL_Y_MARGIN = 10;
const SLIDER_DELTA = 1;
const NUMBER_DECIMAL_PLACES = 0;

export default class TransmitterMovementPanel extends Panel {
  public constructor(model: RadioWavesModel) {
    const strings = StringManager.getInstance().getTransmitterMovementStrings();
    const a11y = StringManager.getInstance().getA11yStrings();

    const header = new Text(strings.titleStringProperty, {
      font: TITLE_FONT,
      fill: RadioWavesColors.foregroundColorProperty,
    });

    const label = (text: ReadOnlyProperty<string>): Text =>
      new Text(text, { font: LABEL_FONT, fill: RadioWavesColors.foregroundColorProperty });

    const movementRadioGroup = new AquaRadioButtonGroup<MovementMode>(
      model.movementModeProperty,
      [
        { value: "manual", createNode: () => label(strings.manualStringProperty) },
        { value: "oscillate", createNode: () => label(strings.oscillateStringProperty) },
      ],
      { spacing: RADIO_SPACING, accessibleName: a11y.controls.movementModeStringProperty },
    );

    const numberControlOptions = {
      titleNodeOptions: { font: CONTROL_FONT, fill: RadioWavesColors.foregroundColorProperty },
      numberDisplayOptions: { textOptions: { font: CONTROL_FONT }, decimalPlaces: NUMBER_DECIMAL_PLACES },
      sliderOptions: { constrainValue: (value: number) => Math.round(value) },
      delta: SLIDER_DELTA,
    };

    const frequencyControl = new NumberControl(
      strings.frequencyStringProperty,
      model.frequencyProperty,
      Constants.FREQUENCY_RANGE,
      {
        ...numberControlOptions,
        accessibleName: a11y.controls.frequencyStringProperty,
        accessibleHelpText: a11y.controls.frequencyHelpStringProperty,
      },
    );
    const amplitudeControl = new NumberControl(
      strings.amplitudeStringProperty,
      model.amplitudeProperty,
      Constants.AMPLITUDE_RANGE,
      {
        ...numberControlOptions,
        accessibleName: a11y.controls.amplitudeStringProperty,
        accessibleHelpText: a11y.controls.amplitudeHelpStringProperty,
      },
    );

    const content = new VBox({
      align: "left",
      spacing: CONTENT_SPACING,
      children: [header, movementRadioGroup, frequencyControl, amplitudeControl],
    });

    super(content, {
      fill: RadioWavesColors.panelFillProperty,
      stroke: RadioWavesColors.panelStrokeProperty,
      cornerRadius: PANEL_CORNER_RADIUS,
      xMargin: PANEL_X_MARGIN,
      yMargin: PANEL_Y_MARGIN,
    });

    // The oscillator controls are only meaningful while oscillating.
    model.movementModeProperty.link((mode) => {
      const oscillating = mode === "oscillate";
      frequencyControl.enabled = oscillating;
      amplitudeControl.enabled = oscillating;
    });
  }
}
