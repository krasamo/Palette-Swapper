import IPenpotReference from "./models/IPenpotReference";

import {
  constructDropdown,
  changeUIMode,
  missingFieldsStatusHandler,
  changeStatusLabel,
} from "./utils/ui";
import "./style.css";
import IPluginMessage from "./models/IPluginMessage";

// get the current theme from the URL
const searchParams = new URLSearchParams(window.location.search);
document.body.dataset.theme = searchParams.get("theme") ?? "light";

// Values for selectors
let selectedOriginLibrary: IPenpotReference | undefined;
let selectedOriginPalette: IPenpotReference | undefined;
let selectedTargetLibrary: IPenpotReference | undefined;
let selectedTargetPalette: IPenpotReference | undefined;
let selectedEffectRange: "Local" | "Global" = "Local";

// Data handlers
document
  .querySelector("[data-handler='swap']")
  ?.addEventListener("click", () => {
    // If we have a missing field, then ask the user to define it
    if (
      !selectedOriginLibrary ||
      !selectedOriginPalette ||
      !selectedTargetLibrary ||
      !selectedTargetPalette
    ) {
      const missingFieldsStatus = missingFieldsStatusHandler(
        selectedOriginLibrary,
        selectedOriginPalette,
        selectedTargetLibrary,
        selectedTargetPalette,
      );

      changeStatusLabel(missingFieldsStatus);
      return;
    }

    // Disable UI
    changeUIMode(false, "Swapping...");

    // If we got tio this point,
    const references = [
      selectedOriginLibrary,
      selectedOriginPalette,
      selectedTargetLibrary,
      selectedTargetPalette,
    ];

    // Send message to plugin.ts
    sendMessageToPenpot({
      type: "swap",
      data: references,
      extra: selectedEffectRange,
    });
  });

document
  .querySelector("[data-handler='revert']")
  ?.addEventListener("click", () => {
    // Disable UI
    changeUIMode(false, "Reverting...");

    sendMessageToPenpot({ type: "revert" });
  });

for (const library_dropdown of document.querySelectorAll(
  "[data-handler='library_change']",
)) {
  library_dropdown.addEventListener("change", (element) => {
    if (!element.target) {
      return;
    }
    const parent = element.target as HTMLSelectElement;
    const selectedTriggerIndex = parent.selectedIndex;
    const trigger = parent.options[selectedTriggerIndex] as HTMLOptionElement;

    const libraryReference: IPenpotReference = {
      id: trigger.value,
      name: trigger.innerHTML,
      type: "Library",
    };

    const fromSelector = parent.id == "origin_library" ? "Origin" : "Target";

    // No ID means no library selected, thus remove all the palette options
    if (trigger.id.length > 0) {
      sendMessageToPenpot({
        type: "retrieve_palettes_from_library",
        data: libraryReference,
        from: fromSelector,
      });

      assignValueFromDropdown(fromSelector, "Library", libraryReference);
    } else {
      const targetElement = (
        fromSelector == "Origin"
          ? document.getElementById("origin_palette")
          : document.getElementById("target_palette")
      ) as HTMLSelectElement | null;

      if (targetElement) {
        constructDropdown(targetElement, []);

        // Discard selected Library and Palette
        assignValueFromDropdown(fromSelector, "Library", undefined);
        assignValueFromDropdown(fromSelector, "Palette", undefined);
      }
    }
  });
}

for (const paletteDropdown of document.querySelectorAll(
  "[data-handler='palette_change']",
)) {
  paletteDropdown.addEventListener("change", (element) => {
    if (!element.target) {
      return;
    }
    const parent = element.target as HTMLSelectElement;
    const selectedTriggerIndex = parent.selectedIndex;
    const trigger = parent.options[selectedTriggerIndex] as HTMLOptionElement;

    const libraryReference: IPenpotReference = {
      id: trigger.value,
      name: trigger.innerHTML,
      type: "Color",
    };

    const fromSelector = parent.id == "origin_palette" ? "Origin" : "Target";

    // No ID means no palette selected, thus remove it from selected options
    if (trigger.id.length > 0)
      assignValueFromDropdown(fromSelector, "Palette", libraryReference);
    else assignValueFromDropdown(fromSelector, "Palette", undefined);
  });
}

for (const rangeRadio of document.querySelectorAll(
  "[data-handler='effect_range']",
)) {
  rangeRadio.addEventListener("click", (element) => {
    const trigger = element.target as HTMLInputElement;

    selectedEffectRange = trigger.value as "Local" | "Global";
  });
}

// Listen plugin.ts messages
window.addEventListener("message", (event) => {
  const message: IPluginMessage = event.data;
  if (message.type == "build_initial_ui") {
    const librariesReferences: IPenpotReference[] = event.data.data;

    const originLibraryDropdown = document.getElementById(
      "origin_library",
    ) as HTMLSelectElement | null;
    if (originLibraryDropdown) {
      constructDropdown(originLibraryDropdown, librariesReferences);
    }

    // Target library
    const targetLibraryDropdown = document.getElementById(
      "target_library",
    ) as HTMLSelectElement | null;
    if (targetLibraryDropdown) {
      constructDropdown(targetLibraryDropdown, librariesReferences);
    }
  }

  if (message.type == "build_palette_dropdown") {
    if (!message.data || !(message.data instanceof Array)) {
      return;
    }

    const paletteReferences: IPenpotReference[] = message.data;
    const parent = message.from;

    const targetDropdown = (
      parent == "Origin"
        ? document.getElementById("origin_palette")
        : document.getElementById("target_palette")
    ) as HTMLSelectElement | null;

    if (targetDropdown) {
      constructDropdown(targetDropdown, paletteReferences);
    }
  }

  // Restore UI after swapping
  if (message.type == "finished_swapping") {
    const shouldEnableRevertButton = message.extra as boolean;

    // Enable UI
    changeUIMode(shouldEnableRevertButton, "");
  }

  if (message.type == "theme_change")
    document.body.dataset.theme = event.data.theme;
});

sendMessageToPenpot({ type: "view-will-build" });

function sendMessageToPenpot(message: IPluginMessage) {
  parent.postMessage(message, "*");
}

function assignValueFromDropdown(
  selector: "Origin" | "Target",
  type: "Palette" | "Library",
  value: IPenpotReference | undefined,
) {
  if (selector == "Origin" && type == "Library") {
    selectedOriginLibrary = value;
  } else if (selector == "Origin" && type == "Palette") {
    selectedOriginPalette = value;
  } else if (selector == "Target" && type == "Library") {
    selectedTargetLibrary = value;
  } else if (selector == "Target" && type == "Palette") {
    selectedTargetPalette = value;
  }
}
