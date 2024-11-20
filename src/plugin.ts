import { paletteMapper } from "./utils/swapper";
import paletteSwapper from "./palette-swapper";

import IPenpotReference from "./models/IPenpotReference";
import IPluginMessage from "./models/IPluginMessage";
import IReferencedPalette from "./models/IReferencedPalette";
import { Library, LibraryColor, Shape } from "@penpot/plugin-types";
import ISwapHistory from "./models/ISwapHistory";

const availableLibraries = new Map<string, IPenpotReference>();
const availablePalettes = new Map<string, Map<string, IReferencedPalette>>(); // <library id, <palette name, colors> >

let history: ISwapHistory;

//Fill available libraries
availableLibraries.set(penpot.library.local.id, {
  id: penpot.library.local.id,
  name: "Local",
  type: "Library",
});

constructLibraryPalettes(penpot.library.local);

for (const library of penpot.library.connected) {
  constructLibraryPalettes(library);

  availableLibraries.set(library.id, {
    id: library.id,
    name: library.name,
    type: "Library",
  });
}

penpot.ui.open("Palette Swapper", `?theme=${penpot.theme}`);

penpot.ui.onMessage<IPluginMessage>((message) => {
  if (message.type == "view-will-build") {
    // Build library dropdowns options

    sendMessage({
      type: "build_initial_ui",
      data: Array.from(availableLibraries.values()),
    });
  }

  if (message.type == "retrieve_palettes_from_library") {
    const selectedLibraryReference = message.data;

    if (!selectedLibraryReference || selectedLibraryReference instanceof Array)
      return;

    const palettesReferences = availablePalettes.get(
      selectedLibraryReference.id,
    );

    if (!palettesReferences) return;

    const penpotReferences: IPenpotReference[] = [];
    for (const [_, value] of palettesReferences)
      penpotReferences.push(value.reference);

    sendMessage({
      type: "build_palette_dropdown",
      data: penpotReferences,
      from: message.from,
    });
  }

  if (message.type == "swap") {
    const references = message.data;
    if (!references || !(references instanceof Array)) return;

    const originLibrary = references[0];
    const originPalette = references[1];
    const targetLibrary = references[2];
    const targetPalette = references[3];

    // Local, Global
    const effectRange = message.extra as "Local" | "Global";

    const originPaletteReference = availablePalettes
      .get(originLibrary.id)
      ?.get(originPalette.name);
    const targetPaletteReference = availablePalettes
      .get(targetLibrary.id)
      ?.get(targetPalette.name);

    const targetShapes: Shape[] = [];

    if (effectRange == "Global" && penpot.currentFile?.pages) {
      for (const root of penpot.currentFile.pages)
        if (root.root && "children" in root.root)
          for (const childrenShape of root.root.children)
            targetShapes.push(childrenShape);
    } else if (penpot.root && "children" in penpot.root)
      for (const childrenShape of penpot.root.children)
        targetShapes.push(childrenShape);

    if (
      !originPaletteReference ||
      !targetPaletteReference ||
      targetShapes.length <= 0
    )
      return;

    // Saving history for revert scenario
    history = {
      previousPalette: originPaletteReference,
      currentPalette: targetPaletteReference,
      effectRange: effectRange,
      shapes: [...targetShapes],
    };

    // SWAP!
    paletteSwapper(
      targetShapes,
      originPaletteReference,
      targetPaletteReference,
    );

    // Sending signal to re-enable UI (with revert button enabled)
    sendMessage({ type: "finished_swapping", extra: true });
  }

  if (message.type == "revert") {
    if (!history) return;

    // REVERT!
    paletteSwapper(
      history.shapes,
      history.currentPalette,
      history.previousPalette,
    );

    // Sending signal to re-enable UI (with revert button disabled)
    sendMessage({ type: "finished_swapping", extra: false });
  }
});

// Update the theme in the iframe
penpot.on("themechange", (theme) => {
  penpot.ui.sendMessage({
    type: "theme_change",
    theme,
  });
});

function sendMessage(message: IPluginMessage) {
  penpot.ui.sendMessage(message);
}

function constructLibraryPalettes(library: Library) {
  const libraryColorsMap = new Map<string, IReferencedPalette>();

  for (const color of library.colors) {
    // Not consider colors outside a palette
    if (color.path.length <= 0) continue;

    const existingPalette = libraryColorsMap.get(color.path);

    if (existingPalette) existingPalette.colors.set(color.name, color);
    else {
      const colors = new Map<string, LibraryColor>();
      colors.set(color.name, color);

      libraryColorsMap.set(color.path, {
        reference: { id: color.path, name: color.path, type: "Color" },
        colors: colors,
      });
    }
  }

  availablePalettes.set(library.id, libraryColorsMap);
}
