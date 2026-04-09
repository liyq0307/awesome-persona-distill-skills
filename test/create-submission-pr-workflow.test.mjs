import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

test("create-approved-submission-pr workflow only creates PRs for approved submissions", async () => {
  const workflow = await fs.readFile(
    path.join(
      process.cwd(),
      ".github",
      "workflows",
      "create-approved-submission-pr.yml",
    ),
    "utf8",
  );

  assert.match(workflow, /name: Create Approved Submission PR/);
  assert.doesNotMatch(workflow, /workflows: write/);
  assert.match(workflow, /name: Create remote branch reference/);
  assert.match(workflow, /github\.rest\.git\.createRef/);
  assert.match(workflow, /git push origin HEAD:"\$\{branch\}"/);
  assert.doesNotMatch(workflow, /name: Merge pull request/);
  assert.match(workflow, /has been created for this approved submission/i);
});

test("merge-approved-submission-pr workflow merges automated PRs after CI succeeds", async () => {
  const workflow = await fs.readFile(
    path.join(
      process.cwd(),
      ".github",
      "workflows",
      "merge-approved-submission-pr.yml",
    ),
    "utf8",
  );

  assert.match(workflow, /name: Merge Approved Submission PR/);
  assert.match(workflow, /workflow_run:/);
  assert.match(workflow, /- Format/);
  assert.match(workflow, /- Link Check/);
  assert.match(workflow, /- Repository Consistency/);
  assert.match(workflow, /github\.rest\.pulls\.merge/);
  assert.match(workflow, /has been merged for this approved submission/i);
});
