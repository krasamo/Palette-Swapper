import {
  LibraryColor,
  Shape,
  Fill,
  Stroke,
  Shadow,
} from "@penpot/plugin-types";
import { libraryColor2Color } from "./utils/swapper";
import IReferencedPalette from "./models/IReferencedPalette";

const FILLS_COLORED_FIELD = "fills";
const STROKES_COLORED_FIELD = "strokes";
const SHADOWS_COLORED_FIELD = "shadows";

const CHILDREN_FIELD = "children";

export default function paletteSwapper(
  shapes: Shape[],
  oldPalette: IReferencedPalette,
  newPalette: IReferencedPalette,
) {
  const oldPaletteId2name = new Map<string, string>();

  // Delete entries that oldPalette has, but newPalette hasn't. Also, populate the id2name map
  for (const [key, value] of oldPalette.colors)
    oldPaletteId2name.set(value.id, key);

  // If we don't have a color match, it doesn't make sense to continue from here
  if (oldPaletteId2name.size <= 0) return;

  while (shapes.length > 0) {
    const currentShape = shapes.pop();
    if (!currentShape) break;

    colorChanger(currentShape, oldPaletteId2name, newPalette.colors);

    // Append all childrens (if any) to the shapes array/stack
    if (CHILDREN_FIELD in currentShape && currentShape[CHILDREN_FIELD])
      for (const child of currentShape[CHILDREN_FIELD]) shapes.push(child);
  }
}

function colorChanger(
  shape: Shape,
  colorId2name: Map<string, string>,
  targetPalette: Map<string, LibraryColor>,
) {
  // Fills
  if (
    FILLS_COLORED_FIELD in shape &&
    shape[FILLS_COLORED_FIELD] instanceof Array
  ) {
    const newFills: Fill[] = [];
    let changed = false;

    for (const fill of shape[FILLS_COLORED_FIELD]) {
      const oldColorName = colorId2name.get(fill.fillColorRefId ?? "");
      const targetLibColor = targetPalette.get(oldColorName ?? "");

      if (targetLibColor) {
        newFills.push(targetLibColor.asFill());
        changed = true;
        //console.log("Passed");
      } else newFills.push(fill);
    }

    if (changed) shape[FILLS_COLORED_FIELD] = newFills;
  }

  // Strokes
  if (
    STROKES_COLORED_FIELD in shape &&
    shape[STROKES_COLORED_FIELD] instanceof Array
  ) {
    const newStrokes: Stroke[] = [];
    let changed = false;

    for (const stroke of shape[STROKES_COLORED_FIELD]) {
      const oldColorName = colorId2name.get(stroke.strokeColorRefId ?? "");
      const targetLibColor = targetPalette.get(oldColorName ?? "");

      if (targetLibColor) {
        newStrokes.push(targetLibColor.asStroke());
        changed = true;
      } else newStrokes.push(stroke);
    }

    if (changed) shape[STROKES_COLORED_FIELD] = newStrokes;
  }

  // Shadows
  if (
    SHADOWS_COLORED_FIELD in shape &&
    shape[SHADOWS_COLORED_FIELD] instanceof Array
  ) {
    const newShadows: Shadow[] = [];
    let changed = false;

    for (const shadow of shape[SHADOWS_COLORED_FIELD]) {
      const oldColor = shadow.color;

      if (!oldColor) continue;

      const oldColorName = colorId2name.get(oldColor.name ?? "");
      const targetLibColor = targetPalette.get(oldColorName ?? "");

      if (!targetLibColor) {
        newShadows.push(shadow);
        continue;
      }
      changed = true;

      const targetColor = libraryColor2Color(targetLibColor);
      const newShadow = shadow;
      newShadow.color = targetColor;

      newShadows.push(newShadow);
    }

    if (changed) shape[SHADOWS_COLORED_FIELD] = newShadows;
  }
}
