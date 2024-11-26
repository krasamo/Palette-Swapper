import { LibraryColor, Color, Library } from "@penpot/plugin-types";
import IPenpotReference from "../models/IPenpotReference";

// If target name is defined, only Colors from that path will be mapped
export function paletteMapper(
  palette: readonly LibraryColor[],
  targetPath?: string,
): Map<string, LibraryColor> {
  const mapped = new Map<string, LibraryColor>();

  for (const color of palette) {
    if (!targetPath || color.path == targetPath) {
      mapped.set(color.name, color);
    }
  }

  return mapped;
}

export function libraryColor2Color(libColor: LibraryColor): Color {
  return {
    id: libColor.id,
    name: libColor.name,
    path: libColor.path,
    color: libColor.color,
    opacity: libColor.opacity,
    refId: libColor.id,
    refFile: libColor.libraryId,
    gradient: libColor.gradient,
    image: libColor.image,
  };
}

export function retrieveConnectedLibrariesReferences(
  libraries: Library[],
): IPenpotReference[] {
  const references: IPenpotReference[] = [];

  for (const library of libraries) {
    references.push({
      id: library.id,
      name: library.name,
      type: "Library",
    });
  }

  return references;
}

export function retrieveColorPalettesNamesFromLibrary(
  library: Library,
): string[] {
  const names = new Set<string>();

  for (const libraryColor of library.colors) {
    names.add(libraryColor.path);
  }

  return Array.from(names.values());
}
