"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { PriceRow } from "../PriceRow";
import type { Kategori, Stok } from "@prisma/client";

type StokWithKategori = Stok & { kategori: Kategori };

interface Group { id: string; name: string; }
interface GroupData { groups: Group[]; assignments: Record<number, string>; }

const UNGROUPED = "__ungrouped__";

function load(produkId: number): GroupData {
  if (typeof window === "undefined") return { groups: [], assignments: {} };
  try {
    const raw = localStorage.getItem(`price-groups-${produkId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { groups: [], assignments: {} };
}

function save(produkId: number, data: GroupData) {
  localStorage.setItem(`price-groups-${produkId}`, JSON.stringify(data));
}

export function PriceGroupManager({ produkId, stoks }: { produkId: number; stoks: StokWithKategori[] }) {
  const [data, setData] = useState<GroupData>({ groups: [], assignments: {} });
  const [mounted, setMounted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [dragStokId, setDragStokId] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => { setData(load(produkId)); setMounted(true); }, [produkId]);

  if (!mounted) return null;

  function update(fn: (d: GroupData) => GroupData) {
    setData(prev => {
      const next = fn(prev);
      save(produkId, next);
      return next;
    });
  }

  function addGroup() {
    const id = `g-${Date.now()}`;
    const name = `Grup ${data.groups.length + 1}`;
    update(d => ({ ...d, groups: [...d.groups, { id, name }] }));
    setEditingId(id);
    setEditingName(name);
  }

  function renameGroup(id: string) {
    if (!editingName.trim()) { setEditingId(null); return; }
    update(d => ({ ...d, groups: d.groups.map(g => g.id === id ? { ...g, name: editingName.trim() } : g) }));
    setEditingId(null);
  }

  function deleteGroup(id: string) {
    update(d => ({
      groups: d.groups.filter(g => g.id !== id),
      assignments: Object.fromEntries(Object.entries(d.assignments).filter(([, gid]) => gid !== id)),
    }));
  }

  function assign(stokId: number, groupId: string | null) {
    update(d => {
      const next = { ...d.assignments };
      if (groupId === null) delete next[stokId]; else next[stokId] = groupId;
      return { ...d, assignments: next };
    });
  }

  function handleDrop(groupId: string | null) {
    if (dragStokId !== null) assign(dragStokId, groupId);
    setDragStokId(null);
    setDragOver(null);
  }

  const ungrouped = stoks.filter(s => !data.assignments[s.id]);

  function StokTable({ list, inGroup }: { list: StokWithKategori[]; inGroup: boolean }) {
    if (list.length === 0) return (
      <div style={{ padding: "1.1rem", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
        {inGroup ? "Seret tipe ke sini" : "Semua tipe sudah dikelompokkan"}
      </div>
    );
    return (
      <table className="data-table" style={{ tableLayout: "fixed", width: "100%" }}>
        <colgroup>
          <col style={{ width: "2rem" }} />
          <col style={{ width: "35%" }} />
          <col style={{ width: "70px" }} />
          <col />
        </colgroup>
        <tbody>
          {list.map(s => (
            <PriceRow
              key={s.id}
              stokId={s.id}
              namaTipe={s.nama_tipe}
              kategori={s.kategori.kategori}
              jumlah={s.jumlah}
              harga={s.harga}
              draggable
              onDragStart={() => setDragStokId(s.id)}
              onDragEnd={() => { setDragStokId(null); setDragOver(null); }}
            />
          ))}
        </tbody>
      </table>
    );
  }

  const dropZoneStyle = (key: string): React.CSSProperties => ({
    border: `2px solid ${dragOver === key ? "#6366f1" : "var(--border)"}`,
    borderRadius: "var(--radius)",
    overflow: "hidden",
    transition: "border-color 0.15s",
    background: dragOver === key ? "rgba(99,102,241,0.04)" : undefined,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button onClick={addGroup} className="btn btn-secondary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Plus size={14} /> Tambah Grup
        </button>
      </div>

      {data.groups.map(group => {
        const groupStoks = stoks.filter(s => data.assignments[s.id] === group.id);
        return (
          <div key={group.id}
            style={dropZoneStyle(group.id)}
            onDragOver={e => { e.preventDefault(); setDragOver(group.id); }}
            onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
            onDrop={() => handleDrop(group.id)}
          >
            <div style={{ padding: "0.55rem 0.9rem", background: "var(--bg)", borderBottom: groupStoks.length > 0 || dragOver === group.id ? "1px solid var(--border)" : undefined, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {editingId === group.id ? (
                <>
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") renameGroup(group.id); if (e.key === "Escape") setEditingId(null); }}
                    className="form-input"
                    style={{ flex: 1, padding: "0.2rem 0.5rem", fontSize: "0.85rem" }}
                  />
                  <button onClick={() => renameGroup(group.id)} className="icon-btn icon-btn-green" style={{ width: "1.7rem", height: "1.7rem", borderRadius: "0.3rem" }}><Check size={12} /></button>
                  <button onClick={() => setEditingId(null)} className="icon-btn icon-btn-slate" style={{ width: "1.7rem", height: "1.7rem", borderRadius: "0.3rem" }}><X size={12} /></button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem", color: "var(--text)" }}>{group.name}</span>
                  <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>{groupStoks.length} tipe</span>
                  <button onClick={() => { setEditingId(group.id); setEditingName(group.name); }} className="icon-btn icon-btn-slate" style={{ width: "1.7rem", height: "1.7rem", borderRadius: "0.3rem" }}><Pencil size={11} /></button>
                  <button onClick={() => deleteGroup(group.id)} className="icon-btn icon-btn-red" style={{ width: "1.7rem", height: "1.7rem", borderRadius: "0.3rem" }}><Trash2 size={11} /></button>
                </>
              )}
            </div>
            <StokTable list={groupStoks} inGroup />
          </div>
        );
      })}

      {/* Ungrouped — only show when there are unassigned tipes OR being dragged into */}
      {(ungrouped.length > 0 || dragOver === UNGROUPED) && (
        <div
          style={dropZoneStyle(UNGROUPED)}
          onDragOver={e => { e.preventDefault(); setDragOver(UNGROUPED); }}
          onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
          onDrop={() => handleDrop(null)}
        >
          <div style={{ padding: "0.55rem 0.9rem", background: "var(--bg)", borderBottom: ungrouped.length > 0 ? "1px solid var(--border)" : undefined, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ flex: 1, fontWeight: 600, fontSize: "0.875rem", color: "var(--text-muted)" }}>Tidak Dikelompokkan</span>
            <span className="badge badge-indigo" style={{ fontSize: "0.65rem" }}>{ungrouped.length} tipe</span>
          </div>
          <StokTable list={ungrouped} inGroup={false} />
        </div>
      )}
    </div>
  );
}
