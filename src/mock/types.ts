// Shell domain types — app-core subset only.
// Dynamic text is Uint8Array (bytes). Views bind them; markup never imports this file.

/** String-literal unions become Zig enums — no hyphens, no keyword members. */
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
  readonly name: Uint8Array;
  readonly state: ToolState;
  readonly inputSummary: Uint8Array;
  readonly outputSummary: Uint8Array;
  readonly errorText: Uint8Array;
}

export interface Message {
  readonly id: number;
  readonly role: MessageRole;
  /** View-friendly flag so markup can branch without string compares. */
  readonly isUser: boolean;
  readonly content: Uint8Array;
  readonly tools: readonly ToolActivity[];
  /** tools.length, for markup (nested for-each on m.tools is not allowed). */
  readonly toolCount: number;
}

export interface FileChange {
  readonly id: number;
  readonly path: Uint8Array;
  readonly status: FileChangeStatus;
  readonly language: Uint8Array;
  readonly diff: Uint8Array;
  readonly additions: number;
  readonly deletions: number;
  /** Preformatted "+N" / "-N" for review chrome (ASCII bytes). */
  readonly additionsLabel: Uint8Array;
  readonly deletionsLabel: Uint8Array;
}

export interface Thread {
  readonly id: number;
  readonly title: Uint8Array;
  readonly status: ThreadStatus;
  /** Short status for list rows (ASCII bytes). */
  readonly statusLabel: Uint8Array;
  readonly messages: readonly Message[];
  readonly fileChanges: readonly FileChange[];
}

export interface Project {
  readonly id: number;
  readonly name: Uint8Array;
  readonly path: Uint8Array;
  readonly description: Uint8Array;
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
