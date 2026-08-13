import { Chip } from "@heroui/react";
import type { ThreadStatus } from "../../mock/types";

const STATUS_COLOR: Record<
  ThreadStatus,
  "default" | "accent" | "warning" | "danger" | "success"
> = {
  idle: "default",
  running: "accent",
  needs_review: "warning",
  failed: "danger",
  completed: "success",
};

export function StatusChip({
  status,
  label,
  className = "",
}: {
  status?: ThreadStatus | undefined;
  label: string;
  className?: string;
}) {
  if (!label) return null;
  const color = status ? STATUS_COLOR[status] : "default";
  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      className={className}
      data-testid="status-chip"
    >
      {label}
    </Chip>
  );
}
