import { describe, expect, it } from "vitest";
import { createInitialModel, reduce } from "./update";
import { MOCK_PROJECTS, MOCK_SEED } from "../mock/fixtures";
import {
  query_draftText,
  query_fileDiff,
  query_filePath,
  query_files,
  query_messages,
  query_projectName,
  query_projectThreads,
  query_selectedFile,
  query_selectedThread,
  query_threadStatusLabel,
  query_threadTitle,
} from "./selectors";
import { theme_effectiveScheme, theme_nextThemeMode, theme_schemeLabel } from "./theme";
import { applyComposerText, clearComposerDraft } from "./composer";

describe("faker fixtures integrity (shipped MOCK_PROJECTS)", () => {
  it("exposes multi-project/thread workspace with tools, statuses, and diffs", () => {
    expect(MOCK_SEED).toBe(42);
    expect(MOCK_PROJECTS.length).toBeGreaterThanOrEqual(2);

    const statuses = new Set<string>();
    let toolCount = 0;
    let fileWithDiff = 0;
    let threads = 0;

    for (const p of MOCK_PROJECTS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.threads.length).toBeGreaterThanOrEqual(2);
      for (const t of p.threads) {
        threads += 1;
        statuses.add(t.status);
        expect(t.statusLabel.length).toBeGreaterThan(0);
        expect(t.messages.length).toBeGreaterThan(0);
        for (const m of t.messages) {
          expect(m.content.length).toBeGreaterThan(0);
          expect(m.toolCount).toBe(m.tools.length);
          toolCount += m.tools.length;
          for (const tool of m.tools) {
            expect(tool.name.length).toBeGreaterThan(0);
            expect(tool.state.length).toBeGreaterThan(0);
          }
        }
        for (const f of t.fileChanges) {
          if (f.diff.includes("diff --git") && f.diff.length > 0) fileWithDiff += 1;
          expect(f.path.length).toBeGreaterThan(0);
          expect(f.additionsLabel.startsWith("+")).toBe(true);
          expect(f.deletionsLabel.startsWith("-")).toBe(true);
        }
      }
    }

    expect(threads).toBeGreaterThanOrEqual(4);
    expect(toolCount).toBeGreaterThan(0);
    expect(fileWithDiff).toBeGreaterThan(0);
    // Full lifecycle variety for status chips in the sidebar / navbar.
    for (const required of ["idle", "running", "needs_review", "failed", "completed"] as const) {
      expect(statuses.has(required)).toBe(true);
    }
  });
});

describe("reduce (shipped shell update)", () => {
  it("initial model selects a project with messages and files from fixtures", () => {
    const model = createInitialModel();
    expect(model.projects).toBe(MOCK_PROJECTS);
    expect(model.selection.projectId).toBeGreaterThan(0);
    expect(model.selection.threadId).toBeGreaterThan(0);
    expect(query_projectName(model).length).toBeGreaterThan(0);
    expect(query_threadTitle(model).length).toBeGreaterThan(0);
    expect(query_messages(model).length).toBeGreaterThan(0);
    const file = query_selectedFile(model);
    // Prefer a thread that has file changes so review pane is populated.
    if (file) {
      expect(file.path.length).toBeGreaterThan(0);
      expect(file.diff).toContain("diff --git");
    }
  });

  it("select_project then select_thread updates related panes", () => {
    const initial = createInitialModel();
    const second = initial.projects.find((p) => p.id !== initial.selection.projectId);
    expect(second).toBeDefined();
    const afterProject = reduce(initial, { kind: "select_project", id: second!.id });
    expect(afterProject.selection.projectId).toBe(second!.id);
    expect(query_projectName(afterProject)).toBe(second!.name);

    // Prefer a content-rich default when landing on a project.
    const preferred = second!.threads.find(
      (t) => t.messages.length > 0 && t.fileChanges.length > 0,
    );
    if (preferred) {
      expect(afterProject.selection.threadId).toBe(preferred.id);
      expect(query_messages(afterProject).length).toBe(preferred.messages.length);
      expect(query_files(afterProject).length).toBe(preferred.fileChanges.length);
    }

    const thread = second!.threads[1] ?? second!.threads[0];
    expect(thread).toBeDefined();
    const afterThread = reduce(afterProject, { kind: "select_thread", id: thread!.id });
    expect(afterThread.selection.threadId).toBe(thread!.id);
    expect(query_threadTitle(afterThread)).toBe(thread!.title);
    expect(query_selectedThread(afterThread)?.id).toBe(thread!.id);
    expect(query_threadStatusLabel(afterThread)).toBe(thread!.statusLabel);

    const msgs = query_messages(afterThread);
    expect(msgs.length).toBe(thread!.messages.length);
    if (msgs.length > 0) {
      expect(msgs[0]!.content).toBe(thread!.messages[0]!.content);
    }
    // Conversation + review must not leak the previous project's thread payload.
    expect(query_projectThreads(afterThread).every((t) => second!.threads.some((x) => x.id === t.id))).toBe(
      true,
    );
  });

  it("select_file changes the review path and diff", () => {
    const model = createInitialModel();
    // Find a thread with at least two file changes.
    let projectId = model.selection.projectId;
    let threadId = model.selection.threadId;
    let files = model.projects
      .find((p) => p.id === projectId)
      ?.threads.find((t) => t.id === threadId)?.fileChanges;

    if (!files || files.length < 2) {
      for (const p of model.projects) {
        for (const t of p.threads) {
          if (t.fileChanges.length >= 2) {
            projectId = p.id;
            threadId = t.id;
            files = t.fileChanges;
            break;
          }
        }
        if (files && files.length >= 2) break;
      }
    }

    expect(files).toBeDefined();
    expect(files!.length).toBeGreaterThanOrEqual(2);

    let next = reduce(model, { kind: "select_project", id: projectId });
    next = reduce(next, { kind: "select_thread", id: threadId });
    const target = files![1]!;
    next = reduce(next, { kind: "select_file", id: target.id });

    expect(next.selection.fileId).toBe(target.id);
    expect(query_filePath(next)).toBe(target.path);
    expect(query_fileDiff(next)).toBe(target.diff);
    expect(query_selectedFile(next)?.diff).toBe(target.diff);
    expect(query_selectedFile(next)?.diff).toContain("diff --git");
  });

  it("selection surfaces tool activities from the selected thread fixtures", () => {
    let model = createInitialModel();
    let found: { projectId: number; threadId: number; toolName: string } | null = null;

    for (const p of model.projects) {
      for (const t of p.threads) {
        for (const m of t.messages) {
          if (m.tools.length > 0) {
            found = { projectId: p.id, threadId: t.id, toolName: m.tools[0]!.name };
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    expect(found).not.toBeNull();
    model = reduce(model, { kind: "select_project", id: found!.projectId });
    model = reduce(model, { kind: "select_thread", id: found!.threadId });
    const msgs = query_messages(model);
    const tools = msgs.flatMap((m) => m.tools);
    expect(tools.length).toBeGreaterThan(0);
    expect(tools.some((t) => t.name === found!.toolName)).toBe(true);
  });

  it("draft_edit updates text and compose_submit clears it", () => {
    let model = createInitialModel();
    expect(query_draftText(model)).toBe("");
    model = reduce(model, { kind: "draft_edit", text: "ship the review pane" });
    expect(query_draftText(model)).toBe("ship the review pane");
    model = reduce(model, { kind: "draft_edit", text: "ship the review pane now" });
    expect(query_draftText(model)).toBe("ship the review pane now");
    model = reduce(model, { kind: "compose_submit" });
    expect(query_draftText(model)).toBe("");
    // compose_submit must not invent a live agent reply or mutate fixtures.
    expect(model.projects).toBe(MOCK_PROJECTS);
    expect(query_messages(model).length).toBeGreaterThan(0);
  });

  it("composer helpers clamp and clear without calling reduce host I/O", () => {
    const long = "x".repeat(5000);
    const clamped = applyComposerText({ text: "" }, long);
    expect(clamped.text.length).toBe(4096);
    expect(clearComposerDraft().text).toBe("");
  });

  it("theme cycles system → light → dark and updates effective scheme", () => {
    let model = createInitialModel();
    model = reduce(model, {
      kind: "appearance_changed",
      colorScheme: "dark",
      reduceMotion: false,
      highContrast: false,
    });
    expect(model.themeMode).toBe("system");
    expect(model.colorScheme).toBe("dark");
    expect(theme_schemeLabel(model)).toContain("Auto");

    model = reduce(model, { kind: "toggle_theme" });
    expect(model.themeMode).toBe("light");
    expect(model.colorScheme).toBe("light");
    expect(theme_schemeLabel(model)).toBe("Light");

    model = reduce(model, { kind: "set_theme_dark" });
    expect(model.themeMode).toBe("dark");
    expect(model.colorScheme).toBe("dark");

    model = reduce(model, { kind: "set_theme_system" });
    expect(model.themeMode).toBe("system");
    expect(model.colorScheme).toBe("dark");

    expect(theme_nextThemeMode("system")).toBe("light");
    expect(theme_effectiveScheme("light", "dark")).toBe("light");
    expect(theme_effectiveScheme("system", "light")).toBe("light");
  });
});
