// Derived shell data — pure queries over Model.
// Binding helpers in core.ts wrap these so markup can bind by name.

import { asciiBytes } from "@native-sdk/core";
import {
  findFile,
  findProject,
  findThread,
  threadFiles,
  threadMessages,
  NONE,
} from "../mock/selection.ts";
import type { FileChange, Message, Project, Thread } from "../mock/types.ts";
import type { Model } from "../core.ts";

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

export function query_hasThreadStatus(model: Model): boolean {
  return model.selection.threadId !== NONE;
}

export function query_threadTitle(model: Model): Uint8Array {
  const t = query_selectedThread(model);
  return t ? t.title : asciiBytes("No thread");
}

export function query_projectName(model: Model): Uint8Array {
  const p = query_selectedProject(model);
  return p ? p.name : asciiBytes("Wall-E");
}

export function query_filePath(model: Model): Uint8Array {
  const f = query_selectedFile(model);
  return f ? f.path : asciiBytes("");
}

export function query_fileDiff(model: Model): Uint8Array {
  const f = query_selectedFile(model);
  return f ? f.diff : asciiBytes("");
}

export function query_fileLanguage(model: Model): Uint8Array {
  const f = query_selectedFile(model);
  return f ? f.language : asciiBytes("diff");
}

export function query_draftText(model: Model): Uint8Array {
  return model.draft.bytes;
}

export function query_messageCount(model: Model): number {
  return query_messages(model).length;
}

export function query_fileCount(model: Model): number {
  return query_files(model).length;
}

export function query_threadStatusLabel(model: Model): Uint8Array {
  const t = query_selectedThread(model);
  return t ? t.statusLabel : asciiBytes("");
}

export function query_additionsLabel(model: Model): Uint8Array {
  const f = query_selectedFile(model);
  return f ? f.additionsLabel : asciiBytes("");
}

export function query_deletionsLabel(model: Model): Uint8Array {
  const f = query_selectedFile(model);
  return f ? f.deletionsLabel : asciiBytes("");
}
