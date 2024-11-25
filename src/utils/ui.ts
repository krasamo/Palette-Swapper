import IPenpotReference from "../models/IPenpotReference";

export function toggleRevertButton(enabled?: boolean) {
  const revertButton = document.getElementById(
    "revert_button",
  ) as HTMLButtonElement;
  if (revertButton)
    revertButton.disabled =
      enabled != undefined ? !enabled : !revertButton.disabled;
}

export function toggleSwapButton(enabled?: boolean) {
  const swapButton = document.getElementById(
    "swap_button",
  ) as HTMLButtonElement;
  if (swapButton)
    swapButton.disabled =
      enabled != undefined ? !enabled : !swapButton.disabled;
}

export function toggleSpinner(enabled?: boolean) {
  const spinnerContainer = document.getElementById("spinner");
  if (spinnerContainer)
    if (enabled != undefined)
      spinnerContainer.style.visibility = enabled ? "visible" : "hidden";
    else
      spinnerContainer.style.visibility =
        spinnerContainer.style.visibility == "hidden" ? "visible" : "hidden";
}

export function changeUIMode(enableRevert: boolean, statusMessage: string) {
  toggleSpinner();
  changeStatusLabel(statusMessage);
  toggleSwapButton();
  toggleRevertButton(enableRevert);
}

export function constructDropdown(
  root: HTMLSelectElement,
  options: IPenpotReference[],
) {
  // Remove previous childs (keeping the initial label child)
  while (root.children.length > 1)
    if (root.lastElementChild) root.removeChild(root.lastElementChild);

  for (const option of options) {
    const newOption = document.createElement("option");
    newOption.id = option.id;
    newOption.value = option.id;
    newOption.innerHTML = option.name;

    root.appendChild(newOption);
  }
}

export function missingFieldsStatusHandler(
  selectedOriginLibrary: IPenpotReference | undefined,
  selectedOriginPalette: IPenpotReference | undefined,
  selectedTargetLibrary: IPenpotReference | undefined,
  selectedTargetPalette: IPenpotReference | undefined,
): string {
  if (!selectedOriginLibrary) {
    return "Please select an origin Library";
  } else if (!selectedOriginPalette) {
    return "Please select an origin Palette";
  } else if (!selectedTargetLibrary) {
    return "Please select an target Library";
  } else if (!selectedTargetPalette) {
    return "Please select an target Palette";
  }

  return "";
}

export function changeStatusLabel(message: string) {
  const statusLabel = document.getElementById("status_label");
  if (!statusLabel) {
    return;
  }

  if (!message) {
    statusLabel.style.visibility = "hidden";
  } else {
    statusLabel.innerHTML = message;
    statusLabel.style.visibility = "visible";
  }
}
