const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../medicore_data.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const js = `// MediCore Data Store Bridge
window.MEDICORE_INITIAL_DATA = ${JSON.stringify(db, null, 2)};
window.MEDICORE_STORE = JSON.parse(localStorage.getItem("medicore_cabinet_data") || "null") || window.MEDICORE_INITIAL_DATA;

window.saveMediCoreStore = function() {
  localStorage.setItem("medicore_cabinet_data", JSON.stringify(window.MEDICORE_STORE));
};
`;

const targetPath = path.join(__dirname, "../../mobile/dist/medicore-store.js");
fs.writeFileSync(targetPath, js, "utf8");
console.log("Successfully generated medicore-store.js at", targetPath);
