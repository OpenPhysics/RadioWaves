/**
 * ElectronNode.ts
 *
 * A single electron, rendered as an outlined circle (vector-only port of the electron sprite).
 * When `onDrag` is supplied it becomes draggable, used for the transmitting electron. Ported
 * from `views/electron.js` + `views/electron/draggable.js`.
 */

import type { ReadOnlyProperty } from "scenerystack";
import type { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, DragListener, KeyboardDragListener, Node } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import RadioWavesColors from "../../RadioWavesColors.js";

const RADIUS = 9;
const STROKE_WIDTH = 1.5;

type ElectronNodeOptions = {
  onDragStart?: () => void;
  onDrag?: (modelPoint: Vector2) => void;
};

export default class ElectronNode extends Node {
  public constructor(
    positionProperty: ReadOnlyProperty<Vector2>,
    modelViewTransform: ModelViewTransform2,
    options: ElectronNodeOptions = {},
  ) {
    const draggable = options.onDrag !== undefined;
    const a11y = StringManager.getInstance().getA11yStrings();
    super(
      draggable
        ? {
            cursor: "pointer",
            tagName: "div",
            focusable: true,
            accessibleName: a11y.controls.transmitterElectronNameStringProperty,
            accessibleHelpText: a11y.controls.transmitterElectronHelpStringProperty,
          }
        : {},
    );

    this.addChild(
      new Circle(RADIUS, {
        fill: RadioWavesColors.electronFillProperty,
        stroke: RadioWavesColors.electronStrokeProperty,
        lineWidth: STROKE_WIDTH,
      }),
    );

    positionProperty.link((position) => {
      this.translation = modelViewTransform.modelToViewPosition(position);
    });

    if (options.onDrag) {
      const onDrag = options.onDrag;
      const onDragStart = options.onDragStart;
      this.addInputListener(
        new DragListener({
          start: () => {
            onDragStart?.();
          },
          drag: (event) => {
            const viewPoint = this.globalToParentPoint(event.pointer.point);
            onDrag(modelViewTransform.viewToModelPosition(viewPoint));
          },
        }),
      );
      this.addInputListener(
        new KeyboardDragListener({
          transform: modelViewTransform,
          dragSpeed: 100,
          shiftDragSpeed: 40,
          keyboardDragDirection: "upDown",
          start: () => {
            onDragStart?.();
          },
          drag: (_event, listener) => {
            const current = positionProperty.value;
            onDrag(current.plusXY(listener.modelDelta.x, listener.modelDelta.y));
          },
        }),
      );
    }
  }
}
