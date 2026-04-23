import { ChatComposer } from "@/components/shared/conversation";
import type { AttachmentRecord } from "@/components/shared/conversation";
import { useActiveProjectId } from "@/api/hooks/_shared";
import { HomeHero } from "./home-hero";
import { QuickActions } from "./quick-actions";
import { HomeShell, SectionDivider } from "./home-shell";
import { RecentSection, type RecentEntry } from "./recent-section";
import { ConfirmDialog } from "@/components/shared/ui";
import type { WorkMode } from "@/stores/ui-store";

export interface HomePageViewProps {
  mode: WorkMode;
  isStreaming: boolean;
  recentItems: RecentEntry[];
  recentLabel?: string;
  onSend: (text: string, attachments?: AttachmentRecord[]) => void;
  onSelectRecent: (id: string) => void;
  onDeleteRecent?: (id: string) => void;
  deleteConfirm?: {
    target: string | null;
    message: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
  };
}

export function HomePageView({
  mode,
  isStreaming,
  recentItems,
  recentLabel,
  onSend,
  onSelectRecent,
  onDeleteRecent,
  deleteConfirm,
}: HomePageViewProps) {
  const projectId = useActiveProjectId();

  return (
    <HomeShell>
      <HomeHero />
      <ChatComposer
        variant="spacious"
        onSend={onSend}
        isStreaming={isStreaming}
        projectId={projectId ?? undefined}
        draftKey="new-conversation"
      />
      <QuickActions mode={mode} onSend={(text) => onSend(text)} />

      {recentItems.length > 0 ? (
        <>
          <SectionDivider />
          <RecentSection
            label={recentLabel}
            items={recentItems}
            onSelect={onSelectRecent}
            onDelete={onDeleteRecent}
          />
        </>
      ) : null}

      {deleteConfirm?.target && (
        <ConfirmDialog
          message={deleteConfirm.message}
          description={deleteConfirm.description}
          onConfirm={deleteConfirm.onConfirm}
          onCancel={deleteConfirm.onCancel}
        />
      )}
    </HomeShell>
  );
}
