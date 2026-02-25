import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Stack,
  Button,
  Input,
  Text,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

// =====================
// TIPOS
// =====================
type MultaPendiente = {
  id: number;
  nui: string;
  socio: string;
  fecha: string;
  estado: string;
  multa: number;
};

type MultaPagada = {
  id: number;
  nui: string;
  socio: string;
  fechaPago: string;
  monto: number;
  registradoPor?: string;
};

export default function Multas() {
  // =====================
  // ESTADOS
  // =====================
  const [vista, setVista] = useState<'pendientes' | 'historial'>(
    'pendientes'
  );
  const [nui, setNui] = useState('');
  const [pendientes, setPendientes] = useState<MultaPendiente[]>([]);
  const [pagadas, setPagadas] = useState<MultaPagada[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // =====================
  // CARGAR DATOS
  // =====================
  async function cargar() {
    setLoading(true);
    try {
      const [resPendientes, resPagadas] = await Promise.all([
        api.get('/multas'),
        api.get('/multas/historial'),
      ]);

      setPendientes(resPendientes.data);
      setPagadas(resPagadas.data);
    } catch (error) {
      toast({
        title: 'Error al cargar multas',
        status: 'error',
      });
    }
    setLoading(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  // =====================
  // FILTRO
  // =====================
  const pendientesFiltradas = pendientes.filter(m =>
    m.nui.startsWith(nui)
  );

  const pagadasFiltradas = pagadas.filter(m =>
    m.nui.startsWith(nui)
  );

  // =====================
  // TOTALES
  // =====================
  const totalPendiente = pendientesFiltradas.reduce(
    (acc, m) => acc + Number(m.multa),
    0
  );

  const totalPagado = pagadasFiltradas.reduce(
    (acc, m) => acc + Number(m.monto),
    0
  );

  // =====================
  // RENDER
  // =====================
  return (
    <Box p={8}>
      <Heading mb={6}>Gestión de Multas</Heading>

      {/* BOTONES */}
      <Stack direction="row" spacing={4} mb={6}>
        <Button
          colorScheme={vista === 'pendientes' ? 'blue' : 'gray'}
          onClick={() => setVista('pendientes')}
        >
          Multas Pendientes
        </Button>
        <Button
          colorScheme={vista === 'historial' ? 'green' : 'gray'}
          onClick={() => setVista('historial')}
        >
          Historial
        </Button>
      </Stack>

      {/* FILTRO */}
      <Input
        placeholder="Buscar por cédula"
        maxW="300px"
        mb={6}
        value={nui}
        onChange={e => setNui(e.target.value)}
      />

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* =====================
              MULTAS PENDIENTES
          ===================== */}
          {vista === 'pendientes' && (
            <>
              <Box bg="red.50" p={4} mb={4} borderRadius="md">
                <Text fontWeight="bold">Total pendiente</Text>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="red.600"
                >
                  $ {totalPendiente.toFixed(2)}
                </Text>
              </Box>

              <Table size="sm">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>Monto</Th>
                    <Th>Cédula</Th>
                    <Th>Socio</Th>
                    <Th>Fecha</Th>
                    <Th>Estado</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pendientesFiltradas.map(m => (
                    <Tr key={m.id}>
                      <Td>$ {m.multa.toFixed(2)}</Td>
                      <Td>{m.nui}</Td>
                      <Td>{m.socio}</Td>
                      <Td>
                        {new Date(m.fecha).toLocaleDateString()}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            m.estado === 'FALTA'
                              ? 'red'
                              : 'orange'
                          }
                        >
                          {m.estado}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}

          {/* =====================
              HISTORIAL
          ===================== */}
          {vista === 'historial' && (
            <>
              <Box bg="green.50" p={4} mb={4} borderRadius="md">
                <Text fontWeight="bold">Total pagado</Text>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color="green.600"
                >
                  $ {totalPagado.toFixed(2)}
                </Text>
              </Box>

              <Table size="sm">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>Monto</Th>
                    <Th>Cédula</Th>
                    <Th>Socio</Th>
                    <Th>Fecha</Th>
                    <Th>Registrado por</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pagadasFiltradas.map(m => (
                    <Tr key={m.id}>
                      <Td>$ {m.monto.toFixed(2)}</Td>
                      <Td>{m.nui}</Td>
                      <Td>{m.socio}</Td>
                      <Td>
                        {new Date(
                          m.fechaPago
                        ).toLocaleDateString()}
                      </Td>
                      <Td>{m.registradoPor || '-'}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}
        </>
      )}
    </Box>
  );
}
