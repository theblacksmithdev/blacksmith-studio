import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Layers, Server, Monitor, FolderPlus } from "lucide-react";
import { api } from "@/api";
import { FormField, inputCss, selectCss } from "@/components/forms/form-field";
import { FolderPicker } from "@/pages/projects/add/folder-picker";
import { isElectron, selectFolderNative } from "@/lib/electron";
import { projectHome } from "@/router/paths";
import {
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  spacing,
  radii,
} from "@/components/shared/ui";
import { FolderButton } from "./folder-button";
import { TerminalView } from "./terminal-view";
import styled from "@emotion/styled";

/* ── Project types ── */

const PROJECT_TYPES = ["empty", "fullstack", "backend", "frontend"] as const;
type ProjectType = (typeof PROJECT_TYPES)[number];

const THEMES = [
  "default",
  "blue",
  "green",
  "violet",
  "red",
  "neutral",
] as const;

const TYPE_INFO: Record<
  ProjectType,
  { icon: typeof Layers; label: string; tag: string; description: string }
> = {
  empty: {
    icon: FolderPlus,
    label: "Empty Project",
    tag: "Any stack",
    description: "Blank folder — bring your own tools and framework",
  },
  fullstack: {
    icon: Layers,
    label: "Full Stack",
    tag: "Django + React",
    description: "Backend API + Frontend UI with OpenAPI type sync",
  },
  backend: {
    icon: Server,
    label: "Backend",
    tag: "Django",
    description: "Standalone REST API with DRF and JWT auth",
  },
  frontend: {
    icon: Monitor,
    label: "Frontend",
    tag: "React",
    description: "Standalone React app with Vite and Chakra UI",
  },
};

/* ── Styled ── */

const SplitLayout = styled.div`
  display: flex;
  gap: ${spacing.xl};
  min-height: 320px;
`;

const LeftPanel = styled.div`
  flex: 0 0 240px;
  display: flex;
  flex-direction: column;
  gap: ${spacing["2xs"]};
  border-right: 1px solid var(--studio-border);
  padding-right: ${spacing.xl};
`;

const RightPanel = styled.div`
  flex: 1;
  min-width: 0;
`;

const TypeOption = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm} ${spacing.md};
  border-radius: ${radii.lg};
  border: none;
  background: ${({ $active }) =>
    $active ? "var(--studio-bg-surface)" : "transparent"};
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.12s ease;
  width: 100%;

  &:hover {
    background: var(--studio-bg-surface);
  }
`;

const TypeIconWrap = styled.div<{ $active: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: ${radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${({ $active }) =>
    $active ? "var(--studio-bg-hover)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  transition: all 0.12s ease;
`;

const TypeDetail = styled.div`
  padding: ${spacing.lg};
  border-radius: ${radii.lg};
  background: var(--studio-bg-surface);
  margin-bottom: ${spacing.lg};
`;

/* ── Schema ── */

const createSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Only letters, numbers, hyphens, and underscores",
    ),
  parentPath: z.string().min(1, "Select a location"),
  type: z.enum(PROJECT_TYPES),
  backendPort: z.coerce.number().int().min(1024).max(65535),
  frontendPort: z.coerce.number().int().min(1024).max(65535),
  theme: z.enum(THEMES),
});

type CreateState = "idle" | "creating" | "success" | "error";

/* ── Component ── */

export function CreateStep({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [state, setState] = useState<CreateState>("idle");
  const [serverError, setServerError] = useState("");
  const [outputLines, setOutputLines] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      parentPath: "",
      type: "fullstack",
      backendPort: 8000,
      frontendPort: 5173,
      theme: "default",
    },
  });

  const parentPath = watch("parentPath");
  const name = watch("name");
  const projectType = watch("type");

  const isBlacksmith = projectType !== "empty";
  const hasBackend = projectType === "fullstack" || projectType === "backend";
  const hasFrontend = projectType === "fullstack" || projectType === "frontend";
  const currentInfo = TYPE_INFO[projectType];
  const CurrentIcon = currentInfo.icon;

  useEffect(() => {
    if (state !== "creating") return;
    const unsubs = [
      api.projects.onCreateOutput((data) =>
        setOutputLines((prev) => [...prev, data.line]),
      ),
      api.projects.onCreateDone((data) => {
        setState("success");
        setTimeout(() => {
          onClose();
          navigate(projectHome(data.project.id));
        }, 1000);
      }),
      api.projects.onCreateError((data) => {
        setState("error");
        setServerError(data.error);
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [state, onClose, navigate]);

  const onSubmit = async (data: z.infer<typeof createSchema>) => {
    setState("creating");
    setServerError("");
    setOutputLines([]);
    try {
      await api.projects.create({ ...data, ai: true });
    } catch (err: any) {
      setState("error");
      setServerError(err.message || "Failed to start");
    }
  };

  if (state === "creating" || state === "success") {
    return (
      <TerminalView
        lines={outputLines}
        status={state === "success" ? "success" : "running"}
        label={
          state === "success"
            ? "Project created successfully"
            : `Creating ${name}...`
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SplitLayout>
        {/* ── Left: Type selector ── */}
        <LeftPanel>
          <Text variant="tiny" color="muted" css={{ marginBottom: spacing.sm }}>
            Project type
          </Text>
          {PROJECT_TYPES.map((t) => {
            const info = TYPE_INFO[t];
            const Icon = info.icon;
            const active = projectType === t;
            return (
              <TypeOption
                key={t}
                type="button"
                $active={active}
                onClick={() => setValue("type", t)}
              >
                <TypeIconWrap $active={active}>
                  <Icon size={14} />
                </TypeIconWrap>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    variant="label"
                    css={{
                      color: active
                        ? "var(--studio-text-primary)"
                        : "var(--studio-text-secondary)",
                      fontWeight: active ? 500 : 400,
                      display: "block",
                    }}
                  >
                    {info.label}
                  </Text>
                  <Text variant="caption" color="muted">
                    {info.tag}
                  </Text>
                </div>
              </TypeOption>
            );
          })}
        </LeftPanel>

        {/* ── Right: Form ── */}
        <RightPanel>
          {/* Type detail card */}
          <TypeDetail>
            <HStack gap="sm" css={{ marginBottom: spacing.xs }}>
              <CurrentIcon
                size={14}
                style={{ color: "var(--studio-text-secondary)" }}
              />
              <Text
                variant="label"
                css={{ color: "var(--studio-text-primary)", fontWeight: 500 }}
              >
                {currentInfo.label}
              </Text>
              <Badge variant="outline" size="sm">
                {currentInfo.tag}
              </Badge>
            </HStack>
            <Text variant="caption" color="muted">
              {currentInfo.description}
            </Text>
          </TypeDetail>

          <VStack gap="md">
            <FormField label="Project name" error={errors.name?.message}>
              <input
                {...register("name")}
                placeholder="my-project"
                style={inputCss}
              />
            </FormField>

            <FormField label="Location" error={errors.parentPath?.message}>
              <FolderButton
                path={parentPath}
                label="Select a folder..."
                onPick={async () => {
                  if (isElectron()) {
                    const p = await selectFolderNative();
                    if (p) setValue("parentPath", p, { shouldValidate: true });
                  } else setPickerOpen(true);
                }}
              />
              {parentPath && name && (
                <Text
                  variant="code"
                  css={{
                    marginTop: spacing.xs,
                    display: "block",
                    fontSize: "11px",
                  }}
                >
                  {parentPath}/{name}
                </Text>
              )}
            </FormField>

            {isBlacksmith && (
              <>
                {(hasBackend || hasFrontend) && (
                  <HStack gap="md">
                    {hasBackend && (
                      <FormField
                        label="Backend port"
                        error={errors.backendPort?.message}
                      >
                        <input
                          type="number"
                          {...register("backendPort")}
                          style={inputCss}
                        />
                      </FormField>
                    )}
                    {hasFrontend && (
                      <FormField
                        label="Frontend port"
                        error={errors.frontendPort?.message}
                      >
                        <input
                          type="number"
                          {...register("frontendPort")}
                          style={inputCss}
                        />
                      </FormField>
                    )}
                  </HStack>
                )}

                <FormField label="Theme" error={errors.theme?.message}>
                  <select {...register("theme")} style={selectCss}>
                    {THEMES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormField>
              </>
            )}

            {state === "error" && (
              <Badge
                variant="error"
                size="md"
                css={{ padding: `${spacing.sm} ${spacing.md}`, width: "100%" }}
              >
                {serverError}
              </Badge>
            )}

            <Button
              variant="primary"
              size="lg"
              css={{ width: "100%", marginTop: spacing.sm }}
              onClick={handleSubmit(onSubmit)}
            >
              {isBlacksmith ? "Create Project" : "Create Empty Project"}
            </Button>
          </VStack>
        </RightPanel>
      </SplitLayout>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(p) => setValue("parentPath", p, { shouldValidate: true })}
      />
    </form>
  );
}
