"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createTask, updateTask, deleteTask } from "@/actions/tasks";
import type { Task } from "@prisma/client";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";

export function TasksClient({ tasks: initial }: { tasks: Task[] }) {
  const [tasks, setTasks] = useState(initial);
  const [editId, setEditId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [newVal, setNewVal] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newVal.trim()) return;
    const fd = new FormData();
    fd.set("name", newVal);
    startTransition(async () => {
      try {
        await createTask(fd);
        setNewVal("");
        toast.success("Tugas ditambahkan");
        window.location.reload();
      } catch { toast.error("Gagal menambahkan tugas"); }
    });
  }

  function handleUpdate(e: React.FormEvent, id: number) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("name", editVal);
    startTransition(async () => {
      try {
        await updateTask(id, fd);
        setEditId(null);
        toast.success("Tugas diperbarui");
        window.location.reload();
      } catch { toast.error("Gagal memperbarui tugas"); }
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Hapus tugas ini?")) return;
    startTransition(async () => {
      try {
        await deleteTask(id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        toast.success("Tugas dihapus");
      } catch { toast.error("Gagal menghapus tugas"); }
    });
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tugas</h1>
          <p className="page-subtitle">{tasks.length} tugas terdaftar</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-5">
        <input
          value={newVal}
          onChange={(e) => setNewVal(e.target.value)}
          placeholder="Tambah tugas baru..."
          className="form-input"
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={isPending} className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap" }}>
          <Plus size={16} /> Tambah
        </button>
      </form>

      <div className="card">
        {tasks.length === 0 && (
          <div className="empty-state">Belum ada tugas</div>
        )}
        {tasks.map((t, i) => (
          <div key={t.id} className="flex items-center gap-3"
            style={{ padding: "0.9rem 1.25rem", borderBottom: i < tasks.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ flex: 1 }}>
              {editId === t.id ? (
                <form onSubmit={(e) => handleUpdate(e, t.id)} className="flex gap-2 items-center">
                  <input
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    autoFocus
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={isPending} className="icon-btn icon-btn-teal" style={{ width: "2.4rem", height: "2.4rem", flexShrink: 0 }}>
                    <Check size={16} />
                  </button>
                  <button type="button" onClick={() => setEditId(null)} className="icon-btn icon-btn-slate" style={{ width: "2.4rem", height: "2.4rem", flexShrink: 0 }}>
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <span style={{ fontSize: "0.9rem", color: "var(--text)", fontWeight: 500 }}>{t.name}</span>
              )}
            </div>
            {editId !== t.id && (
              <div className="flex gap-1.5">
                <button onClick={() => { setEditId(t.id); setEditVal(t.name); }}
                  className="icon-btn icon-btn-indigo" style={{ width: "2.75rem", height: "2.75rem" }}>
                  <Pencil size={17} />
                </button>
                <button onClick={() => handleDelete(t.id)}
                  className="icon-btn icon-btn-red" style={{ width: "2.75rem", height: "2.75rem" }}>
                  <Trash2 size={17} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
