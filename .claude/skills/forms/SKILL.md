---
name: forms
description: Use React Hook Form with Zod validation for all forms — never use useState for form fields
---

# Forms Guide

All forms in Blacksmith Studio MUST use **React Hook Form** with **Zod** validation. Never use `useState` to manage form field values.

## Core Rule

```tsx
// BAD — never do this
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const handleSubmit = () => {
  api.save({ name, email });
};

// GOOD — always do this
const schema = z.object({ name: z.string().min(1), email: z.string().email() });
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({ resolver: zodResolver(schema) });
const onSubmit = (data) => {
  api.save(data);
};
```

## Dependencies

Both are already installed:

```
react-hook-form    — form state management
@hookform/resolvers — connects Zod to RHF
zod                — schema validation
```

## Standard Pattern

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField, FormInput } from "@/components/shared/form-controls";

// 1. Define schema
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  port: z.coerce.number().min(1000).max(65535),
});

type FormData = z.infer<typeof schema>;

// 2. Initialize form
function MyForm({ onSave, onClose }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      port: 8000,
    },
  });

  // 3. Submit handler receives validated data
  const onSubmit = async (data: FormData) => {
    await api.doSomething(data);
    onClose();
  };

  // 4. Render with register
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Name" error={errors.name?.message}>
        <input {...register("name")} placeholder="Enter name" />
      </FormField>

      <FormField label="Port" error={errors.port?.message}>
        <input {...register("port", { valueAsNumber: true })} type="number" />
      </FormField>

      <button type="submit" disabled={isSubmitting}>
        Save
      </button>
    </form>
  );
}
```

## With Shared Components

Use the shared `FormField` from `@/components/shared/form-controls` for labels, hints, and errors:

```tsx
import { FormField } from "@/components/shared/form-controls";

<FormField
  label="Server Name"
  hint="Lowercase with hyphens"
  error={errors.name?.message}
>
  <input
    {...register("name")}
    placeholder="e.g. my-server"
    style={inputStyles}
  />
</FormField>;
```

## With Chakra UI Inputs

Chakra `Input` works with `register` via spread:

```tsx
import { Input, Textarea, NativeSelect } from '@chakra-ui/react'

// Text input
<Input {...register('name')} placeholder="Name" css={inputCss} />

// Textarea
<Textarea {...register('description')} placeholder="Description" css={inputCss} />

// Select
<NativeSelect.Root>
  <NativeSelect.Field {...register('theme')}>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </NativeSelect.Field>
</NativeSelect.Root>

// Number
<Input {...register('port', { valueAsNumber: true })} type="number" css={inputCss} />
```

## With Modal/Drawer

```tsx
function AddServerModal({ onSave, onClose }: Props) {
  const schema = z.object({
    name: z
      .string()
      .min(1, "Required")
      .regex(/^[a-z0-9-]+$/, "Lowercase and hyphens only"),
    command: z.string().min(1, "Required"),
    args: z.string().optional(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange", // validate on every change for real-time feedback
  });

  return (
    <Modal
      title="Add Server"
      onClose={onClose}
      footer={
        <>
          <FooterSpacer />
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton disabled={!isValid} onClick={handleSubmit(onSave)}>
            Save
          </PrimaryButton>
        </>
      }
    >
      <VStack gap={4} align="stretch">
        <FormField label="Name" error={errors.name?.message}>
          <Input {...register("name")} placeholder="server-name" />
        </FormField>
        <FormField label="Command" error={errors.command?.message}>
          <Input {...register("command")} placeholder="npx" />
        </FormField>
      </VStack>
    </Modal>
  );
}
```

## Common Zod Schemas

```tsx
// Required string
z.string().min(1, "Required");

// Optional string
z.string().optional();

// Name with format constraint
z.string()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only");

// URL
z.string().url("Must be a valid URL");

// Port number
z.coerce.number().min(1000).max(65535);

// Email
z.string().email("Invalid email");

// Optional number with null
z.coerce.number().nullable().optional();

// Enum
z.enum(["stdio", "http"]);

// Key-value pairs
z.array(z.object({ key: z.string(), value: z.string() }));
```

## Editing Existing Data

```tsx
function EditForm({ existing }: { existing: Item }) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: existing.name,
      description: existing.description,
      port: existing.port,
    },
  });
  // ...
}
```

## Watching Values

```tsx
const { watch, setValue } = useForm<FormData>(...)

// Watch a single field
const transport = watch('transport')

// Conditionally show fields
{transport === 'stdio' && (
  <FormField label="Command">
    <Input {...register('command')} />
  </FormField>
)}

// Programmatically set a value
setValue('name', 'auto-generated-name', { shouldValidate: true })
```

## Dynamic Fields (Key-Value Pairs)

```tsx
import { useFieldArray } from "react-hook-form";

const schema = z.object({
  env: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string(),
    }),
  ),
});

function EnvEditor() {
  const { control, register } = useForm({ resolver: zodResolver(schema) });
  const { fields, append, remove } = useFieldArray({ control, name: "env" });

  return (
    <>
      {fields.map((field, i) => (
        <HStack key={field.id}>
          <Input {...register(`env.${i}.key`)} placeholder="KEY" />
          <Input {...register(`env.${i}.value`)} placeholder="Value" />
          <IconButton onClick={() => remove(i)}>
            <Trash2 size={12} />
          </IconButton>
        </HStack>
      ))}
      <Button onClick={() => append({ key: "", value: "" })}>
        Add Variable
      </Button>
    </>
  );
}
```

## Rules

1. **NEVER use `useState` for form field values** — always `useForm` + `register`
2. **ALWAYS define a Zod schema** — even for simple forms
3. **Use `zodResolver`** — connects validation to the form
4. **Use `mode: 'onChange'`** — for real-time validation in modals/drawers
5. **Use `defaultValues`** — for edit forms with existing data
6. **Use `formState.errors`** — pass to `FormField` error prop
7. **Use `formState.isValid`** — to disable submit button
8. **Use `formState.isSubmitting`** — to show loading state
9. **Use `handleSubmit`** — never read form values manually
10. **Use `useFieldArray`** — for dynamic lists (env vars, headers)

## Existing Forms Using This Pattern

- `components/projects/add-project-modal.tsx` — project creation with Zod validation
- `pages/projects/add/import-existing.tsx` — folder path + name validation
- `pages/projects/add/create-new.tsx` — project scaffolding form

## Forms That Need Migration

Any component using `useState` for form fields should be migrated to React Hook Form.

$ARGUMENTS
