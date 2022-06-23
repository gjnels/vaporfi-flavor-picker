"use strict";

const modal = document.querySelector(".new-blend");
const overlay = document.querySelector(".overlay");

const btnNewBlend = document.querySelector(".show-new-blend");

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

const flavors = {
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
    "Blue Razzle Berry",
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
    "Maple Syrup",
    "Marshmallow",
    "Peanut Butter",
    "Pie Crust",
    "Sinfully Cinnamon",
    "Smooth Chocolate",
    "Toffee",
    "Vanilla Bean Ice Cream",
    "Very Vanilla",
    "Waffle",
  ],
};

const newBlend = {
  bottleCount: 1,
  flavors: [],
};

const getBlends = function () {
  const blends = localStorage.getItem("blends");
  return JSON.parse(blends) ?? [];
};

const setBlends = function () {
  localStorage.setItem("blends", JSON.stringify(blends));
};

const addToBlendList = function (blend, index) {
  const html = `
    <li class="blend-string" data-blend-num="${index}">
      ${blend.blendString}
    </li>
    <li class="blend-btns" data-blend-num="${index}">
      <button class="btn btn-edit-blend" data-action="edit">Edit</button>
      <button class="btn btn-print-blend" data-action="print">Print</button>
      <button class="btn btn-remove-blend" data-action="delete">Delete</button>
    </li>
  `;

  blendList.insertAdjacentHTML("afterbegin", html);
  blendList
    .querySelector(".blend-btns")
    .addEventListener("click", function (e) {
      const btn = e.target.closest(".btn");
      const action = btn.dataset.action;
      const index = e.target.closest(".blend-btns").dataset.blendNum;
      console.log(`${action} for blend ${index}`);
    });
};

const blends = getBlends();

blends.forEach((blend, index) => addToBlendList(blend, index));

const generateRandomString = (length = 16) =>
  Math.random().toString(16).substring(2, length);

// download a label file to be automatically printed by a store computer
const downloadLabel = function (blend = "1 Strawberry|2 Watermelon") {
  const blob = new Blob([blend]);
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;

  // download a new file for the number of bottles specified
  for (let i = 1; i <= newBlend.bottleCount; i++) {
    link.download = `label-${generateRandomString()}.lbl`;
    link.click();
  }
};

const resetNewBlend = function () {
  newBlend.bottleCount = 1;
  newBlend.flavors = [];
};

const resetNumFlavors = function (numFlavors = 0) {
  const html = `
    <option disabled ${
      numFlavors === 0 ? "selected" : ""
    } value="">Select number of flavors</option>
    <option ${numFlavors === 1 ? "selected" : ""} value="1">1</option>
    <option ${numFlavors === 2 ? "selected" : ""} value="2">2</option>
    <option ${numFlavors === 3 ? "selected" : ""} value="3">3</option>
  `;

  elNumFlavors.innerHTML = html;
};

const showFlavorOptions = function (numFlavors = 0) {
  // clear flavor options before putting in new ones
  if (numFlavors) elFlavorOptions.classList.remove("hidden");
  else elFlavorOptions.classList.add("hidden");

  elFlavorOptions.innerHTML = "";

  for (let i = 1; i <= numFlavors; i++) {
    const html = `
      <li class="flavor-option-${i}">
        <select class="flavor-option">
          <option selected disabled value="">Select a flavor</option>
          ${Object.entries(flavors).map(
            (category) =>
              `<optgroup label="${category[0]}">${category[1].map(
                (flavor) => `<option value="${flavor}">${flavor}</option>`
              )}</optgroup>`
          )}
        </select>
        <select class="flavor-num-shots">
          <option selected disabled value="">Select number of shots</option>
          <option ${
            numFlavors === 3 ? "selected" : ""
          } value="1">Single shot</option>
          ${numFlavors <= 2 ? `<option value="2">Double shot</option>` : ""}
          ${numFlavors === 1 ? `<option value="3">Triple shot</option>` : ""}
        </select>
      </li>
    `;

    elFlavorOptions.insertAdjacentHTML("beforeend", html);
  }
};

// show or hide the new blend modal window
const toggleModal = function () {
  bottleCountNum.textContent = newBlend.bottleCount;

  modal.classList.toggle("hidden");
  overlay.classList.toggle("hidden");
};

const setModalBtnColors = function () {
  [btnPrintBlend, btnSubmitBlend].forEach((btn) => {
    btn.style.backgroundColor = newBlend.flavors.length ? "#66a80f" : "#adb5bd";
  });
};

// change the bottle count
// the bottle count cannot be less than 1
const changeBottleCount = function (change) {
  const newCount = newBlend.bottleCount + change || 1;
  newBlend.bottleCount = newCount;
  bottleCountNum.textContent = newBlend.bottleCount;
};

const createBlendStrings = function () {
  if (!newBlend.flavors.length) return;
  const printString = newBlend.flavors
    .map((flavor) => (flavor[0] ? flavor.join(" ") : flavor[1]))
    .join("|");
  const blendString = `${newBlend.bottleCount} x (${newBlend.flavors
    .map((flavor) => (flavor[0] ? flavor.join(" ") : flavor[1]))
    .join(" - ")})`;

  return { printString, blendString };
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

/*
Event Listeners
*/
btnNewBlend.addEventListener("click", function () {
  resetNewBlend();
  resetNumFlavors();
  showFlavorOptions();
  toggleModal();
});

bottleCount.addEventListener("click", function (e) {
  const btn = e.target.closest(".bottle-count-change");
  if (!btn) return;
  const change = +btn.dataset.bottleChange;
  changeBottleCount(change);
});

elNumFlavors.addEventListener("change", function () {
  showFlavorOptions(+elNumFlavors.value);
  newBlend.flavors = [];
});

elFlavorOptions.addEventListener("change", function (e) {
  newBlend.flavors = [];

  const flavorOptions = Array.from(this.querySelectorAll("li"));

  const sibling = e.target.nextElementSibling;
  if (sibling?.classList.contains("incomplete-input")) sibling.remove();

  flavorOptions.forEach((option) => {
    const shots = option.querySelector(".flavor-num-shots").value;
    const flavor = option.querySelector(".flavor-option").value;
    newBlend.flavors.push([shots, flavor]);
  });
});

[btnCancelBlend, overlay].forEach((el) =>
  el.addEventListener("click", toggleModal)
);

btnPrintBlend.addEventListener("click", function () {
  downloadLabel(createBlendStrings().printString);
});

btnSubmitBlend.addEventListener("click", function () {
  if (!checkFlavorOptions()) return;
  const blendStrings = createBlendStrings();
  newBlend.printString = blendStrings.printString;
  newBlend.blendString = blendStrings.blendString;
  blends.push(newBlend);
  addToBlendList(newBlend, blends.length - 1);
  setBlends();
  toggleModal();
});
