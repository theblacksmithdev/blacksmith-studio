import styled from "@emotion/styled";
import { useAttachmentImageUrl } from "@/api/hooks/attachments";
import { getFileIcon } from "@/components/shared/code-block";
import { radii } from "@/components/shared/ui";
import type { BubbleAttachment } from "./types";

interface AttachmentThumbnailProps {
  attachment: BubbleAttachment;
}

const Card = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  aspect-ratio: 1 / 1;
  width: 100%;
  padding: 0;
  border: 1px solid var(--studio-border);
  border-radius: ${radii.lg};
  background: var(--studio-bg-inset);
  cursor: pointer;
  overflow: hidden;
  font: inherit;
  color: inherit;
  transition:
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.12s ease,
    box-shadow 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  }

  &:focus-visible {
    outline: none;
    border-color: var(--studio-accent);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ImageFill = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const IconWrap = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--studio-text-secondary);
`;

const Footer = styled.div`
  position: relative;
  z-index: 1;
  padding: 6px 8px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.72) 0%,
    rgba(0, 0, 0, 0.45) 60%,
    rgba(0, 0, 0, 0) 100%
  );
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const PlainFooter = styled.div`
  position: relative;
  z-index: 1;
  padding: 6px 8px;
  background: var(--studio-bg-main);
  border-top: 1px solid var(--studio-border);
  display: flex;
  flex-direction: column;
  gap: 1px;
`;

const FooterName = styled.span<{ $onImage?: boolean }>`
  font-size: 11px;
  font-weight: 500;
  line-height: 1.25;
  color: ${({ $onImage }) =>
    $onImage ? "rgba(255,255,255,0.96)" : "var(--studio-text-primary)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FooterMeta = styled.span<{ $onImage?: boolean }>`
  font-size: 10px;
  line-height: 1.25;
  color: ${({ $onImage }) =>
    $onImage ? "rgba(255,255,255,0.72)" : "var(--studio-text-muted)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export function AttachmentThumbnail({ attachment }: AttachmentThumbnailProps) {
  const isImage = attachment.kind === "image";
  const canLoadImage =
    isImage && !!attachment.projectId && !!attachment.absPath;

  const { url } = useAttachmentImageUrl(
    canLoadImage ? attachment.projectId : undefined,
    canLoadImage ? attachment.absPath : undefined,
  );

  const FileIcon = getFileIcon(attachment.kind, attachment.name);
  const onImage = isImage && !!url;

  return (
    <Card
      type="button"
      onClick={attachment.onClick}
      aria-label={attachment.name}
    >
      {onImage ? (
        <ImageFill src={url!} alt={attachment.name} draggable={false} />
      ) : (
        <IconWrap>
          <FileIcon size={28} />
        </IconWrap>
      )}
      {onImage ? (
        <Footer>
          <FooterName $onImage>{attachment.name}</FooterName>
          {attachment.meta && (
            <FooterMeta $onImage>{attachment.meta}</FooterMeta>
          )}
        </Footer>
      ) : (
        <PlainFooter>
          <FooterName>{attachment.name}</FooterName>
          {attachment.meta && <FooterMeta>{attachment.meta}</FooterMeta>}
        </PlainFooter>
      )}
    </Card>
  );
}
