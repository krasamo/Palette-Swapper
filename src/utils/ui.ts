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

export function changeUIMode(enableRevert: boolean) {
  toggleSpinner();
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
