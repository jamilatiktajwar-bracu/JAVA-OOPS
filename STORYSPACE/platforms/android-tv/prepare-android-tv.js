const fs = require("node:fs");
const path = require("node:path");

const androidRoot = path.resolve(process.argv[2] || path.join(__dirname, "../../mobile/android"));
const manifestPath = path.join(androidRoot, "app", "src", "main", "AndroidManifest.xml");
const drawableDir = path.join(androidRoot, "app", "src", "main", "res", "drawable");
const bannerPath = path.join(drawableDir, "storyspace_tv_banner.xml");

if (!fs.existsSync(manifestPath)) {
  throw new Error("AndroidManifest.xml not found. Generate the Capacitor Android project first.");
}

let manifest = fs.readFileSync(manifestPath, "utf8");
if (!manifest.includes('android:name="android.software.leanback"')) {
  manifest = manifest.replace(
    /(\s*)<application\b/,
    '\n    <uses-feature android:name="android.software.leanback" android:required="false" />\n    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />$1<application'
  );
}
if (!manifest.includes('android:banner="@drawable/storyspace_tv_banner"')) {
  manifest = manifest.replace(/<application\b/, '<application android:banner="@drawable/storyspace_tv_banner"');
}
if (!manifest.includes('android.intent.category.LEANBACK_LAUNCHER')) {
  const launcherCategory = /(<category\s+android:name="android\.intent\.category\.LAUNCHER"\s*\/>)/;
  if (!launcherCategory.test(manifest)) {
    throw new Error("Capacitor launcher intent filter was not found; refusing to modify an unknown manifest.");
  }
  manifest = manifest.replace(
    launcherCategory,
    '$1\n                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />'
  );
}

fs.mkdirSync(drawableDir, { recursive: true });
const banner = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="320dp"
    android:height="180dp"
    android:viewportWidth="320"
    android:viewportHeight="180">
    <path android:fillColor="#080D1B" android:pathData="M0,0h320v180h-320z" />
    <path android:fillColor="#11263A" android:pathData="M176,0h144v180h-144z" />
    <path android:fillColor="#8AF4E5" android:pathData="M42,48h8v84h-8z M58,62h8v56h-8z M74,76h8v28h-8z" />
    <path android:fillColor="#8AF4E5" android:pathData="M120,56a34,34 0,1 0,0.1 0 M120,70a20,20 0,1 1,-0.1 0" />
    <path android:fillColor="#EAF7FF" android:pathData="M150,72h98v8h-98z M150,91h76v6h-76z M150,107h88v6h-88z" />
    <path android:fillColor="#376A78" android:pathData="M270,22a54,54 0,1 0,0.1 0 M270,34a42,42 0,1 1,-0.1 0" />
</vector>
`;
fs.writeFileSync(manifestPath, manifest);
fs.writeFileSync(bannerPath, banner);
console.log("Android TV launcher metadata and banner are ready.");
