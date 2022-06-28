"use strict";

const MAX_NUM_BLENDS = 10;
const COPIED_STATUS_TIMEOUT_SEC = 2;

const modal = document.querySelector(".new-blend");
const confirmation = document.querySelector(".confirmation");
const overlay = document.querySelector(".overlay");

const btnNewBlend = document.querySelector(".btn-show-new-blend");
const btnDeleteAllBlends = document.querySelector(".btn-delete-all-blends");

const btnDeleteYes = document.querySelector(".btn-yes");
const btnDeleteNo = document.querySelector(".btn-no");

const bottleCount = document.querySelector(".bottle-count");
const bottleCountNum = document.querySelector(".bottle-count-num");
const bottleCountSubtract = document.querySelector(".bottle-count-subtract");
const bottleCountAdd = document.querySelector(".bottle-count-add");

const blendList = document.querySelector(".blend-list");

const elNumFlavors = document.querySelector(".num-flavors");
const elFlavorOptions = document.querySelector(".flavor-options");

const btnCancelBlend = document.querySelector(".btn-cancel-new-blend");
const btnPrintBlend = document.querySelector(".btn-print-new-blend");
const btnSubmitBlend = document.querySelector(".btn-submit-new-blend");

const flavorChoices = {
  Fruit: [
    "Banana",
    "Blueberry",
    "Cantaloupe",
    "Cherry",
    "Coconut",
    "Grape",
    "Lemon",
    "Mango",
    "Orange",
    "Peach",
    "Pear",
    "Pineapple",
    "Raspberry",
    "Red Apple",
    "Strawberry",
    "Tropical Escape",
    "Watermelon",
  ],
  Candy: [
    "Blue Razz",
    "Cotton Candy",
    "Gummy",
    "Rainbow Drops",
    "Red Hot Cinnamon",
  ],
  Tobacco: [
    "Cigar",
    "Classic Tobacco",
    "Clove",
    "Red Tobacco",
    "RY4",
    "Sahara Gold Tobacco",
    "Shisha",
  ],
  Menthol: ["Fresh Mint", "Menthol Freeze", "Mighty Menthol", "Peppermint"],
  Drinks: [
    "Amaretto",
    "Appletini",
    "Bourbon",
    "Chai",
    "Champagne",
    "Cola",
    "Egg Nog",
    "Energy Drink",
    "Espresso",
    "Green Tea",
    "Java",
    "Mojito",
    "Rum",
  ],
  Dessert: [
    "Butter Pecan",
    "Cake",
    "Cheesecake",
    "Chocolate Delight",
    "Condensed Milk",
    "Cookie",
    "Creme de la Creme",
    "Custard",
    "Dulce De Leche",
    "Fruity Cereal",
    "Gingerbread",
    "Glazed Donut",
    "Graham Cracker",
    "Hazelnut",
    "Ice Cream",
    "Maple Syrup",
    "Marshmallow",
    "Peanut Butter",
    "Pie Crust",
    "Sinfully Cinnamon",
    "Smooth Chocolate",
    "Toffee",
    "Vanilla",
    "Waffle",
  ],
};

const state = {
  blends: [],
  currentBlend: {},
};

const createNewBlend = function () {
  return {
    bottleCount: 1,
    flavors: [],
  };
};

const getBlends = function () {
  const blends = localStorage.getItem("blends");
  return JSON.parse(blends) ?? [];
};

const setBlends = function () {
  localStorage.setItem("blends", JSON.stringify(state.blends));
};

const findBlend = function (id) {
  const blend = state.blends.find((blend) => blend.id === id);
  const index = state.blends.findIndex((blend) => blend.id === id);
  return { blend, index };
};

const addToBlendList = function (blend) {
  const html = generateBlendListItemMarkup(blend.blendString, blend.id);
  blendList.insertAdjacentHTML("afterbegin", html);
  addBlendListEventListeners(blend);
};

const updateBlendListItem = function (blend) {
  const listItem = blendList.querySelector(
    `[data-blend-id="${blend.id}"] .blend-string`
  );
  listItem.textContent = blend.blendString;
};

const runBlendListAction = function (action, id) {
  const { blend, index } = findBlend(id);
  switch (action) {
    case "copy":
      copyBlendString(blend);
      break;
    case "edit":
      editBlend(blend);
      break;
    case "print":
      printBlend(blend);
      break;
    case "delete":
      deleteBlend(index);
      break;
  }
};

const displayBlendList = function (blends) {
  blendList.innerHTML = "";
  blends.forEach((blend) => addToBlendList(blend));
};

const copyBlendString = function (blend) {
  navigator.clipboard.writeText(blend.blendString).then(
    () => displayCopiedStatus(blend.id, "Blend copied!"),
    () =>
      displayCopiedStatus(blend.id, "Could not copy blend. Please try again.")
  );
};

const displayCopiedStatus = function (id, message) {
  const elBlendString = document.querySelector(
    `[data-blend-id="${id}"] .blend-string`
  );
  elBlendString.insertAdjacentHTML(
    "beforeend",
    `<span class="copied-status">${message}</span>`
  );
  setTimeout(
    () => elBlendString.querySelector(".copied-status").remove(),
    COPIED_STATUS_TIMEOUT_SEC * 1000
  );
};

const editBlend = function (blend) {
  state.currentBlend = blend;
  displayBlendModal(state.currentBlend);
};

const printBlend = function (blend) {
  downloadLabel(blend);
};

const deleteBlend = function (index) {
  state.blends.splice(index, 1);
  setBlends();
  displayBlendList(state.blends);
};

// TODO: change random string for label printing, labels don't print with this random string. Check how the files are downloaded by Magento. Previous random string method was working.
// const generateRandomString = function (length = 16) {
//   // characters to be included in the random string
//   const chars =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

//   // generate the random string
//   let str = "";
//   for (let i = 0; i < length; i++)
//     str += chars[Math.floor(Math.random() * chars.length)];
//   return str;
// };
const generateRandomString = function (length = 14) {
  return Math.random().toString(16).substring(2, length);
};

// download a label file to be automatically printed by a store computer
const downloadLabel = function (blend) {
  const blob = new Blob([blend.printString]);
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;

  // download a new file for the number of bottles specified
  for (let i = 1; i <= blend.bottleCount; i++) {
    link.download = `label-${generateRandomString()}.lbl`;
    link.click();
  }
};

const getNumFlavors = function () {
  return +elNumFlavors.value;
};

const generateBlendListItemMarkup = function (blendString, id) {
  return `
  <li class="blend-list-item" data-blend-id="${id}">
    <span class="blend-string">${blendString}</span>
    <div class="btns-flex btns-blend-list">
      <button class="btn btn-copy-blend" data-action="copy">Copy</button>
      <button class="btn btn-edit-blend" data-action="edit">Edit</button>
      <button class="btn btn-print-blend" data-action="print">Print</button>
      <button class="btn btn-remove-blend" data-action="delete">Delete</button>
    </div>
  </li>
`;
};

const generateNumFlavorsMarkup = function (numFlavors) {
  return `
    <option selected value="">Select number of flavors</option>
    <option ${numFlavors === 1 ? "selected" : ""} value="1">1</option>
    <option ${numFlavors === 2 ? "selected" : ""} value="2">2</option>
    <option ${numFlavors === 3 ? "selected" : ""} value="3">3</option>
  `;
};

const generateFlavorOptionsMarkup = function (
  selectedFlavor,
  flavorsToExclude
) {
  return `
    <select class="flavor-option">
      <option selected value="">Select a flavor</option>
      ${Object.keys(flavorChoices).reduce(
        (html, category) =>
          `${html}
          <optgroup label="${category}">
          ${flavorChoices[category].reduce(
            (html, flavor) =>
              flavorsToExclude.includes(flavor)
                ? html
                : `${html}
              <option ${
                selectedFlavor === flavor ? "selected" : ""
              } value="${flavor}">${flavor}</option>`,
            ""
          )}
          </optgroup>`,
        ""
      )}
    </select>
  `;
};

const generateFlavorShotsMarkup = function (
  numFlavors,
  numShots,
  includeDouble = true
) {
  return `
    <select class="flavor-num-shots">
      <option selected value="">Select number of shots</option>
      <option ${
        numFlavors === 3 || numShots === 1 ? "selected" : ""
      } value="1">Single shot</option>
      ${
        numFlavors <= 2 && includeDouble
          ? `<option ${
              numShots === 2 ? "selected" : ""
            } value="2">Double shot</option>`
          : ""
      }
      ${
        numFlavors === 1
          ? `<option ${
              numShots === 3 ? "selected" : ""
            } value="3">Triple shot</option>`
          : ""
      }
    </select>
  `;
};

const displayNumFlavorsOptions = function (numFlavors) {
  elNumFlavors.innerHTML = generateNumFlavorsMarkup(numFlavors);
};

const displayFlavorOptions = function (flavors) {
  const numFlavors = getNumFlavors();

  // clear flavor options before putting in new ones
  if (numFlavors) elFlavorOptions.classList.remove("hidden");
  else elFlavorOptions.classList.add("hidden");

  let html = "";
  for (let i = 0; i < numFlavors; i++) {
    // get the number of shots and the flavor of the current index if there are any
    const shots = flavors[i] ? +flavors[i][0] : 0;
    const flavor = flavors[i] ? flavors[i][1] : "";

    // exclude flavors from the list of flavor options if they are in the flavors array and neither is the current flavor
    const flavorsToExclude = flavors
      .filter((flav) => flav[1] !== flavor)
      .map((flav) => flav[1]);

    // determine if a double shot selection should be included by seeing if the flavor that is not the current flavor is listed as a double shot
    // only matter if numFlavors is 2
    const doubleShotIndex = flavors.findIndex((flavor) => +flavor[0] === 2);
    const includeDouble = doubleShotIndex < 0 || doubleShotIndex === i;

    html += `
      <li class="flavor-option-${i + 1}">
        ${generateFlavorOptionsMarkup(flavor, flavorsToExclude)}
        ${generateFlavorShotsMarkup(numFlavors, shots, includeDouble)}
      </li>
    `;
  }
  elFlavorOptions.innerHTML = html;
};

// show or hide the confirmation window
const toggleConfirmation = function () {
  overlay.classList.toggle("hidden");
  confirmation.classList.toggle("hidden");
};

// show or hide the new blend modal window
const toggleModal = function () {
  overlay.classList.toggle("hidden");
  modal.classList.toggle("hidden");
};

const displayBlendModal = function (blend) {
  bottleCountNum.textContent = blend.bottleCount;
  displayNumFlavorsOptions(blend.flavors.length);
  displayFlavorOptions(blend.flavors);
  toggleModal();
};

// change the bottle count
// the bottle count cannot be less than 1
const changeBottleCount = function (change) {
  const newCount = state.currentBlend.bottleCount + change || 1;
  state.currentBlend.bottleCount = newCount;
  bottleCountNum.textContent = state.currentBlend.bottleCount;
};

const createBlendStrings = function (blend) {
  if (!blend.flavors.length) return;
  const printString = blend.flavors
    .map((flavor) => (flavor[0] ? flavor.join(" ") : flavor[1]))
    .join("|");
  const blendString = `${blend.bottleCount} x (${blend.flavors
    .map((flavor) => (flavor[0] ? flavor.join(" ") : flavor[1]))
    .join(" - ")})`;

  return { printString, blendString };
};

const setFlavors = function () {
  const flavorOptions = Array.from(elFlavorOptions.querySelectorAll("li"));
  state.currentBlend.flavors = flavorOptions.map((option) => {
    const shots = option.querySelector(".flavor-num-shots").value;
    const flavor = option.querySelector(".flavor-option").value;
    return [shots, flavor];
  });
};

const checkFlavorOptions = function () {
  let correct = true;
  const flavorOptions = Array.from(elFlavorOptions.querySelectorAll("select"));
  if (!flavorOptions.length) return false;
  flavorOptions.forEach((option) => {
    if (!option.value) {
      correct = false;
      const sibling = option.nextElementSibling;
      if (!sibling?.classList.contains("incomplete-input"))
        option.insertAdjacentHTML(
          "afterend",
          `<p class="incomplete-input">Please select an option</p>`
        );
    }
  });
  return correct;
};

const submitBlend = function () {
  if (!checkFlavorOptions()) return;
  setFlavors();
  const blendStrings = createBlendStrings(state.currentBlend);
  state.currentBlend.printString = blendStrings.printString;
  state.currentBlend.blendString = blendStrings.blendString;
  if (state.currentBlend?.id && findBlend(state.currentBlend.id)) {
    const { index } = findBlend(state.currentBlend.id);
    state.blends[index] = state.currentBlend;
    updateBlendListItem(state.currentBlend);
  } else {
    state.currentBlend.id = generateRandomString(32);
    state.blends.push(state.currentBlend);
    if (state.blends.length > MAX_NUM_BLENDS) {
      state.blends.shift();
      displayBlendList(state.blends);
    } else {
      addToBlendList(state.currentBlend);
    }
  }
  setBlends();
  toggleModal();
  copyBlendString(state.currentBlend);
};

// Event listeners
btnNewBlend.addEventListener("click", function () {
  state.currentBlend = createNewBlend();
  displayBlendModal(state.currentBlend);
});

btnDeleteAllBlends.addEventListener("click", toggleConfirmation);

btnDeleteYes.addEventListener("click", function () {
  state.currentBlend = createNewBlend();
  state.blends = [];
  setBlends();
  displayBlendList(state.blends);
  toggleConfirmation();
});

btnDeleteNo.addEventListener("click", toggleConfirmation);

bottleCount.addEventListener("click", function (e) {
  const btn = e.target.closest(".bottle-count-change");
  if (!btn) return;
  const change = +btn.dataset.bottleChange;
  changeBottleCount(change);
});

elNumFlavors.addEventListener("change", function () {
  displayFlavorOptions(state.currentBlend.flavors);
});

elFlavorOptions.addEventListener("change", function (e) {
  const sibling = e.target.nextElementSibling;
  if (sibling?.classList.contains("incomplete-input")) sibling.remove();

  setFlavors();
  displayFlavorOptions(state.currentBlend.flavors);
});

btnCancelBlend.addEventListener("click", function () {
  state.currentBlend = createNewBlend();
  toggleModal();
});

btnPrintBlend.addEventListener("click", function () {
  state.currentBlend.printString = createBlendStrings(state.currentBlend);
  downloadLabel(state.currentBlend);
});

btnSubmitBlend.addEventListener("click", submitBlend);

const addBlendListEventListeners = function (blend) {
  const blendListItem = blendList.querySelector(
    `[data-blend-id="${blend.id}"]`
  );
  const blendString = blendListItem.querySelector(".blend-string");
  const blendBtns = blendListItem.querySelector(".btns-blend-list");

  blendString.addEventListener("click", function () {
    copyBlendString(blend);
  });
  blendBtns.addEventListener("click", function (e) {
    const action = e.target.closest(".btn").dataset.action;
    runBlendListAction(action, blend.id);
  });
};

// Page initialization
const init = function () {
  state.blends = getBlends();
  state.currentBlend = createNewBlend();
  displayBlendList(state.blends);
};
init();
