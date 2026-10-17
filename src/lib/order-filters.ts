import { STATUS } from "./order-status";

export interface OrderFilters {
  q?: string;
  status?: string;
  from?: string; // YYYY-MM-DD
  to?: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Siyahı və CSV eyni filtrləri istifadə etsin deyə ortaq */
export function applyOrderFilters<T extends { eq: any; or: any; gte: any; lt: any }>(query: T, f: OrderFilters): T {
  let q: any = query;
  if (f.status && STATUS[f.status]) q = q.eq("status", f.status);
  // PostgREST filter sintaksisini pozan simvolları təmizlə
  const term = f.q?.replace(/[,()%*\\]/g, " ").trim();
  if (term) {
    q = q.or(`customer_name.ilike.%${term}%,customer_phone.ilike.%${term}%,product_name.ilike.%${term}%`);
  }
  if (f.from && DATE.test(f.from)) q = q.gte("created_at", `${f.from}T00:00:00`);
  if (f.to && DATE.test(f.to)) {
    const d = new Date(`${f.to}T00:00:00`);
    d.setDate(d.getDate() + 1);
    q = q.lt("created_at", d.toISOString());
  }
  return q;
}
