import type { ResultLine } from "../engine/results";

export type Toast = ResultLine & { id: string };

export function ToastCenter(props: { toasts: Toast[] }) {
  const { toasts } = props;

  return (
    <div
      style={{
        position: "fixed",
        right: 14,
        top: 78,
        display: "grid",
        gap: 10,
        zIndex: 9999,
        width: 320
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            border: "1px solid #333",
            background: "#111",
            padding: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}
        >
          <div style={{ fontSize: 13, opacity: 0.9 }}>{t.text}</div>
        </div>
      ))}
    </div>
  );
}