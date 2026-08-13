import { Chip, ScrollShadow } from "@heroui/react";
import { Folder, MessageSquare, Terminal } from "lucide-react";
import { Sidebar } from "@heroui-pro/react";
import type { Model, Msg } from "../../shell/model";
import type { Project, Thread } from "../../mock/types";
import { StatusChip } from "./status-chip";

export function SessionSidebar({
  model,
  send,
  projects,
  threads,
}: {
  model: Model;
  send: (msg: Msg) => void;
  projects: readonly Project[];
  threads: readonly Thread[];
}) {
  const content = (
    <>
      {/*
        macOS traffic lights sit over the top-left of the window (hiddenInset).
        Reserve space so the brand never collides with the window chrome.
      */}
      <Sidebar.Header className="titlebar !pt-[36px]">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Terminal className="size-3.5" />
          </div>
          <div className="min-w-0" data-sidebar="label">
            <div className="truncate text-sm font-semibold text-foreground">Wall·E</div>
            <div className="truncate text-xs text-muted">Local agent shell</div>
          </div>
        </div>
      </Sidebar.Header>

      <Sidebar.Content>
        <Sidebar.Group>
          <Sidebar.GroupLabel>Projects</Sidebar.GroupLabel>
          <Sidebar.Menu aria-label="Projects">
            {projects.map((p) => (
              <Sidebar.MenuItem
                key={p.id}
                id={`project-${p.id}`}
                textValue={p.name}
                isCurrent={p.id === model.selection.projectId}
                onAction={() => send({ kind: "select_project", id: p.id })}
              >
                <Sidebar.MenuIcon>
                  <Folder className="size-4" />
                </Sidebar.MenuIcon>
                <Sidebar.MenuLabel title={p.name}>{p.name}</Sidebar.MenuLabel>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.Group>

        <Sidebar.Separator />

        <Sidebar.Group className="min-h-0 flex-1">
          <Sidebar.GroupLabel>Sessions</Sidebar.GroupLabel>
          <ScrollShadow className="max-h-[calc(100vh-300px)]">
            <Sidebar.Menu aria-label="Sessions" data-testid="session-list">
              {threads.map((t) => (
                <Sidebar.MenuItem
                  key={t.id}
                  id={`thread-${t.id}`}
                  textValue={t.title}
                  isCurrent={t.id === model.selection.threadId}
                  onAction={() => send({ kind: "select_thread", id: t.id })}
                  className="shell-list-item"
                >
                  <Sidebar.MenuIcon>
                    <MessageSquare className="size-4" />
                  </Sidebar.MenuIcon>
                  <Sidebar.MenuLabel className="min-w-0 flex-1" title={t.title}>
                    {t.title}
                  </Sidebar.MenuLabel>
                  {/*
                    Fixed-width chip column so Idle / Review / Failed always
                    align on the right edge, regardless of title length.
                  */}
                  <Sidebar.MenuChip className="ml-auto w-[4.5rem] shrink-0 justify-end">
                    <StatusChip status={t.status} label={t.statusLabel} />
                  </Sidebar.MenuChip>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </ScrollShadow>
        </Sidebar.Group>
      </Sidebar.Content>

      <Sidebar.Footer>
        <div
          className="rounded-lg border border-border bg-default/50 px-2.5 py-2"
          data-testid="mock-footer"
        >
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="soft" color="warning">
              mock data
            </Chip>
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-muted">
            Faker fixtures · no live AI backend
          </p>
        </div>
      </Sidebar.Footer>
      <Sidebar.Rail />
    </>
  );

  return (
    <>
      <Sidebar
        className="border-r border-border bg-transparent"
        data-testid="session-sidebar"
      >
        {content}
      </Sidebar>
      <Sidebar.Mobile>{content}</Sidebar.Mobile>
    </>
  );
}
