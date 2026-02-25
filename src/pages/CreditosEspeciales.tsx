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

interface Reunion {
  id: number;
  fecha: string;
}

export default function CreditosEspecialesList() {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/meetings").then(res => setReuniones(res.data));
  }, []);

  const fecha = (f: string) =>
    new Date(f).toLocaleDateString("es-EC");

  return (
    <Box p={8}>
      <Heading mb={6}>Créditos Especiales</Heading>

      <Table variant="simple">
        <Thead bg="gray.100">
          <Tr>
            <Th>Fecha</Th>
            <Th textAlign="right">Acción</Th>
          </Tr>
        </Thead>

        <Tbody>
          {reuniones.length === 0 && (
            <Tr>
              <Td colSpan={2}>
                <Text textAlign="center" color="gray.500">
                  No hay reuniones
                </Text>
              </Td>
            </Tr>
          )}

          {reuniones.map(r => (
            <Tr key={r.id}>
              <Td>{fecha(r.fecha)}</Td>
              <Td textAlign="right">
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() =>
                    navigate(`/creditos-especiales/${r.id}`)
                  }
                >
                  Abrir hoja
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
