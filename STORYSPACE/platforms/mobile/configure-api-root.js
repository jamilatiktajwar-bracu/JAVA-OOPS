const fs = require("node:fs");
const path = require("node:path");

const htmlPath = path.join(__dirname, "../../web/index.html");
const configured = String(process.env.STORYSPACE_API_ROOT || "").trim();
let html = fs.readFileSync(htmlPath, "utf8");
const metaPattern = /<meta\s+name="storyspace-api-root"\s+content="[^"]*"\s*\/?>/i;

if (!metaPattern.test(html)) {
  throw new Error('Missing <meta name="storyspace-api-root"> in web/index.html');
}

if (!configured) {
  console.warn("STORYSPACE_API_ROOT is unset; native sign-in will remain disabled until an HTTPS API endpoint is configured.");
  process.exit(0);
}

let url;
try {
  url = new URL(configured);
} catch {
  throw new Error("STORYSPACE_API_ROOT must be a valid absolute URL.");
}
if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
  throw new Error("STORYSPACE_API_ROOT must be HTTPS and must not contain credentials, query parameters, or a fragment.");
}
const apiRoot = url.href.replace(/\/+$/, "").replace(/&/g, "&amp;");
html = html.replace(metaPattern, '<meta name="storyspace-api-root" content="' + apiRoot + '">');
fs.writeFileSync(htmlPath, html);
console.log("Configured Storyspace API endpoint: " + url.origin);
