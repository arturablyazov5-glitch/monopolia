import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
test("Pages preparation preserves CSS grid syntax and scopes asset URLs once", async () => {
  const dir = await mkdtemp(join(tmpdir(), "monopoly-pages-"));
  try {
    await mkdir(join(dir, "dist"));
    const css =
      '.grid{grid-template:"description""media""fields"/minmax(0,1fr);background:url(/assets/paper.webp)}.quoted{background:url("/assets/paper.webp")}.single{background:url(\'/assets/paper.webp\')}.external{background:url(//example.com/a)}';
    await writeFile(join(dir, "dist/test.css"), css);
    await writeFile(
      join(dir, "dist/test.html"),
      '<img src="/assets/a.webp" srcset="/assets/a.webp 1x, /assets/b.webp 2x"><a href="/buy/"><section style="--mask: url(&quot;/assets/a.webp&quot;)">',
    );
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL("./prepare-pages.mjs", import.meta.url))],
      { cwd: dir, env: { ...process.env, SITE_BASE: "/monopolia" } },
    );
    const result = await readFile(join(dir, "dist/test.css"), "utf8");
    assert.equal(result, css.replaceAll("/assets/", "/monopolia/assets/"));
    assert.equal(
      await readFile(join(dir, "dist/test.html"), "utf8"),
      '<img src="/monopolia/assets/a.webp" srcset="/monopolia/assets/a.webp 1x, /monopolia/assets/b.webp 2x"><a href="/monopolia/buy/"><section style="--mask: url(&quot;/monopolia/assets/a.webp&quot;)">',
    );
    execFileSync(
      process.execPath,
      [fileURLToPath(new URL("./prepare-pages.mjs", import.meta.url))],
      { cwd: dir, env: { ...process.env, SITE_BASE: "/monopolia" } },
    );
    assert.equal(await readFile(join(dir, "dist/test.css"), "utf8"), result);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
