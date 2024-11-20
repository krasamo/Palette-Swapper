import { Shape } from "@penpot/plugin-types";
import IReferencedPalette from "./IReferencedPalette";

export default interface ISwapHistory {
  previousPalette: IReferencedPalette;
  currentPalette: IReferencedPalette;
  effectRange: "Local" | "Global";
  shapes: Shape[];
}
