#!/usr/bin/env python3
"""
Qiymət istinadı: moongroup.az-dakı bir kateqoriyanın məhsul adlarını, qiymət pillələrini və texniki göstəricilərini
(ölçü, material, rənglər və s.) CSV-yə yazır. Yalnız faktlar: şəkillər və təsvir mətnləri götürülmür.

Hörmətli davranış: robots.txt-dəki Crawl-delay (10 san) gözlənilir, captcha çıxsa dərhal dayanır.
İstifadə:  OUT=data/fayl.csv python3 scripts/price-reference.py /metbee/vizit-kart/
"""
import csv, html, os, re, sys, time, urllib.request

SAYT = "https://moongroup.az"
DELAY = 10
UA = {"User-Agent": "Mozilla/5.0 (price reference; contact owner)"}


def get(path):
    url = path if path.startswith("http") else SAYT + path
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        body = r.read().decode("utf-8", "ignore")
    if "sgcaptcha" in body[:2000]:
        raise SystemExit("Captcha çıxdı, dayanıram (saytın bot qoruması aktivləşdi).")
    time.sleep(DELAY)
    return body


def text(s):
    return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s))).strip()


def product_links(cat):
    links, page = [], 1
    while True:
        url = cat if page == 1 else f"{cat}page/{page}/"
        try:
            b = get(url)
        except urllib.error.HTTPError:
            break
        new = []
        for m in re.finditer(r'<h[3-5][^>]*>\s*<a[^>]+href="([^"]+\.html)"', b):
            u = m.group(1)
            u = u if u.startswith("http") else SAYT + u
            if u not in links and u not in new:
                new.append(u)
        if not new:
            break
        links += new
        page += 1
    return links


def product(url, cat):
    b = get(url)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", b, re.S)
    name = text(h1.group(1)) if h1 else url
    start = b.find("Stokda")
    seg = b[max(start, 0):]
    seg = seg[: seg.find("Oxşar məhsullar")] if "Oxşar məhsullar" in seg else seg
    plain = html.unescape(re.sub(r"<[^>]+>", "\n", seg))
    # 1-ci format: "100 ədəd olarsa, 1 ədədi 0,22 AZN"; "Birtərəfli/İkitərəfli çap" başlıqları ilə iki qrup ola bilər
    tiers, tiers2, side = [], [], None
    pat = re.compile(r"(Birtərəfli|İkitərəfli)|(\d[\d ]*)\s*ədəd olarsa,?\s*1\s*ədədi?\s*[-–]?\s*([\d.,]+)\s*(?:AZN|₼)")
    for m in pat.finditer(plain):
        if m.group(1):
            side = m.group(1)
        else:
            (tiers2 if side == "İkitərəfli" else tiers).append((m.group(2), m.group(3)))
    if not tiers:
        # 2-ci format: paket qiyməti ("2000 ədəd olarsa, 150,00 AZN"), ədəd qiymətinə çevrilir
        for qty, total in re.findall(r"(\d[\d ]*)\s*ədəd[^\n]{0,70}?olarsa,?\s*([\d.,]+)\s*(?:AZN|₼)", plain):
            try:
                n = int(qty.replace(" ", ""))
                t = float(total.replace(",", ".").rstrip("."))
                if n > 0:
                    tiers.append((str(n), f"{t / n:.4f}"))
            except ValueError:
                pass
    prices = []
    for _, q in tiers:
        try:
            prices.append(float(q.replace(",", ".").rstrip(".")))
        except ValueError:
            pass
    # texniki göstəricilər: qalın "Ad:" başlıqları (təsvir mətni götürülmür)
    specs = {}
    labels = [text(x) for x in re.findall(r"<(?:b|strong)[^>]*>(.*?)</(?:b|strong)>", seg, re.S)]
    labels = [l[:-1].strip() for l in labels if l.endswith(":") and 2 < len(l) < 40 and "təsvir" not in l.lower()]
    for lab in dict.fromkeys(labels):
        m = re.search(re.escape(lab) + r"\s*:\s*(.{1,200}?)(?:\n\s*\n|\n[^\n:]{2,40}:|$)", plain, re.S)
        if m:
            specs[lab] = re.sub(r"\s+", " ", m.group(1)).strip()
    return {
        "Kateqoriya": cat,
        "Ad": name,
        "Link": url,
        "Ən aşağı qiymət": min(prices) if prices else "",
        "Qiymət pillələri": "; ".join(f"{s.strip()} ədəd: {q} AZN" for s, q in tiers),
        "Qiymət pillələri (ikitərəfli)": "; ".join(f"{s.strip()} ədəd: {q} AZN" for s, q in tiers2),
        "Qeyd": "qiymətlər +18% ƏDV" if "ƏDV" in plain else "",
        "Göstəricilər": " | ".join(f"{k}: {v}" for k, v in specs.items()),
    }


def main():
    cats = sys.argv[1:]
    if not cats:
        raise SystemExit("Kateqoriya yolu yazın, məs: /metbee/bloknot-deri-uzlu/")
    rows = []
    for cat in cats:
        links = product_links(cat)
        print(f"{cat}: {len(links)} məhsul", flush=True)
        for u in links:
            r = product(u, cat)
            rows.append(r)
            print("  ✓", r["Ad"], "|", r["Ən aşağı qiymət"], flush=True)
    out = os.environ.get("OUT", "data/moongroup-referans.csv")
    with open(out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()) if rows else ["Ad"])
        w.writeheader()
        w.writerows(rows)
    print(f"Hazırdır: {out} ({len(rows)} məhsul)")


if __name__ == "__main__":
    main()
