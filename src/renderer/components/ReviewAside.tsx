import { useMemo } from "react";
import { Chip, ScrollShadow } from "@heroui/react";
import { EmptyState, ListView } from "@heroui-pro/react";
import { FileCode, FileText, GitBranch } from "lucide-react";
import type { FileChange, FileChangeStatus } from "../../mock/types";
import type { Msg } from "../../shell/model";

const FILE_STATUS_COLOR: Record<
  FileChangeStatus,
  "success" | "accent" | "danger" | "warning" | "default"
> = {
  added: "success",
  modified: "accent",
  deleted: "danger",
  renamed: "warning",
};

function basename(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || path;
}

function dirOf(path: string): string {
  const i = Math.max(path.lastIndexOf("/"), path.lastIndexOf("\\"));
  return i > 0 ? path.slice(0, i) : "";
}

/** Compute display line numbers for a unified diff hunk. */
function parseDiffLines(diff: string): Array<{
  text: string;
  kind: "add" | "del" | "meta" | "ctx";
  oldNo: number | null;
  newNo: number | null;
}> {
  let oldNo = 0;
  let newNo = 0;
  return diff.split("\n").map((line) => {
    if (line.startsWith("@@")) {
      const m = /@@\s+-(\d+)(?:,\d+)?\s+\+(\d+)/.exec(line);
      if (m) {
        oldNo = Number(m[1]) - 1;
        newNo = Number(m[2]) - 1;
      }
      return { text: line, kind: "meta" as const, oldNo: null, newNo: null };
    }
    if (line.startsWith("+++") || line.startsWith("---") || line.startsWith("diff ")) {
      return { text: line, kind: "meta" as const, oldNo: null, newNo: null };
    }
    if (line.startsWith("+")) {
      newNo += 1;
      return { text: line, kind: "add" as const, oldNo: null, newNo };
    }
    if (line.startsWith("-")) {
      oldNo += 1;
      return { text: line, kind: "del" as const, oldNo, newNo: null };
    }
    oldNo += 1;
    newNo += 1;
    return { text: line || " ", kind: "ctx" as const, oldNo, newNo };
  });
}

export function ReviewAside({
  hasFiles,
  hasSelectedFile,
  files,
  selectedFileId,
  filePath,
  fileDiff,
  additions,
  deletions,
  fileCount,
  send,
}: {
  hasFiles: boolean;
  hasSelectedFile: boolean;
  files: readonly FileChange[];
  selectedFileId: number;
  filePath: string;
  fileDiff: string;
  additions: string;
  deletions: string;
  fileCount: number;
  send: (msg: Msg) => void;
}) {
  const diffLines = useMemo(() => parseDiffLines(fileDiff), [fileDiff]);

  return (
    <div
      className="flex h-full min-h-0 flex-col border-l border-border bg-transparent"
      data-testid="review-pane"
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-3">
        <h2 className="text-sm font-semibold">Review</h2>
        <span className="ml-auto text-xs text-muted tabular-nums">{fileCount} files</span>
      </div>

      {hasFiles ? (
        <>
          <div className="px-3 pt-3 pb-1 text-xs font-medium text-muted">Changed files</div>
          <ScrollShadow className="max-h-[220px] shrink-0 px-1.5 pb-2" data-testid="file-list">
            <ListView
              aria-label="Changed files"
              selectionMode="single"
              selectedKeys={
                selectedFileId > 0 ? new Set([String(selectedFileId)]) : new Set<string>()
              }
              onSelectionChange={(keys) => {
                const key = [...keys][0];
                if (key == null) return;
                const id = Number(key);
                if (Number.isFinite(id)) send({ kind: "select_file", id });
              }}
              variant="secondary"
            >
              {files.map((f) => {
                const name = basename(f.path);
                const dir = dirOf(f.path);
                return (
                  <ListView.Item key={f.id} id={String(f.id)} textValue={f.path}>
                    <FileText className="size-4 shrink-0 self-start text-muted" />
                    <ListView.ItemContent className="min-w-0 flex-1">
                      <ListView.Title className="truncate font-mono text-xs" title={f.path}>
                        {name}
                      </ListView.Title>
                      <ListView.Description>
                        <span className="flex flex-col gap-1">
                          {dir ? (
                            <span className="block truncate font-mono text-[10px] text-muted" title={f.path}>
                              {dir}
                            </span>
                          ) : null}
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="font-mono text-[11px] font-medium tabular-nums text-success">
                              {f.additionsLabel}
                            </span>
                            <span className="font-mono text-[11px] font-medium tabular-nums text-danger">
                              {f.deletionsLabel}
                            </span>
                            <Chip
                              size="sm"
                              variant="soft"
                              color={FILE_STATUS_COLOR[f.status] ?? "default"}
                              className="shrink-0"
                            >
                              {f.status}
                            </Chip>
                          </span>
                        </span>
                      </ListView.Description>
                    </ListView.ItemContent>
                  </ListView.Item>
                );
              })}
            </ListView>
          </ScrollShadow>

          {hasSelectedFile ? (
            <>
              <div className="flex items-center gap-2 border-y border-border px-3 py-2 font-mono text-xs">
                <FileCode className="size-3.5 shrink-0 text-muted" />
                <span className="min-w-0 flex-1 truncate" data-testid="diff-path" title={filePath}>
                  {filePath}
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-success">{additions}</span>
                <span className="shrink-0 font-semibold tabular-nums text-danger">{deletions}</span>
              </div>
              <ScrollShadow className="min-h-0 flex-1 overflow-auto p-2" data-testid="diff-view">
                <div className="overflow-x-auto rounded-lg bg-background">
                  <table className="w-full min-w-max border-collapse font-mono text-[11px] leading-5">
                    <tbody>
                      {diffLines.map((line, i) => {
                        let rowCls = "diff-line";
                        if (line.kind === "add") rowCls += " diff-line-add";
                        else if (line.kind === "del") rowCls += " diff-line-del";
                        else if (line.kind === "meta") rowCls += " diff-line-meta";
                        return (
                          <tr key={i} className={rowCls}>
                            <td className="diff-gutter select-none text-right tabular-nums text-muted/70">
                              {line.oldNo ?? ""}
                            </td>
                            <td className="diff-gutter select-none text-right tabular-nums text-muted/70">
                              {line.newNo ?? ""}
                            </td>
                            <td className="diff-code whitespace-pre px-2 py-0 text-foreground">
                              {line.text || " "}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </ScrollShadow>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState>
                <EmptyState.Header>
                  <EmptyState.Title>Select a changed file</EmptyState.Title>
                  <EmptyState.Description>
                    Diffs appear here after you pick a path above.
                  </EmptyState.Description>
                </EmptyState.Header>
              </EmptyState>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center p-6">
          <EmptyState>
            <EmptyState.Header>
              <EmptyState.Media>
                <div className="flex size-12 items-center justify-center rounded-xl bg-default">
                  <GitBranch className="size-6 text-muted" />
                </div>
              </EmptyState.Media>
              <EmptyState.Title>No file changes</EmptyState.Title>
              <EmptyState.Description>
                Pick a session marked Review or Done to see diffs.
              </EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        </div>
      )}
    </div>
  );
}
