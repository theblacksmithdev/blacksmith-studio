import { Flex, Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import styled from "@emotion/styled";
import { Text } from "@/components/shared/ui";

export const FormInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border-radius: 7px;
  border: 1px solid var(--studio-border);
  background: var(--studio-bg-surface);
  color: var(--studio-text-primary);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.12s ease;

  &::placeholder {
    color: var(--studio-text-muted);
  }
  &:hover:not(:disabled) {
    border-color: var(--studio-border-hover);
  }
  &:focus {
    border-color: var(--studio-border-hover);
    box-shadow: var(--studio-ring-focus);
  }
  &:disabled {
    opacity: 0.5;
  }
`;

interface FormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <Flex direction="column" gap="6px">
      <Text
        css={{
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--studio-text-secondary)",
        }}
      >
        {label}
      </Text>
      {children}
      {hint && (
        <Text css={{ fontSize: "12px", color: "var(--studio-text-muted)" }}>
          {hint}
        </Text>
      )}
    </Flex>
  );
}
