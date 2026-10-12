const fs = require("fs"),
  path = require("path"),
  sharp = require("sharp");
const plain = new Set([
  "1380:4922",
  "1380:4934",
  "507:762",
  "509:766",
  "1380:5203",
  "1380:6393",
  "1380:6345",
  "1380:5769",
  "I1380:6451;861:4473",
  "I1380:6451;861:4477",
]);
const root = path.resolve(__dirname, "../design-reference/brush-ring-figma");
(async () => {
  const out = [];
  for (const f of fs
    .readdirSync(root)
    .filter((x) => x.startsWith("native-") && x.endsWith(".json"))) {
    const j = JSON.parse(fs.readFileSync(path.join(root, f), "utf8")),
      buf = Buffer.from(j.rgba, "base64");
    const png = path.join(root, f.replace(".json", "-normals.png"));
    await sharp(buf, {
      raw: { width: j.stripWidth, height: j.stripHeight, channels: 4 },
    })
      .png()
      .toFile(png);
    const { data: d, info } = await sharp(png)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rows = [];
    for (let y = 0; y < info.height; y++) {
      const row = [];
      for (let x = 0; x < info.width; x++)
        row.push([
          ...d.subarray((y * info.width + x) * 4, (y * info.width + x) * 4 + 4),
        ]);
      const outer = row.findIndex((v) => v[3] >= 250);
      if (outer < 0) {
        rows.push({ ...j.lines[y], valid: false });
        continue;
      }
      const limit = Math.min(row.length, outer + 36);
      let texture = -1;
      for (let k = outer; k < limit; k++) {
        if (
          !plain.has(j.id) &&
          row[k][3] >= 250 &&
          Math.min(...row[k].slice(0, 3)) < 254
        ) {
          texture = k;
          break;
        }
      }
      const uniform = texture < 0;
      const ring = uniform ? 0 : (texture - outer) * 0.5;
      rows.push({
        ...j.lines[y],
        valid: true,
        outer: j.start + outer * 0.5,
        inner: texture < 0 ? null : j.start + texture * 0.5,
        ring,
        uniform,
      });
    }
    const values = rows
        .filter((x) => x.valid)
        .map((x) => x.ring)
        .sort((a, b) => a - b),
      q = (p) =>
        values[Math.min(values.length - 1, Math.floor(values.length * p))];
    const result = {
      id: j.id,
      sections: values.length,
      median:
        (values[Math.floor((values.length - 1) / 2)] +
          values[Math.floor(values.length / 2)]) /
        2,
      sideMedians: Object.fromEntries(
        ["top", "right", "bottom", "left"].map((s) => {
          const a = rows
            .filter((x) => x.valid && x.side === s)
            .map((x) => x.ring)
            .sort((a, b) => a - b);
          return [s, (a[2] + a[3]) / 2];
        }),
      ),
      mode: plain.has(j.id)
        ? "однотонный фон без внутреннего кольца"
        : "переход к текстуре или заливке",
      p10: q(0.1),
      p90: q(0.9),
      min: values[0],
      max: values.at(-1),
      rows,
      source: f,
      normalImage: png,
    };
    out.push(result);
    console.log(
      j.id,
      values.length,
      result.median,
      q(0.1),
      q(0.9),
      values.at(-1),
    );
  }
  fs.writeFileSync(
    path.resolve(root, "../brush-ring-native-results.json"),
    JSON.stringify(
      {
        scale: 2,
        edgeAlpha: 250,
        textureRGB: 254,
        method:
          "sharp: 24 нормали (6 на сторону), шаг 0.5 px; внешний край alpha>=250, внутренняя текстура min(RGB)<254; однотонная заливка без внутренней границы = 0",
        results: out,
      },
      null,
      2,
    ),
  );
})();
