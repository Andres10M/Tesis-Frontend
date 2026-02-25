import { api } from "./api";
import type { TipoCuota } from "../types/cuota";

// Obtener todos los socios (activos y no activos)
export async function obtenerSocios() {
  const { data } = await api.get("/person");
  return data;
}

// Registrar pago masivo de cuotas para una reunión y tipo
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

// Registrar pago individual de cuota de ingreso para un socio
export async function registrarCuotaIngreso(
  nui: string,
  monto: number
) {
  return api.post("/cuotas/ingreso/pagar", {
    nui,
    monto,
  });
}

// Obtener socios pendientes de pago de cuota de ingreso
export async function obtenerPendientesIngreso() {
  const { data } = await api.get("/cuotas/ingreso/pendientes");
  return data;
}
