import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  isOfficeOpen,
  officeHours,
  openingHoursSchema,
  parseOfficeHoursLine,
} from "../src/lib/office-hours.mjs";
import { officeHourLines, officeSchedule } from "../src/data/office-hours.mjs";
import { ContentStorage } from "../server/admin-content.mjs";

test("office hours: weekday, Saturday and Sunday boundaries use the office timezone", () => {
  for (let day = 2; day <= 6; day++) {
    const periods = officeSchedule();
    const utc = (time) => new Date(`2026-11-0${day}T${time}:00Z`);
    assert.equal(isOfficeOpen(utc("00:00"), periods), true); // 09:00 Asia/Yakutsk
    assert.equal(isOfficeOpen(utc("08:59"), periods), true);
    assert.equal(isOfficeOpen(utc("09:00"), periods), false);
    assert.equal(
      isOfficeOpen(new Date(`2026-11-0${day - 1}T23:59:00Z`), periods),
      false,
    );
  }
  for (const [time, expected] of [
    ["00:59", false],
    ["01:00", true],
    ["05:59", true],
    ["06:00", false],
  ]) {
    assert.equal(
      isOfficeOpen(new Date(`2026-11-07T${time}:00Z`), officeSchedule()),
      expected,
    );
  }
  assert.equal(
    isOfficeOpen(new Date("2026-11-08T03:00:00Z"), officeSchedule()),
    false,
  );
});

test("office hours: edited captions drive status and schema, including closed days", () => {
  const periods = officeHours(["Пн‑Пт с 10:30 до 19:15", "Сб — выходной"]);
  assert.equal(isOfficeOpen(new Date("2026-11-05T01:29:00Z"), periods), false);
  assert.equal(isOfficeOpen(new Date("2026-11-05T01:30:00Z"), periods), true);
  assert.equal(isOfficeOpen(new Date("2026-11-05T10:15:00Z"), periods), false);
  assert.equal(isOfficeOpen(new Date("2026-11-07T03:00:00Z"), periods), false);
  assert.deepEqual(openingHoursSchema(periods), [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:30",
      closes: "19:15",
    },
  ]);
  assert.deepEqual(parseOfficeHoursLine("Пн,Ср,Пт 9:00–18:00").days, [1, 3, 5]);
});

test("office hours: malformed days, time and unsupported overnight ranges are rejected", () => {
  for (const value of [
    "Когда удобно",
    "Пн‑Пт 25:00–26:00",
    "Пн 09:60–18:00",
    "Сб 15:00–10:00",
    "Вс-Пн 09:00–18:00",
    "Сб 10:00–10:00",
  ]) {
    assert.throws(() => parseOfficeHoursLine(value));
  }
  assert.doesNotThrow(() => officeSchedule());
});

test("office hours: CMS retains IDs, validates saves and resets to the same defaults", async () => {
  const root = await mkdtemp(join(tmpdir(), "monopoly-hours-"));
  const storage = new ContentStorage(root);
  try {
    const id = "site-footer.text.8";
    await storage.save({
      baseRevision: 0,
      changes: { [id]: "Пн-Пт с 10:30 до 19:15" },
    });
    const stored = await storage.read();
    assert.equal(stored.revision, 1);
    const periods = officeHours([stored.overrides[id], officeHourLines()[1]]);
    assert.equal(openingHoursSchema(periods)[0].opens, "10:30");
    await assert.rejects(
      storage.save({ baseRevision: 1, changes: { [id]: "Пн-Пт 99:00-18:00" } }),
      (error) => error.status === 422,
    );
    assert.equal((await storage.read()).revision, 1);
    await storage.save({ baseRevision: 1, changes: { [id]: null } });
    assert.deepEqual((await storage.read()).overrides, {});
  } finally {
    await storage.close();
    await rm(root, { recursive: true, force: true });
  }
});
