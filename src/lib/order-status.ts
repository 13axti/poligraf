// Statuslar çap mürəkkəbləri kimi: yeni = narıncı (brend), icrada = cyan, hazır = sarı, təhvil = qara
export const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  new: { label: "Yeni", cls: "bg-[#ff5a1f] text-white", dot: "#ff5a1f" },
  in_progress: { label: "İcrada", cls: "bg-[#0e9fbc] text-white", dot: "#0e9fbc" },
  ready: { label: "Hazırdır", cls: "bg-[#f5b301] text-[#1b1d1f]", dot: "#f5b301" },
  done: { label: "Təhvil verildi", cls: "bg-[#1b1d1f] text-white", dot: "#1b1d1f" },
  cancelled: { label: "Ləğv edildi", cls: "bg-[#d6dadd] text-[#5b6368]", dot: "#b4babe" },
};
