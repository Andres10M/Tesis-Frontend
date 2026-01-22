import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Reuniones from "./pages/Reuniones";
import Asistencia from "./pages/Asistencia";
import OrdenDia from "./pages/OrdenDia";
import SociosList from "./pages/SociosList";
import Multas from "./pages/Multas";
import CuentasList from "./pages/CuentasList";
import SocioCuenta from "./pages/SocioCuenta";

// CUOTAS
import CuotasList from "./pages/CuotasList";
import CuotaMasiva from "./pages/Cuotas/CuotaMasiva";
import CuotaIngreso from "./pages/Cuotas/CuotaIngreso";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SociosList />} />
        <Route path="/socios" element={<SociosList />} />
        <Route path="/socios/:cedula/cuenta" element={<SocioCuenta />} />

        <Route path="/reuniones" element={<Reuniones />} />
        <Route path="/reuniones/:id/asistencia" element={<Asistencia />} />
        <Route path="/reuniones/:id/orden-dia" element={<OrdenDia />} />

        <Route path="/multas" element={<Multas />} />
        <Route path="/cuentas" element={<CuentasList />} />

        {/* FLUJO REAL */}
        <Route path="/cuotas" element={<CuotasList />} />
        <Route path="/cuotas/:id" element={<CuotaMasiva />} />
        <Route path="/cuotas/ingreso" element={<CuotaIngreso />} />
      </Route>
    </Routes>
  );
}
