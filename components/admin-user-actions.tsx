"use client";

import { useActionState } from "react";
import { changeUserRole, deleteUser } from "@/lib/actions/admin";

type Props = {
  userId: string;
  currentRole: "STUDENT" | "TEACHER";
  isSelf: boolean;
};

export function AdminUserActions({ userId, currentRole, isSelf }: Props) {
  const [roleState, roleAction, rolePending] = useActionState(
    changeUserRole.bind(null, userId),
    { error: undefined }
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteUser.bind(null, userId),
    { error: undefined }
  );

  return (
    <div className="flex items-center gap-2">
      <form action={roleAction}>
        <select
          name="role"
          defaultValue={currentRole}
          disabled={rolePending || isSelf}
          onChange={(e) => e.target.form?.requestSubmit()}
          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <option value="STUDENT">Student</option>
          <option value="TEACHER">Teacher</option>
        </select>
      </form>

      <form action={deleteAction}>
        <button
          type="submit"
          disabled={deletePending || isSelf}
          onClick={(e) => {
            if (!window.confirm("Delete this user? This removes their courses and progress permanently.")) {
              e.preventDefault();
            }
          }}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </form>

      {(roleState.error || deleteState.error) && (
        <span className="text-xs text-red-600">
          {roleState.error ?? deleteState.error}
        </span>
      )}
    </div>
  );
}
