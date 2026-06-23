import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { Screen, type ScreenOptions } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import type { RadioWavesPreferencesModel } from "../preferences/RadioWavesPreferencesModel.js";
import { RadioWavesModel } from "./model/RadioWavesModel.js";
import { RadioWavesKeyboardHelpContent } from "./view/RadioWavesKeyboardHelpContent.js";
import { RadioWavesScreenView } from "./view/RadioWavesScreenView.js";

type RadioWavesScreenOptions = ScreenOptions & { tandem: Tandem; preferences: RadioWavesPreferencesModel };

export class RadioWavesScreen extends Screen<RadioWavesModel, RadioWavesScreenView> {
  public constructor(options: RadioWavesScreenOptions) {
    super(
      () => new RadioWavesModel(options.preferences),
      (model) => new RadioWavesScreenView(model, { tandem: options.tandem.createTandem("view") }),
      optionize<RadioWavesScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          createKeyboardHelpNode: () => new RadioWavesKeyboardHelpContent(),
        },
        options,
      ),
    );
  }
}
