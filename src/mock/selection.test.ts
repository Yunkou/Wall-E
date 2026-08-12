import { describe, expect, it } from "vitest";
import {
  defaultSelection,
  findFile,
  selectFile,
  selectProject,
  selectThread,
  threadMessages,
  NONE,
} from "./selection.ts";
import type { Project, Workspace } from "./types.ts";

function b(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function sampleWorkspace(): Workspace {
  const projects: Project[] = [
    {
      id: 1,
      name: b("Alpha"),
      path: b("/a"),
      description: b("d1"),
      threads: [
        {
          id: 10,
          title: b("T1"),
          status: "idle",
          statusLabel: b("Idle"),
          messages: [
            { id: 100, role: "user", isUser: true, content: b("hello-alpha"), tools: [], toolCount: 0 },
            { id: 101, role: "assistant", isUser: false, content: b("reply-alpha"), tools: [], toolCount: 0 },
          ],
          fileChanges: [
            {
              id: 1000,
              path: b("src/a.ts"),
              status: "modified",
              language: b("typescript"),
              diff: b("diff --git a/src/a.ts b/src/a.ts\n+const x = 1;"),
              additions: 1,
              deletions: 0,
              additionsLabel: b("+1"),
              deletionsLabel: b("-0"),
            },
          ],
        },
        {
          id: 11,
          title: b("T2"),
          status: "needs_review",
          statusLabel: b("Review"),
          messages: [{ id: 110, role: "user", isUser: true, content: b("hello-t2"), tools: [], toolCount: 0 }],
          fileChanges: [
            {
              id: 1100,
              path: b("src/b.ts"),
              status: "added",
              language: b("typescript"),
              diff: b("diff --git a/src/b.ts b/src/b.ts\n+export {};"),
              additions: 1,
              deletions: 0,
              additionsLabel: b("+1"),
              deletionsLabel: b("-0"),
            },
            {
              id: 1101,
              path: b("src/c.ts"),
              status: "deleted",
              language: b("typescript"),
              diff: b("diff --git a/src/c.ts b/src/c.ts\n-old"),
              additions: 0,
              deletions: 1,
              additionsLabel: b("+0"),
              deletionsLabel: b("-1"),
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: b("Beta"),
      path: b("/b"),
      description: b("d2"),
      threads: [
        {
          id: 20,
          title: b("Beta thread"),
          status: "running",
          statusLabel: b("Running"),
          messages: [{ id: 200, role: "user", isUser: true, content: b("hello-beta"), tools: [], toolCount: 0 }],
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
    expect(new TextDecoder().decode(msgs[0]!.content)).toBe("hello-t2");
  });

  it("selecting a file yields that file diff", () => {
    const ws = sampleWorkspace();
    let sel = selectProject(ws, 1);
    sel = selectThread(ws, 1, 11);
    sel = selectFile(ws, 1, 11, 1101);
    expect(sel.fileId).toBe(1101);
    const file = findFile(ws, 1, 11, 1101);
    expect(file).not.toBeNull();
    expect(new TextDecoder().decode(file!.path)).toBe("src/c.ts");
    expect(new TextDecoder().decode(file!.diff)).toContain("diff --git");
    expect(file!.diff.length).toBeGreaterThan(0);
  });

  it("unknown ids resolve to NONE safely", () => {
    const ws = sampleWorkspace();
    const sel = selectProject(ws, 999);
    expect(sel.projectId).toBe(NONE);
  });
});
