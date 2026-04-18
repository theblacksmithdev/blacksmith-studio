import { Flex } from "@chakra-ui/react";
import { Home, RotateCcw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { spacing, radii } from "@/components/shared/ui";
import styled from "@emotion/styled";

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: ${radii.lg};
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  border: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.12s ease, opacity 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    opacity: 0.92;
  }

  &:active {
    transform: translateY(0);
  }
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  border-radius: ${radii.lg};
  background: transparent;
  color: var(--studio-text-secondary);
  border: 1px solid var(--studio-border);
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.12s ease, border-color 0.12s ease, background 0.12s ease;

  &:hover {
    color: var(--studio-text-primary);
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-hover);
  }
`;

interface ErrorActionsProps {
  primary?: "home" | "reload";
  showBack?: boolean;
}

export function ErrorActions({
  primary = "home",
  showBack = true,
}: ErrorActionsProps) {
  const navigate = useNavigate();
  const reload = () => window.location.reload();
  const goHome = () => navigate("/", { replace: true });
  const goBack = () => navigate(-1);

  return (
    <Flex gap={spacing.sm} align="center" wrap="wrap" justify="center">
      {primary === "home" ? (
        <PrimaryBtn onClick={goHome}>
          <Home size={14} />
          Back to home
        </PrimaryBtn>
      ) : (
        <PrimaryBtn onClick={reload}>
          <RotateCcw size={14} />
          Reload
        </PrimaryBtn>
      )}
      {showBack && (
        <GhostBtn onClick={goBack}>
          <ArrowLeft size={14} />
          Go back
        </GhostBtn>
      )}
      {primary === "home" && (
        <GhostBtn onClick={reload}>
          <RotateCcw size={14} />
          Reload
        </GhostBtn>
      )}
    </Flex>
  );
}
