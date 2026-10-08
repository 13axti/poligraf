export const STATUS: Record<string, { label: string; cls: string }> = {
  new: { label: "Yeni", cls: "bg-accent text-white" },
  in_progress: { label: "İcrada", cls: "bg-brand text-white" },
  ready: { label: "Hazırdır", cls: "bg-emerald-500 text-white" },
  done: { label: "Təhvil verildi", cls: "bg-foreground text-white" },
  cancelled: { label: "Ləğv edildi", cls: "bg-neutral-300 text-neutral-700" },
};
