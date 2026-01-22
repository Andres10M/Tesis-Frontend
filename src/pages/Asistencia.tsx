
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Flex,
  Text,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Badge,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

type EstadoAsistencia = 'ASISTIO' | 'TARDE' | 'FALTA';

interface AttendanceRow {
  id: number;
  estado: EstadoAsistencia;
  observacion?: string | null;
  justificado: boolean;
  multa: number;
  meeting: { isClosed: boolean };
  person: {
    nui: string;
    firstname: string;
    lastname: string;
  };
}

export default function Asistencia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const modal = useDisclosure();

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [rowActual, setRowActual] = useState<AttendanceRow | null>(null);
  const [textoJustificacion, setTextoJustificacion] = useState('');
  const [loadingTable, setLoadingTable] = useState(true);
  const [loading, setLoading] = useState(false);

  const cerrado = rows[0]?.meeting?.isClosed ?? false;

  // ===============================
  // CARGAR ASISTENCIA
  // ===============================
  useEffect(() => {
    if (id) cargarAsistencia();
  }, [id]);

  async function cargarAsistencia() {
    try {
      setLoadingTable(true);
      const res = await api.get(`/attendance/meeting/${id}`);
      setRows(res.data ?? []);
    } finally {
      setLoadingTable(false);
    }
  }

  // ===============================
  // ACTUALIZAR FILA (🔥 FIX TOTAL)
  // ===============================
  async function actualizarFila(
    r: AttendanceRow,
    estado: EstadoAsistencia,
  ) {
    if (cerrado) return;

    // 🔥 UI inmediata
    setRows(prev =>
      prev.map(row =>
        row.id === r.id
          ? {
              ...row,
              estado,
              multa:
                !row.justificado && estado === 'TARDE'
                  ? 1
                  : !row.justificado && estado === 'FALTA'
                  ? 3
                  : 0,
            }
          : row,
      ),
    );

    const payload = {
      estado,
      observacion: r.observacion,
      justificado: r.justificado,
    };

    const res = await api.patch(`/attendance/${r.id}`, payload);

    // 🔥 sincroniza con backend
    setRows(prev =>
      prev.map(row =>
        row.id === r.id
          ? {
              ...row,
              estado: res.data.estado,
              observacion: res.data.observacion,
              justificado: res.data.justificado,
              multa: Number(res.data.multa) || 0,
            }
          : row,
      ),
    );
  }

  // ===============================
  // CHECKS
  // ===============================
  function marcarAsistio(r: AttendanceRow, checked: boolean) {
    actualizarFila(r, checked ? 'ASISTIO' : 'FALTA');
  }

  function marcarTarde(r: AttendanceRow, checked: boolean) {
    actualizarFila(r, checked ? 'TARDE' : 'ASISTIO');
  }

  // ===============================
  // JUSTIFICACIÓN
  // ===============================
  function abrirJustificacion(r: AttendanceRow) {
    setRowActual(r);
    setTextoJustificacion(r.observacion ?? '');
    modal.onOpen();
  }

  async function guardarJustificacion() {
    if (!rowActual) return;

    const payload = {
      estado: rowActual.estado,
      observacion: textoJustificacion,
      justificado: textoJustificacion.trim().length > 0,
    };

    const res = await api.patch(
      `/attendance/${rowActual.id}`,
      payload,
    );

    setRows(prev =>
      prev.map(r =>
        r.id === rowActual.id
          ? {
              ...r,
              observacion: res.data.observacion,
              justificado: res.data.justificado,
              multa: Number(res.data.multa) || 0,
            }
          : r,
      ),
    );

    modal.onClose();
  }

  // ===============================
  // RESUMEN EN TIEMPO REAL (🔥)
  // ===============================
  const resumen = rows.reduce(
    (acc, r) => {
      if (r.estado === 'ASISTIO') acc.asistio++;
      if (r.estado === 'TARDE') acc.tarde++;
      if (r.estado === 'FALTA') acc.falta++;
      acc.multas += r.multa;
      return acc;
    },
    { asistio: 0, tarde: 0, falta: 0, multas: 0 },
  );

  // ===============================
  // CERRAR ASISTENCIA
  // ===============================
  async function cerrarAsistencia() {
    try {
      setLoading(true);
      await api.post(`/attendance/meeting/${id}/close`);
      toast({ title: 'Asistencia cerrada', status: 'success' });
      await cargarAsistencia();
    } finally {
      setLoading(false);
    }
  }

  // ===============================
  // UI
  // ===============================
  return (
    <Box p={8}>
      <Button mb={4} onClick={() => navigate(-1)}>
        Volver
      </Button>

      <Heading mb={6}>Registro de Asistencia</Heading>

      {loadingTable ? (
        <Spinner />
      ) : (
        <Table size="sm">
          <Thead bg="gray.100">
            <Tr>
              <Th>Cédula</Th>
              <Th>Socio</Th>
              <Th textAlign="center">Asistió</Th>
              <Th textAlign="center">Tarde</Th>
              <Th>Justificación</Th>
            </Tr>
          </Thead>

          <Tbody>
            {rows.map(r => (
              <Tr key={r.id}>
                <Td>{r.person.nui}</Td>
                <Td>
                  {r.person.firstname} {r.person.lastname}
                </Td>

                <Td textAlign="center">
                  <Checkbox
                    isChecked={
                      r.estado === 'ASISTIO' || r.estado === 'TARDE'
                    }
                    isDisabled={cerrado}
                    onChange={e =>
                      marcarAsistio(r, e.target.checked)
                    }
                  />
                </Td>

                <Td textAlign="center">
                  <Checkbox
                    isChecked={r.estado === 'TARDE'}
                    isDisabled={cerrado}
                    onChange={e =>
                      marcarTarde(r, e.target.checked)
                    }
                  />
                </Td>

                <Td>
                  <Button
                    size="sm"
                    colorScheme={r.observacion ? 'green' : 'gray'}
                    onClick={() => abrirJustificacion(r)}
                  >
                    {cerrado ? 'Ver' : 'Ver / Editar'}
                  </Button>

                  {r.multa > 0 && (
                    <Badge ml={2} colorScheme="red">
                      Multa ${r.multa}
                    </Badge>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}

      {/* 🔥 RESUMEN EN VIVO */}
      <Box mt={6} p={4} border="1px solid" borderColor="gray.300">
        <Heading size="sm">Resumen</Heading>
        <Flex gap={6} fontWeight="bold" mt={2}>
          <Text>Asistieron: {resumen.asistio}</Text>
          <Text>Tardanzas: {resumen.tarde}</Text>
          <Text>Faltas: {resumen.falta}</Text>
          <Text>Total multas: ${resumen.multas}</Text>
        </Flex>
      </Box>

      <Flex justify="flex-end" gap={3} mt={6}>
        <Button
          onClick={cerrarAsistencia}
          isDisabled={cerrado || loading}
        >
          Cerrar asistencia
        </Button>
      </Flex>

      {/* MODAL */}
      <Modal isOpen={modal.isOpen} onClose={modal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Justificación</ModalHeader>
          <ModalBody>
            <Textarea
              value={textoJustificacion}
              onChange={e =>
                setTextoJustificacion(e.target.value)
              }
              isDisabled={cerrado}
            />
          </ModalBody>
          <ModalFooter>
            {!cerrado && (
              <Button
                colorScheme="green"
                onClick={guardarJustificacion}
              >
                Guardar
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
