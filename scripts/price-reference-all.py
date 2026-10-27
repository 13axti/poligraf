#!/usr/bin/env python3
"""
moongroup.az-dakı BÜTÜN kateqoriyalar üçün qiymət istinadı (ad, qiymət pillələri, göstəricilər; şəkil və təsvir mətni YOX).
Hər kateqoriya ayrıca data/moongroup-all/<ad>.csv faylına yazılır; kəsilərsə yenidən işlədəndə hazır olanlar atlanır.
Sorğular arası 10 san (robots.txt Crawl-delay). Captcha çıxsa dayanır.

  python3 scripts/price-reference-all.py
"""
import csv, importlib.util, os, re, sys, urllib.parse

spec = importlib.util.spec_from_file_location("pr", os.path.join(os.path.dirname(__file__), "price-reference.py"))
pr = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pr)

SKIP_DONE = {"/metbee/bloknot-deri-uzlu/", "/metbee/bloknotlar-karton-uzlu/", "/metbee/vizit-kart/",
             "/promo/qelem-metal/", "/promo/qelem-plastik/", "/promo/qelem-qutusu/"}
OUT = "data/moongroup-all"


def categories():
    b = pr.get("/")
    cats = {}
    for m in re.finditer(r'<a[^>]+href="((?:https://moongroup\.az)?/(?:metbee|promo|reklam)/[\w\-]+/)"[^>]*>(.*?)</a>', b, re.S):
        path = urllib.parse.urlparse(m.group(1)).path
        name = pr.text(m.group(2))
        if name and 2 < len(name) < 60 and path not in cats:
            cats[path] = name
    return cats


def main():
    os.makedirs(OUT, exist_ok=True)
    cats = categories()
    todo = {p: n for p, n in cats.items() if p not in SKIP_DONE}
    print(f"{len(cats)} kateqoriya tapıldı, {len(todo)} götürüləcək", flush=True)
    for path, name in todo.items():
        f = os.path.join(OUT, path.strip("/").replace("/", "_") + ".csv")
        if os.path.exists(f):
            print("atlandı (hazırdır):", name, flush=True)
            continue
        links = pr.product_links(path)
        print(f"{name} ({path}): {len(links)} məhsul", flush=True)
        rows = []
        for u in links:
            try:
                r = pr.product(u, path)
                r["Kateqoriya adı"] = name
                rows.append(r)
                print("  ✓", r["Ad"], "|", r["Ən aşağı qiymət"], flush=True)
            except SystemExit:
                raise
            except Exception as e:
                print("  ✗", u, e, flush=True)
        if rows:
            keys = list(dict.fromkeys(k for r in rows for k in r))
            with open(f, "w", newline="", encoding="utf-8-sig") as fh:
                w = csv.DictWriter(fh, fieldnames=keys)
                w.writeheader()
                w.writerows(rows)
    print("HAMISI HAZIRDIR", flush=True)


if __name__ == "__main__":
    main()
