import { LibraryColor } from "@penpot/plugin-types";
import IPenpotReference from "./IPenpotReference";

export default interface IReferencedPalette {
  reference: IPenpotReference;
  // <colorid, color>
  colors: Map<string, LibraryColor>;
}
