#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "@astrojs/compiler-rs";
import rules from "./typograf/rules.cjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
if (!write && !process.argv.includes("--dry-run"))
  throw new Error("Укажите --dry-run или --write");
const exceptions = JSON.parse(
  fs.readFileSync(
    path.join(root, "scripts/typograf/figma-exceptions.json"),
    "utf8",
  ),
);
const visible = new Set(
  "title description label placeholder alt aria-label text question answer list lists caption note annotation badge address city cities cta ctaLabel buttonLabel formText missionAccent missionText missionTitle role name bank unit time situation checks facts stats steps columns benefitColumns actions options programs mortgage reviews homeLogos pricePerMeter ours others intro heading subtitle lead consent components".split(
    " ",
  ),
);
const forbidden =
  /^(?:subject|business|schema|jsonLd|structuredData|data-.*|href|src|id|class|style|node|value|email|telephone|accent|accentLine)$/;
const protects = [
  /\bhttps?:\/\/[^\s"'<>)\]]+/g,
  /\d{1,4}:\d{1,4}/g,
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,
  /[A-Za-z]+(?:['’-][A-Za-z]+)*(?:[ \t]+[A-Za-z]+(?:['’-][A-Za-z]+)*)*/g,
  /<[^>]+>/g,
];
const decode = (s) =>
  s
    .replace(/&nbsp;/g, "\u00a0")
    .replace(/&quot;/g, '"')
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_, h, d) =>
      String.fromCodePoint(parseInt(h || d, h ? 16 : 10)),
    );
const changes = [];
const skipped = [];
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : /\.(astro|ts)$/.test(e.name)
          ? [path.join(dir, e.name)]
          : [],
    );
}
function correctionTypes(edit) {
  const types = [];
  const count = (s, pattern) => (s.match(pattern) || []).length;
  if (count(edit.old, /\u00a0/g) !== count(edit.next, /\u00a0/g))
    types.push("НБСП");
  if (count(edit.old, /[—–‑]/g) !== count(edit.next, /[—–‑]/g))
    types.push("тире/дефисы");
  if (count(edit.old, /[«»„“]/g) !== count(edit.next, /[«»„“]/g))
    types.push("кавычки");
  if (count(edit.old, /…/g) !== count(edit.next, /…/g))
    types.push("многоточие");
  if (/[^\S\n]{2,}|\n/.test(edit.old) && edit.kind === "text")
    types.push("пробелы исходника");
  return types.length ? types : ["нормализация текста"];
}
function processFile(file) {
  const rel = path.relative(root, file);
  const st = fs.statSync(file);
  if (write && Date.now() - st.mtimeMs < 120000) {
    skipped.push(rel);
    return;
  }
  // Синхронное read → parse → modify → write, без await и внешних команд.
  const raw = fs.readFileSync(file, "utf8");
  const astro = file.endsWith(".astro");
  const prefix = astro ? "" : "---\n";
  const ast = parse(astro ? raw : prefix + raw + "\n---\n").ast;
  const offset = prefix.length;
  const edits = [];
  function edit(start, end, value, kind) {
    start -= offset;
    end -= offset;
    if (start < 0 || end > raw.length) return;
    const old = raw.slice(start, end);
    if (!/[А-Яа-яЁё]/.test(value) && !/^\s*(?:\+7|8)[\s(\d]/.test(value))
      return;
    const protection = exceptions.find(
      (e) => e.file === rel && (e.original === old || e.output === old),
    );
    if (protection) {
      if (old === protection.output || protection.output === undefined) return;
      edits.push({
        start,
        end,
        old,
        next: protection.output,
        kind,
        value,
        formatted: protection.output,
      });
      return;
    }
    let lead = "",
      tail = "",
      body = value;
    if (kind === "text") {
      lead = body.match(/^\s*/)[0];
      tail = body.match(/\s*$/)[0];
      body = body
        .slice(lead.length, body.length - tail.length || undefined)
        .replace(/[ \t]*\n[ \t]*/g, " ");
    }
    body = decode(body);
    const out = rules.typografizeProtected(body, {}, protects);
    let next = lead + out + tail;
    if (kind === "attribute")
      next = next
        .replace(/&(?!(?:[a-z]+|#\d+|#x[\da-f]+);)/gi, "&amp;")
        .replace(/"/g, "&quot;");
    if (kind === "literal") {
      const quote = raw[start];
      next =
        quote +
        next
          .replace(/\\/g, "\\\\")
          .replace(new RegExp(quote, "g"), "\\" + quote)
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r") +
        quote;
    }
    if (next !== old) {
      edits.push({ start, end, old, next, kind, value, formatted: out });
    }
  }
  function walk(n, key = "", mode = "code") {
    if (!n || typeof n !== "object") return;
    if (
      [
        "ImportDeclaration",
        "ExportAllDeclaration",
        "TSLiteralType",
        "TSTypeAliasDeclaration",
        "TSInterfaceDeclaration",
      ].includes(n.type)
    )
      return;
    if (n.type === "VariableDeclarator") {
      const name = n.id.name;
      if (forbidden.test(name || "")) return;
      walk(n.init, name || key, mode);
      if (n.id.type === "ObjectPattern") walk(n.id, key, mode);
      return;
    }
    if (n.type === "Property") {
      const name = n.key.name ?? n.key.value ?? key;
      if (forbidden.test(String(name))) return;
      walk(n.value, String(name), mode);
      return;
    }
    if (n.type === "AssignmentPattern") {
      const name = n.left.name || key;
      if (forbidden.test(name)) return;
      walk(n.right, name, mode);
      return;
    }
    if (n.type === "JSXElement") {
      const tag = n.openingElement.name.name;
      if (["script", "style"].includes(tag)) return;
      for (const a of n.openingElement.attributes || [])
        walk(a, key, "template");
      for (const c of n.children || []) walk(c, key, "template");
      return;
    }
    if (n.type === "JSXAttribute") {
      const name = n.name.name;
      if (forbidden.test(name) || !visible.has(name)) return;
      const v = n.value;
      if (v?.type === "Literal" && typeof v.value === "string")
        edit(v.start + 1, v.end - 1, v.value, "attribute");
      else walk(v, name, "expression");
      return;
    }
    if (n.type === "JSXText") {
      edit(n.start, n.end, n.raw ?? n.value, "text");
      return;
    }
    if (n.type === "Literal" && typeof n.value === "string") {
      if (visible.has(key) || mode === "expression")
        edit(n.start, n.end, n.value, "literal");
      return;
    }
    if (n.type === "JSXExpressionContainer") {
      walk(n.expression, key, "expression");
      return;
    }
    // Сложные шаблонные литералы и строковый код не переписываем.
    if (n.type === "TemplateLiteral" || n.type === "RegExpLiteral") return;
    for (const [k, v] of Object.entries(n)) {
      if (["start", "end", "loc", "range", "raw", "comments"].includes(k))
        continue;
      if (v && typeof v === "object") {
        if (Array.isArray(v)) v.forEach((x) => walk(x, key, mode));
        else walk(v, key, mode);
      }
    }
  }
  walk(ast);
  edits.sort((a, b) => b.start - a.start);
  let out = raw;
  let previous = raw.length + 1;
  for (const e of edits) {
    if (e.end > previous) throw new Error("Пересечение диапазонов: " + rel);
    out = out.slice(0, e.start) + e.next + out.slice(e.end);
    previous = e.start;
    changes.push({ file: rel, ...e });
  }
  if (out !== raw) {
    if (write) {
      if (fs.statSync(file).mtimeMs !== st.mtimeMs)
        throw new Error("Файл изменился: " + rel);
      fs.writeFileSync(file, out);
    }
    console.log(
      `${rel}: ${edits.length} (${[...new Set(edits.flatMap(correctionTypes))].join(", ")})`,
    );
  }
}
for (const file of files(path.join(root, "src")).filter(
  (f) => !f.includes("/styles/") && !f.includes("/scripts/"),
))
  processFile(file);
console.log(
  `Типографика ${write ? "запись" : "проверка"}: ${new Set(changes.map((c) => c.file)).size} файлов, ${changes.length} фрагментов. Отложено: ${skipped.length}`,
);
if (skipped.length) console.log("Недавние файлы: " + skipped.join(", "));
fs.writeFileSync(
  "/private/tmp/claude-501/typo-" + (write ? "write" : "dry") + ".json",
  JSON.stringify({ changes, skipped }, null, 2),
);
