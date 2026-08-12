// Pure selection / query helpers over the workspace.
// Used by core.ts update + unit tests. Views never import this module.

import type {
  FileChange,
  Message,
  Project,
  SelectionState,
  Thread,
  Workspace,
} from "./types.ts";

/** Sentinel id for "nothing selected" (literal 0 for integer proofs). */
export const NONE = 0;

function sel(projectId: number, threadId: number, fileId: number): SelectionState {
  // Integer slots require a comparison + Math.trunc proof (SC4022).
  return {
    projectId:
      projectId >= 0 && projectId <= 9007199254740991 ? Math.trunc(projectId) : 0,
    threadId: threadId >= 0 && threadId <= 9007199254740991 ? Math.trunc(threadId) : 0,
    fileId: fileId >= 0 && fileId <= 9007199254740991 ? Math.trunc(fileId) : 0,
  };
}

export function emptySelection(): SelectionState {
  return sel(0, 0, 0);
}

/**
 * Default selection: first project, prefer a thread that has messages and
 * file changes so the Codex-like review pane is not empty on first paint.
 */
export function defaultSelection(workspace: Workspace): SelectionState {
  if (workspace.projects.length === 0) return sel(0, 0, 0);
  const project = workspace.projects[0];
  if (project.threads.length === 0) return sel(project.id, 0, 0);

  let thread = project.threads[0];
  for (let i = 0; i < project.threads.length; i++) {
    const t = project.threads[i];
    if (t.messages.length > 0 && t.fileChanges.length > 0) {
      thread = t;
      break;
    }
  }
  if (thread.fileChanges.length === 0) return sel(project.id, thread.id, 0);
  const file = thread.fileChanges[0];
  return sel(project.id, thread.id, file.id);
}

export function findProject(workspace: Workspace, projectId: number): Project | null {
  if (projectId === 0) return null;
  for (let i = 0; i < workspace.projects.length; i++) {
    const p = workspace.projects[i];
    if (p.id === projectId) return p;
  }
  return null;
}

export function findThread(
  workspace: Workspace,
  projectId: number,
  threadId: number,
): Thread | null {
  const project = findProject(workspace, projectId);
  if (project === null || threadId === 0) return null;
  for (let i = 0; i < project.threads.length; i++) {
    const t = project.threads[i];
    if (t.id === threadId) return t;
  }
  return null;
}

export function findFile(
  workspace: Workspace,
  projectId: number,
  threadId: number,
  fileId: number,
): FileChange | null {
  const thread = findThread(workspace, projectId, threadId);
  if (thread === null || fileId === 0) return null;
  for (let i = 0; i < thread.fileChanges.length; i++) {
    const f = thread.fileChanges[i];
    if (f.id === fileId) return f;
  }
  return null;
}

export function threadMessages(
  workspace: Workspace,
  projectId: number,
  threadId: number,
): readonly Message[] {
  const thread = findThread(workspace, projectId, threadId);
  if (thread === null) return [];
  return thread.messages;
}

export function threadFiles(
  workspace: Workspace,
  projectId: number,
  threadId: number,
): readonly FileChange[] {
  const thread = findThread(workspace, projectId, threadId);
  if (thread === null) return [];
  return thread.fileChanges;
}

export function selectProject(workspace: Workspace, projectId: number): SelectionState {
  const project = findProject(workspace, projectId);
  if (project === null) return sel(0, 0, 0);
  if (project.threads.length === 0) return sel(project.id, 0, 0);
  const thread = project.threads[0];
  if (thread.fileChanges.length === 0) return sel(project.id, thread.id, 0);
  const file = thread.fileChanges[0];
  return sel(project.id, thread.id, file.id);
}

export function selectThread(
  workspace: Workspace,
  projectId: number,
  threadId: number,
): SelectionState {
  const thread = findThread(workspace, projectId, threadId);
  if (thread === null) return sel(projectId, 0, 0);
  if (thread.fileChanges.length === 0) return sel(projectId, thread.id, 0);
  const file = thread.fileChanges[0];
  return sel(projectId, thread.id, file.id);
}

export function selectFile(
  workspace: Workspace,
  projectId: number,
  threadId: number,
  fileId: number,
): SelectionState {
  const file = findFile(workspace, projectId, threadId, fileId);
  if (file === null) return sel(projectId, threadId, 0);
  return sel(projectId, threadId, file.id);
}
