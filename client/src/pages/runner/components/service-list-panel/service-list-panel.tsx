import { Flex } from "@chakra-ui/react";
import { Plus } from "lucide-react";
import { RunnerConfigDrawer } from "@/components/shared/runner-config";
import { DiagnoseDrawer } from "../logs/components";
import { useActiveService } from "../../hooks/use-active-service";
import { useServiceActions } from "../../hooks/use-service-actions";
import {
  Text,
  Badge,
  Skeleton,
  ConfirmDialog,
  spacing,
  radii,
} from "@/components/shared/ui";
import { useServiceList } from "./hooks/use-service-list";
import { ServiceListHeader } from "./components/service-list-header";
import { ServiceItem } from "./components/service-item";

export function ServiceListPanel() {
  const { activeId, selectService, isSelected } = useActiveService();
  const { services, configs, isLoading, anyActive } = useServiceList();
  const {
    modalConfig,
    deleteTarget,
    diagnoseDrawer,
    setModalConfig,
    setDeleteTarget,
    setDiagnoseDrawer,
    handleSave,
    handleDelete,
    handleDiagnose,
    handleSetup,
    start,
    stop,
    startAll,
    stopAll,
  } = useServiceActions();

  return (
    <Flex
      direction="column"
      css={{ height: "100%", background: "var(--studio-bg-sidebar)" }}
    >
      <ServiceListHeader
        hasServices={services.length > 0}
        anyActive={anyActive}
        onAdd={() => setModalConfig("new")}
        onStartAll={startAll}
        onStopAll={stopAll}
      />

      <Flex
        direction="column"
        gap="2px"
        css={{
          flex: 1,
          overflowY: "auto",
          padding: `0 ${spacing.xs} ${spacing.sm}`,
        }}
      >
        {/* All logs */}
        <Flex
          as="button"
          align="center"
          gap={spacing.sm}
          onClick={() => selectService(null)}
          css={{
            padding: `${spacing.sm} ${spacing.sm}`,
            borderRadius: radii.md,
            border: "none",
            background:
              activeId === null ? "var(--studio-bg-hover)" : "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
            textAlign: "left",
            width: "100%",
            transition: "background 0.1s ease",
            "&:hover": { background: "var(--studio-bg-surface)" },
          }}
        >
          <Text
            variant="bodySmall"
            css={{ fontWeight: activeId === null ? 500 : 400, flex: 1 }}
          >
            All Logs
          </Text>
          {services.length > 0 && (
            <Badge variant="default" size="sm">
              {services.length}
            </Badge>
          )}
        </Flex>

        {/* Service items */}
        {services.map((svc) => {
          const config = configs.find((c) => c.id === svc.id);
          return (
            <ServiceItem
              key={svc.id}
              service={svc}
              config={config}
              selected={isSelected(svc.id)}
              onSelect={() => selectService(svc.id)}
              onStart={() => start(svc.id)}
              onStop={() => stop(svc.id)}
              onSetup={() => handleSetup(svc.id)}
              onViewDetails={() => {
                if (config) setModalConfig(config as any);
              }}
              onDiagnose={() => handleDiagnose(svc.id)}
              onDelete={() => setDeleteTarget({ id: svc.id, name: svc.name })}
            />
          );
        })}

        {isLoading ? (
          <Flex
            direction="column"
            gap={spacing.sm}
            css={{ padding: spacing.md }}
          >
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="70%" />
          </Flex>
        ) : services.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            gap={spacing.sm}
            css={{ padding: spacing["3xl"] }}
          >
            <Text variant="caption" color="muted">
              No services detected
            </Text>
            <Flex
              as="button"
              align="center"
              gap={spacing.xs}
              onClick={() => setModalConfig("new")}
              css={{
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: radii.md,
                border: "1px dashed var(--studio-border)",
                background: "transparent",
                color: "var(--studio-text-muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "12px",
                transition: "all 0.1s ease",
                "&:hover": {
                  borderColor: "var(--studio-border-hover)",
                  color: "var(--studio-text-secondary)",
                },
              }}
            >
              <Plus size={12} /> Add service
            </Flex>
          </Flex>
        ) : null}
      </Flex>

      {modalConfig && (
        <RunnerConfigDrawer
          config={modalConfig === "new" ? null : modalConfig}
          onSave={handleSave}
          onClose={() => setModalConfig(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Remove "${deleteTarget.name}"?`}
          description="This will remove the service configuration. You can always add it back later."
          confirmLabel="Remove"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {diagnoseDrawer && (
        <DiagnoseDrawer
          sessionId={diagnoseDrawer.sessionId}
          initialPrompt={diagnoseDrawer.prompt}
          title={diagnoseDrawer.title}
          onClose={() => setDiagnoseDrawer(null)}
        />
      )}
    </Flex>
  );
}
