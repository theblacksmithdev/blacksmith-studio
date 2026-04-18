import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import { useProjectKeys } from "../_shared";

interface AddTaskNoteInput {
  taskId: string;
  authorRole: string;
  content: string;
}

/** Append a breadcrumb to a task; invalidates the notes query on success. */
export function useAddTaskNote() {
  const queryClient = useQueryClient();
  const keys = useProjectKeys();

  return useMutation({
    mutationFn: (input: AddTaskNoteInput) =>
      api.agentTasks.addNote(input.taskId, input.authorRole, input.content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: keys.taskNotes(variables.taskId),
      });
    },
  });
}
