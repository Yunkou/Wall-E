import {
  Breadcrumbs,
  Chip,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@heroui/react";
import { AppLayout, Navbar } from "@heroui-pro/react";
import { Diff, Monitor, Moon, Sun } from "lucide-react";
import type { Model, Msg } from "../../shell/model";
import { theme_schemeLabel } from "../../shell/theme";
import type { Thread } from "../../mock/types";

export function AgentNavbar({
  model,
  send,
  projectName,
  threadTitle,
}: {
  model: Model;
  send: (msg: Msg) => void;
  projectName: string;
  threadTitle: string;
  statusLabel: string;
  selectedThread: Thread | null;
}) {
  const themeKey = model.themeMode;

  return (
    <Navbar
      maxWidth="full"
      className="titlebar border-b border-border bg-transparent"
      data-testid="agent-navbar"
    >
      {/*
        Breadcrumbs sit in a flex-1 min-w-0 slot so long session titles truncate
        instead of overflowing over the theme controls (HeroUI breadcrumb items
        default to shrink-0).
      */}
      <Navbar.Header className="min-w-0 gap-2 overflow-hidden px-3">
        <AppLayout.MenuToggle className="no-drag shrink-0" />

        <div className="no-drag min-w-0 flex-1 overflow-hidden">
          <Breadcrumbs className="min-w-0 max-w-full" data-testid="breadcrumbs">
            <Breadcrumbs.Item className="min-w-0 !shrink max-w-[30%]">
              <span className="block truncate font-semibold" title={projectName}>
                {projectName}
              </span>
            </Breadcrumbs.Item>
            <Breadcrumbs.Item className="min-w-0 !shrink max-w-[70%]">
              <span className="block truncate" data-testid="crumb" title={threadTitle}>
                {threadTitle}
              </span>
            </Breadcrumbs.Item>
          </Breadcrumbs>
        </div>

        <Navbar.Content className="no-drag shrink-0 gap-1.5">
          <ToggleButtonGroup
            size="sm"
            selectionMode="single"
            selectedKeys={new Set([themeKey])}
            onSelectionChange={(keys) => {
              const key = [...keys][0];
              if (key === "system") send({ kind: "set_theme_system" });
              else if (key === "light") send({ kind: "set_theme_light" });
              else if (key === "dark") send({ kind: "set_theme_dark" });
            }}
            aria-label="Appearance"
            data-testid="theme-group"
          >
            <ToggleButton id="system" aria-label="Auto theme">
              <Monitor className="size-3.5" />
              <span className="hidden lg:inline">Auto</span>
            </ToggleButton>
            <ToggleButton id="light" aria-label="Light theme">
              <ToggleButtonGroup.Separator />
              <Sun className="size-3.5" />
              <span className="hidden lg:inline">Light</span>
            </ToggleButton>
            <ToggleButton id="dark" aria-label="Dark theme">
              <ToggleButtonGroup.Separator />
              <Moon className="size-3.5" />
              <span className="hidden lg:inline">Dark</span>
            </ToggleButton>
          </ToggleButtonGroup>

          <span className="hidden text-xs text-muted xl:inline">
            {theme_schemeLabel(model)}
          </span>

          <Chip size="sm" variant="soft" className="hidden sm:inline-flex">
            Uber
          </Chip>
          <Chip size="sm" variant="soft" className="hidden sm:inline-flex">
            mock
          </Chip>

          <Tooltip delay={200}>
            <Tooltip.Trigger>
              <AppLayout.AsideTrigger className="no-drag" aria-label="Toggle review pane">
                <Diff className="size-4" />
              </AppLayout.AsideTrigger>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              Toggle review pane
            </Tooltip.Content>
          </Tooltip>
        </Navbar.Content>
      </Navbar.Header>
    </Navbar>
  );
}
