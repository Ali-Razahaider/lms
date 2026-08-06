import { prisma } from "@/lib/prisma";
import { requireTeacher } from "@/lib/teacher";
import { AdminUserActions } from "@/components/admin-user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requireTeacher();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { enrollments: true, courses: true } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">All users</h2>
        <span className="text-sm text-muted">{users.length} total</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <ul className="divide-y divide-border">
          {users.map((user) => {
            const isSelf = user.id === admin.id;
            return (
              <li
                key={user.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{user.name}</p>
                    {isSelf && (
                      <span className="shrink-0 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-medium text-primary">
                        you
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted">{user.email}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted sm:gap-6">
                  <span className="hidden sm:block">
                    {user._count.courses} courses · {user._count.enrollments}{" "}
                    enrolled
                  </span>
                  <span className="hidden sm:block">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  <AdminUserActions
                    userId={user.id}
                    currentRole={user.role}
                    isSelf={isSelf}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
