import { Color, ProfileColorProperty } from "scenerystack/scenery";
import RadioWavesNamespace from "./RadioWavesNamespace.js";

const { BLACK, WHITE } = Color;

function profileColor(name: string, def: Color | string, projector: Color | string): ProfileColorProperty {
  return new ProfileColorProperty(RadioWavesNamespace, name, { default: def, projector });
}

// ── Panel fills ───────────────────────────────────────────────────────────────
// Cool blue-tinted dark/light fills for better theme coherence.
const PANEL_FILL_DARK = new Color(28, 32, 40);
const PANEL_FILL_LIGHT = new Color(230, 234, 242);

// Semi-transparent borders that stay visible on either fill.
const PANEL_STROKE_DARK = "rgba(255, 255, 255, 0.35)";
const PANEL_STROKE_LIGHT = "rgba(0, 0, 0, 0.35)";

const RadioWavesColors = {
  backgroundColorProperty: profileColor("background", BLACK, WHITE),
  foregroundColorProperty: profileColor("foreground", WHITE, BLACK),

  panelFillProperty: profileColor("panelFill", PANEL_FILL_DARK, PANEL_FILL_LIGHT),
  panelStrokeProperty: profileColor("panelStroke", PANEL_STROKE_DARK, PANEL_STROKE_LIGHT),

  // Field visualization. Red for "force on electron", blue for "electric field".
  // Dark theme uses highly saturated values that pop against black; projector uses
  // deeper, ink-friendly tones that stay legible on white.
  forceArrowProperty: profileColor("forceArrow", "#ff5252", "#c62828"),
  fieldArrowProperty: profileColor("fieldArrow", "#5c8ee8", "#1a56a8"),

  // The transmitting/receiving electrons (rendered as outlined circles). Cyan keeps
  // them clearly distinguishable from the blue field-direction arrows.
  electronFillProperty: profileColor("electronFill", "#29d9ff", "#0086a8"),
  electronStrokeProperty: profileColor("electronStroke", "#7eeeff", "#005c70"),

  // The antenna rods. Cool gray with a subtle blue-tinted highlight.
  antennaFillProperty: profileColor("antennaFill", "#8a96a4", "#546070"),
  antennaStrokeProperty: profileColor("antennaStroke", "rgba(190, 220, 255, 0.5)", "rgba(0, 0, 0, 0.4)"),

  // Oscilloscope position plots. Deep navy background; the trace color matches the electron
  // (cyan/teal) since the plot shows electron position over time.
  plotBackgroundProperty: profileColor("plotBackground", new Color(8, 12, 22), WHITE),
  plotGridProperty: profileColor("plotGrid", "#1c2a3a", "#b8c8d8"),
  plotLineProperty: profileColor("plotLine", "#29d9ff", "#0086a8"),

  // ── Background scene (landscape art) ──────────────────────────────────────────
  // The hand-drawn daytime landscape painted by BackgroundSceneNode. These are representational
  // scenery colors rather than UI elements, so projector mode keeps the same values; they live here
  // (rather than hard-coded in the canvas node) so the palette is centralized and theme-able.
  sceneSkyTopProperty: profileColor("sceneSkyTop", "#5ba8e8", "#5ba8e8"),
  sceneSkyBottomProperty: profileColor("sceneSkyBottom", "#b0d4f5", "#b0d4f5"),
  sceneInkProperty: profileColor("sceneInk", "#111111", "#111111"),
  sceneStructureLightProperty: profileColor("sceneStructureLight", "#ffffff", "#ffffff"),
  sceneMountainFarProperty: profileColor("sceneMountainFar", "#d9d9d1", "#d9d9d1"),
  sceneMountainNearProperty: profileColor("sceneMountainNear", "#777061", "#777061"),
  sceneHillBackProperty: profileColor("sceneHillBack", "#8a865d", "#8a865d"),
  sceneHillFrontProperty: profileColor("sceneHillFront", "#28b038", "#28b038"),
  sceneTreesProperty: profileColor("sceneTrees", "#1a6e2a", "#1a6e2a"),
  sceneWireProperty: profileColor("sceneWire", "#d00000", "#d00000"),
  sceneTransmitterBuildingProperty: profileColor("sceneTransmitterBuilding", "#d0b218", "#d0b218"),
  sceneReceiverRoofProperty: profileColor("sceneReceiverRoof", "#555555", "#555555"),
  sceneReceiverBuildingProperty: profileColor("sceneReceiverBuilding", "#f47c00", "#f47c00"),
  sceneAntennaArtFillProperty: profileColor("sceneAntennaArtFill", "#a4aab0", "#a4aab0"),
  sceneAntennaArtHighlightProperty: profileColor("sceneAntennaArtHighlight", "#e7ecef", "#e7ecef"),
};

export default RadioWavesColors;
