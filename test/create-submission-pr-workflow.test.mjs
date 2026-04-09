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
      "process-approved-submission.yml",
    ),
    "utf8",
  );

  assert.match(workflow, /name: Process Approved Submission/);
  assert.doesNotMatch(workflow, /workflows: write/);
  assert.match(workflow, /name: Create remote branch reference/);
  assert.match(workflow, /github\.rest\.git\.createRef/);
  assert.match(workflow, /git push origin HEAD:"\$\{branch\}"/);
  assert.match(workflow, /name: Merge pull request/);
  assert.match(workflow, /created and merged/i);
});
