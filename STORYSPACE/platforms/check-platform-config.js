const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
for (const p of ["web/manifest.webmanifest", "platforms/desktop/package.json", "platforms/mobile/package.json"]) JSON.parse(read(p));
const html = read("web/index.html");
for (const asset of ["manifest.webmanifest", "styles.css", "app.js", "assets/storyspace-icon.svg", "sw.js"]) {
  if (!html.includes(asset) && asset !== "sw.js") throw new Error("Missing HTML reference: " + asset);
}
if (!html.includes('rel="manifest"')) throw new Error("PWA manifest not linked");
if (!read("web/sw.js").includes("CACHE_NAME")) throw new Error("Service worker shell cache missing");
console.log("Platform scaffold and PWA asset checks passed.");