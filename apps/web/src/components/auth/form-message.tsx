export function FormMessage({ type, children }: { type: "error" | "success" | "info"; children: React.ReactNode }) {
  const className =
    type === "error"
      ? "border-destructive/30 bg-destructive/10 text-destructive"
      : type === "success"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : "border-border bg-secondary text-secondary-foreground";

  return <div className={`rounded-md border px-3 py-2 text-sm ${className}`}>{children}</div>;
}
