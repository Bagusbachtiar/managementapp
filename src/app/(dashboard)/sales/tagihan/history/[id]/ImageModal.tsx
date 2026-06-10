"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function ImageModal({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt ?? "bukti"}
        onClick={() => setOpen(true)}
        style={{
          width: 90, height: 90, objectFit: "cover",
          borderRadius: "0.55rem", border: "2px solid var(--border)",
          display: "block", margin: "0 auto", cursor: "zoom-in",
          transition: "transform 0.15s, border-color 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      />

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
          }}
        >
          <button
            onClick={() => setOpen(false)}
            style={{
              position: "absolute", top: "1.25rem", right: "1.25rem",
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "0.5rem",
              color: "white", width: "2.4rem", height: "2.4rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", backdropFilter: "blur(4px)",
            }}
          >
            <X size={18} />
          </button>
          <img
            src={src}
            alt={alt ?? "bukti"}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90vw", maxHeight: "88vh",
              borderRadius: "0.75rem",
              boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
              objectFit: "contain",
            }}
          />
        </div>
      )}
    </>
  );
}
