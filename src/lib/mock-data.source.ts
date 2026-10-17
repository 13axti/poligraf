import type { Category, Product } from "./types";

// MOCK DATA — admin paneldə məhsul yoxdursa və ya seed üçün istifadə olunur.
// DİQQƏT: qiymətlər nümunədir, real qiymətlərlə əvəz edin (admin paneldən).
// Şəkillər public/mockups/ qovluğundadır; hər məhsulun mockups sahəsində loqo yeri verilib.

export const categories: Category[] = [
  {
    "id": "c-promo",
    "slug": "promo",
    "name": "Promo hədiyyələr",
    "description": "Qələm, fincan, termos, bloknot — loqo ilə",
    "image": "/categories/promo.jpg",
    "sortOrder": 1
  },
  {
    "id": "c-geyim",
    "slug": "geyim",
    "name": "Geyim & tekstil",
    "description": "Köynək, papaq, çanta, rükzak",
    "image": "/categories/geyim.jpg",
    "sortOrder": 2
  },
  {
    "id": "c-qablasdirma",
    "slug": "qablasdirma",
    "name": "Qablaşdırma",
    "description": "Hədiyyə qutusu, paket, kağız torba",
    "image": "/categories/qablasdirma.jpg",
    "sortOrder": 3
  },
  {
    "id": "c-poliqrafiya",
    "slug": "poliqrafiya",
    "name": "Poliqrafiya",
    "description": "Vizitka, flayer, kataloq, kitab",
    "image": "/categories/poliqrafiya.jpg",
    "sortOrder": 4
  },
  {
    "id": "c-reklam",
    "slug": "reklam",
    "name": "Reklam & Banner",
    "description": "Banner, roll-up, işıqlı lövhə",
    "image": "/categories/reklam.jpg",
    "sortOrder": 5
  },
  {
    "id": "c-kesim",
    "slug": "kesim",
    "name": "Kəsim & Oracal",
    "description": "Vinil kəsim, stiker, yapışqan yazı",
    "image": "/categories/kesim.jpg",
    "sortOrder": 6
  }
];

export const products: Product[] = [
  {
    "id": "p-plastik-qelem",
    "slug": "plastik-qelem",
    "categoryId": "c-promo",
    "name": "Plastik qələm (loqo ilə)",
    "description": "Reklam qələmi, 1 rəngli loqo çapı. Müxtəlif rənglərdə.",
    "image": "/mockups/qelem-ag-2.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 50,
    "priceTiers": [
      {
        "minQty": 50,
        "unitPrice": 0.9
      },
      {
        "minQty": 200,
        "unitPrice": 0.7
      },
      {
        "minQty": 500,
        "unitPrice": 0.55
      },
      {
        "minQty": 1000,
        "unitPrice": 0.45
      }
    ],
    "variants": [
      {
        "id": "v-0",
        "name": "Mavi"
      },
      {
        "id": "v-1",
        "name": "Qırmızı"
      },
      {
        "id": "v-2",
        "name": "Qara"
      }
    ],
    "mockups": [
      {
        "id": "m-ag-2",
        "name": "Ağ qələm",
        "image": "/mockups/qelem-ag-2.jpg",
        "width": 678,
        "height": 452,
        "placement": {
          "cx": 0.63,
          "cy": 0.41,
          "w": 0.2,
          "h": 0.045,
          "rotation": 0
        },
        "clones": [
          {
            "dx": 0,
            "dy": 0.177
          }
        ]
      },
      {
        "id": "m-ag-1",
        "name": "Ağ qələm (bucaq)",
        "image": "/mockups/qelem-ag-1.jpg",
        "width": 740,
        "height": 524,
        "placement": {
          "cx": 0.55,
          "cy": 0.43,
          "w": 0.2,
          "h": 0.05,
          "rotation": -26
        }
      },
      {
        "id": "m-qara-1",
        "name": "Qara qələm",
        "image": "/mockups/qelem-qara-1.jpg",
        "width": 409,
        "height": 740,
        "placement": {
          "cx": 0.49,
          "cy": 0.57,
          "w": 0.24,
          "h": 0.05,
          "rotation": 90
        },
        "darkProduct": true
      },
      {
        "id": "m-qara-2",
        "name": "Qara qələm (3 görünüş)",
        "image": "/mockups/qelem-qara-2.jpg",
        "width": 408,
        "height": 612,
        "placement": {
          "cx": 0.5,
          "cy": 0.66,
          "w": 0.22,
          "h": 0.04,
          "rotation": 90
        },
        "darkProduct": true
      }
    ],
    "featured": true,
    "views": 1240
  },
  {
    "id": "p-fincan",
    "slug": "fincan",
    "categoryId": "c-promo",
    "name": "Keramik fincan (loqo ilə)",
    "description": "330ml ağ keramik fincan, tam rəngli sublimasiya çapı.",
    "image": "/mockups/mug.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 10,
    "priceTiers": [
      {
        "minQty": 10,
        "unitPrice": 6.5
      },
      {
        "minQty": 50,
        "unitPrice": 5.5
      },
      {
        "minQty": 100,
        "unitPrice": 4.8
      }
    ],
    "mockups": [
      {
        "id": "m-mug",
        "name": "Ağ fincan",
        "image": "/mockups/mug.jpg",
        "width": 1200,
        "height": 1200,
        "placement": {
          "cx": 0.46,
          "cy": 0.48,
          "w": 0.3,
          "h": 0.3,
          "rotation": 0
        }
      }
    ],
    "featured": true,
    "views": 980
  },
  {
    "id": "p-termos",
    "slug": "termos",
    "categoryId": "c-promo",
    "name": "Su şüşəsi (alüminium)",
    "description": "500ml alüminium idman şüşəsi, karabin ilə. Lazer və ya rəngli çap.",
    "image": "/mockups/bottle.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 10,
    "priceTiers": [
      {
        "minQty": 10,
        "unitPrice": 11
      },
      {
        "minQty": 50,
        "unitPrice": 9.5
      },
      {
        "minQty": 100,
        "unitPrice": 8.2
      }
    ],
    "mockups": [
      {
        "id": "m-bottle",
        "name": "Ağ şüşə",
        "image": "/mockups/bottle.jpg",
        "width": 736,
        "height": 980,
        "placement": {
          "cx": 0.52,
          "cy": 0.56,
          "w": 0.26,
          "h": 0.26,
          "rotation": 0
        }
      }
    ],
    "views": 640
  },
  {
    "id": "p-bloknot",
    "slug": "bloknot",
    "categoryId": "c-promo",
    "name": "Bloknot (loqo ilə)",
    "description": "A5 sərt cildli bloknot, qabartma və ya rəngli çap.",
    "image": "/mockups/notebook.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 20,
    "priceTiers": [
      {
        "minQty": 20,
        "unitPrice": 7.5
      },
      {
        "minQty": 50,
        "unitPrice": 6.5
      },
      {
        "minQty": 100,
        "unitPrice": 5.6
      }
    ],
    "mockups": [
      {
        "id": "m-notebook",
        "name": "Sərt cild",
        "image": "/mockups/notebook.jpg",
        "width": 740,
        "height": 740,
        "placement": {
          "cx": 0.55,
          "cy": 0.46,
          "w": 0.32,
          "h": 0.24,
          "rotation": 0
        },
        "darkProduct": true
      },
      {
        "id": "m-notebook2",
        "name": "Rezinli bloknot",
        "image": "/mockups/notebook2.jpg",
        "width": 612,
        "height": 459,
        "placement": {
          "cx": 0.5,
          "cy": 0.47,
          "w": 0.3,
          "h": 0.22,
          "rotation": 28
        },
        "darkProduct": true
      }
    ],
    "featured": true,
    "views": 870
  },
  {
    "id": "p-kagiz-stekan",
    "slug": "kagiz-stekan",
    "categoryId": "c-promo",
    "name": "Kağız stəkan",
    "description": "Qəhvə üçün kağız stəkan, qapaq daxil. Loqolu çap.",
    "image": "/mockups/cupsleeve.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 100,
    "priceTiers": [
      {
        "minQty": 100,
        "unitPrice": 0.55
      },
      {
        "minQty": 500,
        "unitPrice": 0.42
      },
      {
        "minQty": 1000,
        "unitPrice": 0.35
      }
    ],
    "mockups": [
      {
        "id": "m-cupsleeve",
        "name": "Ağ stəkan",
        "image": "/mockups/cupsleeve.jpg",
        "width": 740,
        "height": 740,
        "placement": {
          "cx": 0.5,
          "cy": 0.52,
          "w": 0.26,
          "h": 0.2,
          "rotation": 0
        },
        "darkProduct": true
      },
      {
        "id": "m-cupblack",
        "name": "Qara stəkan",
        "image": "/mockups/cupblack.jpg",
        "width": 740,
        "height": 740,
        "placement": {
          "cx": 0.5,
          "cy": 0.55,
          "w": 0.24,
          "h": 0.22,
          "rotation": 0
        },
        "darkProduct": true
      }
    ],
    "views": 520
  },
  {
    "id": "p-beyc-lent",
    "slug": "beyc-lent",
    "categoryId": "c-promo",
    "name": "Beyc və lent (lanyard)",
    "description": "Tədbir və ofis üçün beyc kart və rəngli lent.",
    "image": "/mockups/badge.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 50,
    "priceTiers": [
      {
        "minQty": 50,
        "unitPrice": 2.2
      },
      {
        "minQty": 200,
        "unitPrice": 1.7
      },
      {
        "minQty": 500,
        "unitPrice": 1.4
      }
    ],
    "mockups": [
      {
        "id": "m-badge",
        "name": "Beyc kart",
        "image": "/mockups/badge.jpg",
        "width": 700,
        "height": 1050,
        "placement": {
          "cx": 0.495,
          "cy": 0.6,
          "w": 0.42,
          "h": 0.58,
          "rotation": 0
        }
      }
    ],
    "views": 410
  },
  {
    "id": "p-karton-etiket",
    "slug": "karton-etiket",
    "categoryId": "c-promo",
    "name": "Karton etiket (tag)",
    "description": "Məhsul üçün karton etiket, ip ilə. Ofset çap.",
    "image": "/mockups/tag.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 100,
    "priceTiers": [
      {
        "minQty": 100,
        "unitPrice": 0.45
      },
      {
        "minQty": 500,
        "unitPrice": 0.3
      },
      {
        "minQty": 1000,
        "unitPrice": 0.22
      }
    ],
    "mockups": [
      {
        "id": "m-tag",
        "name": "Etiket",
        "image": "/mockups/tag.jpg",
        "width": 675,
        "height": 1200,
        "placement": {
          "cx": 0.51,
          "cy": 0.58,
          "w": 0.34,
          "h": 0.26,
          "rotation": -25
        }
      }
    ],
    "views": 300
  },
  {
    "id": "p-tisort",
    "slug": "tisort",
    "categoryId": "c-geyim",
    "name": "T-shirt (loqo ilə)",
    "description": "Pambıq t-shirt, DTF və ya ipək çap. Ölçülər S–XXL.",
    "image": "/mockups/teewhite.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 10,
    "priceTiers": [
      {
        "minQty": 10,
        "unitPrice": 14
      },
      {
        "minQty": 50,
        "unitPrice": 12
      },
      {
        "minQty": 100,
        "unitPrice": 10.5
      }
    ],
    "variants": [
      {
        "id": "v-0",
        "name": "S"
      },
      {
        "id": "v-1",
        "name": "M"
      },
      {
        "id": "v-2",
        "name": "L"
      },
      {
        "id": "v-3",
        "name": "XL",
        "priceModifier": 1
      }
    ],
    "mockups": [
      {
        "id": "m-teewhite",
        "name": "Ağ t-shirt",
        "image": "/mockups/teewhite.jpg",
        "width": 900,
        "height": 1198,
        "placement": {
          "cx": 0.5,
          "cy": 0.52,
          "w": 0.3,
          "h": 0.3,
          "rotation": 0
        }
      },
      {
        "id": "m-teegreen",
        "name": "Yaşıl t-shirt",
        "image": "/mockups/teegreen.jpg",
        "width": 900,
        "height": 1200,
        "placement": {
          "cx": 0.5,
          "cy": 0.38,
          "w": 0.22,
          "h": 0.18,
          "rotation": 0
        },
        "darkProduct": true
      }
    ],
    "featured": true,
    "views": 1120
  },
  {
    "id": "p-papaq",
    "slug": "papaq",
    "categoryId": "c-geyim",
    "name": "Panama papaq",
    "description": "Pambıq panama papaq, tikmə və ya çap loqo.",
    "image": "/mockups/hats.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 20,
    "priceTiers": [
      {
        "minQty": 20,
        "unitPrice": 9
      },
      {
        "minQty": 50,
        "unitPrice": 7.8
      },
      {
        "minQty": 100,
        "unitPrice": 6.8
      }
    ],
    "mockups": [
      {
        "id": "m-hats",
        "name": "Qara və ağ papaq",
        "image": "/mockups/hats.jpg",
        "width": 663,
        "height": 663,
        "placement": {
          "cx": 0.3,
          "cy": 0.53,
          "w": 0.22,
          "h": 0.11,
          "rotation": 0
        },
        "darkProduct": true
      }
    ],
    "views": 460
  },
  {
    "id": "p-parca-canta",
    "slug": "parca-canta",
    "categoryId": "c-geyim",
    "name": "Parça çanta (eko)",
    "description": "Pambıq eko çanta, bir tərəfli loqo çapı.",
    "image": "/mockups/tote.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 25,
    "priceTiers": [
      {
        "minQty": 25,
        "unitPrice": 3.2
      },
      {
        "minQty": 100,
        "unitPrice": 2.6
      },
      {
        "minQty": 300,
        "unitPrice": 2.1
      }
    ],
    "mockups": [
      {
        "id": "m-tote",
        "name": "Eko çanta",
        "image": "/mockups/tote.jpg",
        "width": 800,
        "height": 1200,
        "placement": {
          "cx": 0.47,
          "cy": 0.64,
          "w": 0.4,
          "h": 0.32,
          "rotation": 0
        }
      }
    ],
    "views": 610
  },
  {
    "id": "p-rukzak",
    "slug": "rukzak",
    "categoryId": "c-geyim",
    "name": "Rükzak",
    "description": "Gündəlik rükzak, ön cibdə və ya üst panelda loqo çapı.",
    "image": "/mockups/backpack.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 10,
    "priceTiers": [
      {
        "minQty": 10,
        "unitPrice": 22
      },
      {
        "minQty": 50,
        "unitPrice": 19
      },
      {
        "minQty": 100,
        "unitPrice": 16.5
      }
    ],
    "mockups": [
      {
        "id": "m-backpack",
        "name": "Ağ rükzak",
        "image": "/mockups/backpack.jpg",
        "width": 626,
        "height": 626,
        "placement": {
          "cx": 0.46,
          "cy": 0.37,
          "w": 0.3,
          "h": 0.16,
          "rotation": 0
        }
      },
      {
        "id": "m-backpack2",
        "name": "Asma rükzak",
        "image": "/mockups/backpack2.jpg",
        "width": 500,
        "height": 557,
        "placement": {
          "cx": 0.5,
          "cy": 0.69,
          "w": 0.3,
          "h": 0.14,
          "rotation": 0
        }
      }
    ],
    "views": 380
  },
  {
    "id": "p-hediyye-qutusu",
    "slug": "hediyye-qutusu",
    "categoryId": "c-qablasdirma",
    "name": "Hədiyyə qutusu",
    "description": "Maqnitli və sürüşən qapaqlı hədiyyə qutuları. Qızıl/gümüş folqa mümkündür.",
    "image": "/mockups/giftblack.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 20,
    "priceTiers": [
      {
        "minQty": 20,
        "unitPrice": 6.5
      },
      {
        "minQty": 100,
        "unitPrice": 5.2
      },
      {
        "minQty": 300,
        "unitPrice": 4.4
      }
    ],
    "mockups": [
      {
        "id": "m-giftblack",
        "name": "Qara qutu",
        "image": "/mockups/giftblack.jpg",
        "width": 736,
        "height": 736,
        "placement": {
          "cx": 0.53,
          "cy": 0.43,
          "w": 0.3,
          "h": 0.2,
          "rotation": -18
        },
        "darkProduct": true
      },
      {
        "id": "m-giftblue",
        "name": "Mavi maqnitli qutu",
        "image": "/mockups/giftblue.jpg",
        "width": 1000,
        "height": 1000,
        "placement": {
          "cx": 0.65,
          "cy": 0.3,
          "w": 0.26,
          "h": 0.14,
          "rotation": -17
        },
        "darkProduct": true
      },
      {
        "id": "m-giftgreen",
        "name": "Sürüşən qutu",
        "image": "/mockups/giftgreen.jpg",
        "width": 736,
        "height": 736,
        "placement": {
          "cx": 0.72,
          "cy": 0.46,
          "w": 0.18,
          "h": 0.1,
          "rotation": 0
        }
      },
      {
        "id": "m-giftwhite",
        "name": "Ağ qutu",
        "image": "/mockups/giftwhite.jpg",
        "width": 500,
        "height": 700,
        "placement": {
          "cx": 0.71,
          "cy": 0.43,
          "w": 0.28,
          "h": 0.12,
          "rotation": 42
        }
      }
    ],
    "featured": true,
    "views": 750
  },
  {
    "id": "p-karton-qutu",
    "slug": "karton-qutu",
    "categoryId": "c-qablasdirma",
    "name": "Karton göndərmə qutusu",
    "description": "Kraft karton qutu, onlayn mağazalar üçün. Loqo çapı.",
    "image": "/mockups/kraftbox.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 50,
    "priceTiers": [
      {
        "minQty": 50,
        "unitPrice": 2.4
      },
      {
        "minQty": 200,
        "unitPrice": 1.9
      },
      {
        "minQty": 500,
        "unitPrice": 1.5
      }
    ],
    "mockups": [
      {
        "id": "m-kraftbox",
        "name": "Kraft qutu",
        "image": "/mockups/kraftbox.jpg",
        "width": 736,
        "height": 736,
        "placement": {
          "cx": 0.5,
          "cy": 0.5,
          "w": 0.5,
          "h": 0.3,
          "rotation": 0
        }
      }
    ],
    "views": 520
  },
  {
    "id": "p-doypack-paket",
    "slug": "doypack-paket",
    "categoryId": "c-qablasdirma",
    "name": "Doypack qablaşdırma",
    "description": "Zip bağlamalı doypack və folqalı paketlər, qida və kosmetika üçün.",
    "image": "/mockups/pouchkraft.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 100,
    "priceTiers": [
      {
        "minQty": 100,
        "unitPrice": 0.9
      },
      {
        "minQty": 500,
        "unitPrice": 0.65
      },
      {
        "minQty": 1000,
        "unitPrice": 0.5
      }
    ],
    "mockups": [
      {
        "id": "m-pouchkraft",
        "name": "Kraft doypack",
        "image": "/mockups/pouchkraft.jpg",
        "width": 674,
        "height": 1200,
        "placement": {
          "cx": 0.5,
          "cy": 0.53,
          "w": 0.38,
          "h": 0.3,
          "rotation": 0
        }
      },
      {
        "id": "m-pouchwhite",
        "name": "Ağ paket",
        "image": "/mockups/pouchwhite.jpg",
        "width": 626,
        "height": 626,
        "placement": {
          "cx": 0.5,
          "cy": 0.5,
          "w": 0.36,
          "h": 0.36,
          "rotation": 0
        }
      }
    ],
    "views": 430
  },
  {
    "id": "p-kagiz-torba",
    "slug": "kagiz-torba",
    "categoryId": "c-qablasdirma",
    "name": "Kağız torba",
    "description": "Hədiyyə və mağaza üçün kağız torba, bükülmüş sap.",
    "image": "/mockups/shopbag.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 100,
    "priceTiers": [
      {
        "minQty": 100,
        "unitPrice": 1.3
      },
      {
        "minQty": 500,
        "unitPrice": 0.95
      },
      {
        "minQty": 1000,
        "unitPrice": 0.8
      }
    ],
    "mockups": [
      {
        "id": "m-shopbag",
        "name": "Ağ kağız torba",
        "image": "/mockups/shopbag.jpg",
        "width": 821,
        "height": 1200,
        "placement": {
          "cx": 0.5,
          "cy": 0.64,
          "w": 0.4,
          "h": 0.4,
          "rotation": 0
        }
      }
    ],
    "views": 560
  },
  {
    "id": "p-vizitka",
    "slug": "vizitka",
    "categoryId": "c-poliqrafiya",
    "name": "Vizit kart",
    "description": "90×50mm, 350q karton, iki tərəfli rəngli çap.",
    "image": "/mockups/vizitka.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 100,
    "priceTiers": [
      {
        "minQty": 100,
        "unitPrice": 0.25
      },
      {
        "minQty": 500,
        "unitPrice": 0.15
      },
      {
        "minQty": 1000,
        "unitPrice": 0.1
      }
    ],
    "variants": [
      {
        "id": "v-0",
        "name": "Mat laminasiya",
        "priceModifier": 0.03
      },
      {
        "id": "v-1",
        "name": "Parlaq laminasiya",
        "priceModifier": 0.03
      },
      {
        "id": "v-2",
        "name": "Laminasiyasız"
      }
    ],
    "mockups": [
      {
        "id": "m-vizitka",
        "name": "Vizit kart",
        "image": "/mockups/vizitka.jpg",
        "width": 1200,
        "height": 900,
        "placement": {
          "cx": 0.54,
          "cy": 0.52,
          "w": 0.48,
          "h": 0.24,
          "rotation": -6
        }
      }
    ],
    "featured": true,
    "views": 2100
  },
  {
    "id": "p-flayer-a5",
    "slug": "flayer-a5",
    "categoryId": "c-poliqrafiya",
    "name": "Flayer A5",
    "description": "A5 (148×210mm), 130q parlaq kağız, iki tərəfli rəngli.",
    "image": "/mockups/flayer.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 100,
    "priceTiers": [
      {
        "minQty": 100,
        "unitPrice": 0.3
      },
      {
        "minQty": 500,
        "unitPrice": 0.18
      },
      {
        "minQty": 1000,
        "unitPrice": 0.12
      }
    ],
    "mockups": [
      {
        "id": "m-flayer",
        "name": "Flayer A5",
        "image": "/mockups/flayer.jpg",
        "width": 900,
        "height": 1200,
        "placement": {
          "cx": 0.5,
          "cy": 0.51,
          "w": 0.46,
          "h": 0.62,
          "rotation": 3.5
        }
      }
    ],
    "views": 870
  },
  {
    "id": "p-kitab-kataloq",
    "slug": "kitab-kataloq",
    "categoryId": "c-poliqrafiya",
    "name": "Kataloq və kitab",
    "description": "Sərt və yumşaq cildli kataloq, kitab, broşür. Tək nüsxədən sifariş.",
    "image": "/mockups/bookgrey.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 20,
    "priceTiers": [
      {
        "minQty": 20,
        "unitPrice": 12
      },
      {
        "minQty": 100,
        "unitPrice": 9
      },
      {
        "minQty": 300,
        "unitPrice": 7.5
      }
    ],
    "mockups": [
      {
        "id": "m-bookgrey",
        "name": "Sərt cild kitab",
        "image": "/mockups/bookgrey.jpg",
        "width": 1200,
        "height": 799,
        "placement": {
          "cx": 0.51,
          "cy": 0.42,
          "w": 0.22,
          "h": 0.22,
          "rotation": 0
        }
      },
      {
        "id": "m-bookwhite",
        "name": "Ağ kataloq",
        "image": "/mockups/bookwhite.jpg",
        "width": 998,
        "height": 710,
        "placement": {
          "cx": 0.57,
          "cy": 0.52,
          "w": 0.2,
          "h": 0.3,
          "rotation": -14
        }
      }
    ],
    "views": 340
  },
  {
    "id": "p-banner",
    "slug": "banner",
    "categoryId": "c-reklam",
    "name": "Açıq hava banner (tent)",
    "description": "440q tent, tam rəngli solvent çap. İstənilən ölçü.",
    "image": "/mockups/banner.jpg",
    "pricingModel": "per_sqm",
    "pricePerSqm": 12,
    "minWidthCm": 50,
    "minHeightCm": 50,
    "mockups": [
      {
        "id": "m-banner",
        "name": "Banner",
        "image": "/mockups/banner.jpg",
        "width": 1400,
        "height": 900,
        "placement": {
          "cx": 0.5,
          "cy": 0.5,
          "w": 0.7,
          "h": 0.3,
          "rotation": 0
        }
      }
    ],
    "views": 1560
  },
  {
    "id": "p-roll-up",
    "slug": "roll-up",
    "categoryId": "c-reklam",
    "name": "Roll-up stend",
    "description": "85×200sm standart roll-up, konstruksiya daxil.",
    "image": "/mockups/rollup.jpg",
    "pricingModel": "per_sqm",
    "pricePerSqm": 25,
    "minWidthCm": 60,
    "minHeightCm": 150,
    "mockups": [
      {
        "id": "m-rollup",
        "name": "Roll-up",
        "image": "/mockups/rollup.jpg",
        "width": 686,
        "height": 1200,
        "placement": {
          "cx": 0.53,
          "cy": 0.45,
          "w": 0.42,
          "h": 0.72,
          "rotation": 0
        }
      }
    ],
    "featured": true,
    "views": 720
  },
  {
    "id": "p-isiqli-lovhe",
    "slug": "isiqli-lovhe",
    "categoryId": "c-reklam",
    "name": "Divar lövhəsi",
    "description": "Ofis və mağaza üçün divardan asılan lövhə, tək və ya cüt tərəfli.",
    "image": "/mockups/sign.jpg",
    "pricingModel": "per_unit",
    "minOrderQty": 1,
    "priceTiers": [
      {
        "minQty": 1,
        "unitPrice": 180
      },
      {
        "minQty": 5,
        "unitPrice": 160
      }
    ],
    "mockups": [
      {
        "id": "m-sign",
        "name": "Divar lövhəsi",
        "image": "/mockups/sign.jpg",
        "width": 736,
        "height": 1051,
        "placement": {
          "cx": 0.53,
          "cy": 0.47,
          "w": 0.3,
          "h": 0.3,
          "rotation": -5
        }
      }
    ],
    "views": 260
  },
  {
    "id": "p-stiker",
    "slug": "stiker",
    "categoryId": "c-kesim",
    "name": "Rəngli stiker çap + kəsim",
    "description": "Tam rəngli çap + kontur kəsim, mat və ya parlaq.",
    "image": "/mockups/sticker.jpg",
    "pricingModel": "per_sqm",
    "pricePerSqm": 22,
    "minWidthCm": 5,
    "minHeightCm": 5,
    "mockups": [
      {
        "id": "m-sticker",
        "name": "Stiker",
        "image": "/mockups/sticker.jpg",
        "width": 1000,
        "height": 1000,
        "placement": {
          "cx": 0.49,
          "cy": 0.47,
          "w": 0.4,
          "h": 0.34,
          "rotation": -5
        }
      }
    ],
    "views": 1120
  },
  {
    "id": "p-oracal-kesim",
    "slug": "oracal-kesim",
    "categoryId": "c-kesim",
    "name": "Oracal plotter kəsim",
    "description": "Rəngli yapışqan vinil, kompüter kəsimi (plotter). Vitrin və divar yazıları.",
    "image": "/mockups/wall.jpg",
    "pricingModel": "per_sqm",
    "pricePerSqm": 18,
    "minWidthCm": 10,
    "minHeightCm": 10,
    "variants": [
      {
        "id": "v-0",
        "name": "Ağ"
      },
      {
        "id": "v-1",
        "name": "Qara"
      },
      {
        "id": "v-2",
        "name": "Qızılı",
        "priceModifier": 6
      }
    ],
    "mockups": [
      {
        "id": "m-wall",
        "name": "Divar yazısı",
        "image": "/mockups/wall.jpg",
        "width": 1400,
        "height": 900,
        "placement": {
          "cx": 0.5,
          "cy": 0.4,
          "w": 0.52,
          "h": 0.26,
          "rotation": 0
        }
      }
    ],
    "views": 540
  }
];

// --- köməkçi funksiyalar (mock; data.ts yalnız Supabase qoşulmayanda istifadə edir) ---

export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getAllProducts(): Product[] {
  return products;
}
