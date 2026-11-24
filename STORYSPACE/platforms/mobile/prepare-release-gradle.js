const fs = require("node:fs");
const path = require("node:path");

const gradlePath = path.resolve(process.argv[2] || path.join(__dirname, "android/app/build.gradle"));
if (!fs.existsSync(gradlePath)) {
  throw new Error("app/build.gradle not found. Generate the Capacitor Android project first.");
}

let gradle = fs.readFileSync(gradlePath, "utf8");
if (!gradle.includes("signingConfigs")) {
  const androidBlock = /android\s*\{/;
  if (!androidBlock.test(gradle)) throw new Error("Could not find the Android Gradle configuration block.");
  const signingBlock = [
    "",
    "    signingConfigs {",
    "        release {",
    "            storeFile file(System.getenv(\"ANDROID_KEYSTORE_PATH\"))",
    "            storePassword System.getenv(\"ANDROID_KEYSTORE_PASSWORD\")",
    "            keyAlias System.getenv(\"ANDROID_KEY_ALIAS\")",
    "            keyPassword System.getenv(\"ANDROID_KEY_PASSWORD\")",
    "        }",
    "    }",
    ""
  ].join("\n");
  gradle = gradle.replace(androidBlock, match => match + signingBlock);
}
if (!/buildTypes\s*\{[\s\S]*?release\s*\{/.test(gradle)) {
  throw new Error("Could not find the release build type in app/build.gradle.");
}
if (!/release\s*\{[\s\S]*?signingConfig\s+signingConfigs\.release/.test(gradle)) {
  gradle = gradle.replace(/(buildTypes\s*\{\s*release\s*\{)/, "$1\n            signingConfig signingConfigs.release");
}
fs.writeFileSync(gradlePath, gradle);
console.log("Android release signing config is ready.");
