#!/usr/bin/env node
/**
 * Generates src/mock/fixtures.ts — pure domain data with string fields.
 *
 * Faker runs only here (Node). The app imports the emitted fixtures.
 * Re-run: node scripts/generate-mock.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { faker } from "@faker-js/faker";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "src/mock/fixtures.ts");

const SEED = 42;
faker.seed(SEED);

const THREAD_STATUSES = ["idle", "running", "needs_review", "failed", "completed"];
const FILE_STATUSES = ["added", "modified", "deleted", "renamed"];
const TOOL_NAMES = [
  "read_file",
  "search_replace",
  "run_terminal_command",
  "grep",
  "list_dir",
  "web_search",
];
const FILE_EXTS = [
  { ext: "ts", language: "typescript" },
  { ext: "tsx", language: "tsx" },
  { ext: "js", language: "javascript" },
  { ext: "css", language: "css" },
  { ext: "json", language: "json" },
  { ext: "md", language: "markdown" },
];

/** Escape a JS string for embedding in a double-quoted literal. */
function esc(s) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function toAscii(s) {
  return String(s).replace(/[^\x00-\x7F]/g, "?");
}
function b(s) {
  return `"${esc(toAscii(s))}"`;
}

let nextId = 1;
function id() {
  return nextId++;
}

function makeDiff(path, language, status) {
  const file = path.split("/").pop() ?? path;
  const lines = [
    `diff --git a/${path} b/${path}`,
    `--- a/${path}`,
    `+++ b/${path}`,
    `@@ -1,8 +1,12 @@`,
  ];
  if (status === "deleted") {
    lines.push(`-// removed ${file}`);
    lines.push(`-${faker.lorem.sentence()}`);
  } else if (status === "added") {
    lines.push(`+// ${language} module: ${file}`);
    lines.push(`+export function ${faker.hacker.verb()}() {`);
    lines.push(`+  return ${faker.number.int({ min: 1, max: 99 })};`);
    lines.push(`+}`);
  } else {
    lines.push(` import { ${faker.hacker.noun()} } from "./lib";`);
    lines.push(`-const legacy = true;`);
    lines.push(`+const enabled = true;`);
    lines.push(` `);
    lines.push(` export function handle() {`);
    lines.push(`-  return legacy ? 0 : 1;`);
    lines.push(`+  return enabled ? 1 : 0;`);
    lines.push(` }`);
  }
  return lines.join("\n");
}

function makeTool() {
  const name = faker.helpers.arrayElement(TOOL_NAMES);
  const states = ["output_available", "output_available", "requires_action", "output_error"];
  const state = faker.helpers.arrayElement(states);
  const toolId = id();
  const inputSummary = `${name} ${faker.system.fileName()}`;
  let outputSummary = "";
  let errorText = "";
  if (state === "output_available") {
    outputSummary = faker.lorem.sentence();
  }
  if (state === "output_error") {
    errorText = faker.lorem.sentence();
  }
  return { id: toolId, name, state, inputSummary, outputSummary, errorText };
}

function makeMessages(count, { forceTools = false } = {}) {
  const messages = [];
  let toolsEmitted = 0;
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? "user" : "assistant";
    // Attach tools on assistant turns often enough for the conversation pane
    // to surface tool-activity rows; force at least one when requested.
    const wantTools =
      role === "assistant" &&
      (i % 2 === 1 || (forceTools && toolsEmitted === 0 && i === count - 1) || (forceTools && i === 1));
    const tools = wantTools
      ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => makeTool())
      : [];
    if (tools.length > 0) toolsEmitted += tools.length;
    const content =
      role === "user"
        ? faker.helpers.arrayElement([
            `Implement ${faker.hacker.verb()} for ${faker.hacker.noun()}`,
            `Fix the ${faker.hacker.adjective()} bug in ${faker.system.fileName()}`,
            `Review the ${faker.git.commitMessage()} approach`,
            `Add tests covering ${faker.hacker.noun()} selection state`,
          ])
        : faker.lorem.paragraphs({ min: 1, max: 2 });
    messages.push({
      id: id(),
      role,
      isUser: role === "user",
      content,
      tools,
      toolCount: tools.length,
    });
  }
  // Guarantee at least one tool row when forceTools and we still have none.
  if (forceTools && toolsEmitted === 0) {
    const assistant = messages.find((m) => m.role === "assistant");
    if (assistant) {
      const tools = [makeTool(), makeTool()];
      assistant.tools = tools;
      assistant.toolCount = tools.length;
    }
  }
  return messages;
}

function makeFileChanges(count) {
  const changes = [];
  for (let i = 0; i < count; i++) {
    const meta = FILE_EXTS[i % FILE_EXTS.length];
    const status = FILE_STATUSES[i % FILE_STATUSES.length];
    const dir = faker.helpers.arrayElement(["src", "src/components", "src/mock", "lib"]);
    const base = faker.system.commonFileName(meta.ext).replace(/\s/g, "-");
    const path = `${dir}/${base}`;
    const additions = status === "deleted" ? 0 : faker.number.int({ min: 1, max: 40 });
    const deletions = status === "added" ? 0 : faker.number.int({ min: 0, max: 25 });
    changes.push({
      id: id(),
      path,
      status,
      language: meta.language,
      diff: makeDiff(path, meta.language, status),
      additions,
      deletions,
      additionsLabel: `+${additions}`,
      deletionsLabel: `-${deletions}`,
    });
  }
  return changes;
}

const STATUS_LABELS = {
  idle: "Idle",
  running: "Running",
  needs_review: "Review",
  failed: "Failed",
  completed: "Done",
};

function makeThread(index, { status: forcedStatus, forceTools = false } = {}) {
  // Prefer explicit status so the workspace always covers full lifecycle chips.
  const status = forcedStatus ?? THREAD_STATUSES[index % THREAD_STATUSES.length];
  const messageCount = faker.number.int({ min: 2, max: 6 });
  // Review / completed threads always carry file changes + diffs for the review pane.
  const fileCount =
    status === "needs_review" || status === "completed" || index % 2 === 0
      ? faker.number.int({ min: 2, max: 5 })
      : faker.number.int({ min: 0, max: 2 });
  return {
    id: id(),
    title: faker.helpers.arrayElement([
      `Agent: ${faker.hacker.phrase()}`,
      `Task: ${faker.git.commitMessage()}`,
      `Refactor ${faker.hacker.noun()}`,
      `Ship ${faker.commerce.productName()}`,
    ]),
    status,
    statusLabel: STATUS_LABELS[status] || status,
    messages: makeMessages(messageCount, {
      forceTools: forceTools || status === "running" || status === "needs_review",
    }),
    fileChanges: makeFileChanges(fileCount),
  };
}

function makeProject(index) {
  const name =
    index === 0
      ? "Wall-E"
      : `${faker.helpers.arrayElement(["codex-shell", "agent-runtime", "desktop-kit", "pi-bridge"])}-${index + 1}`;
  // ≥3 threads; first two forced content-rich (tools + review files).
  const baseStatuses = [
    THREAD_STATUSES[index % THREAD_STATUSES.length],
    "needs_review",
    THREAD_STATUSES[(index + 2) % THREAD_STATUSES.length],
  ];
  const extra = faker.number.int({ min: 0, max: 1 });
  const threads = baseStatuses.map((status, i) =>
    makeThread(index * 5 + i, {
      status,
      forceTools: i === 0 || status === "needs_review",
    }),
  );
  for (let i = 0; i < extra; i++) {
    threads.push(
      makeThread(index * 5 + baseStatuses.length + i, {
        status: THREAD_STATUSES[(index + 3 + i) % THREAD_STATUSES.length],
      }),
    );
  }
  return {
    id: id(),
    name,
    path: `/Users/demo/Project/${name}`,
    description: faker.company.catchPhrase(),
    threads,
  };
}

// Always ≥2 projects so project selection is exerciseable in the UI and tests.
// After building projects, ensure every lifecycle status appears at least once.
const projectCount = Math.max(2, faker.number.int({ min: 2, max: 3 }));
const projects = Array.from({ length: projectCount }, (_, i) => makeProject(i));

{
  const seen = new Set();
  for (const p of projects) {
    for (const t of p.threads) seen.add(t.status);
  }
  for (const status of THREAD_STATUSES) {
    if (seen.has(status)) continue;
    // Graft a missing status onto the last project as an extra session.
    const host = projects[projects.length - 1];
    host.threads = [
      ...host.threads,
      makeThread(900 + seen.size, { status, forceTools: true }),
    ];
    seen.add(status);
  }
}

function emitTool(t) {
  return `      {
        id: ${t.id},
        name: ${b(t.name)},
        state: "${t.state}",
        inputSummary: ${b(t.inputSummary)},
        outputSummary: ${b(t.outputSummary)},
        errorText: ${b(t.errorText)},
      }`;
}

function emitMessage(m) {
  const tools = m.tools.map(emitTool).join(",\n");
  return `      {
        id: ${m.id},
        role: "${m.role}",
        isUser: ${m.isUser ? "true" : "false"},
        content: ${b(m.content)},
        toolCount: ${m.toolCount},
        tools: [
${tools}
        ] as const,
      }`;
}

function emitFile(f) {
  return `      {
        id: ${f.id},
        path: ${b(f.path)},
        status: "${f.status}",
        language: ${b(f.language)},
        diff: ${b(f.diff)},
        additions: ${f.additions},
        deletions: ${f.deletions},
        additionsLabel: ${b(f.additionsLabel)},
        deletionsLabel: ${b(f.deletionsLabel)},
      }`;
}

function emitThread(t) {
  return `      {
        id: ${t.id},
        title: ${b(t.title)},
        status: "${t.status}",
        statusLabel: ${b(t.statusLabel)},
        messages: [
${t.messages.map(emitMessage).join(",\n")}
        ] as const,
        fileChanges: [
${t.fileChanges.map(emitFile).join(",\n")}
        ] as const,
      }`;
}

function emitProject(p) {
  return `  {
    id: ${p.id},
    name: ${b(p.name)},
    path: ${b(p.path)},
    description: ${b(p.description)},
    threads: [
${p.threads.map(emitThread).join(",\n")}
    ] as const,
  }`;
}

const body = `// AUTO-GENERATED by scripts/generate-mock.mjs — do not edit by hand.
// Seed: ${SEED}. Re-run: node scripts/generate-mock.mjs
// Faker lives only in the generator; this file is pure domain data.

import type { Project } from "./types";

export const MOCK_SEED = ${SEED} as const;

export const MOCK_PROJECTS: readonly Project[] = [
${projects.map(emitProject).join(",\n")}
] as const;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, body);
console.log(`Wrote ${OUT}`);
console.log(`projects=${projects.length} nextId=${nextId}`);
