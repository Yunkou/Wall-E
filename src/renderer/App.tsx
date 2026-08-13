import { AppLayout } from "@heroui-pro/react";
import { useShellModel } from "./useShellModel";
import { useShellMotion } from "./useShellMotion";
import {
  query_additionsLabel,
  query_deletionsLabel,
  query_draftText,
  query_fileCount,
  query_fileDiff,
  query_filePath,
  query_files,
  query_hasFiles,
  query_hasSelectedFile,
  query_hasThread,
  query_messageCount,
  query_messages,
  query_projectName,
  query_projectThreads,
  query_selectedThread,
  query_threadStatusLabel,
  query_threadTitle,
} from "../shell/selectors";
import { SessionSidebar } from "./components/SessionSidebar";
import { AgentNavbar } from "./components/AgentNavbar";
import { ConversationMain } from "./components/ConversationMain";
import { ReviewAside } from "./components/ReviewAside";

export function App() {
  const { model, send } = useShellModel();

  const projectName = query_projectName(model);
  const threadTitle = query_threadTitle(model);
  const statusLabel = query_threadStatusLabel(model);
  const threads = query_projectThreads(model);
  const messages = query_messages(model);
  const files = query_files(model);
  const draft = query_draftText(model);
  const hasThread = query_hasThread(model);
  const hasFiles = query_hasFiles(model);
  const hasSelectedFile = query_hasSelectedFile(model);
  const filePath = query_filePath(model);
  const fileDiff = query_fileDiff(model);
  const additions = query_additionsLabel(model);
  const deletions = query_deletionsLabel(model);
  const msgCount = query_messageCount(model);
  const fileCount = query_fileCount(model);
  const selectedThread = query_selectedThread(model);

  const { shellRef, messagesRef } = useShellMotion({
    threadId: model.selection.threadId,
    projectId: model.selection.projectId,
    fileId: model.selection.fileId,
    colorScheme: model.colorScheme,
  });

  return (
    <div ref={shellRef} className="h-full" data-testid="app-shell">
      <AppLayout
        className="h-full min-h-0"
        scrollMode="content"
        sidebarCollapsible="none"
        sidebarResizable
        sidebarDefaultSize="22"
        sidebarMinSize="16"
        sidebarMaxSize="32"
        asideResizable
        asideDefaultSize="28"
        asideMinSize="18"
        asideMaxSize="42"
        defaultAsideOpen
        resizableAutoSaveId="wall-e:shell"
        reduceMotion={model.reduceMotion}
        sidebar={
          <SessionSidebar
            model={model}
            send={send}
            projects={model.projects}
            threads={threads}
          />
        }
        navbar={
          <AgentNavbar
            model={model}
            send={send}
            projectName={projectName}
            threadTitle={threadTitle}
            statusLabel={statusLabel}
            selectedThread={selectedThread}
          />
        }
        aside={
          <ReviewAside
            hasFiles={hasFiles}
            hasSelectedFile={hasSelectedFile}
            files={files}
            selectedFileId={model.selection.fileId}
            filePath={filePath}
            fileDiff={fileDiff}
            additions={additions}
            deletions={deletions}
            fileCount={fileCount}
            send={send}
          />
        }
      >
        <ConversationMain
          hasThread={hasThread}
          threadTitle={threadTitle}
          statusLabel={statusLabel}
          selectedThread={selectedThread}
          msgCount={msgCount}
          fileCount={fileCount}
          messages={messages}
          draft={draft}
          send={send}
          messagesRef={messagesRef}
        />
      </AppLayout>
    </div>
  );
}
