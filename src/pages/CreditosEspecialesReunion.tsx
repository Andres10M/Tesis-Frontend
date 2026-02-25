import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Person {
  nui: string;
  firstname: string;
  lastname: string;
}

interface Fila {
  socio?: Person;
  monto: number;
  interes: number;
  total: number;
  pagado?: boolean;
  estado?: "PENDIENTE" | "PAGADO";
  busqueda?: string;
  fijo?: boolean;
}

const API = "http://localhost:3000";

export default function CreditosEspecialesReunion() {
  const navigate = useNavigate();
  const { id } = useParams();
  const meetingId = Number(id);

  const [fechaISO, setFechaISO] = useState("");
  const [fechaTexto, setFechaTexto] = useState("");
  const [acumulado, setAcumulado] = useState(0);

  const [filas, setFilas] = useState<Fila[]>([]);
  const [resultados, setResultados] = useState<Person[]>([]);
  const [filaActiva, setFilaActiva] = useState<number | null>(null);

  const [mensaje, setMensaje] = useState<string | null>(null);

  const [modalMontoOpen, setModalMontoOpen] = useState(false);
  const [filaEditando, setFilaEditando] = useState<number | null>(null);
  const [montoTemporal, setMontoTemporal] = useState<number | "">("");

  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [filaConfirm, setFilaConfirm] = useState<number | null>(null);

  // 🔴 NUEVO ESTADO PARA VALIDACIÓN
  const [modalErrorOpen, setModalErrorOpen] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const meeting = await fetch(`${API}/meetings/${meetingId}`).then(r => r.json());
        setFechaISO(meeting.fecha);
        setFechaTexto(new Date(meeting.fecha).toLocaleDateString("es-EC"));

        const a = await fetch(`${API}/creditos-especiales/acumulado-anterior/${meetingId}`).then(r => r.json());
        setAcumulado(Number(a.totalRecaudado || 0));

        const guardadas = await fetch(`${API}/creditos-especiales/por-reunion/${meetingId}`).then(r => r.json());

        if (!guardadas || guardadas.length === 0) {
          setFilas([]);
          return;
        }

        const filasConvertidas: Fila[] = guardadas.map((g: any) => ({
          socio: {
            nui: g.socio.nui,
            firstname: g.socio.firstname,
            lastname: g.socio.lastname,
          },
          monto: Number(g.montoPrestado),
          interes: Number(g.interes),
          total: Number(g.totalPagar),
          pagado: g.pagado,
          estado: g.estado,
          fijo: true,
          busqueda: "",
        }));

        setFilas(filasConvertidas);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    cargar();
  }, [meetingId]);

  const buscarSocio = async (texto: string) => {
    if (texto.length < 2) {
      setResultados([]);
      return;
    }
    const r = await fetch(`${API}/person/search?q=${texto}`).then(r => r.json());
    setResultados(r);
  };

  const recalcular = (base: Fila[]) => {
    const fijos = base.filter(f => f.fijo);
    const libres = base.filter(f => !f.fijo);

    const totalFijo = fijos.reduce((s, f) => s + (f.monto || 0), 0);
    const restanteReal = acumulado - totalFijo;

    if (libres.length === 0) {
      return base.map(f => {
        const monto = f.monto || 0;
        const interes = +(monto * 0.02).toFixed(2);
        return { ...f, monto, interes, total: +(monto + interes).toFixed(2) };
      });
    }

    const bruto = restanteReal / libres.length;
    let suma = 0;

    const repartido = base.map(f => {
      let monto = f.fijo ? f.monto : bruto;
      monto = +monto.toFixed(2);
      suma += monto;
      const interes = +(monto * 0.02).toFixed(2);
      return { ...f, monto, interes, total: +(monto + interes).toFixed(2) };
    });

    const diferencia = +(acumulado - suma).toFixed(2);
    if (diferencia !== 0) {
      const i = repartido.map(f => !f.fijo).lastIndexOf(true);
      if (i >= 0) {
        repartido[i].monto = +(repartido[i].monto + diferencia).toFixed(2);
        repartido[i].interes = +(repartido[i].monto * 0.02).toFixed(2);
        repartido[i].total = +(repartido[i].monto + repartido[i].interes).toFixed(2);
      }
    }

    return repartido;
  };

  const nuevaFila = () => {
    setFilas(
      recalcular([
        ...filas,
        {
          monto: 0,
          interes: 0,
          total: 0,
          busqueda: "",
          fijo: false,
          pagado: false,
          estado: "PENDIENTE",
        },
      ])
    );
  };

  const seleccionar = (i: number, p: Person) => {
    const copia = [...filas];
    copia[i].socio = p;
    copia[i].busqueda = "";
    setFilas(copia);
    setResultados([]);
    setFilaActiva(null);
  };

  const togglePagado = (i: number) => {
    const copia = [...filas];
    const fila = copia[i];
    if (!fila) return;

    if (fila.pagado) {
      setFilaConfirm(i);
      setModalConfirmOpen(true);
    } else {
      fila.pagado = true;
      fila.estado = "PAGADO";
      setFilas(copia);
    }
  };

  const confirmarQuitarPago = () => {
    if (filaConfirm === null) return;
    const copia = [...filas];
    copia[filaConfirm].pagado = false;
    copia[filaConfirm].estado = "PENDIENTE";
    setFilas(copia);
    setModalConfirmOpen(false);
    setFilaConfirm(null);
  };

  const cancelarQuitarPago = () => {
    setModalConfirmOpen(false);
    setFilaConfirm(null);
  };

  const totalMonto = filas.reduce((s, f) => s + (f.monto || 0), 0);
  const totalInteres = filas.reduce((s, f) => s + (f.interes || 0), 0);
  const totalGeneral = filas.reduce((s, f) => s + (f.total || 0), 0);
  const totalPagado = filas.filter(f => f.pagado).reduce((s, f) => s + (f.total || 0), 0);
  const totalPendiente = totalGeneral - totalPagado;

  const guardar = async () => {

    // 🔴 VALIDACIÓN AGREGADA
    if (Number(totalMonto.toFixed(2)) !== Number(acumulado.toFixed(2))) {
      setModalErrorOpen(true);
      return;
    }

    try {
      await fetch(`${API}/creditos-especiales/guardar-hoja`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId,
          fecha: fechaISO,
          filas: filas
            .filter(f => f.socio)
            .map(f => ({
              socioId: f.socio!.nui,
              monto: f.monto,
              pagado: f.pagado ?? false,
            })),
        }),
      });

      setMensaje("Créditos especiales guardados correctamente");
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error("Error guardando datos:", error);
      setMensaje("Error guardando créditos especiales");
      setTimeout(() => setMensaje(null), 3000);
    }
  };

  const volver = async () => {
    await guardar();
    navigate(-1);
  };

  return (
    <div style={page}>
      <div style={card}>
        <button onClick={volver} style={btnBack}>
          ← Volver
        </button>

        <h2>Créditos Especiales</h2>

        <div style={info}>
          <div>
            <b>Fecha:</b> {fechaTexto}
          </div>
          <div>
            <b>Acumulado anterior:</b> ${acumulado.toFixed(2)}
            <span style={{ marginLeft: 15, color: "#28a745" }}>
              Total pagado: ${totalPagado.toFixed(2)}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 15 }}>
          <button onClick={nuevaFila} style={btnPrimary}>
            Nuevo socio
          </button>
          <button onClick={guardar} style={btnSave}>
            Guardar hoja
          </button>
        </div>

        <table style={table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Socio</th>
              <th>Monto</th>
              <th>Interés</th>
              <th>Total</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {filas.map((f, i) => (
              <tr key={i} style={{ backgroundColor: f.pagado ? "#d4edda" : undefined }}>
                <td>{i + 1}</td>
                <td style={{ position: "relative" }}>
                  {f.socio ? (
                    `${f.socio.firstname} ${f.socio.lastname}`
                  ) : (
                    <>
                      <input
                        style={input}
                        placeholder="Buscar socio"
                        value={f.busqueda || ""}
                        onFocus={() => setFilaActiva(i)}
                        onChange={e => {
                          const copia = [...filas];
                          copia[i].busqueda = e.target.value;
                          setFilas(copia);
                          buscarSocio(e.target.value);
                        }}
                      />
                      {filaActiva === i && resultados.length > 0 && (
                        <div style={autocomplete}>
                          {resultados.map(p => (
                            <div
                              key={p.nui}
                              style={autocompleteItem}
                              onClick={() => seleccionar(i, p)}
                            >
                              {p.firstname} {p.lastname}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </td>

                <td>
                  <input
                    readOnly
                    style={inputMonto}
                    value={f.monto.toFixed(2)}
                    onClick={() => {
                      setFilaEditando(i);
                      setMontoTemporal(f.monto);
                      setModalMontoOpen(true);
                    }}
                  />
                </td>

                <td>${f.interes.toFixed(2)}</td>
                <td>${f.total.toFixed(2)}</td>

                <td>
                  <button
                    style={{
                      backgroundColor: f.pagado ? "#28a745" : "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "4px 8px",
                      cursor: "pointer",
                    }}
                    onClick={() => togglePagado(i)}
                  >
                    {f.pagado ? "PAGADO" : "PENDIENTE"}
                  </button>
                </td>
              </tr>
            ))}

            <tr style={totalRow}>
              <td colSpan={2}>TOTAL</td>
              <td>${totalMonto.toFixed(2)}</td>
              <td>${totalInteres.toFixed(2)}</td>
              <td>${totalGeneral.toFixed(2)}</td>
              <td></td>
            </tr>

            <tr style={{ ...totalRow, backgroundColor: "#fff3cd" }}>
              <td colSpan={2}>TOTAL PAGADO</td>
              <td colSpan={2}>${totalPagado.toFixed(2)}</td>
              <td colSpan={2}>TOTAL PENDIENTE: ${totalPendiente.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {mensaje && <div style={toast}>{mensaje}</div>}

      {/* 🔴 MODAL DE ERROR AGREGADO */}
      {modalErrorOpen && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3 style={{ color: "#dc3545" }}>Operación no permitida</h3>
            <p>El monto total repartido no coincide con el acumulado anterior.</p>
            <p>Todo el dinero debe repartirse completamente. No puede sobrar ni faltar dinero.</p>
            <div style={{ marginTop: 10 }}>
              <b>Acumulado:</b> ${acumulado.toFixed(2)} <br />
              <b>Total repartido:</b> ${totalMonto.toFixed(2)}
            </div>
            <div style={{ textAlign: "right", marginTop: 20 }}>
              <button
                style={btnPrimary}
                onClick={() => setModalErrorOpen(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {modalMontoOpen && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>Ajustar monto</h3>
            <input
              type="number"
              step="0.01"
              value={montoTemporal}
              onChange={e =>
                setMontoTemporal(e.target.value === "" ? "" : Number(e.target.value))
              }
              style={input}
            />
            <div style={{ textAlign: "right", marginTop: 15 }}>
              <button onClick={() => setModalMontoOpen(false)}>Cancelar</button>
              <button
                style={btnPrimary}
                onClick={() => {
                  if (filaEditando === null || montoTemporal === "") return;
                  const copia = [...filas];
                  copia[filaEditando].monto = montoTemporal;
                  copia[filaEditando].fijo = true;
                  setFilas(recalcular(copia));
                  setModalMontoOpen(false);
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfirmOpen && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>Confirmar</h3>
            <p>¿Está seguro que desea quitar este pago?</p>
            <div style={{ textAlign: "right", marginTop: 15 }}>
              <button onClick={cancelarQuitarPago}>Cancelar</button>
              <button style={btnPrimary} onClick={confirmarQuitarPago}>
                Sí, quitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== ESTILOS ===== */
const page = { background: "#f2f6f8", minHeight: "100vh", padding: 30 };
const card = { background: "#fff", maxWidth: 1150, margin: "auto", padding: 30, border: "1px solid #dbe5ea" };
const info = { display: "flex", justifyContent: "space-between", background: "#eef5f8", padding: 12, marginBottom: 15 };
const table = { width: "100%", borderCollapse: "collapse" as const };
const input = { width: "100%", padding: 6, border: "1px solid #b6c8d4" };
const inputMonto = { ...input, textAlign: "right" as const, background: "#f8fbfd", cursor: "pointer" };
const btnPrimary = { background: "#5fa8d3", color: "#fff", border: "none", padding: "6px 12px", marginLeft: 10 };
const btnSave = { ...btnPrimary, background: "#4a9ac2" };
const btnBack = { background: "none", border: "none", color: "#3b7ca6", cursor: "pointer" };
const autocomplete = { position: "absolute" as const, background: "#fff", border: "1px solid #b6c8d4", width: "100%", zIndex: 10 };
const autocompleteItem = { padding: 6, cursor: "pointer" };
const totalRow = { fontWeight: "bold", background: "#eef5f8" };
const toast = { position: "fixed" as const, bottom: 20, right: 20, background: "#e6f4f1", border: "1px solid #7fc1b4", padding: "12px 18px" };
const modalOverlay = { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center" };
const modal = { background: "#fff", padding: 20, width: 300 };