// Run: node scripts/generate-icons.mjs
// Generates placeholder SVG icons for PWA

import { writeFileSync } from "fs";

function makeSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="#1e40af"/>
  <text x="50%" y="55%" font-family="Arial,sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">S</text>
</svg>`;
}

writeFileSync("public/icons/icon-192.svg", makeSVG(192));
writeFileSync("public/icons/icon-512.svg", makeSVG(512));
console.log("Icons generated (SVG). Convert to PNG for production use.");
