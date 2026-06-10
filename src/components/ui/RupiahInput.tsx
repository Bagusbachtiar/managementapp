"use client";

interface Props {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

function formatDots(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function RupiahInput({ value, onChange, placeholder = "0", required, className, style }: Props) {
  const displayed = formatDots(value);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
    onChange(raw);
  }

  return (
    <div style={{ position: "relative", ...style }}>
      <span style={{
        position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)",
        fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, pointerEvents: "none",
        userSelect: "none",
      }}>
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={displayed}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        className={className ?? "form-input"}
        style={{ paddingLeft: "2.4rem" }}
      />
    </div>
  );
}
