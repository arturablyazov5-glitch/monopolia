const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = "/Users/rafael/Documents/trace-logos/tools/figma-plugins/typograf";
const original = fs.readFileSync(path + "/code.js", "utf8");
const start = original.indexOf(
  "'use strict';",
  original.indexOf("// RULES:START"),
);
const block =
  original.slice(start, original.indexOf("\n// RULES:END\n")) + "\n";
assert.equal(fs.readFileSync(__dirname + "/rules.cjs", "utf8"), block);
let test = fs
  .readFileSync(path + "/tests/integration.js", "utf8")
  .replace(
    "'./dp-reference.txt'",
    JSON.stringify(path + "/tests/dp-reference.txt"),
  );
// Тот же интеграционный набор, узловой код оригинала; строковый движок копии.
test = test.replace(
  "// ── Поддельная текстовая нода",
  "api.typografize = require('" +
    __dirname +
    "/rules.cjs').typografize;\n// ── Поддельная текстовая нода",
);
vm.runInNewContext(
  test,
  { require, console, process, Buffer },
  { filename: "integration-copy.cjs" },
);
console.log(
  "Копия правил побайтно совпадает с code.js; интеграционные случаи запущены на копии.",
);
