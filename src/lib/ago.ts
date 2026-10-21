/** "indi", "12 dəq", "3 saat", "2 gün", sonra tarix */
export function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "indi";
  if (s < 3600) return `${Math.floor(s / 60)} dəq əvvəl`;
  if (s < 86400) return `${Math.floor(s / 3600)} saat əvvəl`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} gün əvvəl`;
  return new Date(iso).toLocaleDateString("az-AZ", { day: "numeric", month: "short" });
}
