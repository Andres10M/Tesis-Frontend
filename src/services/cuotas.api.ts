import { api } from "./api";
import type { TipoCuota } from "../types/cuota";

export async function obtenerSocios() {
  const { data } = await api.get("/person");
  return data;
}

export async function registrarCuotaMasiva(
  meetingId: number,
  tipo: TipoCuota,
  sociosPagados: string[]
) {
  const { data } = await api.post("/cuotas/masiva", {
    meetingId,
    tipo,
    sociosPagados,
  });
  return data;
}

export async function registrarCuotaIngreso(
  socioId: string,
  monto: number
) {
  return api.post("/cuotas/ingreso", {
    socioId,
    monto,
  });
}
