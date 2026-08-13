import { useMemo, type RefObject } from "react";
import { Chip } from "@heroui/react";
import {
  ChatConversation,
  ChatMessage,
  EmptyState,
  PromptInput,
} from "@heroui-pro/react";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Copy,
  Loader2,
  Paperclip,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { Message, Thread, ToolActivity, ToolState } from "../../mock/types";
import type { Msg } from "../../shell/model";
import { StatusChip } from "./status-chip";

const TOOL_STATE_LABEL: Record<ToolState, string> = {
  input_streaming: "streaming",
  input_available: "ready",
  output_available: "done",
  output_error: "error",
  requires_action: "action",
};

const TOOL_STATE_COLOR: Record<
  ToolState,
  "default" | "accent" | "success" | "danger" | "warning"
> = {
  input_streaming: "accent",
  input_available: "default",
  output_available: "success",
  output_error: "danger",
  requires_action: "warning",
};

function ToolStateIcon({ state }: { state: ToolState }) {
  if (state === "output_error") return <AlertCircle className="size-3.5 text-danger" />;
  if (state === "output_available") return <CheckCircle2 className="size-3.5 text-success" />;
  if (state === "input_streaming") return <Loader2 className="size-3.5 animate-spin text-accent" />;
  if (state === "requires_action") return <Sparkles className="size-3.5 text-warning" />;
  return <Wrench className="size-3.5 text-muted" />;
}

/** Codex-style tool-activity row bound to mock fixture fields only. */
function ToolActivityRow({ tool, index }: { tool: ToolActivity; index: number }) {
  const summary =
    tool.state === "output_error"
      ? tool.errorText || tool.inputSummary
      : tool.outputSummary || tool.inputSummary;
  const color = TOOL_STATE_COLOR[tool.state] ?? "default";
  const isError = tool.state === "output_error";
  const isDone = tool.state === "output_available";

  return (
    <div
      className={[
        "rounded-lg border px-2.5 py-2",
        isError
          ? "border-danger/40 bg-danger/5"
          : isDone
            ? "border-success/30 bg-success/5"
            : "border-border bg-default/40",
      ].join(" ")}
      data-testid={`tool-${tool.id}`}
    >
      <div className="flex items-center gap-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded bg-background font-mono text-[10px] tabular-nums text-muted">
          {index + 1}
        </span>
        <ToolStateIcon state={tool.state} />
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-foreground">
          {tool.name}
        </span>
        <Chip size="sm" variant="soft" color={color} className="shrink-0">
          {TOOL_STATE_LABEL[tool.state] ?? tool.state}
        </Chip>
      </div>
      {tool.inputSummary ? (
        <p className="mt-1.5 truncate font-mono text-[11px] text-muted">{tool.inputSummary}</p>
      ) : null}
      {summary && summary !== tool.inputSummary ? (
        <p className="mt-0.5 line-clamp-2 text-[11px] text-foreground/80">{summary}</p>
      ) : null}
    </div>
  );
}

export function ConversationMain({
  hasThread,
  threadTitle,
  statusLabel,
  selectedThread,
  msgCount,
  fileCount,
  messages,
  draft,
  send,
  messagesRef,
}: {
  hasThread: boolean;
  threadTitle: string;
  statusLabel: string;
  selectedThread: Thread | null;
  msgCount: number;
  fileCount: number;
  messages: readonly Message[];
  draft: string;
  send: (msg: Msg) => void;
  messagesRef: RefObject<HTMLDivElement | null>;
}) {
  const headerMeta = useMemo(
    () => `${msgCount} messages · ${fileCount} files changed`,
    [msgCount, fileCount],
  );

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-transparent"
      data-testid="conversation-pane"
    >
      {/* Title on its own row; badge + meta stay secondary so long titles don't crush status. */}
      <div className="shrink-0 border-b border-border bg-transparent px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h2
              className="text-sm font-semibold leading-snug text-foreground"
              data-testid="conversation-title"
              title={threadTitle}
            >
              <span className="line-clamp-2 break-words">{threadTitle}</span>
            </h2>
            <p className="mt-1 text-xs text-muted">{headerMeta}</p>
          </div>
          {statusLabel ? (
            <div className="shrink-0 pt-0.5">
              <StatusChip status={selectedThread?.status} label={statusLabel} />
            </div>
          ) : null}
        </div>
      </div>

      {hasThread ? (
        <ChatConversation className="min-h-0 flex-1" data-testid="message-list">
          <ChatConversation.Content className="mx-auto w-full max-w-3xl px-4 py-6">
            <div ref={messagesRef} className="flex flex-col gap-5">
              {messages.map((m) =>
                m.isUser ? (
                  <div key={m.id} className="shell-message" data-testid={`message-${m.id}`}>
                    <ChatMessage.User>
                      <ChatMessage.Bubble className="max-w-[85%]">
                        <ChatMessage.Content className="whitespace-pre-wrap">
                          {m.content}
                        </ChatMessage.Content>
                      </ChatMessage.Bubble>
                    </ChatMessage.User>
                  </div>
                ) : (
                  <div key={m.id} className="shell-message" data-testid={`message-${m.id}`}>
                    <ChatMessage.Assistant>
                      <ChatMessage.Avatar alt="Wall-E" fallback="W" show />
                      <ChatMessage.Body>
                        <ChatMessage.Content className="whitespace-pre-wrap">
                          {m.content}
                        </ChatMessage.Content>
                        {m.tools.length > 0 ? (
                          <div
                            className="mt-2 flex flex-col gap-1.5"
                            data-testid={`message-tools-${m.id}`}
                          >
                            {m.tools.map((tool, index) => (
                              <ToolActivityRow key={tool.id} tool={tool} index={index} />
                            ))}
                          </div>
                        ) : null}
                        {/* Icon-only copy sits on the message, not as a lone text row. */}
                        <ChatMessage.Actions className="mt-1">
                          <ChatMessage.Action
                            aria-label="Copy message"
                            tooltip="Copy message"
                            onPress={() => {
                              void navigator.clipboard?.writeText(m.content);
                            }}
                          >
                            <Copy className="size-3.5" />
                          </ChatMessage.Action>
                        </ChatMessage.Actions>
                      </ChatMessage.Body>
                    </ChatMessage.Assistant>
                  </div>
                ),
              )}
            </div>
            <ChatConversation.ScrollAnchor />
          </ChatConversation.Content>
        </ChatConversation>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center p-8">
          <EmptyState>
            <EmptyState.Header>
              <EmptyState.Media>
                <div className="flex size-12 items-center justify-center rounded-xl bg-default">
                  <Bot className="size-6 text-muted" />
                </div>
              </EmptyState.Media>
              <EmptyState.Title>What should we work on?</EmptyState.Title>
              <EmptyState.Description>
                Pick a project and session on the left to open a mock agent thread.
              </EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        </div>
      )}

      <div className="shrink-0 border-t border-border bg-transparent" data-testid="compose-bar">
        <div className="mx-auto w-full max-w-3xl p-3">
          <PromptInput
            value={draft}
            layout="stacked"
            variant="secondary"
            onValueChange={(text) => send({ kind: "draft_edit", text })}
            onSubmit={() => send({ kind: "compose_submit" })}
          >
            <PromptInput.Shell>
              <PromptInput.Content>
                <PromptInput.TextArea
                  placeholder="Describe a task for Wall-E…"
                  aria-label="Compose message"
                  data-testid="compose-input"
                />
              </PromptInput.Content>
              <PromptInput.Toolbar>
                <PromptInput.ToolbarStart>
                  <PromptInput.Action aria-label="Attach file" tooltip="Attachments (mock)">
                    <Paperclip className="size-4" />
                  </PromptInput.Action>
                </PromptInput.ToolbarStart>
                <PromptInput.ToolbarEnd>
                  <PromptInput.Send data-testid="compose-send" />
                </PromptInput.ToolbarEnd>
              </PromptInput.Toolbar>
            </PromptInput.Shell>
          </PromptInput>
        </div>
        {/* Status line is a dedicated row so it never fights the composer controls. */}
        <div
          className="border-t border-border/70 px-4 py-1.5 text-center text-[11px] text-muted"
          data-testid="compose-status"
        >
          Mock shell · selecting sessions updates conversation and review panes
        </div>
      </div>
    </div>
  );
}
