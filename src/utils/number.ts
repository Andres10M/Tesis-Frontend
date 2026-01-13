export function toNumber(value?: string | number): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const normalized = value
    .replace(/\./g, '')   // quita separador de miles
    .replace(',', '.');   // decimal correcto

  const num = Number(normalized);
  return isNaN(num) ? 0 : num;
}
