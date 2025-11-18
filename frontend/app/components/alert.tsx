type AlertProps = {
  variant: "error" | "success";
  message?: string | null;
};

export function Alert({ variant, message }: AlertProps) {
  if (!message) return null;

  const base = "mb-4 rounded px-3 py-2 text-xs";
  const styles =
    variant === "error"
      ? "border border-red-200 bg-red-50 text-red-700"
      : "border border-emerald-200 bg-emerald-50 text-emerald-700";

  return <div className={`${base} ${styles}`}>{message}</div>;
}
