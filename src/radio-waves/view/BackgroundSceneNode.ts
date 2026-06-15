/**
 * BackgroundSceneNode.ts
 *
 * Paints a hand-drawn landscape behind the simulation. The antenna art is aligned from the
 * model's antenna endpoints so the background stays registered with the interactive electrons.
 *
 * All colors come from RadioWavesColors (ProfileColorProperty) rather than being hard-coded here,
 * so the landscape palette is centralized and theme-able; the node repaints when the palette changes.
 */

import { Multilink } from "scenerystack/axon";
import type { Bounds2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { CanvasNode } from "scenerystack/scenery";
import RadioWavesColors from "../../RadioWavesColors.js";
import type { RadioWavesModel } from "../model/RadioWavesModel.js";

type ModelPoint = { x: number; y: number };

export default class BackgroundSceneNode extends CanvasNode {
  private readonly model: RadioWavesModel;
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly sceneBounds: Bounds2;

  public constructor(model: RadioWavesModel, modelViewTransform: ModelViewTransform2, canvasBounds: Bounds2) {
    super({ canvasBounds });
    this.model = model;
    this.modelViewTransform = modelViewTransform;
    this.sceneBounds = canvasBounds;

    // Repaint when the (theme-able) scene palette changes. The background node lives for the lifetime
    // of the ScreenView (never removed from the scene graph), so this link is intentionally not disposed.
    Multilink.multilinkAny(
      [
        RadioWavesColors.sceneSkyTopProperty,
        RadioWavesColors.sceneSkyBottomProperty,
        RadioWavesColors.sceneInkProperty,
        RadioWavesColors.sceneStructureLightProperty,
        RadioWavesColors.sceneMountainFarProperty,
        RadioWavesColors.sceneMountainNearProperty,
        RadioWavesColors.sceneHillBackProperty,
        RadioWavesColors.sceneHillFrontProperty,
        RadioWavesColors.sceneWireProperty,
        RadioWavesColors.sceneTransmitterBuildingProperty,
        RadioWavesColors.sceneReceiverRoofProperty,
        RadioWavesColors.sceneReceiverBuildingProperty,
        RadioWavesColors.sceneAntennaArtFillProperty,
        RadioWavesColors.sceneAntennaArtHighlightProperty,
      ],
      () => this.invalidatePaint(),
    );
  }

  public override paintCanvas(context: CanvasRenderingContext2D): void {
    const bounds = this.sceneBounds;
    context.save();
    context.clearRect(bounds.minX, bounds.minY, bounds.width, bounds.height);

    this.paintSky(context);
    this.paintMountains(context);
    this.paintHills(context);
    this.paintWire(context);
    this.paintTransmitterStation(context);
    this.paintReceiverStation(context);
    this.paintAlignedAntenna(context, this.model.transmittingAntenna.end1, this.model.transmittingAntenna.end2);
    this.paintAlignedAntenna(context, this.model.receivingAntenna.end1, this.model.receivingAntenna.end2);

    context.restore();
  }

  private paintSky(context: CanvasRenderingContext2D): void {
    const bounds = this.sceneBounds;
    const gradient = context.createLinearGradient(0, bounds.minY, 0, bounds.maxY);
    gradient.addColorStop(0, RadioWavesColors.sceneSkyTopProperty.value.toCSS());
    gradient.addColorStop(1, RadioWavesColors.sceneSkyBottomProperty.value.toCSS());
    context.fillStyle = gradient;
    context.fillRect(bounds.minX, bounds.minY, bounds.width, bounds.height);

    context.fillStyle = RadioWavesColors.sceneStructureLightProperty.value.toCSS();
    context.strokeStyle = RadioWavesColors.sceneInkProperty.value.toCSS();
    context.lineWidth = 2;
    this.paintCloud(context, 62, 110, 34);
    this.paintCloud(context, 120, 345, 25);
  }

  private paintMountains(context: CanvasRenderingContext2D): void {
    const ink = RadioWavesColors.sceneInkProperty.value.toCSS();
    this.fillModelPolygon(
      context,
      [
        { x: 0, y: 560 },
        { x: 95, y: 485 },
        { x: 125, y: 515 },
        { x: 190, y: 420 },
        { x: 235, y: 510 },
        { x: 345, y: 545 },
        { x: 470, y: 565 },
        { x: 570, y: 515 },
        { x: 650, y: 545 },
        { x: 760, y: 485 },
        { x: 860, y: 525 },
        { x: 1000, y: 470 },
        { x: 1000, y: 700 },
        { x: 0, y: 700 },
      ],
      RadioWavesColors.sceneMountainFarProperty.value.toCSS(),
      ink,
    );

    this.fillModelPolygon(
      context,
      [
        { x: 0, y: 620 },
        { x: 115, y: 515 },
        { x: 175, y: 565 },
        { x: 240, y: 535 },
        { x: 300, y: 560 },
        { x: 390, y: 530 },
        { x: 470, y: 545 },
        { x: 590, y: 525 },
        { x: 710, y: 570 },
        { x: 820, y: 535 },
        { x: 1000, y: 590 },
        { x: 1000, y: 700 },
        { x: 0, y: 700 },
      ],
      RadioWavesColors.sceneMountainNearProperty.value.toCSS(),
      ink,
    );

    this.fillModelPolygon(
      context,
      [
        { x: 150, y: 470 },
        { x: 190, y: 420 },
        { x: 225, y: 490 },
        { x: 202, y: 475 },
        { x: 185, y: 488 },
        { x: 170, y: 460 },
      ],
      RadioWavesColors.sceneStructureLightProperty.value.toCSS(),
      ink,
    );
  }

  private paintHills(context: CanvasRenderingContext2D): void {
    const ink = RadioWavesColors.sceneInkProperty.value.toCSS();
    this.fillModelPolygon(
      context,
      [
        { x: 0, y: 690 },
        { x: 105, y: 675 },
        { x: 220, y: 630 },
        { x: 300, y: 615 },
        { x: 380, y: 570 },
        { x: 500, y: 555 },
        { x: 615, y: 500 },
        { x: 760, y: 530 },
        { x: 900, y: 485 },
        { x: 1000, y: 520 },
        { x: 1000, y: 700 },
        { x: 0, y: 700 },
      ],
      RadioWavesColors.sceneHillBackProperty.value.toCSS(),
      ink,
    );

    this.fillModelPolygon(
      context,
      [
        { x: 600, y: 700 },
        { x: 690, y: 650 },
        { x: 735, y: 545 },
        { x: 815, y: 450 },
        { x: 960, y: 435 },
        { x: 1000, y: 455 },
        { x: 1000, y: 700 },
      ],
      RadioWavesColors.sceneHillFrontProperty.value.toCSS(),
      ink,
    );
  }

  private paintWire(context: CanvasRenderingContext2D): void {
    const y = this.modelViewTransform.modelToViewY(this.model.origin.y);
    context.beginPath();
    context.moveTo(this.sceneBounds.minX, y);
    context.lineTo(this.sceneBounds.maxX, y);
    context.strokeStyle = RadioWavesColors.sceneWireProperty.value.toCSS();
    context.lineWidth = 2;
    context.stroke();
  }

  private paintTransmitterStation(context: CanvasRenderingContext2D): void {
    const ink = RadioWavesColors.sceneInkProperty.value.toCSS();
    this.fillModelPolygon(
      context,
      [
        { x: 55, y: 625 },
        { x: 108, y: 575 },
        { x: 165, y: 625 },
      ],
      ink,
      ink,
    );
    this.fillModelPolygon(
      context,
      [
        { x: 78, y: 625 },
        { x: 150, y: 625 },
        { x: 150, y: 700 },
        { x: 78, y: 700 },
      ],
      RadioWavesColors.sceneTransmitterBuildingProperty.value.toCSS(),
      ink,
    );
    this.fillModelPolygon(
      context,
      [
        { x: 133, y: 680 },
        { x: 146, y: 680 },
        { x: 146, y: 700 },
        { x: 133, y: 700 },
      ],
      RadioWavesColors.sceneStructureLightProperty.value.toCSS(),
      ink,
    );
  }

  private paintReceiverStation(context: CanvasRenderingContext2D): void {
    const ink = RadioWavesColors.sceneInkProperty.value.toCSS();
    this.fillModelPolygon(
      context,
      [
        { x: 690, y: 470 },
        { x: 735, y: 430 },
        { x: 785, y: 470 },
      ],
      RadioWavesColors.sceneReceiverRoofProperty.value.toCSS(),
      ink,
    );
    this.fillModelPolygon(
      context,
      [
        { x: 705, y: 470 },
        { x: 770, y: 470 },
        { x: 770, y: 515 },
        { x: 705, y: 515 },
      ],
      RadioWavesColors.sceneReceiverBuildingProperty.value.toCSS(),
      ink,
    );
    this.fillModelPolygon(
      context,
      [
        { x: 716, y: 490 },
        { x: 729, y: 490 },
        { x: 729, y: 515 },
        { x: 716, y: 515 },
      ],
      RadioWavesColors.sceneStructureLightProperty.value.toCSS(),
      ink,
    );
  }

  private paintAlignedAntenna(context: CanvasRenderingContext2D, end1: ModelPoint, end2: ModelPoint): void {
    const p1 = this.modelViewTransform.modelToViewXY(end1.x, end1.y);
    const p2 = this.modelViewTransform.modelToViewXY(end2.x, end2.y);
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.strokeStyle = RadioWavesColors.sceneAntennaArtFillProperty.value.toCSS();
    context.lineWidth = 9;
    context.lineCap = "round";
    context.stroke();

    context.beginPath();
    context.moveTo(p1.x - 2, p1.y);
    context.lineTo(p2.x - 2, p2.y);
    context.strokeStyle = RadioWavesColors.sceneAntennaArtHighlightProperty.value.toCSS();
    context.lineWidth = 2;
    context.stroke();
  }

  private paintCloud(context: CanvasRenderingContext2D, x: number, y: number, size: number): void {
    context.beginPath();
    context.arc(x, y, size * 0.45, Math.PI, 0);
    context.arc(x + size * 0.38, y - size * 0.28, size * 0.55, Math.PI, 0);
    context.arc(x + size * 0.95, y, size * 0.45, Math.PI, 0);
    context.lineTo(x + size * 1.25, y + size * 0.22);
    context.lineTo(x - size * 0.25, y + size * 0.22);
    context.closePath();
    context.fill();
    context.stroke();
  }

  private fillModelPolygon(
    context: CanvasRenderingContext2D,
    points: ModelPoint[],
    fillStyle: string,
    strokeStyle: string,
  ): void {
    const first = points[0];
    if (!first) {
      return;
    }
    const firstView = this.modelViewTransform.modelToViewXY(first.x, first.y);
    context.beginPath();
    context.moveTo(firstView.x, firstView.y);
    for (let i = 1; i < points.length; i++) {
      const point = points[i];
      if (!point) {
        continue;
      }
      const viewPoint = this.modelViewTransform.modelToViewXY(point.x, point.y);
      context.lineTo(viewPoint.x, viewPoint.y);
    }
    context.closePath();
    context.fillStyle = fillStyle;
    context.fill();
    context.strokeStyle = strokeStyle;
    context.lineWidth = 1.5;
    context.stroke();
  }
}
