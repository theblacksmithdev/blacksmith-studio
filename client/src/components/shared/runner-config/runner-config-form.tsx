import { useState } from "react";
import { VStack } from "@chakra-ui/react";
import { useConfigForm, toPayload } from "./hooks";
import {
  ConfigFields,
  DrawerTabs,
  EnvEditor,
  type ConfigTab,
} from "./components";
import type { RunnerConfigData } from "@/api/types";

export interface RunnerConfigFormHandle {
  /** True when the form currently validates. Use to gate a submit button. */
  isValid: boolean;
  /** Convenience — wrap the caller's save handler in the form's submit flow. */
  submit: () => Promise<void>;
}

export interface RunnerConfigFormProps {
  /** Pre-existing config to edit; `null`/omitted = create-new. */
  config?: RunnerConfigData | null;
  /** Fires when the form is submitted with a valid payload. */
  onSave: (data: Partial<RunnerConfigData>) => void | Promise<void>;
  /** If true, only the config fields render (no tabs, no env editor). Used by the
   *  onboarding flow to keep the surface compact. */
  compact?: boolean;
  /** Receives the imperative handle so containers (e.g. a drawer footer)
   *  can trigger submission without owning the form state. */
  onReady?: (handle: RunnerConfigFormHandle) => void;
}

/**
 * Headless runner-config form — fields + (optional) env editor, tabs,
 * and validation. Deliberately has no save button: containers (Drawer,
 * inline step, modal…) wrap this and render their own submit UI via
 * the `onReady` handle.
 */
export function RunnerConfigForm({
  config,
  onSave,
  compact = false,
  onReady,
}: RunnerConfigFormProps) {
  const { form, envArray } = useConfigForm(config);
  const [tab, setTab] = useState<ConfigTab>("config");

  const submit = form.handleSubmit(async (data) => {
    await onSave(toPayload(data));
  });

  // Report handle back on every render so the container always has the
  // latest `isValid`. Stable enough — `submit` is recreated each render
  // but consumers call it imperatively when the button is clicked.
  onReady?.({ isValid: form.formState.isValid, submit });

  if (compact) {
    return (
      <VStack align="stretch" gap="14px">
        <ConfigFields
          register={form.register}
          errors={form.formState.errors}
        />
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap="14px">
      <DrawerTabs
        active={tab}
        onChange={setTab}
        envCount={envArray.fields.length}
      />
      {tab === "config" ? (
        <ConfigFields
          register={form.register}
          errors={form.formState.errors}
        />
      ) : (
        <EnvEditor register={form.register} envArray={envArray} />
      )}
    </VStack>
  );
}
