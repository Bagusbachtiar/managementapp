import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { deleteRole } from "@/actions/roles";
import { Plus, Pencil, Trash2 } from "lucide-react";

const PER_PAGE = 5;

export default async function RolesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const canView = await hasPermission("role-list");
  if (!canView) redirect("/dashboard");

  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const canDelete = await hasPermission("role-delete");
  const canEdit = await hasPermission("role-edit");
  const canCreate = await hasPermission("role-create");

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      include: { permissions: { include: { permission: true } } },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
    }),
    prisma.role.count(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Peran</h1>
          <p className="page-subtitle">{total} peran terdaftar</p>
        </div>
        {canCreate && (
          <Link href="/roles/create" className="btn btn-primary">
            <Plus size={17} /> Tambah
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {roles.length === 0 && (
          <div className="card empty-state">Belum ada peran</div>
        )}
        {roles.map((r) => (
          <div key={r.id} className="card" style={{ padding: "1.25rem 1.5rem" }}>
            <div className="flex items-start justify-between">
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: "0.6rem" }}>
                  {r.name}
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.permissions.length === 0 && (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>Tidak ada izin</span>
                  )}
                  {r.permissions.map((rp) => (
                    <span key={rp.permissionId} className="badge badge-indigo">
                      {rp.permission.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-1.5" style={{ marginLeft: "1rem", flexShrink: 0 }}>
                {canEdit && (
                  <Link href={`/roles/${r.id}/edit`} className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem" }}>
                    <Pencil size={17} />
                  </Link>
                )}
                {canDelete && (
                  <form action={async () => { "use server"; await deleteRole(r.id); }}>
                    <button type="submit" className="icon-btn icon-btn-red" style={{ width: "2.75rem", height: "2.75rem" }}>
                      <Trash2 size={17} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link key={p} href={`?page=${p}`}
              className={`btn btn-sm ${p === page ? "btn-primary" : "btn-secondary"}`}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
