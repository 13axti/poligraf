/* eslint-disable @next/next/no-img-element */
import { COLOR_DOT, lineTotal, money, monthYear, setTotal, unitPrice, type PData, type PItem } from "@/lib/presentations";
import { BRAND } from "@/lib/site-config";
import { DeckShell } from "./DeckShell";

const chunk = <T,>(a: T[], n: number) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

function Head({ title, sub, n }: { title: string; sub?: string; n: number }) {
  return (
    <>
      <div className="dk-brand">{BRAND.toUpperCase()}</div>
      <div className="dk-h1">{title}</div>
      {sub && <div className="dk-sub">{sub}</div>}
      <div className="dk-pg">{n}</div>
    </>
  );
}

function Card({ item, i, markup }: { item: PItem; i: number; markup: number }) {
  return (
    <div className="dk-card" style={{ left: 50 + i * 300 }}>
      {item.image ? <img className="ph" src={item.image} alt="" /> : <div className="ph" style={{ height: 250, background: "#2a2a2a" }} />}
      <div className="dk-b">
        <div className="dk-nm">{item.name}</div>
        {item.colors.length > 0 && (
          <div className="dk-chips">
            {item.colors.map((c) => (
              <div key={c} className="dk-chip">
                {COLOR_DOT[c.toLowerCase()] && <i style={{ background: COLOR_DOT[c.toLowerCase()] }} />}
                {c}
              </div>
            ))}
          </div>
        )}
        {item.spec.length > 0 && <div className="dk-sp">{item.spec.map((l, k) => <div key={k}>{l}</div>)}</div>}
      </div>
      <div className="dk-price">
        <div><span>Say</span><b>{item.qty}</b></div>
        <div><span>₼ / {item.unit}</span><b>{money(unitPrice(item, markup))}</b></div>
        <div><span>Cəmi ₼</span><b>{money(lineTotal(item, markup))}</b></div>
      </div>
    </div>
  );
}

export interface DeckInput { title: string; client: string; people: number; createdAt: string; data: PData }

export function Deck({ title, client, people, createdAt, data }: DeckInput) {
  const slides: React.ReactNode[] = [];
  let n = 1;
  const date = monthYear(createdAt);

  // 1) Üz qabığı
  slides.push(
    <div key="cover" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 78% 55%, #3a1608 0%, #141414 60%)" }}>
      <div className="dk-brand" style={{ top: 48, fontSize: 16 }}>{BRAND.toUpperCase()}</div>
      <img src="/coming-soon/lemur-alpha.webp" alt="" style={{ position: "absolute", right: 40, bottom: 0, height: 560 }} />
      <div style={{ position: "absolute", left: 50, top: 190, width: 680 }}>
        <div style={{ fontSize: 15, letterSpacing: 4, color: "#ff5a1f", fontWeight: 700 }}>
          TƏKLİF · {date.toUpperCase()}{client ? ` · ${client.toUpperCase()}` : ""}
        </div>
        <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.04, marginTop: 18, letterSpacing: -1.5 }}>{title}</div>
        {people > 0 && <div style={{ fontSize: 30, fontWeight: 700, marginTop: 14, color: "#ffd2b8" }}>{people} nəfər üçün</div>}
        {data.intro && <div style={{ fontSize: 20, color: "#cfc9c2", marginTop: 24, lineHeight: 1.5 }}>{data.intro}</div>}
      </div>
    </div>
  );

  // 2) Tərkib (bölmələr)
  const groups: { name: string; items: PItem[] }[] = [];
  for (const it of data.items) {
    const g = groups.find((x) => x.name === it.group);
    if (g) g.items.push(it);
    else groups.push({ name: it.group, items: [it] });
  }
  if (groups.length) {
    for (const part of chunk(groups, 4)) {
      n++;
      slides.push(
        <>
          <Head title="Tərkib" sub="Təklifdəki məhsul qrupları" n={n} />
          {part.map((g, i) => (
            <div key={g.name} className="dk-tile" style={{ left: 50 + i * 300 }}>
              {g.items[0].image ? <img src={g.items[0].image} alt="" /> : <div style={{ height: 300, background: "#2a2a2a" }} />}
              <div className="dk-b">
                <div className="dk-nm" style={{ fontSize: 24 }}>{g.name}</div>
                <div className="dk-sp" style={{ fontSize: 15 }}>{g.items.length} variant</div>
              </div>
            </div>
          ))}
        </>
      );
    }
  }

  // 3) Məhsul səhifələri
  for (const g of groups) {
    const parts = chunk(g.items, 4);
    parts.forEach((part, pi) => {
      n++;
      slides.push(
        <>
          <Head title={g.name} sub={`Qiymətlər ədəd üçün, ƏDV-siz${parts.length > 1 ? ` · ${pi + 1}/${parts.length}` : ""}`} n={n} />
          {part.map((it, i) => <Card key={it.id} item={it} i={i} markup={data.markup} />)}
        </>
      );
    });
  }

  // 4) Büdcə
  if (data.sets.length) {
    for (const part of chunk(data.sets, 3)) {
      n++;
      slides.push(
        <>
          <Head title="Büdcə" sub={`${people ? `${people} nəfər üçün · ` : ""}ƏDV-siz`} n={n} />
          {part.map((s, i) => {
            const { items, total } = setTotal(s, data);
            return (
              <div key={s.id} className={`dk-set${i === 1 && part.length === 3 ? " hl" : ""}`} style={{ left: 50 + i * 400 }}>
                <div className="dk-nm" style={{ fontSize: 24 }}>{s.title}</div>
                {s.desc && <div className="dk-sp">{s.desc}</div>}
                <div style={{ marginTop: 14 }}>
                  {items.slice(0, 7).map((it) => (
                    <div className="dk-row" key={it.id}>
                      <span>{it.name}</span>
                      <b>{money(lineTotal(it, data.markup))}</b>
                    </div>
                  ))}
                </div>
                <div className="dk-tot"><span>Cəmi, ₼</span><b>{money(total)}</b></div>
                {people > 0 && <div className="dk-tot" style={{ marginTop: 6 }}><span>1 nəfərə, ₼</span><b style={{ fontSize: 20 }}>{money(total / people)}</b></div>}
              </div>
            );
          })}
        </>
      );
    }
  } else if (data.items.length) {
    for (const part of chunk(data.items, 9)) {
      n++;
      const last = part[part.length - 1] === data.items[data.items.length - 1];
      slides.push(
        <>
          <Head title="Büdcə" sub="ƏDV-siz" n={n} />
          <div className="dk-table">
            {part.map((it) => (
              <div className="dk-row" key={it.id}>
                <span>{it.name} <span style={{ color: "#8f8a84" }}>· {it.qty} {it.unit} × {money(unitPrice(it, data.markup))}</span></span>
                <b>{money(lineTotal(it, data.markup))} ₼</b>
              </div>
            ))}
            {last && (
              <div className="dk-tot" style={{ marginTop: 22 }}>
                <span>Ümumi cəmi, ₼</span>
                <b>{money(data.items.reduce((s, it) => s + lineTotal(it, data.markup), 0))}</b>
              </div>
            )}
          </div>
        </>
      );
    }
  }

  // 5) Qeydlər
  if (data.notes.length) {
    n++;
    slides.push(
      <>
        <Head title="Qeydlər" sub="Sifarişdən əvvəl bilməli olduğunuz məqamlar" n={n} />
        <div style={{ position: "absolute", left: 50, top: 160, width: 980, fontSize: 20, lineHeight: 1.8, color: "#e8e3dd" }}>
          {data.notes.map((t, i) => <p key={i}>• {t}</p>)}
        </div>
      </>
    );
  }

  return <DeckShell title={title}>{slides.map((s, i) => <div key={i} style={{ position: "absolute", inset: 0 }}>{s}</div>)}</DeckShell>;
}
