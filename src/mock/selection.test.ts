import { describe, expect, it } from "vitest";
import {
  defaultSelection,
  findFile,
  selectFile,
  selectProject,
  selectThread,
  threadFiles,
  threadMessages,
  NONE,
} from "./selection";
import { MOCK_PROJECTS } from "./fixtures";
import type { Project, Workspace } from "./types";

function sampleWorkspace(): Workspace {
  const projects: Project[] = [
    {
      id: 1,
      name: "Alpha",
      path: "/a",
      description: "d1",
      threads: [
        {
          id: 10,
          title: "T1",
          status: "idle",
          statusLabel: "Idle",
          messages: [
            { id: 100, role: "user", isUser: true, content: "hello-alpha", tools: [], toolCount: 0 },
            {
              id: 101,
              role: "assistant",
              isUser: false,
              content: "reply-alpha",
              tools: [],
              toolCount: 0,
            },
          ],
          fileChanges: [
            {
              id: 1000,
              path: "src/a.ts",
              status: "modified",
              language: "typescript",
              diff: "diff --git a/src/a.ts b/src/a.ts\n+const x = 1;",
              additions: 1,
              deletions: 0,
              additionsLabel: "+1",
              deletionsLabel: "-0",
            },
          ],
        },
        {
          id: 11,
          title: "T2",
          status: "needs_review",
          statusLabel: "Review",
          messages: [
            { id: 110, role: "user", isUser: true, content: "hello-t2", tools: [], toolCount: 0 },
          ],
          fileChanges: [
            {
              id: 1100,
              path: "src/b.ts",
              status: "added",
              language: "typescript",
              diff: "diff --git a/src/b.ts b/src/b.ts\n+export {};",
              additions: 1,
              deletions: 0,
              additionsLabel: "+1",
              deletionsLabel: "-0",
            },
            {
              id: 1101,
              path: "src/c.ts",
              status: "deleted",
              language: "typescript",
              diff: "diff --git a/src/c.ts b/src/c.ts\n-old",
              additions: 0,
              deletions: 1,
              additionsLabel: "+0",
              deletionsLabel: "-1",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Beta",
      path: "/b",
      description: "d2",
      threads: [
        {
          id: 20,
          title: "Beta thread",
          status: "running",
          statusLabel: "Running",
          messages: [
            { id: 200, role: "user", isUser: true, content: "hello-beta", tools: [], toolCount: 0 },
          ],
          fileChanges: [],
        },
      ],
    },
  ];
  return { projects };
}

describe("selection helpers (shipped)", () => {
  it("default selection picks first project/thread/file", () => {
    const ws = sampleWorkspace();
    const sel = defaultSelection(ws);
    expect(sel.projectId).toBe(1);
    expect(sel.threadId).toBe(10);
    expect(sel.fileId).toBe(1000);
  });

  it("selecting project → thread yields that thread messages", () => {
    const ws = sampleWorkspace();
    let sel = selectProject(ws, 2);
    expect(sel.projectId).toBe(2);
    expect(sel.threadId).toBe(20);
    sel = selectThread(ws, 1, 11);
    expect(sel.threadId).toBe(11);
    const msgs = threadMessages(ws, 1, 11);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]!.content).toBe("hello-t2");
  });

  it("selecting a file yields that file diff", () => {
    const ws = sampleWorkspace();
    let sel = selectProject(ws, 1);
    sel = selectThread(ws, 1, 11);
    sel = selectFile(ws, 1, 11, 1101);
    expect(sel.fileId).toBe(1101);
    const file = findFile(ws, 1, 11, 1101);
    expect(file).not.toBeNull();
    expect(file!.path).toBe("src/c.ts");
    expect(file!.diff).toContain("diff --git");
    expect(file!.diff.length).toBeGreaterThan(0);
  });

  it("unknown ids resolve to NONE safely", () => {
    const ws = sampleWorkspace();
    const sel = selectProject(ws, 999);
    expect(sel.projectId).toBe(NONE);
  });
});

describe("selection against shipped faker fixtures", () => {
  const ws: Workspace = { projects: MOCK_PROJECTS };

  it("defaultSelection lands on real fixture content", () => {
    const sel = defaultSelection(ws);
    expect(sel.projectId).toBeGreaterThan(0);
    expect(sel.threadId).toBeGreaterThan(0);
    const msgs = threadMessages(ws, sel.projectId, sel.threadId);
    expect(msgs.length).toBeGreaterThan(0);
    const files = threadFiles(ws, sel.projectId, sel.threadId);
    // Prefer thread with files when available in fixtures.
    if (files.length > 0) {
      expect(sel.fileId).toBeGreaterThan(0);
      const file = findFile(ws, sel.projectId, sel.threadId, sel.fileId);
      expect(file?.diff).toContain("diff --git");
    }
  });

  it("switching projects keeps messages/files bound to the new selection", () => {
    expect(MOCK_PROJECTS.length).toBeGreaterThanOrEqual(2);
    const a = MOCK_PROJECTS[0]!;
    const b = MOCK_PROJECTS[1]!;
    const selA = selectProject(ws, a.id);
    const selB = selectProject(ws, b.id);
    expect(selA.projectId).toBe(a.id);
    expect(selB.projectId).toBe(b.id);
    expect(selA.threadId).not.toBe(0);
    expect(selB.threadId).not.toBe(0);

    const msgsA = threadMessages(ws, selA.projectId, selA.threadId);
    const msgsB = threadMessages(ws, selB.projectId, selB.threadId);
    expect(msgsA.length).toBeGreaterThan(0);
    expect(msgsB.length).toBeGreaterThan(0);
    // Different projects must not share the same thread identity.
    expect(selA.threadId).not.toBe(selB.threadId);

    const threadB = b.threads.find((t) => t.id === selB.threadId);
    expect(threadB).toBeDefined();
    expect(msgsB.map((m) => m.id)).toEqual(threadB!.messages.map((m) => m.id));
  });

  it("selectFile within a multi-file thread yields that fixture diff only", () => {
    let projectId = 0;
    let threadId = 0;
    let fileA = 0;
    let fileB = 0;
    for (const p of MOCK_PROJECTS) {
      for (const t of p.threads) {
        if (t.fileChanges.length >= 2) {
          projectId = p.id;
          threadId = t.id;
          fileA = t.fileChanges[0]!.id;
          fileB = t.fileChanges[1]!.id;
          break;
        }
      }
      if (fileB) break;
    }
    expect(fileB).toBeGreaterThan(0);

    const sel1 = selectFile(ws, projectId, threadId, fileA);
    const sel2 = selectFile(ws, projectId, threadId, fileB);
    expect(sel1.fileId).toBe(fileA);
    expect(sel2.fileId).toBe(fileB);
    const f1 = findFile(ws, projectId, threadId, fileA)!;
    const f2 = findFile(ws, projectId, threadId, fileB)!;
    expect(f1.path).not.toBe(f2.path);
    expect(f1.diff).not.toBe(f2.diff);
    expect(f2.diff).toContain("diff --git");
  });
});
