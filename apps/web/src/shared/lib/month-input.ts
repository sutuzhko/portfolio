// Значение `<input type="month">` (YYYY-MM) ↔ ISO date-time первого числа месяца в UTC —
// в таком виде бэк хранит даты периодов (опыт, образование).

/** ISO date-time → YYYY-MM для `<input type="month">` (пустая строка — даты нет). */
export function isoToMonthInput(iso: string | null): string {
  return iso ? iso.slice(0, 7) : '';
}

/** YYYY-MM → ISO date-time первого числа месяца (UTC). */
export function monthInputToIso(month: string): string {
  return `${month}-01T00:00:00.000Z`;
}
