import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Flex,
} from '@chakra-ui/react';
import axios from 'axios';

interface MultaPendiente {
  id: number;
  fecha: string;  // fecha multa
  multa: number;
  estado: string;
  socioId?: string; // si tienes este dato en backend, úsalo
}

interface PagoMulta {
  id: number;
  fecha: string; // fecha pago
  monto: number;
  registradoPor?: string;
}

const MultasPage = () => {
  const [multasPendientes, setMultasPendientes] = useState<MultaPendiente[]>([]);
  const [multasPagadas, setMultasPagadas] = useState<PagoMulta[]>([]);
  const [loading, setLoading] = useState(false);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const toast = useToast();

  const cargarMultasPendientes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/multas/pendientes');
      setMultasPendientes(res.data);
    } catch (error) {
      toast({ title: 'Error al cargar multas pendientes', status: 'error' });
    }
    setLoading(false);
  };

  const cargarHistorialPagos = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/multas/historial');
      setMultasPagadas(res.data);
    } catch (error) {
      toast({ title: 'Error al cargar historial de pagos', status: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    // Por defecto carga multas pendientes
    cargarMultasPendientes();
  }, []);

  const pagarMulta = async (multa: MultaPendiente) => {
    setLoading(true);
    try {
      // Ajusta socioId y registradoPor según contexto real de tu app
      await axios.post('/multas/pagar', {
        attendanceId: multa.id,
        socioId: multa.socioId || '0107375594', // Ejemplo o valor real
        monto: multa.multa,
        registradoPor: 'usuarioActual', // Cambia a usuario logueado
      });
      toast({ title: 'Multa pagada con éxito', status: 'success' });
      // Refrescar lista pendientes para reflejar cambio sin recargar
      cargarMultasPendientes();
    } catch (error) {
      toast({ title: 'Error al pagar multa', status: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box p={6}>
      <Heading mb={4}>Gestión de Multas</Heading>

      <Flex mb={4} gap={4}>
        <Button
          colorScheme={!mostrarHistorial ? 'blue' : 'gray'}
          onClick={() => {
            setMostrarHistorial(false);
            cargarMultasPendientes();
          }}
        >
          Multas Actuales
        </Button>
        <Button
          colorScheme={mostrarHistorial ? 'blue' : 'gray'}
          onClick={() => {
            setMostrarHistorial(true);
            cargarHistorialPagos();
          }}
        >
          Historial de Multas Pagadas
        </Button>
      </Flex>

      {loading ? (
        <Spinner />
      ) : mostrarHistorial ? (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fecha de Pago</Th>
              <Th>Monto</Th>
              <Th>Registrado Por</Th>
            </Tr>
          </Thead>
          <Tbody>
            {multasPagadas.map((pago) => (
              <Tr key={pago.id}>
                <Td>{new Date(pago.fecha).toLocaleDateString()}</Td>
                <Td>${pago.monto.toFixed(2)}</Td>
                <Td>{pago.registradoPor || '-'}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>Fecha Multa</Th>
              <Th>Monto</Th>
              <Th>Estado</Th>
              <Th>Acción</Th>
            </Tr>
          </Thead>
          <Tbody>
            {multasPendientes.map((multa) => (
              <Tr key={multa.id}>
                <Td>{new Date(multa.fecha).toLocaleDateString()}</Td>
                <Td>${multa.multa.toFixed(2)}</Td>
                <Td>{multa.estado}</Td>
                <Td>
                  <Button
                    colorScheme="green"
                    size="sm"
                    onClick={() => pagarMulta(multa)}
                  >
                    Pagar
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default MultasPage;
