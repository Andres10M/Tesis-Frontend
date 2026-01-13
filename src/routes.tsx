import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";

import Reuniones from "./pages/Reuniones";
import Asistencia from "./pages/Asistencia";
import OrdenDia from "./pages/OrdenDia";
import SociosList from "./pages/SociosList";
import Multas from "./pages/Multas";
import CuentasList from "./pages/CuentasList";
import SocioCuenta from "./pages/SocioCuenta"; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<SociosList />} />
        <Route path="/socios" element={<SociosList />} />

        {/* 👇 RUTA CON CÉDULA */}
        <Route
          path="/socios/:cedula/cuenta"
          element={<SocioCuenta />}
        />

        <Route path="/reuniones" element={<Reuniones />} />
        <Route path="/reuniones/:id/asistencia" element={<Asistencia />} />
        <Route path="/reuniones/:id/orden-dia" element={<OrdenDia />} />
        <Route path="/multas" element={<Multas />} />
        <Route path="/cuentas" element={<CuentasList />} />
      </Route>
    </Routes>
  );
}
