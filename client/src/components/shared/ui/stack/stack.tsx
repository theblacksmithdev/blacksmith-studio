import { Flex, type FlexProps } from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";
import { spacing, type Spacing } from "../tokens";

interface StackProps extends FlexProps {
  /** Gap between items — uses spacing tokens */
  gap?: Spacing;
  /** Horizontal stack (default is vertical) */
  horizontal?: boolean;
}

export function Stack({
  gap: gapKey = "sm",
  horizontal = false,
  css: cssProp,
  children,
  ...rest
}: StackProps) {
  const merged: SystemStyleObject = {
    display: "flex",
    flexDirection: horizontal ? "row" : "column",
    alignItems: horizontal ? "center" : "stretch",
    gap: spacing[gapKey],
    ...((cssProp as SystemStyleObject) ?? {}),
  };

  return (
    <Flex css={merged} {...rest}>
      {children}
    </Flex>
  );
}

/** Horizontal stack — shorthand for <Stack horizontal> */
export function HStack({
  gap: gapKey = "sm",
  css: cssProp,
  children,
  ...rest
}: StackProps) {
  return (
    <Stack horizontal gap={gapKey} css={cssProp} {...rest}>
      {children}
    </Stack>
  );
}

/** Vertical stack — shorthand for <Stack> */
export function VStack({
  gap: gapKey = "sm",
  css: cssProp,
  children,
  ...rest
}: StackProps) {
  return (
    <Stack gap={gapKey} css={cssProp} {...rest}>
      {children}
    </Stack>
  );
}
