"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";
import { updateStokHarga } from "@/actions/stok";
import { formatRupiah } from "@/lib/utils";

interface Props {
  stokId: number;
  namaTipe: string;
  kategori: string;
  jumlah: number;
  harga: number;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function formatInput(val: number): string {
  if (!val) return "";
  return new Intl.NumberFormat("id-ID").format(val);
}

export function PriceRow({ stokId, namaTipe, kategori, jumlah, harga: initialHarga, draggable, onDragStart, onDragEnd }: Props) {
  const [editing, setEditing] = useState(false);
  const [harga, setHarga] = useState(initialHarga);
  const [input, setInput] = useState(formatInput(initialHarga));
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    const num = parseInt(raw, 10) || 0;
    setInput(num ? new Intl.NumberFormat("id-ID").format(num) : "");
  }

  function handleSave() {
    const val = parseInt(input.replace(/\D/g, ""), 10) || 0;
    if (val < 0) return;
    startTransition(async () => {
      try {
        await updateStokHarga({ id: stokId, harga: val });
        setHarga(val);
        setEditing(false);
        toast.success("Harga disimpan");
      } catch {
        toast.error("Gagal menyimpan harga");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setEditing(false); setInput(formatInput(harga)); }
  }

  return (
    <tr draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd}
      style={{ cursor: draggable ? "grab" : undefined, opacity: 1 }}>
      {draggable && (
        <td style={{ verticalAlign: "middle", width: "2rem", color: "var(--text-muted)", paddingLeft: "0.5rem" }}>
          <GripVertical size={15} />
        </td>
      )}
      <td style={{ verticalAlign: "middle" }}>
        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{namaTipe}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{kategori}</div>
      </td>
      <td style={{ verticalAlign: "middle" }}>
        <span className={`badge ${jumlah <= 0 ? "badge-red" : "badge-green"}`}>{jumlah}</span>
      </td>
      <td style={{ verticalAlign: "middle" }}>
        {editing ? (
          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: "0.6rem", fontSize: "0.8rem", color: "var(--text-muted)", pointerEvents: "none" }}>Rp</span>
              <input
                autoFocus
                type="text"
                inputMode="numeric"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="form-input"
                style={{ width: "10rem", padding: "0.35rem 0.6rem 0.35rem 2rem", fontSize: "0.875rem" }}
                placeholder="0"
              />
            </div>
            <button onClick={handleSave} disabled={isPending} className="btn btn-primary btn-sm">
              {isPending ? "..." : "Simpan"}
            </button>
            <button onClick={() => { setEditing(false); setInput(formatInput(harga)); }} className="btn btn-secondary btn-sm">
              Batal
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", justifyContent: "center" }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: harga === 0 ? "var(--text-muted)" : "var(--text)" }}>
              {harga === 0 ? "Belum diset" : formatRupiah(harga)}
            </span>
            <button onClick={() => { setEditing(true); setInput(formatInput(harga)); }} className="btn btn-secondary btn-sm">
              Edit
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
