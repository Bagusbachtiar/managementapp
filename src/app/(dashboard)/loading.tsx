export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
    }}>
      <div style={{
        width: "2.2rem",
        height: "2.2rem",
        borderRadius: "50%",
        border: "3px solid var(--border)",
        borderTopColor: "#6366f1",
        animation: "spin 0.7s linear infinite",
      }} />
    </div>
  );
}
