// Mock data surface for the shell.

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
} from "./types";

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
} from "./selection";

export { MOCK_PROJECTS, MOCK_SEED } from "./fixtures";
