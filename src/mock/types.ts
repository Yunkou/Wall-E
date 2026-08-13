// Shell domain types — pure data for the Electron/React host.

/** String-literal unions for thread lifecycle. */
export type ThreadStatus = "idle" | "running" | "needs_review" | "failed" | "completed";

export type MessageRole = "user" | "assistant" | "system";

export type ToolState =
  | "input_streaming"
  | "input_available"
  | "output_available"
  | "output_error"
  | "requires_action";

export type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

export interface ToolActivity {
  readonly id: number;
  readonly name: string;
  readonly state: ToolState;
  readonly inputSummary: string;
  readonly outputSummary: string;
  readonly errorText: string;
}

export interface Message {
  readonly id: number;
  readonly role: MessageRole;
  /** View-friendly flag so UI can branch without string compares. */
  readonly isUser: boolean;
  readonly content: string;
  readonly tools: readonly ToolActivity[];
  readonly toolCount: number;
}

export interface FileChange {
  readonly id: number;
  readonly path: string;
  readonly status: FileChangeStatus;
  readonly language: string;
  readonly diff: string;
  readonly additions: number;
  readonly deletions: number;
  readonly additionsLabel: string;
  readonly deletionsLabel: string;
}

export interface Thread {
  readonly id: number;
  readonly title: string;
  readonly status: ThreadStatus;
  readonly statusLabel: string;
  readonly messages: readonly Message[];
  readonly fileChanges: readonly FileChange[];
}

export interface Project {
  readonly id: number;
  readonly name: string;
  readonly path: string;
  readonly description: string;
  readonly threads: readonly Thread[];
}

export interface Workspace {
  readonly projects: readonly Project[];
}

export interface SelectionState {
  readonly projectId: number;
  readonly threadId: number;
  readonly fileId: number;
}
