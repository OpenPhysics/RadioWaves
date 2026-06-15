import { Color, ProfileColorProperty } from "scenerystack/scenery";
import RadioWavesNamespace from "./RadioWavesNamespace.js";

const { BLACK, WHITE } = Color;

function profileColor(name: string, def: Color | string, projector: Color | string): ProfileColorProperty {
  return new ProfileColorProperty(RadioWavesNamespace, name, { default: def, projector });
}

// ── Panel fills ───────────────────────────────────────────────────────────────
// Near-black / near-white neutral fills so panels contrast with both themes.
const PANEL_FILL_DARK = new Color(40, 40, 40);
const PANEL_FILL_LIGHT = new Color(240, 240, 240);

// Semi-transparent borders that stay visible on either fill.
const PANEL_STROKE_DARK = "rgba(255, 255, 255, 0.4)";
const PANEL_STROKE_LIGHT = "rgba(0, 0, 0, 0.4)";

const RadioWavesColors = {
  backgroundColorProperty: profileColor("background", BLACK, WHITE),
  foregroundColorProperty: profileColor("foreground", WHITE, BLACK),

  panelFillProperty: profileColor("panelFill", PANEL_FILL_DARK, PANEL_FILL_LIGHT),
  panelStrokeProperty: profileColor("panelStroke", PANEL_STROKE_DARK, PANEL_STROKE_LIGHT),

  // Field visualization. The original used red for "force on electron" (FORCE_COLOR #c80000)
  // and navy for "electric field" (FIELD_COLOR #21366b). On the dark default we brighten both
  // so they stay legible; projector mode uses the original values.
  forceArrowProperty: profileColor("forceArrow", "#e84a4a", "#c80000"),
  fieldArrowProperty: profileColor("fieldArrow", "#6f9ad6", "#21366b"),

  // The transmitting/receiving electrons (rendered as outlined circles).
  electronFillProperty: profileColor("electronFill", "#5b9bd5", "#3a7bd5"),
  electronStrokeProperty: profileColor("electronStroke", "#bfe0ff", "#1f3864"),

  // The antenna rods.
  antennaFillProperty: profileColor("antennaFill", "#9aa3ad", "#6b7079"),
  antennaStrokeProperty: profileColor("antennaStroke", "rgba(255,255,255,0.5)", "rgba(0,0,0,0.5)"),

  // Oscilloscope position plots.
  plotBackgroundProperty: profileColor("plotBackground", new Color(16, 20, 26), WHITE),
  plotGridProperty: profileColor("plotGrid", "#3a3f47", "#cccccc"),
  plotLineProperty: profileColor("plotLine", "#4a9fe0", "#2575ba"),

  // ── Background scene (landscape art) ──────────────────────────────────────────
  // The hand-drawn daytime landscape painted by BackgroundSceneNode. These are representational
  // scenery colors rather than UI elements, so projector mode keeps the same values; they live here
  // (rather than hard-coded in the canvas node) so the palette is centralized and theme-able.
  sceneSkyTopProperty: profileColor("sceneSkyTop", "#9dcfff", "#9dcfff"),
  sceneSkyBottomProperty: profileColor("sceneSkyBottom", "#c9e4ff", "#c9e4ff"),
  sceneInkProperty: profileColor("sceneInk", "#111111", "#111111"),
  sceneStructureLightProperty: profileColor("sceneStructureLight", "#ffffff", "#ffffff"),
  sceneMountainFarProperty: profileColor("sceneMountainFar", "#d9d9d1", "#d9d9d1"),
  sceneMountainNearProperty: profileColor("sceneMountainNear", "#777061", "#777061"),
  sceneHillBackProperty: profileColor("sceneHillBack", "#8a865d", "#8a865d"),
  sceneHillFrontProperty: profileColor("sceneHillFront", "#2da22a", "#2da22a"),
  sceneWireProperty: profileColor("sceneWire", "#d00000", "#d00000"),
  sceneTransmitterBuildingProperty: profileColor("sceneTransmitterBuilding", "#bdad19", "#bdad19"),
  sceneReceiverRoofProperty: profileColor("sceneReceiverRoof", "#555555", "#555555"),
  sceneReceiverBuildingProperty: profileColor("sceneReceiverBuilding", "#f47c00", "#f47c00"),
  sceneAntennaArtFillProperty: profileColor("sceneAntennaArtFill", "#a4aab0", "#a4aab0"),
  sceneAntennaArtHighlightProperty: profileColor("sceneAntennaArtHighlight", "#e7ecef", "#e7ecef"),
};

export default RadioWavesColors;
