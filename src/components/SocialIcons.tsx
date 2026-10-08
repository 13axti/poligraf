import { site } from "@/lib/site-config";

const paths: Record<string, string> = {
  facebook:
    "M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z",
  instagram:
    "M12 7.5A4.5 4.5 0 1 0 12 16.5 4.5 4.5 0 0 0 12 7.5zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8zM17.2 6.3a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3zm0 1.6A2.9 2.9 0 0 0 4.6 7.5v9a2.9 2.9 0 0 0 2.9 2.9h9a2.9 2.9 0 0 0 2.9-2.9v-9a2.9 2.9 0 0 0-2.9-2.9h-9z",
  tiktok:
    "M16.6 3h-2.8v11.4a2.4 2.4 0 1 1-2.4-2.4c.2 0 .5 0 .7.1V9.2a5.2 5.2 0 1 0 4.5 5.2V8.6a6.6 6.6 0 0 0 3.8 1.2V7a3.9 3.9 0 0 1-3.8-4z",
  linkedin:
    "M6.9 8.9H4V20h2.9V8.9zM5.5 4a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4zM20 13.5c0-2.7-1.4-4.8-3.9-4.8-1.3 0-2.2.7-2.6 1.3V8.9h-2.8V20h2.9v-6c0-1.6.6-2.5 1.8-2.5s1.7.9 1.7 2.5V20H20v-6.5z",
};

export function SocialIcons({ className = "" }: { className?: string }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {site.socials.map((s) => (
        <a
          key={s.id}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d={paths[s.id]} />
          </svg>
        </a>
      ))}
    </div>
  );
}
