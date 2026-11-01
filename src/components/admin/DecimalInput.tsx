"use client";

import { useEffect, useState } from "react";

/** Kəsr ədəd xanası: "0,9", "0.9", "0." yazmaq olur. Yazılan mətn saxlanır, valideynə rəqəm (və ya boşsa null) gedir. */
export function DecimalInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  className?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(value == null ? "" : String(value).replace(".", ","));

  // Kənardan dəyər dəyişəndə (məs. təmizlə) mətni yenilə, amma yazılan mətnlə eyni rəqəmdirsə toxunma
  useEffect(() => {
    // Boş xana 0 sayılan sahələrdə (marja və s.) silinəndə "0" geri yazılmasın
    if (text.trim() === "" && (value == null || value === 0)) return;
    const cur = text.trim() === "" ? null : Number(text.replace(",", "."));
    if (value !== cur) setText(value == null ? "" : String(value).replace(".", ","));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      inputMode="decimal"
      className={className}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const t = e.target.value.replace(/[^\d.,-]/g, "");
        setText(t);
        if (t.trim() === "") return onChange(null);
        const n = Number(t.replace(",", "."));
        if (Number.isFinite(n)) onChange(n);
      }}
    />
  );
}
