export type TipoCuota =
  | "APORTE_2"
  | "CUOTA_20"
  | "INGRESO"
  | "MULTA_DOS"
  | "MULTA_VEINTE";

export interface Socio {
  nui: string;
  firstname: string;
  lastname: string;
}
