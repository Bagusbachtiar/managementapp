"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onUpload: (url: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  currentUrl?: string;
}

export function ImageUpload({ onUpload, onLoadingChange, currentUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function setLoadingState(v: boolean) {
    setLoading(v);
    onLoadingChange?.(v);
  }

  async function handleFile(file: File) {
    setLoadingState(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: "image/jpeg",
        initialQuality: 0.7,
      });

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        setPreview(base64);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ base64 }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          toast.error("Gagal upload: " + (data.error ?? "Unknown error"));
          setPreview(null);
          setLoadingState(false);
          return;
        }
        onUpload(data.url);
        setLoadingState(false);
        toast.success("Gambar berhasil diupload");
      };
      reader.readAsDataURL(compressed);
    } catch (err: any) {
      setLoadingState(false);
      toast.error("Gagal upload: " + (err?.message ?? ""));
    }
  }

  return (
    <div>
      <div
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${loading ? "var(--primary)" : "var(--border)"}`,
          borderRadius: "0.65rem",
          padding: "1rem",
          cursor: loading ? "wait" : "pointer",
          transition: "border-color 0.15s",
          background: loading ? "#f5f3ff" : "white",
        }}
      >
        {preview && !loading ? (
          <div style={{ position: "relative", width: "100%", height: 160 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "0.4rem" }} />
          </div>
        ) : loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 128, color: "var(--primary)", gap: "0.5rem" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>Mengupload...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 128, color: "var(--text-muted)", gap: "0.4rem" }}>
            <Upload size={26} />
            <p style={{ fontSize: "0.875rem" }}>Klik untuk upload gambar</p>
            <p style={{ fontSize: "0.75rem" }}>Max 800px · JPEG</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
