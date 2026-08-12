// Mock data surface for the Native core.
// Views (app.native) must not import this package — only core.ts does.

export type {
  FileChange,
  FileChangeStatus,
  Message,
  MessageRole,
  Project,
  SelectionState,
  Thread,
  ThreadStatus,
  ToolActivity,
  ToolState,
  Workspace,
} from "./types.ts";

export {
  defaultSelection,
  emptySelection,
  findFile,
  findProject,
  findThread,
  selectFile,
  selectProject,
  selectThread,
  threadFiles,
  threadMessages,
  NONE,
} from "./selection.ts";

export { MOCK_PROJECTS, MOCK_SEED } from "./fixtures.ts";
