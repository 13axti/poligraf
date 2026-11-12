/* eslint-disable @next/next/no-img-element */
/** Lemur Group loqosu: tünd temada ağ yazılı, açıq temada qara yazılı variant (CSS ilə dəyişir) */
export function SiteLogo({ label, className = "h-9" }: { label: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={`relative inline-flex shrink-0 items-center ${className}`}>
      <img src="/brand/logo-dark.png" alt="" className="logo-on-dark h-full w-auto" />
      <img src="/brand/logo-light.png" alt="" className="logo-on-light h-full w-auto" />
    </span>
  );
}
