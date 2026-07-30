/**
 * RadioWavesScreenSummaryContent.ts
 *
 * Accessible screen summary (SceneryStack Interactive Description). Describes the
 * play area and controls, gives an interaction hint, and exposes a LIVE
 * "current details" paragraph derived from the model (the transmitter's
 * frequency and amplitude).
 *
 * Follows the OpenPhysics accessibility convention; see the canonical
 * SceneryStackTemplate/SimScreenSummaryContent.ts.
 */
import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { RadioWavesModel } from "../model/RadioWavesModel.js";

export class RadioWavesScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: RadioWavesModel) {
    const a11y = StringManager.getInstance().getA11yStrings();

    const currentDetailsProperty = new DerivedProperty(
      [a11y.currentDetailsStringProperty, model.frequencyProperty, model.amplitudeProperty],
      (template, frequency, amplitude) =>
        StringUtils.fillIn(template, {
          frequency: Math.round(frequency),
          amplitude: Math.round(amplitude),
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
