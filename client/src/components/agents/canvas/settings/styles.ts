import styled from "@emotion/styled";

export const Section = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--studio-text-muted);
  margin-bottom: 10px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
`;

export const RowLabel = styled.span`
  font-size: 13px;
  font-weight: 450;
  color: var(--studio-text-secondary);
`;

export const SliderWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SliderValue = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--studio-text-muted);
  min-width: 28px;
  text-align: right;
  font-variant-numeric: tabular-nums;
`;

export const Slider = styled.input`
  -webkit-appearance: none;
  width: 100px;
  height: 3px;
  border-radius: 2px;
  background: var(--studio-bg-hover);
  outline: none;
  cursor: pointer;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--studio-accent);
    border: 2px solid var(--studio-bg-surface);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
  }
`;

export const SegmentRow = styled.div`
  display: flex;
  gap: 3px;
  background: var(--studio-bg-hover);
  border-radius: 8px;
  padding: 3px;
`;

export const SegmentBtn = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;
  white-space: nowrap;

  background: ${({ $active }) =>
    $active ? "var(--studio-bg-surface)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--studio-text-primary)" : "var(--studio-text-muted)"};
  box-shadow: ${({ $active }) =>
    $active ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none"};

  &:hover {
    color: var(--studio-text-secondary);
  }
`;

export const ToggleTrack = styled.button<{ $on: boolean }>`
  width: 32px;
  height: 18px;
  border-radius: 9px;
  border: none;
  padding: 2px;
  cursor: pointer;
  transition: background 0.15s ease;
  flex-shrink: 0;
  background: ${({ $on }) =>
    $on
      ? "var(--studio-green)"
      : "var(--studio-bg-hover-strong, var(--studio-bg-hover))"};

  &::after {
    content: "";
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    transition: transform 0.15s ease;
    transform: translateX(${({ $on }) => ($on ? "14px" : "0")});
  }
`;

export const ResetBtn = styled.button`
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-main);
  color: var(--studio-text-muted);
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.12s ease;

  &:hover {
    border-color: var(--studio-border-hover);
    color: var(--studio-text-secondary);
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: var(--studio-border);
  margin: 16px 0;
  opacity: 0.6;
`;
