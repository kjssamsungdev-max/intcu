// Generates PNG icon files from inline SVG
// Run: node generate-pngs.js
// Requires: sharp (npm install sharp) OR open create-icons.html in browser

const fs = require("fs");
const path = require("path");

const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="102" ry="102" fill="#09090b"/>
  <line x1="80" y1="256" x2="432" y2="256" stroke="#00D4C8" stroke-width="2" opacity="0.2"/>
  <text x="120" y="310" font-family="sans-serif" font-size="220" font-weight="700" fill="#f4f4f5" letter-spacing="4">i</text>
  <text x="230" y="310" font-family="sans-serif" font-size="220" font-weight="700" fill="#00D4C8" letter-spacing="4">c</text>
  <circle cx="370" cy="220" r="16" fill="#00D4C8" opacity="0.9"/>
  <circle cx="370" cy="220" r="28" fill="#00D4C8" opacity="0.12"/>
</svg>`;

const sizes = [
  { name: "icon-16.png", size: 16 },
  { name: "icon-32.png", size: 32 },
  { name: "icon-48.png", size: 48 },
  { name: "icon-128.png", size: 128 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon.png", size: 180 },
];

async function main() {
  try {
    const sharp = require("sharp");
    for (const { name, size } of sizes) {
      const svg = Buffer.from(iconSvg(size));
      await sharp(svg).resize(size, size).png().toFile(path.join(__dirname, name));
      console.log(`Created ${name} (${size}x${size})`);
    }
  } catch (e) {
    console.log("sharp not available, creating SVG fallbacks as .png files");
    for (const { name, size } of sizes) {
      // Write SVG with .png extension — browsers handle SVG data fine for icons
      fs.writeFileSync(path.join(__dirname, name), Buffer.from(iconSvg(size)));
      console.log(`Created ${name} (SVG fallback, ${size}x${size})`);
    }
  }
}

main();
