// Run: node generate-icons.js
// Generates placeholder PNG icons for the Chrome extension

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Dark background
  ctx.fillStyle = "#09090b";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();

  // Teal "ic" text
  ctx.fillStyle = "#00D4C8";
  ctx.font = `bold ${Math.round(size * 0.45)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ic", size / 2, size / 2 + 1);

  const buf = canvas.toBuffer("image/png");
  fs.writeFileSync(path.join(__dirname, "icons", `icon${size}.png`), buf);
  console.log(`Created icon${size}.png`);
});
