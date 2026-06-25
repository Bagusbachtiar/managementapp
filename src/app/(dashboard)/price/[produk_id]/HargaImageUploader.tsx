"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { addHargaImage, deleteHargaImage } from "@/actions/hargaImage";
import { Trash2, Upload, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ImageItem { id: number; image: string; createdAt: Date; }

interface Props {
  produkId: number;
  produkNama: string;
  images: ImageItem[];
}

export function HargaImageUploader({ produkId, produkNama, images: initial }: Props) {
  const [images, setImages] = useState(initial);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isFull = images.length >= 3;
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      setUploading(true);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Upload gagal");
        await addHargaImage({ produk_id: produkId, image: data.url });
        setImages(prev => [{ id: Date.now(), image: data.url, createdAt: new Date() }, ...prev]);
        toast.success("Foto harga berhasil disimpan");
      } catch (err: any) {
        toast.error(err.message || "Upload gagal");
      } finally {
        setUploading(false);
        setPreview(null);
        if (inputRef.current) inputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteHargaImage(id, produkId);
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success("Foto dihapus");
      } catch {
        toast.error("Gagal menghapus foto");
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Upload area */}
      <div
        onClick={() => !uploading && !isFull && inputRef.current?.click()}
        style={{
          border: "2px dashed var(--border)", borderRadius: "var(--radius)",
          padding: "2rem", textAlign: "center", cursor: uploading || isFull ? "default" : "pointer",
          transition: "border-color 0.15s", background: "var(--card)",
          opacity: isFull ? 0.5 : 1,
        }}
        onMouseEnter={e => !uploading && !isFull && ((e.currentTarget as HTMLElement).style.borderColor = "#6366f1")}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = "var(--border)")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            {preview && <img src={preview} alt="preview" style={{ width: 120, height: 120, objectFit: "cover", borderRadius: "0.5rem", opacity: 0.6 }} />}
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Mengupload...</p>
          </div>
        ) : isFull ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <p style={{ fontWeight: 600, color: "var(--text-muted)", fontSize: "0.9rem" }}>Batas 3 foto tercapai</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Hapus foto lama untuk upload baru</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <Upload size={28} style={{ color: "#6366f1" }} />
            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.9rem" }}>Klik untuk upload foto harga</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>JPG, PNG, WEBP · Maks 3 foto</p>
          </div>
        )}
      </div>

      {/* Gallery */}
      {images.length === 0 ? (
        <div className="empty-state" style={{ padding: "2rem" }}>Belum ada foto harga</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          {images.map((img) => (
            <div key={img.id} className="card" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
              <img
                src={img.image}
                alt="harga"
                onClick={() => setLightbox(img.image)}
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", cursor: "pointer", display: "block" }}
              />
              <div style={{ padding: "0.6rem 0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{formatDate(img.createdAt)}</span>
                <button
                  onClick={() => handleDelete(img.id)}
                  disabled={isPending}
                  className="icon-btn icon-btn-red"
                  style={{ width: "1.8rem", height: "1.8rem", borderRadius: "0.4rem" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
          >
            <X size={18} />
          </button>
          <img
            src={lightbox}
            alt="fullsize"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "0.75rem", objectFit: "contain" }}
          />
        </div>
      )}
    </div>
  );
}
