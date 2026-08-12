#!/usr/bin/env node
/**
 * Generates src/mock/fixtures.ts — pure app-core subset data.
 *
 * Faker runs only here (Node). The Native core imports the emitted
 * fixtures; it never depends on @faker-js/faker or any npm package.
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
// ToolState members must be Zig-safe identifiers (no hyphens / keywords).
const FILE_EXTS = [
  { ext: "ts", language: "typescript" },
  { ext: "tsx", language: "tsx" },
  { ext: "js", language: "javascript" },
  { ext: "css", language: "css" },
  { ext: "json", language: "json" },
  { ext: "md", language: "markdown" },
];

/** Escape a JS string for embedding in a double-quoted asciiBytes("...") call. */
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
  return `asciiBytes("${esc(toAscii(s))}")`;
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

function makeMessages(count) {
  const messages = [];
  for (let i = 0; i < count; i++) {
    const role = i % 2 === 0 ? "user" : "assistant";
    const tools =
      role === "assistant" && i % 3 === 1
        ? Array.from({ length: faker.number.int({ min: 1, max: 2 }) }, () => makeTool())
        : [];
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

function makeThread(index) {
  const status = THREAD_STATUSES[index % THREAD_STATUSES.length];
  const messageCount = faker.number.int({ min: 2, max: 6 });
  // Always give at least one thread in a project file changes for Review pane demos.
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
    messages: makeMessages(messageCount),
    fileChanges: makeFileChanges(fileCount),
  };
}

function makeProject(index) {
  const name =
    index === 0
      ? "Wall-E"
      : `${faker.helpers.arrayElement(["codex-shell", "agent-runtime", "desktop-kit", "pi-bridge"])}-${index + 1}`;
  const threadCount = faker.number.int({ min: 2, max: 4 });
  return {
    id: id(),
    name,
    path: `/Users/demo/Project/${name}`,
    description: faker.company.catchPhrase(),
    threads: Array.from({ length: threadCount }, (_, i) => makeThread(i + index * 3)),
  };
}

const projectCount = faker.number.int({ min: 2, max: 3 });
const projects = Array.from({ length: projectCount }, (_, i) => makeProject(i));

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
// Faker lives only in the generator; this file is pure app-core subset data.

import { asciiBytes } from "@native-sdk/core";
import type { Project } from "./types.ts";

export const MOCK_SEED = ${SEED} as const;

export const MOCK_PROJECTS: readonly Project[] = [
${projects.map(emitProject).join(",\n")}
] as const;
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, body);
console.log(`Wrote ${OUT}`);
console.log(`projects=${projects.length} nextId=${nextId}`);
