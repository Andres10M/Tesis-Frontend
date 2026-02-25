import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function CuotasList() {
  const [reuniones, setReuniones] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/meetings").then((res) => {
      setReuniones(res.data);
    });
  }, []);

  const formatearFecha = (f: string) =>
    new Date(f).toLocaleDateString("es-ES");

  return (
    <Box p={8}>
      <Heading mb={6}>Cuotas por Reunión</Heading>

      <Table variant="simple">
        <Thead bg="gray.100">
          <Tr>
            <Th>FECHA</Th>
            <Th textAlign="right">ACCIÓN</Th>
          </Tr>
        </Thead>

        <Tbody>
          {reuniones.map((r) => (
            <Tr key={r.id}>
              <Td>{formatearFecha(r.fecha)}</Td>
              <Td textAlign="right">
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => navigate(`/cuotas/${r.id}`)}
                >
                  Registrar cuotas
                </Button>
              </Td>
            </Tr>
          ))}

          {reuniones.length === 0 && (
            <Tr>
              <Td colSpan={2}>
                <Text textAlign="center" color="gray.500">
                  No hay reuniones creadas
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>

      <Box mt={6}>
        <Button
          colorScheme="purple"
          onClick={() => navigate("/cuotas/ingreso")}
        >
          Cuota de Ingreso
        </Button>
      </Box>
    </Box>
  );
}
