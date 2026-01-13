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
  Flex,
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
  const [vistaHistorial, setVistaHistorial] = useState(false);
  const [nui, setNui] = useState('');
  const [dataOriginal, setDataOriginal] = useState<
    (MultaPendiente | MultaPagada)[]
  >([]);
  const [dataFiltrada, setDataFiltrada] = useState<
    (MultaPendiente | MultaPagada)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // =====================
  // CARGAR DATOS
  // =====================
  async function cargar() {
    setLoading(true);
    try {
      const url = vistaHistorial ? '/multas/historial' : '/multas';
      const res = await api.get(url);

      setDataOriginal(res.data);
      setDataFiltrada(res.data);
    } catch (error) {
      toast({
        title: 'Error al cargar multas',
        status: 'error',
      });
    }
    setLoading(false);
  }

  // Cargar cuando cambia la vista
  useEffect(() => {
    cargar();
    setNui('');
  }, [vistaHistorial]);

  // =====================
  // FILTRO PROGRESIVO 🔥
  // =====================
  useEffect(() => {
    if (!nui) {
      setDataFiltrada(dataOriginal);
      return;
    }

    const filtrado = dataOriginal.filter((r: any) =>
      r.nui.startsWith(nui)
    );

    setDataFiltrada(filtrado);
  }, [nui, dataOriginal]);

  // =====================
  // TOTALES
  // =====================
  const totalPendiente = dataFiltrada.reduce(
    (acc, cur: any) => acc + (cur.multa ?? 0),
    0
  );

  const totalPagado = dataFiltrada.reduce(
    (acc, cur: any) => acc + (cur.monto ?? 0),
    0
  );

  // =====================
  // RENDER
  // =====================
  return (
    <Box p={8}>
      <Heading mb={6}>
        {vistaHistorial
          ? 'Historial de Multas Pagadas'
          : 'Multas Pendientes'}
      </Heading>

      {/* BOTONES */}
      <Stack direction="row" spacing={4} mb={4}>
        <Button
          colorScheme={!vistaHistorial ? 'blue' : 'gray'}
          onClick={() => setVistaHistorial(false)}
        >
          Multas
        </Button>
        <Button
          colorScheme={vistaHistorial ? 'blue' : 'gray'}
          onClick={() => setVistaHistorial(true)}
        >
          Historial
        </Button>
      </Stack>

      {/* FILTRO */}
      <Input
        placeholder="Buscar por cédula"
        maxW="300px"
        mb={4}
        value={nui}
        onChange={e => setNui(e.target.value)}
      />

      {/* TABLA */}
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Table size="sm">
            <Thead bg="gray.100">
              <Tr>
                <Th>Cédula</Th>
                <Th>Socio</Th>
                <Th>Fecha</Th>
                <Th>
                  {vistaHistorial ? 'Registrado Por' : 'Estado'}
                </Th>
                <Th isNumeric>Monto</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dataFiltrada.map((r: any) => (
                <Tr key={r.id}>
                  <Td>{r.nui}</Td>
                  <Td>{r.socio}</Td>
                  <Td>
                    {new Date(
                      vistaHistorial ? r.fechaPago : r.fecha
                    ).toLocaleDateString()}
                  </Td>
                  <Td>
                    {vistaHistorial ? (
                      r.registradoPor || '-'
                    ) : (
                      <Badge colorScheme="red">
                        {r.estado}
                      </Badge>
                    )}
                  </Td>
                  <Td isNumeric>
                    ${(r.monto ?? r.multa).toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {/* TOTAL */}
          <Flex justify="flex-end" mt={4} fontWeight="bold">
            <Text>
              Total{' '}
              {vistaHistorial
                ? `pagado: $${totalPagado.toFixed(2)}`
                : `pendiente: $${totalPendiente.toFixed(2)}`}
            </Text>
          </Flex>
        </>
      )}
    </Box>
  );
}
