// Derived shell data — pure queries over Model.

import {
  findFile,
  findProject,
  findThread,
  threadFiles,
  threadMessages,
  NONE,
} from "../mock/selection";
import type { FileChange, Message, Project, Thread } from "../mock/types";
import type { Model } from "./model";

function workspace(model: Model): { projects: readonly Project[] } {
  return { projects: model.projects };
}

export function query_selectedProject(model: Model): Project | null {
  return findProject(workspace(model), model.selection.projectId);
}

export function query_selectedThread(model: Model): Thread | null {
  return findThread(workspace(model), model.selection.projectId, model.selection.threadId);
}

export function query_selectedFile(model: Model): FileChange | null {
  return findFile(
    workspace(model),
    model.selection.projectId,
    model.selection.threadId,
    model.selection.fileId,
  );
}

export function query_projectThreads(model: Model): readonly Thread[] {
  const p = query_selectedProject(model);
  return p ? p.threads : [];
}

export function query_messages(model: Model): readonly Message[] {
  return threadMessages(workspace(model), model.selection.projectId, model.selection.threadId);
}

export function query_files(model: Model): readonly FileChange[] {
  return threadFiles(workspace(model), model.selection.projectId, model.selection.threadId);
}

export function query_hasThread(model: Model): boolean {
  return model.selection.threadId !== NONE;
}

export function query_hasMessages(model: Model): boolean {
  return query_messages(model).length > 0;
}

export function query_hasFiles(model: Model): boolean {
  return query_files(model).length > 0;
}

export function query_hasSelectedFile(model: Model): boolean {
  return model.selection.fileId !== NONE;
}

export function query_threadTitle(model: Model): string {
  const t = query_selectedThread(model);
  return t ? t.title : "No thread";
}

export function query_projectName(model: Model): string {
  const p = query_selectedProject(model);
  return p ? p.name : "Wall-E";
}

export function query_filePath(model: Model): string {
  const f = query_selectedFile(model);
  return f ? f.path : "";
}

export function query_fileDiff(model: Model): string {
  const f = query_selectedFile(model);
  return f ? f.diff : "";
}

export function query_draftText(model: Model): string {
  return model.draft.text;
}

export function query_messageCount(model: Model): number {
  return query_messages(model).length;
}

export function query_fileCount(model: Model): number {
  return query_files(model).length;
}

export function query_threadStatusLabel(model: Model): string {
  const t = query_selectedThread(model);
  return t ? t.statusLabel : "";
}

export function query_additionsLabel(model: Model): string {
  const f = query_selectedFile(model);
  return f ? f.additionsLabel : "";
}

export function query_deletionsLabel(model: Model): string {
  const f = query_selectedFile(model);
  return f ? f.deletionsLabel : "";
}
