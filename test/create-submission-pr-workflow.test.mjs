import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

test("create-submission-pr workflow auto-merges approved submissions", async () => {
  const workflow = await fs.readFile(
    path.join(
      process.cwd(),
      ".github",
      "workflows",
      "create-submission-pr.yml",
    ),
    "utf8",
  );

  assert.match(workflow, /name: Merge pull request/);
  assert.match(workflow, /created and merged/i);
});
