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
        RadioWavesColors.sceneTreesProperty,
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
    const W = bounds.width;
    const H = bounds.height;

    const gradient = context.createLinearGradient(0, bounds.minY, 0, bounds.maxY);
    gradient.addColorStop(0, RadioWavesColors.sceneSkyTopProperty.value.toCSS());
    gradient.addColorStop(1, RadioWavesColors.sceneSkyBottomProperty.value.toCSS());
    context.fillStyle = gradient;
    context.fillRect(bounds.minX, bounds.minY, W, H);

    // Sun in the upper-right of the sky, painted before clouds so clouds overlap it naturally
    this.paintSun(context, W * 0.70, H * 0.09);

    // Fluffy cumulus clouds at varied depths (opacity signals distance)
    this.paintCloud(context, W * 0.06, H * 0.14, W * 0.048);
    this.paintCloud(context, W * 0.29, H * 0.08, W * 0.042);
    this.paintCloud(context, W * 0.52, H * 0.17, W * 0.036, 0.88);
    this.paintCloud(context, W * 0.17, H * 0.37, W * 0.030, 0.72);
    this.paintCloud(context, W * 0.43, H * 0.31, W * 0.026, 0.65);
  }

  private paintSun(context: CanvasRenderingContext2D, x: number, y: number): void {
    const r = 20;

    // Wide atmospheric glow
    const outerGlow = context.createRadialGradient(x, y, r, x, y, r * 4.5);
    outerGlow.addColorStop(0, "rgba(255, 248, 160, 0.38)");
    outerGlow.addColorStop(0.45, "rgba(255, 240, 130, 0.10)");
    outerGlow.addColorStop(1, "rgba(255, 225, 90, 0)");
    context.beginPath();
    context.arc(x, y, r * 4.5, 0, Math.PI * 2);
    context.fillStyle = outerGlow;
    context.fill();

    // Inner corona / halo
    const halo = context.createRadialGradient(x, y, r * 0.85, x, y, r * 2.2);
    halo.addColorStop(0, "rgba(255, 255, 210, 0.75)");
    halo.addColorStop(1, "rgba(255, 248, 160, 0)");
    context.beginPath();
    context.arc(x, y, r * 2.2, 0, Math.PI * 2);
    context.fillStyle = halo;
    context.fill();

    // Sun disk with subtle centre highlight
    const disk = context.createRadialGradient(x - r * 0.28, y - r * 0.28, 0, x, y, r);
    disk.addColorStop(0, "#fffbcc");
    disk.addColorStop(1, "#ffdd44");
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2);
    context.fillStyle = disk;
    context.fill();
  }

  private paintCloud(context: CanvasRenderingContext2D, x: number, y: number, size: number, opacity = 1.0): void {
    context.save();

    // Soft translucent shadow cast below the cloud
    context.beginPath();
    context.ellipse(x + size * 0.48, y + size * 0.42, size * 0.60, size * 0.12, 0, 0, Math.PI * 2);
    context.fillStyle = `rgba(65, 90, 130, ${0.17 * opacity})`;
    context.fill();

    // Shading lobes at the base — give the cloud body and volumetric depth
    for (const { dx, dy, r } of [
      { dx: 0.08, dy: 0.08, r: 0.40 },
      { dx: 0.44, dy: -0.08, r: 0.50 },
      { dx: 0.88, dy: 0.08, r: 0.37 },
    ]) {
      context.beginPath();
      context.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
      context.fillStyle = `rgba(195, 212, 235, ${0.78 * opacity})`;
      context.fill();
    }

    // Bright white lobes — the sunlit tops of the cumulus towers
    for (const { dx, dy, r } of [
      { dx: 0.00, dy: 0.00, r: 0.42 },
      { dx: 0.38, dy: -0.30, r: 0.56 },
      { dx: 0.80, dy: -0.10, r: 0.42 },
      { dx: 0.96, dy: 0.04, r: 0.38 },
      { dx: 0.50, dy: 0.06, r: 0.28 },
    ]) {
      context.beginPath();
      context.arc(x + dx * size, y + dy * size, r * size, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${0.94 * opacity})`;
      context.fill();
    }

    context.restore();
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

    // Snow cap on the highest peak
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

    // Pine trees on top of the hills, painted after the hill fills so they appear in front
    this.paintTrees(context);
  }

  private paintTrees(context: CanvasRenderingContext2D): void {
    const mvt = this.modelViewTransform;
    const treeModelHeight = 32;

    // Trees along the back hill ridge (model y ≈ 528–567)
    const backTrees: ModelPoint[] = [
      { x: 408, y: 567 },
      { x: 440, y: 563 },
      { x: 472, y: 557 },
      { x: 505, y: 553 },
      { x: 540, y: 545 },
      { x: 572, y: 537 },
      { x: 604, y: 528 },
    ];

    // Trees along the front green hill ridge (model y ≈ 436–449, right of the receiver building)
    const frontTrees: ModelPoint[] = [
      { x: 828, y: 449 },
      { x: 856, y: 446 },
      { x: 884, y: 443 },
      { x: 912, y: 441 },
      { x: 940, y: 438 },
      { x: 965, y: 436 },
    ];

    for (const base of [...backTrees, ...frontTrees]) {
      const vBase = mvt.modelToViewXY(base.x, base.y);
      const vTip = mvt.modelToViewXY(base.x, base.y - treeModelHeight);
      this.paintPineTree(context, vBase.x, vBase.y, vBase.y - vTip.y);
    }
  }

  // Three-tier pine tree silhouette — widest at base, narrowest at crown.
  private paintPineTree(context: CanvasRenderingContext2D, cx: number, baseY: number, height: number): void {
    const w = height * 0.55;
    context.fillStyle = RadioWavesColors.sceneTreesProperty.value.toCSS();

    for (const { yTop, yBot, wFrac } of [
      { yTop: baseY - height * 0.44, yBot: baseY, wFrac: 1.00 },
      { yTop: baseY - height * 0.70, yBot: baseY - height * 0.30, wFrac: 0.70 },
      { yTop: baseY - height, yBot: baseY - height * 0.58, wFrac: 0.44 },
    ]) {
      const hw = (w * wFrac) / 2;
      context.beginPath();
      context.moveTo(cx, yTop);
      context.lineTo(cx - hw, yBot);
      context.lineTo(cx + hw, yBot);
      context.closePath();
      context.fill();
    }
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
