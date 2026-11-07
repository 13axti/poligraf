/**
 * print.az məhsullarının kalkulyator quruluşu (2026-11-07 oxunub): hansı seçimlərə görə hesablanır.
 * Yalnız seçim adları və faiz/gün qaydaları götürülüb (təcili hazırlanma +50% → ×1,5). Manat qiymətləri götürülməyib: onları admin yazır.
 * Mənbə: print.az səhifələri (source sahəsində link).
 */
export interface CalcTemplateChoice { name: string; multiplier?: number; days?: number }
export interface CalcTemplate {
  key: string;
  category: string;
  name: string;
  source: string;
  model: "per_unit" | "per_sqm";
  qty: number[];        // print.az-dakı tiraj seçimləri (boşdursa say sərbəst yazılır)
  qtyUnit?: string;
  groups: { name: string; choices: CalcTemplateChoice[] }[];
}

export const CALC_TEMPLATES: CalcTemplate[] = [
 {
  "key": "ciddi-hesabat-blanklari__cmr",
  "category": "Ciddi hesabat blankları",
  "name": "CMR",
  "source": "https://print.az/ciddi-hesabat-blanklari/cmr/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "ciddi-hesabat-blanklari__kassa-medaxil-orderi",
  "category": "Ciddi hesabat blankları",
  "name": "Kassa Mədaxil Orderi",
  "source": "https://print.az/ciddi-hesabat-blanklari/kassa-medaxil-orderi/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Sifarişçi növü",
    "choices": [
     {
      "name": "Hüquqi şəxs"
     },
     {
      "name": "Fiziki şəxs"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "ciddi-hesabat-blanklari__kassa-mexaric-orderi",
  "category": "Ciddi hesabat blankları",
  "name": "Kassa Məxaric Orderi",
  "source": "https://print.az/ciddi-hesabat-blanklari/kassa-mexaric-orderi/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Sifarişçi növü",
    "choices": [
     {
      "name": "Hüquqi şəxs"
     },
     {
      "name": "Fiziki şəxs"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "ciddi-hesabat-blanklari__medaxil-qebzi-forma-1-mq",
  "category": "Ciddi hesabat blankları",
  "name": "Mədaxil qəbzi (Forma № 1-MQ)",
  "source": "https://print.az/ciddi-hesabat-blanklari/medaxil-qebzi-forma-1-mq/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Sifarişçi növü",
    "choices": [
     {
      "name": "Hüquqi şəxs"
     },
     {
      "name": "Fiziki şəxs"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "ciddi-hesabat-blanklari__minik-avtoneqliyyati-ucun-yol-vereqi",
  "category": "Ciddi hesabat blankları",
  "name": "Minik avtonəqliyyatı üçün yol vərəqi",
  "source": "https://print.az/ciddi-hesabat-blanklari/minik-avtoneqliyyati-ucun-yol-vereqi/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Sifarişçi növü",
    "choices": [
     {
      "name": "Hüquqi şəxs"
     },
     {
      "name": "Fiziki şəxs"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "ciddi-hesabat-blanklari__vekil-orderi",
  "category": "Ciddi hesabat blankları",
  "name": "Vəkil orderi",
  "source": "https://print.az/ciddi-hesabat-blanklari/vekil-orderi/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "ciddi-hesabat-blanklari__yuk-avtoneqliyyati-ucun-yol-vereqi",
  "category": "Ciddi hesabat blankları",
  "name": "Yük avtonəqliyyatı üçün yol vərəqi",
  "source": "https://print.az/ciddi-hesabat-blanklari/yuk-avtoneqliyyati-ucun-yol-vereqi/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   3,
   4,
   5,
   6,
   7,
   8,
   9,
   10
  ],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Sifarişçi növü",
    "choices": [
     {
      "name": "Hüquqi şəxs"
     },
     {
      "name": "Fiziki şəxs"
     }
    ]
   }
  ],
  "qtyUnit": "paçka"
 },
 {
  "key": "genisformatli-cap__banner-capi",
  "category": "Genişformatlı çap",
  "name": "Banner çapı",
  "source": "https://print.az/genisformatli-cap/banner-capi/",
  "model": "per_sqm",
  "qty": [],
  "groups": [
   {
    "name": "Banner materialı",
    "choices": [
     {
      "name": "Arxası ağ (standart)"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "genisformatli-cap__brandwall",
  "category": "Genişformatlı çap",
  "name": "Brandwall",
  "source": "https://print.az/genisformatli-cap/brandwall/",
  "model": "per_sqm",
  "qty": [],
  "groups": [
   {
    "name": "Karkas növü",
    "choices": [
     {
      "name": "Taxta karkas"
     },
     {
      "name": "Metal karkas"
     }
    ]
   },
   {
    "name": "Çatdırılma və montaj",
    "choices": [
     {
      "name": "Çatdırılma və montaj (Bakı)"
     },
     {
      "name": "Çatdırılma və montaj (Rayonlar)"
     }
    ]
   },
   {
    "name": "Demontaj",
    "choices": [
     {
      "name": "Lazım deyil"
     },
     {
      "name": "Demontaj"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "genisformatli-cap__ketan-uzerine-cap",
  "category": "Genişformatlı çap",
  "name": "Kətan üzərinə çap",
  "source": "https://print.az/genisformatli-cap/ketan-uzerine-cap/",
  "model": "per_sqm",
  "qty": [],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "genisformatli-cap__roll-up",
  "category": "Genişformatlı çap",
  "name": "Roll-up",
  "source": "https://print.az/genisformatli-cap/roll-up/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Ölçü",
    "choices": [
     {
      "name": "85 × 200 sm"
     },
     {
      "name": "100 × 200 sm"
     },
     {
      "name": "120 × 200 sm"
     },
     {
      "name": "200 × 200 sm"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "genisformatli-cap__setka-banner-capi",
  "category": "Genişformatlı çap",
  "name": "Setka banner çapı",
  "source": "https://print.az/genisformatli-cap/setka-banner-capi/",
  "model": "per_sqm",
  "qty": [],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "genisformatli-cap__setka-vinil-capi",
  "category": "Genişformatlı çap",
  "name": "Setka vinil çapı",
  "source": "https://print.az/genisformatli-cap/setka-vinil-capi/",
  "model": "per_sqm",
  "qty": [],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "genisformatli-cap__vinil-capi",
  "category": "Genişformatlı çap",
  "name": "Vinil çapı",
  "source": "https://print.az/genisformatli-cap/vinil-capi/",
  "model": "per_sqm",
  "qty": [],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__bloknotlar",
  "category": "Mətbəə məhsulları",
  "name": "Bloknotlar",
  "source": "https://print.az/korporativ-cap-mehsullari/bloknotlar/",
  "model": "per_unit",
  "qty": [
   10,
   25,
   50,
   100,
   250,
   500,
   1000
  ],
  "groups": [
   {
    "name": "Məhsul növü",
    "choices": [
     {
      "name": "A6"
     },
     {
      "name": "A5"
     },
     {
      "name": "A4"
     }
    ]
   },
   {
    "name": "Cildləmə növü",
    "choices": [
     {
      "name": "Spiral"
     },
     {
      "name": "Termokley"
     }
    ]
   },
   {
    "name": "Cildləmə istiqaməti",
    "choices": [
     {
      "name": "Yuxarıdan"
     },
     {
      "name": "Soldan"
     }
    ]
   },
   {
    "name": "Daxili səhifələrdə çap rəngi",
    "choices": [
     {
      "name": "Qara-ağ çap (daxildir)"
     },
     {
      "name": "Tam rəngli çap",
      "multiplier": 1.03
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__brosur-ve-kataloq-capi",
  "category": "Mətbəə məhsulları",
  "name": "Broşür və Kataloq Çapı",
  "source": "https://print.az/korporativ-cap-mehsullari/brosur-ve-kataloq-capi/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Format",
    "choices": [
     {
      "name": "A6"
     },
     {
      "name": "A5"
     },
     {
      "name": "A4"
     },
     {
      "name": "A3"
     },
     {
      "name": "210×210 mm"
     }
    ]
   },
   {
    "name": "Orientasiya",
    "choices": [
     {
      "name": "Portret (Vertikal)"
     },
     {
      "name": "Albom (Horizontal)"
     }
    ]
   },
   {
    "name": "Səhifə sayı",
    "choices": [
     {
      "name": "8"
     },
     {
      "name": "12"
     },
     {
      "name": "16"
     },
     {
      "name": "20"
     },
     {
      "name": "24"
     },
     {
      "name": "28"
     },
     {
      "name": "32"
     },
     {
      "name": "36"
     },
     {
      "name": "40"
     },
     {
      "name": "44"
     },
     {
      "name": "48"
     },
     {
      "name": "52"
     },
     {
      "name": "56"
     },
     {
      "name": "60"
     },
     {
      "name": "64"
     },
     {
      "name": "68"
     },
     {
      "name": "72"
     },
     {
      "name": "76"
     },
     {
      "name": "80"
     },
     {
      "name": "84"
     },
     {
      "name": "88"
     },
     {
      "name": "92"
     },
     {
      "name": "96"
     },
     {
      "name": "100"
     },
     {
      "name": "104"
     },
     {
      "name": "108"
     },
     {
      "name": "112"
     },
     {
      "name": "116"
     },
     {
      "name": "120"
     },
     {
      "name": "124"
     },
     {
      "name": "128"
     },
     {
      "name": "132"
     },
     {
      "name": "136"
     },
     {
      "name": "140"
     },
     {
      "name": "144"
     },
     {
      "name": "148"
     },
     {
      "name": "152"
     },
     {
      "name": "156"
     },
     {
      "name": "160"
     },
     {
      "name": "164"
     }
    ]
   },
   {
    "name": "Üz qabığı kağızı",
    "choices": [
     {
      "name": "250 gsm"
     },
     {
      "name": "300 gsm"
     },
     {
      "name": "350 gsm"
     }
    ]
   },
   {
    "name": "İç səhifə kağızı",
    "choices": [
     {
      "name": "90 gsm"
     },
     {
      "name": "120 gsm"
     },
     {
      "name": "150 gsm"
     },
     {
      "name": "170 gsm"
     },
     {
      "name": "200 gsm"
     }
    ]
   },
   {
    "name": "Üz qabığı laminasiyası",
    "choices": [
     {
      "name": "Yoxdur"
     },
     {
      "name": "Parlaq"
     },
     {
      "name": "Mat"
     },
     {
      "name": "Soft Touch (ipək)"
     }
    ]
   },
   {
    "name": "İç səhifə laminasiyası",
    "choices": [
     {
      "name": "Yoxdur"
     },
     {
      "name": "Parlaq"
     },
     {
      "name": "Mat"
     }
    ]
   },
   {
    "name": "Cildləmə növü",
    "choices": [
     {
      "name": "Stepler"
     },
     {
      "name": "Spiral"
     },
     {
      "name": "Termokley (Yumşaq cildləmə)"
     },
     {
      "name": "Sərt cildləmə"
     }
    ]
   },
   {
    "name": "Spiral növü",
    "choices": [
     {
      "name": "Plastik Spiral"
     },
     {
      "name": "Metal Spiral"
     }
    ]
   },
   {
    "name": "Spiral rəngi",
    "choices": [
     {
      "name": "Ağ"
     },
     {
      "name": "Qara"
     },
     {
      "name": "Qırmızı"
     },
     {
      "name": "Mavi"
     }
    ]
   },
   {
    "name": "Spiral hara vurulsun?",
    "choices": [
     {
      "name": "Sol tərəfdən"
     },
     {
      "name": "Yuxarıdan"
     }
    ]
   },
   {
    "name": "Şəffaf ön və arxa qoruyucu örtük əlavə edilsin?",
    "choices": [
     {
      "name": "Bəli"
     },
     {
      "name": "Xeyr"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__bukletler",
  "category": "Mətbəə məhsulları",
  "name": "Bukletlər",
  "source": "https://print.az/korporativ-cap-mehsullari/bukletler/",
  "model": "per_unit",
  "qty": [
   100,
   250,
   500,
   1000,
   3000,
   5000
  ],
  "groups": [
   {
    "name": "Məhsul növü",
    "choices": [
     {
      "name": "A4 → A5 Qatlama"
     },
     {
      "name": "A4 → Z Qatlama"
     },
     {
      "name": "A4 → 3 Qatlama (3 Hissəli)"
     },
     {
      "name": "A3 → A4 Qatlama"
     },
     {
      "name": "A3 → Z Qatlama"
     },
     {
      "name": "A3 → 3 Hissəli"
     }
    ]
   },
   {
    "name": "Kağız",
    "choices": [
     {
      "name": "130 qr Təbaşirli"
     },
     {
      "name": "150 qr Təbaşirli"
     },
     {
      "name": "170 qr Təbaşirli"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__divar-teqvimi",
  "category": "Mətbəə məhsulları",
  "name": "Divar Təqvimi",
  "source": "https://print.az/korporativ-cap-mehsullari/divar-teqvimi/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Növ",
    "choices": [
     {
      "name": "Vərəqlənən"
     },
     {
      "name": "Vərəqlənməyən (tək vərəq)"
     }
    ]
   },
   {
    "name": "Laminasiya",
    "choices": [
     {
      "name": "Mat"
     },
     {
      "name": "Parlaq"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__firma-blanklari",
  "category": "Mətbəə məhsulları",
  "name": "Firma Blankları",
  "source": "https://print.az/korporativ-cap-mehsullari/firma-blanklari/",
  "model": "per_unit",
  "qty": [
   50,
   100,
   250,
   500,
   1000,
   3000,
   5000,
   10000
  ],
  "groups": [
   {
    "name": "Növ",
    "choices": [
     {
      "name": "Econom"
     },
     {
      "name": "Standard"
     },
     {
      "name": "Premium"
     }
    ]
   },
   {
    "name": "Arxa hissədə nömrələmə olsun?",
    "choices": [
     {
      "name": "Xeyr"
     },
     {
      "name": "Bəli"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__flayerler",
  "category": "Mətbəə məhsulları",
  "name": "Flayerlər",
  "source": "https://print.az/korporativ-cap-mehsullari/flayerler/",
  "model": "per_unit",
  "qty": [
   100,
   250,
   500,
   1000,
   2500,
   5000,
   10000
  ],
  "groups": [
   {
    "name": "Ölçü",
    "choices": [
     {
      "name": "Standard (99 × 210 mm)"
     },
     {
      "name": "A6 (105 × 148 mm)"
     },
     {
      "name": "A5 (148 × 210 mm)"
     },
     {
      "name": "A4 (210 × 297 mm)"
     },
     {
      "name": "Kvadrat (148 × 148 mm)"
     }
    ]
   },
   {
    "name": "Prioritet",
    "choices": [
     {
      "name": "Ən sərfəli qiymət"
     },
     {
      "name": "Ən sürətli istehsal"
     }
    ]
   },
   {
    "name": "Kağız",
    "choices": [
     {
      "name": "130 gsm"
     },
     {
      "name": "170 gsm"
     },
     {
      "name": "250 gsm"
     },
     {
      "name": "300 gsm"
     }
    ]
   },
   {
    "name": "Çap tərəfi",
    "choices": [
     {
      "name": "1 tərəfli"
     },
     {
      "name": "2 tərəfli"
     }
    ]
   },
   {
    "name": "Laminasiya",
    "choices": [
     {
      "name": "Yoxdur"
     },
     {
      "name": "Mat"
     },
     {
      "name": "Parlaq"
     },
     {
      "name": "İpək (Soft Touch)"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__kagiz-cantalar",
  "category": "Mətbəə məhsulları",
  "name": "Kağız Çantalar",
  "source": "https://print.az/korporativ-cap-mehsullari/kagiz-cantalar/",
  "model": "per_unit",
  "qty": [
   1,
   5,
   10,
   20,
   35,
   50,
   100,
   300
  ],
  "groups": [
   {
    "name": "Çanta növü",
    "choices": [
     {
      "name": "Ağ Kağız Çanta + Loqo"
     },
     {
      "name": "Tam Çaplı Çanta"
     }
    ]
   },
   {
    "name": "Qulp rəngi",
    "choices": [
     {
      "name": "Ağ"
     },
     {
      "name": "Qara"
     },
     {
      "name": "Qırmızı"
     },
     {
      "name": "Göy"
     },
     {
      "name": "Sarı"
     },
     {
      "name": "Yaşıl"
     },
     {
      "name": "Qızılı"
     }
    ]
   },
   {
    "name": "Ölçü",
    "choices": [
     {
      "name": "A5 Çanta"
     },
     {
      "name": "A4 Çanta"
     },
     {
      "name": "A3 Çanta"
     }
    ]
   },
   {
    "name": "Çap sahəsi",
    "choices": [
     {
      "name": "Ön tərəf"
     },
     {
      "name": "Ön + Arxa tərəf"
     }
    ]
   },
   {
    "name": "Qulp növü",
    "choices": [
     {
      "name": "Hörük ip"
     },
     {
      "name": "Düz lent"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__kagiz-qovluqlar",
  "category": "Mətbəə məhsulları",
  "name": "Kağız Qovluqlar",
  "source": "https://print.az/korporativ-cap-mehsullari/kagiz-qovluqlar/",
  "model": "per_unit",
  "qty": [
   1,
   5,
   10,
   25,
   50,
   75,
   100,
   300,
   500,
   1000
  ],
  "groups": [
   {
    "name": "Növ",
    "choices": [
     {
      "name": "Qovluq A4 (Standart)"
     },
     {
      "name": "Qovluq A4 (İç hissəsi çaplı)"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__masaustu-teqvim",
  "category": "Mətbəə məhsulları",
  "name": "Masaüstü Təqvim",
  "source": "https://print.az/korporativ-cap-mehsullari/masaustu-teqvim/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Növ",
    "choices": [
     {
      "name": "Vərəqlənən (spirallı)"
     },
     {
      "name": "Vərəqlənməyən"
     }
    ]
   },
   {
    "name": "Laminasiya",
    "choices": [
     {
      "name": "Mat"
     },
     {
      "name": "Parlaq"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__posterler",
  "category": "Mətbəə məhsulları",
  "name": "Posterlər",
  "source": "https://print.az/korporativ-cap-mehsullari/posterler/",
  "model": "per_unit",
  "qty": [
   1,
   2,
   5,
   10,
   20,
   50,
   100
  ],
  "groups": [
   {
    "name": "Ölçü",
    "choices": [
     {
      "name": "A4 (210 × 297 mm)"
     },
     {
      "name": "A3 (297 × 420 mm)"
     },
     {
      "name": "A2 (420 × 594 mm)"
     },
     {
      "name": "A1 (594 × 841 mm)"
     },
     {
      "name": "A0 (841 × 1189 mm)"
     }
    ]
   },
   {
    "name": "Çərçivə əlavə edilsin?",
    "choices": [
     {
      "name": "Xeyr"
     },
     {
      "name": "Bəli"
     }
    ]
   },
   {
    "name": "Çərçivə rəngi",
    "choices": [
     {
      "name": "Qara"
     },
     {
      "name": "Ağ"
     },
     {
      "name": "Tünd ağac"
     },
     {
      "name": "Açıq ağac"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Xeyr, dizayn hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__sertifikatlar",
  "category": "Mətbəə məhsulları",
  "name": "Sertifikatlar",
  "source": "https://print.az/korporativ-cap-mehsullari/sertifikatlar/",
  "model": "per_unit",
  "qty": [
   1,
   10,
   25,
   50,
   100,
   250,
   500
  ],
  "groups": [
   {
    "name": "Kağız",
    "choices": [
     {
      "name": "Standart — 250 qram"
     },
     {
      "name": "Premium — 350 qram"
     }
    ]
   },
   {
    "name": "Əlavə seçimlər",
    "choices": [
     {
      "name": "Yoxdur"
     },
     {
      "name": "Yaldız (folqa) basma"
     },
     {
      "name": "Relyef (embossing) basma"
     },
     {
      "name": "Fərdi ad çapı (Excel siyahısı ilə)"
     }
    ]
   },
   {
    "name": "Çərçivə əlavə edilsin?",
    "choices": [
     {
      "name": "Xeyr"
     },
     {
      "name": "Bəli"
     }
    ]
   },
   {
    "name": "Çərçivə rəngi",
    "choices": [
     {
      "name": "Qara"
     },
     {
      "name": "Ağ"
     },
     {
      "name": "Tünd ağac"
     },
     {
      "name": "Açıq ağac"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__stiker-yapisqan",
  "category": "Mətbəə məhsulları",
  "name": "Stiker çapı (Yapışqan)",
  "source": "https://print.az/korporativ-cap-mehsullari/stiker-yapisqan/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Forma",
    "choices": [
     {
      "name": "Dairəvi"
     },
     {
      "name": "Kvadrat"
     },
     {
      "name": "Xüsusi ölçü / forma"
     }
    ]
   },
   {
    "name": "Ölçü",
    "choices": [
     {
      "name": "2 × 2 sm"
     },
     {
      "name": "3 × 3 sm"
     },
     {
      "name": "4 × 4 sm"
     },
     {
      "name": "4.5 × 4.5 sm"
     },
     {
      "name": "5 × 5 sm"
     },
     {
      "name": "6 × 6 sm"
     },
     {
      "name": "8 × 8 sm"
     },
     {
      "name": "10 × 10 sm"
     }
    ]
   },
   {
    "name": "Növü",
    "choices": [
     {
      "name": "Sadə"
     },
     {
      "name": "Seçmə lak ilə"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 3
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım hazırdır"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__vizit-kartlar",
  "category": "Mətbəə məhsulları",
  "name": "Vizit kartlar",
  "source": "https://print.az/korporativ-cap-mehsullari/vizit-kartlar/",
  "model": "per_unit",
  "qty": [
   100,
   250,
   500,
   1000
  ],
  "groups": [
   {
    "name": "Kart növü",
    "choices": [
     {
      "name": "Ekonom (300 gsm)"
     },
     {
      "name": "Standard (350 gsm)"
     },
     {
      "name": "Biznes (400 gsm)"
     },
     {
      "name": "Premium (600 gsm)"
     },
     {
      "name": "Deluxe (700 gsm)"
     }
    ]
   },
   {
    "name": "Çap tərəfi",
    "choices": [
     {
      "name": "1 tərəfli"
     },
     {
      "name": "2 tərəfli"
     }
    ]
   },
   {
    "name": "Laminasiya",
    "choices": [
     {
      "name": "Yoxdur"
     },
     {
      "name": "Mat"
     },
     {
      "name": "Parlaq"
     },
     {
      "name": "İpək (Soft Touch)"
     }
    ]
   },
   {
    "name": "Künclər",
    "choices": [
     {
      "name": "Standart"
     },
     {
      "name": "Yuvarlaq"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "korporativ-cap-mehsullari__zerfler",
  "category": "Mətbəə məhsulları",
  "name": "Zərflər",
  "source": "https://print.az/korporativ-cap-mehsullari/zerfler/",
  "model": "per_unit",
  "qty": [
   10,
   25,
   50,
   100,
   250,
   500,
   1000
  ],
  "groups": [
   {
    "name": "Məhsul növü",
    "choices": [
     {
      "name": "DL (Diplomat)"
     },
     {
      "name": "A5"
     },
     {
      "name": "A4"
     },
     {
      "name": "A3"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 5
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Dizaynım var"
     },
     {
      "name": "Dizayn Lemur tərəfindən hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "mohur-ve-stamplar__mektebli-motivasiya-stamplari",
  "category": "Möhür və ştamplar",
  "name": "Məktəbli motivasiya ştampları",
  "source": "https://print.az/mohur-ve-stamplar/mektebli-motivasiya-stamplari/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 2
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "mohur-ve-stamplar__surquc-mohur-ve-stamplar",
  "category": "Möhür və ştamplar",
  "name": "Surquç möhürü",
  "source": "https://print.az/mohur-ve-stamplar/surquc-mohur-ve-stamplar/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Ölçü və forma",
    "choices": [
     {
      "name": "15 mm dairəvi"
     },
     {
      "name": "20 mm dairəvi"
     },
     {
      "name": "25 mm dairəvi"
     },
     {
      "name": "40 mm dairəvi"
     },
     {
      "name": "40 mm kvadrat"
     }
    ]
   },
   {
    "name": "Surquç (mum)",
    "choices": [
     {
      "name": "Yox"
     },
     {
      "name": "10 əd."
     },
     {
      "name": "50 əd."
     },
     {
      "name": "100 əd."
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 3
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Xeyr, dizayn hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "promo-mehsullar__masaustu-bayraq",
  "category": "Promo məhsullar",
  "name": "Masaüstü bayraq",
  "source": "https://print.az/promo-mehsullar/masaustu-bayraq/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Dirək",
    "choices": [
     {
      "name": "Dirəksiz (yalnız bayraq)"
     },
     {
      "name": "Xrom 1-li"
     },
     {
      "name": "Xrom 2-li"
     },
     {
      "name": "Xrom 3-lü"
     },
     {
      "name": "Xrom 4-lü"
     },
     {
      "name": "Xrom 5-li"
     },
     {
      "name": "Qızılı 1-li"
     },
     {
      "name": "Qızılı 2-li"
     }
    ]
   },
   {
    "name": "Bayraq növü",
    "choices": [
     {
      "name": "Loqolu bayraq"
     },
     {
      "name": "Ölkə bayrağı"
     }
    ]
   },
   {
    "name": "Çap tərəfi",
    "choices": [
     {
      "name": "Bir tərəf"
     },
     {
      "name": "İki tərəf"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 3
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Xeyr, dizayn hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 },
 {
  "key": "promo-mehsullar__yastiq",
  "category": "Promo məhsullar",
  "name": "Yastıq çapı",
  "source": "https://print.az/promo-mehsullar/yastiq/",
  "model": "per_unit",
  "qty": [],
  "groups": [
   {
    "name": "Ölçü",
    "choices": [
     {
      "name": "40×40 sm"
     }
    ]
   },
   {
    "name": "Hazırlanma müddəti",
    "choices": [
     {
      "name": "Standart",
      "days": 3
     },
     {
      "name": "Növbəti iş günü",
      "multiplier": 1.5,
      "days": 1
     },
     {
      "name": "Eyni iş günü",
      "multiplier": 2.0,
      "days": 0
     }
    ]
   },
   {
    "name": "Çatdırılma",
    "choices": [
     {
      "name": "Ofisdən təhvil alma"
     },
     {
      "name": "Bakı daxili çatdırılma"
     },
     {
      "name": "Rayonlara çatdırılma"
     }
    ]
   },
   {
    "name": "Dizayn",
    "choices": [
     {
      "name": "Bəli, dizaynım hazırdır"
     },
     {
      "name": "Xeyr, dizayn hazırlansın"
     }
    ]
   }
  ],
  "qtyUnit": "ədəd"
 }
];

/** print.az-da kalkulyatoru olmayan, sorğu ilə qiymət verilən məhsullar */
export const REQUEST_ONLY: { category: string; name: string; source: string }[] = [
 {
  "category": "Mətbəə məhsulları",
  "name": "Menyu çapı",
  "source": "https://print.az/korporativ-cap-mehsullari/menyu-capi/"
 },
 {
  "category": "Möhür və ştamplar",
  "name": "Avtomatik Möhür və Ştamplar",
  "source": "https://print.az/mohur-ve-stamplar/avtomatik-mohurler/"
 },
 {
  "category": "Möhür və ştamplar",
  "name": "Cib möhürləri",
  "source": "https://print.az/mohur-ve-stamplar/cib-mohurleri/"
 },
 {
  "category": "Möhür və ştamplar",
  "name": "Flash möhürlər",
  "source": "https://print.az/mohur-ve-stamplar/flash-mohurler/"
 },
 {
  "category": "Möhür və ştamplar",
  "name": "İmza möhürləri / Faksimile",
  "source": "https://print.az/mohur-ve-stamplar/imza-mohurleri-faksimile/"
 },
 {
  "category": "Möhür və ştamplar",
  "name": "İtirilmiş və yararsız möhürün əvəz edilməsi",
  "source": "https://print.az/mohur-ve-stamplar/itirilmis-ve-yararsiz-mohur/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Açarlıqlar",
  "source": "https://print.az/promo-mehsullar/acarliqlar/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Bloknotlar və Ajandalar",
  "source": "https://print.az/promo-mehsullar/bloknot-ve-ajandalar/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Event və Konfrans Məhsulları",
  "source": "https://print.az/promo-mehsullar/event-ve-konfrans-mehsullari/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Geyim və Tekstil",
  "source": "https://print.az/promo-mehsullar/geyim-ve-tekstil/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Korporativ Hədiyyə Dəstləri",
  "source": "https://print.az/promo-mehsullar/hediyye-destleri/"
 },
 {
  "category": "Promo məhsullar",
  "name": "İçki Qabları",
  "source": "https://print.az/promo-mehsullar/icki-qablari/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Puzzle",
  "source": "https://print.az/promo-mehsullar/puzzle/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Qələmlər",
  "source": "https://print.az/promo-mehsullar/qelemler/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Rozetlər",
  "source": "https://print.az/promo-mehsullar/rozetler/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Stəkan altlığı",
  "source": "https://print.az/promo-mehsullar/stekan-altligi/"
 },
 {
  "category": "Promo məhsullar",
  "name": "Texnologiya Məhsulları",
  "source": "https://print.az/promo-mehsullar/texnologiya-mehsullari/"
 },
 {
  "category": "Reklam",
  "name": "Daxili reklam konstruksiyaları",
  "source": "https://print.az/reklam/daxili-reklam-konstruksiyalari/"
 },
 {
  "category": "Reklam",
  "name": "Fasad reklamları",
  "source": "https://print.az/reklam/fasad-reklamlari/"
 },
 {
  "category": "Reklam",
  "name": "Fərdi reklam layihələri",
  "source": "https://print.az/reklam/ferdi-reklam-layiheleri/"
 },
 {
  "category": "Reklam",
  "name": "Həcmli hərflər",
  "source": "https://print.az/reklam/hecmli-herfler/"
 },
 {
  "category": "Reklam",
  "name": "İşıqlı lövhələr",
  "source": "https://print.az/reklam/isiqli-lovheler/"
 },
 {
  "category": "Reklam",
  "name": "İşıqsız lövhələr",
  "source": "https://print.az/reklam/isiqsiz-lovheler/"
 },
 {
  "category": "Reklam",
  "name": "İstiqamətləndirici lövhələr",
  "source": "https://print.az/reklam/istiqametlendirici-lovheler/"
 },
 {
  "category": "Reklam",
  "name": "Pilonlar",
  "source": "https://print.az/reklam/pilonlar/"
 },
 {
  "category": "Reklam",
  "name": "Sərgi stendləri",
  "source": "https://print.az/reklam/sergi-stendleri/"
 },
 {
  "category": "Reklam",
  "name": "Vitrin tərtibatı",
  "source": "https://print.az/reklam/vitrin-tertibati/"
 },
 {
  "category": "Tədbirlər",
  "name": "ADEX 2026 iştirakçıları üçün Bakıda çap",
  "source": "https://print.az/tedbirler/adex-2026/"
 },
 {
  "category": "Tədbirlər",
  "name": "BakuBuild 2026 və Caspian Construction Week: stendiniz üçün çap",
  "source": "https://print.az/tedbirler/caspian-construction-week-2026/"
 },
 {
  "category": "Tədbirlər",
  "name": "ExpoSport 2026 — idman, fitnes və wellness brendləri üçün Bakıda çap",
  "source": "https://print.az/tedbirler/exposport-2026/"
 },
 {
  "category": "Tədbirlər",
  "name": "Bakıda yarış günləri üçün təcili çap",
  "source": "https://print.az/tedbirler/formula-1-baku-2026/"
 },
 {
  "category": "Tədbirlər",
  "name": "ICPC 2025 Bakı — çap işlərimiz",
  "source": "https://print.az/tedbirler/icpc-2025/"
 },
 {
  "category": "Tədbirlər",
  "name": "Securex Caspian 2026 iştirakçıları üçün Bakıda çap",
  "source": "https://print.az/tedbirler/securex-caspian-2026/"
 },
 {
  "category": "Tədbirlər",
  "name": "World Aquatics 2026 üçün Bakıda çap — komandalar, brendlər və media",
  "source": "https://print.az/tedbirler/world-aquatics-baku-2026/"
 }
];
