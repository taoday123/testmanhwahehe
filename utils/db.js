const fs = require("fs");

const dbPath = "./data/database.json";

function readDB() {
  return JSON.parse(fs.readFileSync(dbPath));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
