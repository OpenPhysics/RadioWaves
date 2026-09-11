/**
 * StringManager.ts
 *
 * Centralizes string management for Radio Waves & Electromagnetic Fields.
 * Provides access to localized strings for all components.
 */

import type { ReadOnlyProperty } from "scenerystack/axon";
import { LocalizedString } from "scenerystack/chipper";
import stringsEn from "./strings_en.json";
import stringsEs from "./strings_es.json";
import stringsFr from "./strings_fr.json";

// ── Compile-time key-parity check ─────────────────────────────────────────────
// satisfies errors immediately if either locale file is missing keys from the other.
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsEn satisfies typeof stringsFr);
// biome-ignore lint/complexity/noVoid: intentional compile-time type assertion
void (stringsFr satisfies typeof stringsEn);

// ── Build the reactive string property tree ───────────────────────────────────
const stringProperties = LocalizedString.getNestedStringProperties({
  en: stringsEn,
  fr: stringsFr,
  es: stringsEs,
});

export class StringManager {
  private static instance: StringManager | null = null;

  private constructor() {
    // Private — obtain via getInstance()
  }

  public static getInstance(): StringManager {
    if (StringManager.instance === null) {
      StringManager.instance = new StringManager();
    }
    return StringManager.instance;
  }

  public getTitleStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.titleStringProperty;
  }

  /**
   * Accessibility (Interactive Description) StringProperties: the screen-summary
   * regions and the live current-details template. See the shared OpenLyceum
   * ACCESSIBILITY.md convention.
   */
  public getA11yStrings() {
    return stringProperties.a11y;
  }

  public getScreenNames(): { radioWavesStringProperty: ReadOnlyProperty<string> } {
    return {
      radioWavesStringProperty: stringProperties.screens.radioWavesStringProperty,
    };
  }

  public getTransmitterMovementStrings() {
    return stringProperties.transmitterMovement;
  }

  public getFieldDisplayTypeStrings() {
    return stringProperties.fieldDisplayType;
  }

  public getFieldSenseStrings() {
    return stringProperties.fieldSense;
  }

  public getFieldDisplayedStrings() {
    return stringProperties.fieldDisplayed;
  }

  public getElectronPositionsStringProperty(): ReadOnlyProperty<string> {
    return stringProperties.electronPositionsStringProperty;
  }

  public getPlotStrings() {
    return stringProperties.plots;
  }

  public getLegendStrings() {
    return stringProperties.legend;
  }

  /** Simulation-specific preference labels shown in Preferences → Simulation. */
  public getPreferences() {
    return stringProperties.preferences;
  }
}
