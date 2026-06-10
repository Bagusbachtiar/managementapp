import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deleteUser } from "@/actions/users";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const PER_PAGE = 5;

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      include: {
        roles: { include: { role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengguna</h1>
          <p className="page-subtitle">{total} pengguna terdaftar</p>
        </div>
        <Link href="/users/create" className="btn btn-primary">
          <Plus size={17} /> Tambah
        </Link>
      </div>

      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 56 }}>No</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Peran</th>
              <th>Bergabung</th>
              <th style={{ width: 100, textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="empty-state">Belum ada pengguna</td></tr>
            )}
            {users.map((u, i) => (
              <tr key={u.id}>
                <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{(page - 1) * PER_PAGE + i + 1}</td>
                <td style={{ fontWeight: 600 }}>{u.name}</td>
                <td style={{ color: "var(--text-muted)" }}>{u.email}</td>
                <td>
                  {u.roles[0]?.role.name ? (
                    <span className="badge badge-indigo">{u.roles[0].role.name}</span>
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>-</span>
                  )}
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>{formatDate(u.createdAt)}</td>
                <td>
                  <div className="flex items-center justify-center gap-1.5">
                    <Link href={`/users/${u.id}/edit`} className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem" }}>
                      <Pencil size={17} />
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteUser(u.id);
                    }}>
                      <button type="submit" className="icon-btn icon-btn-red" style={{ width: "2.75rem", height: "2.75rem" }}>
                        <Trash2 size={17} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
