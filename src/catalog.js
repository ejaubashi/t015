export const products = [
  {
    name: "MASKING<br>TAPE",
    type: "NORMAL",
    color: "#ffcf36",
    dark: "#a78212",
    id: "masking",
    note: "Big ideas. Clean edges.",
    desc: "Your trusty creative companion. Paint, label, decorate, and peel away cleanly when the job is done.",
    use: "Painting · Crafting · Labelling",
  },
  {
    name: "DOUBLE-SIDED<br>TISSUE TAPE",
    type: "ARTS & CRAFT",
    color: "#8dcde5",
    dark: "#3b8ca8",
    id: "tissue",
    note: "Make a little magic.",
    desc: "An invisible helping hand for the things you love making. A strong, neat hold on both sides.",
    use: "Scrapbooking · Mounting · Making",
  },
  {
    name: "CLOTH<br>TAPE",
    type: "TOUGH STUFF",
    color: "#b29ae8",
    dark: "#7660a9",
    id: "cloth",
    note: "A fix for the unexpected.",
    desc: "For the little emergencies and the ambitious projects. Flexible, dependable, and ready to hold it together.",
    use: "Repairing · Binding · DIY",
  },
  {
    name: "OPP<br>TAPE",
    type: "LOW NOISE",
    color: "#d2ef60",
    dark: "#96b633",
    id: "opp",
    note: "On to your next chapter.",
    desc: "Pack up the memories and send a little happiness. A secure seal for whatever comes next.",
    use: "Packing · Moving · Sending",
  },
];
export const logo = `<span class="brand">SWEET<br>TAPE<span class="tm">™</span></span>`;
export function pack(p, cls = "") {
  return `<button class="pack ${cls}" style="--pack:${p.color};--rim:${p.dark}" data-product="${p.id}" aria-label="Explore ${p.name.replaceAll("<br>", " ")}"><span class="pack-hole"></span><span class="pack-rimtext">STICK WITH THE GOOD STUFF • SINCE 1991</span><span class="pack-label">${logo}<strong>${p.name}</strong><span class="barcode"></span><small>Little things. Strong connections.</small></span><span class="pack-type">${p.type}</span></button>`;
}
