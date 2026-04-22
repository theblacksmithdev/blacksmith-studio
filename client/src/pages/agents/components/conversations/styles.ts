import styled from "@emotion/styled";

/* ── Layout ── */

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
`;

export const Content = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  min-height: 0;
`;

export const Stack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
  max-width: 620px;
  padding: 40px 24px;
  margin: 0 auto;
`;

/* ── Hero ── */

export const HeroWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const HeroIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--studio-green-border),
    var(--studio-green-subtle)
  );
  border: 1px solid var(--studio-green-border);
  color: var(--studio-green);
  margin-bottom: 4px;
`;

export const HeroTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--studio-text-primary);
  text-align: center;
  line-height: 1.2;
`;

export const HeroSub = styled.p`
  font-size: 15px;
  color: var(--studio-text-muted);
  text-align: center;
  line-height: 1.5;
  max-width: 360px;
`;

/* ── Agent Roster ── */

export const RosterWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 4px 0;
`;

export const RosterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--studio-bg-surface);
  border: 1px solid var(--studio-border);
  font-size: 11px;
  font-weight: 500;
  color: var(--studio-text-tertiary);
`;

/* ── New Button ── */

export const NewBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 24px;
  border-radius: 12px;
  border: none;
  background: var(--studio-accent);
  color: var(--studio-accent-fg);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    opacity: 0.85;
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(0);
  }
`;

/* ── Quick Actions ── */

export const ActionsWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
`;

export const ActionChip = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-secondary);
  font-size: 14px;
  font-weight: 450;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
  white-space: nowrap;

  .arrow {
    opacity: 0;
    transform: translateX(-2px);
    transition: all 0.15s ease;
    color: var(--studio-text-tertiary);
    display: flex;
  }

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-primary);
    background: var(--studio-bg-surface);
    .arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

/* ── Divider + Section ── */

export const Divider = styled.div`
  width: 40px;
  height: 1px;
  background: var(--studio-border);
  margin: 4px 0;
  opacity: 0.6;
`;

export const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  width: 100%;
  text-align: left;
`;

/* ── Conversation Card ── */

export const ConvCard = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    background: var(--studio-bg-surface);
  }
`;

export const ConvIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--studio-bg-surface);
  color: var(--studio-text-tertiary);
  flex-shrink: 0;
`;

export const DeleteBtn = styled.button`
  padding: 6px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--studio-text-muted);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s ease;
  flex-shrink: 0;
  opacity: 0;

  .conv-card:hover & { opacity: 1; }
  &:hover { background: var(--studio-error-subtle)); color: var(--studio-error); }
`;

export const Sep = styled.span`
  font-size: 10px;
  color: var(--studio-border-hover);
`;
