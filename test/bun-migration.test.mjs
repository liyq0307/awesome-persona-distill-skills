import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const workspace = process.cwd();

async function readFile(relativePath) {
  return fs.readFile(path.join(workspace, relativePath), "utf8");
}

test("package.json declares Bun as the project package manager", async () => {
  const packageJson = JSON.parse(await readFile("package.json"));

  assert.match(packageJson.packageManager, /^bun@\d+\.\d+\.\d+$/);
  assert.equal(packageJson.engines?.bun, ">=1.2.0");
  assert.equal(packageJson.scripts?.test, "bun test");
  assert.equal(
    packageJson.scripts?.["check:consistency"],
    "bun scripts/check-repository-consistency.mjs",
  );
  assert.equal(
    packageJson.scripts?.["check:links"],
    "bun scripts/check-links.mjs",
  );
});

test("github workflows install and run Bun instead of npm", async () => {
  const workflowPaths = [
    ".github/workflows/create-approved-submission-pr.yml",
    ".github/workflows/format.yml",
    ".github/workflows/link-check.yml",
    ".github/workflows/repository-consistency.yml",
  ];

  for (const workflowPath of workflowPaths) {
    const workflow = await readFile(workflowPath);

    assert.match(workflow, /oven-sh\/setup-bun@v2/);
    assert.doesNotMatch(workflow, /actions\/setup-node@v4/);
    assert.doesNotMatch(workflow, /cache:\s*npm/);
    assert.doesNotMatch(workflow, /\bnpm ci\b/);
  }

  const formatWorkflow = await readFile(".github/workflows/format.yml");
  assert.match(formatWorkflow, /\bbun ci\b/);
  assert.match(formatWorkflow, /\bbun run format:check\b/);

  const linksWorkflow = await readFile(".github/workflows/link-check.yml");
  assert.match(linksWorkflow, /\bbun ci\b/);
  assert.match(linksWorkflow, /\bbun run check:links\b/);

  const consistencyWorkflow = await readFile(
    ".github/workflows/repository-consistency.yml",
  );
  assert.match(consistencyWorkflow, /\bbun ci\b/);
  assert.match(consistencyWorkflow, /\bbun run check:consistency\b/);

  const submissionWorkflow = await readFile(
    ".github/workflows/create-approved-submission-pr.yml",
  );
  assert.match(submissionWorkflow, /\bbun ci\b/);
  assert.match(
    submissionWorkflow,
    /\bbun scripts\/submission-automation\.mjs\b/,
  );
});

test("contributing guides document Bun-based local commands", async () => {
  const [contributingZh, contributingEn] = await Promise.all([
    readFile("CONTRIBUTING.md"),
    readFile("CONTRIBUTING.en.md"),
  ]);

  assert.match(contributingZh, /\bbun install\b/);
  assert.match(contributingZh, /\bbun run format\b/);
  assert.doesNotMatch(contributingZh, /\bnpm ci\b/);
  assert.doesNotMatch(contributingZh, /\bnpm run format\b/);

  assert.match(contributingEn, /\bbun install\b/);
  assert.match(contributingEn, /\bbun run format\b/);
  assert.doesNotMatch(contributingEn, /\bnpm ci\b/);
  assert.doesNotMatch(contributingEn, /\bnpm run format\b/);
});
