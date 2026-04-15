import { useState } from "react";
import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Anvil, Package, GitBranch, Folder } from "lucide-react";
import { useRegisterProject, useValidateProject } from "@/api/hooks/projects";
import { FormField, inputCss } from "@/components/forms/form-field";
import { FolderPicker } from "./folder-picker";
import { isElectron, selectFolderNative } from "@/lib/electron";

const schema = z.object({
  projectPath: z.string().min(1, "Select a project folder"),
  projectName: z.string().min(1, "Project name is required"),
});

type FormData = z.infer<typeof schema>;

export function ImportExisting() {
  const navigate = useNavigate();
  const registerMutation = useRegisterProject();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleBrowseClick = async () => {
    if (isElectron()) {
      const path = await selectFolderNative();
      if (path) handleFolderSelected(path);
    } else {
      setPickerOpen(true);
    }
  };
  const [registering, setRegistering] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { projectPath: "", projectName: "" },
  });

  const projectPath = watch("projectPath");

  const handleFolderSelected = async (path: string) => {
    setValue("projectPath", path, { shouldValidate: true });
    try {
      const { api } = await import("@/api");
      const result = await api.projects.validate({ path });
      setValidationResult(result);
      if (result.name) {
        setValue("projectName", result.name, { shouldValidate: true });
      }
    } catch {
      /* validation failed */
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!validationResult?.valid) return;
    setRegistering(true);
    try {
      const project = await registerMutation.mutateAsync({
        path: data.projectPath,
        name: data.projectName,
      });
      navigate(`/${project.id}`);
    } catch {
      setRegistering(false);
    }
  };

  return (
    <VStack
      gap={6}
      css={{ maxWidth: "480px", width: "100%", padding: "0 24px" }}
    >
      <VStack gap={2}>
        <Text
          css={{
            fontSize: "24px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--studio-text-primary)",
            textAlign: "center",
          }}
        >
          Import existing project
        </Text>
        <Text
          css={{
            fontSize: "15px",
            color: "var(--studio-text-tertiary)",
            textAlign: "center",
          }}
        >
          Select your project folder to add it to Studio.
        </Text>
      </VStack>

      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <VStack gap={4} align="stretch">
          {/* Folder selector */}
          <FormField label="Project folder" error={errors.projectPath?.message}>
            <Box
              as="button"
              type="button"
              onClick={handleBrowseClick}
              css={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 14px",
                borderRadius: "8px",
                border: "1px solid var(--studio-border)",
                background: "var(--studio-bg-surface)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.12s ease",
                "&:hover": { borderColor: "var(--studio-border-hover)" },
              }}
            >
              <FolderOpen
                size={16}
                style={{
                  color: projectPath
                    ? "var(--studio-green)"
                    : "var(--studio-text-muted)",
                  flexShrink: 0,
                }}
              />
              <Text
                css={{
                  flex: 1,
                  fontSize: "14px",
                  color: projectPath
                    ? "var(--studio-text-primary)"
                    : "var(--studio-text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: projectPath
                    ? "'SF Mono', 'Fira Code', Menlo, monospace"
                    : "inherit",
                }}
              >
                {projectPath || "Choose a folder..."}
              </Text>
              <Text
                css={{
                  fontSize: "13px",
                  color: "var(--studio-text-tertiary)",
                  flexShrink: 0,
                }}
              >
                Browse
              </Text>
            </Box>
          </FormField>

          {/* Validation info + name */}
          {validationResult?.valid && (
            <Box
              css={{
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid var(--studio-border)",
                background: "var(--studio-bg-sidebar)",
              }}
            >
              <HStack gap={3} css={{ marginBottom: "14px" }}>
                {validationResult.isBlacksmithProject ? (
                  <HStack
                    gap={2}
                    css={{ fontSize: "13px", color: "var(--studio-green)" }}
                  >
                    <Anvil size={14} /> <Text>Blacksmith project</Text>
                  </HStack>
                ) : (
                  <HStack
                    gap={2}
                    css={{
                      fontSize: "13px",
                      color: "var(--studio-text-tertiary)",
                    }}
                  >
                    <Folder size={14} /> <Text>Project folder</Text>
                  </HStack>
                )}
                {validationResult.hasPackageJson && (
                  <HStack
                    gap={1}
                    css={{
                      fontSize: "13px",
                      color: "var(--studio-text-tertiary)",
                    }}
                  >
                    <Package size={12} /> <Text>npm</Text>
                  </HStack>
                )}
                {validationResult.hasGit && (
                  <HStack
                    gap={1}
                    css={{
                      fontSize: "13px",
                      color: "var(--studio-text-tertiary)",
                    }}
                  >
                    <GitBranch size={12} /> <Text>git</Text>
                  </HStack>
                )}
              </HStack>

              <FormField
                label="Project name"
                error={errors.projectName?.message}
              >
                <input
                  {...register("projectName")}
                  placeholder={validationResult.name}
                  style={inputCss}
                />
              </FormField>
            </Box>
          )}

          {/* Submit */}
          <Box
            as="button"
            type="submit"
            disabled={!validation?.valid || registering}
            css={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              background: validation?.valid
                ? "var(--studio-accent)"
                : "var(--studio-bg-surface)",
              color: validation?.valid
                ? "var(--studio-accent-fg)"
                : "var(--studio-text-muted)",
              fontSize: "15px",
              fontWeight: 500,
              cursor: validation?.valid ? "pointer" : "default",
              transition: "all 0.15s ease",
              "&:hover": validation?.valid ? { opacity: 0.9 } : {},
            }}
          >
            {registering ? "Adding project..." : "Add to Studio"}
          </Box>
        </VStack>
      </form>

      <FolderPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleFolderSelected}
      />
    </VStack>
  );
}
