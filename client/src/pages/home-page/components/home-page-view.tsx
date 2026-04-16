import { ConversationInput } from "@/components/shared/conversation";
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
  onSend: (text: string) => void;
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
  return (
    <HomeShell>
      <HomeHero />
      <ConversationInput
        onSend={onSend}
        isStreaming={isStreaming}
        placeholder="Ask Claude to build something..."
        sendShortcut="cmd+enter"
        minHeight="70px"
      />
      <QuickActions mode={mode} onSend={onSend} />

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
