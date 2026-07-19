/**
 * RadioWavesScreenView.ts
 *
 * Lays out the play area (field visualization, the two antennas with their electrons, and the
 * toggleable position plots), the right-hand control column (transmitter movement + field
 * options), and the bottom controls (play/step, the Electron Positions checkbox, and Reset All).
 * Builds the model-view transform that maps the model's 1000×700 world into the play area,
 * keeping the original's non-inverted Y so the field math is unchanged. Ported from
 * `views/scene.js` + `sim.js`.
 */

import { DerivedProperty } from "scenerystack/axon";
import { Bounds2, Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { HBox, Node, Text } from "scenerystack/scenery";
import { PhetFont, PlayPauseButton, ResetAllButton, StepForwardButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { Checkbox, Panel } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { FLAT_RESET_ALL_BUTTON_OPTIONS } from "../../common/RadioWavesButtonOptions.js";
import { StringManager } from "../../i18n/StringManager.js";
import RadioWavesColors from "../../RadioWavesColors.js";
import type { RadioWavesModel } from "../model/RadioWavesModel.js";
import AntennaNode from "./AntennaNode.js";
import BackgroundSceneNode from "./BackgroundSceneNode.js";
import ElectronNode from "./ElectronNode.js";
import ElectronPositionPlotNode from "./ElectronPositionPlotNode.js";
import FieldControlPanel from "./FieldControlPanel.js";
import FieldLatticeNode from "./FieldLatticeNode.js";
import LegendNode from "./LegendNode.js";
import { RadioWavesScreenSummaryContent } from "./RadioWavesScreenSummaryContent.js";
import TransmitterMovementPanel from "./TransmitterMovementPanel.js";

type RadioWavesScreenViewOptions = ScreenViewOptions & { tandem: Tandem };

const MARGIN = 14;
const BOTTOM_CONTROLS_HEIGHT = 70;
const PLAY_BUTTON_RADIUS = 22;
const STEP_BUTTON_RADIUS = 18;
const PLAYBACK_SPACING = 16;
const CHECKBOX_FONT = new PhetFont(14);

export class RadioWavesScreenView extends ScreenView {
  public constructor(model: RadioWavesModel, providedOptions: RadioWavesScreenViewOptions) {
    super({ ...providedOptions, screenSummaryContent: new RadioWavesScreenSummaryContent(model) });

    const layoutBounds = this.layoutBounds;

    // ── Right-hand control column ─────────────────────────────────────────────
    const transmitterPanel = new TransmitterMovementPanel(model);
    const fieldPanel = new FieldControlPanel(model);
    const columnWidth = Math.max(transmitterPanel.width, fieldPanel.width);

    // ── Play-area geometry + model-view transform ─────────────────────────────
    const usableWidth = layoutBounds.width - columnWidth - 3 * MARGIN;
    const usableHeight = layoutBounds.height - BOTTOM_CONTROLS_HEIGHT - 2 * MARGIN;
    const scale = Math.min(usableWidth / model.bounds.width, usableHeight / model.bounds.height);

    const playLeft = MARGIN;
    const playTop = MARGIN + (usableHeight - model.bounds.height * scale) / 2;
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleMapping(
      Vector2.ZERO,
      new Vector2(playLeft, playTop),
      scale,
    );

    const playRight = MARGIN + usableWidth;
    const playBottom = layoutBounds.maxY - BOTTOM_CONTROLS_HEIGHT;

    // ── Field visualization (covers the left play region) ─────────────────────
    const fieldCanvasBounds = new Bounds2(0, 0, playRight, layoutBounds.maxY);
    const backgroundSceneNode = new BackgroundSceneNode(model, modelViewTransform, fieldCanvasBounds);
    const fieldLatticeNode = new FieldLatticeNode(model, modelViewTransform, fieldCanvasBounds);

    // ── Antennas + electrons ──────────────────────────────────────────────────
    const transmittingAntennaNode = new AntennaNode(model.transmittingAntenna, modelViewTransform);
    const receivingAntennaNode = new AntennaNode(model.receivingAntenna, modelViewTransform);

    const transmittingElectronNode = new ElectronNode(model.transmittingElectron.positionProperty, modelViewTransform, {
      onDragStart: () => {
        model.movementModeProperty.value = "manual";
      },
      onDrag: (modelPoint) => {
        model.transmittingElectron.moveToNewPosition(modelPoint);
      },
    });
    const receivingElectronNode = new ElectronNode(model.receivingElectron.positionProperty, modelViewTransform);

    // ── Toggleable position plots ─────────────────────────────────────────────
    const plotStrings = StringManager.getInstance().getPlotStrings();
    const restY = model.transmittingElectron.startPosition.y;
    const halfRange = (model.transmittingAntenna.maxY - model.transmittingAntenna.minY) / 2;

    const transmitterPlot = new ElectronPositionPlotNode(
      model.transmittingElectron.positionProperty,
      restY,
      halfRange,
      plotStrings.transmitterStringProperty,
      plotStrings.timeStringProperty,
    );
    const receiverPlot = new ElectronPositionPlotNode(
      model.receivingElectron.positionProperty,
      restY,
      halfRange,
      plotStrings.receiverStringProperty,
      plotStrings.timeStringProperty,
    );
    transmitterPlot.right = playRight - MARGIN;
    transmitterPlot.top = MARGIN;
    receiverPlot.right = playRight - MARGIN;
    receiverPlot.bottom = playBottom - MARGIN;
    model.showPositionPlotsProperty.link((show) => {
      transmitterPlot.visible = show;
      receiverPlot.visible = show;
    });

    // ── Bottom controls ───────────────────────────────────────────────────────
    const playPauseButton = new PlayPauseButton(model.isPlayingProperty, { radius: PLAY_BUTTON_RADIUS });
    const stepForwardButton = new StepForwardButton({
      radius: STEP_BUTTON_RADIUS,
      enabledProperty: DerivedProperty.not(model.isPlayingProperty),
      listener: () => model.stepOnce(),
    });
    const playbackControls = new HBox({
      spacing: PLAYBACK_SPACING,
      align: "center",
      children: [playPauseButton, stepForwardButton],
      centerX: playLeft + usableWidth / 2,
      bottom: layoutBounds.maxY - MARGIN,
    });

    const electronPositionsCheckbox = new Checkbox(
      model.showPositionPlotsProperty,
      new Text(StringManager.getInstance().getElectronPositionsStringProperty(), {
        font: CHECKBOX_FONT,
        fill: RadioWavesColors.foregroundColorProperty,
      }),
    );
    const electronPositionsPanel = new Panel(electronPositionsCheckbox, {
      fill: RadioWavesColors.panelFillProperty,
      stroke: RadioWavesColors.panelStrokeProperty,
      cornerRadius: 6,
      xMargin: 10,
      yMargin: 8,
      left: layoutBounds.minX + MARGIN,
      bottom: layoutBounds.maxY - MARGIN,
    });

    const resetAllButton = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        transmitterPlot.reset();
        receiverPlot.reset();
        fieldLatticeNode.update();
      },
      right: layoutBounds.maxX - MARGIN,
      bottom: layoutBounds.maxY - MARGIN,
      tandem: providedOptions.tandem.createTandem("resetAllButton"),
    });

    // ── Right column positioning ──────────────────────────────────────────────
    const legendNode = new LegendNode();
    transmitterPanel.right = layoutBounds.maxX - MARGIN;
    transmitterPanel.top = MARGIN;
    fieldPanel.right = layoutBounds.maxX - MARGIN;
    fieldPanel.top = transmitterPanel.bottom + MARGIN;
    legendNode.left = MARGIN;
    legendNode.top = MARGIN;

    this.children = [
      backgroundSceneNode,
      fieldLatticeNode,
      transmittingAntennaNode,
      receivingAntennaNode,
      transmittingElectronNode,
      receivingElectronNode,
      transmitterPlot,
      receiverPlot,
      transmitterPanel,
      fieldPanel,
      legendNode,
      playbackControls,
      electronPositionsPanel,
      resetAllButton,
    ];

    // ── Accessibility: keyboard / reading traversal order ───────────────────────
    // Deterministic Tab/reading order: the draggable transmitter electron first,
    // then the control panels, playback controls, and Reset All last. ScreenView
    // throws if you set pdomOrder on itself, so use a wrapper Node.
    this.addChild(
      new Node({
        pdomOrder: [
          transmittingElectronNode,
          transmitterPanel,
          fieldPanel,
          electronPositionsPanel,
          playbackControls,
          resetAllButton,
        ],
      }),
    );

    // ── Frame wiring ──────────────────────────────────────────────────────────
    // Repaint the field whenever the source electron moves (each played frame, and on reset).
    model.transmittingElectron.positionProperty.link(() => fieldLatticeNode.update());
    // Advance the scrolling plots once per fixed model step (constant-dt sampling).
    // Always push data regardless of visibility so the traces stay current when revealed.
    model.steppedEmitter.addListener(() => {
      transmitterPlot.update();
      receiverPlot.update();
    });
  }
}
